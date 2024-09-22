import commentModel from "../models/commentModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import User from "../models/userModel.js";
import Food from "../models/foodModel.js";

import mongoose from "mongoose";
import moment from "moment";

const userModelSchema = User.schema;
mongoose.model("User", userModelSchema);

const foodModelSchema = Food.schema;
mongoose.model("Food", foodModelSchema);

export const getCommentsSorted = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year || month < 1 || month > 12 || year < 1) {
      return res.json({ success: false, message: "Invalid month or year" });
    }

    const startDate = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .startOf("month")
      .toDate();
    const endDate = moment(startDate).endOf("month").toDate();

    const comments = await commentModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate("user", "name image date role")
      .populate("food", "name image")
      .sort({
        likes: -1,
        createdAt: -1,
      })
      .exec();

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.json({ success: false, message: "Error fetching comments" });
  }
};

const getComment = async (req, res) => {
  const { foodId } = req.query;

  try {
    const comments = await commentModel
      .find({ food: foodId })
      .populate("user", "name image role")
      .populate("food");

    if (comments.length === 0) {
      return res.json({
        success: true,
        message: "No comments found for this foodId",
        data: [],
      });
    }

    return res.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error finding comments by foodId:", error);
    return res.json({ success: false, message: "Error" });
  }
};

const isUserLikeComment = async (req, res) => {
  const { commentId, userId } = req.body;

  try {
    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.json({ success: false, message: "No comment found" });
    }

    const isLiked = comment.likes.includes(userId);

    return res.json({ success: true, isLiked: isLiked });
  } catch (error) {
    console.error("Error:", error);
    return res.json({ success: false, message: "Error" });
  }
};

const likeComment = async (req, res) => {
  const { commentId, userId } = req.body;

  try {
    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!updatedComment) {
      return res.json({ success: false, message: "No comment found" });
    }

    return res.json({ success: true, data: updatedComment });
  } catch (error) {
    console.error("Error:", error);
    return res.json({ success: false, message: "Error updating likes" });
  }
};

const unlikeComment = async (req, res) => {
  const { commentId, userId } = req.body;

  try {
    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!updatedComment) {
      return res.json({ success: false, message: "No comment found" });
    }

    return res.json({ success: true, data: updatedComment });
  } catch (error) {
    console.error("Error:", error);
    return res.json({ success: false, message: "Error removing like" });
  }
};

const checkCommentOwnership = async (req, res) => {
  const { commentId, userId } = req.body;

  try {
    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.json({ success: false, message: "No comment found" });
    }

    const isOwner = comment.user.toString() === userId.toString();

    return res.json({ success: true, isOwner: isOwner });
  } catch (error) {
    console.error("Error:", error);
    return res.json({ success: false, message: "Error checking ownership" });
  }
};

const addComment = async (req, res) => {
  const { describe, rating, foodId } = req.body;

  try {
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    const comment = new commentModel({
      describe: describe,
      rating: rating,
      food: foodId,
      user: req.body.userId,
    });

    const savedComment = await comment.save();

    await userModel.findByIdAndUpdate(req.body.userId, {
      $push: { comments: savedComment._id },
    });
    await foodModel.findByIdAndUpdate(foodId, {
      $push: { comments: savedComment._id },
    });

    return res.json({ success: true, data: { comment: savedComment } });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.json({ success: false, message: "Error adding comment" });
  }
};

const replyComment = async (req, res) => {
  const { describe, foodId, parentId } = req.body;

  try {
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    const comment = new commentModel({
      describe: describe,
      food: foodId,
      user: req.body.userId,
      parentId: parentId,
    });

    const savedComment = await comment.save();

    await userModel.findByIdAndUpdate(req.body.userId, {
      $push: { comments: savedComment._id },
    });
    await foodModel.findByIdAndUpdate(foodId, {
      $push: { comments: savedComment._id },
    });

    return res.json({ success: true, data: { comment: savedComment } });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.json({ success: false, message: "Error adding comment" });
  }
};

const deleteCommentAndReplies = async (req, res) => {
  const { commentId } = req.body;

  try {
    const deletedComment = await commentModel.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.json({ success: false, message: "Comment not found" });
    }

    await commentModel.deleteMany({ parentId: commentId });

    return res.json({
      success: true,
      message: "Comment and its replies were deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment and its replies:", error);
    return res.json({
      success: false,
      message: "An error occurred while deleting the comment",
    });
  }
};

