import React, { useState } from "react";
import "./Operating.css";

const Operating = () => {
  const [timeOperate, setTimeOperate] = useState("non-fixed");
  const [nonFixedTime, setNonFixedTime] = useState({
    start: "",
    end: "",
  });
  const [customTimes, setCustomTimes] = useState({
    morning: { start: "", end: "" },
    afternoon: { start: "", end: "" },
    evening: { start: "", end: "" },
  });
  const [closedPeriods, setClosedPeriods] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });
  const [errors, setErrors] = useState({
    morning: "",
    afternoon: "",
    evening: "",
  });

  const handleChange = (event) => {
    setTimeOperate(event.target.value);
  };

  function compareTimes(start, end) {
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    return startMinutes < endMinutes;
  }

  const handleNonFixedTimeChange = (event) => {
    const { name, value } = event.target;
    setNonFixedTime((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClosedPeriodChange = (event) => {
    const { name, checked } = event.target;
    setClosedPeriods((prevClosedPeriods) => ({
      ...prevClosedPeriods,
      [name]: checked,
    }));

    if (checked) {
      setCustomTimes((prevCustomTimes) => ({
        ...prevCustomTimes,
        [name]: { start: "", end: "" },
      }));
    }
  };

  const isValidTimeRange = (period, start, end) => {
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startInMinutes = timeToMinutes(start);
    const endInMinutes = timeToMinutes(end);

    if (period === "morning") {
      return (
        startInMinutes >= timeToMinutes("00:00") &&
        endInMinutes <= timeToMinutes("13:00") &&
        startInMinutes < endInMinutes
      );
    } else if (period === "afternoon") {
      return (
        startInMinutes >= timeToMinutes("13:01") &&
        endInMinutes <= timeToMinutes("18:00") &&
        startInMinutes < endInMinutes
      );
    } else if (period === "evening") {
      return (
        startInMinutes >= timeToMinutes("18:01") &&
        endInMinutes <= timeToMinutes("23:59") &&
        startInMinutes < endInMinutes
      );
    }
    return false;
  };

  const handleCustomTimeChange = (event) => {
    const { name, value, dataset } = event.target;
    const timeType = dataset.timeType;

    setCustomTimes((prevCustomTimes) => ({
      ...prevCustomTimes,
      [name]: {
        ...prevCustomTimes[name],
        [timeType]: value,
      },
    }));
  };

  const handleSave = () => {
    let newErrors = { morning: "", afternoon: "", evening: "" };
    let hasErrors = false;

    ["morning", "afternoon", "evening"].forEach((period) => {
      const { start, end } = customTimes[period];
      if (start && end) {
        if (!isValidTimeRange(period, start, end)) {
          newErrors[period] = `Invalid time range for ${period}.`;
          if (period === "morning") {
            newErrors[period] += ` Time must be between 12:00 AM to 1:00 PM.`;
          } else if (period === "afternoon") {
            newErrors[period] += ` Time must be between 1:01 PM to 6:00 PM.`;
          } else {
            newErrors[period] += ` Time must be between 6:01 PM to 11:59 PM.`;
          }
          hasErrors = true;
        } else if (!compareTimes(start, end)) {
          newErrors[
            period
          ] = `Start time must be smaller than end time for ${period}.`;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);

    if (hasErrors) return;

    const dataToSave = {
      timeOperate,
      nonFixedTime,
      customTimes,
      closedPeriods,
    };
    console.log("Data saved:", dataToSave);
  };

  const handleCustomReset = () => {
    setCustomTimes({
      morning: { start: "", end: "" },
      afternoon: { start: "", end: "" },
      evening: { start: "", end: "" },
    });
    setClosedPeriods({
      morning: false,
      afternoon: false,
      evening: false,
    });
    setErrors({
      morning: "",
      afternoon: "",
      evening: "",
    });
  };

  return (
    <div className="operating">
      <div className="operating-store-open">
        <p>How does the store time operate?</p>
        <select
          className="operating-select"
          value={timeOperate}
          onChange={handleChange}
        >
          <option value="non-fixed">Non-fixed</option>
          <option value="custom-morning-afternoon-evening">
            Custom: Morning, Afternoon, Evening
          </option>
        </select>
      </div>

      <div className="operating-store-time-operate">
        {timeOperate === "non-fixed" ? (
          <div>
            <label className="operating-label">
              Set operating time (0 to 24 hours):
            </label>
            <div className="non-fixed-start-end">
              <input
                type="time"
                name={"start"}
                className="operating-input-time"
                value={nonFixedTime.start}
                onChange={handleNonFixedTimeChange}
              />
              <input
                type="time"
                name={"end"}
                className="operating-input-time"
                value={nonFixedTime.end}
                onChange={handleNonFixedTimeChange}
              />
            </div>
            <button
              type="button"
              className="operating-reset-button"
              onClick={() => setNonFixedTime({ start: "", end: "" })}
            >
              Reset
            </button>
          </div>
        ) : (
          <div>
            {["morning", "afternoon", "evening"].map((period) => (
              <div key={period}>
                <label className="operating-label">
                  {period.charAt(0).toUpperCase() + period.slice(1)}:
                </label>
                <input
                  type="time"
                  name={period}
                  className="operating-input-time"
                  data-time-type="start"
                  value={customTimes[period].start}
                  onChange={handleCustomTimeChange}
                  disabled={closedPeriods[period]}
                />
                <input
                  type="time"
                  name={period}
                  className="operating-input-time"
                  data-time-type="end"
                  value={customTimes[period].end}
                  onChange={handleCustomTimeChange}
                  disabled={closedPeriods[period]}
                />
                {errors[period] && (
                  <p className="operating-error">{errors[period]}</p>
                )}
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    name={period}
                    class="checkbox-input"
                    checked={closedPeriods[period]}
                    onChange={handleClosedPeriodChange}
                  />
                  Closed {period.charAt(0).toUpperCase() + period.slice(1)}
                </label>
              </div>
            ))}
            <button
              className="operating-reset-button reset-custom-times"
              onClick={handleCustomReset}
            >
              Reset Custom Times
            </button>
          </div>
        )}
      </div>

      <div className="operating-save">
        <button className="operating-save-button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Operating;
