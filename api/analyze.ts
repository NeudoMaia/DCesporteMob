import { GoogleGenAI, Type } from "@google/genai";

interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  windSpeed?: number;
  solarRadiation?: number;
  idt: number;
  icu: number;
  avgAnomaly: number;
  status: string;
  primaryArea: string;
  secondaryAreas: string[];
  isIoT?: boolean;
  isReference?: boolean;
  wbgt?: number;
  sportFlag?: string;
  isCoastal?: boolean;
}

export interface HealthPathologiesReport {
  alertLevel: 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';
  immediateImpacts: string;
  chronicAggravation: string;
  vectorialRisk: string;
  vulnerableGroups: string;
  protectionRecommendations: string[];
}

interface AIAnalysis {
  report: string;
  recommendations: {
    id: string;
    type: 'SPORTS' | 'HEALTH' | 'CIVIL_DEFENSE' | 'TRAFFIC';
    title: string;
    description: string;
    timeframe?: string;
    targetStation?: string;
  }[];
  healthReport?: HealthPathologiesReport;
}

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

function computeTw(tempC: number, rh: number): number {
  const t = tempC;
  const rh_c = Math.max(5, Math.min(100, rh));
  return t * Math.atan(0.151977 * Math.pow(rh_c + 8.313659, 0.5)) +
         Math.atan(t + rh_c) -
         Math.atan(rh_c - 1.676331) +
         0.00391838 * Math.pow(rh_c, 1.5) * Math.atan(0.023101 * rh_c) -
         4.686035;
}

function computeWBGTLocal(tempC: number, rh: number, windSpeed: number = 2.0, solarRad: number = 800): number {
  const tw = computeTw(tempC, rh);
  if (solarRad < 50) return parseFloat((0.7 * tw + 0.3 * tempC).toFixed(1));
  const ws = Math.max(0.2, windSpeed);
  const deltaTg = (solarRad / 1000) * (24.0 / (1.0 + 0.6 * ws));
  const tg = tempC + deltaTg;
  return parseFloat((0.7 * tw + 0.2 * tg + 0.1 * tempC).toFixed(1));
}

function getFlagLocal(wbgt: number): { flag: string, label: string } {
  if (wbgt < 18.0) return { flag: 'GREEN', label: 'Bandeira Verde (Baixo Risco)' };
  if (wbgt <= 22.2) return { flag: 'YELLOW', label: 'Bandeira Amarela (Risco Moderado)' };
  if (wbgt <= 27.9) return { flag: 'ORANGE', label: 'Bandeira Laranja (Risco Elevado)' };
  if (wbgt <= 30.0) return { flag: 'RED', label: 'Bandeira Vermelha (Risco Severo)' };
  return { flag: 'BLACK', label: 'Bandeira Preta (Risco Extremo / Cancelamento)' };
}

