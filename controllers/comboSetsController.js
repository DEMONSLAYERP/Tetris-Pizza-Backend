import database from "../services/database.js";

// ดึงข้อมูลทั้งหมดจาก combo_sets
export async function getAllComboSets(req, res) {
    console.log("GET /combo-sets ถูกเรียก!");
    try {
        const query = `
            SELECT 
                combo_set_id,
                name,
                description,
                base_price,
                image_url,
                is_active
            FROM 
                combo_sets
            WHERE 
                is_active = TRUE;
        `;
        const result = await database.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลชุดคอมโบ" });
    }
}

// ดึงข้อมูลตาม combo_set_id
export async function getComboSetById(req, res) {
    const { id } = req.params;
    console.log(`GET /combo-sets/${id} ถูกเรียก!`);
    try {
        const query = `
            SELECT 
                combo_set_id,
                name,
                description,
                base_price,
                image_url,
                is_active
            FROM 
                combo_sets
            WHERE 
                combo_set_id = $1
                AND is_active = TRUE;
        `;
        const result = await database.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบชุดคอมโบสำหรับ ID นี้" });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลชุดคอมโบ" });
    }
}

// เพิ่มชุดคอมโบใหม่
export async function postComboSet(req, res) {
    console.log("POST /combo-sets ถูกเรียก!");
    console.log("req.body:", req.body); // Debug
    if (!req.body) {
        return res.status(400).json({ message: "ไม่พบข้อมูลใน body ของคำขอ" });
    }

    const { name, description, base_price, image_url, is_active } = req.body;

    if (!name || base_price === undefined) {
        return res.status(400).json({ message: "กรุณาระบุ name และ base_price" });
    }

    try {
        // ตรวจสอบว่า name ซ้ำหรือไม่
        const checkQuery = `
            SELECT * FROM combo_sets 
            WHERE name = $1
        `;
        const existingComboSet = await database.query(checkQuery, [name]);
        if (existingComboSet.rows.length > 0) {
            return res.status(409).json({ message: "ชุดคอมโบนี้มีอยู่แล้ว" });
        }

        const insertQuery = `
            INSERT INTO combo_sets (name, description, base_price, image_url, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [
            name,
            description || null, // อนุญาตให้ description เป็น null
            base_price,
            image_url || null, // อนุญาตให้ image_url เป็น null
            is_active !== undefined ? is_active : true // ค่าเริ่มต้นเป็น true
        ];
        const result = await database.query(insertQuery, values);
        return res.status(201).json({ message: "เพิ่มชุดคอมโบสำเร็จ", data: result.rows[0] });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มชุดคอมโบ", error_detail: error.message });
    }
}

// อัปเดตชุดคอมโบ
export async function putComboSet(req, res) {
    console.log("PUT /combo-sets/:id ถูกเรียก!");
    console.log("req.body:", req.body); // Debug
    const { id } = req.params;
    if (!req.body) {
        return res.status(400).json({ message: "ไม่พบข้อมูลใน body ของคำขอ" });
    }

    const { name, description, base_price, image_url, is_active } = req.body;

    if (!name || base_price === undefined || is_active === undefined) {
        return res.status(400).json({ message: "กรุณาระบุ name, base_price, และ is_active" });
    }

    try {
        const query = `
            UPDATE combo_sets
            SET 
                name = $2,
                description = $3,
                base_price = $4,
                image_url = $5,
                is_active = $6
            WHERE 
                combo_set_id = $1
            RETURNING *;
        `;
        const values = [id, name, description || null, base_price, image_url || null, is_active];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบชุดคอมโบที่ต้องการอัปเดต" });
        }

        return res.status(200).json({ message: "อัปเดตชุดคอมโบสำเร็จ", data: result.rows[0] });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตชุดคอมโบ", error_detail: error.message });
    }
}

// ลบชุดคอมโบ
export async function deleteComboSet(req, res) {
    console.log("DELETE /combo-sets/:id ถูกเรียก!");
    const { id } = req.params;

    try {
        const query = `
            DELETE FROM combo_sets
            WHERE combo_set_id = $1
            RETURNING combo_set_id;
        `;
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบชุดคอมโบที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `ชุดคอมโบ ID: ${id} ถูกลบสำเร็จ` });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        if (error.code === '23503') {
            return res.status(400).json({ message: "ไม่สามารถลบได้ เนื่องจากชุดคอมโบนี้ถูกอ้างอิงในตารางอื่น (เช่น combo_set_items)" });
        }
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบชุดคอมโบ", error_detail: error.message });
    }
}