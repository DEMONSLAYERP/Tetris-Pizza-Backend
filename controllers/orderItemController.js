import database from "../services/database.js";

export async function getAllOrderItems(req, res) {
    console.log(`GET /order-items is Requested!!.`);
    try {
        const query = `
            SELECT 
                oi.order_item_id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.price_per_unit,
                oi.customizations
            FROM 
                order_items oi
            WHERE 
                oi.order_id IN (SELECT order_id FROM orders WHERE is_available = TRUE);
        `;
        
        const result = await database.query(query);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการคำสั่งซื้อ." });
    }
}

export async function getOrderItemById(req, res) {
    const { id } = req.params;
    console.log(`GET /order-items/${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                oi.order_item_id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.price_per_unit,
                oi.customizations
            FROM 
                order_items oi
            WHERE 
                oi.order_item_id = $1;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบรายการคำสั่งซื้อที่คุณค้นหา" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการคำสั่งซื้อ." });
    }
}

export async function postOrderItem(req, res) {
    console.log("POST /order-items is requested !!! ");
    const { order_id, product_id, quantity, price_per_unit, customizations } = req.body;

    if (!order_id || !product_id || !quantity || !price_per_unit) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลรายการคำสั่งซื้อให้ครบถ้วน (order_id, product_id, quantity, price_per_unit)" });
    }

    try {
        const checkQuery = `
            SELECT * FROM order_items 
            WHERE order_id = $1 AND product_id = $2 AND customizations = $3;
        `;
        const existingItem = await database.query(checkQuery, [order_id, product_id, customizations || null]);

        if (existingItem.rows.length > 0) {
            return res.status(409).json({ message: "มีรายการคำสั่งซื้อนี้อยู่แล้วในระบบ" });
        }

        const insertQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, customizations)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        
        const result = await database.query(insertQuery, [order_id, product_id, quantity, price_per_unit, customizations || null]);
        return res.status(201).json({ message: "เพิ่มรายการคำสั่งซื้อเรียบร้อยแล้ว.", order_item: result.rows[0] });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มรายการคำสั่งซื้อ.", error_detail: error.message });
    }
}

export async function putOrderItem(req, res) {
    const { id } = req.params;
    const { order_id, product_id, quantity, price_per_unit, customizations } = req.body;

    console.log(`PUT /order-items/${id} is Requested!!.`);

    try {
        if (order_id === undefined || product_id === undefined || quantity === undefined || price_per_unit === undefined) {
            return res.status(400).json({ message: "กรุณาส่งข้อมูลรายการคำสั่งซื้อมาให้ครบถ้วน" });
        }

        const query = `
            UPDATE order_items
            SET 
                order_id = $2,
                product_id = $3,
                quantity = $4,
                price_per_unit = $5,
                customizations = $6
            WHERE 
                order_item_id = $1
            RETURNING *;
        `;

        const values = [id, order_id, product_id, quantity, price_per_unit, customizations || null];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบรายการคำสั่งซื้อที่ต้องการอัปเดต" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลรายการคำสั่งซื้อ." });
    }
}

export async function deleteOrderItem(req, res) {
    const { id } = req.params;
    console.log(`DELETE /order-items/${id} is Requested!!.`);

    try {
        const query = `
            DELETE FROM order_items
            WHERE order_item_id = $1
            RETURNING order_item_id;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบรายการคำสั่งซื้อที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `รายการคำสั่งซื้อ ID: ${id} ถูกลบเรียบร้อยแล้ว` });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลรายการคำสั่งซื้อ." });
    }
}

export async function getOrderItemsByOrderId(req, res) {
    const { id } = req.params;
    console.log(`GET /order-items by orderId: ${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                oi.order_item_id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.price_per_unit,
                oi.customizations
            FROM 
                order_items oi
            WHERE 
                oi.order_id = $1
                AND oi.order_id IN (SELECT order_id FROM orders WHERE is_available = TRUE);
        `;
        
        const result = await database.query(query, [id]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการคำสั่งซื้อตามคำสั่งซื้อ." });
    }
}