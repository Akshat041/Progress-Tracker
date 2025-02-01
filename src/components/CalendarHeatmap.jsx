import React, { useState, useEffect } from "react";

const CalendarHeatmap = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [squares, setSquares] = useState({});
  const [showingDates, setShowingDates] = useState({});

  // Get available years from localStorage on mount
  const getAvailableYears = () => {
    const years = new Set();
    if (typeof localStorage !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("heatmapData_")) {
          years.add(parseInt(key.split("_")[1]));
        }
      }
    }
    // Always include current year and next year
    years.add(new Date().getFullYear());
    years.add(new Date().getFullYear() + 1);
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  // Load data from localStorage on mount and year change
  useEffect(() => {
    const stored = localStorage.getItem(`heatmapData_${currentYear}`);
    if (stored) {
      setSquares(JSON.parse(stored));
    } else {
      setSquares({}); // Reset when year changes and no data exists
    }
  }, [currentYear]);

  // Save to localStorage whenever squares change
  useEffect(() => {
    if (Object.keys(squares).length > 0) {
      localStorage.setItem(
        `heatmapData_${currentYear}`,
        JSON.stringify(squares)
      );
    }
  }, [squares, currentYear]);

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate dates for the selected year
  const getDatesGrid = () => {
    const weeks = [];
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st

    // Start from the first Sunday before or on January 1st
    const firstDay = new Date(startDate);
    while (firstDay.getDay() !== 0) {
      firstDay.setDate(firstDay.getDate() - 1);
    }

    // End on the last Saturday after or on December 31st
    const lastDay = new Date(endDate);
    while (lastDay.getDay() !== 6) {
      lastDay.setDate(lastDay.getDate() + 1);
    }

    // Generate all dates
    const current = new Date(firstDay);
    let currentWeek = [];

    while (current <= lastDay) {
      currentWeek.push(new Date(current));

      if (current.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    return weeks;
  };

  // Handle click on a square
  const handleClick = (dateStr) => {
    setSquares((prev) => {
      const currentLevel = prev[dateStr] || 0;
      const newLevel = (currentLevel + 1) % 5;
      return {
        ...prev,
        [dateStr]: newLevel,
      };
    });
  };

  // Get color based on intensity level
  const getColor = (level) => {
    switch (level) {
      case 1:
        return "bg-green-200";
      case 2:
        return "bg-green-300";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-100";
    }
  };

  // Activity levels and their meanings
  const activityLevels = [
    { level: 0, color: "bg-gray-100", meaning: "No work" },
    { level: 1, color: "bg-green-200", meaning: "Light work" },
    { level: 2, color: "bg-green-300", meaning: "Moderate work" },
    { level: 3, color: "bg-green-400", meaning: "Productive day" },
    { level: 4, color: "bg-green-500", meaning: "Very productive" },
  ];

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Activity Calendar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentYear((prev) => prev - 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              aria-label="Previous year"
            >
              ←
            </button>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="px-3 py-1 rounded bg-gray-200"
            >
              {getAvailableYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCurrentYear((prev) => prev + 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-200"
              aria-label="Next year"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Days of week labels */}
          <div className="pr-2 pt-8">
            {weekDays.map((day, index) => (
              <div key={day} className="h-4 text-xs text-gray-500 mb-1">
                {index % 2 === 0 ? day : ""}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="flex ml-2 mb-1">
              {months.map((month) => (
                <div key={month} className="w-12 text-xs text-gray-500">
                  {month}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {getDatesGrid().map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const level = squares[dateStr] || 0;
                    const isCurrentYear = date.getFullYear() === currentYear;
                    const todayHighlight = isToday(date);

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleClick(dateStr)}
                        onMouseEnter={() =>
                          setShowingDates({ [dateStr]: true })
                        }
                        onMouseLeave={() => setShowingDates({})}
                        className={`
                          w-4 h-4 rounded-sm 
                          ${isCurrentYear ? getColor(level) : "bg-gray-50"}
                          hover:ring-2 hover:ring-gray-300
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          relative
                          ${!isCurrentYear && "opacity-50"}
                          ${todayHighlight ? "ring-2 ring-yellow-400" : ""}
                        `}
                        aria-label={`Activity for ${formatDate(date)}${
                          todayHighlight ? " (Today)" : ""
                        }`}
                      >
                        {showingDates[dateStr] && (
                          <div className="absolute bottom-5 bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                            {formatDate(date)}
                            {todayHighlight ? " (Today)" : ""}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {activityLevels.map(({ level, color, meaning }) => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${color} rounded-sm`}></div>
              <span>{meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
