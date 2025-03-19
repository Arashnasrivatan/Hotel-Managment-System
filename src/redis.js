const { Redis } = require("ioredis");
const configs = require("./configs");

const redis = new Redis(configs.redis.uri);

module.exports = redis;
