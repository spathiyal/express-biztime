const express = require("express");

const db = require("../db");
const ExpressError = require("../expressError");

let router = new express.Router();
// get list all the companies
router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT code,name FROM companies ORDER BY name`
    );
    return res.json({ "companies ": result.rows });
  } catch (err) {
    return next(err);
  }
});
// get details of a company
router.get("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;
    const result = await db.query(
      `SELECT code,name, description FROM companies where code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`company ${code} doesn't exists`, 404);
    }
    const company = result.rows[0];
    return res.json({ "companies ": company });
  } catch (err) {
    return next(err);
  }
});

//post a company

router.post("/", async function (req, res, next) {
  try {
    let { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name.description`,
      [code, name.description]
    );

    return res.json({ "companies ": result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

//update a company
router.put("/:code", async function (req, res, next) {
  try {
    let { name, description } = req.body;

    let code = req.params.code;
    const result = await db.query(
      `UPDATE companies SET name = $1, description =$2 where code = $1 RETURNING code,name, description`,
      [name, description, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`company ${code} doesn't exists`, 404);
    }

    return res.json({ "companies ": result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

//delete a company
router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies where code = $1 RETURNING code`,

      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`company ${code} doesn't exists`, 404);
    }

    return res.json({ "status ": "Company has been deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
