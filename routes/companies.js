const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// Returns list of companies with name and code
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT code, name FROM companies`);
    // debugger;
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

// Returns obj of a single company
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    // debugger;
    return res.json({ company: result.rows });
  } catch (e) {
    return next(e);
  }
});

// Returns obj of a single company
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [code, name, description]
    );
    // debugger;
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;

    // Update the company in the database
    const result = await db.query(
      "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description",
      [name, description, code]
    );

    //  if company doesnt exist throw error else update
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ company: result.rows[0] });
    }
  } catch (e) {
    next(e);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    let { code } = req.params;

    const result = await db.query(
      `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
      [code]
    );

    if (result.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ status: "deleted" });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
