import database from "../services/database.js";

export async function getAllAddresses(req, res) {
    console.log(`GET /addresses is Requested!!.`);
    try {
        const query = `
            SELECT 
                a.address_id,
                a.user_id,
                a.address_line1,
                a.city,
                a.province,
                a.postal_code,
                a.is_default,
                a.recipient_name,
                a.phone_number,
                a.address_label,
                a.sub_district
            FROM 
                addresses a;
        `;
        
        const result = await database.query(query);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่." });
    }
}

export async function getAddressById(req, res) {
    const { id } = req.params;
    console.log(`GET /addresses/${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                a.address_id,
                a.user_id,
                a.address_line1,
                a.city,
                a.province,
                a.postal_code,
                a.is_default,
                a.recipient_name,
                a.phone_number,
                a.address_label,
                a.sub_district
            FROM 
                addresses a
            WHERE 
                a.address_id = $1;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบที่อยูที่คุณค้นหา" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่." });
    }
}

export async function postAddress(req, res) {
    console.log("POST /addresses is requested !!! ");
    const { user_id, address_line1, city, province, postal_code, is_default, recipient_name, phone_number, address_label, sub_district } = req.body;

    if (!user_id || !address_line1 || !city || !province || !postal_code || !recipient_name || !phone_number) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลที่อยู่ให้ครบถ้วน (user_id, address_line1, city, province, postal_code, recipient_name, phone_number)" });
    }

    try {
        const checkQuery = `
            SELECT * FROM addresses 
            WHERE user_id = $1 AND address_line1 = $2 AND sub_district = $3 AND city = $4 AND province = $5 AND postal_code = $6;
        `;
        const existingAddress = await database.query(checkQuery, [user_id, address_line1, sub_district || null, city, province, postal_code]);

        if (existingAddress.rows.length > 0) {
            return res.status(409).json({ message: "มีที่อยู่นี้อยู่แล้วในระบบ" });
        }

        // If is_default is true, update other addresses for the same user to set is_default to false
        if (is_default) {
            const updateDefaultQuery = `
                UPDATE addresses
                SET is_default = FALSE
                WHERE user_id = $1 AND is_default = TRUE;
            `;
            await database.query(updateDefaultQuery, [user_id]);
        }

        const insertQuery = `
            INSERT INTO addresses (user_id, address_line1, city, province, postal_code, is_default, recipient_name, phone_number, address_label, sub_district)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        
        const values = [user_id, address_line1, city, province, postal_code, is_default || false, recipient_name, phone_number, address_label || null, sub_district || null];
        const result = await database.query(insertQuery, values);
        return res.status(201).json({ message: "เพิ่มที่อยู่เรียบร้อยแล้ว.", address: result.rows[0] });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มที่อยู่.", error_detail: error.message });
    }
}

export async function putAddress(req, res) {
    const { id } = req.params;
    const { user_id, address_line1, city, province, postal_code, is_default, recipient_name, phone_number, address_label, sub_district } = req.body;

    console.log(`PUT /addresses/${id} is Requested!!.`);

    try {
        if (user_id === undefined || address_line1 === undefined || city === undefined || province === undefined || postal_code === undefined || 
            is_default === undefined || recipient_name === undefined || phone_number === undefined) {
            return res.status(400).json({ message: "กรุณาส่งข้อมูลที่อยู่มาให้ครบถ้วน" });
        }

        // If is_default is true, update other addresses for the same user to set is_default to false
        if (is_default) {
            const updateDefaultQuery = `
                UPDATE addresses
                SET is_default = FALSE
                WHERE user_id = $1 AND is_default = TRUE AND address_id != $2;
            `;
            await database.query(updateDefaultQuery, [user_id, id]);
        }

        const query = `
            UPDATE addresses
            SET 
                user_id = $2,
                address_line1 = $3,
                city = $4,
                province = $5,
                postal_code = $6,
                is_default = $7,
                recipient_name = $8,
                phone_number = $9,
                address_label = $10,
                sub_district = $11
            WHERE 
                address_id = $1
            RETURNING *;
        `;

        const values = [id, user_id, address_line1, city, province, postal_code, is_default, recipient_name, phone_number, address_label || null, sub_district || null];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบที่อยูที่ต้องการอัปเดต" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลที่อยู่." });
    }
}

export async function deleteAddress(req, res) {
    const { id } = req.params;
    console.log(`DELETE /addresses/${id} is Requested!!.`);

    try {
        const query = `
            DELETE FROM addresses
            WHERE address_id = $1
            RETURNING address_id;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบที่อยูที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `ที่อยู่ ID: ${id} ถูกลบเรียบร้อยแล้ว` });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลที่อยู่." });
    }
}

export async function getAddressesByUserId(req, res) {
    const { id } = req.params;
    console.log(`GET /addresses by userId: ${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                a.address_id,
                a.user_id,
                a.address_line1,
                a.city,
                a.province,
                a.postal_code,
                a.is_default,
                a.recipient_name,
                a.phone_number,
                a.address_label,
                a.sub_district
            FROM 
                addresses a
            WHERE 
                a.user_id = $1;
        `;
        
        const result = await database.query(query, [id]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่ตามผู้ใช้." });
    }
}