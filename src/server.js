const app = require("./app");

const configs = require("./configs");
const { db } = require("./db");
const redis = require("./redis");

//* Start Server
async function startServer() {
  try {
    //* Connect To DB
    await db.authenticate();

    //*Redis
    await redis.ping();

    app.listen(configs.port, () => {
      console.log(`Server started on port ${configs.port}`);
    });
  } catch (err) {
    console.log(err);
    await db.close();
    await redis.disconnect();
  }
}

//* Run Project
startServer();
