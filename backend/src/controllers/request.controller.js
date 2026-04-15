import { pool } from '../config/database.js'

export async function getAllRequests(req, res, next) {
  try {
    const [requests] = await pool.query(`
      SELECT
        r.id,
        r.request_number,
        r.requested_by,
        COALESCE(u.full_name, u.username, 'Unknown User') AS requested_by_name,
        r.department,
        r.status,
        r.priority,
        r.required_by_date,
        COALESCE(r.notes, '') AS notes,
        r.approved_by,
        COALESCE(au.full_name, au.username, '') AS approved_by_name,
        r.approved_at,
        COALESCE(r.rejection_reason, '') AS rejection_reason,
        r.created_at
      FROM requests r
      LEFT JOIN users u ON u.id = r.requested_by
      LEFT JOIN users au ON au.id = r.approved_by
      ORDER BY r.created_at DESC
    `)

    const requestIds = requests.map((r) => r.id)

    let items = []
    if (requestIds.length > 0) {
      const placeholders = requestIds.map(() => '?').join(',')
      const [itemRows] = await pool.query(
        `
        SELECT
          ri.id,
          ri.request_id,
          ri.drug_id,
          COALESCE(d.drug_name, 'Unknown Drug') AS drug_name,
          COALESCE(d.drug_code, '') AS drug_code,
          ri.quantity_requested,
          COALESCE(ri.quantity_approved, 0) AS quantity_approved,
          COALESCE(ri.quantity_dispensed, 0) AS quantity_dispensed,
          COALESCE(ri.notes, '') AS notes
        FROM request_items ri
        LEFT JOIN drugs d ON d.id = ri.drug_id
        WHERE ri.request_id IN (${placeholders})
        ORDER BY ri.id ASC
        `,
        requestIds
      )
      items = itemRows
    }

    const result = requests.map((request) => ({
      ...request,
      items: items.filter((item) => item.request_id === request.id),
    }))

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function approveRequest(req, res, next) {
  try {
    const { id } = req.params
    const approvedBy = req.user?.id || 1

    const [[existing]] = await pool.query(
      `SELECT id, status FROM requests WHERE id = ?`,
      [id]
    )

    if (!existing) {
      return res.status(404).json({ message: 'Request not found' })
    }

    await pool.query(
      `
      UPDATE requests
      SET status = 'approved',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ''
      WHERE id = ?
      `,
      [approvedBy, id]
    )

    await pool.query(
      `
      UPDATE request_items
      SET quantity_approved = quantity_requested
      WHERE request_id = ?
      `,
      [id]
    )

    res.json({ message: 'Request approved' })
  } catch (error) {
    next(error)
  }
}

export async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params
    const { reason } = req.body
    const approvedBy = req.user?.id || 1

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' })
    }

    const [[existing]] = await pool.query(
      `SELECT id, status FROM requests WHERE id = ?`,
      [id]
    )

    if (!existing) {
      return res.status(404).json({ message: 'Request not found' })
    }

    await pool.query(
      `
      UPDATE requests
      SET status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
      `,
      [approvedBy, reason.trim(), id]
    )

    await pool.query(
      `
      UPDATE request_items
      SET quantity_approved = 0
      WHERE request_id = ?
      `,
      [id]
    )

    res.json({ message: 'Request rejected' })
  } catch (error) {
    next(error)
  }
}

export async function dispatchRequest(req, res, next) {
  try {
    const { id } = req.params

    const [[existing]] = await pool.query(
      `SELECT id, status FROM requests WHERE id = ?`,
      [id]
    )

    if (!existing) {
      return res.status(404).json({ message: 'Request not found' })
    }

    await pool.query(
      `
      UPDATE requests
      SET status = 'dispatched'
      WHERE id = ?
      `,
      [id]
    )

    res.json({ message: 'Request dispatched' })
  } catch (error) {
    next(error)
  }
}