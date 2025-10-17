import database from "../services/database.js";

// ดึงข้อมูลทั้งหมดจาก combo_set_items
export async function getAllComboSetItems(req, res) {
    console.log("GET /combo-set-items ถูกเรียก!");
    try {
        const query = `
            SELECT 
                item_id,
                combo_set_id,
                category_name,
                quantity
            FROM 
                combo_set_items
            WHERE 
                quantity > 0;
        `;
        const result = await database.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการชุดคอมโบ" });
    }
}

// ดึงข้อมูลตาม combo_set_id
export async function getComboSetItemsByComboId(req, res) {
    const { id } = req.params;
    console.log(`GET /combo-set-items/combo/${id} ถูกเรียก!`);
    try {
        const query = `
            SELECT 
                item_id,
                combo_set_id,
                category_name,
                quantity
            FROM 
                combo_set_items
            WHERE 
                combo_set_id = $1
                AND quantity > 0;
        `;
        const result = await database.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบรายการชุดคอมโบสำหรับ ID นี้" });
        }
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการชุดคอมโบ" });
    }
}

// เพิ่มรายการใหม่ใน combo_set_items
export async function postComboSetItem(req, res) {
    console.log("POST /combo-set-items ถูกเรียก!");
    console.log("req.body:", req.body); // Debug
    if (!req.body) {
        return res.status(400).json({ message: "ไม่พบข้อมูลใน body ของคำขอ" });
    }

    const { item_id, combo_set_id, category_name, quantity } = req.body;

    if (!item_id || !combo_set_id || !category_name || !quantity) {
        return res.status(400).json({ message: "กรุณาระบุ item_id, combo_set_id, category_name, และ quantity" });
    }

    try {
        const checkQuery = `
            SELECT * FROM combo_set_items 
            WHERE item_id = $1
        `;
        const existingItem = await database.query(checkQuery, [item_id]);
        if (existingItem.rows.length > 0) {
            return res.status(409).json({ message: "รายการชุดคอมโบนี้มีอยู่แล้ว" });
        }

        const insertQuery = `
            INSERT INTO combo_set_items (item_id, combo_set_id, category_name, quantity)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await database.query(insertQuery, [item_id, combo_set_id, category_name, quantity]);
        return res.status(201).json({ message: "เพิ่มรายการชุดคอมโบสำเร็จ", data: result.rows[0] });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        if (error.code === '23503') {
            return res.status(400).json({ message: "combo_set_id ไม่ถูกต้อง" });
        }
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มรายการชุดคอมโบ", error_detail: error.message });
    }
}

// อัปเดตรายการใน combo_set_items
export async function putComboSetItem(req, res) {
    console.log("PUT /combo-set-items/:id ถูกเรียก!");
    console.log("req.body:", req.body); // Debug
    const { id } = req.params; // item_id จาก URL
    if (!req.body) {
        return res.status(400).json({ message: "ไม่พบข้อมูลใน body ของคำขอ" });
    }

    const { combo_set_id, category_name, quantity } = req.body;

    if (!combo_set_id || !category_name || !quantity) {
        return res.status(400).json({ message: "กรุณาระบุ combo_set_id, category_name, และ quantity" });
    }

    try {
        const query = `
            UPDATE combo_set_items
            SET 
                combo_set_id = $2,
                category_name = $3,
                quantity = $4
            WHERE 
                item_id = $1
            RETURNING *;
        `;
        const values = [id, combo_set_id, category_name, quantity];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบรายการชุดคอมโบที่ต้องการอัปเดต" });
        }

        return res.status(200).json({ message: "อัปเดตรายการชุดคอมโบสำเร็จ", data: result.rows[0] });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        if (error.code === '23503') {
            return res.status(400).json({ message: "combo_set_id ไม่ถูกต้อง" });
        }
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตรายการชุดคอมโบ", error_detail: error.message });
    }
}

// ลบรายการใน combo_set_items
export async function deleteComboSetItem(req, res) {
    console.log("DELETE /combo-set-items/:id ถูกเรียก!");
    const { id } = req.params; // item_id จาก URL

    try {
        const query = `
            DELETE FROM combo_set_items
            WHERE item_id = $1
            RETURNING item_id;
        `;
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบรายการชุดคอมโบที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `รายการชุดคอมโบ ID: ${id} ถูกลบสำเร็จ` });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบรายการชุดคอมโบ", error_detail: error.message });
    }
}