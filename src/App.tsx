import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_PLAYERS, 
  BASEBALL_POSITIONS, 
  OAKLAND_2002_INITIAL_ROSTER,
  OAKLAND_MODERN_PRESET
} from './data';
import { Player } from './types';
import { getPlayerImageUrl } from './lib/images';
import PlayerProfile from './components/PlayerProfile';
import TeamBuilder from './components/TeamBuilder';
import WarRoom from './components/WarRoom';
import YankeesSimulator from './components/YankeesSimulator';
import { 
  Building, 
  Search, 
  DollarSign, 
  TrendingUp, 
  HelpCircle, 
  X, 
  ChevronDown, 
  Maximize2, 
  Users,
  Target,
  FileSpreadsheet,
  Plus,
  Play
} from 'lucide-react';

export default function App() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(INITIAL_PLAYERS[0]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('All');
  const [selectedTagFilter, setSelectedTagFilter] = useState('All');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  // Active general view tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'roster' | 'simulator'>('catalog');

  // Signed Roster state persists in localStorage
  const [signedPlayerIds, setSignedPlayerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('moneyball_roster_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return OAKLAND_2002_INITIAL_ROSTER.playerIds;
      }
    }
    return OAKLAND_2002_INITIAL_ROSTER.playerIds;
  });

  // AI War room trigger states
  const [warRoomOpen, setWarRoomOpen] = useState(false);
  const [warRoomPlayer, setWarRoomPlayer] = useState<Player | null>(null);

  // Sync roster ids to localStorage
  useEffect(() => {
    localStorage.setItem('moneyball_roster_ids', JSON.stringify(signedPlayerIds));
  }, [signedPlayerIds]);

  // Derived roster players state
  const signedPlayers = players.filter(p => signedPlayerIds.includes(p.id));

  // Handler functions
  const handleAddToRoster = (player: Player) => {
    if (!signedPlayerIds.includes(player.id)) {
      setSignedPlayerIds([...signedPlayerIds, player.id]);
    }
  };

  const handleRemoveFromRoster = (player: Player) => {
    setSignedPlayerIds(signedPlayerIds.filter(id => id !== player.id));
  };

  const handleQuickLoadOaklandPreset = () => {
    setSignedPlayerIds(OAKLAND_2002_INITIAL_ROSTER.playerIds);
  };

  const handleQuickLoadModernPreset = () => {
    setSignedPlayerIds(OAKLAND_MODERN_PRESET.playerIds);
  };

  const handleClearRoster = () => {
    setSignedPlayerIds([]);
  };

  const handleOpenWarRoomForPlayer = (player: Player) => {
    setWarRoomPlayer(player);
    setWarRoomOpen(true);
  };

  const handleOpenWarRoomForTeam = () => {
    setWarRoomPlayer(null); // Indicates whole-team evaluation
    setWarRoomOpen(true);
  };

  // Filter players list for dropdown search & catalog list
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          player.detailedPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.team.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPosition = selectedPositionFilter === 'All' || player.position === selectedPositionFilter;
    const matchesTag = selectedTagFilter === 'All' || player.tag === selectedTagFilter;

    return matchesSearch && matchesPosition && matchesTag;
  });

  // Derived metrics for team evaluation payload
  const teamSalary = signedPlayers.reduce((acc, p) => acc + p.salary, 0);
  const remainingBudget = 40000000 - teamSalary;
  
  const batters = signedPlayers.filter(p => p.type === 'batter');
  const teamAverageObp = batters.length > 0 
    ? (batters.reduce((acc, p) => acc + p.obp, 0) / batters.length).toFixed(3) 
    : '0.000';
  
  const teamAverageSlg = batters.length > 0
    ? (batters.reduce((acc, p) => acc + p.slg, 0) / batters.length).toFixed(3)
    : '0.000';

  const teamAverageOps = (parseFloat(teamAverageObp) + parseFloat(teamAverageSlg)).toFixed(3);

  // Formulate dynamic win count duplicates for server metadata
  const hasMetAllSlots = ['First Base', 'Second Base', 'Third Base', 'Shortstop', 'Outfield', 'Pitcher'].every(posKey => {
    return signedPlayers.some(p => p.position.includes(posKey) || p.position === posKey);
  });
  
  let tempWins = 65;
  if (batters.length > 0) {
    const obpBonus = (parseFloat(teamAverageObp) - 0.320) * 450;
    const slgBonus = (parseFloat(teamAverageSlg) - 0.400) * 150;
    tempWins = Math.round(65 + obpBonus + slgBonus + (hasMetAllSlots ? 12 : 6));
  }
  const projectedWins = Math.max(0, Math.min(116, tempWins));

  const teamEvaluationMetrics = {
    playerNames: signedPlayers.map(p => p.name),
    budgetRemaining: remainingBudget,
    budgetLimit: 40000000,
    totalSalary: teamSalary,
    averageObp: parseFloat(teamAverageObp),
    averageSlg: parseFloat(teamAverageSlg),
    averageOps: parseFloat(teamAverageOps),
    projectedWins: projectedWins
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans relative antialiased selection:bg-emerald-500/25">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/3 rounded-full filter blur-3xl pointer-events-none" />

      {/* Main minimal modern Header bar */}
      <header className="border-b border-white/10 bg-[#0F0F12]/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo element */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-black border-b border-emerald-600 shadow-lg shadow-emerald-500/10 select-none">
              M
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight uppercase italic text-emerald-400 flex items-center gap-2">
                MONEYBALL ANALYTICS
                <span className="text-[10px] font-mono text-white font-normal opacity-50 not-italic">
                  v2.4
                </span>
              </h1>
              <p className="text-[11px] text-gray-500 font-mono tracking-wide uppercase">
                Oakland A's Sabermetric Scouting Program • Classic 2002 & Modern Era Database
              </p>
            </div>
          </div>

          {/* Quick Stats overview HUD */}
          <div className="flex flex-wrap items-center gap-5 bg-[#141418] px-4 py-2 rounded-md border border-white/5 text-xs font-mono shadow-md">
            <div>
              <span className="text-gray-500 uppercase tracking-tighter mr-1.5">Roster Limit:</span> 
              <span className="text-white font-bold">$40.00M</span>
            </div>
            <div className="text-white/10">|</div>
            <div>
              <span className="text-gray-500 uppercase tracking-tighter mr-1.5">Roster Payroll:</span> 
              <span className={`${teamSalary > 40000000 ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>
                ${(teamSalary / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="text-white/10">|</div>
            <div>
              <span className="text-gray-500 uppercase tracking-tighter mr-1.5">Projected Wins:</span> 
              <span className="text-emerald-400 font-bold font-mono text-sm tracking-widest">{projectedWins}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main screen layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Selection Area / Toolbar with Dropdown searching */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-lg p-5 shadow-2xl space-y-4">
          
          {/* Controls line */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
            
            {/* View selectors */}
            <div className="flex bg-[#1A1A1E] p-1 rounded-md border border-white/5 overflow-x-auto select-none">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-1.5 text-xs font-mono rounded-sm transition-all font-bold uppercase tracking-wider shrink-0 ${
                  activeTab === 'catalog' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-gray-400 border border-transparent hover:text-white'
                }`}
              >
                1. Player Performance Catalog
              </button>
              <button
                onClick={() => setActiveTab('roster')}
                className={`px-4 py-1.5 text-xs font-mono rounded-sm transition-all font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'roster' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-gray-400 border border-transparent hover:text-white'
                }`}
              >
                2. Roster Sandbox Workspace
                <span className="px-1.5 py-0.5 bg-[#0F0F12] border border-white/10 text-[10px] text-emerald-400 rounded-full font-mono font-bold">
                  {signedPlayerIds.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-4 py-1.5 text-xs font-mono rounded-sm transition-all font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'simulator' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-gray-400 border border-transparent hover:text-white'
                }`}
              >
                3. Yankees Matchup Sim
              </button>
            </div>

            {/* Global parameters / resets */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={handleQuickLoadOaklandPreset}
                className="px-3 py-1.5 bg-[#1A1A1E] hover:bg-white/5 border border-white/5 text-[11px] font-mono rounded-sm text-gray-300 hover:text-white transition-all uppercase tracking-wider shrink-0"
                title="Loads the stock Oakland A's roster post-departure of Jason Giambi"
              >
                Load stock Oakland Roster
              </button>
              <button
                onClick={handleQuickLoadModernPreset}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[11px] font-mono rounded-sm text-emerald-400 hover:text-emerald-300 transition-all uppercase tracking-wider shrink-0"
                title="Loads modern active superstars and elite pre-arbitration bargains"
              >
                Load Modern Sabermetric Roster
              </button>
              <button
                onClick={handleClearRoster}
                className="px-3 py-1.5 bg-[#2A1215]/40 hover:bg-[#3F1A20]/60 border border-rose-500/10 text-[11px] font-mono rounded-sm text-rose-300 hover:text-rose-200 transition-all uppercase tracking-wider shrink-0"
              >
                Clear Sandbox
              </button>
            </div>

          </div>

          <div className="h-px bg-white/5" />

          {/* Player Dropdown Search Menu */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Searching dropdown trigger element - 4 columns */}
            <div className="md:col-span-5 relative">
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-semibold mb-1">
                Select and search players:
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type player name, position, or team..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  className="w-full bg-[#1A1A1E] border border-white/5 hover:border-white/15 focus:border-emerald-500/60 rounded-md py-2.5 pl-9 pr-24 text-sm text-white placeholder-gray-500 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                
                {searchQuery || selectedPositionFilter !== 'All' || selectedTagFilter !== 'All' ? (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedPositionFilter('All');
                      setSelectedTagFilter('All');
                    }}
                    className="absolute right-8 top-3 text-emerald-400 hover:text-emerald-300 text-[10px] uppercase font-mono font-bold tracking-tighter p-0.5"
                  >
                    Reset
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white p-0.5"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSearchDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Suggestions dropdown list */}
              {isSearchDropdownOpen && (
                <div 
                  id="search-dropdown-menu" 
                  className="absolute left-0 mt-1.5 w-full bg-[#1A1A1E] border border-white/10 rounded-md shadow-2xl z-50 divide-y divide-white/5 max-h-64 overflow-y-auto"
                >
                  {filteredPlayers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 font-mono">
                      No matching sabermetric players found.
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/5">Matches Available</div>
                      {filteredPlayers.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setSearchQuery('');
                            setIsSearchDropdownOpen(false);
                            // Pull open catalog tab automatically to show selected
                            setActiveTab('catalog');
                          }}
                          className={`w-full text-left p-2.5 px-3 hover:bg-white/5 transition-all flex items-center justify-between group ${
                            selectedPlayer.id === p.id 
                              ? 'bg-white/5 border-l-2 border-emerald-500 text-emerald-400' 
                              : 'text-gray-300'
                          }`}
                        >
                          <div className="pointer-events-none flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-sm bg-[#111115] border border-white/5 overflow-hidden shadow-sm shrink-0">
                              <img 
                                src={getPlayerImageUrl(p.id)} 
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-250"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-medium font-sans flex items-center gap-1.5">
                                {p.name}
                                <span className="text-[9px] font-mono text-gray-500">({p.position})</span>
                              </div>
                              <div className="text-[10px] text-gray-200 group-hover:text-emerald-400 font-mono tracking-tighter uppercase transition-colors">{p.team}</div>
                            </div>
                          </div>
                          <div className="text-right pointer-events-none font-mono text-xs flex gap-5 items-center">
                            <div>
                              <span className="text-gray-500 text-[10px] mr-1">OBP:</span>
                              <span className="text-emerald-400 font-bold font-mono">.{Math.round(p.obp * 1000)}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">${(p.salary/1000000).toFixed(2)}M</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Position filter dropdown - 3 columns */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-semibold mb-1">
                Filter by Position:
              </label>
              <select
                value={selectedPositionFilter}
                onChange={(e) => setSelectedPositionFilter(e.target.value)}
                className="w-full bg-[#1A1A1E] border border-white/5 hover:border-white/15 rounded-md py-2.5 px-3 text-xs text-gray-300 font-mono focus:outline-none focus:border-emerald-500/60 transition-all cursor-pointer"
              >
                <option value="All">All Positions</option>
                {BASEBALL_POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Tag filter dropdown - 3 columns */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-semibold mb-1">
                Filter by Value Category:
              </label>
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="w-full bg-[#1A1A1E] border border-white/5 hover:border-white/15 rounded-md py-2.5 px-3 text-xs text-gray-300 font-mono focus:outline-none focus:border-emerald-500/60 transition-all cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="undervalued">Undervalued Assets</option>
                <option value="star">Superstars / Core</option>
                <option value="scout-favorite">Scout Favorites</option>
                <option value="departed">Departed</option>
                <option value="expensive">Market Extremes</option>
              </select>
            </div>

            {/* Total count display - 1 column */}
            <div className="md:col-span-1 text-center font-mono text-xs text-gray-500 select-none">
              <div className="text-[10px] uppercase font-semibold">Results</div>
              <div className="text-emerald-400 font-bold text-lg mt-0.5 font-mono">{filteredPlayers.length}</div>
            </div>

          </div>

        </div>

        {/* View switching panel workspace */}
        <AnimatePresence mode="wait">
          {activeTab === 'catalog' ? (
            <motion.div
              key="catalog-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Quick tip notification */}
              <div className="p-3.5 bg-[#0F0F12] border border-white/10 rounded-md text-xs text-gray-400 flex items-center justify-between gap-4 font-mono">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  Currently Selected Player Sabermetric Profile: <strong className="text-emerald-400 italic uppercase font-sans tracking-tight">{selectedPlayer.name}</strong>
                </span>
                <span className="text-[10px] text-gray-500 uppercase">
                  Select matching names in Search input above to swap view
                </span>
              </div>

              {/* Renders Selected Player performance panel */}
              <PlayerProfile
                player={selectedPlayer}
                onAddToRoster={handleAddToRoster}
                onRemoveFromRoster={handleRemoveFromRoster}
                isSigned={signedPlayerIds.includes(selectedPlayer.id)}
                onOpenWarRoom={handleOpenWarRoomForPlayer}
              />
            </motion.div>
          ) : activeTab === 'roster' ? (
            <motion.div
              key="roster-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TeamBuilder
                signedPlayers={signedPlayers}
                budgetLimit={40000000}
                onRemovePlayer={handleRemoveFromRoster}
                onTriggerTeamEvaluation={handleOpenWarRoomForTeam}
              />
            </motion.div>
          ) : (
            <motion.div
              key="simulator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YankeesSimulator
                signedPlayers={signedPlayers}
                teamMetrics={{
                  averageObp: parseFloat(teamAverageObp),
                  averageSlg: parseFloat(teamAverageSlg),
                  averageOps: parseFloat(teamAverageOps),
                  totalSalary: teamSalary,
                  projectedWins: projectedWins,
                  playerNames: signedPlayers.map(p => p.name)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* AI Consultation War Room Dialogue overlay modal */}
      {warRoomOpen && (
        <WarRoom
          playerToEvaluate={warRoomPlayer}
          signedPlayers={signedPlayers}
          teamMetrics={warRoomPlayer ? undefined : teamEvaluationMetrics}
          onClose={() => setWarRoomOpen(false)}
        />
      )}

      {/* Footer credits bar */}
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <p>© 2002 Oakland Athletics baseball Club. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://en.wikipedia.org/wiki/Moneyball" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-all select-none">Wiki History</a>
            <span>•</span>
            <span className="select-none">Yale Economics Department</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
