const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const slugify = require("slugify");
const db = require("../db")

// Returns list of companies with name and code
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT code, name FROM companies ORDER BY name`
    );
    // debugger;
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

/** GET /[code] => detail on company
 *
 * =>  {company: {code, name, descrip, invoices: [id, ...]}}
 *
 * */
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const compResult = await db.query(
      `SELECT code, name, description
         FROM companies
         WHERE code = $1`,
      [code]
    );

    const invResult = await db.query(
      `SELECT id
         FROM invoices
         WHERE comp_code = $1`,
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    // Retrieve associated industries
    // const industryResult = await db.query(
    //   `SELECT i.industry
    //      FROM industries AS i
    //      JOIN company_industries AS ci ON i.code = ci.industry_code
    //      WHERE ci.comp_code = $1`,
    //   [code]
    // );

    const company = compResult.rows[0];
    const invoices = invResult.rows;

    company.invoices = invoices.map((inv) => inv.id);
    // company.industries = industryResult.rows.map(
    //   (industry) => industry.industry
    // );

    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

// Returns obj of a single company
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Generate a slug using the company name
    const code = slugify(name, { lower: true });

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
