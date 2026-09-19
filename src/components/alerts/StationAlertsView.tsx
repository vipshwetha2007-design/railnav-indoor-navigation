import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { StationAlert } from '../../types/navigation';
import {
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Train,
  CheckCircle,
  Accessibility,
  Footprints,
} from 'lucide-react';

export const StationAlertsView: React.FC = () => {
  const { alerts, demoSimulatePlatformChange, demoCloseCorridorB, demoSimulateCrowdSpike } =
    useNavigation();

  const handleAlertAction = (alert: StationAlert) => {
    if (alert.isPlatformChange) {
      demoSimulatePlatformChange();
    } else if (alert.affectedEdgeId === 'e_concourse_corridor_b') {
      demoCloseCorridorB();
    } else if (alert.affectedEdgeId === 'e_vert_stairs_a') {
      demoSimulateCrowdSpike();
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 space-y-3 pb-36 sm:pb-32">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white">Live Station Advisories</h2>
          <p className="text-xs text-slate-400">
            Real-time operations, track reassignments and crowd notices
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {alerts.length} Active Alerts
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isUrgent = alert.severity === 'urgent';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                isUrgent
                  ? 'bg-red-950/30 border-red-500/40'
                  : isWarning
                  ? 'bg-amber-950/25 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isUrgent
                      ? 'bg-red-500/20 text-red-400'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {isUrgent ? (
                    <AlertTriangle size={18} />
                  ) : isWarning ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <Info size={18} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white leading-snug truncate">
                      {alert.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock size={11} />
                      {alert.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Contextual Action Button */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Area: <span className="text-slate-200">{alert.affectedArea || 'Station-wide'}</span>
                    </span>

                    <button
                      onClick={() => handleAlertAction(alert)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 hover:border-cyan-500/50"
                    >
                      <span>Simulate Impact</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
