const express = require("express");
const sql = require("../shared/db/postgres.js");
const router = express.Router();

require("dotenv").config();

router.post("/calculate", async (req, res, next) => {
  /*  #swagger.parameters['obj'] = {
    in: 'body',
    description: 'detail funding',
    schema: { $ref: '#/definitions/Funding' }
  } */

  try {
    res.setHeader("Content-Type", "application/json");
    console.log("Body => ", req.body);

    let result = [];
    let parcelas = req.body.anos * 12;
    let entrada = (req.body.valor * req.body.entrada) / 100;
    let valor = req.body.valor - entrada;
    //busca os bancos e tarifas

    let updateAt = await sql`SELECT max(bancos."updateAt") FROM bancos`;
    let lista = await sql`SELECT * FROM bancos WHERE 
      bancos.renda_minima <= ${req.body.renda} AND 
      bancos.valor_maximo >= ${req.body.valor} AND 
      bancos.entrada <= ${req.body.entrada}`;

    if (req.body.tipo === "TP" || req.body.tipo === "SAC") {
      lista = lista.filter((obj) => obj.tipo === req.body.tipo);
    }

    lista.map((banco) => {
      let taxa = 0.0101329;
      // console.log("taxa => ", taxa);
      // console.log("valor => ", valor);

      let obj = {
        nome: banco.nome,
        parcelas: parcelas,
        taxa: taxa, //taxa,
        valor: valor.toFixed(2),
        cet: banco.cet,
        juros: banco.juros,
        tipo: banco.tipo,
        mip: banco.mip,
        dfi: banco.dfi,
        imagem: banco.imagem,
        link: banco.link,
        updateAt: banco.updateAt
      };

      const data = banco.tipo === "TP" ? tp(obj) : sac(obj);
      result.push(data);
    });

    //ordenar da menor parcela para a maior
    result.sort((a, b) => Number(a.parcela) - Number(b.parcela));

    return res.status(200).send({
      updateAt: updateAt[0].max, //
      count: result.length,
      data: result
    });
  } catch (e) {
    return res.status(500);
  }
});

function tp(obj) {
  const parcela =
    obj.valor *
    (((1 + obj.taxa) ** obj.parcelas * obj.taxa) /
      ((1 + obj.taxa) ** obj.parcelas - 1));

  return {
    nome: obj.nome,
    parcela: parcela.toFixed(2),
    cet: obj.cet,
    juros: obj.juros,
    tipo: obj.tipo,
    mip: obj.mip,
    dfi: obj.dfi,
    imagem: baseUrl(obj.imagem),
    link: obj.link,
    updateAt: obj.updateAt
  };
}

function sac(obj) {
  const parcela =
    obj.valor *
    (((1 + obj.taxa) ** obj.parcelas * obj.taxa) /
      ((1 + obj.taxa) ** obj.parcelas - 1));
  return {
    nome: obj.nome,
    parcela: parcela.toFixed(2),
    cet: obj.cet,
    juros: obj.juros,
    tipo: obj.tipo,
    mip: obj.mip,
    dfi: obj.dfi,
    imagem: baseUrl(obj.imagem),
    link: obj.link,
    updateAt: obj.updateAt
  };
}

function baseUrl(value) {
  if (value === null) return null;
  return process.env.storage + value;
}

module.exports = router;
