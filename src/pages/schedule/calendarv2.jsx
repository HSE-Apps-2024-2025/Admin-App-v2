import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ReactLoading from 'react-loading';

import { DatePicker } from 'antd';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import EventEditor from './calendarv2/eventEditor';
import CategoryEditor from './calendarv2/categoryEditor';

const Calendarv2 = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Store the colored days as an array of date strings
  const [coloredDates, setColoredDates] = useState( [
    new Date(2024, 11, 5).toDateString(),  // December 5, 2024
    new Date(2024, 11, 10).toDateString(), // December 10, 2024
    new Date(2024, 11, 15).toDateString(), // December 15, 2024
    new Date(2024, 11, 20).toDateString(), // December 20, 2024
    new Date(2024, 11, 25).toDateString(), // December 25, 2024 
    ]);

  const [dates, setDates] = useState([]);

  useEffect(() => {
    fetch('/api/schedule/dates', { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setDates(data.dates);
        console.log(data.dates);
      })
      .catch(error => {
        console.error('Error fetching dates:', error);
      });
  }, []);

  useEffect(() => {
    console.log('Selected Date:', selectedDate);
  }, [selectedDate]);

  // Function to handle right-click events and color the clicked date
  const handleRightClick = (event, date) => {
    event.preventDefault(); // Prevent the default right-click menu

    // Convert the date to a string for easy comparison
    const dateStr = date.toDateString();

    // Add or remove the date from the colored dates list
    setColoredDates((prevColoredDates) => {
      if (prevColoredDates.includes(dateStr)) {
        // If the date is already colored, remove it
        return prevColoredDates.filter(d => d !== dateStr);
      } else {
        // Otherwise, add the date to the colored list
        return [...prevColoredDates, dateStr];
      }
    });
  };

  // Custom tile content renderer for the calendar
  const tileClassName = ({ date, view }) => {
    // If the date is in the colored dates list, return a class to style it
    if (coloredDates.includes(date.toDateString())) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
  
        <div
          style={{
            backgroundColor: '#ffcc00',  // Yellow background
            color: 'white',               // White text
            borderRadius: '50%',          // Optional: rounded background
            fontWeight: 'bold', 
            width : '50%',               // Optional: bold text
            height: '100%',               // Ensure the content covers the entire tile
            display: 'flex',              // Center the content
            justifyContent: 'center',     // Center horizontally
            alignItems: 'center',         // Center vertically
          }}

        >
          &nbsp;
          </div>
      </div>
      );
    }
    return '';
  };

  return (
    <div>
      <h1>
        <a href="mailto:patchjoh000@hsestudents.org?subject=Schedule%20Feedback">Feedback?</a> email patchjoh000@hsestudents.org to send feedback
      </h1>
      <div className="calendar-section">
        <h2>Academic Calendar</h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          onClickDay={setSelectedDate} // Click to select a date
          tileContent={tileClassName} // Use the custom tile renderer
          onMouseDown={(event, date) => {
            if (event.button === 2) {  // Right-click (button 2)
              handleRightClick(event, date);
            }
          }}
        />
      </div>
      
      
      {/* Optionally, show the colored dates */}
      <div>
        <h3>Colored Dates:</h3>
        <ul>
          {coloredDates.map((date, index) => (
            <li key={index}>{date}</li>
          ))}
        </ul>
      </div>
      {/* <CategoryEditor /> */}
      {/* <EventEditor selectedDate={selectedDate} /> */}
    </div>
  );


};

export default Calendarv2;
