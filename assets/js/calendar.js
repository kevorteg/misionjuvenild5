/**
 * Misión Juvenil D5 - Interactive Calendar Logic
 * Manages the generation of months and rendering of events.
 */

const MJ_EVENTS = [
    { date: '2026-02-14', title: 'Ayuno Misión Juvenil', loc: 'IPUC Diamante', type: 'general' },
    { date: '2026-02-22', title: 'Encuentro Distrital MJ', loc: 'Distrito 5', type: 'general' },
    { date: '2026-03-13', title: 'Culto Pre-Campamento', loc: 'IPUC Sedes', type: 'general' },
    { date: '2026-03-27', title: 'Campamento Misión Juvenil', loc: 'Sede Recreacional', type: 'general', end: '2026-03-29' },
    { date: '2026-04-10', title: 'Impacto Zonal – Zona Sur', loc: 'Cali Sur', type: 'zonal' },
    { date: '2026-05-29', title: 'Impacto Zonal – Zona Oriente', loc: 'Cali Oriente', type: 'zonal' },
    { date: '2026-06-14', title: 'Integración MJ', loc: 'Por definir', type: 'general' },
    { date: '2026-06-26', title: 'Impacto Zonal – Zona Norte', loc: 'Cali Norte', type: 'zonal' },
    { date: '2026-07-26', title: 'Vigilia Distrital', loc: 'IPUC Central', type: 'general' },
    { date: '2026-07-31', title: 'Impacto Zonal – Zona Yumbo', loc: 'Yumbo', type: 'zonal' },
    { date: '2026-08-28', title: 'Impacto Zonal – Zona Jamundí', loc: 'Jamundí', type: 'zonal' },
    { date: '2026-09-18', title: 'Impacto Zonal – Zona Ladera', loc: 'Cali Ladera', type: 'zonal' },
    { date: '2026-09-27', title: 'Amor y Amistad MJ', loc: 'Por definir', type: 'general' },
    { date: '2026-10-17', title: 'Congreso Ciencias y Fe', loc: 'Auditorio Principal', type: 'general' },
    { date: '2026-11-29', title: 'Noche de Gala Distrital', loc: 'Centro de Eventos', type: 'general' }
];

let currentYear = 2026;
let currentMonth = new Date().getMonth(); // Start with current month in 2026

function initCalendar() {
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');

    if (prevBtn) prevBtn.onclick = () => changeMonth(-1);
    if (nextBtn) nextBtn.onclick = () => changeMonth(1);

    renderCalendar();
}

function changeMonth(delta) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }

    // Limitar navegación solo al año 2026
    if (newYear === 2026) {
        currentMonth = newMonth;
        currentYear = newYear;
        renderCalendar();
    }
}

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarGrid = document.getElementById('calendarGrid');
    const upcomingList = document.getElementById('upcomingList');

    if (!monthDisplay || !calendarGrid) return;

    const date = new Date(currentYear, currentMonth, 1);
    const monthName = date.toLocaleString('es-ES', { month: 'long' });
    monthDisplay.textContent = `${monthName} ${currentYear}`;

    // Clear grid
    calendarGrid.innerHTML = `
        <div class="mj-weekday">Dom</div>
        <div class="mj-weekday">Lun</div>
        <div class="mj-weekday">Mar</div>
        <div class="mj-weekday">Mié</div>
        <div class="mj-weekday">Jue</div>
        <div class="mj-weekday">Vie</div>
        <div class="mj-weekday">Sáb</div>
    `;

    const firstDay = date.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += '<div class="mj-day empty"></div>';
    }

    // Add days
    for (let d = 1; d <= daysInMonth; d++) {
        const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = MJ_EVENTS.filter(e => e.date === fullDate || (e.end && fullDate >= e.date && fullDate <= e.end));

        const isToday = new Date().toISOString().split('T')[0] === fullDate;
        let dayHtml = `
            <div class="mj-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-event' : ''} flex flex-col overflow-hidden relative group">
                <span class="mj-day-num">${d}</span>
                <div class="mj-event-dots lg:hidden mt-auto mb-1">
                    ${dayEvents.map(e => `<div class="mj-dot ${e.type}"></div>`).join('')}
                </div>
                <div class="hidden lg:flex flex-col gap-1.5 mt-2 w-full z-10">
                    ${dayEvents.map(e => {
            const isZonal = e.type === 'zonal';
            const bgClass = isZonal ? 'bg-[#3498db]/10' : 'bg-brand/10';
            const textClass = isZonal ? 'text-[#3498db]' : 'text-brand';
            const borderClass = isZonal ? 'border-[#3498db]/20' : 'border-brand/20';
            return `
                        <div class="text-[9px] xl:text-[10px] font-bold px-2 py-1 rounded-md border ${bgClass} ${textClass} ${borderClass} truncate w-full shadow-sm leading-tight transition-transform hover:scale-105" title="${e.title} - ${e.loc}">
                            ${e.title}
                        </div>`;
        }).join('')}
                </div>
            </div>
        `;
        calendarGrid.innerHTML += dayHtml;
    }

    // Render upcoming list for this month
    if (upcomingList) {
        const displayEvents = MJ_EVENTS.filter(e => {
            const evDate = new Date(e.date);
            return evDate.getUTCFullYear() === currentYear && evDate.getUTCMonth() === currentMonth;
        });

        if (displayEvents.length > 0) {
            upcomingList.innerHTML = displayEvents.map(e => {
                const d = new Date(e.date).getUTCDate();
                const m = new Date(e.date).toLocaleString('es-ES', { month: 'short' });
                const isZonal = e.type === 'zonal';

                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const eventDateEnd = e.end || e.date;
                const isPast = eventDateEnd < todayStr;

                // Color mapping for Tailwind classes
                let boxBg = isZonal ? '!bg-[#3498db]/10 !border-[#3498db]/30 hover:!bg-[#3498db]/20' : '!bg-[#f38334]/10 !border-[#f38334]/30 hover:!bg-[#f38334]/20';
                let textCol = isZonal ? 'text-[#3498db]' : 'text-[#f38334]';
                let badgeHtml = '';

                if (isPast) {
                    boxBg = '!bg-red-900/10 !border-red-500/30 opacity-60 hover:opacity-100 grayscale hover:grayscale-0';
                    textCol = 'text-red-500';
                    badgeHtml = `<span class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-500 uppercase tracking-wider border border-red-500/20 align-middle">Finalizado</span>`;
                }

                return `
                    <div class="mj-cal-event-card ${boxBg} transition-all duration-300">
                        <div class="mj-cal-date-box">
                            <span class="mj-cal-date-day ${textCol} drop-shadow-md">${d}</span>
                            <span class="mj-cal-date-month ${textCol} opacity-80">${m}</span>
                        </div>
                        <div class="mj-cal-event-info">
                            <h5 class="${textCol} font-black uppercase text-lg mb-1 flex items-center flex-wrap gap-2">${e.title} ${badgeHtml}</h5>
                            <p class="text-slate-300 font-medium"><span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">location_on</span> ${e.loc}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            upcomingList.innerHTML = '<p class="text-slate-500 italic text-center py-10 w-full col-span-full">No hay eventos programados para este mes.</p>';
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initCalendar);
