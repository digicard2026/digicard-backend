// const jwt = require("jsonwebtoken");
const userService = require("../services/user-service");
const comparePassword  = require("../utils/hash-password");

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await userService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Invalid email or password 1" });
        }
        console.log(user)

        const isMatch = await comparePassword.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password", user, isMatch });
        }

        // const token = jwt.sign(
        //     {
        //         userId: user._id,
        //         email: user.email,
        //         role: user.role,
        //         companyId: user.companyId,
        //     },
        //     process.env.JWT_SECRET,
        //     {
        //         expiresIn: "1d",
        //     }
        // );

        res.status(200).json({
            message: "User signed in successfully",
            
        });
    } catch (err) {
        console.error("Error in signIn:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }   
        
};