import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show } from './SmartShowRow';

interface BoardColumn {
  id: Show['status'];
  title: string;
  color: string;
  shows: Show[];
}

interface BoardViewProps {
  shows: Show[];
  onShowMove: (showId: string, newStatus: Show['status']) => void;
  onShowClick: (show: Show) => void;
  onEdit: (show: Show) => void;
  onViewTasks: (show: Show) => void;
  onViewFinance: (show: Show) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  shows,
  onShowMove,
  onShowClick,
  onEdit,
  onViewTasks,
  onViewFinance
}) => {
  const [draggedShow, setDraggedShow] = useState<Show | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Show['status'] | null>(null);

  const columns: BoardColumn[] = [
    {
      id: 'planned',
      title: 'Planned',
      color: 'border-slate-500 bg-slate-500/10',
      shows: shows.filter(show => show.status === 'planned')
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      color: 'border-blue-500 bg-blue-500/10',
      shows: shows.filter(show => show.status === 'confirmed')
    },
    {
      id: 'on_sale',
      title: 'On Sale',
      color: 'border-green-500 bg-green-500/10',
      shows: shows.filter(show => show.status === 'on_sale')
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      color: 'border-amber-500 bg-amber-500/10',
      shows: shows.filter(show => show.status === 'upcoming')
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'border-emerald-500 bg-emerald-500/10',
      shows: shows.filter(show => show.status === 'completed')
    }
  ];

  const handleDragStart = (show: Show) => {
    setDraggedShow(show);
  };

  const handleDragEnd = () => {
    if (draggedShow && dragOverColumn && draggedShow.status !== dragOverColumn) {
      onShowMove(draggedShow.id, dragOverColumn);
    }
    setDraggedShow(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: Show['status']) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full">
      {columns.map((column, columnIndex) => (
        <motion.div
          key={column.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: columnIndex * 0.05 }}
          className={`flex flex-col rounded-xl border-2 ${column.color} min-h-[600px]`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={handleDragEnd}
        >
          {/* Column Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                {column.shows.length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <AnimatePresence>
              {column.shows.map((show, showIndex) => (
                <motion.div
                  key={show.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  draggable
                  onDragStart={() => handleDragStart(show)}
                  onClick={() => onShowClick(show)}
                  className={`bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group relative ${
                    draggedShow?.id === show.id ? 'opacity-50' : ''
                  } ${
                    dragOverColumn === column.id && draggedShow ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                >
                  {/* Health Indicator */}
                  <div className={`w-2 h-8 rounded-full mb-3 ${
                    show.priority === 'critical' ? 'bg-red-500' :
                    show.priority === 'high' ? 'bg-amber-500' :
                    show.ticketSalesPercentage < 50 ? 'bg-amber-500' :
                    'bg-green-500'
                  }`} />

                  {/* Show Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-white text-sm leading-tight">
                      {show.name}
                    </h4>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(show.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{show.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏟️</span>
                        <span className="truncate">{show.venue}</span>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-xs">
                        <span>🎫</span>
                        <span className="text-white font-medium">{show.ticketSalesPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span>💰</span>
                        <span className={`font-medium ${
                          show.projectedMargin >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {show.projectedMargin >= 0 ? '+' : ''}{show.projectedMargin}%
                        </span>
                      </div>
                    </div>

                    {/* Task Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Tasks</span>
                        <span>{show.tasksCompleted}/{show.totalTasks}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${
                            (show.tasksCompleted / show.totalTasks) === 1 ? 'bg-green-500' :
                            (show.tasksCompleted / show.totalTasks) > 0.7 ? 'bg-blue-500' :
                            (show.tasksCompleted / show.totalTasks) > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(show.tasksCompleted / show.totalTasks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(show);
                      }}
                      className="p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewTasks(show);
                      }}
                      className="p-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-xs"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewFinance(show);
                      }}
                      className="p-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs"
                    >
                      💰
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {column.shows.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-slate-400"
              >
                <div className="text-2xl mb-2">📭</div>
                <div className="text-sm">No shows in {column.title.toLowerCase()}</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
