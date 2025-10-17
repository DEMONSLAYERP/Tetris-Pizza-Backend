import database from "../services/database.js";

export async function getAllToppings(req, res) {
    console.log(`GET /toppings is Requested!!.`);
    try {
        const query = `
            SELECT 
                t.topping_id,
                t.name,
                t.price,
                t.category,
                t.is_available
            FROM 
                toppings t
            WHERE 
                t.is_available = TRUE;
        `;
        
        const result = await database.query(query);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลท็อปปิ้ง." });
    }
}

export async function getToppingById(req, res) {
    const { id } = req.params;
    console.log(`GET /toppings/${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                t.topping_id,
                t.name,
                t.price,
                t.category,
                t.is_available
            FROM 
                toppings t
            WHERE 
                t.topping_id = $1;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบท็อปปิ้งที่คุณค้นหา" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลท็อปปิ้ง." });
    }
}

export async function postTopping(req, res) {
    console.log("POST /toppings is requested !!! ");
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลท็อปปิ้งให้ครบถ้วน (name, price, category)" });
    }

    try {
        const checkQuery = `SELECT * FROM toppings WHERE name = $1 AND category = $2`;
        const existingTopping = await database.query(checkQuery, [name, category]);

        if (existingTopping.rows.length > 0) {
            return res.status(409).json({ message: "มีท็อปปิ้งนี้อยู่แล้วในระบบ" });
        }

        const insertQuery = `
            INSERT INTO toppings (name, price, category, is_available)
            VALUES ($1, $2, $3, TRUE)
            RETURNING *;
        `;
        
        const result = await database.query(insertQuery, [name, price, category]);
        return res.status(201).json({ message: "เพิ่มท็อปปิ้งเรียบร้อยแล้ว.", topping: result.rows[0] });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มท็อปปิ้ง.", error_detail: error.message });
    }
}

export async function putTopping(req, res) {
    const { id } = req.params;
    const { name, price, category, is_available } = req.body;

    console.log(`PUT /toppings/${id} is Requested!!.`);

    try {
        if (name === undefined || price === undefined || category === undefined || is_available === undefined) {
            return res.status(400).json({ message: "กรุณาส่งข้อมูลท็อปปิ้งมาให้ครบถ้วน" });
        }

        const query = `
            UPDATE toppings
            SET 
                name = $2,
                price = $3,
                category = $4,
                is_available = $5
            WHERE 
                topping_id = $1
            RETURNING *;
        `;

        const values = [id, name, price, category, is_available];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบท็อปปิ้งที่ต้องการอัปเดต" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลท็อปปิ้ง." });
    }
}

export async function deleteTopping(req, res) {
    const { id } = req.params;
    console.log(`DELETE /toppings/${id} is Requested!!.`);

    try {
        const query = `
            DELETE FROM toppings
            WHERE topping_id = $1
            RETURNING topping_id;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบท็อปปิ้งที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `ท็อปปิ้ง ID: ${id} ถูกลบเรียบร้อยแล้ว` });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลท็อปปิ้ง." });
    }
}

export async function getToppingsByCategory(req, res) {
    const { category } = req.params;
    console.log(`GET /toppings by category: ${category} is Requested!!.`);

    try {
        const query = `
            SELECT 
                t.topping_id,
                t.name,
                t.price,
                t.category,
                t.is_available
            FROM 
                toppings t
            WHERE 
                t.category = $1 AND t.is_available = TRUE;
        `;
        
        const result = await database.query(query, [category]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลท็อปปิ้งตามหมวดหมู่." });
    }
}