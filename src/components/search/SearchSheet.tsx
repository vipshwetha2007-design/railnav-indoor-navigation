import React, { useState, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { StationNode, POICategory } from '../../types/navigation';
import {
  Search,
  Train,
  Utensils,
  Ticket,
  Armchair,
  Bath,
  CreditCard,
  ArrowUpDown,
  ChevronsUp,
  DoorOpen,
  HelpCircle,
  Accessibility,
  ArrowRight,
  X,
  Footprints,
} from 'lucide-react';

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchSheet: React.FC<SearchSheetProps> = ({ isOpen, onClose }) => {
  const { nodes, trains, selectDestination, navigateToTrain, setSelectedPOI } = useNavigation();
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter POIs
  const filteredPOIs = useMemo(() => {
    return nodes
      .filter((n) => n.isPOI)
      .filter((node) => {
        const matchesQuery =
          !query ||
          node.name.toLowerCase().includes(query.toLowerCase()) ||
          (node.shortName && node.shortName.toLowerCase().includes(query.toLowerCase())) ||
          (node.description && node.description.toLowerCase().includes(query.toLowerCase()));

        const matchesCat =
          selectedCategory === 'all' ||
          (selectedCategory === 'platform' && node.type === 'platform') ||
          (selectedCategory === 'facility' && (node.type === 'toilet' || node.type === 'waiting_hall')) ||
          (selectedCategory === 'food' && node.type === 'food_court') ||
          (selectedCategory === 'services' && (node.type === 'ticket_counter' || node.type === 'help_desk' || node.type === 'atm')) ||
          (selectedCategory === 'vertical' && (node.type === 'lift' || node.type === 'stairs' || node.type === 'escalator'));

        return matchesQuery && matchesCat;
      });
  }, [nodes, query, selectedCategory]);

  // Filter Trains matching query
  const filteredTrains = useMemo(() => {
    if (!query) return trains.slice(0, 3);
    return trains.filter(
      (t) =>
        t.trainNumber.toLowerCase().includes(query.toLowerCase()) ||
        t.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [trains, query]);

  if (!isOpen) return null;

  const handleSelectNode = (node: StationNode) => {
    setSelectedPOI(node);
    selectDestination(node);
    onClose();
  };

  const handleSelectTrain = (train: (typeof trains)[0]) => {
    navigateToTrain(train);
    onClose();
  };

  const renderIcon = (iconName?: string) => {
    const size = 18;
    switch (iconName) {
      case 'Train':
        return <Train size={size} className="text-cyan-400" />;
      case 'Utensils':
        return <Utensils size={size} className="text-amber-400" />;
      case 'Ticket':
        return <Ticket size={size} className="text-emerald-400" />;
      case 'Armchair':
        return <Armchair size={size} className="text-purple-400" />;
      case 'Bath':
        return <Bath size={size} className="text-sky-400" />;
      case 'CreditCard':
        return <CreditCard size={size} className="text-yellow-400" />;
      case 'ArrowUpDown':
        return <ArrowUpDown size={size} className="text-teal-300" />;
      case 'ChevronsUp':
        return <ChevronsUp size={size} className="text-blue-400" />;
      case 'DoorOpen':
        return <DoorOpen size={size} className="text-emerald-300" />;
      case 'HelpCircle':
        return <HelpCircle size={size} className="text-indigo-300" />;
      default:
        return <Footprints size={size} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-150">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto w-full p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="station-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search platforms, trains, food, toilets, lifts…"
              className="w-full pl-10 pr-10 py-3 bg-slate-900 rounded-2xl border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500 transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            Cancel
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Locations' },
            { id: 'platform', label: 'Platforms (1-6)' },
            { id: 'food', label: 'Food & Dining' },
            { id: 'facility', label: 'Restrooms & Lounges' },
            { id: 'services', label: 'Tickets & Help' },
            { id: 'vertical', label: 'Lifts & Escalators' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full overflow-y-auto p-4 space-y-4">
        {/* Train Matches Section */}
        {filteredTrains.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Matching Trains</span>
              <span className="text-emerald-400 font-medium text-[11px]">Direct Platform Routing</span>
            </div>
            <div className="space-y-2">
              {filteredTrains.map((train) => (
                <div
                  key={train.id}
                  onClick={() => handleSelectTrain(train)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-850 rounded-2xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Train size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{train.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          #{train.trainNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Departs {train.scheduledTime} • {train.destination}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Platform</span>
                      <div className="text-base font-black text-cyan-400">P{train.platform}</div>
                    </div>
                    <ArrowRight size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POI Destinations List */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Station Locations & Facilities ({filteredPOIs.length})
          </div>

          {filteredPOIs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No locations found matching "{query}".</p>
              <p className="text-xs text-slate-500 mt-1">Try searching "Platform", "Toilet", "Lift", or "Food".</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPOIs.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className="p-3 bg-slate-900/70 hover:bg-slate-850 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {renderIcon(node.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {node.name}
                        </span>
                        {node.isAccessible && (
                          <span title="Wheelchair Accessible" className="inline-flex">
                            <Accessibility size={13} className="text-teal-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Level {node.floor} • {node.description || (node.floor === 0 ? 'Main Concourse' : 'Elevated Overpass')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                      L{node.floor}
                    </span>
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
