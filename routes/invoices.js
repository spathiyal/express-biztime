const express = require("express");

const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();

// get list all the invoices
router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, comp_code FROM invoices ORDER BY id`
    );
    return res.json({ "invoices ": result.rows });
  } catch (err) {
    return next(err);
  }
});
// get details of an invoice and company
router.get("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    const result = await db.query(
      `SELECT inv.id,
      inv.comp_code,
      inv.amt,
      inv.paid,
      inv.add_date,
      inv.paid_date,
        comp.name,
        comp.description
 FROM invoices AS inv
   INNER JOIN companies AS comp ON (inv.comp_code = comp.code)
 WHERE inv.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice ${id} doesn't exists`, 404);
    }
    const invData = result.rows[0];
    const invoice = {
      id: invData.id,
      company: {
        code: invData.code,
        name: invData.name,
        description: invData.description,
      },
      amt: invData.amt,
      paid: invData.paid,
      add_date: invData.add_date,
      paid_date: invData.paid_date,
    };
    return res.json({ "invoice ": invoice });
  } catch (err) {
    return next(err);
  }
});

//post an invoice

router.post("/", async function (req, res, next) {
  try {
    let { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date `,
      [comp_code, amt]
    );

    return res.json({ "invoice ": result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

//update an invoice
router.put("/:id", async function (req, res, next) {
  try {
    let { amt, paid } = req.body;

    let id = req.params.id;

    const result = await db.query(
      `UPDATE invoices SET amt = $1, paid =$2 ,paid_date=$3  where id = $4 RETURNING id, comp_code,amt, paid,add_date,paid_date`,
      [amt, paid, paid_date, id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`invoices ${id} doesn't exists`, 404);
    }

    return res.json({ "invoices ": result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

//delete a company
router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.code;
    const result = await db.query(
      `DELETE FROM invoices where id = $1 RETURNING id`,

      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`invoices ${id} doesn't exists`, 404);
    }

    return res.json({ "status ": "invoice has been deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
