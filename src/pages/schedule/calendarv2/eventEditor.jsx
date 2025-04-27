import React, { useState, useEffect } from "react";

const EventEditor = ({ selectedDate }) => {
  const [events, setEvents] = useState([]);
  const [eventStartDate, setEventStartDate] = useState(null);
  const [eventEndDate, setEventEndDate] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState(null);
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/schedule/categories');
      const data = await response.json();
      setCategories(data);
      
      // Set default category if categories exist
      if (data.length > 0) {
        setCategoryId(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch events for the selected date
  const fetchEvents = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/schedule/events2?date=${formattedDate}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle event actions (add, edit, delete)
  const handleEventAction = async (action) => {
    const eventData = {
      name,
      categoryId,
      description,
      date: selectedDate,
      allDay,
      startTime: eventStartDate,
      endTime: eventEndDate
    };

    if (action === 'update' || action === 'delete') {
      eventData._id = id;
    }

    try {
      const response = await fetch('/api/schedule/events2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          content: eventData
        }),
      });
      
      const data = await response.json();
      alert(`Event ${action}ed successfully`);
      resetForm();
      fetchEvents(); // Refresh the event list
    } catch (error) {
      alert(`Error ${action}ing event: ${error.message}`);
    }
  };

  // Reset form after action
  const resetForm = () => {
    setEventStartDate(null);
    setEventEndDate(null);
    setCategoryId(categories.length > 0 ? categories[0]._id : '');
    setDescription('');
    setName('');
    setId(null);
    setAllDay(false);
    setIsEditing(false);
    setSelectedEvent(null);
  };

  // Select event for editing
  const selectEventForEdit = (event) => {
    setIsEditing(true);
    setSelectedEvent(event);
    setId(event._id);
    setName(event.content.name);
    setCategoryId(event.content.categoryId || ''); // Handle legacy events that might not have categoryId
    setDescription(event.content.description);
    setAllDay(event.content.allDay);
    
    // Properly format the date strings for the time inputs
    if (event.content.startTime) {
      setEventStartDate(event.content.startTime);
    }
    
    if (event.content.endTime) {
      setEventEndDate(event.content.endTime);
    }
  };

  // Set form based on all-day selection
  const handleAllDayChange = (checked) => {
    setAllDay(checked);
    if (checked) {
      setEventStartDate(new Date(selectedDate).setHours(0,0,0,0));
      setEventEndDate(new Date(selectedDate).setHours(23,59,59,999));
    } else if (selectedDate) {
      // Set some default times when unchecking all-day
      const now = new Date();
      setEventStartDate(`${selectedDate.toISOString().split('T')[0]}T${now.getHours().toString().padStart(2, '0')}:00:00.000Z`);
      setEventEndDate(`${selectedDate.toISOString().split('T')[0]}T${(now.getHours() + 1).toString().padStart(2, '0')}:00:00.000Z`);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch events when selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchEvents();
      resetForm();
    }
  }, [selectedDate]);

  // Helper function to get category name from ID
  const getCategoryNameById = (catId) => {
    const category = categories.find(cat => cat._id === catId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div className="event-section">
      <h2>{isEditing ? 'Edit Event' : 'Add Event'}</h2>
      
      <div className="time-picker">
        <label>
          All Day:
          <input 
            type="checkbox" 
            checked={allDay}
            onChange={(e) => handleAllDayChange(e.target.checked)} 
          />
        </label>
        {!allDay && (
          <>
            <label>
              Start Time:
              <input 
                type="time" 
                value={eventStartDate ? new Date(eventStartDate).toTimeString().slice(0, 5) : ''} 
                onChange={(e) => setEventStartDate(`${selectedDate.toISOString().split('T')[0]}T${e.target.value}:00.000Z`)} 
              />
            </label>
            <label>
              End Time:
              <input 
                type="time" 
                value={eventEndDate ? new Date(eventEndDate).toTimeString().slice(0, 5) : ''}
                onChange={(e) => setEventEndDate(`${selectedDate.toISOString().split('T')[0]}T${e.target.value}:00.000Z`)} 
              />
            </label>
          </>
        )}
      </div>
      
      <label>
        Category:
        <select 
          onChange={(e) => setCategoryId(e.target.value)} 
          value={categoryId}
        >
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>
      
      <label>
        Name:
        <input type="text" onChange={(e) => setName(e.target.value)} value={name} />
      </label>
      
      <label>
        Description:
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} />
      </label>
      
      <div className="form-actions">
        {isEditing ? (
          <>
            <button onClick={() => handleEventAction('update')}>Update Event</button>
            <button onClick={() => handleEventAction('delete')} className="delete-btn">Delete Event</button>
            <button onClick={resetForm}>Cancel</button>
          </>
        ) : (
          <button onClick={() => handleEventAction('add')}>Add Event</button>
        )}
      </div>

      <h3>Events on {selectedDate ? selectedDate.toLocaleDateString() : 'Selected Date'}</h3>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length > 0 ? (
        <div className="events-list">
          {events.map((event) => (
            <div key={event._id} className="event-item" onClick={() => selectEventForEdit(event)}>
              <h4>{event.content.name}</h4>
              <p>{event.content.categoryId ? getCategoryNameById(event.content.categoryId) : 'Unknown Category'}</p>
              <p>
                {event.content.allDay 
                  ? 'All day' 
                  : `${new Date(event.content.startTime).toLocaleTimeString()} - ${new Date(event.content.endTime).toLocaleTimeString()}`
                }
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No events found for this date.</p>
      )}
    </div>
  );
};

export default EventEditor;