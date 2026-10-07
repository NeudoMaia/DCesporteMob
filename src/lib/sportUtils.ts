/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Módulo de Fisiologia e Medicina do Exercício — DCESPORTE Fortaleza
 * Respaldos Científicos:
 * - ACSM (American College of Sports Medicine) - Exertional Heat Illness
 * - COI (Comitê Olímpico Internacional) - Extreme Heat Sport Guidelines
 * - SBMEE (Sociedade Brasileira de Medicina do Exercício e do Esporte) - Hidratação
 * - NHO 06 (Fundacentro) - Sobrecarga Térmica Humana
 */

import { SportCategory, WBGTFlag, SportRiskAssessment } from '../types';

export interface SportMetadata {
  id: SportCategory;
  name: string;
  locationType: 'OUTDOOR' | 'BEACH' | 'WATER' | 'INDOOR';
  icon: string;
  mets: number;
  description: string;
  environmentalRiskFactor: string;
}

export const SPORT_METADATA_LIST: SportMetadata[] = [
  {
    id: 'FUTEBOL',
    name: 'Futebol de Grama ou Areia',
    locationType: 'OUTDOOR',
    icon: '⚽',
    mets: 9.0,
    description: 'Partidas e treinos em campos de grama ou quadras de areia.',
    environmentalRiskFactor: 'Esforços intensos intermitentes sob sol direto; na areia, há calor refletido e contato com a superfície aquecida.'
  },
  {
    id: 'RUNNING',
    name: 'Corrida & Caminhada (Orla / Asfalto)',
    locationType: 'OUTDOOR',
    icon: '🏃',
    mets: 9.5,
    description: 'Prática no calçadão da Beira-Mar, asfalto e parques de Fortaleza.',
    environmentalRiskFactor: 'Radiação solar direta e calor acumulado no asfalto/concreto (albedo térmico).'
  },
  {
    id: 'ROWING',
    name: 'Remo & Canoa Havaiana (Va\'a / Náuticos)',
    locationType: 'WATER',
    icon: '🛶',
    mets: 8.0,
    description: 'Atividades na enseada do Mucuripe, Praia de Iracema e orla marítima.',
    environmentalRiskFactor: 'Reflexão solar na lâmina d\'água (+20% radiação UV/IR). Brisa fresca mascara a desidratação.'
  },
  {
    id: 'BEACH_SPORTS',
    name: 'Beach Tennis, Futevôlei & Vôlei de Areia',
    locationType: 'BEACH',
    icon: '🏐',
    mets: 8.5,
    description: 'Prática nas arenas de praia e quadras de areia da Beira-Mar e bairros.',
    environmentalRiskFactor: 'Temperatura da areia (muitas vezes > 50°C), sobrecarga condutiva nos pés e esforço intermitente.'
  },
  {
    id: 'CYCLING',
    name: 'Ciclismo (Orla & Ciclovias)',
    locationType: 'OUTDOOR',
    icon: '🚴',
    mets: 8.5,
    description: 'Treinos de speed, mountain bike e lazer nas vias litorâneas.',
    environmentalRiskFactor: 'Vento aparente evapora suor rapidamente gerando sede tardia. Acima de 35°C, o vento aquece o corpo.'
  },
  {
    id: 'CROSSFIT_BOX',
    name: 'Box Funcional / Crossfit / Ginásio Aberto',
    locationType: 'INDOOR',
    icon: '⚡',
    mets: 11.0,
    description: 'Espaços amplos com ventilação natural/mecânica e alta densidade de atletas.',
    environmentalRiskFactor: 'Elevação rápida da umidade relativa interna pela respiração e suor coletivo, limitando o resfriamento.'
  }
];

/**
 * Cálculo da Temperatura de Bulbo Úmido Natural (Tw) via Formulação de Stull (2011)
 * Validada pela AMS (American Meteorological Society), erro médio < 0.3°C.
 */
export function calculateWetBulbTemp(tempC: number, rh: number): number {
  const t = tempC;
  const rh_c = Math.max(5, Math.min(100, rh));

  const tw = t * Math.atan(0.151977 * Math.pow(rh_c + 8.313659, 0.5)) +
             Math.atan(t + rh_c) -
             Math.atan(rh_c - 1.676331) +
             0.00391838 * Math.pow(rh_c, 1.5) * Math.atan(0.023101 * rh_c) -
             4.686035;

  return parseFloat(tw.toFixed(2));
}

/**
 * Estimativa da Temperatura de Globo Negro (Tg) com base na Radiação Solar e Vento
 * Aproximação de Liljegren et al. (2008) e Australian Bureau of Meteorology (BOM).
 */
