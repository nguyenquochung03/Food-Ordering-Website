import express from "express";
import {
  addFood,
  filterFoodByPrice,
  filterFoodByPriceAndRating,
  filterFoodByRating,
  getCategoryCounts,
  getFoodById,
  getFoodByName,
  getFoodByNameForUser,
  getFoodByNameForUserCanNull,
  listFood,
  removeFood,
  updateFood,
  updateStatus,
} from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/update", upload.single("image"), updateFood);
foodRouter.post("/updateStatus", updateStatus);
foodRouter.get("/getFoodByName", getFoodByName);
foodRouter.get("/getFoodById", getFoodById);
foodRouter.get("/getCategoryCounts", getCategoryCounts);
foodRouter.get("/getFoodByNameForUser", getFoodByNameForUser);
foodRouter.get("/getFoodByNameForUserCanNull", getFoodByNameForUserCanNull);
foodRouter.get("/filterFoodByPrice", filterFoodByPrice);
foodRouter.get("/filterFoodByRating", filterFoodByRating);
foodRouter.get("/filterFoodByPriceAndRating", filterFoodByPriceAndRating);

export default foodRouter;
