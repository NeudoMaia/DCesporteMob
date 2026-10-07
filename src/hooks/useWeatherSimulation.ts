/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StationData, AIAnalysis } from '../types';
import { INITIAL_STATIONS, HISTORICAL_BASELINES } from '../constants';
import { calculateIDT, calculateICU, getStatusFromIDT } from '../lib/utils';
import { calculateAnomaly, holtPredict } from '../lib/prediction';
import { generateAnchoredHistory } from '../lib/history';
import { analyzeThermalData } from '../services/geminiService';
import { calculateWBGT, getWBGTFlag } from '../lib/sportUtils';

export function useWeatherSimulation() {
  // Por padrão, o ambiente de demonstração nunca consulta provedores externos.
  // Para habilitar integrações reais, defina VITE_DATA_MODE=live na hospedagem.
  const isSimulation = import.meta.env.VITE_DATA_MODE !== 'live';
  const [apiStations, setApiStations] = useState<StationData[]>(INITIAL_STATIONS);
  const [customSensors, setCustomSensors] = useState<StationData[]>([]);
  const [aiReport, setAiReport] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLive, setIsLive] = useState(false); // Indica se estamos consumindo dados reais da Plugfield
  const [loadingLive, setLoadingLive] = useState(false);

  // Computar a lista final mesclada e ordenada do mais quente para o mais frio (maior temperatura real)
  const stations = useMemo(() => {
    return [...apiStations, ...customSensors].sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });
  }, [apiStations, customSensors]);

  const stationsRef = useRef<StationData[]>(stations);
  useEffect(() => {
    stationsRef.current = stations;
  }, [stations]);

  // A. Função para buscar dados do backend (/api/stations)
  const fetchLiveStations = useCallback(async () => {
    if (isSimulation) {
      setIsLive(false);
      setLoadingLive(false);
      return;
    }
    setLoadingLive(true);
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error(`HTTP Error status: ${response.status}`);
      }
      const data = await response.json();

      if (data.stations && data.stations.length > 0) {
        const enrichedStations = data.stations.map((s: StationData) => {
          const wbgt = s.wbgt ?? calculateWBGT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
          const sportFlag = s.sportFlag ?? getWBGTFlag(wbgt);
          const isCoastal = s.isCoastal ?? (
            s.id === '9137' || s.id === '8642' || s.id === 'st-03' ||
            s.name.toLowerCase().includes('mucuripe') ||
            s.name.toLowerCase().includes('orla') ||
            s.name.toLowerCase().includes('centro')
          );
          return {
            ...s,
            wbgt,
            sportFlag,
            isCoastal
          };
        });
        setApiStations(enrichedStations);
        setIsLive(data.source === 'live_api');
      } else {
        throw new Error("Empty stations array returned");
      }
    } catch (error) {
      console.warn("Falha ao buscar dados em tempo real da Plugfield. Mantendo simulação local:", error);
      setIsLive(false);
    } finally {
      setLoadingLive(false);
    }
  }, [isSimulation]);

  // B. Função para rodar simulação local física (usada apenas se isLive for falso)
  const updateLocalSimulation = useCallback(() => {
    if (!isSimulation && isLive) return; // Não faz simulação se os dados reais estiverem ativos

    setApiStations(prev => {
      // 1. Encontrar a estação de referência (isReference: true)
      const refStation = prev.find(s => s.isReference);

      // 2. Aplicar flutuação física de temperatura e umidade
      const updated = prev.map(station => {
        const tempVariation = (Math.random() * 0.4) - 0.15;
        const humidityVariation = Math.round((Math.random() * 4) - 2);
        const newTemp = Math.max(25, station.temp + tempVariation);
        const newHumidity = Math.max(30, Math.min(95, station.humidity + humidityVariation));

        const windVariation = (Math.random() * 0.4) - 0.2;
        const newWind = Math.max(0, (station.windSpeed || 2.0) + windVariation);

        // Simulação bem simples do ciclo solar diário
        const hour = new Date().getHours();
        const baseSolar = hour >= 6 && hour <= 17
          ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (hour - 6) / 11)))
          : 0;
        const newSolar = Math.max(0, baseSolar + (Math.random() * 50 - 25));

        return {
          ...station,
          temp: parseFloat(newTemp.toFixed(1)),
          humidity: newHumidity,
          windSpeed: parseFloat(newWind.toFixed(1)),
          solarRadiation: parseFloat(newSolar.toFixed(0))
        };
      });

      // 3. Obter temperatura da referência Messejana
      const refTemp = updated.find(s => s.isReference)?.temp ?? updated[0].temp;

      // 4. Recalcular IDT (Steadman), ICU, anomalia e WBGT esportivo para cada estação
      return updated.map(s => {
        const idt = calculateIDT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
        const icu = calculateICU(s.temp, refTemp);
        const baseline = HISTORICAL_BASELINES[s.id] ?? 29.0;
        const avgAnomaly = calculateAnomaly(s.temp, baseline);
        const wbgt = calculateWBGT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
        const sportFlag = getWBGTFlag(wbgt);
        const isCoastal = s.id === '9137' || s.id === '8642' || s.id === 'st-03' ||
                          s.name.toLowerCase().includes('mucuripe') ||
                          s.name.toLowerCase().includes('orla') ||
                          s.name.toLowerCase().includes('centro');

        return {
          ...s,
          idt,
          icu,
          avgAnomaly,
          status: getStatusFromIDT(s.temp),
          wbgt,
          sportFlag,
          isCoastal
        };
      });
    });
  }, [isLive, isSimulation]);

  // C. Polling para atualizar dados reais a cada 30 segundos
  useEffect(() => {
    fetchLiveStations(); // Chamada inicial imediata
    const interval = setInterval(fetchLiveStations, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveStations]);

  // D. Simulação física periódica a cada 5 segundos apenas quando não estiver live
  useEffect(() => {
    if (!isSimulation && isLive) return;
    const interval = setInterval(updateLocalSimulation, 5000);
    return () => clearInterval(interval);
  }, [isLive, updateLocalSimulation]);

  // E. Análise de IA periódica via Gemini ou acionada manualmente pelo usuário
  const runAIAnalysis = useCallback(async () => {
    if (stationsRef.current.length === 0) return;
    setLoadingAI(true);
    try {
      if (isSimulation) {
        const station = stationsRef.current[0];
        const wbgt = station.wbgt ?? calculateWBGT(station.temp, station.humidity, station.windSpeed, station.solarRadiation);
        setAiReport({
          report: `Demonstração com dados simulados. A estação ${station.name} apresenta WBGT estimado de ${wbgt.toFixed(1)}°C.`,
          recommendations: [
            { id: 'sim-hydration', type: 'SPORTS', title: 'Planeje a hidratação', description: 'Leve água, faça pausas regulares e ajuste a intensidade à resposta do corpo.', timeframe: 'Antes e durante o treino', targetStation: station.name },
            { id: 'sim-schedule', type: 'SPORTS', title: 'Prefira horários mais amenos', description: 'Evite o período de maior radiação solar e procure sombra nas pausas.', timeframe: 'Planejamento do treino', targetStation: station.name },
          ],
          sportAssessment: { overallFlag: station.sportFlag ?? getWBGTFlag(wbgt), beiraMarStatus: 'Cenário simulado', gymStatus: 'Ajustar ventilação e hidratação', hydrationAlert: 'Usar a calculadora para estimar a reposição hídrica.' },
        });
        return;
      }
      const forecasts = stationsRef.current.map(station => {
        const history = generateAnchoredHistory(station, 30);
        const tempValues = history.map(h => h.temp);
        const idtValues = history.map(h => h.idt);

        return {
          id: station.id,
          name: station.name,
          tempForecast: holtPredict(tempValues, 3),
          idtForecast: holtPredict(idtValues, 3)
        };
      });

      const report = await analyzeThermalData(stationsRef.current, forecasts);
      setAiReport(report);
    } catch (error) {
      console.error("AI Analysis failed, skipping:", error);
    } finally {
      setLoadingAI(false);
    }
  }, [isSimulation]);

  useEffect(() => {
    const interval = setInterval(runAIAnalysis, 300000);
    runAIAnalysis(); // Chamada inicial imediata
    return () => clearInterval(interval);
  }, [runAIAnalysis]);

  // F. Adicionar sensores customizados da rede IoT
  const addSensor = (sensor: Omit<StationData, 'id' | 'icu' | 'status' | 'idt' | 'avgAnomaly' | 'isReference' | 'windSpeed' | 'solarRadiation'>) => {
    const refTemp = apiStations.find(s => s.isReference)?.temp ?? apiStations[0]?.temp ?? 29.5;
    const windSpeed = 2.0;
    const solarRadiation = 500;
    const idt = calculateIDT(sensor.temp, sensor.humidity, windSpeed, solarRadiation);

    const newSensor: StationData = {
      ...sensor,
      id: `iot-${Date.now()}`,
      windSpeed,
      solarRadiation,
      idt,
      icu: calculateICU(sensor.temp, refTemp),
      avgAnomaly: 0,
      status: getStatusFromIDT(sensor.temp),
      isIoT: true
    };

    setCustomSensors(prev => [...prev, newSensor]);
  };

  return {
    stations,
    aiReport,
    loadingAI,
    runAIAnalysis,
    addSensor,
    isLive,
    isSimulation,
    loadingLive,
    refetch: fetchLiveStations
  };
}
