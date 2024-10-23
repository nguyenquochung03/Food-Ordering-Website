import operatingModel from "../models/operatingModel.js";

const saveOperatingData = async (req, res) => {
  const { data } = req.body;
  try {
    const existingOperatingData = await operatingModel.findOne();

    if (existingOperatingData) {
      existingOperatingData.timeOperate = data.timeOperate;
      existingOperatingData.nonFixedTime = data.nonFixedTime;
      existingOperatingData.customTimes = data.customTimes;
      existingOperatingData.closedPeriods = data.closedPeriods;

      const updatedData = await existingOperatingData.save();
      res.json({ success: true, data: updatedData });
    } else {
      const operatingData = new operatingModel({
        timeOperate: data.timeOperate,
        nonFixedTime: data.nonFixedTime,
        customTimes: data.customTimes,
        closedPeriods: data.closedPeriods,
      });

      const savedData = await operatingData.save();
      res.json({ success: true, data: savedData });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res.json({ success: false, message: "Error saving data" });
  }
};

const getOperatingData = async (req, res) => {
  try {
    const operatingData = await operatingModel.findOne();

    if (!operatingData) {
      return res.json({
        success: false,
        message: "No operating data found",
      });
    }

    res.json({
      success: true,
      data: operatingData,
    });
  } catch (error) {
    console.error("Error fetching operating data:", error);
    res.json({
      success: false,
      message: "Server error while fetching operating data",
    });
  }
};

export { saveOperatingData, getOperatingData };
