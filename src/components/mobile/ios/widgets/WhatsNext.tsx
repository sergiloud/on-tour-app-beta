import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plane, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { showStore } from '../../../../shared/showStore';
import type { Show } from '../../../../lib/shows';

interface Event {
  id: string;
  type: 'show' | 'flight' | 'hotel';
  title: string;
  date: Date;
  location?: string;
  venue?: string;
  time?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  gate?: string;
  terminal?: string;
}

interface WhatsNextProps {
  events?: Event[];
}

// Función para convertir Show a Event
const showToEvent = (show: Show): Event => {
  const showDate = typeof show.date === 'string' ? parseISO(show.date) : new Date(show.date);
  
  return {
    id: show.id,
    type: 'show',
    title: show.name || `${show.city}, ${show.country}`,
    date: showDate,
    location: `${show.city}, ${show.country}`,
    venue: show.venue || undefined,
    time: format(showDate, 'HH:mm'),
  };
};

export const WhatsNext: React.FC<WhatsNextProps> = ({ events: propEvents }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [shows, setShows] = useState<Show[]>([]);
  
  // Suscribirse a showStore para obtener shows reales
  useEffect(() => {
    const updateShows = (allShows: Show[]) => {
      setShows(allShows);
    };
    
    // Obtener shows iniciales
    updateShows(showStore.getAll());
    
    // Suscribirse a cambios
    const unsubscribe = showStore.subscribe(updateShows);
    
    return () => unsubscribe();
  }, []);
  
  // Convertir shows a events y combinar con propEvents
  const showEvents = shows
    .filter(show => {
      const showDate = typeof show.date === 'string' ? parseISO(show.date) : show.date;
      return isFuture(showDate); // Solo shows futuros
    })
    .map(showToEvent)
    .sort((a, b) => a.date.getTime() - b.date.getTime()) // Ordenar por fecha
    .slice(0, 10); // Máximo 10 eventos
  
  const events = propEvents || showEvents;
  
  const eventsPerPage = 2;
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const currentEvents = events.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Resize functions desactivadas
  /*
  const handleResizeDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newHeight = widgetHeight + info.delta.y;
    const clampedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
    setWidgetHeight(clampedHeight);
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };
  */

  const renderEvent = (event: Event) => {
    const isShow = event.type === 'show';
    const isFlight = event.type === 'flight';

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white/5 backdrop-blur-md rounded-[20px] p-4 border border-white/10 hover:border-accent-500/40 hover:bg-white/8 transition-all duration-300 cursor-pointer gpu-accelerate"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <motion.div 
            className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
              isShow ? 'bg-accent-500/20' : 'bg-blue-500/20'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {isShow ? (
              <Calendar className="w-5.5 h-5.5 text-accent-500" strokeWidth={2.5} />
            ) : (
              <Plane className="w-5.5 h-5.5 text-blue-400" strokeWidth={2.5} />
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title & Date */}
            <h3 className="font-bold text-white text-[15px] truncate leading-tight">{event.title}</h3>
            <p className="text-xs text-white/60 mt-1 font-medium">
              {format(event.date, "EEEE, d 'de' MMMM", { locale: es })}
            </p>

            {/* Details */}
            <div className="mt-2.5 space-y-1.5">
              {isShow && (
                <>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                    <span className="truncate font-medium">{event.venue}</span>
                  </div>
                </>
              )}

              {isFlight && (
                <>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className="font-mono font-semibold">{event.from}</span>
                    <div className="flex-1 h-px bg-white/20" />
                    <Plane className="w-3 h-3" strokeWidth={2} />
                    <div className="flex-1 h-px bg-white/20" />
                    <span className="font-mono font-semibold">{event.to}</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {event.flightNumber} • {event.gate}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Time Badge */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-white">
              {format(event.date, 'HH:mm')}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide">
              {format(event.date, 'dd MMM', { locale: es })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (events.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-white/60">No hay eventos próximos</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl h-full"
    >
      {/* Contenido del widget con scroll */}
      <div className="h-full overflow-y-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-accent-500" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">What's Next</h2>
              <p className="text-[10px] text-white/50 font-medium">Próximos eventos</p>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <motion.button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-4 h-4 text-white" strokeWidth={2.5} />
              </motion.button>
              <div className="text-xs text-white/70 px-2 font-mono font-semibold min-w-[36px] text-center">
                {currentPage + 1}/{totalPages}
              </div>
              <motion.button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Events List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-3"
          >
            {currentEvents.map(renderEvent)}
          </motion.div>
        </AnimatePresence>

        {/* Page Indicators */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 pt-4 border-t border-white/5">
            {Array.from({ length: totalPages }).map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentPage(index)}
                className="h-1 rounded-full transition-all"
                initial={false}
                animate={{
                  width: index === currentPage ? 16 : 4,
                  backgroundColor: index === currentPage 
                    ? 'rgba(191, 255, 0, 0.8)' 
                    : 'rgba(255, 255, 255, 0.2)',
                }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resize desactivado - todo comentado */}
      {/*
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-8 cursor-ns-resize flex items-center justify-center group"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleResizeDrag}
        onDragStart={handleResizeStart}
        onDragEnd={handleResizeEnd}
        whileHover={{ backgroundColor: 'rgba(191, 255, 0, 0.1)' }}
      >
        <div className="flex items-center gap-1">
          <motion.div 
            className="w-12 h-1 rounded-full bg-white/20 group-hover:bg-accent-500/50 transition-colors"
            animate={{
              backgroundColor: isResizing ? 'rgba(191, 255, 0, 0.8)' : 'rgba(255, 255, 255, 0.2)',
              height: isResizing ? 6 : 4,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        </div>
        {isResizing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent-500 text-black text-xs font-bold px-3 py-1 rounded-full"
          >
            {widgetHeight}px
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-0 right-0 w-12 h-12 cursor-nwse-resize group"
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleResizeDrag}
        onDragStart={handleResizeStart}
        onDragEnd={handleResizeEnd}
      >
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <Maximize2 
            className="w-4 h-4 text-white/20 group-hover:text-accent-500/50 transition-colors" 
            strokeWidth={2}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-12 h-12 cursor-nesw-resize group"
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleResizeDrag}
        onDragStart={handleResizeStart}
        onDragEnd={handleResizeEnd}
      >
        <div className="absolute bottom-2 left-2 pointer-events-none rotate-90">
          <Maximize2 
            className="w-4 h-4 text-white/20 group-hover:text-accent-500/50 transition-colors" 
            strokeWidth={2}
          />
        </div>
      </motion.div>
      */}
    </div>
  );
};
