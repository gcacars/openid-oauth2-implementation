/* eslint-disable no-console */
// Original:
// https://raw.githubusercontent.com/panva/node-oidc-provider/master/example/adapters/redis.js
const Redis = require('ioredis');

// const isEmpty = require('lodash/isEmpty');

// "redis://:authpassword@redis-0000.c1.us-east1-2.gce.cloud.redislabs.com:13222/4"
// eslint-disable-next-line no-console
console.log(`Conectando no Redis em: ${process.env.REDIS_URL}`);
const client = new Redis(process.env.REDIS_URL, {
  keyPrefix: 'oidc:',
});

const consumable = new Set([
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
]);

function grantKeyFor(id) {
  return `grant:${id}`;
}

function userCodeKeyFor(userCode) {
  return `userCode:${userCode}`;
}

function uidKeyFor(uid) {
  return `uid:${uid}`;
}

class RedisAdapter {
  constructor(name) {
    this.name = name;
  }

  async upsert(id, payload, expiresIn) {
    try {
      const key = this.key(id);
      const store = consumable.has(this.name)
        ? { payload: JSON.stringify(payload) } : JSON.stringify(payload);

      const multi = client.multi();
      multi[consumable.has(this.name) ? 'hmset' : 'set'](key, store);

      if (expiresIn) {
        multi.expire(key, expiresIn);
      }

      if (payload.grantId) {
        const grantKey = grantKeyFor(payload.grantId);
        multi.rpush(grantKey, key);
        // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
        // here to trim the list to an appropriate length
        const ttl = await client.ttl(grantKey);
        if (expiresIn > ttl) {
          multi.expire(grantKey, expiresIn);
        }
      }

      if (payload.userCode) {
        const userCodeKey = userCodeKeyFor(payload.userCode);
        multi.set(userCodeKey, id);
        multi.expire(userCodeKey, expiresIn);
      }

      if (payload.uid) {
        const uidKey = uidKeyFor(payload.uid);
        multi.set(uidKey, id);
        multi.expire(uidKey, expiresIn);
      }

      await multi.exec();
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  async find(id) {
    try {
      const data = consumable.has(this.name)
        ? await client.hgetall(this.key(id))
        : await client.get(this.key(id));

      if (!data) {
        return undefined;
      }

      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      const { payload, ...rest } = data;
      return {
        ...rest,
        ...JSON.parse(payload),
      };
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  async findByUid(uid) {
    try {
      const id = await client.get(uidKeyFor(uid));
      return this.find(id);
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  async findByUserCode(userCode) {
    try {
      const id = await client.get(userCodeKeyFor(userCode));
      return this.find(id);
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  async destroy(id) {
    try {
      const key = this.key(id);
      await client.del(key);
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  async revokeByGrantId(grantId) { // eslint-disable-line class-methods-use-this
    try {
      const multi = client.multi();
      const tokens = await client.lrange(grantKeyFor(grantId), 0, -1);
      tokens.forEach((token) => multi.del(token));
      multi.del(grantKeyFor(grantId));
      await multi.exec();
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  async consume(id) {
    try {
      await client.hset(this.key(id), 'consumed', Math.floor(Date.now() / 1000));
    } catch (error) {
      console.error(error, 'RedisAdapter');
    }
  }

  key(id) {
    return `${this.name}:${id}`;
  }
}

export default RedisAdapter;
export {
  RedisAdapter,
};
