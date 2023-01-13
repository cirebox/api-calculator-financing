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
    let anos = req.body.anos;
    let entrada = (req.body.valor * req.body.entrada) / 100;

    if (req.body.entrada < 20.0) {
      return res.status(400).send({
        code: 400,
        message: "Valor mínimo de entrada deve ser 20%"
      });
    }

    let valor = req.body.valor - entrada;

    let limitParcela = (req.body.renda * 30) / 100;

    //busca os bancos e tarifas

    let updateAt = await sql`SELECT max(bancos."updateAt") FROM bancos`;
    let lista = await sql`SELECT * FROM bancos WHERE
      bancos.ativo = true AND 
      bancos.renda_minima <= ${req.body.renda} AND
      bancos.valor_maximo >= ${req.body.valor} AND
      bancos.entrada <= ${req.body.entrada}`;

    if (req.body.tipo === "TP" || req.body.tipo === "SAC") {
      lista = lista.filter((obj) => obj.tipo === req.body.tipo);
    }
    // let lista = [
    //   {
    //     nome: "CredCasa",
    //     cet: "12.86",
    //     juros: "12.68",
    //     tipo: "SAC",
    //     mip: "0.000",
    //     dfi: "0.000",
    //     imagem: "inter.png",
    //     link: "",
    //     updateAt: "2022-11-05T10:00:00.000Z"
    //   }
    // ];

    await Promise.all(
      lista.map(async (banco) => {
        const vparcela = await calculaParcela(
          Number(valor),
          Number(anos),
          Number(banco.cet),
          banco.tipo
        );

        const data = {
          nome: banco.nome,
          parcela: vparcela,
          cet: banco.cet,
          juros: banco.juros,
          tipo: banco.tipo,
          mip: banco.mip,
          dfi: banco.dfi,
          imagem: baseUrl(banco.imagem),
          link: banco.link,
          updateAt: banco.updateAt
        };

        if (vparcela <= limitParcela) {
          result.push(data);
        }
      })
    );

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

function baseUrl(value) {
  if (value === null) return null;
  return process.env.storage + value;
}

// ValContr valor contratado (PV)
// ValBContr valor base contratado (valor contratado + IOF + JurosCarencia)
// NumPrest numero de prestações contratado (N)
// TaxaJuros taxa de juros contratada (I)

async function calculaParcela(c, n, i, type) {
  let iof = c * (3 / 100 + 0.38 / 100);
  i = Number(i / 12 / 100);
  n = n * 12;

  if (type === "SAC") {
    c = c - iof;
    let amort = c / n;
    let juros = c * i;
    let pmt = amort + juros;

    // console.log("Juros => ", juros.toFixed(2));
    // console.log("Amortização => ", amort.toFixed(2));
    // console.log("Parcela => ", pmt.toFixed(2));

    return pmt.toFixed(2);
  } else if (type === "TP") {
    c = c - iof;
    let pmt = (c * ((1 + i) ** n * i)) / ((1 + i) ** n - 1);

    // console.log("Juros => ", (c * i).toFixed(2));
    // console.log("Amortização => ", pmt - c * i);
    // console.log("Parcela => ", pmt.toFixed(2));

    return pmt.toFixed(2);
  }

  // c = c / (t * 12);

  // //https://brasilescola.uol.com.br/matematica/juros-compostos.htm
  // // i = 7;
  // // t = 2;
  // // c = 1400;
  // // encontrando montante e juros
  // //M = C (1 + i) t
  // i = i / 100;
  // let jm = (1 + i) ** t;
  // let m = c * jm;

  // console.log("nº meses => ", t * 12);
  // console.log("percentual juros mensal => ", ((jm - 1) * 100).toFixed(2));
  // console.log("valor financiado => ", c);
  // console.log("valor montante => ", m.toFixed(2));
  // console.log("valor prestação => ", (m / (t * 12)).toFixed(2));

  // // encontrando juros acumulado
  // //J = M – C
  // let j = m - c;
  // console.log("juros acumulado => ", j.toFixed(2));

  // // encontrando a taxa de juros
  // // Para encontrar a taxa, precisamos primeiro encontrar o montante.
  // // M  = C + J
  // // em sequida vamos encontrar o juros
  // // M = C.(1+i) ** t
  // let mon = c + j;
  // let taxaJuros = mon / c;
  // taxaJuros = Math.sqrt(taxaJuros) - 1;
  // taxaJuros = taxaJuros * 100;

  // console.log("juros aplicada ao ano => ", taxaJuros.toFixed(2));

  // // Diferença entre juros simples e juros composto
  // // M = C.(1 + i) . t

  // let parcela = c * (1 + i) ** t;

  // console.log("valor rendimento => ", parcela);

  // return (m / (t * 12)).toFixed(2);
}

module.exports = router;
