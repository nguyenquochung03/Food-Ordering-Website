import userModel from "../models/userModel.js";

import path from "path";
import fs from "fs"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import nodemailer from "nodemailer"
import { images } from "../constants/data.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// login user
const loginUser = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "This user does not exist" });
        }

        const token = createToken(user._id);

        res.json({ success: true, token: token, user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// register user
const registerUser = async (req, res) => {
    const { name, password, email, role } = req.body;
    try {
        // Checking if user already exists
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Validate email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const errors = [];

        if (password.length < 8) {
            errors.push("at least 8 characters long");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("contain at least one lowercase letter");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("contain at least one uppercase letter");
        }
        if (!/\d/.test(password)) {
            errors.push("contain at least one number");
        }
        if (!/[.#@$!%*?&]/.test(password)) {
            errors.push("contain at least one special character (.#@$!%*?&)");
        }

        if (errors.length > 0) {
            const message = `Password must ${errors.join(", ")}.`;
            return res.json({ success: false, message });
        }

        const newUser = new userModel({
            name: name,
            email: email,
            password: password,
            role: role,
            image: extractFileName(images.profile_icon)
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ success: true, token: token, user: user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

function extractFileName(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

const updateProfileImage = async (req, res) => {
    let image_filename = req.file.filename;

    const user = await userModel.findById(req.body.userId)

    if (!user) {
        return res.json({ success: false, message: "User not found" })
    }

    if (user.image !== "profile_icon.png") {
        fs.unlinkSync(`./uploads/${user.image}`, (err) => {
            if (err) {
                console.log(err)
                return res.json({ success: false, message: "Failed to update user profile picture" });
            }
        });
    }

    try {
        const updateResult = await userModel.findByIdAndUpdate(req.body.userId,
            { image: image_filename },
            { new: true }
        );

        if (updateResult) {
            return res.json({ success: true, message: "User profile picture has been updated" });
        } else {
            return res.json({ success: false, message: "Failed to update user profile picture" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "An error occurred while updating user" });
    }
}

const resetProfileImage = async (req, res) => {
    const user = await userModel.findById(req.body.userId)

    if (!user) {
        return res.json({ success: false, message: "User not found" })
    }

    if (user.image !== "profile_icon.png") {
        fs.unlinkSync(`./uploads/${user.image}`, (err) => {
            if (err) {
                console.log(err)
                return res.json({ success: false, message: "Failed to update user profile picture" });
            }
        });
    }

    try {
        const updateResult = await userModel.findByIdAndUpdate(req.body.userId,
            { image: extractFileName(images.profile_icon) },
            { new: true }
        );

        if (updateResult) {
            return res.json({ success: true, message: "User profile picture has been updated" });
        } else {
            return res.json({ success: false, message: "Failed to update user profile picture" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "An error occurred while updating user" });
    }
}

// Get Stored Hashed Password
const getStoredHashedPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await userModel.findOne({ email: email })
        if (!user) {
            return res.json({ success: false, message: "This user does not exist" })
        }
        res.json({ success: true, data: user.password })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// Get username by token
const getUserNameByToken = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId })
        res.json({ success: true, data: user.name })
    } catch (error) {
        console.log(err)
        res.json({ success: false, message: "Error" })
    }
}

const getUserImageByToken = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId })
        res.json({ success: true, data: user.image })
    } catch (error) {
        console.log(err)
        res.json({ success: false, message: "Error" })
    }
}

const verifyToken = async (req, res) => {
    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: "Not Authorized. Please Login Again" });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        return res.json({ success: true, message: "Token is valid", data: tokenDecode });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: "Token has expired" });
        } else {
            return res.json({ success: false, message: "Invalid token" });
        }
    }
}


