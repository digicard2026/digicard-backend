const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const path = require("path");
require("dotenv").config();

const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
 
const connectDB = require("./src/config/db");
const app = express();

const bodyParser = require("body-parser"); // Added for email + PDF
const S3Util = require('./src/utils/s3Util'); 
// Route files
const authRoutes = require('./src/routes/auth-routes');
const userRoutes = require('./src/routes/user-routes');
const cardRoutes =require('./src/routes/card-routes');
//  const digicard =require()
const franchisePartner = require('./src/routes/franchisePartner-routes')
const  subscriptionRoutes =require('./src/routes/subscription-routes');
const planRoute =require('./src/routes/plan-route');
const paymentRoute =require('./src/routes/payment-routes');
const adminRoutes = require("./src/routes/admin-routes");

 



const port = 3000;

// app.use(cors({
//   origin: 'http://localhost:5174',
//   credentials: true              
// })); 
app.use(cors({
    origin:['http://localhost:5173', 'https://www.revayah.one'],
    credentials: true
}))
app.use(express.json({limit: '50mb'}))
app.use(cookieParser({limit: '50mb', extended: true}));
connectDB();

app.get("/api/v1", (req, res) => {
  res.send("Welcome to Gravitywave Labs HMS API");
});

// Main API Routes
app.use('/api/v1/user', userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/franchise-partner', franchisePartner);

// Email invoice route
app.use('/api/v1/card-routes',cardRoutes);
app.use("/api/v1/check", subscriptionRoutes);
app.use('/api/v1/plans',planRoute);
app.use('/api/v1/payments',paymentRoute);
app.use("/api/v1/admin", adminRoutes);
// Start server
app.listen(port, () => {
  console.log(`🚀 HMS backend running at http://localhost:${port}`);
});



(async () => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    // console.log(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY ,"AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY");

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials missing. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
    }
    if (!process.env.AWS_REGION) {
      throw new Error("AWS region missing. Please set AWS_REGION in .env");
    }
    if (!bucketName) {
      throw new Error("Bucket name missing. Please set AWS_BUCKET_NAME in .env");
    }
    const s3Util = new S3Util(process.env.AWS_REGION);

    const isConnected = await s3Util.testConnection(bucketName);

    if (isConnected) {
      console.log(" S3 connection successful");
    } else {
      console.log(" Failed to connect to S3");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
