const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../src/swagger-output.json");

const fundingRouter = require("./routes/funding");

const app = express();
const PORT = process.env.PORT || 4000;

// app configs.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
app.use("/funding", fundingRouter);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//initialize the app.
async function initialize() {
  app.listen(PORT);
}

initialize().finally(() => console.log(`app started on port:${PORT}`));
