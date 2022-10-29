const express = require("express");

const router = express.Router();

router.post("/calculate", (req, res, next) => {
  /*  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'detail funding',
    schema: { $ref: '#/definitions/Funding' }
  } */

  try {
    console.log(req.body);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send({
      data: [req.body]
    });
  } catch (e) {
    return res.status(500);
  }
});

module.exports = router;
