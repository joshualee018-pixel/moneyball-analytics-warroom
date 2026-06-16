import React, { useState } from 'react';
import { Player } from '../types';
import { getPlayerImageUrl } from '../lib/images';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  User, 
  Target, 
  Zap, 
  Layers, 
  MessageCircle,
  Plus,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

interface PlayerProfileProps {
  player: Player;
  onAddToRoster: (player: Player) => void;
  onRemoveFromRoster: (player: Player) => void;
  isSigned: boolean;
  onOpenWarRoom: (player: Player) => void;
}

export default function PlayerProfile({ 
  player, 
  onAddToRoster, 
  onRemoveFromRoster, 
  isSigned,
  onOpenWarRoom 
}: PlayerProfileProps) {
  const [activeTab, setActiveTab] = useState<'sabermetrics' | 'historical' | 'comparative'>('sabermetrics');

  // Value Metric: OPS per Million of salary
  const salaryInMillions = player.salary / 1000000;
  // Make minimum wage players look appropriately cost-effective (not divide by zero or extreme fractions)
  const safeSalaryForRatio = Math.max(salaryInMillions, 0.2); 
  const efficiencyScore = (player.ops / safeSalaryForRatio).toFixed(2);

  // Determine scale colors based on stats
  const getObpColor = (val: number) => {
    if (val >= 0.380) return 'text-emerald-400';
    if (val >= 0.340) return 'text-green-400';
    if (val >= 0.315) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getEfficiencyColor = (score: number) => {
    const s = parseFloat(score.toString());
    if (s >= 3.0) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (s >= 1.5) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (s >= 0.5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  // Comparative metrics data compared to average starters
  const comparisonData = [
    { name: 'On-Base %', Player: player.obp, 'League Avg': 0.320, 'A\'s Target': 0.340 },
    { name: 'Slugging %', Player: player.slg, 'League Avg': 0.400, 'A\'s Target': 0.420 },
  ];

  return (
    <div id={`profile-card-${player.id}`} className="bg-[#0F0F12] border border-white/10 rounded-lg overflow-hidden shadow-2xl transition-all duration-300">
      {/* Banner / Header */}
      <div className="relative p-6 bg-gradient-to-r from-emerald-950/20 via-[#0F0F12] to-[#0F0F12] border-b border-white/5">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-black rounded-sm uppercase tracking-tighter ${
            player.tag === 'undervalued' ? 'bg-emerald-400 text-black' :
            player.tag === 'star' ? 'bg-amber-400 text-black' :
            player.tag === 'departed' ? 'bg-zinc-700 text-slate-100' :
            player.tag === 'expensive' ? 'bg-rose-500 text-white' :
            'bg-blue-400 text-black'
          }`}>
            {player.tag === 'undervalued' ? 'Top Value Target' : player.tag}
          </span>
          {isSigned ? (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black border border-emerald-500/40 bg-emerald-500/25 text-emerald-400 rounded-sm uppercase tracking-tighter">
              <Check className="w-3 h-3 stroke-[3]" /> Signed
            </span>
          ) : null}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Graphic representation */}
          <div className="w-20 h-20 rounded-md bg-[#1A1A1E] border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xl group/avatar">
            <img 
              src={getPlayerImageUrl(player.id)} 
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale brightness-90 group-hover/avatar:grayscale-0 group-hover/avatar:scale-110 transition-all duration-500"
            />
            <div className={`absolute bottom-0 w-full text-[9px] font-mono font-bold text-center py-0.5 uppercase tracking-tighter ${
              isSigned ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 opacity-95'
            }`}>
              {player.position}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-500 text-xs font-mono">
              SABERMETRIC TARGET ID: <span className="text-emerald-400">#442190-{player.id.toUpperCase()}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">
              {player.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 uppercase tracking-wider font-mono">
              <span className="font-bold text-gray-300">{player.detailedPosition}</span>
              <span className="text-gray-700">•</span>
              <span>{player.team}</span>
              <span className="text-gray-700">•</span>
              <span>Age {player.age}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main performance dashboard split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        
        {/* Statistics highlights - Left 4 columns */}
        <div className="p-6 lg:col-span-5 space-y-6 bg-[#0F0F12]/40">
          <div className="grid grid-cols-2 gap-4">
            {/* OBP */}
            <div className="bg-[#141418] p-4 border border-white/5 rounded-md space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>ON-BASE (OBP)</span>
                <Target className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className={`text-3xl font-mono font-bold tracking-tight ${getObpColor(player.obp)}`}>
                  .{Math.round(player.obp * 1000)}
                </span>
                <span className="text-[11px] text-gray-500 font-mono">(.{player.obp.toFixed(3).split('.')[1]})</span>
              </div>
              <div className="text-[9px] font-mono text-gray-600 pt-1 uppercase">
                Avg: .320 • Target: .340
              </div>
            </div>

            {/* SLG */}
            <div className="bg-[#141418] p-4 border border-white/5 rounded-md space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>SLUGGING (SLG)</span>
                <Zap className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  .{Math.round(player.slg * 1000)}
                </span>
                <span className="text-[11px] text-gray-500 font-mono">(.{player.slg.toFixed(3).split('.')[1]})</span>
              </div>
              <div className="text-[9px] font-mono text-gray-600 pt-1 uppercase">
                League Avg: .400
              </div>
            </div>

            {/* OPS */}
            <div className="bg-[#141418] p-4 border border-white/5 rounded-md space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>OPS (OBP+SLG)</span>
                <Layers className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl font-mono font-bold text-gray-200 tracking-tight">
                  {player.ops.toFixed(3)}
                </span>
              </div>
              <div className="text-[9px] font-mono text-gray-600 pt-1 uppercase">
                Batting Avg: .{Math.round(player.avg * 1000)}
              </div>
            </div>

            {/* Salary */}
            <div className="bg-[#141418] p-4 border border-white/5 rounded-md space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>ANNUAL SALARY</span>
                <DollarSign className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
                  ${salaryInMillions >= 1 ? `${salaryInMillions.toFixed(2)}M` : `${(player.salary / 1000).toFixed(0)}K`}
                </span>
              </div>
              <div className="text-[9px] font-mono text-gray-600 pt-1 uppercase">
                Team Max Cap: $40.0M
              </div>
            </div>
          </div>

          {/* Efficiency Score Box */}
          <div className={`p-4 border rounded-md ${getEfficiencyColor(parseFloat(efficiencyScore))} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Sabermetric Value Index
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-black/40 rounded border border-white/5">
                OPS / $1M
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Indices measuring statistics bought per dollar. Oakland's program converts excess walk/OBP capacity to runs cheaply.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold">{efficiencyScore}</span>
              <span className="text-xs text-gray-500 font-mono uppercase font-bold">Utility Ratio</span>
            </div>
          </div>

          {/* Quick scout bio box */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-1.5">
              Sabermetric Consensus Matrix
            </h3>
            
            {/* The Scout Bias */}
            <div className="space-y-1 border-l-2 border-rose-500/40 pl-3">
              <div className="text-[9px] font-mono text-rose-400 font-bold tracking-widest uppercase">
                Traditional Scout Bias (Departures)
              </div>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "{player.scoutNotes}"
              </p>
            </div>

            {/* The Sabermetric Proof */}
            <div className="space-y-1 border-l-2 border-emerald-500/40 pl-3">
              <div className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest uppercase">
                Sabermetric Model Projections
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {player.saberNotes}
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Graphs workspace - Right 7 columns */}
        <div className="p-6 lg:col-span-7 flex flex-col space-y-6 bg-[#09090B]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex bg-[#1A1A1E] p-0.5 rounded-sm border border-white/5">
              <button 
                onClick={() => setActiveTab('sabermetrics')}
                className={`px-3 py-1 text-[11px] font-mono rounded-sm transition-all uppercase tracking-wider ${
                  activeTab === 'sabermetrics' 
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Comparative Sabers
              </button>
              <button 
                onClick={() => setActiveTab('historical')}
                className={`px-3 py-1 text-[11px] font-mono rounded-sm transition-all uppercase tracking-wider ${
                  activeTab === 'historical' 
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Historical Progress
              </button>
            </div>

            <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 uppercase">
              <Info className="w-3.5 h-3.5 text-gray-600" />
              Database: Oakland A's 2002 Projections
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center bg-[#141418] rounded-md p-4 border border-white/5">
            {activeTab === 'sabermetrics' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <XAxis stroke="#4b5563" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={11} fontFamily="var(--font-mono)" domain={[0, 1.0]} tickFormatter={(v) => `.${Math.round(v * 1000)}`} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141418', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
                    labelStyle={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="Player" fill="#10b981">
                    <Cell fill="#10b981" />
                    <Cell fill="#10b981" />
                  </Bar>
                  <Bar dataKey="League Avg" fill="#27272a" opacity={0.6} />
                  <Bar dataKey="A's Target" fill="#d97706" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={player.statsHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="year" stroke="#4b5563" fontSize={11} fontFamily="var(--font-mono)" tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={11} fontFamily="var(--font-mono)" domain={[0.2, 0.6]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141418', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
                    labelStyle={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="obp" stroke="#10b981" fillOpacity={0.15} fill="url(#colorObp)" strokeWidth={2} name="On-Base (OBP)" />
                  <defs>
                    <linearGradient id="colorObp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-[#141418] rounded-md border border-white/5 font-mono shadow-inner">
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-bold">Games / Plate App</span>
              <span className="text-gray-200">
                {player.ab ? `162 / ${player.ab}` : '—'}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-bold">{player.type === 'batter' ? 'Hits / Base Walks' : 'ERA / WHIP'}</span>
              <span className="text-gray-200">
                {player.type === 'batter' ? `${player.h || 0} / ${player.bb || 0}` : `${player.era?.toFixed(2)} / ${player.whip?.toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase font-bold">{player.type === 'batter' ? 'HR Metric' : 'K strikeout'}</span>
              <span className="text-gray-200">
                {player.type === 'batter' ? player.hr : player.ks}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/5 mt-auto">
            {/* Run War Room Commentary button */}
            <button
              onClick={() => onOpenWarRoom(player)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1E] hover:bg-white/5 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs border border-emerald-500/10 rounded-sm transition-all uppercase tracking-wider"
            >
              <MessageCircle className="w-4 h-4" />
              Run War Room Consultation
            </button>

            {isSigned ? (
              <button
                onClick={() => onRemoveFromRoster(player)}
                className="px-5 py-2.5 bg-[#3F1A20]/40 hover:bg-[#3F1A20]/80 border border-rose-500/20 text-rose-300 hover:text-white font-mono text-xs font-bold rounded-sm transition-all uppercase tracking-wider"
              >
                Drop Asset
              </button>
            ) : (
              <button
                onClick={() => onAddToRoster(player)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-mono text-xs font-bold rounded-sm shadow-md hover:shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Sign Player
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
