const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    version: "1.0.0",
    title: "Calculate Funding",
    description: "API to calculate funding"
  },
  host: "localhost:4000",
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  definitions: {
    Funding: {
      $name: "Jhon Doe",
      $date: "20/12/2022",
      $syscredit: "SAC",
      $deadlineyear: "15",
      $monthlyincome: "12.000",
      $value: "300.000",
      $signal: "20.000",
      $state: "RJ",
      $email: "exemplo@gmail.com"
    }
  }
};

const outputFile = "./src/swagger-output.json";
const endpointsFiles = ["./src/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index"); // Your project's root file
});
