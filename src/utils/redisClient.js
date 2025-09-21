const { createClient } = require("redis");

const isRedisAvailable = false;

let redisClient;

if (isRedisAvailable) {
  redisClient = createClient();
  redisClient.on("error", (err) => console.error("Redis Client Error", err))(
    async () => {
      try {
        await redisClient.connect();
        console.log("Redis connected");
      } catch (error) {
        console.error("Redis connected failed: ", error);
      }
    }
  )();
} else {
  // Redis 미설치 상태라면 에러 없이 동작하는 mock 객체
  redisClient = {
    on: () => {}, // 이벤트 무시
    connect: async () => {},
    set: async () => {},
    get: async () => null,
    del: async () => {},
    // 필요 시 추가 메서드 작성
  };
}

// const redisClient = createClient();

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// (async () => {
//   await redisClient.connect();
// })();

module.exports = redisClient;
