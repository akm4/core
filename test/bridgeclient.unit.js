'use strict';

var BridgeClient = require('../lib/bridgeclient');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;
var KeyPair = require('../lib/keypair');
var utils = require('../lib/utils');
var EventEmitter = require('events').EventEmitter;
var stream = require('readable-stream');
var FileMuxer = require('../lib/filemuxer');
var crypto = require('crypto');
var utils = require('../lib/utils');

describe('BridgeClient', function() {

  describe('@constructor', function() {

    it('should create an instance with the given options', function() {
      var keypair = new KeyPair();
      var client = new BridgeClient(null, { keypair: keypair });
      expect(client._options.keypair).to.equal(keypair);
    });

    it('should create an instance with the given url', function() {
      var client = new BridgeClient('https://staging.api.storj.io');
      expect(client._options.baseURI).to.equal('https://staging.api.storj.io');
    });

    it('should create an instance without the new keyword', function() {
      var client = BridgeClient();
      expect(client).to.be.instanceOf(BridgeClient);
    });

    it('should use the environment variable to set default url', function() {
      process.env.STORJ_BRIDGE = 'https://staging.api.storj.io';
      var client = BridgeClient();
      expect(client._options.baseURI).to.equal('https://staging.api.storj.io');
      process.env.STORJ_BRIDGE = '';
    });

  });

  describe('BridgeClient/Public', function() {

    describe('#getInfo', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getInfo(function() {
          _request.restore();
          expect(_request.calledWith('GET', '/', {})).to.equal(true);
          done();
        });
      });

    });

    describe('#getContactList', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          []
        );
        var client = new BridgeClient();
        client.getContactList({}, function() {
          _request.restore();
          expect(_request.calledWith('GET', '/contacts', {})).to.equal(true);
          done();
        });

      });

    });

    describe('#getContactByNodeId', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getContactByNodeId('nodeid', function() {
          _request.restore();
          expect(_request.calledWith(
            'GET',
            '/contacts/nodeid',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#createUser', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        var data = { email: 'gordon@storj.io', password: 'password' };
        client.createUser(data, function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'POST',
            '/users',
            { email: data.email, password: utils.sha256(data.password) }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#resetPassword', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        var data = { email: 'gordon@storj.io', password: 'password' };
        client.resetPassword(data, function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'PATCH',
            '/users/gordon@storj.io',
            { redirect: undefined, password: utils.sha256('password') }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#destroyUser', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        var data = { email: 'gordon@storj.io' };
        client.destroyUser(data, function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'DELETE',
            '/users/gordon@storj.io',
            { redirect: undefined }
          )).to.equal(true);
          done();
        });
      });

    });

  });

  describe('BridgeClient/Keys', function() {

    describe('#getPublicKeys', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getPublicKeys(function() {
          _request.restore();
          expect(_request.calledWith('GET', '/keys', {})).to.equal(true);
          done();
        });
      });

    });

    describe('#addPublicKey', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.addPublicKey('mypublickey', function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'POST',
            '/keys',
            { key: 'mypublickey' }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#destroyPublicKey', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.destroyPublicKey('mypublickey', function() {
          _request.restore();
          expect(_request.calledWith(
            'DELETE',
            '/keys/mypublickey',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

  });

  describe('BridgeClient/Buckets', function() {

    describe('#getBuckets', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getBuckets(function() {
          _request.restore();
          expect(_request.calledWith(
            'GET',
            '/buckets',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#getBucketById', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getBucketById('mybucket', function() {
          _request.restore();
          expect(_request.calledWith(
            'GET',
            '/buckets/mybucket',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#createBucket', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.createBucket({ name: 'My Bucket' }, function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'POST',
            '/buckets',
            { name: 'My Bucket' }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#destroyBucketById', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.destroyBucketById('mybucket', function() {
          _request.restore();
          expect(_request.calledWith(
            'DELETE',
            '/buckets/mybucket',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#updateBucketById', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.updateBucketById('mybucket', { name: 'Updated' }, function() {
          _request.restore();
          expect(_request.calledWith(
            'PATCH',
            '/buckets/mybucket',
            { name: 'Updated' }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#listFilesInBucket', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.listFilesInBucket('mybucket', function() {
          _request.restore();
          expect(_request.calledWith(
            'GET',
            '/buckets/mybucket/files',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#createToken', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.createToken('mybucket', 'PUSH', function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'POST',
            '/buckets/mybucket/tokens',
            { operation: 'PUSH' }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#removeFileFromBucket', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.removeFileFromBucket('mybucket', 'myfile', function() {
          _request.restore();
          expect(_request.calledWith(
            'DELETE',
            '/buckets/mybucket/files/myfile',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#storeFileInBucket', function() {

      it('should create frame, stage the shards, and upload', function(done) {
        var _demuxer = new EventEmitter();
        var _shard1 = new stream.Readable({ read: function noop() {} });
        var _shard2 = new stream.Readable({ read: function noop() {} });
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          fs: {
            statSync: sinon.stub().returns({ size: 64 }),
            unlinkSync: sinon.stub(),
            createWriteStream: function() {
              return new stream.Writable({
                write: function(data, enc, done) { done(); }
              });
            },
            createReadStream: function() {
              var called = false;
              function data() {
                if (called) {
                  return null;
                }

                called = true;
                return crypto.randomBytes(32);
              }
              return new stream.Readable({
                read: function() {
                  this.push(data());
                }
              });
            }
          },
          './datachannel/client': function() {
            var emitter = new EventEmitter();
            emitter.createWriteStream = function() {
              return new stream.Writable({
                write: function(c, e, cb) {
                  cb();
                }
              });
            };
            setTimeout(function() {
              emitter.emit('open');
            }, 20);
            return emitter;
          },
          './filedemuxer': function() {
            _demuxer.DEFAULTS = { shardSize: 32 };
            return _demuxer;
          },
          request: sinon.stub()
        });
        var _createFrame = sinon.stub(
          StubbedClient.prototype,
          'createFileStagingFrame',
          function(callback) {
            callback(null, { id: 'myframe' });
            setImmediate(function() {
              _demuxer.emit('shard', _shard1, 0);
              setImmediate(function() {
                _demuxer.emit('shard', _shard2, 1);
                _shard1.emit('data', crypto.randomBytes(32));
                setImmediate(function() {
                  _shard1.emit('end');
                  _shard2.emit('data', crypto.randomBytes(32));
                  setImmediate(function() {
                    _shard2.emit('end');
                  });
                });
              });
            });
          }
        );
        var _addShard = sinon.stub(
          StubbedClient.prototype,
          'addShardToFileStagingFrame'
        ).callsArgWith(2, null, {
          farmer: {
            address: '127.0.0.1',
            port: 8080,
            nodeID: utils.rmd160('nodeid')
          }
        });
        var _request = sinon.stub(
          StubbedClient.prototype,
          '_request'
        ).callsArg(3);
        var client = new StubbedClient();
        client.storeFileInBucket('bucket', 'token', 'file', function() {
          _createFrame.restore();
          _addShard.restore();
          _request.restore();
          done();
        });
      });

      it('should return error if create frame fails', function(done) {
        var _demuxer = new EventEmitter();
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          fs: {
            statSync: sinon.stub().returns({ size: 64 }),
            unlinkSync: sinon.stub()
          },
          './filedemuxer': function() {
            _demuxer.DEFAULTS = { shardSize: 32 };
            return _demuxer;
          },
          request: sinon.stub()
        });
        var _request = sinon.stub(
          StubbedClient.prototype,
          '_request'
        );
        var _createFrame = sinon.stub(
          StubbedClient.prototype,
          'createFileStagingFrame'
        ).callsArgWith(0, new Error('Failed'));
        var client = new StubbedClient();
        client.storeFileInBucket('bucket', 'token', 'file', function(err) {
          _createFrame.restore();
          _request.restore();
          expect(err.message).to.equal('Failed');
          done();
        });
      });

      it('should return error if add shard fails', function(done) {
        var _demuxer = new EventEmitter();
        var _shard1 = new stream.Readable({ read: function noop() {} });
        var _shard2 = new stream.Readable({ read: function noop() {} });
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          fs: {
            statSync: sinon.stub().returns({ size: 64 }),
            unlinkSync: sinon.stub(),
            createWriteStream: function() {
              return new stream.Writable({
                write: function(data, enc, done) { done(); }
              });
            },
            createReadStream: function() {
              var called = false;
              function data() {
                if (called) {
                  return null;
                }

                called = true;
                return crypto.randomBytes(32);
              }
              return new stream.Readable({
                read: function() {
                  this.push(data());
                }
              });
            }
          },
          './datachannel/client': function() {
            var emitter = new EventEmitter();
            emitter.createWriteStream = function() {
              return new stream.Writable({
                write: function(c, e, cb) {
                  cb();
                }
              });
            };
            setTimeout(function() {
              emitter.emit('open');
            }, 20);
            return emitter;
          },
          './filedemuxer': function() {
            _demuxer.DEFAULTS = { shardSize: 32 };
            return _demuxer;
          },
          request: sinon.stub()
        });
        var _createFrame = sinon.stub(
          StubbedClient.prototype,
          'createFileStagingFrame',
          function(callback) {
            callback(null, { id: 'myframe' });
            setImmediate(function() {
              _demuxer.emit('shard', _shard1, 0);
              setImmediate(function() {
                _demuxer.emit('shard', _shard2, 1);
                _shard1.emit('data', crypto.randomBytes(32));
                setImmediate(function() {
                  _shard1.emit('end');
                  _shard2.emit('data', crypto.randomBytes(32));
                  setImmediate(function() {
                    _shard2.emit('end');
                  });
                });
              });
            });
          }
        );
        var _addShard = sinon.stub(
          StubbedClient.prototype,
          'addShardToFileStagingFrame'
        ).callsArgWith(2, new Error('Failed'));
        var _request = sinon.stub(
          StubbedClient.prototype,
          '_request'
        );
        var client = new StubbedClient();
        client.storeFileInBucket('bucket', 'token', 'file', function(err) {
          _createFrame.restore();
          _addShard.restore();
          _request.restore();
          expect(err.message).to.equal('Failed');
          done();
        });
      });

    });

    describe('#replicateFileFromBucket', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.replicateFileFromBucket('bucket', 'file', function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'POST',
            '/buckets/bucket/mirrors',
            { file: 'file', redundancy: undefined }
          )).to.equal(true);
          done();
        });
      });

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.replicateFileFromBucket('bucket', 'file', 8, function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'POST',
            '/buckets/bucket/mirrors',
            { file: 'file', redundancy: 8 }
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#getFilePointers', function() {

      it('should bubble request error', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, new Error('Failed'))
        });
        var client = new StubbedClient();
        client.getFilePointers({
          bucket: '1',
          token: 'token',
          file: 'file'
        }, function(err) {
          expect(err.message).to.equal('Failed');
          done();
        });
      });

      it('should pass error if bad request', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, null, {
            statusCode: 400
          }, { error: 'Bad request' })
        });
        var client = new StubbedClient();
        client.getFilePointers({
          bucket: '1',
          token: 'token',
          file: 'file'
        }, function(err) {
          expect(err.message).to.equal('Bad request');
          done();
        });
      });

      it('should pass body if bad request and no error', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, null, {
            statusCode: 400
          }, 'Bad request')
        });
        var client = new StubbedClient();
        client.getFilePointers({
          bucket: '1',
          token: 'token',
          file: 'file'
        }, function(err) {
          expect(err.message).to.equal('Bad request');
          done();
        });
      });

      it('should pass the result', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, null, {
            statusCode: 200
          }, { hello: 'world' })
        });
        var client = new StubbedClient();
        client.getFilePointers({
          bucket: '1',
          token: 'token',
          file: 'file'
        }, function(err, result) {
          expect(result.hello).to.equal('world');
          done();
        });
      });

      it('should pass the given exclude parameter', function(done) {
        var exclude = [1, 2, 3];
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: function(opts, callback) {
            expect(opts.qs.exclude).to.equal(exclude.join(','));
            callback(null, { statusCode: 200 }, {});
          }
        });
        var client = new StubbedClient();
        client.getFilePointers({
          bucket: '1',
          token: 'token',
          file: 'file',
          exclude: exclude
        }, done);
      });

    });

    describe('#_createInputFromPointer', function() {

      it('should callback with the error', function(done) {
        var emitter = new EventEmitter();
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          './datachannel/client': sinon.stub().returns(emitter)
        });
        var client = new StubbedClient();
        client._createInputFromPointer({
          farmer: {
            address: '127.0.0.1',
            port: 1337,
            nodeID: utils.rmd160('')
          }
        }, function(err) {
          expect(err.message).to.equal('Failed');
          done();
        });
        setImmediate(function() {
          emitter.emit('error', new Error('Failed'));
        });
      });

    });

  });

  describe('BridgeClient/Frames', function() {

    describe('#createFileStagingFrame', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.createFileStagingFrame(function() {
          _request.restore();
          expect(_request.calledWith(
            'POST',
            '/frames',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#getFileStagingFrames', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getFileStagingFrames(function() {
          _request.restore();
          expect(_request.calledWith(
            'GET',
            '/frames',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#getFileStagingFrameById', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.getFileStagingFrameById('myframe', function() {
          _request.restore();
          expect(_request.calledWith(
            'GET',
            '/frames/myframe',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#destroyFileStagingFrameById', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.destroyFileStagingFrameById('myframe', function() {
          _request.restore();
          expect(_request.calledWith(
            'DELETE',
            '/frames/myframe',
            {}
          )).to.equal(true);
          done();
        });
      });

    });

    describe('#addShardToFileStagingFrame', function() {

      it('should send the correct args to _request', function(done) {
        var _request = sinon.stub(BridgeClient.prototype, '_request').callsArg(
          3,
          null,
          {}
        );
        var client = new BridgeClient();
        client.addShardToFileStagingFrame('myframe', {
          meta: 'data'
        }, function() {
          _request.restore();
          expect(_request.calledWithMatch(
            'PUT',
            '/frames/myframe',
            { meta: 'data' }
          )).to.equal(true);
          done();
        });
      });

      it('should retry if the request fails', function(done) {
        var _request = sinon.stub(
          BridgeClient.prototype,
          '_request'
        ).callsArgWith(
          3,
          new Error('Request failed')
        );
        var client = new BridgeClient();
        client.addShardToFileStagingFrame('myframe', {
          meta: 'data'
        }, function() {
          _request.restore();
          expect(_request.callCount).to.equal(7);
          done();
        });
      });

      it('should retry the defined number of retries', function(done) {
        var _request = sinon.stub(
          BridgeClient.prototype,
          '_request'
        ).callsArgWith(
          3,
          new Error('Request failed')
        );
        var client = new BridgeClient();
        client.addShardToFileStagingFrame('myframe', {
          meta: 'data'
        }, { retry: 6 }, function() {
          _request.restore();
          expect(_request.callCount).to.equal(7);
          done();
        });
      });

    });

  });

  describe('BridgeClient/Helpers', function() {

    describe('#resolveFileFromPointers', function() {

      it('should return a readable stream as a file muxer', function(done) {
        var emitters = [new EventEmitter(), new EventEmitter()];
        var count = 0;
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          './datachannel/client': function() {
            emitters[count++].createReadStream = function() {
              return new stream.Readable({ read: function() {} });
            };
            return emitters[count - 1];
          }
        });
        var client = new StubbedClient();
        client.resolveFileFromPointers([
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          },
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ], function(err, stream) {
          expect(stream).to.be.instanceOf(FileMuxer);
          done();
        });
        setImmediate(function() {
          emitters[0].emit('open');
          setImmediate(function() {
            emitters[1].emit('open');
          });
        });
      });

      it('should emit an error event if the pointer fails', function(done) {
        var emitters = [new EventEmitter(), new EventEmitter()];
        var count = 0;
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          './datachannel/client': function() {
            emitters[count++].createReadStream = function() {
              return new stream.Readable({ read: function() {} });
            };
            return emitters[count - 1];
          }
        });
        var client = new StubbedClient();
        client.resolveFileFromPointers([
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ], function(err, stream, queue) {
          stream.on('error', function(err) {
            expect(err.message).to.equal('Failed');
            done();
          });
          queue.push({
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          });
          setImmediate(function() {
            emitters[1].emit('error', new Error('Failed'));
          });
        });
        setImmediate(function() {
          emitters[0].emit('open');
        });
      });

      it('should add the pointers to the queue afterwards', function(done) {
        var emitters = [new EventEmitter(), new EventEmitter()];
        var count = 0;
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          './datachannel/client': function() {
            emitters[count++].createReadStream = function() {
              return new stream.Readable({ read: function() {} });
            };
            return emitters[count - 1];
          }
        });
        var client = new StubbedClient();
        client.resolveFileFromPointers([
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ], function(err, stream, queue) {
          queue.push({
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          });
          setImmediate(function() {
            emitters[1].emit('open');
            setImmediate(function() {
              expect(stream._inputs).to.have.lengthOf(2);
              done();
            });
          });
        });
        setImmediate(function() {
          emitters[0].emit('open');
        });
      });

    });

    describe('#createFileStream', function() {

      it('should return a file stream', function(done) {
        var client = new BridgeClient();
        var _getFilePointers = sinon.stub(
          client,
          'getFilePointers'
        );
        _getFilePointers.onFirstCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          },
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onSecondCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onThirdCall().callsArgWith(1, null, []);
        sinon.stub(
          client,
          'createToken'
        ).callsArgWith(2, null, 'token');
        sinon.stub(
          client,
          'resolveFileFromPointers'
        ).callsArgWith(1, null, new stream.Readable({
          read: utils.noop
        }), { push: sinon.stub().callsArg(1) });
        client.createFileStream('bucket', 'file', {}, function(err, stream) {
          expect(typeof stream.read).to.equal('function');
          done();
        });
      });

      it('should error if failed to get token', function(done) {
        var client = new BridgeClient();
        var _createToken = sinon.stub(
          client,
          'createToken'
        ).callsArgWith(2, new Error('no tokenz 4 u'));
        client.createFileStream('bucket', 'file', {}, function(err) {
          _createToken.restore();
          expect(err.message).to.equal('no tokenz 4 u');
          done();
        });
      });

      it('should error if failed to get pointers', function(done) {
        var client = new BridgeClient();
        var _getFilePointers = sinon.stub(
          client,
          'getFilePointers'
        ).callsArgWith(1, new Error('no pointerz 4 u'));
        var _createToken = sinon.stub(
          client,
          'createToken'
        ).callsArgWith(2, null, 'token');
        client.createFileStream('bucket', 'file', {}, function(err) {
          _createToken.restore();
          _getFilePointers.restore();
          expect(err.message).to.equal('no pointerz 4 u');
          done();
        });
      });

      it('should error if it fails to resolve pointers', function(done) {
        var client = new BridgeClient();
        var _getFilePointers = sinon.stub(
          client,
          'getFilePointers'
        );
        _getFilePointers.onFirstCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          },
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onSecondCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onThirdCall().callsArgWith(1, null, []);
        var _createToken = sinon.stub(
          client,
          'createToken'
        ).callsArgWith(2, null, 'token');
        var _resolveFileFromPointers = sinon.stub(
          client,
          'resolveFileFromPointers'
        ).callsArgWith(1, new Error('no bytez 4 u lol'));
        client.createFileStream('bucket', 'file', {}, function(err) {
          _createToken.restore();
          _getFilePointers.restore();
          _resolveFileFromPointers.restore();
          expect(err.message).to.equal('no bytez 4 u lol');
          done();
        });
      });

      it('should emit stream error if slice cannot get token', function(done) {
        var client = new BridgeClient();
        var _getFilePointers = sinon.stub(
          client,
          'getFilePointers'
        );
        _getFilePointers.onFirstCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          },
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onSecondCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onThirdCall().callsArgWith(1, null, []);
        var _createToken = sinon.stub(
          client,
          'createToken'
        );
        _createToken.onFirstCall().callsArgWith(2, null, 'token');
        _createToken.onSecondCall().callsArgWith(2, null, 'token');
        _createToken.onThirdCall().callsArgWith(
          2,
          new Error('Failed to get token')
        );
        sinon.stub(
          client,
          'resolveFileFromPointers'
        ).callsArgWith(1, null, new stream.Readable({
          read: utils.noop
        }), { push: sinon.stub().callsArg(1) });
        client.createFileStream('bucket', 'file', {}, function(err, stream) {
          stream.on('error', function(err) {
            expect(err.message).to.equal('Failed to get token');
            done();
          });
        });
      });

      it('should emit stream error if slice cannot resolve', function(done) {
        var client = new BridgeClient();
        var _getFilePointers = sinon.stub(
          client,
          'getFilePointers'
        );
        _getFilePointers.onFirstCall().callsArgWith(1, null, [
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          },
          {
            size: 512,
            farmer: {
              address: '127.0.0.1',
              port: 8080,
              nodeID: utils.rmd160('nodeid')
            }
          }
        ]);
        _getFilePointers.onSecondCall().callsArgWith(1, new Error('Failed'));
        sinon.stub(
          client,
          'createToken'
        ).callsArgWith(2, null, 'token');
        var _resolveFile = sinon.stub(
          client,
          'resolveFileFromPointers'
        );
        _resolveFile.onFirstCall().callsArgWith(1, null, new stream.Readable({
          read: utils.noop
        }), { push: sinon.stub().callsArg(1) });
        client.createFileStream('bucket', 'file', function(err, stream) {
          stream.on('error', function(err) {
            expect(err.message).to.equal('Failed');
            done();
          });
        });
      });

    });

  });

  describe('BridgeClient/Internal', function() {

    describe('#_transferShard', function() {

      it('should emit a retry on client error', function(done) {
        var clientEmitter = new EventEmitter();
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          fs: {
            createReadStream: sinon.stub().returns({}),
            './datachannel/client': sinon.stub().returns(clientEmitter)
          }
        });
        var client = new StubbedClient();
        var emitter = new EventEmitter();
        var pointer = {
          farmer: {
            address: '127.0.0.1',
            port: 1337,
            nodeID: utils.rmd160('nodeid')
          }
        };
        var callback = sinon.stub();
        client._transferShard(emitter, 'name', pointer, callback);
        emitter.once('retry', function(name, pointer2, callback2) {
          expect(name).to.equal('name');
          expect(pointer).to.equal(pointer2);
          expect(callback2).to.equal(callback);
          done();
        });
        setImmediate(function() {
          clientEmitter.emit('error', new Error('FAIL'));
        });
      });

    });

    describe('#_startTransfer', function() {

      it('should retry transfer if count less than 3', function(done) {
        var _transferStatus = new EventEmitter();
        var client = new BridgeClient();
        var pointer = {
          farmer: {
            address: '127.0.0.1',
            port: 1337,
            nodeID: utils.rmd160('nodeid')
          }
        };
        var _transferShard = sinon.stub(client, '_transferShard', function() {
          return _transferStatus;
        });
        var _transferComplete = sinon.stub(
          client,
          '_shardTransferComplete'
        ).callsArg(2);
        client._startTransfer(pointer, {}, {
          frame: 'frame',
          tmpName: 'tmpname',
          size: 0,
          index: 0,
          hasher: crypto.createHash('sha256'),
          excludeFarmers: [],
          transferRetries: 0
        }, function() {
          _transferShard.restore();
          _transferComplete.restore();
          expect(_transferShard.callCount).to.equal(2);
          done();
        });
        setImmediate(function() {
          _transferStatus.emit('retry');
          setImmediate(function() {
            _transferStatus.emit('finish');
          });
        });
      });

      it('should get a new contract if transfer fails 3 times', function(done) {
        var _transferStatus = new EventEmitter();
        var _kill = sinon.stub();
        var client = new BridgeClient();
        var pointer = {
          farmer: {
            address: '127.0.0.1',
            port: 1337,
            nodeID: utils.rmd160('nodeid')
          }
        };
        var _transferShard = sinon.stub(client, '_transferShard', function() {
          return _transferStatus;
        });
        var _transferComplete = sinon.stub(
          client,
          '_shardTransferComplete'
        ).callsArg(2);
        var _retry = sinon.stub(client, '_handleShardTmpFileFinish');
        client._startTransfer(pointer, {
          queue: { kill: _kill },
          callback: sinon.stub()
        }, { excludeFarmers: [], transferRetries: 3 });
        setImmediate(function() {
          _transferStatus.emit('retry');
          setImmediate(function() {
            _transferShard.restore();
            _transferComplete.restore();
            expect(_retry.called).to.equal(true);
            done();
          });
        });
      });

    });

    describe('#_shardTransferComplete', function() {

      it('should not create an entry if remaining shards', function(done) {
        var fakeState = {
          complete: 0,
          numShards: 2,
          cleanup: sinon.stub()
        };
        var client = new BridgeClient();
        client._shardTransferComplete(fakeState, {}, sinon.stub());
        setImmediate(function() {
          expect(fakeState.cleanup.called).to.equal(false);
          done();
        });
      });

    });

    describe('#_request', function() {

      it('should bubble connection error', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, new Error('Failed'))
        });
        var client = new StubbedClient();
        client._request('GET', '/', {}, function(err) {
          expect(err.message).to.equal('Failed');
          done();
        });
      });

      it('should pass error if non-200 status', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, null, {
            statusCode: 400
          }, { error: 'Bad request' })
        });
        var client = new StubbedClient();
        client._request('DELETE', '/', {}, function(err) {
          expect(err.message).to.equal('Bad request');
          done();
        });
      });

      it('should pass body if non-200 status and no error', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, null, {
            statusCode: 400
          }, 'Bad request')
        });
        var client = new StubbedClient();
        client._request('DELETE', '/', {}, function(err) {
          expect(err.message).to.equal('Bad request');
          done();
        });
      });

      it('should pass the result back', function(done) {
        var StubbedClient = proxyquire('../lib/bridgeclient', {
          request: sinon.stub().callsArgWith(1, null, {
            statusCode: 200
          }, { hello: 'world' })
        });
        var client = new StubbedClient();
        client._request('POST', '/', {}, function(err, result) {
          expect(result.hello).to.equal('world');
          done();
        });
      });

    });

    describe('#_authenticate', function() {

      it('should sign the json payload with the keypair', function() {
        var client = new BridgeClient(null, {
          keypair: new KeyPair()
        });
        var options = {
          method: 'POST',
          json: { hello: 'world' },
          uri: 'https://api.storj.io/'
        };
        client._authenticate(options);
        expect(options.headers['x-pubkey']).to.not.equal(undefined);
        expect(options.headers['x-signature']).to.not.equal(undefined);
      });

      it('should sign the querystring with the keypair', function() {
        var client = new BridgeClient(null, {
          keypair: new KeyPair()
        });
        var options = {
          method: 'GET',
          qs: { hello: 'world' },
          uri: 'https://api.storj.io/'
        };
        client._authenticate(options);
        expect(options.headers['x-pubkey']).to.not.equal(undefined);
        expect(options.headers['x-signature']).to.not.equal(undefined);
      });

      it('should include email and password', function() {
        var client = new BridgeClient(null, {
          basicauth: {
            email: 'gordon@storj.io',
            password: 'password'
          }
        });
        var options = {};
        client._authenticate(options);
        expect(options.auth.pass).to.equal(
          '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
        );
      });

    });

  });

});
