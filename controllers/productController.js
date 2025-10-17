import database from "../services/database.js";

export async function getAllProducts(req, res) {
    console.log(`GET /products is Requested!!.`);
    try {
        const query = `
            SELECT 
                p.product_id,
                p.name,
                p.description,
                -- เปลี่ยนจาก p.base_price เป็น p.price
                p.price,
                p.category,
                p.image_url,
                -- ส่วนของ Subquery ที่ดึงตัวเลือกสินค้า ถูกลบออกเนื่องจากอาจยังไม่มีตารางนี้
                -- หากมีตาราง Product_Options คุณสามารถเพิ่มส่วนนี้กลับเข้าไปได้
                p.is_available
            FROM 
                products p
            WHERE 
                p.is_available = TRUE;
        `;
        
        const result = await database.query(query);

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า." });
    }
}

export async function getProductById(req, res) {
    const { id } = req.params;
    console.log(`GET /products/${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                p.product_id,
                p.name,
                p.description,
                p.price,
                p.category,
                p.image_url,
                p.is_available
            FROM 
                products p
            WHERE 
                p.product_id = $1; 
        `;
        
        const result = await database.query(query, [id]);

        // ตรวจสอบว่ามีข้อมูลสินค้าที่ค้นหาเจอหรือไม่
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบสินค้าที่คุณค้นหา" });
        }

        // ส่งข้อมูลสินค้า (เฉพาะ object แรก) กลับไป
        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า." });
    }
}

export async function postProduct(req, res) {
    console.log("POST /products is requested !!! ");
    const { name, price, category } = req.body; 

    // ตรวจสอบว่ามีข้อมูล name ส่งมาหรือไม่
    if (!name) {
        return res.status(400).json({ message: "กรุณาระบุชื่อสินค้า (name)" });
    }

    try {
        const checkQuery = 'SELECT * FROM products WHERE name = $1';
        const existingProduct = await database.query(checkQuery, [name]);

        if (existingProduct.rows.length > 0) {
            return res.status(409).json({ message: "มีสินค้านี้อยู่แล้วในระบบ" });
        }

        const insertQuery = 'INSERT INTO products (name, price, category) VALUES ($1, $2, $3)'; 
        await database.query(insertQuery, [name, price, category]); 

        return res.status(201).json({ message: "เพิ่มสินค้าเรียบร้อยแล้ว." });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มสินค้า.", error_detail: error.message });
    }
}

export async function putProduct(req, res) {
    const { id } = req.params;
    const { name, description, price, category, image_url, is_available } = req.body;

    console.log(`PUT /products/${id} is Requested!!.`);

    try {
        if (name === undefined || description === undefined || price === undefined || category === undefined || is_available === undefined) {
            return res.status(400).json({ message: "กรุณาส่งข้อมูลสินค้ามาให้ครบถ้วน" });
        }
        const query = `
            UPDATE products
            SET 
                name = $2,
                description = $3,
                price = $4,
                category = $5,
                image_url = $6,
                is_available = $7
            WHERE 
                product_id = $1
            RETURNING *; -- คำสั่งนี้จะคืนค่าข้อมูลแถวที่เพิ่งอัปเดตกลับมา
        `;

        const values = [id, name, description, price, category, image_url, is_available];
        
        const result = await database.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการอัปเดต" });
        }
        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลสินค้า." });
    }
}

export async function deleteProduct(req, res) {
    const { id } = req.params;

    console.log(`DELETE /products/${id} is Requested!!.`);

    try {
        const query = `
            DELETE FROM products
            WHERE product_id = $1
            RETURNING product_id; -- คืนค่า ID ของแถวที่ถูกลบ เพื่อตรวจสอบ
        `;
        
        const result = await database.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการลบ" });
        }
        return res.status(200).json({ message: `สินค้า ID: ${id} ถูกลบเรียบร้อยแล้ว` });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลสินค้า." });
    }
}

export async function getProductsBycategories(req, res) {
    const { categoryName } = req.params;
    console.log(`GET /products by category: ${categoryName} is Requested!!.`);

    try {
        const query = `
            SELECT 
                product_id,
                name,
                description,
                price,
                category,
                image_url
            FROM 
                products
            WHERE 
                category ILIKE $1 AND is_available = TRUE;
        `;

        const result = await database.query(query, [categoryName]);

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าตามหมวดหมู่." });
    }
}

export async function getProductOptionsById(req, res) {
    const { id } = req.params;
    console.log(`GET /products/${id}/options is Requested!!.`);

    try {
        const query = `
            SELECT 
                option_id, 
                option_type, 
                option_name, 
                additional_price
            FROM 
                product_options
            WHERE 
                product_id = $1 
                AND is_available = TRUE;
        `;
        
        const result = await database.query(query, [id]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือกสินค้า." });
    }
}

export async function getAllCategories(req, res) {
    console.log(`GET /products/categories is Requested!!.`);

    try {
        const query = `
            SELECT DISTINCT category 
            FROM products 
            ORDER BY category ASC;
        `;
        
        const result = await database.query(query);
        const categories = result.rows.map(row => row.category);
        return res.status(200).json(categories);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่สินค้า." });
    }
}