// Reset password
const forgotPassword = async (req, res) => {
    const { mail } = req.body;
    try {
        const oldUser = await userModel.findOne({ email: mail });
        if (!oldUser) {
            return res.json({ success: false, message: "User Not Exists!!" });
        }

        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.JWT_SECRET, {
            expiresIn: "10m",
        });
        const link = `${process.env.BASE_URL}/api/user/resetPassword/${oldUser._id}/${token}`;

        var transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        var mailOptions = {
            from: process.env.USER,
            to: mail,
            subject: 'Password Reset',
            text: link
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.json({ success: true, data: link })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
};

const verifyForgotPassword = async (req, res) => {
    const { id, token } = req.params
    const oldUser = await userModel.findOne({ _id: id });
    if (!oldUser) {
        return res.json({ success: false, message: "User Not Exists!!" });
    }

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET)

        res.render("index", { success: false, email: verify.email })
    } catch (error) {
        console.log("Error: ", error)
        res.json({ success: false, message: "Error" })
    }
}

const resetPassword = async (req, res) => {
    const { id, token } = req.params
    const { password } = req.body

    const oldUser = await userModel.findOne({ _id: id });
    if (!oldUser) {
        return res.json({ success: false, message: "User Not Exists!!" });
    }

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET)
        const hashPassword = await bcrypt.hash(password, 10)
        await userModel.updateOne(
            {
                _id: id
            },
            {
                $set: {
                    password: hashPassword,
                }
            }
        )
        res.render("index", { success: true, email: verify.email })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// Get admin
const getAdmin = async (req, res) => {
    try {
        const admin = await userModel.find({ role: "Admin" })
        res.json({ success: true, data: admin })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const checkAccount = async (email) => {
    if (!isValidEmail(email)) {
        return { success: false, message: "Email not valid" };
    }

    try {
        const user = await userModel.findOne({ email: email });

        if (user) {
            return { success: false, message: "Already have this user" };
        }

        return { success: true };
    } catch (error) {
        console.error('Error checking account:', error);
        return { success: false, message: "An error occurred" };
    }
};

const addNewAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    const accountCheckResult = await checkAccount(email);

    if (!accountCheckResult.success) {
        return res.json(accountCheckResult);
    }

    try {
        const newUser = new userModel({
            name: name,
            email: email,
            password: password,
            role: 'Admin',
            image: extractFileName(images.profile_icon),
            cartData: {}
        });

        const savedUser = await newUser.save();

        return res.json({ success: true, data: savedUser, message: "New admin added" });
    } catch (error) {
        console.error('Error adding new admin:', error);
        return res.json({ success: false, message: "An error occurred while adding a new user" });
    }
};

// Update admin
const updateAdmin = async (req, res) => {
    const { id, name, email, password } = req.body;

    if (!isValidEmail(email)) {
        return { success: false, message: "Email not valid" };
    }

    const user = await userModel.findOne({ email: email });
    if (user && user._id.toString() !== id) {
        return res.json({ success: false, message: "User with this email already exists" });
    }
    try {
        const updateResult = await userModel.updateOne(
            { _id: id },
            {
                $set: {
                    name: name,
                    email: email,
                    password: password
                }
            }
        );

        if (updateResult) {
            return res.json({ success: true, message: "Admin Updated" });
        } else {
            return res.json({ success: false, message: "Failed to update admin" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "An error occurred while updating user" });
    }
}

// Delete Admin
const deleteAdmin = async (req, res) => {
    const { id } = req.body;

    try {
        const user = await userModel.findById(id)

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        if (user.image !== "profile_icon.png") {
            fs.unlinkSync(`./uploads/${user.image}`, (err) => {
                if (err) {
                    console.log(err)
                    return res.json({ success: false, message: "Failed to update user profile picture" });
                }
            });
        }

        const deletedAdmin = await userModel.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        res.json({ success: true, message: "Admin Deleted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "An error occurred while deleting admin" });
    }
}

export { loginUser, registerUser, updateProfileImage, resetProfileImage, getAdmin, getStoredHashedPassword, getUserNameByToken, getUserImageByToken, verifyToken, forgotPassword, verifyForgotPassword, resetPassword, addNewAdmin, updateAdmin, deleteAdmin }