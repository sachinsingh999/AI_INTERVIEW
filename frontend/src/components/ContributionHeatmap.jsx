import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, Flame } from "lucide-react";

export default function ContributionHeatmap({ contributionData = {}, streakCount = 0 }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate per-month exact calendar date grids (exact 28-31 days per month)
  const { monthDataList, totalSubmissions, calculatedStreak } = useMemo(() => {
    const year = parseInt(selectedYear, 10);
    const today = new Date();
    const isCurrentYear = year === today.getFullYear();
    const maxMonthToInclude = isCurrentYear ? today.getMonth() : 11;
    const currentDay = today.getDate();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let total = 0;
    const months = [];

    for (let m = 0; m <= maxMonthToInclude; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const columns = [];
      let currentColumn = new Array(7).fill(null);

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, m, day);
        const dayOfWeek = dateObj.getDay(); // 0 (Sun) to 6 (Sat)

        const yyyy = year;
        const mm = String(m + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const isFuture = isCurrentYear && (m > today.getMonth() || (m === today.getMonth() && day > currentDay));
        const isValidCell = !isFuture;

        const count = isValidCell ? (contributionData[dateStr] || 0) : 0;
        if (isValidCell) total += count;

        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });

        const dayData = {
          day,
          dateStr,
          count,
          isValidCell,
          isFuture,
          formattedDate
        };

        // Start new column on Sunday if not day 1
        if (dayOfWeek === 0 && day > 1) {
          columns.push(currentColumn);
          currentColumn = new Array(7).fill(null);
        }

        currentColumn[dayOfWeek] = dayData;
      }

      if (currentColumn.some((cell) => cell !== null)) {
        columns.push(currentColumn);
      }

      months.push({
        name: monthNames[m],
        columns,
        daysInMonth
      });
    }

    // Calculate streak dynamically from continuous submission dates
    let streak = streakCount;
    if (!streak || streak === 0) {
      let tempStreak = 0;
      let pointer = new Date(today);
      if (year < today.getFullYear()) {
        pointer = new Date(year, 11, 31);
      }

      const getStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      if ((contributionData[getStr(pointer)] || 0) === 0) {
        pointer.setDate(pointer.getDate() - 1);
      }

      while (true) {
        const c = contributionData[getStr(pointer)] || 0;
        if (c > 0) {
          tempStreak++;
          pointer.setDate(pointer.getDate() - 1);
        } else {
          break;
        }
      }
      streak = tempStreak;
    }

    return {
      monthDataList: months,
      totalSubmissions: total,
      calculatedStreak: streak
    };
  }, [selectedYear, contributionData, streakCount]);

  // 5 Intensity Color Levels: Initial visible off-white/slate -> Progressively deeper Yellows
  const getCellColor = (count) => {
    if (count === 0) return "bg-[#F1F5F9] dark:bg-[#1E293B] border border-slate-300/50 dark:border-slate-700/50";
    if (count <= 2) return "bg-[#FEF08A] text-slate-900";
    if (count <= 5) return "bg-[#FDE047] text-slate-900";
    if (count <= 9) return "bg-[#FACC15] text-slate-950";
    return "bg-[#EAB308] text-slate-950 font-bold";
  };

  return (
    <section className="bg-brand-card border border-brand-border rounded-sm p-4 sm:p-5 shadow-sm space-y-4 font-sans shrink-0">
      
      {/* 1. Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#EAB308]" />
          <h3 className="text-sm font-black text-brand-text tracking-tight">
            Solving Activity
          </h3>
          <span className="text-xs font-bold text-brand-muted">
            ({totalSubmissions} {totalSubmissions === 1 ? "submission" : "submissions"} in {selectedYear})
          </span>
        </div>

        {/* Year Selector Pills */}
        <div className="flex items-center gap-1 bg-brand-input p-0.5 rounded-sm border border-brand-border">
          {["2026", "2025", "2024"].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1 text-[11px] font-black uppercase rounded-sm transition-all cursor-pointer ${
                selectedYear === yr
                  ? "bg-[#FACC15] text-slate-950 shadow-sm"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-elevated"
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Heatmap Area */}
      <div className="flex gap-2.5 items-start pt-1">
        
        {/* Left Weekday Labels Column (Sun -> Sat) */}
        <div className="grid grid-rows-7 gap-[3.5px] pt-4 text-[10px] font-bold text-brand-muted select-none shrink-0">
          <span className="h-3.5 sm:h-4 flex items-center">Sun</span>
          <span className="h-3.5 sm:h-4 flex items-center">Mon</span>
          <span className="h-3.5 sm:h-4 flex items-center">Tue</span>
          <span className="h-3.5 sm:h-4 flex items-center">Wed</span>
          <span className="h-3.5 sm:h-4 flex items-center">Thu</span>
          <span className="h-3.5 sm:h-4 flex items-center">Fri</span>
          <span className="h-3.5 sm:h-4 flex items-center">Sat</span>
        </div>

        {/* Scrollable Heatmap Grid Container */}
        <div className="flex-1 overflow-x-auto no-scrollbar pb-1">
          {/* Month Blocks Container with Gap Between Month Columns */}
          <div className="flex gap-2.5 sm:gap-3 items-start w-max">
            
            {monthDataList.map((mGroup, mIdx) => (
              <div key={mIdx} className="space-y-1 shrink-0">
                {/* Month Label Header */}
                <div className="text-[10px] font-bold text-brand-muted select-none h-3.5 leading-none text-center">
                  {mGroup.name}
                </div>

                {/* Month's Week Columns */}
                <div className="flex gap-[3.5px]">
                  {mGroup.columns.map((col, cIdx) => (
                    <div key={cIdx} className="grid grid-rows-7 gap-[3.5px]">
                      {col.map((cell, rIdx) => {
                        if (!cell || cell.isFuture) {
                          return (
                            <div
                              key={rIdx}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] bg-transparent opacity-0 pointer-events-none shrink-0"
                            />
                          );
                        }

                        return (
                          <div
                            key={rIdx}
                            tabIndex={0}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredDay({ formattedDate: cell.formattedDate, count: cell.count, rect });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                            onFocus={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredDay({ formattedDate: cell.formattedDate, count: cell.count, rect });
                            }}
                            onBlur={() => setHoveredDay(null)}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] box-border shrink-0 transition-opacity duration-150 ${getCellColor(cell.count)} hover:opacity-80 focus:outline-none focus:opacity-80 cursor-pointer`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

      {/* 3. Footer / Streak & Intensity Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-bold text-brand-muted pt-2 border-t border-brand-border/60">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-[#EAB308]" />
          <span>Streak: <strong className="text-brand-text">{calculatedStreak} Days</strong></span>
        </div>

        <div className="flex items-center gap-1.5 select-none self-end sm:self-auto">
          <span className="text-[10px]">Less</span>
          <span className="w-3 h-3 rounded-[2px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-slate-300/50 dark:border-slate-700/50" title="0 submissions" />
          <span className="w-3 h-3 rounded-[2px] bg-[#FEF08A]" title="1-2 submissions" />
          <span className="w-3 h-3 rounded-[2px] bg-[#FDE047]" title="3-5 submissions" />
          <span className="w-3 h-3 rounded-[2px] bg-[#FACC15]" title="6-9 submissions" />
          <span className="w-3 h-3 rounded-[2px] bg-[#EAB308]" title="10+ submissions" />
          <span className="text-[10px]">More</span>
        </div>
      </div>

      {/* 4. Hover/Focus Tooltip rendered via React Portal at document.body level */}
      {hoveredDay && createPortal(
        <div 
          style={{
            position: "fixed",
            top: `${Math.max(8, hoveredDay.rect.top - 48)}px`,
            left: `${hoveredDay.rect.left + hoveredDay.rect.width / 2}px`,
            transform: "translateX(-50%)"
          }}
          className="z-[99999] pointer-events-none bg-[#0B1120] border border-[#1E293B] shadow-2xl rounded-sm px-3 py-1.5 text-center font-sans whitespace-nowrap select-none"
        >
          <div className="text-xs font-bold text-[#F8FAFC]">{hoveredDay.formattedDate}</div>
          <div className="text-[10px] font-semibold text-[#94A3B8] mt-0.5">
            {hoveredDay.count} {hoveredDay.count === 1 ? "submission" : "submissions"}
          </div>
        </div>,
        document.body
      )}

    </section>
  );
}
