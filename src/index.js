const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

const fundingRouter = require("./routes/funding");

const app = express();
const PORT = process.env.port || 4000;

// app configs.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(cors("*"));
app.use(cookieParser());
app.disable("x-powered-by");

//Limitar o tamanho do json
app.use(
  bodyParser.json({
    limit: "1mb"
    //type: "application/*+json"
  })
);

//Faz um parse do body
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/funding", fundingRouter);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(
  logger(
    ":remote-addr :remote-user :method :url HTTP/:http-version :status [:date] :res[content-length] - :response-time ms"
  )
);

//initialize the app.
async function initialize() {
  app.listen(PORT);
}

initialize().finally(() => console.log(`app started on port:${PORT}`));