export function calculateGlobeTemp(tempC: number, windSpeed: number = 2.0, solarRad: number = 800): number {
  const ws = Math.max(0.2, windSpeed);
  // Fator de elevação de temperatura por radiação solar incidente (W/m²)
  const deltaTg = (solarRad / 1000) * (24.0 / (1.0 + 0.6 * ws));
  return parseFloat((tempC + deltaTg).toFixed(2));
}

/**
 * Cálculo do Índice de Bulbo Úmido e Termômetro de Globo (WBGT / IBUTG)
 * Padrão Ouro Internacional da Medicina Esportiva (ACSM, COI, FIFA, World Athletics)
 *
 * Ao ar livre com sol: WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Td
 * Em ambiente interno/sombra: WBGT = 0.7 * Tw + 0.3 * Td
 */
export function calculateWBGT(
  tempC: number,
  rh: number,
  windSpeed: number = 2.0,
  solarRad: number = 800,
  isIndoor: boolean = false
): number {
  const tw = calculateWetBulbTemp(tempC, rh);

  if (isIndoor || solarRad < 50) {
    // Indoor ou noite
    const wbgtIndoor = 0.7 * tw + 0.3 * tempC;
    return parseFloat(wbgtIndoor.toFixed(1));
  }

  const tg = calculateGlobeTemp(tempC, windSpeed, solarRad);
  const wbgtOutdoor = 0.7 * tw + 0.2 * tg + 0.1 * tempC;
  return parseFloat(wbgtOutdoor.toFixed(1));
}

/**
 * Determinação da Bandeira ACSM baseada no WBGT
 */
export function getWBGTFlag(wbgt: number): WBGTFlag {
  if (wbgt < 18.0) return 'GREEN';
  if (wbgt <= 22.2) return 'YELLOW';
  if (wbgt <= 27.9) return 'ORANGE';
  if (wbgt <= 30.0) return 'RED';
  return 'BLACK';
}

export interface WBGTFlagInfo {
  flag: WBGTFlag;
  label: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  rangeText: string;
  riskDescription: string;
  sportsGuideline: string;
}

export const WBGT_FLAG_DEFINITIONS: Record<WBGTFlag, WBGTFlagInfo> = {
  GREEN: {
    flag: 'GREEN',
    label: 'Bandeira Verde',
    name: 'Baixo Risco Térmico',
    color: '#10b981',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderClass: 'border-emerald-500',
    rangeText: 'WBGT < 18.0°C',
    riskDescription: 'Condições excelentes para esportes e atividade física.',
    sportsGuideline: 'Treinos e competições liberados em intensidade plena. Manter hidratação regular.'
  },
  YELLOW: {
    flag: 'YELLOW',
    label: 'Bandeira Amarela',
    name: 'Risco Moderado',
    color: '#eab308',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    borderClass: 'border-amber-500',
    rangeText: 'WBGT 18.0°C a 22.2°C',
    riskDescription: 'Atenção para atletas não aclimatizados ao calor ou pessoas com menor condicionamento.',
    sportsGuideline: 'Pausas programadas para água a cada 25-30 minutos. Monitorar atletas suscetíveis.'
  },
  ORANGE: {
    flag: 'ORANGE',
    label: 'Bandeira Laranja',
    name: 'Risco Elevado (Atenção Máxima)',
    color: '#f97316',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
    borderClass: 'border-orange-500',
    rangeText: 'WBGT 22.3°C a 27.9°C',
    riskDescription: 'Aumento significativo da taxa de esforço cardiovascular e perda por suor.',
    sportsGuideline: 'Reduzir volume e intensidade de treinos contínuos. Pausas mandatórias a cada 20 min com hidratação hidroeletrolítica.'
  },
  RED: {
    flag: 'RED',
    label: 'Bandeira Vermelha',
    name: 'Risco Severo (Muito Alto)',
    color: '#dc2626',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-900',
    borderClass: 'border-red-600',
    rangeText: 'WBGT 28.0°C a 30.0°C',
    riskDescription: 'Perigo grave de exaustão térmica e cãibras severas. Risco de golpe de calor.',
    sportsGuideline: 'Limitar treinos a no máximo 45 minutos com descansos prolongados na sombra a cada 15 min. Suspender treinos para iniciantes.'
  },
  BLACK: {
    flag: 'BLACK',
    label: 'Bandeira Preta',
    name: 'Risco Extremo / Cancelamento',
    color: '#0f172a',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-white',
    borderClass: 'border-slate-900',
    rangeText: 'WBGT > 30.1°C',
    riskDescription: 'Condição extrema de estresse fisiológico. Risco iminente de Golpe de Calor por Esforço (EHS) potencialmente fatal.',
    sportsGuideline: 'CANCELAMENTO ou suspensão total de eventos e treinos intensos contínuos ao ar livre. Transferir para salas climatizadas.'
  }
};

