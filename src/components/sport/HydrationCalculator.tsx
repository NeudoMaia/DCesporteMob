/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StationData, SportCategory } from '../../types';
import {
  assessSportRisk,
  SPORT_METADATA_LIST,
  WBGT_FLAG_DEFINITIONS,
  getFortalezaSportTimeWindows
} from '../../lib/sportUtils';
import {
  Droplets,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Activity,
  HeartHandshake,
  CheckCircle2,
  Info,
  Waves,
  Sun,
  Wind
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface HydrationCalculatorProps {
  stations: StationData[];
  initialSport?: SportCategory;
}

export const HydrationCalculator: React.FC<HydrationCalculatorProps> = ({
  stations,
  initialSport = 'RUNNING'
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(() => {
    // Preferência inicial por estação costeira (Mucuripe ou Centro/Orla)
    const coastal = stations.find(s => s.isCoastal || s.name.toLowerCase().includes('mucuripe') || s.name.toLowerCase().includes('orla'));
    return coastal?.id || stations[0]?.id || 'st-03';
  });

  const [sport, setSport] = useState<SportCategory>(initialSport);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [durationMin, setDurationMin] = useState<number>(60);
  const [intensity, setIntensity] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'MAXIMAL'>('HIGH');

  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Fator multiplicador por intensidade
  const intensityMultiplier = {
    LOW: 0.8,
    MODERATE: 1.0,
    HIGH: 1.2,
    MAXIMAL: 1.4
  }[intensity];

  // Cálculo fisiológico do risco com o utilitário
  const riskAssessment = useMemo(() => {
    if (!selectedStation) return null;
    const baseAssessment = assessSportRisk(
      sport,
      selectedStation.temp,
      selectedStation.humidity,
      selectedStation.windSpeed,
      selectedStation.solarRadiation,
      weightKg
    );

    // Ajustar taxa de sudorese pela intensidade escolhida
    const adjustedHydration = Math.round(baseAssessment.hydrationMlPerHour * intensityMultiplier);
    const totalVolumeMl = Math.round((adjustedHydration * (durationMin / 60)));

    return {
      ...baseAssessment,
      adjustedHydration,
      totalVolumeMl
    };
  }, [selectedStation, sport, weightKg, durationMin, intensityMultiplier]);

  const flagInfo = riskAssessment ? WBGT_FLAG_DEFINITIONS[riskAssessment.flag] : WBGT_FLAG_DEFINITIONS.GREEN;
  const timeWindows = useMemo(() => getFortalezaSportTimeWindows(), []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Droplets className="w-3.5 h-3.5" />
              <span>Calculadora Fisiológica & Prescrição Hídrica</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Planejamento de Treino e Hidratação no Calor
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1">
              Prescrição baseada nas diretrizes do ACSM (American College of Sports Medicine) e SBMEE (Sociedade Brasileira de Medicina do Exercício e do Esporte). Calcule sua taxa de perda por suor, pausas e reposição eletrolítica para as condições reais de Fortaleza.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Parâmetros do Atleta */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Parâmetros do Treino e Atleta
          </h3>

          {/* Seletor de Estação Meteorológica */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Local / Estação de Referência em Fortaleza
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.isCoastal ? '🌊 (Orla / Beira-Mar)' : ''} — {st.temp}°C | UR {st.humidity}%
                </option>
              ))}
            </select>
          </div>

          {/* Modalidade */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Modalidade Esportiva
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as SportCategory)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {SPORT_METADATA_LIST.map(sm => (
                <option key={sm.id} value={sm.id}>
                  {sm.icon} {sm.name} ({sm.mets} METs)
                </option>
              ))}
            </select>
          </div>

          {/* Peso Corporal */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Peso Corporal do Praticante
              </label>
              <span className="text-sm font-mono font-extrabold text-blue-600">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min={45}
              max={130}
              step={1}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>45 kg</span>
              <span>70 kg</span>
              <span>100 kg</span>
              <span>130 kg</span>
            </div>
          </div>

          {/* Duração Planejada */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Duração Prevista do Exercício
              </label>
              <span className="text-sm font-mono font-extrabold text-indigo-600">{durationMin} minutos</span>
            </div>
            <input
              type="range"
              min={15}
              max={180}
              step={15}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>15m</span>
              <span>60m (1h)</span>
              <span>120m (2h)</span>
              <span>180m (3h)</span>
            </div>
          </div>

          {/* Intensidade */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Intensidade Relativa do Esforço
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MODERATE', 'HIGH', 'MAXIMAL'] as const).map(lvl => {
                const label = lvl === 'LOW' ? 'Leve' : lvl === 'MODERATE' ? 'Moderada' : lvl === 'HIGH' ? 'Intensa' : 'Máxima';
                const isSelected = intensity === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={cn(
                      "py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumo da Condição Ambiental Atual do Local Escolhido */}
          {selectedStation && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Microclima na Estação ({selectedStation.name})
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Temp</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedStation.temp}°C</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Umidade</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedStation.humidity}%</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Vento</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedStation.windSpeed} m/s</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Radiação</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedStation.solarRadiation} W/m²</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados e Prescrição Fisiológica */}
        <div className="lg:col-span-7 space-y-6">
          {riskAssessment && (
            <>
              {/* Card da Bandeira Térmica ACSM */}
              <div className={cn(
                "rounded-2xl p-6 border-2 transition-all shadow-md",
                flagInfo.borderClass,
                flagInfo.badgeBg
              )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs", flagInfo.badgeBg, flagInfo.badgeText)}>
                        {flagInfo.label}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {flagInfo.rangeText}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      {flagInfo.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1 max-w-xl">
                      {flagInfo.riskDescription}
                    </p>
                  </div>
                  <div className="shrink-0 text-center sm:text-right bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-slate-300/60 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                      Índice WBGT Esportivo
                    </span>
                    <span className="text-3xl font-mono font-black text-slate-900">
                      {riskAssessment.wbgt}°C
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-300/60">
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-700" />
                    Diretriz ACSM: {flagInfo.sportsGuideline}
                  </p>
                </div>
              </div>

              {/* Métricas de Hidratação e Descanso */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Taxa de Perda Hídrica */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-blue-600">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Taxa de Suor Prevista</span>
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-mono font-black text-blue-700">
                    {riskAssessment.adjustedHydration} <span className="text-xs font-sans font-bold text-slate-500">ml/hora</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ingerir ~{Math.round(riskAssessment.adjustedHydration / 4)} ml a cada 15 minutos.
                  </p>
                </div>

                {/* Volume Total do Treino */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-indigo-600">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Volume Total ({durationMin}m)</span>
                    <Waves className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-mono font-black text-indigo-700">
                    {(riskAssessment.totalVolumeMl / 1000).toFixed(2)} <span className="text-xs font-sans font-bold text-slate-500">Litros</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {riskAssessment.electrolyteRecommended
                      ? '⚠️ Repor sódio (isotônico 0,5-0,7g Na/L).'
                      : 'Água pura fresca é suficiente.'}
                  </p>
                </div>

                {/* Pausas Mandatórias */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-amber-600">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pausas & Sombra</span>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-mono font-black text-amber-700">
                    {riskAssessment.mandatoryRestMin} <span className="text-xs font-sans font-bold text-slate-500">minutos</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    {riskAssessment.restCycleDescription}
                  </p>
                </div>
              </div>

              {/* Lista de Recomendações e Riscos Clínicos */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  Orientações Práticas para o Atleta e Treinador
                </h4>
                <div className="space-y-2">
                  {riskAssessment.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Sinais de Alerta para Interrupção Imediata do Treino
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {riskAssessment.clinicalRisks.map((risk, idx) => (
                      <div key={idx} className="text-[11px] font-medium text-red-950 bg-red-100 p-2 rounded-lg border border-red-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Janelas Ótimas de Treino em Fortaleza */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Janelas de Treino ao Ar Livre em Fortaleza ("Horários de Ouro")
            </h3>
            <p className="text-xs text-slate-500">
              Planeje suas sessões na Beira-mar, orla e parques de acordo com o ciclo diurno solar de Fortaleza.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {timeWindows.map((tw, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{tw.period}</span>
                <span className="text-base font-mono font-extrabold text-slate-800">{tw.hours}</span>
                <div className="mt-1.5">
                  <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border", tw.ratingColor)}>
                    {tw.rating}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {tw.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
