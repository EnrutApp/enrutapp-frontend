import { useState } from 'react';
import '@material/web/icon/icon.js';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obtener primer día del mes y cantidad de días
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  // Crear array de días para mostrar
  const calendarDays = [];

  // Días del mes anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
    });
  }

  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      currentMonth: true,
      isToday:
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear(),
    });
  }

  // Días del mes siguiente
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      currentMonth: false,
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-background content-box-outline-small overflow-hidden p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="h4 font-semibold text-primary capitalize">{monthName}</h2>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="btn btn-icon btn-text p-1 rounded-full"
            title="Mes anterior"
          >
            <md-icon className="text-xs">chevron_left</md-icon>
          </button>
          <button
            onClick={handleNextMonth}
            className="btn btn-icon btn-text p-1 rounded-full"
            title="Próximo mes"
          >
            <md-icon className="text-xs">chevron_right</md-icon>
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-secondary text-[10px] font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, index) => {
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          
          const cellDate = new Date(year, month, dayObj.day);
          cellDate.setHours(0, 0, 0, 0);
          
          const isDatePassed = dayObj.currentMonth && cellDate < todayDate;

          return (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center rounded text-sm font-medium transition-colors relative ${
                dayObj.isToday
                  ? 'bg-primary text-on-primary'
                  : isDatePassed
                    ? 'text-secondary opacity-30 cursor-not-allowed'
                    : dayObj.currentMonth
                      ? 'bg-surface text-on-surface hover:bg-surface-dim cursor-pointer'
                      : 'text-secondary opacity-30'
              }`}
            >
              {dayObj.day}
              {dayObj.currentMonth && dayObj.day === 15 && (
                <div className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-[8px] px-1 py-0 rounded-full whitespace-nowrap">
                  Viaje
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