/**
 * Avaliação Completa de Risco Térmico para Modalidade Específica
 */
export function assessSportRisk(
  sport: SportCategory,
  tempC: number,
  rh: number,
  windSpeed: number = 2.0,
  solarRad: number = 800,
  bodyWeightKg: number = 70
): SportRiskAssessment {
  const isCrossfitBox = sport === 'CROSSFIT_BOX';

  // Em boxes de crossfit, a transpiração coletiva eleva a umidade efetiva
  const effectiveRh = isCrossfitBox ? Math.min(95, rh + 12) : rh;
  const effectiveSolar = isCrossfitBox ? 0 : solarRad;
  const effectiveTemp = tempC;

  // No remo/esportes de praia na Beira-mar há radiação refletida da água ou areia quente
  let extraRadiationBonus = 0;
  if (sport === 'ROWING') extraRadiationBonus = 150; // reflexão na lâmina d'água
  if (sport === 'BEACH_SPORTS') extraRadiationBonus = 120; // areia quente refletora
  if (sport === 'FUTEBOL') extraRadiationBonus = 120; // estimativa conservadora para futebol na areia

  const wbgt = calculateWBGT(
    effectiveTemp,
    effectiveRh,
    windSpeed,
    effectiveSolar + extraRadiationBonus,
    isCrossfitBox
  );

  const flag = getWBGTFlag(wbgt);
  const flagInfo = WBGT_FLAG_DEFINITIONS[flag];

  // Estimativa de perda de suor (ml/hora) baseada no peso corporal, intensidade metabólica e WBGT
  const sportMeta = SPORT_METADATA_LIST.find(s => s.id === sport) || SPORT_METADATA_LIST[0];
  const baseSweatRate = (bodyWeightKg / 70) * (sportMeta.mets / 8) * 750;
  const thermalMultiplier = 1.0 + Math.max(0, (wbgt - 20) * 0.05);
  const hydrationMlPerHour = Math.round(Math.min(2200, Math.max(450, baseSweatRate * thermalMultiplier)));

  // Necessidade de eletrólitos (sódio): recomendada se WBGT >= 22.3°C ou treinos > 1 hora
  const electrolyteRecommended = wbgt >= 22.3 || sportMeta.mets >= 9.0;

  // Duração segura de treino e descanso mandatório (Diretrizes ACSM / NHO 06)
  let maxContinuousDurationMin = 90;
  let mandatoryRestMin = 5;
  let restCycle = 'Pausas de 5 min a cada 40 min de treino.';

  if (flag === 'YELLOW') {
    maxContinuousDurationMin = 75;
    mandatoryRestMin = 8;
    restCycle = 'Pausas de 8 min à sombra a cada 30 min de treino.';
  } else if (flag === 'ORANGE') {
    maxContinuousDurationMin = 50;
    mandatoryRestMin = 12;
    restCycle = 'Pausas obrigatórias de 12 min à sombra a cada 20 min de esforço.';
  } else if (flag === 'RED') {
    maxContinuousDurationMin = 30;
    mandatoryRestMin = 15;
    restCycle = 'Descanso mandatório de 15 min a cada 15 min de esforço ativo.';
  } else if (flag === 'BLACK') {
    maxContinuousDurationMin = 0;
    mandatoryRestMin = 60;
    restCycle = 'Treino extenuante ao ar livre suspenso. Somente caminhadas leves ou treinos em sala climatizada.';
  }

  // Recomendações personalizadas
  const recommendations: string[] = [
    `Ingestão hídrica recomendada: ${hydrationMlPerHour} ml/h (${Math.round(hydrationMlPerHour / 4)} ml a cada 15 minutos).`,
    electrolyteRecommended
      ? 'Adicionar reposição hidroeletrolítica (isotônicos contendo 0,5 a 0,7 g/L de sódio) para evitar hiponatremia por diluição (SBMEE).'
      : 'Água pura fresca é suficiente para treinos de rotina nesta faixa térmica.',
    restCycle
  ];

  if (sport === 'ROWING') {
    recommendations.push('Atenção: A brisa oceânica na enseada do Mucuripe mascara a desidratação. Beba água mesmo sem sentir sede.');
    recommendations.push('Uso obrigatório de viseira, óculos com proteção UV e protetor solar resistente à água (FPS 50+).');
  } else if (sport === 'BEACH_SPORTS') {
    recommendations.push('Cuidado com a temperatura da areia (pode superar 50°C nas horas de pico). Recomenda-se sapatilha de praia ou molhar a quadra frequentemente.');
  } else if (sport === 'RUNNING') {
    recommendations.push('Evite o asfalto escuro entre 10h e 16h. Dê preferência ao calçadão arborizado ou orla nos horários das 05h às 07h30 ou após as 17h30.');
  } else if (sport === 'FUTEBOL') {
    recommendations.push('Prefira horários de menor exposição solar, faça pausas à sombra e reduza a intensidade se houver mal-estar; na areia, considere a superfície aquecida.');
  } else if (sport === 'CROSSFIT_BOX') {
    recommendations.push('Exija boa circulação de ar forçada por ventiladores industriais para remover o vapor d\'água expirado pelos atletas.');
  }

  // Riscos clínicos esperados nesta faixa térmica
  const clinicalRisks: string[] = [];
  if (flag === 'GREEN') {
    clinicalRisks.push('Baixo risco clínico geral.');
  } else if (flag === 'YELLOW') {
    clinicalRisks.push('Fadiga precoce em indivíduos sedentários.');
    clinicalRisks.push('Leve queda no rendimento aeróbio em treinos prolongados.');
  } else if (flag === 'ORANGE') {
    clinicalRisks.push('Cãibras induzidas pelo calor (perda excessiva de sódio no suor).');
    clinicalRisks.push('Síncope do calor (tontura e hipotensão postural após o término do exercício).');
    clinicalRisks.push('Déficit de atenção e coordenação motora fina.');
  } else if (flag === 'RED') {
    clinicalRisks.push('Exaustão Térmica por Esforço (pele fria/pálida, sudorese profusa, náuseas, cefaleia, hipotensão).');
    clinicalRisks.push('Risco de rabdomiólise pelo esforço combinado com desidratação.');
    clinicalRisks.push('Descompensação cardiovascular em hipertensos.');
  } else {
    clinicalRisks.push('EMERGÊNCIA MÉDICA: Golpe de Calor por Esforço (Exertional Heat Stroke - EHS).');
    clinicalRisks.push('Hipertermia central (> 40°C), alteração do nível de consciência, confusão mental, convulsão.');
    clinicalRisks.push('Necessidade imediata de imersão em banheira com água fria/gelo antes do transporte.');
  }

  return {
    flag,
    flagLabel: flagInfo.label,
    flagColor: flagInfo.color,
    wbgt,
    hydrationMlPerHour,
    electrolyteRecommended,
    maxContinuousDurationMin,
    mandatoryRestMin,
    restCycleDescription: restCycle,
    recommendations,
    clinicalRisks
  };
}

