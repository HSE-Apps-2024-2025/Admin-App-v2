import React, { useState, useEffect } from 'react';


export default function CalendarMaker() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

return (
    <div className="date-selection">
      <h2>Select Academic Calendar Bounds</h2>
      <DatePicker
        placeholder="Start Date"
        onChange={(date, dateString) => setStartDate(dateString)}
        />
      <DatePicker
        placeholder="End Date"
        onChange={(date, dateString) => setEndDate(dateString)}
      />
    </div>
  );
}
