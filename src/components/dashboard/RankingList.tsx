import React from 'react';
import { StationData } from '../../types';
import { cn } from '../../lib/utils';
import { calculateWBGT, getWBGTFlag, WBGT_FLAG_DEFINITIONS } from '../../lib/sportUtils';
import { Waves, Shield } from 'lucide-react';

interface RankingListProps {
  stations: StationData[];
}

export const RankingList: React.FC<RankingListProps> = ({ stations }) => {
  const sorted = [...stations].sort((a, b) => {
    if (b.temp !== a.temp) return b.temp - a.temp;
    return b.idt - a.idt;
  });
  const referenceStation = stations.find(s => s.isReference);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest leading-none">Ranking Térmico & Esportivo</h4>
          <span className="text-[9px] text-slate-400 font-medium">Classificação por Sobrecarga Térmica</span>
        </div>
        <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {sorted.map((station, index) => {
          const wbgt = station.wbgt ?? calculateWBGT(station.temp, station.humidity, station.windSpeed, station.solarRadiation);
          const flag = station.sportFlag ?? getWBGTFlag(wbgt);
          const flagInfo = WBGT_FLAG_DEFINITIONS[flag];

          return (
            <div
              key={station.id}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 px-1 rounded transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800">
                    {index + 1}. {station.name}
                  </p>
                  {station.isCoastal && (
                    <span title="Zona Costeira / Orla Beira-Mar">
                      <Waves className="w-3 h-3 text-cyan-600" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[8px] font-black uppercase px-1 py-0.2 rounded border",
                    flagInfo.badgeBg,
                    flagInfo.badgeText,
                    flagInfo.borderClass
                  )}>
                    {flagInfo.label.replace('Bandeira ', '')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    WBGT: <strong>{wbgt.toFixed(1)}°</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className={cn(
                  "text-sm font-mono font-bold",
                  index === 0 ? "text-rose-600" : (index === 1 ? "text-orange-600" : "text-slate-700")
                )}>
                  {station.temp.toFixed(1)}°C
                </p>
                <span className={cn(
                  "text-[9px] font-mono font-bold",
                  station.icu > 2 ? "text-rose-600" : (station.icu > 1 ? "text-orange-600" : "text-emerald-600")
                )}>
                  +{station.icu.toFixed(1)}°C
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Ref: {referenceStation ? referenceStation.name.replace(' (Ref. Térmica)', '') : 'Mínima'}
        </span>
        <span className="text-[10px] font-mono text-slate-700 px-1.5 py-0.5 bg-slate-50 rounded font-bold">
          {referenceStation ? referenceStation.temp.toFixed(1) : Math.min(...stations.map(s => s.temp)).toFixed(1)}°C
        </span>
      </div>
    </div>
  );
};
