/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect, useState, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { WeatherCard } from './components/dashboard/WeatherCard';
import { RankingList } from './components/dashboard/RankingList';
import { ProtocolView } from './components/dashboard/ProtocolView';
import { SportSelector } from './components/sport/SportSelector';
import { HydrationCalculator } from './components/sport/HydrationCalculator';
import { SportScientificManual } from './components/sport/SportScientificManual';
import { TechnicalManual } from './components/analysis/TechnicalManual';
import { AthleteBriefing } from './components/athlete/AthleteBriefing';

import { useWeatherSimulation } from './hooks/useWeatherSimulation';
import { TabType, SportCategory } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { generateAnchoredHistory } from './lib/history';
import { Activity, BookOpen, Droplets, Map, ShieldCheck } from 'lucide-react';

const HeatMap = lazy(() => import('./components/dashboard/HeatMap').then(({ HeatMap }) => ({ default: HeatMap })));

type Theme = 'light' | 'dark';

function Dashboard({ userName, theme, onToggleTheme, onSwitchUser }: {
  userName: string;
  theme: Theme;
  onToggleTheme: () => void;
  onSwitchUser: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('athlete');
  const [selectedSport, setSelectedSport] = useState<SportCategory>('RUNNING');
  const { stations, aiReport, loadingAI, runAIAnalysis, addSensor, isLive } = useWeatherSimulation();

  // Calcular ponto mais quente (maior temperatura real), mais frio e a amplitude térmica da rede (tempo real)
  const sortedByTemp = useMemo(() => {
    return [...stations].sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });
  }, [stations]);

  const hottestStation = sortedByTemp[0];
  const coolestStation = sortedByTemp[sortedByTemp.length - 1];

  const tempDiff = useMemo(() => {
    if (!hottestStation || !coolestStation) return 0;
    return parseFloat((hottestStation.temp - coolestStation.temp).toFixed(1));
  }, [hottestStation, coolestStation]);

  // Calcular métricas com base no histórico de 7 dias para o Ponto de Atenção
  const weeklyAttentionStation = useMemo(() => {
    if (!stations.length) return null;

    const stationsStats = stations.map(s => {
      const history = generateAnchoredHistory(s, 7);
      const avgTemp = history.reduce((acc, h) => acc + h.temp, 0) / 7;
      const avgIDT = history.reduce((acc, h) => acc + h.idt, 0) / 7;
      const past7 = history[0];
      const current = history[history.length - 1];
      const gradientIDT = parseFloat((current.idt - past7.idt).toFixed(1));

      return {
        ...s,
        avgTemp,
        avgIDT,
        gradientIDT
      };
    });

    return stationsStats.sort((a, b) => {
      if (Math.abs(b.avgTemp - a.avgTemp) > 0.05) {
        return b.avgTemp - a.avgTemp;
      }
      return b.avgIDT - a.avgIDT;
    })[0];
  }, [stations]);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'athlete': return 'Orientação para o treino';
      case 'map': return 'Monitoramento Esportivo & Orla';
      case 'calculator': return 'Calculadora de Treino & Hidratação';
      case 'protocols': return 'Diretrizes Médicas Esportivas';
      case 'science': return 'Respaldo Científico & Normas (ACSM / COI / SBMEE)';
      default: return 'Monitoramento Esportivo';
    }
  };

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Header
        title={getPageTitle()}
        isLive={isLive}
        userName={userName}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSwitchUser={onSwitchUser}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 pb-24 scroll-smooth custom-scrollbar sm:p-6 md:pb-6">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Seletor Rápido de Modalidade Esportiva */}
                <SportSelector
                  selectedSport={selectedSport}
                  onSelectSport={setSelectedSport}
                />

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sortedByTemp.slice(0, 3).map(station => (
                    <WeatherCard key={station.id} station={station} />
                  ))}
                  <div className="bg-white border-2 border-orange-600 p-5 rounded-xl shadow-md flex flex-col justify-between group hover:bg-orange-50 transition-colors">
                    <div>
                      <p className="text-[11px] font-bold text-orange-700 uppercase tracking-widest leading-none mb-2">Estimativa de Sobrecarga (7 Dias)</p>
                      <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">
                        {weeklyAttentionStation?.primaryArea || weeklyAttentionStation?.name}
                      </h3>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                        Maior Estresse Térmico Semanal
                      </p>
                    </div>
                    <p className="pt-2 text-[10px] leading-relaxed text-slate-500">
                      Histórico estimado; a rede ainda não fornece medições históricas consolidadas.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Média estimada</span>
                        <span className="text-sm font-mono font-bold text-orange-600">{weeklyAttentionStation?.avgTemp.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Média ST (7d)</span>
                        <span className="text-sm font-mono font-bold text-red-600">{weeklyAttentionStation?.avgIDT.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-black text-orange-800 uppercase tracking-wider">Gradiente (7d)</span>
                        <span className={`text-xs font-mono font-bold ${weeklyAttentionStation && weeklyAttentionStation.gradientIDT > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {weeklyAttentionStation && weeklyAttentionStation.gradientIDT > 0 ? '+' : ''}{weeklyAttentionStation?.gradientIDT}°C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Visualizations Grid */}
                <div className="grid grid-cols-12 gap-6 pb-6">
                  <div className="col-span-12 lg:col-span-8 h-[600px] shadow-2xl shadow-slate-200/40 rounded-xl overflow-hidden border border-slate-200">
                    <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">Carregando mapa…</div>}>
                      <HeatMap stations={stations} />
                    </Suspense>
                  </div>
                  <div className="col-span-12 lg:col-span-4 h-[600px] shadow-2xl shadow-slate-200/40 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <RankingList stations={stations} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'athlete' && (
              <motion.div key="athlete-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AthleteBriefing stations={stations} selectedSport={selectedSport} onSelectSport={setSelectedSport} isLive={isLive} />
              </motion.div>
            )}

            {activeTab === 'calculator' && (
              <motion.div
                key="calculator-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-10"
              >
                <HydrationCalculator stations={stations} initialSport={selectedSport} />
              </motion.div>
            )}

            {activeTab === 'protocols' && (
              <motion.div
                key="protocol-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-10"
              >
                <ProtocolView analysis={aiReport} loading={loadingAI} onRunAnalysis={runAIAnalysis} stations={stations} />
              </motion.div>
            )}

            {activeTab === 'science' && (
              <motion.div
                key="science-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-10 space-y-8"
              >
                <SportScientificManual />
                <TechnicalManual defaultExpanded={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="hidden h-8 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:flex">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Fortaleza (Orla & Malha Urbana)</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Fuso: UTC-3</span>
        </div>
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Atualização: simulação 5s · dados reais 30s
          </span>
          <span className="text-slate-400 font-bold">DCESPORTE v5.0.0 — WBGT (ACSM/COI) + IDT + SBMEE + Holt</span>
        </div>
      </footer>
      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white/95 px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {[
          { id: 'athlete' as TabType, label: 'Agora', icon: Activity },
          { id: 'map' as TabType, label: 'Mapa', icon: Map },
          { id: 'calculator' as TabType, label: 'Hidratar', icon: Droplets },
          { id: 'protocols' as TabType, label: 'Alertas', icon: ShieldCheck },
          { id: 'science' as TabType, label: 'Ciência', icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${activeTab === id ? 'text-blue-700' : 'text-slate-500'}`}><Icon size={19} aria-hidden="true"/>{label}</button>)}
      </nav>
    </div>
  );
}

export default function App() {
  const [userName, setUserName] = useState(() => window.localStorage.getItem('dcesporte-user-name') ?? '');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('dcesporte-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('dcesporte-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
  const login = (name: string) => {
    const normalizedName = name.trim();
    window.localStorage.setItem('dcesporte-user-name', normalizedName);
    setUserName(normalizedName);
  };
  const switchUser = () => {
    window.localStorage.removeItem('dcesporte-user-name');
    setUserName('');
  };

  if (!userName) {
    return <Login
      initialName=""
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogin={login}
    />;
  }

  return <Dashboard
    userName={userName}
    theme={theme}
    onToggleTheme={toggleTheme}
    onSwitchUser={switchUser}
  />;
}
