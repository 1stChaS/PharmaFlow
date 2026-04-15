import { pool } from '../config/database.js';

const mapInventoryItem = (row) => ({
  id: row.id,
  drugCode: row.drug_code,
  drugName: row.drug_name,
  genericName: row.generic_name,
  categoryName: row.category_name,
  dosageForm: row.dosage_form,
  strength: row.strength,
  totalQuantity: Number(row.total_quantity || 0),
  reorderLevel: Number(row.reorder_level || 0),
  stockStatus:
    Number(row.total_quantity || 0) <= 0
      ? 'out_of_stock'
      : Number(row.total_quantity || 0) < Number(row.reorder_level || 0)
        ? 'low_stock'
        : 'in_stock',
});

export const inventoryService = {
  async getStockStatus() {
    const [rows] = await pool.query(`
      SELECT
        d.id,
        d.drug_code,
        d.drug_name,
        d.generic_name,
        c.name AS category_name,
        d.dosage_form,
        d.strength,
        d.reorder_level,
        COALESCE(SUM(b.quantity), 0) AS total_quantity
      FROM drugs d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN drug_categories c ON d.category_id = c.id
      GROUP BY
        d.id,
        d.drug_code,
        d.drug_name,
        d.generic_name,
        c.name,
        d.dosage_form,
        d.strength,
        d.reorder_level
      ORDER BY d.drug_name ASC
    `);

    return rows.map(mapInventoryItem);
  },
};
