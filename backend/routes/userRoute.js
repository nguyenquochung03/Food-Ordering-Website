import express from "express";
import multer from "multer";
import {
  getUserNameByToken,
  loginUser,
  registerUser,
  forgotPassword,
  verifyToken,
  resetPassword,
  verifyForgotPassword,
  getAdmin,
  addNewAdmin,
  updateAdmin,
  deleteAdmin,
  getStoredHashedPassword,
  getUserImageByToken,
  updateProfileImage,
  resetProfileImage,
  lockOrUnlockAdmin,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post(
  "/updateAvartar",
  upload.single("image"),
  authMiddleware,
  updateProfileImage
);
userRouter.post("/resetAvartar", authMiddleware, resetProfileImage);
userRouter.get("/admin", getAdmin);
userRouter.post("/userName", authMiddleware, getUserNameByToken);
userRouter.post("/userImage", authMiddleware, getUserImageByToken);
userRouter.post("/verifyToken", authMiddleware, verifyToken);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.get("/resetPassword/:id/:token", verifyForgotPassword);
userRouter.post("/resetPassword/:id/:token", resetPassword);
userRouter.post("/addAdmin", addNewAdmin);
userRouter.post("/updateAdmin", updateAdmin);
userRouter.post("/deleteAdmin", deleteAdmin);
userRouter.post("/lockOrUnlockAdmin", lockOrUnlockAdmin);
userRouter.post("/getStoredHashedPassword", getStoredHashedPassword);

export default userRouter;
