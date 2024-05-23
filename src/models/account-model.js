const pool = require("../../database")
const model = {}

/* *****************************
*   Register new account
* *************************** */
model.registerAccount = async (
  account_firstname,
  account_lastname,
  account_email,
  account_password
) => {
  try {
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *`
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
model.checkExistingEmail = async (account_email) => {
  try {
    const email = await pool.query(`
    SELECT * FROM account WHERE account_email = $1`,
      [account_email])

    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
model.getAccountByEmail = async (account_email) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM account 
      WHERE account_email = $1`,
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

module.exports = model