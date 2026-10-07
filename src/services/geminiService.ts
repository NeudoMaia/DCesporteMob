/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StationData, AIAnalysis, HealthPathologiesReport } from "../types";
import { calculateWBGT, getWBGTFlag, WBGT_FLAG_DEFINITIONS } from "../lib/sportUtils";

const ANALYZE_ENDPOINT = '/api/analyze';

export function generateClientDynamicAnalysis(stations: StationData[], forecasts?: any[]): AIAnalysis {
  if (!stations || stations.length === 0) {
    return {
      report: "Rede de monitoramento operando em rotina. Sensores sob acompanhamento contínuo.",
      recommendations: [
        {
          id: "rec-def-1",
          type: "CIVIL_DEFENSE",
          title: "Monitoramento de Rotina",
          description: "Manter observação das estações automáticas da Defesa Civil.",
          timeframe: "Imediato",
          targetStation: "Fortaleza"
        }
      ]
    };
  }

  const sorted = [...stations].sort((a, b) => b.temp - a.temp);
  const hottest = sorted[0];
  const sName = hottest.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');

  const recommendations: AIAnalysis['recommendations'] = [];

  const currentLevel = hottest.status;
  const currentLevelName =
    currentLevel === 'NIVEL_3' ? 'Alarme (Perigo Extremo)' :
    currentLevel === 'NIVEL_2' ? 'Alerta' :
    currentLevel === 'NIVEL_1' ? 'Atenção' : 'Seguro (Rotina)';

  if (currentLevel === 'NIVEL_1') {
    recommendations.push({
      id: "rec-1",
      type: "SPORTS",
      title: `Diretriz Esportiva (ACSM Bandeira Amarela) - ${sName}`,
      description: `Ponto mais quente com ${hottest.temp}°C reais e sensação de ${hottest.idt.toFixed(1)}°C. Recomenda-se hidratação de 600-800 ml/h para corredores e praticantes na Beira-mar. Pausas de 5-8 min a cada 30 min de esforço.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-2",
      type: "HEALTH",
      title: `Hidratação & Termorregulação - ${sName}`,
      description: `Atenção para atletas não aclimatizados e assessorias de corrida na orla. Manter ingestão constante de líquidos frescos.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else if (currentLevel === 'NIVEL_2') {
    recommendations.push({
      id: "rec-1",
      type: "SPORTS",
      title: `Alerta Esportivo (ACSM Bandeira Laranja/Vermelha) - ${sName}`,
      description: `Sensação térmica elevada de ${hottest.idt.toFixed(1)}°C. Assessorias esportivas e atletas devem reduzir a intensidade dos treinos ao ar livre. Na Beira-mar, a radiação do asfalto e da areia amplia o estresse térmico. Pausas obrigatórias de 12-15 min a cada 20 min com eletrólitos (sódio).`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-2",
      type: "SPORTS",
      title: `Esportes de Areia e Náuticos - Orla de Fortaleza`,
      description: `Atenção para o calor na areia do Beach Tennis/Futevôlei e reflexão na lâmina d'água no Remo/Canoa Va'a. Hidratação reforçada e proteção solar com FPS 50+.`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-3",
      type: "HEALTH",
      title: `Prevenção de Exaustão Térmica - ${sName}`,
      description: `Risco de cãibras severas e desidratação aguda. Em academias e boxes sem climatização, reforçar a ventilação forçada mecânica.`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else if (currentLevel === 'NIVEL_3') {
    recommendations.push({
      id: "rec-1",
      type: "SPORTS",
      title: `URGÊNCIA ESPORTIVA (ACSM Bandeira Preta) - ${sName}`,
      description: `Sensação térmica crítica de ${hottest.idt.toFixed(1)}°C. SUSPENSÃO IMEDIATA de treinos pesados contínuos e competições ao ar livre. Transferir atividades para centros esportivos climatizados. Risco iminente de Golpe de Calor por Esforço (EHS).`,
      timeframe: "Imediato",
      targetStation: sName
    });
    recommendations.push({
      id: "rec-2",
      type: "HEALTH",
      title: `Protocolo Emergencial de Golpe de Calor (EHS) - ${sName}`,
      description: `Em caso de confusão mental ou colapso térmico, aplicar imediatamente resfriamento rápido com água gelada/gelo antes do transporte médico hospitalar ("Cool First, Transport Second").`,
      timeframe: "Imediato",
      targetStation: sName
    });
  } else {
    recommendations.push({
      id: "rec-1",
      type: "SPORTS",
      title: `Janela Ouro para Treinos - ${sName}`,
      description: `Condições favoráveis para corridas, ciclismo e náuticos com ${hottest.temp}°C. Manter rotina padrão de hidratação (400-600 ml/h).`,
      timeframe: "Imediato",
      targetStation: sName
    });
  }

  // Verificar previsões futuras de Holt se enviadas
  if (forecasts && forecasts.length > 0) {
    const rising = forecasts
      .map(f => {
        const name = f.name.replace(' (Ref. Térmica)', '').replace(' (Ref. T\u00e9rmica)', '');
        const maxVal = f.idtForecast ? Math.max(...f.idtForecast.map((d: any) => d.value)) : 0;
        return { name, maxVal };
      })
      .sort((a, b) => b.maxVal - a.maxVal)[0];

    if (rising && rising.maxVal > 30) {
      recommendations.push({
        id: "rec-pred-1",
        type: "CIVIL_DEFENSE",
        title: `Projeção de Aquecimento (${rising.name})`,
        description: `Modelo Holt projeta pico térmico de até ${rising.maxVal.toFixed(1)}°C nos próximos 3 dias em ${rising.name}.`,
        timeframe: "Próximas 48h",
        targetStation: rising.name
      });
    }
  }

  // Análise médica esportiva dinâmica focada na estação com maior temperatura
  const maxIdt = hottest.idt;
  const maxTemp = hottest.temp;
  const maxWbgt = hottest.wbgt ?? calculateWBGT(hottest.temp, hottest.humidity, hottest.windSpeed, hottest.solarRadiation);
  const flag = getWBGTFlag(maxWbgt);
  const flagInfo = WBGT_FLAG_DEFINITIONS[flag];

  let healthAlertLevel: HealthPathologiesReport['alertLevel'] = 'Baixo';
  let immediateImpacts = "";
  let chronicAggravation = "";
  let vectorialRisk = "";
  let vulnerableGroups = "Atletas não aclimatizados, esportistas de longa distância (maratonistas/triatletas), praticantes infantojuvenis (menor taxa de sudorese por área corporal) e atletas masters.";
  let protectionRecommendations: string[] = [];

  if (flag === 'BLACK' || maxTemp >= 34.0) {
    healthAlertLevel = 'Extremo';
    immediateImpacts = `A estação de ${sName} registra temperatura extrema de ${maxTemp}°C e índice WBGT de ${maxWbgt}°C (Bandeira Preta). Risco crítico de Golpe de Calor por Esforço (Exertional Heat Stroke - EHS). A evaporação cutânea torna-se insuficiente para compensar a produção de calor metabólico, levando a rápida hipertermia central (> 40°C).`;
    chronicAggravation = `Sobrecarga cardiovascular extrema em treinos de alta intensidade. Risco de rabdomiólise pelo esforço associado à desidratação celular, colapso circulatório e arritmias cardíacas em praticantes com cardiopatias subjacentes.`;
    vectorialRisk = `Microclima da Orla e Arenas: O asfalto da Beira-Mar e a areia de praias/arenas superam 52°C por radiação de ondas longas, criando um bolsão térmico hostil ao nível do praticante.`;
    protectionRecommendations = [
      `SUSPENSÃO IMEDIATA de treinos pesados contínuos e corridas ao ar livre sob sol direto na região de ${sName}.`,
      `Transferir treinos para horários após as 18h00 ou para academias com ar condicionado central.`,
      `Em caso de síncope ou alteração de consciência, aplicar regra de ouro do ACSM: "Cool First, Transport Second" com imersão em água gelada.`,
      `Postos de hidratação mandatórios a cada 1,5 km para assessorias esportivas autorizadas.`
    ];
  } else if (flag === 'RED' || maxTemp >= 31.5) {
    healthAlertLevel = 'Alto';
    immediateImpacts = `Índice WBGT de ${maxWbgt}°C na estação de ${sName} (Bandeira Vermelha). Risco elevado de Exaustão Térmica por Esforço (Heat Exhaustion), cãibras severas e desidratação osmótica acelerada (> 1.200 ml/h).`;
    chronicAggravation = `Vasodilatação periférica máxima compromete o débito cardíaco. Atletas relatam cefaleia pulsátil, náuseas, calafrios e taquicardia desproporcional à carga de treino.`;
    vectorialRisk = `Ambientes fechados (Boxes de Crossfit/Lutas): Acúmulo de vapor d'água de múltiplos atletas satura o ar interno (UR > 80%), anulando o resfriamento evaporativo do suor.`;
    protectionRecommendations = [
      `Limitar duração do treino ao ar livre a no máximo 45 minutos com pausas de 15 min à sombra a cada 15 min de esforço.`,
      `Ingestão hidroeletrolítica obrigatória: reposição de 0,5 a 0,7 g/L de sódio para prevenir hiponatremia associada ao exercício (SBMEE).`,
      `Molhar quadras de Beach Tennis e areia antes das partidas para reduzir a transferência condutiva de calor.`,
      `Ventilação forçada industrial contínua em galpões e boxes sem climatização.`
    ];
  } else if (flag === 'ORANGE' || maxTemp >= 29.5) {
    healthAlertLevel = 'Moderado';
    immediateImpacts = `Índice WBGT de ${maxWbgt}°C em ${sName} (Bandeira Laranja). Risco moderado a alto para atletas não aclimatizados. Perda hídrica estimada entre 800 e 1.000 ml/hora.`;
    chronicAggravation = `Queda precoce no rendimento aeróbio e risco de hipotensão ortostática pós-exercício (síncope do calor) ao parar bruscamente a corrida.`;
    vectorialRisk = `Esportes Náuticos na Enseada do Mucuripe: A brisa do mar alivia a sensação na pele, mas a radiação refletida na lâmina d'água acelera a perda hídrica imperceptível.`;
    protectionRecommendations = [
      `Fracionar hidratação: 150 a 250 ml a cada 15-20 minutos de treino.`,
      `Pausas obrigatórias de descanso à sombra a cada 20-30 minutos.`,
      `Uso obrigatório de viseiras, roupas leves com proteção UV e protetor solar FPS 50+.`
    ];
  } else {
    healthAlertLevel = 'Baixo';
    immediateImpacts = `Condições térmicas favoráveis para a prática de esportes na estação de ${sName} (${flagInfo.label}).`;
    chronicAggravation = `Estabilidade fisiológica esperada durante o exercício físico regular.`;
    vectorialRisk = `Microclima seguro tanto na orla quanto em academias e parques de Fortaleza.`;
    protectionRecommendations = [
      `Manter hidratação preventiva regular (400-600 ml/hora).`,
      `Aproveitar a janela ótima de treino.`
    ];
  }

  const report = `Diagnóstico Médico Esportivo em Tempo Real: A estação meteorológica de ${sName} apresenta atualmente a maior sobrecarga térmica da cidade (${hottest.temp}°C reais, sensação térmica de ${hottest.idt.toFixed(1)}°C e índice WBGT de ${maxWbgt}°C — ${flagInfo.label}: ${flagInfo.name}). Com base nos consensos do ACSM e da SBMEE, o risco clínico para atletas na região está classificado como nível ${healthAlertLevel.toUpperCase()}. Recomenda-se rigorosa adaptação da relação esforço/descanso, hidratação hidroeletrolítica e proteção contra a radiação direta na Beira-Mar e parques.`;

  return {
    report,
    recommendations: recommendations.slice(0, 5),
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

export async function analyzeThermalData(stations: StationData[], forecasts: any[]): Promise<AIAnalysis> {
  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stations, forecasts }),
    });

    if (response.ok) {
      const result = await response.json() as AIAnalysis;
      if (result && result.report && result.recommendations) {
        return result;
      }
    }

    // Se a API retornar objeto JSON de fallback válido
    const data = await response.json().catch(() => null);
    if (data && data.report && data.recommendations) {
      return data;
    }

    return generateClientDynamicAnalysis(stations, forecasts);
  } catch (error) {
    console.warn("Conexão ao servidor de IA indisponível, gerando análise dinâmica local:", error);
    return generateClientDynamicAnalysis(stations, forecasts);
  }
}
