// components/ExperimentLog.tsx
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ScrollText, Plus, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';

export interface LogEntry {
  id: number;
  timestamp: Date;
  params: {
    wavelength: number;
    slitDistance: number;
    observerOn: boolean;
  };
  stats: {
    totalParticles: number;
    fringeCount: number;
    contrast: number;
  };
  note?: string;
}

interface ExperimentLogProps {
  stats: DoubleSlitStats;
  params: DoubleSlitParams;
  entries: LogEntry[];
  onAddEntry: (entry: LogEntry) => void;
  onClearEntries: () => void;
  onDeleteEntry: (id: number) => void;
}

export function ExperimentLog({ 
  stats, 
  params, 
  entries, 
  onAddEntry, 
  onClearEntries,
  onDeleteEntry 
}: ExperimentLogProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(true);
  const [note, setNote] = useState('');
  const nextId = useRef(1);
  
  const labels = {
    title: lang === 'ru' ? '📋 Журнал эксперимента' : '📋 Experiment Log',
    addEntry: lang === 'ru' ? 'Записать измерение' : 'Record measurement',
    clear: lang === 'ru' ? 'Очистить' : 'Clear',
    noEntries: lang === 'ru' ? 'Нет записей. Проведите измерения и нажмите "Записать".' : 'No entries. Take measurements and click "Record".',
    note: lang === 'ru' ? 'Заметка (опционально)' : 'Note (optional)',
    particles: lang === 'ru' ? 'Частиц' : 'Particles',
    fringes: lang === 'ru' ? 'Полос' : 'Fringes',
    contrast: lang === 'ru' ? 'Контраст' : 'Contrast',
    detector: lang === 'ru' ? 'Детектор' : 'Detector',
    on: lang === 'ru' ? 'ВКЛ' : 'ON',
    off: lang === 'ru' ? 'ВЫКЛ' : 'OFF',
    entry: lang === 'ru' ? 'Запись' : 'Entry',
  };

  const handleAddEntry = () => {
    if (stats.totalParticles < 10) return; // Need some data
    
    const entry: LogEntry = {
      id: nextId.current++,
      timestamp: new Date(),
      params: {
        wavelength: params.wavelength,
        slitDistance: params.slitDistance,
        observerOn: params.observerOn,
      },
      stats: {
        totalParticles: stats.totalParticles,
        fringeCount: stats.fringeCount,
        contrast: stats.contrast,
      },
      note: note.trim() || undefined,
    };
    
    onAddEntry(entry);
    setNote('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-emerald-500/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-emerald-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ScrollText size={20} className="text-emerald-400" />
          {labels.title}
          <span className="text-sm font-normal text-emerald-300">({entries.length})</span>
        </h3>
        {expanded ? <ChevronUp size={20} className="text-emerald-300" /> : <ChevronDown size={20} className="text-emerald-300" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Add entry controls */}
          <div className="space-y-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={labels.note}
              className="w-full px-3 py-2 bg-emerald-800/40 border border-emerald-600/30 rounded-lg text-sm text-white placeholder-emerald-400/60 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEntry}
                disabled={stats.totalParticles < 10}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
              >
                <Plus size={16} />
                {labels.addEntry}
              </button>
              {entries.length > 0 && (
                <button
                  onClick={onClearEntries}
                  className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg text-sm text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Current state preview */}
          <div className="bg-emerald-800/30 rounded-lg p-2 text-xs">
            <div className="grid grid-cols-4 gap-2 text-emerald-200">
              <div>λ={params.wavelength}nm</div>
              <div>d={params.slitDistance}mm</div>
              <div>{labels.particles}: {stats.totalParticles}</div>
              <div>{labels.fringes}: {stats.fringeCount}</div>
            </div>
          </div>

          {/* Entries list */}
          <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
            {entries.length === 0 ? (
              <p className="text-sm text-emerald-400/70 text-center py-4">
                {labels.noEntries}
              </p>
            ) : (
              entries.slice().reverse().map((entry, idx) => (
                <div 
                  key={entry.id}
                  className="bg-emerald-800/40 rounded-lg p-3 text-sm border border-emerald-700/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-300 font-medium">
                      #{entries.length - idx}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400/70 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(entry.timestamp)}
                      </span>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="text-emerald-200">
                      λ = <span className="text-white font-mono">{entry.params.wavelength}</span> nm
                    </div>
                    <div className="text-emerald-200">
                      d = <span className="text-white font-mono">{entry.params.slitDistance}</span> mm
                    </div>
                    <div className="text-emerald-200">
                      {labels.particles}: <span className="text-white font-mono">{entry.stats.totalParticles}</span>
                    </div>
                    <div className="text-emerald-200">
                      {labels.fringes}: <span className="text-white font-mono">{entry.stats.fringeCount}</span>
                    </div>
                    <div className="text-emerald-200">
                      {labels.contrast}: <span className="text-white font-mono">{Math.round(entry.stats.contrast * 100)}%</span>
                    </div>
                    <div className={entry.params.observerOn ? 'text-orange-300' : 'text-cyan-300'}>
                      {labels.detector}: {entry.params.observerOn ? labels.on : labels.off}
                    </div>
                  </div>
                  
                  {entry.note && (
                    <div className="mt-2 pt-2 border-t border-emerald-700/30 text-xs text-emerald-300 italic">
                      "{entry.note}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
