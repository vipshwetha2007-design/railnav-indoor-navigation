import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { TrainInfo } from '../../types/navigation';
import {
  Train,
  Search,
  Clock,
  MapPin,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface TrainSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export const TrainSearchModal: React.FC<TrainSearchModalProps> = ({
  isOpen,
  onClose,
  inline = false,
}) => {
  const { trains, navigateToTrain } = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredTrains = trains.filter(
    (t) =>
      t.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTrain = (train: TrainInfo) => {
    navigateToTrain(train);
    onClose();
  };

  const modalContent = (
    <div
      className={`w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col ${
        inline ? 'max-w-2xl mx-auto' : 'max-w-lg max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Train size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Station Train Schedules</h3>
            <p className="text-xs text-slate-400">Search train number or destination</p>
          </div>
        </div>
        {!inline && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

        {/* Input */}
        <div className="my-3 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            id="train-number-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. 12345 or Capital Superfast…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500 transition-all"
            autoFocus
          />
        </div>

        {/* Train List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredTrains.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No train schedules found matching "{searchQuery}".
            </div>
          ) : (
            filteredTrains.map((train) => (
              <div
                key={train.id}
                className="p-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition-all flex flex-col gap-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {train.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold text-[11px]">
                        #{train.trainNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-cyan-400" />
                        {train.destination}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-emerald-400" />
                        {train.scheduledTime}
                      </span>
                    </div>
                  </div>

                  {/* Platform Badge */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Track</span>
                    <div className="text-lg font-black text-cyan-400">P{train.platform}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      train.status === 'Platform Changed'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : train.status === 'Boarding'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {train.status === 'Platform Changed' ? (
                      <AlertCircle size={11} />
                    ) : (
                      <CheckCircle2 size={11} />
                    )}
                    {train.status}
                  </span>

                  <button
                    onClick={() => handleSelectTrain(train)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <span>Navigate to Platform {train.platform}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );

  if (inline) {
    return modalContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      {modalContent}
    </div>
  );
};