function generateDynamicFallback(stations: StationData[], forecasts?: any[]): AIAnalysis {
  const recommendations: any[] = [];

  if (!stations || stations.length === 0) {
    return {
      report: "Rede de monitoramento esportivo operando em rotina.",
      recommendations: []
    };
  }

  // Ordenar prioritariamente pela maior Temperatura Real do Ar (OMM)
  const sorted = [...stations].sort((a, b) => {
    if (b.temp !== a.temp) return b.temp - a.temp;
    return b.idt - a.idt;
  });

  const criticalStation = sorted[0];
  const maxTemp = criticalStation ? criticalStation.temp : 28;
  const maxIdt = criticalStation ? criticalStation.idt : 30;
  const sName = criticalStation ? criticalStation.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '') : 'Fortaleza';

  const wbgt = criticalStation.wbgt ?? computeWBGTLocal(maxTemp, criticalStation.humidity, criticalStation.windSpeed || 2.0, criticalStation.solarRadiation || 800);
  const flagInfo = getFlagLocal(wbgt);

  let healthAlertLevel: HealthPathologiesReport['alertLevel'] = 'Baixo';
  let immediateImpacts = "";
  let chronicAggravation = "";
  let vectorialRisk = "";
  let vulnerableGroups = "Atletas não aclimatizados ao calor tropical, maratonistas e corredores de longa distância na orla, praticantes infantojuvenis e atletas masters (veteranos).";
  let protectionRecommendations: string[] = [];

  if (wbgt > 30.0 || maxTemp >= 34.0) {
    healthAlertLevel = 'Extremo';
    immediateImpacts = `A estação de ${sName} registra temperatura extrema de ${maxTemp}°C e índice WBGT de ${wbgt}°C (Bandeira Preta). Risco crítico de Golpe de Calor por Esforço (Exertional Heat Stroke - EHS). A capacidade de resfriamento por evaporação do suor entra em falência frente à alta umidade e calor acumulado.`;
    chronicAggravation = `Sobrecarga cardiovascular crítica em treinos anaeróbios ou intervalados. Risco iminente de rabdomiólise por esforço térmico severo, colapso hemodinâmico e eventos cardíacos agudos.`;
    vectorialRisk = `Microclima da Beira-Mar e Arenas de Praia: A temperatura da superfície do asfalto escuro e da areia ultrapassa 52°C, emitindo radiação infravermelha de ondas longas diretamente sobre os membros inferiores dos atletas.`;
    protectionRecommendations = [
      `SUSPENSÃO IMEDIATA de treinos pesados contínuos e provas de corrida ao ar livre na região de ${sName}.`,
      `Transferir treinos para horários após as 18h00 ou para salas climatizadas com ar condicionado.`,
      `Protocolo Emergencial de Golpe de Calor (ACSM/COI): "Cool First, Transport Second" — imersão imediata do atleta em água com gelo antes do transporte hospitalar.`,
      `Assessorias de corrida devem recolher atletas do asfalto aberto entre 10h e 16h.`
    ];
    recommendations.push({
      id: "rec-cur-1",
      type: "SPORTS",
      title: `SUSPENSÃO DE TREINOS PESADOS AO AR LIVRE - ${sName}`,
      description: `Bandeira Preta (${wbgt}°C WBGT). Suspender treinos intensos e provas de endurance no asfalto e calçadão aberto. Risco de hipertermia maligna.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-cur-2",
      type: "HEALTH",
      title: `Protocolo de Golpe de Calor (EHS) - ${sName}`,
      description: `Se houver desmaio, confusão mental ou ataxia, acionar SAMU (192) e resfriar ativamente com água gelada imediatamente ("Cool First, Transport Second").`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else if (wbgt >= 28.0 || maxTemp >= 31.5) {
    healthAlertLevel = 'Alto';
    immediateImpacts = `Estação de ${sName} com ${maxTemp}°C e WBGT de ${wbgt}°C (${flagInfo.label}). Risco elevado de Exaustão Térmica por Esforço (Heat Exhaustion), cãibras severas de calor e desidratação osmótica acelerada (> 1.200 ml/h).`;
    chronicAggravation = `Vasodilatação periférica máxima diminui o volume sistólico, gerando taquicardia desproporcional à intensidade da corrida e risco de síncope térmica ao interromper o esforço bruscamente.`;
    vectorialRisk = `Ambientes fechados (Academias e Boxes de Crossfit): O suor coletivo eleva a umidade relativa interna acima de 80%, impedindo o resfriamento evaporativo e causando exaustão precoce.`;
    protectionRecommendations = [
      `Limitar a duração de treinos de corrida e esportes de areia a no máximo 45 minutos.`,
      `Pausas mandatórias de 12 a 15 minutos na sombra a cada 15-20 minutos de esforço.`,
      `Reposição eletrolítica obrigatória: consumir 0,5 a 0,7 g/L de sódio em água para prevenir hiponatremia associada ao exercício (SBMEE).`,
      `Ligar ventiladores industriais e manter portas abertas em boxes de treino funcional.`
    ];
    recommendations.push({
      id: "rec-cur-1",
      type: "SPORTS",
      title: `Redução de Carga e Volume de Treino - ${sName}`,
      description: `Bandeira Vermelha ACSM. Encurtar treinos de corrida na Beira-mar e adotar pausas obrigatórias de 15 min à sombra a cada 15 min de esforço ativo.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-cur-2",
      type: "SPORTS",
      title: `Cuidados em Arenas de Beach Tennis & Náuticos - ${sName}`,
      description: `Molhar quadras de areia para diminuir o calor condutivo e forçar ingestão hídrica para remadores na enseada do Mucuripe.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else if (wbgt >= 22.3 || maxTemp >= 29.5) {
    healthAlertLevel = 'Moderado';
    immediateImpacts = `Índice WBGT de ${wbgt}°C em ${sName} (Bandeira Laranja). Sobrecarga moderada para atletas treinados, porém risco significativo para praticantes amadores ou em fase inicial de aclimatação.`;
    chronicAggravation = `Fadiga precoce em treinos de longa duração e risco de cãibras musculares por perda de eletrólitos no suor.`;
    vectorialRisk = `Radiação na Orla de Fortaleza: O índice UV atinge níveis muito altos a extremos entre 10h e 15h, potencializando o desgaste fisiológico.`;
    protectionRecommendations = [
      `Ingestão fracionada de líquidos: 150 a 250 ml a cada 15 a 20 minutos de treino.`,
      `Pausas programadas à sombra a cada 25-30 minutos de esforço contínuo.`,
      `Uso obrigatório de viseiras, roupas leves com tecnologia dry e proteção solar FPS 50+.`
    ];
    recommendations.push({
      id: "rec-cur-1",
      type: "SPORTS",
      title: `Hidratação Fracionada e Pausas - ${sName}`,
      description: `Recomenda-se ingestão hídrica de 800 a 1.000 ml/h com pausas à sombra a cada 25 minutos para corredores e ciclistas na orla.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else {
    healthAlertLevel = 'Baixo';
    immediateImpacts = `Condições térmicas favoráveis para esportes ao ar livre em ${sName} (${flagInfo.label}).`;
    chronicAggravation = `Termorregulação eficiente e estabilidade cardiovascular durante a prática esportiva.`;
    vectorialRisk = `Microclima ideal na orla marítima, parques e centros de treinamento.`;
    protectionRecommendations = [
      `Manter rotina regular de hidratação (400-600 ml/h).`,
      `Aproveitar a janela ótima de treino.`
    ];
    recommendations.push({
      id: "rec-cur-1",
      type: "SPORTS",
      title: `Janela Segura de Treinos - ${sName}`,
      description: `Condições excelentes para treinos de corrida, ciclismo e náuticos na Beira-Mar com ${maxTemp}°C reais.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  }

  const report = `Diagnóstico Médico Esportivo em Tempo Real: A estação meteorológica de ${sName} registra a maior sobrecarga térmica de Fortaleza (${maxTemp}°C reais, sensação de ${maxIdt}°C e índice WBGT de ${wbgt}°C — ${flagInfo.label}). Alerta fisiológico de medicina do exercício classificado como nível ${healthAlertLevel.toUpperCase()}. Assessorias esportivas e atletas na orla da Beira-Mar e parques devem seguir rigorosamente as prescrições de pausas à sombra, taxa de hidratação eletrolítica (SBMEE) e limites de intensidade do ACSM.`;

  return {
    report,
    recommendations: recommendations.slice(0, 4),
    healthReport: {
      alertLevel: healthAlertLevel,
      immediateImpacts,
      chronicAggravation,
      vectorialRisk,
      vulnerableGroups,
      protectionRecommendations
    }
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidStation(value: unknown): value is StationData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const station = value as Record<string, unknown>;
  return typeof station.id === 'string' && station.id.length <= 64 &&
    typeof station.name === 'string' && station.name.length > 0 && station.name.length <= 120 &&
    isFiniteNumber(station.lat) && station.lat >= -90 && station.lat <= 90 &&
    isFiniteNumber(station.lng) && station.lng >= -180 && station.lng <= 180 &&
    isFiniteNumber(station.temp) && station.temp >= -10 && station.temp <= 60 &&
    isFiniteNumber(station.humidity) && station.humidity >= 0 && station.humidity <= 100 &&
    isFiniteNumber(station.idt) &&
    isFiniteNumber(station.icu) &&
    isFiniteNumber(station.avgAnomaly) &&
    typeof station.status === 'string' &&
    typeof station.primaryArea === 'string' &&
    Array.isArray(station.secondaryAreas) &&
    station.secondaryAreas.length <= 50 &&
    station.secondaryAreas.every(area => typeof area === 'string') &&
    (station.windSpeed === undefined || (isFiniteNumber(station.windSpeed) && station.windSpeed >= 0 && station.windSpeed <= 100)) &&
    (station.solarRadiation === undefined || (isFiniteNumber(station.solarRadiation) && station.solarRadiation >= 0 && station.solarRadiation <= 2500)) &&
    (station.wbgt === undefined || isFiniteNumber(station.wbgt));
}

function isValidForecast(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const forecast = value as Record<string, unknown>;
  return typeof forecast.name === 'string' && forecast.name.length <= 120 &&
    (forecast.idtForecast === undefined ||
      (Array.isArray(forecast.idtForecast) &&
        forecast.idtForecast.length <= 10 &&
        forecast.idtForecast.every(point =>
          Boolean(point) && typeof point === 'object' && isFiniteNumber((point as Record<string, unknown>).value)
        )));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let requestBody: unknown;
  try {
    requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }

  if (!requestBody || typeof requestBody !== 'object' || Array.isArray(requestBody)) {
    res.status(400).json({ error: 'Request body must be an object' });
    return;
  }

  const body = requestBody as Record<string, unknown>;
  if (!Array.isArray(body.stations) || body.stations.length > 50 || !body.stations.every(isValidStation)) {
    res.status(400).json({ error: 'stations must contain at most 50 valid station records' });
    return;
  }

  if (body.forecasts !== undefined &&
    (!Array.isArray(body.forecasts) || body.forecasts.length > 50 || !body.forecasts.every(isValidForecast))) {
    res.status(400).json({ error: 'forecasts must contain at most 50 valid forecast records' });
    return;
  }

  const stations = body.stations;
  const forecasts = (body.forecasts ?? []) as any[];

  if (!GEMINI_KEY) {
    const dynamicAnalysis = generateDynamicFallback(stations, forecasts);
    res.status(200).json(dynamicAnalysis);
    return;
  }

  // Ordenação por Temperatura Real do Ar (Critério Termodinâmico OMM)
  const sortedStations = [...stations].sort((a, b) => {
    if (b.temp !== a.temp) return b.temp - a.temp;
    return b.idt - a.idt;
  });
  const hottestStation = sortedStations[0];
  const sHottestName = hottestStation
    ? hottestStation.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '')
    : 'Fortaleza';

  const hottestWbgt = hottestStation
    ? (hottestStation.wbgt ?? computeWBGTLocal(hottestStation.temp, hottestStation.humidity, hottestStation.windSpeed || 2.0, hottestStation.solarRadiation || 800))
    : 28.0;

  const hottestFlag = getFlagLocal(hottestWbgt);

  const stationSummary = sortedStations.map((s, idx) => {
    const wbgt = s.wbgt ?? computeWBGTLocal(s.temp, s.humidity, s.windSpeed || 2.0, s.solarRadiation || 800);
    const fl = getFlagLocal(wbgt);
    return `${idx + 1}º ${s.name}: ${s.temp}°C reais (WBGT: ${wbgt}°C [${fl.label}], Sensação: ${s.idt}°C, Vento: ${s.windSpeed || 2.0}m/s, Rad: ${s.solarRadiation || 800}W/m²)`;
  }).join('\n');

  const prompt = `
[PROMPT DE SISTEMA: MOTOR DE MEDICINA DO ESPORTE E FISIOLOGIA DO EXERCÍCIO - DCESPORTE FORTALEZA]

Papel:
Você é o médico especialista em Medicina do Exercício e Fisiologia Térmica da plataforma DCESPORTE (Fortaleza). Sua missão é emitir o PARECER MÉDICO ESPORTIVO EM TEMPO REAL e RECOMENDAÇÕES DE TREINO com foco primordial na ESTAÇÃO METEOROLÓGICA DE MAIOR TEMPERATURA E SOBRECARGA TÉRMICA DA CIDADE.

ESTAÇÃO MAIS QUENTE EM TEMPO REAL:
- Estação: "${sHottestName}"
- Temperatura Real: ${hottestStation?.temp}°C
- Umidade: ${hottestStation?.humidity}%
- Índice WBGT Esportivo: ${hottestWbgt}°C
- Bandeira ACSM: ${hottestFlag.label}
- Sensação Térmica (IDT): ${hottestStation?.idt}°C

DADOS DE TODAS AS ESTAÇÕES EM TEMPO REAL (Ordenadas da maior para a menor temperatura):
${stationSummary}

LITERATURA MÉDICA E DIRETRIZES DE RESPALDO OBRIGATÓRIAS:
1. ACSM (American College of Sports Medicine) - Exertional Heat Illness during Training and Competition:
   - Bandeira Verde (< 18°C): Baixo risco.
   - Bandeira Amarela (18 - 22.2°C): Risco moderado, hidratação regular.
   - Bandeira Laranja (22.3 - 27.9°C): Risco elevado, pausas a cada 20 min com eletrólitos.
   - Bandeira Vermelha (28 - 30°C): Risco severo, treinos limitados a 45 min com 15 min de descanso na sombra.
   - Bandeira Preta (> 30.1°C): Risco extremo, suspensão imediata de treinos intensos contínuos ao ar livre.
2. COI / IOC (Comitê Olímpico Internacional):
   - Protocolo "Cool First, Transport Second" para Golpe de Calor por Esforço (EHS): resfriamento agressivo com água e gelo antes da remoção em ambulância.
3. SBMEE (Sociedade Brasileira de Medicina do Exercício e do Esporte):
   - Taxa de perda hídrica e reposição de 0,5 a 0,7 g/L de sódio em exercícios > 1h no calor para prevenir Hiponatremia Associada ao Exercício (EAH).
4. Cenários de Fortaleza:
   - Orla da Beira-Mar: asfalto e calçadão escuro irradiam calor infravermelho (+3°C a +5°C no microclima do corredor).
   - Remo na Enseada do Mucuripe: radiação refletida na lâmina d'água (+20%) e desidratação silenciosa pela brisa do mar.
   - Beach Tennis e Areia: temperatura da areia frequentemente > 50°C.
   - Academias e Boxes de Crossfit: saturação da umidade relativa do ar pela transpiração coletiva.

REGRAS ESTRITAS:
- Foco absoluto na ESTAÇÃO MAIS QUENTE ("${sHottestName}"). O parecer ("report") deve destacar as condições desta estação como referência para as assessorias de treino e atletas de Fortaleza.
- Fale com rigor médico esportivo, termos fisiológicos precisos (termorregulação, débito cardíaco, perda eletrolítica, taxa de sudorese).
- As recomendações devem ser aplicáveis a corredores na Beira-mar, praticantes de remo/náuticos, esportes de areia e academias.

Gere uma resposta em JSON contendo:
1. "report": Parecer médico esportivo executivo em português destacando "${sHottestName}".
2. "recommendations": Array de 3 a 5 ações acionáveis ('SPORTS' ou 'HEALTH'), contendo id, type, title, description, timeframe, targetStation.
3. "healthReport": Objeto com alertLevel, immediateImpacts, chronicAggravation, vectorialRisk (fator de microclima da orla/arenas), vulnerableGroups, protectionRecommendations.
`;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['SPORTS', 'HEALTH', 'CIVIL_DEFENSE', 'TRAFFIC'] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  targetStation: { type: Type.STRING }
                },
                required: ['id', 'type', 'title', 'description', 'timeframe', 'targetStation']
              }
            },
            healthReport: {
              type: Type.OBJECT,
              properties: {
                alertLevel: { type: Type.STRING, enum: ['Baixo', 'Moderado', 'Alto', 'Extremo'] },
                immediateImpacts: { type: Type.STRING },
                chronicAggravation: { type: Type.STRING },
                vectorialRisk: { type: Type.STRING },
                vulnerableGroups: { type: Type.STRING },
                protectionRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['alertLevel', 'immediateImpacts', 'chronicAggravation', 'vectorialRisk', 'vulnerableGroups', 'protectionRecommendations']
            }
          },
          required: ['report', 'recommendations', 'healthReport']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}') as AIAnalysis;
    res.status(200).json(parsed);
  } catch (error) {
    console.error('AI Sports Analysis failed, serving dynamic fallback:', error);
    const dynamicAnalysis = generateDynamicFallback(stations, forecasts);
    res.status(200).json(dynamicAnalysis);
  }
}
