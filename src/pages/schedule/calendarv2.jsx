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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(null);
  
  // Replace coloredDates with datesWithEvents to store date -> categories mapping
  const [datesWithEvents, setDatesWithEvents] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);

  // Fetch categories first
  useEffect(() => {
    fetch('/api/schedule/categories', { 
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        console.log('Categories loaded:', data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  // Fetch colored dates (dates with events)
  useEffect(() => {
    setLoading(true);
    fetch('/api/schedule/events2?getColoredDates=true', { 
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        // Transform the data into a more usable format: { 'YYYY-MM-DD': [categoryIds] }
        const dateMap = {};
        data.forEach(item => {
          if (item.date && item.categories) {
            dateMap[item.date] = item.categories;
          }
        });
        setDatesWithEvents(dateMap);
        setLoading(false);
        console.log('Dates with events:', dateMap);
      })
      .catch(error => {
        console.error('Error fetching dates with events:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('/api/schedule/events2', { 
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        setDates(data);
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching dates:', error);
      });
  }, []);

  useEffect(() => {
    console.log('Selected Date:', selectedDate);
  }, [selectedDate]);

  // Get category color by ID
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color || '#ffcc00' : '#ffcc00'; // Default to yellow if not found
  };

  // Custom tile content renderer for the calendar
  const tileStyler = ({ date, view }) => {
    if (view !== 'month') return null;
    
    // Format date as YYYY-MM-DD to match our keys
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this date has events
    if (datesWithEvents[dateStr] && datesWithEvents[dateStr].length > 0) {
      const categoryIds = datesWithEvents[dateStr];
      
      // If there's only one category, show a single color
      if (categoryIds.length === 1) {
        const color = getCategoryColor(categoryIds[0]);
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                backgroundColor: color,
                color: 'white',
                borderRadius: '50%',
                fontWeight: 'bold', 
                width: '50%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              &nbsp;
            </div>
          </div>
        );
      } 
      // For multiple categories, divide the circle into sections
      else {
        const segments = categoryIds.length;
        const segmentSize = 100 / segments;
        
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            height: '100%' 
          }}>
            <div style={{ 
              width: '50%', 
              height: '0',
              paddingBottom: '50%', 
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {segments > 5 ? (
                // If more than 5 categories, just use the first color
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: getCategoryColor(categoryIds[0])
                  }}
                />
              ) : segments === 2 ? (
                // For two categories, create simple halves
                categoryIds.map((catId, index) => (
                  <div 
                    key={index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: index === 0 ? 0 : '50%',
                      width: '50%',
                      height: '100%',
                      backgroundColor: getCategoryColor(catId)
                    }}
                  />
                ))
              ) : segments === 3 ? (
                // For three categories
                categoryIds.map((catId, index) => (
                  <div 
                    key={index}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundColor: getCategoryColor(catId),
                      clipPath: index === 0 
                        ? 'polygon(0 0, 100% 0, 50% 100%)'
                        : index === 1
                          ? 'polygon(0 0, 50% 100%, 0 100%)'
                          : 'polygon(100% 0, 100% 100%, 50% 100%)'
                    }}
                  />
                ))
              ) : segments === 4 ? (
                // For four categories, create quarters
                categoryIds.map((catId, index) => (
                  <div 
                    key={index}
                    style={{
                      position: 'absolute',
                      width: '50%',
                      height: '50%',
                      top: index < 2 ? 0 : '50%',
                      left: index % 2 === 0 ? 0 : '50%',
                      backgroundColor: getCategoryColor(catId)
                    }}
                  />
                ))
              ) : (
                // For five categories
                categoryIds.map((catId, index) => (
                  <div 
                    key={index}
                    style={{
                      position: 'absolute',
                      backgroundColor: getCategoryColor(catId),
                      ...(index === 0 
                        ? { top: 0, left: 0, width: '50%', height: '50%' } 
                        : index === 1 
                          ? { top: 0, right: 0, width: '50%', height: '50%' }
                          : index === 2
                            ? { bottom: 0, left: 0, width: '50%', height: '50%' }
                            : index === 3
                              ? { bottom: 0, right: 0, width: '33.33%', height: '50%' }
                              : { bottom: 0, right: '33.33%', width: '33.33%', height: '50%' }
                      )
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div>
      <h1>
        <a href="mailto:patchjoh000@hsestudents.org?subject=Schedule%20Feedback">Feedback?</a> email patchjoh000@hsestudents.org to send feedback
      </h1>
      <div className="calendar-section">
        <h2>Academic Calendar</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <ReactLoading type="spin" color="#000" />
          </div>
        ) : (
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            onClickDay={setSelectedDate}
            tileContent={tileStyler}
          />
        )}
      </div>
      
      <CategoryEditor />
      <EventEditor selectedDate={selectedDate} />
    </div>
  );
};

export default Calendarv2;
