/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SportCategory } from '../../types';
import { SPORT_METADATA_LIST } from '../../lib/sportUtils';
import { cn } from '../../lib/utils';
import {
  Footprints,
  Sailboat,
  Trophy,
  Bike,
  Goal,
  Flame
} from 'lucide-react';

interface SportSelectorProps {
  selectedSport: SportCategory;
  onSelectSport: (sport: SportCategory) => void;
  compact?: boolean;
}

const sportIcons: Record<SportCategory, React.ReactNode> = {
  FUTEBOL: <Goal className="w-5 h-5" />,
  RUNNING: <Footprints className="w-5 h-5" />,
  ROWING: <Sailboat className="w-5 h-5" />,
  BEACH_SPORTS: <Trophy className="w-5 h-5" />,
  CYCLING: <Bike className="w-5 h-5" />,
  CROSSFIT_BOX: <Flame className="w-5 h-5" />
};

export const SportSelector: React.FC<SportSelectorProps> = ({
  selectedSport,
  onSelectSport,
  compact = false
}) => {
  const currentSport = SPORT_METADATA_LIST.find(s => s.id === selectedSport) || SPORT_METADATA_LIST[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
              Protocolo Esportivo
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Diretrizes ACSM / COI
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight mt-1">
            Selecione a Modalidade Praticada
          </h3>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs font-mono font-bold text-slate-500">
            Intensidade Metabólica: <strong className="text-blue-600 font-extrabold">{currentSport.mets} METs</strong>
          </span>
        </div>
      </div>

      {/* Grid de Seleção de Esportes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {SPORT_METADATA_LIST.map((sport) => {
          const isSelected = selectedSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              className={cn(
                "flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer relative group",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-white text-blue-600 shadow-sm border border-slate-200"
              )}>
                {sportIcons[sport.id]}
              </div>
              <span className="text-xs font-bold leading-tight tracking-tight">
                {sport.name.split(' (')[0]}
              </span>
              <span className={cn(
                "text-[9px] font-mono mt-1 px-1.5 py-0.5 rounded",
                isSelected ? "text-blue-100 bg-blue-700/50" : "text-slate-400 bg-slate-200/60"
              )}>
                {sport.mets} METs
              </span>
            </button>
          );
        })}
      </div>

      {/* Box de Contexto Fisiológico da Modalidade Selecionada */}
      {!compact && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{currentSport.icon}</span>
              <span>{currentSport.name}</span>
            </p>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              {currentSport.description}
            </p>
          </div>
          <div className="shrink-0 max-w-sm bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
              Fator Crítico do Ambiente
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {currentSport.environmentalRiskFactor}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
