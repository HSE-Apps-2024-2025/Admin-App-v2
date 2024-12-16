import React, { useState, useEffect } from "react";


const EventEditor = ({selectedDate}) => {
    const [eventStartDate, setEventStartDate] = useState(null);
  const [eventEndDate, setEventEndDate] = useState(null);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState(null);
  const [name, setName] = useState(null);
  const [id , setId] = useState(null);
  const [allDay, setAllDay] = useState(false);

  const [loading, setLoading] = useState(true);


  const addEvent = () => {
    console.log(selectedDate);
    fetch('/api/schedule/events2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        category: category,
        description: description,
        date: selectedDate,
        _id: id,
        allDay: allDay,
        startTime : eventStartDate,
        endTime : eventEndDate
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Event added:', data);
      })
      .catch((error) => {
        alert('Error adding event:', error);
      });
  };

  useEffect(() => {
    console.log('Selected date:', selectedDate);

  }, [selectedDate]);

  return (
    <div className="event-section">
        <h2>Add Event</h2>
        <div className="time-picker">
          <label>
              All Day:
              <input type="checkbox" onChange={(e) => { if (e.target.checked) { setEventStartDate(new Date(selectedDate).setHours(0,0,0,0)); setEventEndDate(new Date(selectedDate).setHours(23,59,59,999))}; setAllDay(e.target.checked) }} />
          </label>
          { allDay ? null : (
            <>
            <label>
              Start Time:
              <input type="time" onChange={(e) => setEventStartDate(`${selectedDate.toISOString().split('T')[0]}T${e.target.value}:00.000Z`)} />
            </label>
            <label>
              End Time:
              <input type="time" onChange={(e) => setEventEndDate(`${selectedDate.toISOString().split('T')[0]}T${e.target.value}:00.000Z`)} />
            </label>
            </>
          )}
        </div>
          <label>
            Category:
            <select onChange={(e) => setCategory(e.target.value)} value={category ?? "" }>
              <option value="School Event">School Event</option>
              <option value="Holiday">Holiday</option>
              <option value="Special Schedule">Special Schedule</option>
            </select>
          </label>
          <label>
            Name:
            <input type="text" onChange={ (e) => setName(e.target.value)}  value={name ?? ""} />
          </label>
          <label>
            Description:
            <textarea onChange={(e) => setDescription(e.target.value)} value={description ?? ""}/>
          </label>
          <button onClick={(e) => addEvent(e.target.value)}>Add Event</button>
      </div>
  );
};

export default EventEditor;