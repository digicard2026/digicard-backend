// const jwt = require('jsonwebtoken');
// const user = require('../models/user.model');

// const authMiddleware = async (req, res, next) => {
//     // const authHeader = req.headers.authorization;
//     const authHeader = req.headers['authorization'];
    

//     // if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     //   return res.status(401).json({ error: "Unauthorized: No token provided" });
//     // }

//     // let token = authHeader.split(" ")[1];
//        let token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
//     // If no token in header, check the cookies for HttpOnly token
//     if (!token && req.cookies.token) {
       
//         token = req.cookies.token;
//     }
// //    console.log(token);
//     try {
//         if (!token) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // const user = await User.findById(decoded.id);
//         // if (!user) {
//         //     return res.status(401).json({ message: 'Unauthorized' });
//         // }
//         // req.user = user;
//         req.user = decoded;
//         console.log("line no 24",req.user);
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// };

// module.exports = authMiddleware;

// // const jwt = require('jsonwebtoken');

// // module.exports = (req, res, next) => {
// //   const token = req.headers.authorization?.split(' ')[1];
// //   if (!token) return res.status(401).json({ message: 'No token provided' });

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = decoded; // contains _id, role, etc.
// //     next();
// //   } catch (err) {
// //     return res.status(403).json({ message: 'Invalid token' });
// //   }
// // };



// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // make sure to set this in .env

// // Auth middleware
// const auth = async (req, res, next) => {
//   try {
//     // 1. Get token from header or cookie
//     const token =
//       req.headers.authorization?.split(" ")[1] || req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({ error: "Access denied. No token provided." });
//     }

//     // 2. Verify token
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // 3. Attach user to request
//     const user = await User.findById(decoded.userId).select("-password");
//     if (!user) {
//       return res.status(401).json({ error: "User not found." });
//     }

//     req.user = {
//       id: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     };

//     next(); // pass control to next middleware
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     res.status(401).json({ error: "Invalid or expired token." });
//   }
// };

// module.exports = auth;
// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");

// const auth = async (req, res, next) => {
//   try {
//     const token = req.cookies?.token;
//     console.log("tokeennnnnn",req.cookies)

//     if (!token) {
//       return res.status(401).json({
//         message: "Authentication required. Please login first.",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("decode token",decoded)

//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid token. User not found.",
//       });
//     }

//     req.user = user; // user is now available in all protected APIs
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       message: "Invalid or expired token.",
//     });
//   }
// };
// module.exports = auth;

// const jwt = require("jsonwebtoken");

// const auth = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Authorization token missing",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 THIS LINE FIXES EVERYTHING
//     req.user = {
//       id: decoded.id || decoded.userId,
//       role: decoded.role,
//     };

//     next();
//   } catch (error) {
//     console.error("Auth Middleware Error:", error);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

// module.exports = auth;

// =========================================
const jwt = require("jsonwebtoken");
 
const auth = (req, res, next) => {

  try {

    // ✅ Read token from cookies

    const token = req.cookies.token;
 
    if (!token) {

      return res.status(401).json({

        success: false,

        message: "Authentication token missing",

      });

    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    req.user = {

      id: decoded.id || decoded.userId,

      role: decoded.role || null,

    };
 
    next();

  } catch (error) {

    console.error("Auth Middleware Error:", error);

    return res.status(401).json({

      success: false,

      message: "Invalid or expired token",

    });

  }

};
 
module.exports = auth;

 