const editComment = async (req, res) => {
  const { commentId, describe } = req.body;

  try {
    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.json({ success: false, message: "Comment not found" });
    }

    comment.editCount += 1;

    comment.describe += `\nEditing ${comment.editCount}: ${describe}`;

    const commentEdited = await comment.save();

    return res.json({ success: true, data: { comment: commentEdited } });
  } catch (error) {
    console.error("Error editing comment:", error);
    return res.json({ success: false, message: "Error editing comment" });
  }
};

export const getWeeklyHighRatingCommentTotals = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year || month < 1 || month > 12 || year < 1) {
    return res.json({ success: false, message: "Invalid month or year" });
  }

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyTotals = daysOfWeek.map((day) => ({ day, total: 0 }));

  try {
    const startOfMonth = moment(`${year}-${month}`, "YYYY-MM")
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}`, "YYYY-MM")
      .endOf("month")
      .toDate();

    if (isNaN(startOfMonth.getTime()) || isNaN(endOfMonth.getTime())) {
      return res.json({ success: false, message: "Invalid date format" });
    }

    const comments = await commentModel.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      rating: { $gt: 3 },
    });

    comments.forEach((comment) => {
      const dayOfWeek = comment.createdAt.getUTCDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weeklyTotals[adjustedDay].total += 1;
    });

    res.json({ success: true, data: weeklyTotals });
  } catch (error) {
    console.error("Error getting weekly high rating comment totals:", error);
    res.json({
      success: false,
      message: "Failed to get weekly high rating comment totals",
    });
  }
};

export const getWeeklyLowRatingCommentTotals = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year || month < 1 || month > 12 || year < 1) {
    return res.json({ success: false, message: "Invalid month or year" });
  }

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyTotals = daysOfWeek.map((day) => ({ day, total: 0 }));

  try {
    const startOfMonth = moment(`${year}-${month}`, "YYYY-MM")
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}`, "YYYY-MM")
      .endOf("month")
      .toDate();

    if (isNaN(startOfMonth.getTime()) || isNaN(endOfMonth.getTime())) {
      return res.json({ success: false, message: "Invalid date format" });
    }

    const comments = await commentModel.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      rating: { $lte: 3 },
    });

    comments.forEach((comment) => {
      const dayOfWeek = comment.createdAt.getUTCDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weeklyTotals[adjustedDay].total += 1;
    });

    res.json({ success: true, data: weeklyTotals });
  } catch (error) {
    console.error("Error getting weekly low rating comment totals:", error);
    res.json({
      success: false,
      message: "Failed to get weekly low rating comment totals",
    });
  }
};

export const getHighRatingCommentTotals = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year || month < 1 || month > 12 || year < 1) {
    return res.json({ success: false, message: "Invalid month or year" });
  }

  try {
    const startOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .endOf("month")
      .toDate();

    const startOfPreviousMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .subtract(1, "months")
      .startOf("month")
      .toDate();
    const endOfPreviousMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .subtract(1, "months")
      .endOf("month")
      .toDate();

    const currentMonthHighRatingCount = await commentModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      rating: { $gt: 3 },
    });

    const previousMonthHighRatingCount = await commentModel.countDocuments({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      rating: { $gt: 3 },
    });

    res.json({
      success: true,
      data: {
        currentMonthHighRatingCount,
        previousMonthHighRatingCount,
      },
    });
  } catch (error) {
    console.error("Error getting high rating comment totals:", error);
    res.json({
      success: false,
      message: "Failed to get high rating comment totals",
    });
  }
};

export const getLowRatingCommentTotals = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year || month < 1 || month > 12 || year < 1) {
    return res.json({ success: false, message: "Invalid month or year" });
  }

  try {
    const startOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .endOf("month")
      .toDate();

    const startOfPreviousMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .subtract(1, "months")
      .startOf("month")
      .toDate();
    const endOfPreviousMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .subtract(1, "months")
      .endOf("month")
      .toDate();

    const currentMonthLowRatingCount = await commentModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      rating: { $lte: 3 },
    });

    const previousMonthLowRatingCount = await commentModel.countDocuments({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      rating: { $lte: 3 },
    });

    res.json({
      success: true,
      data: {
        currentMonthLowRatingCount,
        previousMonthLowRatingCount,
      },
    });
  } catch (error) {
    console.error("Error getting low rating comment totals:", error);
    res.json({
      success: false,
      message: "Failed to get low rating comment totals",
    });
  }
};

export {
  getComment,
  isUserLikeComment,
  likeComment,
  checkCommentOwnership,
  addComment,
  unlikeComment,
  replyComment,
  deleteCommentAndReplies,
  editComment,
};
