import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Calendar = React.forwardRef(({ className, ...props }, ref) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (props.onSelect) {
      props.onSelect(date);
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div ref={ref} className={cn("p-4 bg-white rounded-lg shadow", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleDateClick(day)}
            disabled={!day}
            className={cn(
              "p-2 text-center text-sm rounded-md hover:bg-gray-100",
              !day && "invisible",
              selectedDate && day && day.getTime() === selectedDate.getTime() && "bg-blue-500 text-white hover:bg-blue-600",
              day && day.toDateString() === new Date().toDateString() && "bg-gray-200"
            )}
          >
            {day ? day.getDate() : ""}
          </button>
        ))}
      </div>
    </div>
  );
});

Calendar.displayName = "Calendar";

export { Calendar };

