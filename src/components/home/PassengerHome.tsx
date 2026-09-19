import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { DEMO_STATION } from '../../data/stationData';
import {
  Search,
  Train,
  Clock,
  MapPin,
  ArrowRight,
  Accessibility,
  Utensils,
  Armchair,
  Ticket,
  CreditCard,
  HelpCircle,
  DoorOpen,
  ArrowUpDown,
  ChevronsUp,
  Bath,
  AlertTriangle,
  Compass,
  Sparkles,
  Users,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface PassengerHomeProps {
  onOpenSearch: () => void;
  onOpenTrainSearch: () => void;
  onSwitchToMap: () => void;
  onOpenAlerts: () => void;
}

export const PassengerHome: React.FC<PassengerHomeProps> = ({
  onOpenSearch,
  onOpenTrainSearch,
  onSwitchToMap,
  onOpenAlerts,
}) => {
  const {
    nodes,
    userPreferences,
    activeTrain,
    navigateToTrain,
    selectDestination,
    alerts,
    accessibilityMode,
    setAccessibilityMode,
    avoidCrowds,
    setAvoidCrowds,
  } = useNavigation();

  // Quick categories for 1-click discovery
  const categories = [
    {
      id: 'train_search',
      name: 'Find My Train',
      sub: 'Platform lookup',
      icon: <Train size={20} className="text-cyan-400" />,
      action: onOpenTrainSearch,
    },
    {
      id: 'platform_6',
      name: 'Platform 6',
      sub: 'Level 1 Overpass',
      icon: <Train size={20} className="text-emerald-400" />,
      action: () => {
        const p6 = nodes.find((n) => n.id === 'platform_6');
        if (p6) {
          selectDestination(p6);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'toilets',
      name: 'Restrooms',
      sub: 'L0 & L1 Accessible',
      icon: <Bath size={20} className="text-sky-400" />,
      action: () => {
        const toilet = nodes.find((n) => n.id === 'toilet_l0');
        if (toilet) {
          selectDestination(toilet);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'food_court',
      name: 'Food Court',
      sub: 'Dining & Cafes',
      icon: <Utensils size={20} className="text-amber-400" />,
      action: () => {
        const fc = nodes.find((n) => n.id === 'food_court');
        if (fc) {
          selectDestination(fc);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'waiting_hall',
      name: 'Waiting Hall',
      sub: 'AC Seating & Power',
      icon: <Armchair size={20} className="text-purple-400" />,
      action: () => {
        const wh = nodes.find((n) => n.id === 'waiting_hall');
        if (wh) {
          selectDestination(wh);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'ticket_counter',
      name: 'Ticket Counter',
      sub: 'Booking windows',
      icon: <Ticket size={20} className="text-emerald-400" />,
      action: () => {
        const tc = nodes.find((n) => n.id === 'ticket_counter');
        if (tc) {
          selectDestination(tc);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'atm_kiosk',
      name: 'ATM / Cash',
      sub: 'Banking alcove',
      icon: <CreditCard size={20} className="text-yellow-400" />,
      action: () => {
        const atm = nodes.find((n) => n.id === 'atm_kiosk');
        if (atm) {
          selectDestination(atm);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'help_desk',
      name: 'Help Desk',
      sub: 'Information center',
      icon: <HelpCircle size={20} className="text-indigo-400" />,
      action: () => {
        const hd = nodes.find((n) => n.id === 'help_desk');
        if (hd) {
          selectDestination(hd);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'lift_1',
      name: 'Elevator / Lift',
      sub: 'Step-free transit',
      icon: <ArrowUpDown size={20} className="text-teal-400" />,
      action: () => {
        const lift = nodes.find((n) => n.id === 'lift_1_l0');
        if (lift) {
          selectDestination(lift);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'escalator_1',
      name: 'Escalator',
      sub: 'Up to Footbridge',
      icon: <ChevronsUp size={20} className="text-blue-400" />,
      action: () => {
        const esc = nodes.find((n) => n.id === 'escalator_1_l0');
        if (esc) {
          selectDestination(esc);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'accessible_corridor',
      name: 'Accessible Ramp',
      sub: 'Wide gentle passage',
      icon: <Accessibility size={20} className="text-cyan-400" />,
      action: () => {
        const ramp = nodes.find((n) => n.id === 'accessible_corridor_node');
        if (ramp) {
          selectDestination(ramp);
          onSwitchToMap();
        }
      },
    },
    {
      id: 'exit_east',
      name: 'Exit Gate East',
      sub: 'City bus & taxi',
      icon: <DoorOpen size={20} className="text-rose-400" />,
      action: () => {
        const exit = nodes.find((n) => n.id === 'exit_east');
        if (exit) {
          selectDestination(exit);
          onSwitchToMap();
        }
      },
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-5 pb-36 sm:pb-32 animate-in fade-in duration-200">
      {/* Station Selector & Passenger Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-0.5">
            <MapPin size={13} className="text-cyan-400" />
            <span>Currently Navigating</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white">
              {DEMO_STATION.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
              Demo Station
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Welcome,</div>
          <div className="text-sm font-bold text-white truncate max-w-[120px]">
            {userPreferences.passengerName.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* Big Search Bar: "Where do you want to go?" */}
      <div
        id="home-search-bar"
        onClick={onOpenSearch}
        className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-500/50 shadow-xl cursor-pointer flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Search size={20} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
              Where do you want to go?
            </div>
            <div className="text-xs text-slate-400">
              Search Platform 6, Express 12345, Restrooms, Lifts…
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white">
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Active Train Card (Express 12345) */}
      {activeTrain && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border border-cyan-500/30 p-4 sm:p-5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1">
                <Train size={12} /> Active Train Ticket
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {activeTrain.status}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">Departs {activeTrain.scheduledTime}</span>
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {activeTrain.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Destination: {activeTrain.destination} • Coach 1 to {activeTrain.coachCount}
              </p>
            </div>
            <div className="text-right flex-shrink-0 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Platform</span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400">P{activeTrain.platform}</div>
            </div>
          </div>

          {/* Navigate to Platform Button */}
          <button
            id="navigate-train-btn"
            onClick={() => {
              navigateToTrain(activeTrain);
              onSwitchToMap();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>Navigate to Platform {activeTrain.platform}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Live Station Advisories Ticker */}
      {alerts.length > 0 && (
        <div
          onClick={onOpenAlerts}
          className="p-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-2xl cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AlertTriangle size={17} className="text-amber-400 flex-shrink-0" />
            <div className="truncate text-xs">
              <span className="font-bold text-amber-300 mr-1.5">Station Advisory:</span>
              <span className="text-slate-300">{alerts[0].title}</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-400 flex-shrink-0 ml-2" />
        </div>
      )}

      {/* Quick Route Preference Toggles */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={() => setAccessibilityMode(!accessibilityMode)}
          className={`p-3 rounded-2xl border flex items-center gap-2.5 font-bold transition-all ${
            accessibilityMode
              ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Accessibility size={18} className={accessibilityMode ? 'text-teal-300' : 'text-slate-400'} />
          <div className="text-left">
            <div>Step-Free Mode</div>
            <div className="text-[10px] font-normal text-slate-400">
              {accessibilityMode ? 'Active (Lifts only)' : 'Inactive'}
            </div>
          </div>
        </button>

        <button
          onClick={() => setAvoidCrowds(!avoidCrowds)}
          className={`p-3 rounded-2xl border flex items-center gap-2.5 font-bold transition-all ${
            avoidCrowds
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users size={18} className={avoidCrowds ? 'text-amber-300' : 'text-slate-400'} />
          <div className="text-left">
            <div>Avoid Crowds</div>
            <div className="text-[10px] font-normal text-slate-400">
              {avoidCrowds ? 'Reroute around spikes' : 'Direct path'}
            </div>
          </div>
        </button>
      </div>

      {/* Station Facility Explorer Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Explore Station Facilities
          </h2>
          <span className="text-xs text-slate-400 font-medium">12 Key POIs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {categories.map((item) => (
            <div
              key={item.id}
              onClick={item.action}
              className="p-3 bg-slate-900/80 hover:bg-slate-850 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
