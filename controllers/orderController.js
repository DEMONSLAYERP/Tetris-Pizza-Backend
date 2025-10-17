import database from "../services/database.js";

export async function getAllOrders(req, res) {
    console.log(`GET /orders is Requested!!.`);
    try {
        const query = `
            SELECT 
                o.order_id,
                o.user_id,
                o.address_id,
                o.total_amount,
                o.status,
                o.order_date,
                o.payment_method,
                o.is_available
            FROM 
                orders o
            WHERE 
                o.is_available = TRUE;
        `;
        
        const result = await database.query(query);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ." });
    }
}

export async function getOrderById(req, res) {
    const { id } = req.params;
    console.log(`GET /orders/${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                o.order_id,
                o.user_id,
                o.address_id,
                o.total_amount,
                o.status,
                o.order_date,
                o.payment_method,
                o.is_available
            FROM 
                orders o
            WHERE 
                o.order_id = $1;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบคำสั่งซื้อที่คุณค้นหา" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ." });
    }
}

export async function postOrder(req, res) {
    console.log("POST /orders is requested !!! ");
    const { user_id, address_id, total_amount, status, payment_method } = req.body;

    if (!user_id || !address_id || !total_amount || !status || !payment_method) {
        return res.status(400).json({ message: "กรุณาระบุข้อมูลคำสั่งซื้อให้ครบถ้วน (user_id, address_id, total_amount, status, payment_method)" });
    }

    try {
        const insertQuery = `
            INSERT INTO orders (user_id, address_id, total_amount, status, payment_method, order_date, is_available)
            VALUES ($1, $2, $3, $4, $5, NOW(), TRUE)
            RETURNING *;
        `;
        
        const result = await database.query(insertQuery, [user_id, address_id, total_amount, status, payment_method]);
        return res.status(201).json({ message: "เพิ่มคำสั่งซื้อเรียบร้อยแล้ว.", order: result.rows[0] });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มคำสั่งซื้อ.", error_detail: error.message });
    }
}

export async function putOrder(req, res) {
    const { id } = req.params;
    const { user_id, address_id, total_amount, status, payment_method, is_available } = req.body;

    console.log(`PUT /orders/${id} is Requested!!.`);

    try {
        if (user_id === undefined || address_id === undefined || total_amount === undefined || status === undefined || payment_method === undefined || is_available === undefined) {
            return res.status(400).json({ message: "กรุณาส่งข้อมูลคำสั่งซื้อมาให้ครบถ้วน" });
        }

        const query = `
            UPDATE orders
            SET 
                user_id = $2,
                address_id = $3,
                total_amount = $4,
                status = $5,
                payment_method = $6,
                is_available = $7
            WHERE 
                order_id = $1
            RETURNING *;
        `;

        const values = [id, user_id, address_id, total_amount, status, payment_method, is_available];
        const result = await database.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบคำสั่งซื้อที่ต้องการอัปเดต" });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลคำสั่งซื้อ." });
    }
}

export async function deleteOrder(req, res) {
    const { id } = req.params;
    console.log(`DELETE /orders/${id} is Requested!!.`);

    try {
        const query = `
            DELETE FROM orders
            WHERE order_id = $1
            RETURNING order_id;
        `;
        
        const result = await database.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบคำสั่งซื้อที่ต้องการลบ" });
        }

        return res.status(200).json({ message: `คำสั่งซื้อ ID: ${id} ถูกลบเรียบร้อยแล้ว` });

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลคำสั่งซื้อ." });
    }
}

export async function getOrdersByUserId(req, res) {
    const { id } = req.params;
    console.log(`GET /orders by userId: ${id} is Requested!!.`);

    try {
        const query = `
            SELECT 
                o.order_id,
                o.user_id,
                o.address_id,
                o.total_amount,
                o.status,
                o.order_date,
                o.payment_method,
                o.is_available
            FROM 
                orders o
            WHERE 
                o.user_id = $1 AND o.is_available = TRUE;
        `;
        
        const result = await database.query(query, [id]);
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Database Query Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อตามผู้ใช้." });
    }
}