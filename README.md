# DigiCard Backend API

Backend services for DigiCard — Digital Business Cards, Franchise & Partner Management, Subscription Billing, and Role-Based Access Control (RBAC).

---

## 🔑 Test Credentials & Role Portals

| Role | Email | Password | Login Portal | Landing Dashboard | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `revayahone.admin@gmail.com` | `Admin@123` | `/signin/admin` or `/signin` | `/admin-dashboard` | Full platform administration, KYC verification, franchise management |
| **Franchise** | `soumya123@gmail.com` | `Soumya123@` | `/signin` or `/signin/partner` | `/franchise/dashboard` | Franchise dashboard, partner management, commission tracking |
| **Franchise (Alt)** | `rahul123@gmail.com` | `Rahul123@` | `/signin` or `/signin/partner` | `/franchise/dashboard` | Alternative active franchise account |
| **Channel Partner** | `chiku123@gmail.com` | `Chiku123@` | `/signin` or `/signin/partner` | `/partner/dashboard` | Partner dashboard, customer attribution, referral tracking |
| **Customer** | `raman123@gmail.com` | `Raman123@` | `/signin` | `/card-dashbord` | Digital card creator, analytics, subscriber dashboard |

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with dual HttpOnly Cookie & `Authorization: Bearer <token>` support
- **File Uploads**: Multer (served at `/uploads`)
- **Email Service**: Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB connection URI configured in `.env`

### Installation
```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm start
```

### Environment Variables (`.env`)
```env
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
DB_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
FRONTEND_URL=http://localhost:5173
```