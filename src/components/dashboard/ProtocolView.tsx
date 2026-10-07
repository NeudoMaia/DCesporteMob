/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AIAnalysis, StationData } from '../../types';
import {
  Brain, Bell, ShieldAlert, Loader2, CheckCircle2,
  AlertTriangle, Siren, Clock, MapPin, Sparkles, RefreshCw, Flame, Play,
  Activity, HeartPulse, ShieldCheck, ThermometerSun, Stethoscope, AlertCircle,
  Droplets, Waves, Dumbbell, Trophy, LifeBuoy, Zap, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import {
  calculateWBGT,
  getWBGTFlag,
  WBGT_FLAG_DEFINITIONS,
  assessSportRisk,
  SPORT_METADATA_LIST
} from '../../lib/sportUtils';

interface ProtocolViewProps {
  analysis: AIAnalysis | null;
  loading: boolean;
  onRunAnalysis?: () => void;
  stations?: StationData[];
}

export const ProtocolView: React.FC<ProtocolViewProps> = ({ analysis, loading, onRunAnalysis, stations = [] }) => {
  // Ordenar estações das mais quentes (maior Temperatura Real e WBGT Esportivo)
  const sortedStations = useMemo(() => {
    if (!stations.length) return [];
    return [...stations].sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });
  }, [stations]);

  // A ESTAÇÃO COM A MAIOR TEMPERATURA DA REDE EM TEMPO REAL
  const criticalStation = sortedStations[0];

  const criticalWbgt = useMemo(() => {
    if (!criticalStation) return 28.0;
    return criticalStation.wbgt ?? calculateWBGT(
      criticalStation.temp,
      criticalStation.humidity,
      criticalStation.windSpeed,
      criticalStation.solarRadiation
    );
  }, [criticalStation]);

  const criticalFlag = useMemo(() => getWBGTFlag(criticalWbgt), [criticalWbgt]);
  const flagInfo = WBGT_FLAG_DEFINITIONS[criticalFlag];

  // Avaliação médica esportiva específica para a estação mais quente (Corrida como modalidade de referência)
  const runningAssessment = useMemo(() => {
    if (!criticalStation) return null;
    return assessSportRisk(
      'RUNNING',
      criticalStation.temp,
      criticalStation.humidity,
      criticalStation.windSpeed,
      criticalStation.solarRadiation,
      70
    );
  }, [criticalStation]);

  return (
    <div className="space-y-8">
      {/* Banner Principal de Ação: Diretrizes de Medicina Esportiva */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diretrizes Médicas Esportivas • Consensos ACSM / COI / SBMEE</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white">
              Análise Médica de Estresse Térmico & Prescrições Esportivas
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed font-medium">
              Avaliação contínua da sobrecarga fisiológica com base na <strong>estação meteorológica com maior temperatura em tempo real</strong> de Fortaleza. Emissão de condutas para atletas, assessorias de corrida, praticantes na Beira-mar e academias.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
            <button
              onClick={onRunAnalysis}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-900/40 hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-600 active:scale-98 transition-all disabled:opacity-75 disabled:cursor-not-allowed border border-blue-400/30 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                  <span>Processando Análise Médica...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-cyan-400 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Executar Diagnóstico Médico Esportivo</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-blue-300/70 font-semibold tracking-wider text-center lg:text-right">
              {loading ? "Calculando índices termorregulatórios..." : "Atualização automática contínua"}
            </span>
          </div>
        </div>
      </div>

      {/* DESTAQUE MÁXIMO: ANÁLISE DETALHADA DA ESTAÇÃO MAIS QUENTE EM TEMPO REAL */}
      {criticalStation && (
        <div className={cn(
          "rounded-2xl p-6 lg:p-7 border-2 shadow-lg transition-all",
          flagInfo.borderClass,
          flagInfo.badgeBg
        )}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300/60 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 text-white shadow-xs">
                  Estação Crítica da Rede
                </span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border", flagInfo.badgeBg, flagInfo.badgeText, flagInfo.borderClass)}>
                  {flagInfo.label}
                </span>
                {criticalStation.isCoastal && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 flex items-center gap-1">
                    <Waves className="w-3 h-3" /> Orla Beira-Mar
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {criticalStation.name} — Ponto de Maior Sobrecarga Térmica
              </h3>
              <p className="text-xs text-slate-700 font-semibold mt-1">
                Bairro Principal: <strong>{criticalStation.primaryArea}</strong> | Áreas de Influência: {criticalStation.secondaryAreas.slice(0, 4).join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-slate-300 shadow-sm shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Temp. Real</span>
                <span className="text-2xl font-mono font-black text-red-600">{criticalStation.temp}°C</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">WBGT Esporte</span>
                <span className="text-2xl font-mono font-black text-slate-900">{criticalWbgt}°C</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Sensação (IDT)</span>
                <span className="text-2xl font-mono font-black text-orange-600">{criticalStation.idt}°C</span>
              </div>
            </div>
          </div>

          {/* Prescrição Médica Esportiva Imediata para a Estação Mais Quente */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" /> Hidratação Recomendada (SBMEE)
              </span>
              <p className="text-lg font-mono font-black text-slate-900">
                {runningAssessment?.hydrationMlPerHour} ml/hora
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Ingerir ~{Math.round((runningAssessment?.hydrationMlPerHour || 800) / 4)} ml a cada 15 min. {runningAssessment?.electrolyteRecommended ? 'Repor sódio (isotônico 0,5-0,7 g/L).' : 'Água pura fresca.'}
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Pausas Mandatórias (ACSM / NATA)
              </span>
              <p className="text-lg font-mono font-black text-slate-900">
                {runningAssessment?.mandatoryRestMin} min de descanso
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                {runningAssessment?.restCycleDescription}
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Diretriz Competitiva (COI / FIFA)
              </span>
              <p className="text-xs font-extrabold text-slate-800 leading-snug">
                {flagInfo.sportsGuideline}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Recomendações e Diretrizes Clínicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Análise Médica e Protocolos Clínicos por Doença do Calor */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI Executive Medical Report Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 lg:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-700 text-cyan-200 shadow-md">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Parecer Médico da Inteligência Artificial</h3>
                  <p className="text-cyan-300 text-[10px] font-bold uppercase tracking-widest leading-none">
                    Fisiologia do Exercício • Foco na Estação Crítica ({criticalStation?.name})
                  </p>
                </div>
              </div>

              {onRunAnalysis && (
                <button
                  onClick={onRunAnalysis}
                  disabled={loading}
                  title="Recalcular Análise Médica"
                  className="p-2 rounded-lg bg-blue-800/80 hover:bg-blue-700 text-blue-200 transition-colors border border-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
              )}
            </div>

            <div className="relative bg-black/20 rounded-xl p-5 border border-white/10 backdrop-blur-xs z-10">
              {loading && !analysis ? (
                <div className="flex flex-col items-center justify-center h-24 text-cyan-200/70 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
                  <span className="font-bold text-[10px] uppercase tracking-widest italic">Avaliando parâmetros termorregulatórios da maior temperatura...</span>
                </div>
              ) : (
                <p className="text-blue-50 leading-relaxed text-xs sm:text-sm font-medium">
                  {analysis?.report || `Análise Médica Esportiva em Tempo Real: A estação meteorológica de ${criticalStation?.name} registra a maior temperatura da malha de Fortaleza (${criticalStation?.temp}°C reais, sensação térmica de ${criticalStation?.idt}°C e índice WBGT de ${criticalWbgt}°C). Classificação atual: ${flagInfo.label} (${flagInfo.name}). Recomenda-se rigorosa observância dos limites de treino, pausas mandatórias para hidratação e proteção solar na orla e praças esportivas.`}
                </p>
              )}
            </div>
          </div>

          {/* Quadro Clínico Fisiológico das Patologias do Exercício no Calor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Estratificação Clínica das Doenças Induzidas pelo Calor no Esporte
                </h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Consensos Médicos ACSM / NATA
              </span>
            </div>

            <div className="space-y-4">
              {/* 1. Cãibras Térmicas */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    1. Cãibras Térmicas por Esforço (Heat Cramps)
                  </h4>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Depleção de Sódio
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Fisiopatologia:</strong> Espasmos musculares involuntários dolorosos decorrentes da perda massiva de cloreto de sódio pelo suor profuso durante corridas ou treinos de alta intensidade na Beira-mar. Ocorre principalmente quando o atleta repõe apenas água pura, diluindo ainda mais o sódio sérico.
                </p>
                <p className="text-xs text-amber-950 font-bold">
                  <strong>Conduta Médica:</strong> Repouso imediato à sombra, alongamento passivo suave do grupo muscular afetado e ingestão de bebidas contendo 0,5 a 0,7 g/L de sódio ou reposição eletrolítica oral.
                </p>
              </div>

              {/* 2. Síncope do Calor */}
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-orange-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    2. Síncope do Calor (Heat Syncope / Colapso Pós-Esforço)
                  </h4>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                    Estase Venosa Periférica
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Fisiopatologia:</strong> Episódio de tontura súbita e desmaio que ocorre logo após a interrupção abrupta da corrida ou caminhada. A cessação da ação da bomba muscular nas pernas, somada à intensa vasodilatação periférica pelo calor, causa sequestro do sangue nos membros inferiores, reduzindo o fluxo sanguíneo cerebral.
                </p>
                <p className="text-xs text-orange-950 font-bold">
                  <strong>Conduta Médica:</strong> Deitar o praticante em decúbito dorsal com elevação dos membros inferiores em 30 cm, afrouxar roupas e ofertar líquidos gelados assim que recuperar a consciência.
                </p>
              </div>

              {/* 3. Exaustão Térmica */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    3. Exaustão Térmica por Esforço (Heat Exhaustion)
                  </h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    Tcore &lt; 40°C • Sem Déficit Neurológico
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Fisiopatologia:</strong> Incapacidade de continuar o exercício devido ao colapso cardiovascular causado por desidratação e estresse térmico acentuado. Sintomas: fraqueza intensa, sudorese abundante, pele fria e pegajosa, cefaleia, hipotensão postural e náuseas. A função cerebral e o estado de alerta encontram-se preservados.
                </p>
                <p className="text-xs text-rose-950 font-bold">
                  <strong>Conduta Médica:</strong> Interromper imediatamente o treino. Remover o atleta para ambiente climatizado, remover roupas pesadas, aplicar toalhas frias e repor fluidos por via oral. Se houver vômitos persistentes, encaminhar para hidratação endovenosa.
                </p>
              </div>

              {/* 4. Golpe de Calor por Esforço */}
              <div className="p-4 rounded-xl bg-red-100/70 border-2 border-red-500 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-red-950 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    4. GOLPE DE CALOR POR ESFORÇO (EHS) — EMERGÊNCIA MÉDICA
                  </h4>
                  <span className="text-[10px] font-black text-white bg-red-600 px-2.5 py-0.5 rounded">
                    Tcore &gt; 40,5°C • Disfunção do SNC
                  </span>
                </div>
                <p className="text-xs text-red-950 leading-relaxed font-medium">
                  <strong>Fisiopatologia:</strong> Falência completa da termorregulação central com hipertermia severa e risco de disfunção orgânica múltipla e óbito. Sintomas: confusão mental, marcha desordenada/ataxia, comportamento irracional, vômitos, convulsões ou coma.
                </p>
                <div className="p-3 bg-red-600 text-white rounded-lg text-xs font-extrabold space-y-1">
                  <p className="flex items-center gap-1.5 uppercase tracking-wide">
                    <LifeBuoy className="w-4 h-4 text-yellow-300" />
                    Regra de Ouro Médica: "COOL FIRST, TRANSPORT SECOND"
                  </p>
                  <p className="font-medium text-[11px] text-red-100 leading-snug">
                    Acionar o SAMU (192) imediatamente e <strong>iniciar resfriamento rápido agressivo antes de remover para a ambulância</strong>: imersão em banheira de água gelada (CWI) até a temperatura central baixar de 38,9°C.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Protocolos Específicos e Recomendações Acionáveis */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
              Recomendações Práticas Acionáveis ({analysis?.recommendations?.length || 3})
            </h3>

            <div className="space-y-3">
              {(analysis?.recommendations && analysis.recommendations.length > 0 ? analysis.recommendations : [
                {
                  id: "rec-1",
                  type: "SPORTS" as const,
                  title: `Diretriz para Assessorias de Corrida na Beira-Mar (${criticalStation?.name})`,
                  description: `Sob condições de ${criticalStation?.temp}°C e WBGT de ${criticalWbgt}°C, adiantar os treinos longos de corrida para antes das 07h00. Fracionar séries de tiros curtos e aumentar as pausas na sombra para 10-12 minutos com reposição hidroeletrolítica.`,
                  timeframe: "Imediato",
                  targetStation: criticalStation?.name
                },
                {
                  id: "rec-2",
                  type: "SPORTS" as const,
                  title: `Protocolo para Esportes de Areia e Náuticos (${criticalStation?.name})`,
                  description: `Atenção à temperatura condutiva da areia (Beach Tennis e Futevôlei). Recomenda-se molhar as quadras com mangueira periodicamente ou utilizar sapatilhas térmicas de neoprene. No remo e canoa Va'a na enseada do Mucuripe, a hidratação deve ser forçada a cada 15 min mesmo sem sede.`,
                  timeframe: "Imediato",
                  targetStation: criticalStation?.name
                },
                {
                  id: "rec-3",
                  type: "HEALTH" as const,
                  title: `Ventilação e Climatização em Academias e Boxes (${criticalStation?.name})`,
                  description: `Em boxes de treinamento funcional e academias sem ar condicionado central, ligar ventiladores industriais para desobstruir o acúmulo de vapor d'água exalado pelos praticantes e permitir o resfriamento por evaporação do suor.`,
                  timeframe: "Imediato",
                  targetStation: criticalStation?.name
                }
              ]).map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 h-fit">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{rec.title}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                        {rec.timeframe || 'Imediato'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Coluna Direita: Ranking das Estações por Sobrecarga Térmica + Diretrizes por Modalidade */}
        <div className="space-y-6">

          {/* Ranking Térmico Esportivo em Tempo Real */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600" />
                Estações mais Quentes de Fortaleza
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Tempo Real</span>
            </div>

            <div className="space-y-2">
              {sortedStations.slice(0, 5).map((st, idx) => {
                const wbgt = st.wbgt ?? calculateWBGT(st.temp, st.humidity, st.windSpeed, st.solarRadiation);
                const flag = st.sportFlag ?? getWBGTFlag(wbgt);
                const info = WBGT_FLAG_DEFINITIONS[flag];
                const isTop = idx === 0;

                return (
                  <div
                    key={st.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all flex items-center justify-between",
                      isTop ? "bg-red-50/70 border-red-200 shadow-xs" : "bg-slate-50 border-slate-200/80"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                        <h5 className="text-xs font-bold text-slate-900">{st.name}</h5>
                        {st.isCoastal && <Waves className="w-3 h-3 text-cyan-600" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.2 rounded border", info.badgeBg, info.badgeText, info.borderClass)}>
                          {info.label.replace('Bandeira ', '')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          WBGT: <strong>{wbgt.toFixed(1)}°C</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono font-black text-slate-900 block">{st.temp.toFixed(1)}°C</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Real</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diretrizes Rápidas por Modalidade em Fortaleza */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Trophy className="w-4 h-4 text-blue-600" />
              Conduta por Modalidade em Fortaleza
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <span>🏃</span> Corrida na Beira-Mar
                </p>
                <p className="text-slate-600 text-[11px] leading-snug font-medium">
                  Evitar calçadão das 09h30 às 16h00. Preferir orla arborizada nos horários de 05h00 às 07h30 ou após 17h30.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-100 space-y-1">
                <p className="font-bold text-cyan-900 flex items-center gap-1.5">
                  <span>🛶</span> Remo & Canoa Va'a (Mucuripe)
                </p>
                <p className="text-slate-600 text-[11px] leading-snug font-medium">
                  Protetor solar resistente à água (FPS 50+), óculos UV e consumo forçado de água mineral a cada 20 min de remada.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>🏐</span> Beach Tennis / Arenas
                </p>
                <p className="text-slate-600 text-[11px] leading-snug font-medium">
                  Molhar a quadra antes das partidas nas horas mais quentes. Uso de sapatilhas de areia para evitar queimaduras podais.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                  <span>🏋️</span> Academias & Boxes
                </p>
                <p className="text-slate-600 text-[11px] leading-snug font-medium">
                  Controle da taxa de renovação de ar (ASHRAE 62.1) e ventilação cruzada para viabilizar o resfriamento evaporativo.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
