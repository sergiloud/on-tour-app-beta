import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';
import DraggableEventButtons, { EventButton } from './DraggableEventButtons';
import QuickSearch from './QuickSearch';
import { CalendarSyncModal } from './CalendarSyncModal';
import * as eventButtonsService from '../../services/eventButtonsService';

type Props = {
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onGoToDate?: () => void;
  view: 'month'|'week'|'day'|'agenda'|'timeline';
  setView: (v: 'month'|'week'|'day'|'agenda'|'timeline') => void;
  tz: string;
  setTz: (tz: string) => void;
  weekStartsOn?: 0|1;
  setWeekStartsOn?: (v: 0|1) => void;
  filters: { kinds: { shows: boolean; travel: boolean }, status?: { confirmed: boolean; pending: boolean; offer: boolean } };
  setFilters: (f: any) => void;
  onImportIcs?: (file: File) => void;
  heatmapMode: 'none'|'financial'|'activity';
  setHeatmapMode: (mode: 'none'|'financial'|'activity') => void;
  onEventDropped?: (button: EventButton, dateStr: string) => void;
  events?: any[]; // For quick search
  onEventSelect?: (event: any) => void; // For quick search
};

const viewOptions: Array<Props['view']> = ['month', 'week', 'day', 'agenda', 'timeline'];

