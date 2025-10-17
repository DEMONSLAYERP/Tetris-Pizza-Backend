import database from "../services/database.js";

// ดึงข้อมูลโปรโมชันทั้งหมด
export async function getAllPromotions(req, res) {
    console.log("GET /promotions ถูกเรียก!");
    try {
        const query = `
            SELECT 
                promotion_id,
                coupon_code,
                description,
                discount_type,
                discount_value,
                min_purchase,
                start_date,
                expiry_date
            FROM 
                promotions
            WHERE 
                start_date <= NOW()
                AND expiry_date >= NOW();
        `;
        const result = await database.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรโมชัน" });
    }
}

// ดึงข้อมูลโปรโมชันตาม promotion_id
export async function getPromotionById(req, res) {
    const { id } = req.params;
    console.log(`GET /promotions/${id} ถูกเรียก!`);
    try {
        const query = `
            SELECT 
                promotion_id,
                coupon_code,
                description,
                discount_type,
                discount_value,
                min_purchase,
                start_date,
                expiry_date
            FROM 
                promotions
            WHERE 
                promotion_id = $1
                AND start_date <= NOW()
                AND expiry_date >= NOW();
        `;
        const result = await database.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบโปรโมชันสำหรับ ID นี้หรือโปรโมชันหมดอายุ" });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรโมชัน" });
    }
}

// เพิ่มโปรโมชันใหม่
export async function postPromotion(req, res) {
    console.log("POST /promotions ถูกเรียก!");
    console.log("req.body:", req.body); // Debug
    if (!req.body) {
        return res.status(400).json({ message: "ไม่พบข้อมูลใน body ของคำขอ" });
    }

    const { coupon_code, description, discount_type, discount_value, min_purchase, start_date, expiry_date } = req.body;

    if (!coupon_code || !discount_type || discount_value === undefined || !min_purchase || !start_date || !expiry_date) {
        return res.status(400).json({ message: "กรุณาระบุ coupon_code, discount_type, discount_value, min_purchase, start_date, และ expiry_date" });
    }

    // ตรวจสอบว่า start_date ไม่เกิน expiry_date
    if (new Date(start_date) > new Date(expiry_date)) {
        return res.status(400).json({ message: "start_date ต้องไม่เกิน expiry_date" });
    }

    try {
        const checkQuery = `
            SELECT * FROM promotions 
            WHERE coupon_code = $1
        `;
        const existingPromotion = await database.query(checkQuery, [coupon_code]);
        if (existingPromotion.rows.length > 0) {
            return res.status(409).json({ message: "รหัสคูปองนี้มีอยู่แล้ว" });
        }

        const insertQuery = `
            INSERT INTO promotions (coupon_code, description, discount_type, discount_value, min_purchase, start_date, expiry_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            coupon_code,
            description || null,
            discount_type,
            discount_value,
            min_purchase,
            start_date,
            expiry_date
        ];
        const result = await database.query(insertQuery, values);
        return res.status(201).json({ message: "เพิ่มโปรโมชันสำเร็จ", data: result.rows[0] });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มโปรโมชัน", error_detail: error.message });
    }
}

// อัปเดตโปรโมชัน
export async function putPromotion(req, res) {
    console.log("PUT /promotions/:id ถูกเรียก!");
    console.log("req.body:", req.body); // Debug
    const { id } = req.params;
    if (!req.body) {
        return res.status(400).json({ message: "ไม่พบข้อมูลใน body ของคำขอ" });
    }

    const { coupon_code, description, discount_type, discount_value, min_purchase, start_date, expiry_date } = req.body;

    if (!coupon_code || !discount_type || discount_value === undefined || !min_purchase || !start_date || !expiry_date) {
        return res.status(400).json({ message: "กรุณาระบุ coupon_code, discount_type, discount_value, min_purchase, start_date, และ expiry_date" });
    }

    // ตรวจสอบว่า start_date ไม่เกิน expiry_date
    if (new Date(start_date) > new Date(expiry_date)) {
        return res.status(400).json({ message: "start_date ต้องไม่เกิน expiry_date" });
    }

    try {
        const query = `
            UPDATE promotions
            SET 
                coupon_code = $2,
                description = $3,
                discount_type = $4,
                discount_value = $5,
                min_purchase = $6,
                start_date = $7,
                expiry_date = $8
            WHERE 
                promotion_id = $1
            RETURNING *;
        `;
        const values = [id, coupon_code, description || null, discount_type, discount_value, min_purchase, start_date, expiry_date];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบโปรโมชันที่ต้องการอัปเดต" });
        }

        return res.status(200).json({ message: "อัปเดตโปรโมชันสำเร็จ", data: result.rows[0] });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตโปรโมชัน", error_detail: error.message });
    }
}

// ลบโปรโมชัน
export async function deletePromotion(req, res) {
    console.log("DELETE /promotions/:id ถูกเรียก!");
    const { id } = req.params;

    try {
        const query = `
            DELETE FROM promotions
            WHERE promotion_id = $1
            RETURNING promotion_id;
        `;
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบโปรโมชันที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `โปรโมชัน ID: ${id} ถูกลบสำเร็จ` });
    } catch (error) {
        console.error("ข้อผิดพลาดฐานข้อมูล:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบโปรโมชัน", error_detail: error.message });
    }
}