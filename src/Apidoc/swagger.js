const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const swaggerFile = path.join(__dirname, "./swagger.json");
const swaggerData = fs.readFileSync(swaggerFile, "utf8");
const swaggerDocument = JSON.parse(swaggerData);

function swaggerDocs(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });
}

module.exports = swaggerDocs;
