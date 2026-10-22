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
const AzureBlobUtil = require('./src/utils/azureBlobUtil');
// Route files
const authRoutes = require('./src/routes/auth-routes');
const userRoutes = require('./src/routes/user-routes');
const cardRoutes = require('./src/routes/card-routes');
//  const digicard =require()
const franchisePartner = require('./src/routes/franchisePartner-routes')
const subscriptionRoutes = require('./src/routes/subscription-routes');
const planRoute = require('./src/routes/plan-route');
const paymentRoute = require('./src/routes/payment-routes');
const adminRoutes = require("./src/routes/admin-routes");
const addonRoutes = require("./src/routes/addon-routes");





const port = 3000;

// app.use(cors({
//   origin: 'http://localhost:5174',
//   credentials: true              
// })); 
app.use(cors({
  origin: ['http://localhost:5173', 'https://www.revayah.one'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser({ limit: '50mb', extended: true }));

// Serve static uploads for KYC documents, receipts, and proofs
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));
connectDB();

app.get("/api/v1", (req, res) => {
  res.send("Welcome to Gravitywave Labs HMS API");
});

// Main API Routes
app.use('/api/v1/user', userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/franchise-partner', franchisePartner);

// Email invoice route
app.use('/api/v1/card-routes', cardRoutes);
app.use("/api/v1/check", subscriptionRoutes);
app.use('/api/v1/plans', planRoute);
app.use('/api/v1/addons', addonRoutes);
app.use('/api/v1/payments', paymentRoute);
app.use("/api/v1/admin", adminRoutes);
// Start server
app.listen(port, () => {
  console.log(`🚀 HMS backend running at http://localhost:${port}`);
});



(async () => {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "cards";

    if (!connectionString || connectionString.includes("<YOUR_AZURE_ACCOUNT_NAME>")) {
      console.warn("⚠️ AZURE_STORAGE_CONNECTION_STRING is not set or contains placeholder values in .env. Please update it with your real Azure connection string.");
      return;
    }

    const azureBlobUtil = new AzureBlobUtil(connectionString);
    const isConnected = await azureBlobUtil.testConnection(containerName);

    if (isConnected) {
      console.log("✅ Azure Blob Storage connection successful");
    } else {
      console.log("❌ Failed to connect to Azure Blob Storage");
    }
  } catch (error) {
    console.error("Azure Storage Error:", error.message);
  }
})();
