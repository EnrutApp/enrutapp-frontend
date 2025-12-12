import { useState } from 'react';
import '@material/web/icon/icon.js';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  const calendarDays = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
    });
  }

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
    <div className="bg-background content-box-outline-small h-full flex flex-col p-0.5">
      <div className="flex items-center justify-between mb-0.25">
        <h2 className="text-sm font-semibold text-primary capitalize">{monthName}</h2>
        <div className="flex gap-0.5">
          <button
            onClick={handlePrevMonth}
            className="btn btn-icon btn-text p-0.5 rounded-full"
            title="Mes anterior"
          >
            <md-icon className="text-[14px]">chevron_left</md-icon>
          </button>
          <button
            onClick={handleNextMonth}
            className="btn btn-icon btn-text p-0.5 rounded-full"
            title="Próximo mes"
          >
            <md-icon className="text-[14px]">chevron_right</md-icon>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-0.25">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-secondary text-[9px] font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {calendarDays.map((dayObj, index) => {
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          
          const cellDate = new Date(year, month, dayObj.day);
          cellDate.setHours(0, 0, 0, 0);
          
          const isDatePassed = dayObj.currentMonth && cellDate < todayDate;
          const hasEvent = dayObj.currentMonth && (dayObj.day === 20 || dayObj.day === 25);

          return (
            <div
              key={index}
              className={`flex items-center justify-center rounded text-xs font-medium transition-colors relative ${
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
              {hasEvent && (
                <div className="absolute -top-1 -right-0.5 bg-primary text-on-primary text-[9px] px-1 py-0.5 rounded whitespace-nowrap font-medium">
                  Viaje hoy
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarioPage = () => {
  return (
    <div className="bg-background h-screen overflow-hidden flex flex-col">
      <div className="flex flex-col p-0 gap-0.5 h-full overflow-hidden">
        {/* Grid con estadísticas arriba y calendario abajo */}
        {/* Panel lateral con estadísticas - Arriba */}
        <div className="grid grid-cols-3 gap-1.5 flex-shrink-0 px-2 pt-0.5">
          {/* Viajes programados */}
          <div className="bg-primary text-on-primary content-box-small py-1.5 px-2">
            <span className="opacity-08 text-[10px] font-light block">Viajes</span>
            <span className="text-base font-bold">8</span>
            <p className="text-[8px] opacity-80 mt-0.5">Este mes</p>
          </div>

          {/* Próximo turno */}
          <div className="content-box-outline-small py-1.5 px-2">
            <span className="text-[10px] font-light text-secondary block">Próximo</span>
            <span className="text-base text-primary font-bold">12 Dic</span>
            <p className="text-[8px] text-secondary mt-0.5">4:00 AM</p>
          </div>

          {/* Viajes completados */}
          <div className="content-box-outline-small py-1.5 px-2">
            <span className="text-[10px] font-light text-secondary block">Completados</span>
            <span className="text-base text-primary font-bold">5</span>
            <p className="text-[8px] text-secondary mt-0.5">95%</p>
          </div>
        </div>

        {/* Calendario principal - Ancho completo */}
        <div className="flex-1 overflow-hidden">
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default CalendarioPage;
