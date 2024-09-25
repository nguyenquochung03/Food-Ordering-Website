import mongoose from "mongoose";
import foodModel from "../models/foodModel.js";
import fs from "fs";
import commentModel from "../models/commentModel.js";

// add food item
const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const listFood = async (req, res) => {
  try {
    const userRole = req.query.userRole;
    let foods;

    if (userRole === "admin") {
      foods = await foodModel.find({});
    } else {
      foods = await foodModel.find({
        $or: [{ status: "serving" }, { status: { $exists: false } }],
      });
    }

    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const getFoodByName = async (req, res) => {
  try {
    const { name } = req.query;
    const food = await foodModel.find({
      name: { $regex: new RegExp(name, "i") },
    });

    if (food.length > 0) {
      res.json({ success: true, count: food.length, data: food });
    } else {
      res.json({ success: false, message: "Food not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "An error occurred while fetching data",
    });
  }
};

export const getFoodByNameForUser = async (req, res) => {
  try {
    const { name } = req.query;

    const food = await foodModel.find({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      $or: [{ status: "serving" }, { status: { $exists: false } }],
    });

    if (food.length > 0) {
      res.json({ success: true, count: food.length, data: food });
    } else {
      res.json({ success: false, message: "Food not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "An error occurred while fetching data",
    });
  }
};

export const getFoodByNameForUserCanNull = async (req, res) => {
  try {
    const { name } = req.query;

    const food = await foodModel.find({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      $or: [{ status: "serving" }, { status: { $exists: false } }],
    });

    if (food.length > 0) {
      res.json({ success: true, data: food });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      data: null,
      message: "An error occurred while fetching data",
    });
  }
};

const getFoodById = async (req, res) => {
  try {
    const { id } = req.query;

    const food = await foodModel.findById(id);

    if (food) {
      res.json({ success: true, data: food });
    } else {
      res.json({ success: false, message: "Food not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "An error occurred while fetching data",
    });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// update food item
const updateFood = async (req, res) => {
  try {
    let updatedFood;
    const id = req.body.id;

    if (req.body.isChangeImage === "true") {
      const food = await foodModel.findById(id);
      fs.unlink(`uploads/${food.image}`, () => {});

      updatedFood = await foodModel.findByIdAndUpdate(id, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: req.file.filename,
      });
    }
    if (req.body.isChangeImage === "false") {
      updatedFood = await foodModel.findByIdAndUpdate(id, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: req.image,
      });
    }

    if (updatedFood) {
      res.json({ success: true, message: "Food Updated" });
    } else {
      res.json({ success: false, message: "Food not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const getCategoryCounts = async (req, res) => {
  try {
    const categoryCounts = await foodModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ]);

    res.json({ success: true, data: categoryCounts });
  } catch (error) {
    console.error("Error fetching category counts:", error);
    res.json({ success: false, message: "Error" });
  }
};

export const filterFoodByPrice = async (req, res) => {
  const { minPrice, maxPrice, foodList, sortBy } = req.query;

  try {
    let foods;
    const sortOrder = sortBy === "asc" ? 1 : -1;

    const filterConditions = {
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
      $or: [{ status: "serving" }, { status: { $exists: false } }],
    };

    if (foodList && foodList.length > 0) {
      foods = await foodModel
        .find({
          ...filterConditions,
          _id: { $in: foodList },
        })
        .sort({ price: sortOrder });
    } else {
      foods = await foodModel.find(filterConditions).sort({ price: sortOrder });
    }

    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error filtering foods by price:", error);
    res.json({ success: false, message: "Error filtering foods by price" });
  }
};

export const filterFoodByRating = async (req, res) => {
  const { rating, foodList, sortBy } = req.query;

  try {
    let match = {};

    if (foodList && foodList.length > 0) {
      const foodIds = foodList.map((id) => new mongoose.Types.ObjectId(id));
      match = { _id: { $in: foodIds } };
    }

    const filteredFoods = await foodModel.aggregate([
      {
        $match: {
          $or: [{ status: "serving" }, { status: { $exists: false } }],
          ...match,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "food",
          as: "comments",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          category: 1,
          comments: 1,
          averageRating: {
            $cond: {
              if: { $eq: [{ $size: "$comments" }, 0] },
              then: 5,
              else: {
                $avg: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$comments",
                        as: "comment",
                        cond: { $eq: ["$$comment.parentId", "none"] },
                      },
                    },
                    as: "filteredComment",
                    in: "$$filteredComment.rating",
                  },
                },
              },
            },
          },
        },
      },
      {
        $match: {
          averageRating: { $gte: parseFloat(rating) },
        },
      },
      {
        $sort: {
          averageRating: sortBy === "asc" ? 1 : -1,
        },
      },
    ]);

    res.json({ success: true, data: filteredFoods });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.json({ success: false, message: "Error calculating average rating" });
  }
};

export const filterFoodByPriceAndRating = async (req, res) => {
  const { minPrice, maxPrice, rating, foodList, sortByPrice, sortByRating } =
    req.query;

  try {
    let priceFilter = {};
    let match = {};

    if (foodList && foodList.length > 0) {
      const foodIds = foodList.map((id) => new mongoose.Types.ObjectId(id));
      match = { _id: { $in: foodIds } };
    }

    if (minPrice && maxPrice) {
      priceFilter = {
        price: {
          $gte: parseFloat(minPrice),
          $lte: parseFloat(maxPrice),
        },
      };
    }

    match = { ...match, ...priceFilter };

    const filteredFoods = await foodModel.aggregate([
      {
        $match: {
          $or: [{ status: "serving" }, { status: { $exists: false } }],
          ...match,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "food",
          as: "comments",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          category: 1,
          comments: 1,
          averageRating: {
            $cond: {
              if: { $eq: [{ $size: "$comments" }, 0] },
              then: 5,
              else: {
                $avg: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$comments",
                        as: "comment",
                        cond: { $eq: ["$$comment.parentId", "none"] },
                      },
                    },
                    as: "filteredComment",
                    in: "$$filteredComment.rating",
                  },
                },
              },
            },
          },
        },
      },
      {
        $match: {
          averageRating: { $gte: parseFloat(rating) },
        },
      },
      {
        $sort: {
          price: 1,
          averageRating: -1,
        },
      },
    ]);

    res.json({ success: true, data: filteredFoods });
  } catch (error) {
    console.error("Error filtering foods by price and rating:", error);
    res.json({
      success: false,
      message: "Error filtering foods by price and rating",
    });
  }
};

const updateStatus = async (req, res) => {
  const { id, status } = req.body;
  console.log(id, status);
  try {
    const updatedFood = await foodModel.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedFood) {
      return res.json({ success: false, message: "Food not found" });
    }
    return res.json({
      success: true,
      message: "Status updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "An error occurred while updating status",
    });
  }
};

export {
  addFood,
  listFood,
  removeFood,
  updateFood,
  getFoodByName,
  getFoodById,
  getCategoryCounts,
  updateStatus,
};
