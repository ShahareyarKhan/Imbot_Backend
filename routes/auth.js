const mongoose = require("mongoose");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.post("/signup", async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ error: "Sorry, a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email,
        });

        const data = {
            user: {
                id: user.id
            }
        };

        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        res.json({ success: true, authtoken });

    } catch (error) {
        console.error("Error"+ error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ error: "Invalid Credentials." });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Invalid Credentials." });
        }

        const data = {
            user: {
                id: user.id,
            }
        };
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        res.json({ success: true, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/getuser', async (req, res) => {
    try {
        const authToken = req.header('Authorization'); 
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        const user = await User.findById(userId).select("-password");
        res.json({ success: true, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: "Query parameter is required and must be a string" });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select("-password");

        res.json({ success: true, users });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


module.exports=router;