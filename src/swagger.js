const swaggerAutogen = require("swagger-autogen")();

require("dotenv").config();

const doc = {
  info: {
    version: "1.0.0",
    title: "Calculate Funding",
    description: "API to calculate funding"
  },
  host: process.env.host,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  definitions: {
    Funding: {
      $nome: "Jhon Doe",
      $data: "20/12/2022",
      $tipo: "TP",
      $anos: "15",
      $renda: "5000",
      $valor: "300000",
      $entrada: "20",
      $uf: "RJ",
      $email: "exemplo@gmail.com"
    }
  }
};

const outputFile = "./src/swagger-output.json";
const endpointsFiles = ["./src/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index"); // Your project's root file
});