/**
 * Avaliação da Janela Segura do Dia (Horários de Ouro para Fortaleza)
 */
export function getFortalezaSportTimeWindows() {
  return [
    {
      period: 'Alvorada / Início da Manhã',
      hours: '05:00 - 07:30',
      rating: 'EXCELENTE',
      ratingColor: 'text-emerald-600 bg-emerald-50 border-emerald-300',
      description: 'Menor carga radiante, brisa marinha fresca e temperaturas mais amenas do dia (25°C a 27°C). Ideal para treinos longos de corrida, ciclismo e náuticos.'
    },
    {
      period: 'Manhã Intermediária',
      hours: '07:30 - 09:30',
      rating: 'BOM / MODERADO',
      ratingColor: 'text-amber-600 bg-amber-50 border-amber-300',
      description: 'Elevação rápida da radiação UV e solar. Hidratação reforçada e proteção solar obrigatória.'
    },
    {
      period: 'Pico Solar Crítico',
      hours: '09:30 - 16:00',
      rating: 'NÃO RECOMENDADO AO AR LIVRE',
      ratingColor: 'text-red-700 bg-red-50 border-red-300',
      description: 'Índices de radiação UV extremos (UV 11-13) e WBGT frequentemente em faixas Vermelha/Preta no asfalto e areia da praia. Recomenda-se treinos em academias climatizadas.'
    },
    {
      period: 'Fim de Tarde / Pôr do Sol',
      hours: '16:00 - 18:30',
      rating: 'MUITO BOM',
      ratingColor: 'text-blue-600 bg-blue-50 border-blue-300',
      description: 'Queda na radiação direta, vento constante na Beira-mar. Excelente para caminhadas, corrida e esportes de areia.'
    },
    {
      period: 'Noturno na Orla',
      hours: '18:30 - 22:00',
      rating: 'EXCELENTE',
      ratingColor: 'text-indigo-600 bg-indigo-50 border-indigo-300',
      description: 'Sem carga solar direta. Orla e calçadão iluminados, excelente para corrida e treinos funcionais ao ar livre com baixa sobrecarga térmica.'
    }
  ];
}
