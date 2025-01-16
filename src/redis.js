const { Redis } = require("ioredis");
const configs = require("./configs");

const redis = new Redis(configs.redis.uri);

const test = async (id) => {
        const keys = await redis.get(`title:${id}`);
        if(keys) console.log(keys); else console.log("not found");
}


module.exports = redis;
