import mongoose from "mongoose";

const operatingSchema = new mongoose.Schema({
  timeOperate: {
    type: String,
    required: true,
    enum: ["non-fixed", "custom-morning-afternoon-evening"],
  },
  nonFixedTime: {
    start: { type: String, default: "" },
    end: { type: String, default: "" },
  },
  customTimes: {
    morning: {
      start: { type: String, default: "" },
      end: { type: String, default: "" },
    },
    afternoon: {
      start: { type: String, default: "" },
      end: { type: String, default: "" },
    },
    evening: {
      start: { type: String, default: "" },
      end: { type: String, default: "" },
    },
  },
  closedPeriods: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
  },
});

const operatingModel =
  mongoose.models.operating || mongoose.model("operating", operatingSchema);

export default operatingModel;