const CalendarToolbar: React.FC<Props> = ({ title, onPrev, onNext, onToday, onGoToDate, view, setView, tz, setTz, weekStartsOn = 1, setWeekStartsOn, filters, setFilters, onImportIcs, heatmapMode, setHeatmapMode, onEventDropped, events = [], onEventSelect }) => {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const activeKinds: string[] = [];
  if (filters.kinds.shows) activeKinds.push(t('calendar.show.shows')||'Shows');
  if (filters.kinds.travel) activeKinds.push(t('calendar.show.travel')||'Travel');
  const fileRef = React.useRef<HTMLInputElement|null>(null);
  const [showSyncModal, setShowSyncModal] = React.useState(false);
  const [eventButtons, setEventButtons] = React.useState<EventButton[]>([]);
  const [buttonsLoading, setButtonsLoading] = React.useState(true);

  // Load event buttons from Firestore on mount
  React.useEffect(() => {
    loadEventButtons();
  }, []);

  const loadEventButtons = async () => {
    try {
      setButtonsLoading(true);
      const userId = 'current-user-id'; // TODO: Get from auth context
      const buttons = await eventButtonsService.getEventButtons(userId);
      setEventButtons(buttons);
      
      // Migrate from localStorage if needed
      await eventButtonsService.migrateLocalStorageToFirestore(userId);
    } catch (error) {
      console.error('Failed to load event buttons:', error);
    } finally {
      setButtonsLoading(false);
    }
  };

  const saveEventButtons = async (buttons: EventButton[]) => {
    setEventButtons(buttons);
    try {
      const userId = 'current-user-id'; // TODO: Get from auth context
      await eventButtonsService.saveEventButtons(buttons, userId);
    } catch (error) {
      console.error('Failed to save event buttons:', error);
    }
  };

  const handleAddButton = () => {
    const label = prompt('Enter button label:', 'New Event');
    if (!label) return;
    const colors: EventButton['color'][] = ['emerald', 'amber', 'sky', 'rose', 'purple', 'cyan'];
    const newButton: EventButton = {
      id: Date.now().toString(),
      label,
      color: colors[eventButtons.length % colors.length] as EventButton['color'],
      type: 'show'
    };
    saveEventButtons([...eventButtons, newButton]);
  };

  const handleRemoveButton = (id: string) => {
    saveEventButtons(eventButtons.filter(btn => btn.id !== id));
  };

  const handleSaveNewButton = (btn: EventButton) => {
    saveEventButtons([...eventButtons, btn]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col gap-2 md:gap-2.5 lg:gap-3"
    >
      {/* Primary Controls Section */}
      <div className="glass rounded-xl border border-white/10 backdrop-blur-md px-3 md:px-4 lg:px-5 py-3 md:py-3 lg:py-3 hover:border-white/20 transition-all duration-300 shadow-lg bg-gradient-to-r from-white/6 to-white/3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-3 lg:gap-4">
          {/* Navigation and View Controls */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-1.5 lg:gap-2">
            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1 bg-white/8 rounded-lg px-1.5 md:px-2 py-1.5 md:py-1.5 border border-white/15 hover:border-white/30 transition-all duration-200"
            >
              <motion.button
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.92 }}
                className="px-2 md:px-2.5 py-1.5 md:py-1.5 rounded-md hover:bg-white/15 text-white/90 font-semibold text-xs transition-all duration-200"
                onClick={onPrev}
                aria-label={t('calendar.prev')||'Previous'}
                title={(t('calendar.shortcut.pgUp')||'PgUp / Alt+←') as string}
              >
                <span>←</span>
              </motion.button>

              <div className="text-[10px] md:text-[11px] font-semibold tracking-tight text-white/90 min-w-[100px] md:min-w-[110px] text-center px-1.5" aria-live="polite">
                {title}
              </div>

              <motion.button
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.92 }}
                className="px-2 md:px-2.5 py-1.5 md:py-1.5 rounded-md hover:bg-white/15 text-white/90 font-semibold text-xs transition-all duration-200"
                onClick={onNext}
                aria-label={t('calendar.next')||'Next'}
                title={(t('calendar.shortcut.pgDn')||'PgDn / Alt+→') as string}
              >
                <span>→</span>
              </motion.button>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-1"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 hover:from-accent-500/35 hover:to-accent-600/20 text-accent-100 border border-accent-500/40 font-semibold text-xs shadow-lg hover:shadow-lg transition-all"
                onClick={onToday}
                title={(t('calendar.shortcut.today')||'T') as string}
              >
                {t('calendar.today')||'Today'}
              </motion.button>

              {onGoToDate && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 hover:bg-white/12 text-white/90 text-xs font-semibold transition-all flex items-center gap-1.5"
                  onClick={onGoToDate}
                  aria-label={t('calendar.goto')||'Go to date'}
                  aria-keyshortcuts="Meta+G Ctrl+G"
                  title={(t('calendar.goto')||'Go to date') + ' · ' + (t('calendar.goto.shortcut')||'Ctrl+G')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('calendar.goto')||'Go'}
                </motion.button>
              )}

              {onImportIcs && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".ics,text/calendar"
                    className="sr-only"
                    onChange={e=>{ const f=e.target.files?.[0]; if (f) onImportIcs(f); e.currentTarget.value=''; }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 hover:bg-white/12 text-white/90 text-xs font-semibold transition-all flex items-center gap-1.5"
                    onClick={()=> fileRef.current?.click()}
                    aria-label={t('calendar.import.ics')||'Import .ics'}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('calendar.import')||'Import'}
                  </motion.button>

                  {/* Sync Calendar Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/20 to-accent-600/10 border border-accent-500/30 hover:border-accent-400/50 hover:from-accent-500/30 hover:to-accent-600/20 text-accent-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                    onClick={() => setShowSyncModal(true)}
                    aria-label="Sync Calendar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync
                  </motion.button>
                </>
              )}

              {/* Quick Search */}
              {events && events.length > 0 && (
                <QuickSearch
                  events={events}
                  onSelectEvent={onEventSelect}
                />
              )}
            </motion.div>
          </div>

          {/* View Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:inline-flex bg-white/8 border border-white/15 rounded-lg p-1"
            role="radiogroup"
            aria-label={t('calendar.view.switch')||'Change calendar view'}
          >
            {viewOptions.map((v, idx) => (
              <motion.button
                key={v}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                role="radio"
                aria-checked={view===v}
                className={`px-2 py-1.5 rounded-md text-[9px] font-semibold transition-all ${view===v ? 'bg-gradient-to-r from-accent-500/30 to-accent-600/20 text-accent-100 border border-accent-500/40 shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/12'}`}
                onClick={()=> setView(v)}
              >
                {t(`calendar.view.${v}`)||v}
              </motion.button>
            ))}
          </motion.div>

          {/* Mobile View Selector */}
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:hidden text-xs"
          >
            <span className="sr-only">{t('calendar.view.switch')||'View'}</span>
            <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-white font-semibold text-[10px] focus:border-accent-500/50 focus:outline-none transition-colors" value={view} onChange={e=> setView(e.target.value as Props['view'])}>
              {viewOptions.map(v => (
                <option key={v} value={v}>{t(`calendar.view.${v}`)||v}</option>
              ))}
            </select>
          </motion.label>
        </div>
      </div>

      {/* Draggable Event Buttons Section */}
      <DraggableEventButtons
        buttons={eventButtons}
        onAddButton={handleSaveNewButton}
        onRemoveButton={handleRemoveButton}
        onDateSelected={onEventDropped}
      />

      {/* Secondary Controls Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap items-center gap-2 md:gap-2.5 px-4 md:px-4 py-3 md:py-3 rounded-lg bg-gradient-to-r from-white/6 to-white/3 border border-white/10 hover:border-white/20 transition-all shadow-sm"
      >
        {/* Timezone Selector Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const options = [
              { label: 'Local', value: localTz },
              { label: 'UTC', value: 'UTC' },
              { label: 'Madrid', value: 'Europe/Madrid' },
              { label: 'New York', value: 'America/New_York' },
              { label: 'Los Angeles', value: 'America/Los_Angeles' },
              { label: 'Mexico City', value: 'America/Mexico_City' },
              { label: 'Tokyo', value: 'Asia/Tokyo' }
            ];
            const selected = prompt('Select timezone:\n' + options.map(o => `${o.label} (${o.value})`).join('\n'), tz);
            if (selected && options.some(o => o.value === selected)) {
              setTz(selected);
            }
          }}
          className="px-2 py-0.5 rounded-md border text-[10px] font-semibold text-white/80 border-white/10 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-1"
          title="Change timezone"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">{tz === localTz ? 'Local' : tz.split('/').pop()}</span>
          <span className="sm:hidden">{tz === localTz ? 'L' : 'TZ'}</span>
        </motion.button>

        {/* Week Start Button */}
        {setWeekStartsOn && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWeekStartsOn(weekStartsOn === 1 ? 0 : 1)}
            className="px-2 py-0.5 rounded-md border text-[10px] font-semibold text-white/80 border-white/10 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-1"
            title={`Week starts on ${weekStartsOn === 1 ? 'Monday' : 'Sunday'} (click to toggle)`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{weekStartsOn === 1 ? 'Mon' : 'Sun'}</span>
          </motion.button>
        )}

        {/* Shows Filter Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={()=> setFilters((f: any)=> ({ ...f, kinds: { ...f.kinds, shows: !f.kinds.shows } }))}
          className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all inline-flex items-center gap-1 ${filters.kinds.shows ? 'bg-accent-500/20 border-accent-500/40 text-accent-100 shadow-lg shadow-accent-500/10' : 'bg-transparent border-white/10 text-white/60 hover:text-white/80 hover:border-white/20'}`}
          title={`${filters.kinds.shows ? 'Hide' : 'Show'} shows`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Shows
        </motion.button>

        {/* Travel Filter Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={()=> setFilters((f: any)=> ({ ...f, kinds: { ...f.kinds, travel: !f.kinds.travel } }))}
          className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all inline-flex items-center gap-1 ${filters.kinds.travel ? 'bg-accent-500/20 border-accent-500/40 text-accent-100 shadow-lg shadow-accent-500/10' : 'bg-transparent border-white/10 text-white/60 hover:text-white/80 hover:border-white/20'}`}
          title={`${filters.kinds.travel ? 'Hide' : 'Show'} travel`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Travel
        </motion.button>

        {/* Heatmap Mode Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const modes: Array<'none'|'financial'|'activity'> = ['none', 'financial', 'activity'];
            const idx = modes.indexOf(heatmapMode);
            const next = modes[(idx + 1) % modes.length];
            if (next) setHeatmapMode(next);
          }}
          className="px-2 py-0.5 rounded-md border text-[10px] font-semibold text-white/80 border-white/10 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-1"
          title={`Heatmap mode: ${heatmapMode} (click to cycle)`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className="hidden sm:inline">{heatmapMode === 'none' ? 'Off' : heatmapMode === 'financial' ? 'Fin' : 'Act'}</span>
          <span className="sm:hidden">{heatmapMode === 'none' ? '-' : heatmapMode === 'financial' ? 'F' : 'A'}</span>
        </motion.button>

        {/* Status Filters */}
        <div className="inline-flex items-center gap-1 bg-white/5 rounded-md px-1.5 py-0.5 border border-white/10">
          <span className="text-[10px] font-semibold text-white/70">Status:</span>
          {(['confirmed','pending','offer'] as const).map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={()=> setFilters((f: any)=> ({ ...f, status: { ...f.status, [s]: !f.status[s] } }))}
              className={`px-1.5 py-0.5 rounded-md border text-[9px] font-semibold transition-all capitalize ${filters.status?.[s] ? 'bg-accent-500/20 border-accent-500/40 text-accent-100 shadow-lg shadow-accent-500/10' : 'bg-transparent border-white/10 text-white/60 hover:text-white/80 hover:border-white/20'}`}
            >
              {s.slice(0, 3)}
            </motion.button>
          ))}
        </div>

        {/* Active Kinds Display */}
        {activeKinds.length>0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-accent-500/20 to-accent-600/20 border border-accent-500/30 text-[10px] font-semibold text-accent-100 shadow-lg shadow-accent-500/10"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {activeKinds.join(' + ')}
          </motion.span>
        )}
      </motion.div>

      {/* Calendar Sync Modal */}
      <CalendarSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
    </motion.div>
  );
};

export default CalendarToolbar;
