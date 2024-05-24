const pool = require("../../database")

const model = {}

/* ***************************
 *  Get all classification data
 * ************************** */
model.getClassifications = async () => {
  const data = await pool.query(
    `SELECT * FROM public.classification`
  )
  // ORDER BY classification_name
  return data.rows
}

model.getClassificationById = async (classification_id) => {
  const data = await pool.query(
    `SELECT * FROM public.classification 
    WHERE classification_id = $1`,
    [classification_id]
  )
  return data.rows[0]
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
model.getInventoryByClassificationId = async (classification_id) => {
  try {
    const data = await pool.query(`
      SELECT * FROM public.classification AS c
      LEFT JOIN public.inventory AS i 
      ON i.classification_id = c.classification_id
      WHERE c.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

model.getItemById = async (item_id) => {
  try {
    const data = await pool.query(`
      SELECT * FROM public.inventory
      WHERE inventory.inv_id = $1`,
      [item_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getItemById error " + error)
  }
}

model.saveClassification = async (classification_name) => {
  try {
    const data = await pool.query(`
      INSERT INTO public.classification(classification_name)
      VALUES ($1)
      RETURNING *`,
      [classification_name]
    )
    return data
  } catch (error) {
    console.error("saveClassification error " + error)
  }
}

model.saveInventory = async (formData) => {
  try {
    const data = await pool.query(`
      INSERT INTO public.inventory(
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image,
        inv_thumbnail, 
        inv_price,
        inv_miles, 
        inv_color, 
        classification_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        formData.inv_make,
        formData.inv_model,
        formData.inv_year,
        formData.inv_description,
        formData.inv_image,
        formData.inv_thumbnail,
        formData.inv_price,
        formData.inv_miles,
        formData.inv_color,
        formData.classification_id,
      ]
    )
    return data
  } catch (error) {
    console.error("saveInventory error " + error)
  }
}

model.updateInventory = async (formData) => {
  try {
    const data = await pool.query(`
      UPDATE public.inventory 
      SET inv_make = $1, 
        inv_model = $2, 
        inv_description = $3, 
        inv_image = $4, 
        inv_thumbnail = $5, 
        inv_price = $6, 
        inv_year = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10 
      WHERE inv_id = $11 RETURNING *`,
      [
        formData.inv_make,
        formData.inv_model,
        formData.inv_description,
        formData.inv_image,
        formData.inv_thumbnail,
        formData.inv_price,
        formData.inv_year,
        formData.inv_miles,
        formData.inv_color,
        formData.classification_id,
        formData.inv_id,
      ]
    )
    return data.rows[0]
  } catch (error) {
    console.error("updateInventory error " + error)
  }
}

module.exports = model