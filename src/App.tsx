import React, { useState } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { StationIndoorMap } from './components/map/StationIndoorMap';
import { TurnByTurnBanner } from './components/navigation/TurnByTurnBanner';
import { DestinationBottomSheet } from './components/navigation/DestinationBottomSheet';
import { ArrivedModal } from './components/navigation/ArrivedModal';
import { ARNavigationOverlay } from './components/ar/ARNavigationOverlay';
import { DemoControlPanel } from './components/demo/DemoControlPanel';
import { PassengerHome } from './components/home/PassengerHome';
import { SearchSheet } from './components/search/SearchSheet';
import { TrainSearchModal } from './components/trains/TrainSearchModal';
import { StationAlertsView } from './components/alerts/StationAlertsView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { AuthModal } from './components/auth/AuthModal';
import {
  Home,
  Map,
  Train,
  AlertTriangle,
  User,
  Search,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

type TabType = 'home' | 'map' | 'trains' | 'alerts' | 'profile';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isTrainSearchOpen, setIsTrainSearchOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const {
    navigationStatus,
    destination,
    isVoiceMuted,
    toggleVoiceMuted,
    alerts,
    userPreferences,
    updateUserPreferences,
  } = useNavigation();

  const isNavigating = navigationStatus === 'navigating';

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Application Bar */}
      <header className="h-14 sm:h-16 flex-shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Train size={18} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>RailNav</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none">
                Metro Central Junction
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Navigation Badge */}
        {isNavigating && (
          <div
            onClick={() => setActiveTab('map')}
            className="cursor-pointer px-3 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 rounded-full flex items-center gap-2 text-xs text-cyan-300 font-bold animate-pulse transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="hidden sm:inline">Navigating:</span>
            <span className="text-white truncate max-w-[120px]">
              {destination?.shortName || destination?.name}
            </span>
          </div>
        )}

        {/* Top Right Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search trigger */}
          <button
            id="top-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all"
            title="Search destinations"
          >
            <Search size={18} />
          </button>

          {/* Voice guidance toggle */}
          <button
            onClick={toggleVoiceMuted}
            className={`p-2 rounded-xl transition-all ${
              !isVoiceMuted
                ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30'
                : 'text-slate-400 bg-slate-800/80 hover:text-white'
            }`}
            title={isVoiceMuted ? 'Voice is muted' : 'Voice guidance enabled'}
          >
            {!isVoiceMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Passenger Account Switcher */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-black text-xs flex items-center justify-center border border-cyan-400/30 hover:scale-105 transition-all"
            title="Passenger Account"
          >
            {userPreferences.passengerName.charAt(0)}
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* TAB 1: Passenger Home View */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto">
            <PassengerHome
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenTrainSearch={() => setIsTrainSearchOpen(true)}
              onSwitchToMap={() => setActiveTab('map')}
              onOpenAlerts={() => setActiveTab('alerts')}
            />
          </div>
        )}

        {/* TAB 2: Station Indoor Map & Turn-by-Turn Navigation */}
        {activeTab === 'map' && (
          <div className="flex-1 relative flex flex-col h-full overflow-hidden">
            {/* Turn by Turn HUD Banner (When navigating) */}
            {isNavigating && <TurnByTurnBanner />}

            {/* Interactive SVG Station Map */}
            <div className="flex-1 relative h-full">
              <StationIndoorMap />
            </div>

            {/* Destination Selection Details Bottom Sheet */}
            <DestinationBottomSheet />
          </div>
        )}

        {/* TAB 3: Train Schedules & Platform Guide */}
        {activeTab === 'trains' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-36 sm:pb-32">
            {/* Render full train schedule list inline */}
            <TrainSearchModal
              isOpen={true}
              inline={true}
              onClose={() => setActiveTab('map')}
            />
          </div>
        )}

        {/* TAB 4: Live Station Advisories */}
        {activeTab === 'alerts' && (
          <div className="flex-1 overflow-y-auto pb-20">
            <StationAlertsView />
          </div>
        )}

        {/* TAB 5: Profile & Settings */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto">
            <ProfileSettingsView onLogout={() => setIsAuthOpen(true)} />
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="h-16 flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 px-2 sm:px-6 flex items-center justify-around z-30">
        {/* Tab: Home */}
        <button
          id="nav-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${
            activeTab === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[11px] mt-1">Home</span>
        </button>

        {/* Tab: Map */}
        <button
          id="nav-tab-map"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-16 py-1 relative transition-all ${
            activeTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Map size={20} className={activeTab === 'map' ? 'stroke-[2.5]' : 'stroke-2'} />
            {isNavigating && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900 animate-ping" />
            )}
          </div>
          <span className="text-[11px] mt-1">
            {isNavigating ? 'Navigating' : 'Map'}
          </span>
        </button>

        {/* Tab: Trains */}
        <button
          id="nav-tab-trains"
          onClick={() => setActiveTab('trains')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${
            activeTab === 'trains' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Train size={20} className={activeTab === 'trains' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[11px] mt-1">Trains</span>
        </button>

        {/* Tab: Advisories */}
        <button
          id="nav-tab-alerts"
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center justify-center w-16 py-1 relative transition-all ${
            activeTab === 'alerts' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <AlertTriangle size={20} className={activeTab === 'alerts' ? 'stroke-[2.5]' : 'stroke-2'} />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                {alerts.length}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1">Advisories</span>
        </button>

        {/* Tab: Profile */}
        <button
          id="nav-tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${
            activeTab === 'profile' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
          <span className="text-[11px] mt-1">Profile</span>
        </button>
      </nav>

      {/* Global Modals & Overlays */}
      <SearchSheet isOpen={isSearchOpen} onClose={() => { setIsSearchOpen(false); setActiveTab('map'); }} />
      <TrainSearchModal isOpen={isTrainSearchOpen} onClose={() => { setIsTrainSearchOpen(false); setActiveTab('map'); }} />
      <AuthModal isOpen={isAuthOpen} onSuccess={() => setIsAuthOpen(false)} />
      <ARNavigationOverlay />
      <ArrivedModal />

      {/* Dedicated Hackathon Judge Simulation Controls */}
      <DemoControlPanel />
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
