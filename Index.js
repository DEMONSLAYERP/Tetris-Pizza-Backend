import express from "express";
import dotenv from 'dotenv';
import database from "./services/database.js";
import bodyParser from "body-parser";
import swaggerUI from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
import mainRouter from "./routes/All_route.js"; 

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const swaggerfile = fs.readFileSync('services/swagger.yaml','utf-8');
const swaggerDoc = yaml.parse(swaggerfile);

app.use(express.json());
app.use(bodyParser.json());

// ใช้แค่ Router หลักตัวเดียว
app.use(mainRouter);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

app.listen(port, () => {
  console.log(`🚀 Server is running and listening on port ${port}`);
});

database.connect((err, client, done) => {
  if (err) {
    console.error('❌ Connection to database failed!', err.stack);
  } else {
    console.log('✅ Connected to database successfully!');
    client.release();
  }
});