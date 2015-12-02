'use strict';
let expect  = require('chai').expect;
let wrap    = require('./index').wrap;
let Promise = require('bluebird');

class FakeDataStore {
  constructor() {
    // In memory store, imagine a DB instead
    this.store = new Map();
  }

  static exampleSync() {
    return 'foo';
  }

  static examplePromiseAsync() {
    return 'foo';
  }

  static *exampleAsync() {
    return yield Promise.resolve('foo');
  }

  static *example() {
    return yield Promise.resolve('foo');
  }

  keys() {
    let keys = [];
    for (let key of this.store.keys()) {
      keys.push(key);
    }
    return keys;
  }

  get size() {
    return this.store.size;
  }

  getAsync(key) {
    let val = this.store.get(key);
    return Promise.resolve(val);
  }

  *setAsync(key, value) {
    this.store.set(key, value);
    return yield Promise.resolve(key);
  }
}

wrap(FakeDataStore);

describe('async-class', function() {
  let dataStore;

  beforeEach(function() {
    dataStore = new FakeDataStore();
  });

  describe('wrap', function() {
    it('does not modify getters', function() {
      expect(dataStore.size).to.eql(0);
    });

    it('only modifies properties that are functions', function() {
      expect(dataStore.store).to.be.instanceOf(Map);
    });

    it('does not wrap functions that do not end with Async', function() {
      dataStore.store.set('foo', 'bar');
      let keys = dataStore.keys();
      expect(keys).to.eql(['foo']);
    });

    it('wraps all GeneratorFunctions', function*() {
      let res = yield FakeDataStore.example();
      expect(res).to.eql('foo');
    });

    it('wraps instance methods that end with Async', function*() {
      dataStore.store.set('foo', 'bar');
      let res = yield dataStore.getAsync('foo');
      expect(res).to.eql('bar');
    });

    it('wraps instance methods that use generator functions', function*() {
      let key = yield dataStore.setAsync('foo', 'bar');
      let res = dataStore.store.get('foo');
      expect(key).to.eql('foo');
      expect(res).to.eql('bar');
    });

    it('does not wrap static methods that do not end with Async', function() {
      let res = FakeDataStore.exampleSync();
      expect(res).to.eql('foo');
    });

    it('wraps static methods that end with Async', function*() {
      let res = yield FakeDataStore.examplePromiseAsync();
      expect(res).to.eql('foo');
    });

    it('wraps static methods that use generator functions', function*() {
      let res = yield FakeDataStore.exampleAsync();
      expect(res).to.eql('foo');
    });
  });
});
