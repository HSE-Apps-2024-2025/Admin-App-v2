import React, { useEffect, useState } from "react";
import Head from "next/head";

import ReactLoading from "react-loading";

export default function MainSchedule() {
  const [mainSchedules, setMainSchedules] = useState(null);

  useEffect(() => {
    fetch("/api/schedule").then((res) =>
      res.json().then((data) => {
        setMainSchedules(data);
      })
    );
  }, []);

  /**
   * Saves the main schedules by sending a PUT request to the backend.
   * Alerts the user if the schedule has been saved successfully.
   * @param {Event} e - The submit event triggered by the form.
   */
  const handleSave = (e) => {
    e.preventDefault();
    fetch("/api/schedule", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mainSchedules),
    }).then((res) => {
      if (res.status == 200) {
        alert("Schedule Successfully Saved!");
      }
    });
  };

  /**
   * Resets the schedule cache by sending a request to the backend.
   * Alerts the user if the schedule cache has been reset successfully.
   * @param {Event} e - The submit event triggered by the form.
   */
  const handleReset = (e) => {
    e.preventDefault();
    fetch("/api/schedule/cache").then((res) => {
      if (res.status == 200) {
        alert("Schedule Cache Reset!");
      }
    });
  };

  /**
   * Updates the period data in the main schedules state when an input field is changed.
   * @param {Event} e - The change event triggered by the form input.
   * @param {number} index - The index of the schedule in the main schedules state.
   * @param {number} periodIndex - The index of the period in the schedule data.
   */
  const onPeriodChange = (e, index, periodIndex) => {
    setMainSchedules((prev) => {
      const newSchedules = [...prev];
      newSchedules[index].data[periodIndex][e.target.id] = e.target.value;
      return newSchedules;
    });
  };

  /**
   * Updates the lunch period data in the main schedules state when an input field is changed.
   * @param {Event} e - The change event triggered by the form input.
   * @param {number} index - The index of the schedule in the main schedules state.
   * @param {number} periodIndex - The index of the period in the schedule data.
   * @param {string} lunchType - The type of lunch period (e.g., "firstLunch", "secondLunch").
   */
  const onLunchPeriodChange = (e, index, periodIndex, lunchType) => {
    setMainSchedules((prev) => {
      const newSchedules = [...prev];
      newSchedules[index].data[periodIndex].lunchPeriods[lunchType][
        e.target.id
      ] = e.target.value;
      return newSchedules;
    });
  };

  if (!mainSchedules) {
    return (
      <div className="flex w-full h-100vh items-center justify-center">
        <ReactLoading type="spin" color="#101010" />
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>Main Schedule</title>
      </Head>
      <div className="flex w-full flex-nowrap justify-around mb-8">
        {mainSchedules.map((schedule, index) => (
          <div key={schedule._id} className="flex flex-col">
            <h1 className="font-semibold text-xl text-center">
              {schedule.Type}
            </h1>
            {schedule.data.map((period, periodIndex) => (
              <>
                <h1 className="text-lg text-blue-600 mt-2 mb-1">
                  {period.periodName}
                </h1>
                <div className="flex items-center justify-between gap-x-3">
                  <input
                    type="text"
                    className="w-[5rem] border-slate-500 border-2 rounded-lg p-1"
                    id="startTime"
                    value={period.startTime}
                    onChange={(e) => {
                      onPeriodChange(e, index, periodIndex);
                    }}
                  />
                  <h1>-</h1>
                  <input
                    type="text"
                    className="w-[5rem] border-slate-500 border-2 rounded-lg p-1"
                    id="endTime"
                    value={period.endTime}
                    onChange={(e) => {
                      onPeriodChange(e, index, periodIndex);
                    }}
                  />
                </div>
                {period.lunchPeriods &&
                  Object.keys(period.lunchPeriods).map((lunchType) => (
                    <div key={lunchType} className="ml-5">
                      <h1 className="text-lg text-blue-400 mt-2 mb-1">
                        {lunchType} Lunch
                      </h1>
                      <div className="flex items-center justify-between gap-x-3">
                        <input
                          type="text"
                          className="w-[5rem] border-slate-500 border-2 rounded-lg p-1"
                          id="startTime"
                          value={period.lunchPeriods[lunchType].startTime}
                          onChange={(e) => {
                            onLunchPeriodChange(
                              e,
                              index,
                              periodIndex,
                              lunchType
                            );
                          }}
                        />
                        <h1>-</h1>
                        <input
                          type="text"
                          className="w-[5rem] border-slate-500 border-2 rounded-lg p-1"
                          id="endTime"
                          value={period.lunchPeriods[lunchType].endTime}
                          onChange={(e) => {
                            onLunchPeriodChange(
                              e,
                              index,
                              periodIndex,
                              lunchType
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </>
            ))}
          </div>
        ))}
      </div>
      <div className="fixed right-8 bottom-8">
        <button
          className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg mr-2"
          onClick={handleReset}
        >
          Swap Days
        </button>
        <button
          className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </>
  );
}
