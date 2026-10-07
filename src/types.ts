/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Níveis de alerta baseados no Índice de Calor (Heat Index) para Fortaleza
 * NIVEL_0:  HI ≤ 27°C      — Nível 0 (Seguro/Rotina)
 * NIVEL_1:  HI 27.1–32°C   — Nível 1 (ATENÇÃO / Cuidado)
 * NIVEL_2:  HI 32.1–41°C   — Nível 2 (ALERTA / Cuidado Extremo)
 * NIVEL_3:  HI > 41.1°C    — Nível 3 (ALARME / Perigo a Perigo Extremo)
 */
export type HeatLevel = 'NIVEL_0' | 'NIVEL_1' | 'NIVEL_2' | 'NIVEL_3' | 'OFFLINE';

/**
 * Níveis de Bandeira de Estresse Térmico Esportivo (ACSM / COI)
 * GREEN:  WBGT < 18.0°C      — Risco Baixo
 * YELLOW: WBGT 18.0 - 22.2°C — Risco Moderado
 * ORANGE: WBGT 22.3 - 27.9°C — Risco Alto
 * RED:    WBGT 28.0 - 30.0°C — Risco Severo / Muito Alto
 * BLACK:  WBGT > 30.1°C      — Risco Extremo / Cancelamento
 */
export type WBGTFlag = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLACK';

export type SportCategory =
  | 'FUTEBOL'      // Futebol de grama ou areia
  | 'RUNNING'      // Corrida & Caminhada (Orla / Asfalto / Calçadão)
  | 'ROWING'       // Remo, Canoa Havaiana (Va'a), Natação & Náuticos
  | 'BEACH_SPORTS' // Beach Tennis, Vôlei de Praia & Futevôlei (Areia)
  | 'CYCLING'      // Ciclismo na Orla & Ciclovias
  | 'CROSSFIT_BOX';// Box Funcional / Crossfit / Ginásio Ventilado

export interface SportRiskAssessment {
  flag: WBGTFlag;
  flagLabel: string;
  flagColor: string;
  wbgt: number;
  hydrationMlPerHour: number;
  electrolyteRecommended: boolean;
  maxContinuousDurationMin: number;
  mandatoryRestMin: number;
  restCycleDescription: string;
  recommendations: string[];
  clinicalRisks: string[];
}

export interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  windSpeed: number; // m/s
  solarRadiation: number; // W/m²
  /** Índice de Desconforto Térmico (Temperatura Aparente de Steadman) */
  idt: number;
  /** Intensidade da Ilha de Calor Urbana: T_urbana − T_referência */
  icu: number;
  /** Anomalia média de 15 dias em relação à baseline histórica */
  avgAnomaly: number;
  status: HeatLevel;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
  /** Marca estação de referência (área vegetada/costeira) para cálculo do ICU */
  isReference?: boolean;
  /** Marca estação na zona costeira/orla de Fortaleza (Beira-mar, Mucuripe, Praia de Iracema) */
  isCoastal?: boolean;
  /** Índice de Bulbo Úmido e Termômetro de Globo (ACSM / COI) */
  wbgt?: number;
  /** Bandeira de risco esportivo associada */
  sportFlag?: WBGTFlag;
}

export interface IDTAlertInfo {
  level: HeatLevel;
  label: string;
  condition: string;
  action: string;
  color: string;
}

export interface HealthPathologiesReport {
  alertLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';
  immediateImpacts: string;
  chronicAggravation: string;
  vectorialRisk: string;
  vulnerableGroups: string;
  protectionRecommendations: string[];
}

export interface AIAnalysis {
  report: string;
  recommendations: {
    id: string;
    type: 'HEALTH' | 'TRAFFIC' | 'CIVIL_DEFENSE' | 'SPORTS';
    title: string;
    description: string;
    timeframe?: string;
    targetStation?: string;
    sportCategory?: SportCategory;
  }[];
  healthReport?: HealthPathologiesReport;
  sportAssessment?: {
    overallFlag: WBGTFlag;
    beiraMarStatus: string;
    gymStatus: string;
    hydrationAlert: string;
  };
}

export interface GridPoint {
  lat: number;
  lng: number;
  temp: number;
  idt: number;
}

export interface PredictionPoint {
  date: string;
  value: number;
  confidence: number;
}

export type TabType = 'athlete' | 'map' | 'calculator' | 'protocols' | 'science';
