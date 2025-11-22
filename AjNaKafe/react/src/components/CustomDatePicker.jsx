import React, { useState, useRef, useEffect } from 'react';
import '../../public/resources/css/CustomDatePicker.css';

const CustomDatePicker = ({ selected, onChange, placeholder = "Избери датум", className = "", style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(selected ? new Date(selected) : null);
  const [currentMonth, setCurrentMonth] = useState(selected ? new Date(selected).getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(selected ? new Date(selected).getFullYear() : new Date().getFullYear());
  const datePickerRef = useRef(null);

  const months = [
    'Јануари', 'Фебруари', 'Март', 'Април', 'Мај', 'Јуни',
    'Јули', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];

  const weekDays = ['Не', 'По', 'Вт', 'Ср', 'Че', 'Пе', 'Са'];

  useEffect(() => {
    if (selected) {
      const date = new Date(selected);
      setSelectedDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const generateYearOptions = () => {
    const years = [];
    const currentYearValue = new Date().getFullYear();
    for (let i = currentYearValue; i >= 1900; i--) {
      years.push(i);
    }
    return years;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;
      
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <div className="custom-date-picker-wrapper" ref={datePickerRef} style={style}>
      <div
        className={`custom-date-picker-input ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined date-picker-icon">calendar_today</span>
        <span className="date-picker-text">
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <span className="date-picker-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="custom-date-picker-dropdown">
          <div className="date-picker-header">
            <button
              type="button"
              className="nav-button prev"
              onClick={() => navigateMonth('prev')}
            >
              ‹
            </button>
            
            <div className="month-year-selectors">
              <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="month-select"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              
              <select
                value={currentYear}
                onChange={handleYearChange}
                className="year-select"
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="nav-button next"
              onClick={() => navigateMonth('next')}
            >
              ›
            </button>
          </div>

          <div className="calendar-weekdays">
            {weekDays.map((day, index) => (
              <div key={index} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;

