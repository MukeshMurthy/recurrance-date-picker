import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { addDays, addWeeks, addMonths, addYears, format, parse, isValid, isBefore, isAfter, isSameDay, startOfDay } from 'date-fns';
import 'react-calendar/dist/Calendar.css';
import './RecurrenceForm.css';

const RecurrenceForm = () => {
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [frequency, setFrequency] = useState(1);
  const [specificDays, setSpecificDays] = useState([]);
  const [nthDay, setNthDay] = useState('first');
  const [dayOfWeek, setDayOfWeek] = useState('monday');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [recurringDates, setRecurringDates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (startDate && endDate) {
      if (isBefore(endDate, startDate)) {
        setError('End date must be after start date');
      } else {
        setError('');
        const dates = generateRecurringDates(startDate, endDate, recurrenceType, frequency, specificDays, nthDay, dayOfWeek);
        setRecurringDates(dates);
      }
    }
  }, [recurrenceType, frequency, specificDays, nthDay, dayOfWeek, startDate, endDate]);

  const handleRecurrenceChange = (e) => setRecurrenceType(e.target.value);
  const handleFrequencyChange = (e) => setFrequency(parseInt(e.target.value));
  const handleSpecificDayChange = (e) => {
    const day = e.target.value;
    setSpecificDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  const handleNthDayChange = (e) => setNthDay(e.target.value);
  const handleDayOfWeekChange = (e) => setDayOfWeek(e.target.value);
  const handleDateChange = (value) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      if (isValid(start) && isValid(end)) {
        setStartDate(startOfDay(start));
        setEndDate(startOfDay(end));
      } else {
        setError('Invalid date selection');
      }
    } else {
      setError('Please select both start and end dates');
    }
  };

  const generateRecurringDates = (start, end, type, freq, days, nth, dow) => {
    let dates = [];
    let current = start;

    while (isBefore(current, end) || isSameDay(current, end)) {
      switch (type) {
        case 'daily':
          if (freq === 1 || current.getDate() % freq === start.getDate() % freq) {
            dates.push(current);
          }
          current = addDays(current, 1);
          break;
        case 'weekly':
          if (days.includes(format(current, 'EEEE').toLowerCase())) {
            dates.push(current);
          }
          current = addDays(current, 1);
          break;
        case 'monthly':
          if (isNthDayOfMonth(current, nth, dow)) {
            dates.push(current);
          }
          current = addDays(current, 1);
          break;
        case 'yearly':
          if (current.getMonth() === start.getMonth() && current.getDate() === start.getDate()) {
            dates.push(current);
          }
          current = addDays(current, 1);
          break;
      }
    }
    return dates;
  };

  const isNthDayOfMonth = (date, nthDay, dayOfWeek) => {
    const day = format(date, 'EEEE').toLowerCase();
    const dateOfMonth = date.getDate();

    if (day !== dayOfWeek) return false;

    if (nthDay === 'last') {
      return dateOfMonth > (new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() - 7);
    }

    const weekNumber = Math.ceil(dateOfMonth / 7);
    return (nthDay === 'first' && weekNumber === 1) ||
           (nthDay === 'second' && weekNumber === 2) ||
           (nthDay === 'third' && weekNumber === 3) ||
           (nthDay === 'fourth' && weekNumber === 4);
  };

  return (
    <div className="recurring-date-picker">
      <h2 className="title">Recurring Event</h2>

      <div className="form-group">
        <label htmlFor="recurrenceType" className="label">
          Recurrence Type
        </label>
        <select
          id="recurrenceType"
          className="select"
          onChange={handleRecurrenceChange}
          value={recurrenceType}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="frequency" className="label">
          Every
        </label>
        <input
          id="frequency"
          type="number"
          className="input"
          value={frequency}
          onChange={handleFrequencyChange}
          min="1"
        />
      </div>

      {recurrenceType === "weekly" && (
        <div className="form-group">
          <fieldset>
            <legend className="label">Specific Days of the Week</legend>
            <div className="checkbox-group">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                <div key={day} className="checkbox">
                  <input
                    id={day}
                    type="checkbox"
                    value={day}
                    checked={specificDays.includes(day)}
                    onChange={handleSpecificDayChange}
                    className="checkbox-input"
                  />
                  <label htmlFor={day} className="checkbox-label">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {recurrenceType === "monthly" && (
        <div className="form-group">
          <div>
            <label htmlFor="nthDay" className="label">
              Nth Day of the Month
            </label>
            <select
              id="nthDay"
              className="select"
              onChange={handleNthDayChange}
              value={nthDay}
            >
              <option value="first">First</option>
              <option value="second">Second</option>
              <option value="third">Third</option>
              <option value="fourth">Fourth</option>
              <option value="last">Last</option>
            </select>
          </div>

          <div>
            <label htmlFor="dayOfWeek" className="label">
              Day of the Week
            </label>
            <select
              id="dayOfWeek"
              className="select"
              onChange={handleDayOfWeekChange}
              value={dayOfWeek}
            >
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <p className="error" id="error-message">
          {error}
        </p>
      )}

      <div className="form-group">
        <h3 className="subtitle">Select Date Range and Preview Recurring Dates</h3>
        <Calendar
          onChange={handleDateChange}
          value={startDate && endDate ? [startDate, endDate] : null}
          selectRange={true}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              if (recurringDates.some(d => isSameDay(d, date))) {
                return 'recurring-date';
              }
              if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) {
                return 'in-range';
              }
            }
            return '';
          }}
          className="calendar"
        />
      </div>

      <div className="date-display">
        <p>
          Start Date: {startDate ? format(startDate, 'PPP') : 'Not selected'}
        </p>
        <p>
          End Date: {endDate ? format(endDate, 'PPP') : 'Not selected'}
        </p>
      </div>
    </div>
  );
};

export default RecurrenceForm;