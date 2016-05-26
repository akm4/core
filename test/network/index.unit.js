'use strict';

var expect = require('chai').expect;
var EventEmitter = require('events').EventEmitter;
var Network = require('../../lib/network');
var Manager = require('../../lib/manager');
var KeyPair = require('../../lib/keypair');
var RAMStorageAdapter = require('../../lib/storage/adapters/ram');
var kad = require('kad');
var sinon = require('sinon');
var version = require('../../lib/version');
var utils = require('../../lib/utils');

describe('Network (public)', function() {

  describe('@constructor', function() {

    it('should create an instance without the new keyword', function() {
      expect(Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      })).to.be.instanceOf(Network);
    });

  });

  describe('#join', function() {

    it('should add ready listener if not transport not ready', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      net._ready = false;
      var _on = sinon.stub(net, 'on');
      net.join();
      setImmediate(function() {
        _on.restore();
        expect(_on.called).to.equal(true);
        done();
      });
    });

  });

  describe('#leave', function() {

    it('should call Node#disconnect', function() {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      net._node = { disconnect: sinon.stub() };
      net.leave();
      expect(net._node.disconnect.called).to.equal(true);
    });

  });

});

describe('Network (private)', function() {

  describe('#_verifyMessage', function() {

    it('should fail if incompatible version', function(done) {
      var verify = Network.prototype._verifyMessage;

      verify({}, {
        protocol: '0.0.0',
        address: '127.0.0.1',
        port: 6000
      }, function(err) {
        expect(err.message).to.equal('Protocol version is incompatible');
        done();
      });
    });

    it('should fail if nonce is expired', function(done) {
      var verify = Network.prototype._verifyMessage;

      verify({
        method: 'PING',
        id: 'test',
        params: { nonce: -99999 }
      }, {
        protocol: version.protocol,
        address: '127.0.0.1',
        port: 6000
      }, function(err) {
        expect(err.message).to.equal('Message signature expired');
        done();
      });
    });

  });

  describe('#_verifySignature', function() {

    it('should fail if no signobj supplied', function(done) {
      var verify = Network.prototype._verifySignature;

      verify({}, function(err) {
        expect(err.message).to.equal('Invalid signature supplied');
        done();
      });
    });

    it('should fail if invalid signature', function(done) {
      var verify = Network.prototype._verifySignature.bind({ _pubkeys: {} });
      var msg = {
        method: 'PING',
        id: '123456',
        params: {}
      };
      Network.prototype._signMessage.call({
        _keypair: KeyPair()
      }, msg, function() {});

      verify({
        signobj: Network.prototype._createSignatureObject(
          msg.params.signature
        ),
        message: {
          id: '12345',
          params: { signature: msg.params.signature }
        },
        nonce: 12345,
        contact: { nodeID: 'nodeid' },
        signature: msg.params.signature,
        address: KeyPair().getAddress()
      }, function(err) {
        expect(err.message).to.equal('Signature verification failed');
        done();
      });
    });

  });

  describe('#_createSignatureObject', function() {

    it('should return null for an invalid signature', function() {
      expect(Network.prototype._createSignatureObject(null)).to.equal(null);
    });

  });

  describe('#_handleTransportError', function() {

    it('should send the error to the logger', function() {
      var context = { _logger: { error: sinon.stub() } };
      Network.prototype._handleTransportError.call(context, new Error('Fail'));
      expect(context._logger.error.called).to.equal(true);
    });

  });

  describe('#_checkRateLimiter', function() {

    it('should send an error message if rate limited', function() {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      var _isLimited = sinon.stub(net._limiter, 'isLimited').returns(true);
      var _send = sinon.stub(net._transport, 'send');
      net._checkRateLimiter(kad.Message({
        method: 'PING',
        params: {}
      }), { nodeID: 'nodeid' });
      _isLimited.restore();
      _send.restore();
      expect(_send.called).to.equal(true);
    });

  });

  describe('#_listenForTunnelers', function() {

    it('should send a publish message on tunserver locked', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true,
        tunnels: 0
      });
      var emitter = new EventEmitter();
      net._transport._tunserver = emitter;
      var _pub = sinon.stub(net._pubsub, 'publish');
      var _sub = sinon.stub(net._pubsub, 'subscribe');
      net._listenForTunnelers();
      emitter.emit('locked');
      setImmediate(function() {
        _pub.restore();
        _sub.restore();
        expect(_pub.callCount).to.equal(1);
        done();
      });
    });

    it('should send a publish message on tunserver unlocked', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true,
        tunnels: 0
      });
      var emitter = new EventEmitter();
      net._transport._tunserver = emitter;
      var _pub = sinon.stub(net._pubsub, 'publish');
      var _sub = sinon.stub(net._pubsub, 'subscribe');
      net._listenForTunnelers();
      emitter.emit('unlocked');
      setImmediate(function() {
        _pub.restore();
        _sub.restore();
        expect(_pub.callCount).to.equal(1);
        done();
      });
    });

    it('should announce unavailable tunnels', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true,
        tunnels: 1
      });
      var emitter = new EventEmitter();
      var _hasTunnel = sinon.stub(
        net._transport._tunserver,
        'hasTunnelAvailable'
      ).returns(false);
      var _pub = sinon.stub(net._pubsub, 'publish');
      var _sub = sinon.stub(net._pubsub, 'subscribe');
      net._listenForTunnelers();
      emitter.emit('unlocked');
      setImmediate(function() {
        _hasTunnel.restore();
        _pub.restore();
        _sub.restore();
        expect(_pub.args[0][0]).to.equal('0e00');
        done();
      });
    });

    it('should not add contact when publish received and full', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true,
        tunnels: 0
      });
      var _getSize = sinon.stub(net._tunnelers, 'getSize').returns(20);
      var _addContact = sinon.stub(net._tunnelers, 'addContact');
      var _subscribe = sinon.stub(net._pubsub, 'subscribe', function(t, cb) {
        if (t === '0e01') {
          cb({
            address: '127.0.0.1',
            port: 1337,
            nodeID: utils.rmd160('nodeid'),
            protocol: version.protocol
          });
        }
      });
      net._listenForTunnelers();
      setImmediate(function() {
        _getSize.restore();
        _addContact.restore();
        _subscribe.restore();
        expect(_getSize.called).to.equal(true);
        expect(_addContact.called).to.equal(false);
        done();
      });
    });

    it('should remove contact when publish received', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true,
        tunnels: 0
      });
      var _removeContact = sinon.stub(net._tunnelers, 'removeContact');
      var _subscribe = sinon.stub(net._pubsub, 'subscribe', function(t, cb) {
        if (t === '0e00') {
          cb({
            address: '127.0.0.1',
            port: 1337,
            nodeID: utils.rmd160('nodeid'),
            protocol: version.protocol
          });
        }
      });
      net._listenForTunnelers();
      setImmediate(function() {
        _removeContact.restore();
        _subscribe.restore();
        expect(_removeContact.called).to.equal(true);
        done();
      });
    });

  });

  describe('#_setupTunnelClient', function() {

    it('should callback error if no seed provided', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      net._setupTunnelClient(function(err) {
        expect(err.message).to.equal(
          'Could not find a neighbor to query for probe'
        );
        done();
      });
    });

    it('should try to find a tunnel if probe fails', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [
          'storj://127.0.0.1:1337/adc83b19e793491b1c6ea0fd8b46cd9f32e592fc'
        ],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      var _send = sinon.stub(net._transport, 'send').callsArgWith(
        2,
        null,
        { error: true }
      );
      var _findTunnel = sinon.stub(net, '_findTunnel').callsArg(1);
      net._setupTunnelClient(function() {
        _send.restore();
        _findTunnel.restore();
        expect(_findTunnel.called).to.equal(true);
        done();
      });
    });

    it('should listen for tunnelers if probe succeeds', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [
          'storj://127.0.0.1:1337/adc83b19e793491b1c6ea0fd8b46cd9f32e592fc'
        ],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      var _send = sinon.stub(net._transport, 'send').callsArgWith(
        2,
        null,
        {}
      );
      var _listen = sinon.stub(net, '_listenForTunnelers');
      net._setupTunnelClient(function() {
        _listen.restore();
        _send.restore();
        expect(_listen.called).to.equal(true);
        done();
      });
    });

  });

  describe('#_requestProbe', function() {

    it('should send a probe message to the contact', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      var _send = sinon.stub(net._transport, 'send').callsArg(2);
      var contact = { address: '127.0.0.1', port: 1337 };
      net._requestProbe(contact, function() {
        _send.restore();
        expect(_send.args[0][1].method).to.equal('PROBE');
        done();
      });
    });

  });

  describe('#_findTunnel', function() {

    it('should callback error if no neighbor provided', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      net._findTunnel(null, function(err) {
        expect(err.message).to.equal(
          'Could not find a neighbor to query for tunnels'
        );
        done();
      });
    });

    it('should callback error if send fails', function(done) {
      var net = Network({
        keypair: KeyPair(),
        manager: Manager(RAMStorageAdapter()),
        logger: kad.Logger(0),
        seeds: [],
        address: '127.0.0.1',
        port: 0,
        noforward: true
      });
      var _send = sinon.stub(net._transport, 'send').callsArgWith(
        2,
        new Error('Not reachable')
      );
      var contact = { address: '127.0.0.1', port: 1337 };
      net._findTunnel(contact, function(err) {
        _send.restore();
        expect(err.message).to.equal(
          'Failed to find tunnels, reason: Not reachable'
        );
        done();
      });
    });

  });

  describe('#_establishTunnel', function() {



  });

});
