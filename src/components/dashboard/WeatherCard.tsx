import React from 'react';
import { Droplets, Info, Wind, Sun, Waves, ShieldCheck } from 'lucide-react';
import { StationData } from '../../types';
import { cn, formatTemp, getAlertInfo } from '../../lib/utils';
import { calculateWBGT, getWBGTFlag, WBGT_FLAG_DEFINITIONS } from '../../lib/sportUtils';
import { motion } from 'motion/react';

interface WeatherCardProps {
  station: StationData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ station }) => {
  const isComfortable = station.status === 'NIVEL_0';
  const isYellow = station.status === 'NIVEL_1';
  const isOrange = station.status === 'NIVEL_2';
  const isRed = station.status === 'NIVEL_3';
  const isOffline = station.status === 'OFFLINE';

  const alertInfo = getAlertInfo(station.status);

  // Cálculo e dados de estresse térmico esportivo
  const wbgt = station.wbgt ?? calculateWBGT(station.temp, station.humidity, station.windSpeed, station.solarRadiation);
  const sportFlag = station.sportFlag ?? getWBGTFlag(wbgt);
  const flagInfo = WBGT_FLAG_DEFINITIONS[sportFlag];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "bg-white rounded-xl p-5 border shadow-sm relative overflow-hidden transition-all duration-300",
        isRed ? "border-red-200 shadow-red-500/5" :
        isOrange ? "border-orange-200 shadow-orange-500/5" :
        isYellow ? "border-yellow-200 shadow-yellow-500/5" :
        "border-slate-200"
      )}
    >
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
        isRed ? "from-rose-500 to-red-600" :
        isOrange ? "from-orange-400 to-orange-600" :
        isYellow ? "from-yellow-300 to-yellow-500" :
        "from-emerald-400 to-emerald-600"
      )} />

      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{station.name}</h3>
            {station.isCoastal && (
              <span className="text-[9px] bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                <Waves className="w-2.5 h-2.5" /> Orla
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {station.isIoT ? 'Sensor Telemétrico' : 'Estação Automática'}
          </p>
        </div>

        {/* Badge da Bandeira Esportiva ACSM */}
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded font-black tracking-wider border uppercase flex items-center gap-1",
          flagInfo.badgeBg,
          flagInfo.badgeText,
          flagInfo.borderClass
        )}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: flagInfo.color }}></span>
          {flagInfo.label.replace('Bandeira ', '')}
        </span>
      </div>

      <div className="flex items-end gap-3 my-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temperatura Real</span>
          <h2 className={cn(
            "text-4xl font-light tracking-tighter",
            isRed ? "text-rose-600" :
            isOrange ? "text-orange-600" :
            isYellow ? "text-yellow-600" :
            "text-slate-800"
          )}>
            {station.temp.toFixed(1)} <span className="text-lg font-medium text-slate-300">°C</span>
          </h2>
        </div>
        <div className="flex flex-col gap-1.5 mb-1.5 ml-auto text-right">
          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-tighter">
            <span>{station.humidity}% RH</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-tighter">
            <span>{station.windSpeed.toFixed(1)} m/s</span>
            <Wind className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5 uppercase tracking-tighter">
            <span>{station.solarRadiation.toFixed(0)} W/m²</span>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Grid duplo: WBGT Esportivo + Temp Aparente */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg p-2.5 bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> WBGT Esporte
          </span>
          <span className="font-extrabold text-sm font-mono text-blue-900 mt-1">
            {wbgt.toFixed(1)}°C
          </span>
        </div>

        <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            Sensação Térmica
          </span>
          <span className="font-extrabold text-sm font-mono text-slate-800 mt-1">
            {station.idt.toFixed(1)}°C
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] mb-3">
        <span className="text-slate-400 font-bold uppercase tracking-widest">Intensidade ICU</span>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter",
            station.icu > 1 ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-500 border border-slate-100"
          )}>
            +{station.icu.toFixed(1)}°C vs Referência
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex gap-4">
        <div className="flex-1">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1 leading-none">Bairro Principal</p>
          <p className="text-[11px] font-bold text-slate-600 truncate">{station.primaryArea}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mb-1 leading-none">Cobertura ({station.secondaryAreas.length})</p>
          <p className="text-[11px] font-bold text-slate-600 truncate" title={station.secondaryAreas.join(', ')}>
            {station.secondaryAreas.join(', ')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
