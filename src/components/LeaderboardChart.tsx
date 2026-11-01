import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { UserGameState } from '../types/game';
import { sound } from '../utils/soundEffects';
import { Trophy, Award, Flame, Users, Sparkles } from 'lucide-react';

interface LeaderboardChartProps {
  gameState: UserGameState;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  isPlayer: boolean;
  character: string;
}

export const LeaderboardChart: React.FC<LeaderboardChartProps> = ({ gameState }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [filterMode, setFilterMode] = useState<'class' | 'top'>('class');

  // Generate class leaderboard data including player
  const baseClassmates: LeaderboardEntry[] = [
    { name: '碧姬公主', score: 2850, isPlayer: false, character: '👑' },
    { name: '耀西', score: 2420, isPlayer: false, character: '🦖' },
    { name: '陳小明 (4A)', score: 2100, isPlayer: false, character: '👦' },
    { name: '林美寶 (4B)', score: 1950, isPlayer: false, character: '👧' },
    { name: '羅潔塔公主', score: 1800, isPlayer: false, character: '✨' },
    { name: '張偉傑 (4A)', score: 1650, isPlayer: false, character: '👦' },
    { name: '咚奇剛', score: 1400, isPlayer: false, character: '🦍' },
    { name: '王家希 (4C)', score: 1250, isPlayer: false, character: '👧' },
  ];

  // Inject or update player entry
  const playerEntry: LeaderboardEntry = {
    name: `${gameState.studentName} (你)`,
    score: gameState.score,
    isPlayer: true,
    character: '⭐',
  };

  const combinedData = [...baseClassmates.filter((e) => !e.isPlayer), playerEntry]
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (!chartRef.current) return;

    // Clear previous SVG
    d3.select(chartRef.current).selectAll('*').remove();

    const containerWidth = chartRef.current.clientWidth || 600;
    const margin = { top: 20, right: 40, bottom: 30, left: 110 };
    const width = containerWidth - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = filterMode === 'class' ? combinedData : combinedData.slice(0, 5);

    // X scale
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.score)! * 1.15 || 3000])
      .range([0, width]);

    // Y scale
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, height])
      .padding(0.25);

    // Add X grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '3,3');

    // Remove axis line
    svg.select('.domain').remove();

    // Bars with D3 transition
    const bars = svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(0, ${y(d.name)})`);

    bars
      .append('rect')
      .attr('class', 'bar-rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', y.bandwidth())
      .attr('width', 0) // initial for animation
      .attr('rx', 8)
      .attr('fill', (d) =>
        d.isPlayer
          ? 'url(#playerGradient)'
          : 'url(#barGradient)'
      )
      .attr('stroke', (d) => (d.isPlayer ? '#fbbf24' : '#475569'))
      .attr('stroke-width', (d) => (d.isPlayer ? 2.5 : 1))
      .transition()
      .duration(800)
      .attr('width', (d) => x(d.score));

    // Gradients definition
    const defs = svg.append('defs');

    const playerGrad = defs
      .append('linearGradient')
      .attr('id', 'playerGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    playerGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b');
    playerGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ef4444');

    const barGrad = defs
      .append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    barGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
    barGrad.append('stop').attr('offset', '100%').attr('stop-color', '#60a5fa');

    // Score text labels on bars
    bars
      .append('text')
      .attr('x', (d) => x(d.score) + 10)
      .attr('y', y.bandwidth() / 2 + 5)
      .text((d) => `${d.score} 分`)
      .attr('fill', (d) => (d.isPlayer ? '#fde047' : '#cbd5e1'))
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif')
      .style('opacity', 0)
      .transition()
      .delay(400)
      .duration(500)
      .style('opacity', 1);

    // Y Axis labels (Names with emoji)
    svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll('text')
      .attr('fill', (d) => (d === playerEntry.name ? '#fde047' : '#f1f5f9'))
      .attr('font-size', '13px')
      .attr('font-weight', (d) => (d === playerEntry.name ? '900' : '600'))
      .attr('dx', '-8px');

    svg.selectAll('.tick line').remove();
    svg.select('.domain').remove();
  }, [gameState.score, gameState.studentName, filterMode]);

  const playerRank = combinedData.findIndex((e) => e.isPlayer) + 1;

  return (
    <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-md border-2 border-white">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-300">
              科學冒險排行榜 (D3.js 即時榜單)
            </h3>
            <p className="text-xs text-slate-300">
              全班與傳奇冒險家累積最高學分排名，看看你能排第幾名！
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>你的目前排名：第 {playerRank} 名</span>
          </span>

          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setFilterMode('class')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'class'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              全班總榜
            </button>
            <button
              onClick={() => {
                setFilterMode('top');
                sound.playJump();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'top'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              TOP 5 菁英
            </button>
          </div>
        </div>
      </div>

      {/* D3 Chart Container */}
      <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 overflow-hidden">
        <div ref={chartRef} className="w-full"></div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          挑戰各個關卡、答對題目即可獲取積分提升排名！
        </span>
        <span className="font-mono text-cyan-300">更新時間: 實時同步</span>
      </div>
    </div>
  );
};
