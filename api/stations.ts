interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
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

interface StationsResponse {
  success: boolean;
  source: 'live_api' | 'simulated_fallback';
  timestamp: string;
  stations: StationData[];
}

const STATIONS_CACHE_TTL_MS = 20_000;
let cachedStations: { expiresAt: number; body: StationsResponse } | null = null;

// 1. Static Neighborhood mappings for the 11 Defesa Civil weather stations
const STATION_MAPPINGS: Record<number, {
  cleanName: string;
  primaryArea: string;
  secondaryAreas: string[];
}> = {
  9169: {
    cleanName: 'Messejana',
    primaryArea: 'Messejana',
    secondaryAreas: ['Cambeba', 'Paupina', 'Lagoa Redonda', 'Curió', 'Guajeru', 'José de Alencar', 'Coaçu']
  },
  8642: {
    cleanName: 'Centro',
    primaryArea: 'Centro',
    secondaryAreas: ['Praia de Iracema', 'Aldeota', 'Meireles', 'Jacarecanga', 'Moura Brasil', 'Farias Brito']
  },
  8836: {
    cleanName: 'Montese',
    primaryArea: 'Montese',
    secondaryAreas: ['Parangaba', 'Vila União', 'Itaoca', 'Bom Futuro', 'Jardim América', 'Aeroporto', 'Serrinha']
  },
  9281: {
    cleanName: 'Benfica',
    primaryArea: 'Benfica',
    secondaryAreas: ['Farias Brito', 'Rodolfo Teófilo', 'José Bonifácio', 'Gentilândia', 'Damas']
  },
  9134: {
    cleanName: 'Conjunto Esperança',
    primaryArea: 'Conjunto Esperança',
    secondaryAreas: ['Parque Prefeito José Walter', 'Mondubim', 'Maraponga', 'Planalto Ayrton Senna', 'Aracapé']
  },
  9282: {
    cleanName: 'Granja Lisboa',
    primaryArea: 'Granja Lisboa',
    secondaryAreas: ['Granja Portugal', 'Bom Jardim', 'Siqueira', 'Conjunto Ceará', 'Sertãozinho']
  },
  9242: {
    cleanName: 'Guararapes',
    primaryArea: 'Guararapes',
    secondaryAreas: ['Luciano Cavalcante', 'Cocó', 'Patriolino Ribeiro', 'Salinas', 'Edson Queiroz']
  },
  9249: {
    cleanName: 'Jangurussu',
    primaryArea: 'Jangurussu',
    secondaryAreas: ['Conjunto Palmeiras', 'Ancuri', 'Pedras', 'Barroso', 'Passaré']
  },
  9137: {
    cleanName: 'Mucuripe',
    primaryArea: 'Mucuripe',
    secondaryAreas: ['Cais do Porto', 'Varjota', 'Vicente Pinzon', 'Papicu', 'Aldeota']
  },
  8869: {
    cleanName: 'Vila Velha',
    primaryArea: 'Vila Velha',
    secondaryAreas: ['Barra do Ceará', 'Jardim Guanabara', 'Quintino Cunha', 'Antônio Bezerra', 'Cristo Redentor']
  },
  3318: {
    cleanName: 'Dom Lustosa',
    primaryArea: 'Dom Lustosa',
    secondaryAreas: ['Henrique Jorge', 'Pici', 'João XXIII', 'Autran Nunes', 'Bela Vista', 'Amadeu Furtado']
  }
};

// Baselines históricas correspondentes a cada ID para cálculo de anomalias
const STATION_BASELINES: Record<number, number> = {
  9169: 28.59, // Messejana
  8836: 31.04, // Montese
  8642: 32.39, // Centro
  9281: 29.8,
  9134: 30.1,
  9282: 30.9,
  9242: 29.5,
  9249: 30.2,
  9137: 29.1,
  8869: 28.9,
  3318: 29.7
};

// 2. Fórmulas de cálculo locais para robustez do serverless
function computeIDT(tempC: number, rh: number, windSpeed: number = 0, solarRad: number = 0): number {
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const at = tempC + 0.33 * e - 0.70 * windSpeed - 4.00;
  return parseFloat(Math.max(tempC, at).toFixed(1));
}

function computeICU(temp: number, refTemp: number): number {
  return parseFloat((temp - refTemp).toFixed(1));
}

function computeStatus(idt: number): string {
  if (idt <= 27) return 'NIVEL_0';
  if (idt <= 32) return 'NIVEL_1';
  if (idt <= 41.1) return 'NIVEL_2';
  return 'NIVEL_3';
}

function computeWBGT(tempC: number, rh: number, windSpeed: number = 2.0, solarRad: number = 800): number {
  const t = tempC;
  const rh_c = Math.max(5, Math.min(100, rh));
  // Tw (Stull 2011)
  const tw = t * Math.atan(0.151977 * Math.pow(rh_c + 8.313659, 0.5)) +
             Math.atan(t + rh_c) -
             Math.atan(rh_c - 1.676331) +
             0.00391838 * Math.pow(rh_c, 1.5) * Math.atan(0.023101 * rh_c) -
             4.686035;

  if (solarRad < 50) {
    return parseFloat((0.7 * tw + 0.3 * tempC).toFixed(1));
  }
  const ws = Math.max(0.2, windSpeed);
  const deltaTg = (solarRad / 1000) * (24.0 / (1.0 + 0.6 * ws));
  const tg = tempC + deltaTg;
  const wbgt = 0.7 * tw + 0.2 * tg + 0.1 * tempC;
  return parseFloat(wbgt.toFixed(1));
}

function computeSportFlag(wbgt: number): string {
  if (wbgt < 18.0) return 'GREEN';
  if (wbgt <= 22.2) return 'YELLOW';
  if (wbgt <= 27.9) return 'ORANGE';
  if (wbgt <= 30.0) return 'RED';
  return 'BLACK';
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (cachedStations && cachedStations.expiresAt > Date.now()) {
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=30');
    res.status(200).json(cachedStations.body);
    return;
  }

  const username = process.env.PLUGFIELD_USERNAME;
  const password = process.env.PLUGFIELD_PASSWORD;
  const apiKey = process.env.PLUGFIELD_API_KEY;

  if (!username || !password || !apiKey) {
    res.status(503).json({ error: 'Integração de estações não configurada. Defina as credenciais Plugfield nas variáveis de ambiente.' });
    return;
  }

  try {
    console.log("Connecting to Plugfield API...");
    // A. Autenticação
    const loginRes = await fetch("https://prod-api.plugfield.com.br/login", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(8000)
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = (await loginRes.json()) as { access_token: string };
    const accessToken = loginData.access_token;

    // B. Buscar estações
    const devicesRes = await fetch("https://prod-api.plugfield.com.br/device?limit=50&page_index=1", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Authorization": accessToken,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!devicesRes.ok) {
      throw new Error(`Fetch devices failed with status ${devicesRes.status}`);
    }

    const devicesData = (await devicesRes.json()) as { deviceList: any[] };
    const rawDevices = devicesData.deviceList || [];

    if (rawDevices.length === 0) {
      throw new Error("No devices returned from Plugfield API");
    }

    // C. Identificar a menor temperatura registrada (Referência Térmica Dinâmica)
    let minTemp = Infinity;
    let minTempId: number | null = null;

    for (const dev of rawDevices) {
      if (STATION_MAPPINGS[dev.id]) {
        const t = dev.dashboard?.temp ?? 28.0;
        if (t < minTemp) {
          minTemp = t;
          minTempId = dev.id;
        }
      }
    }

    if (minTemp === Infinity) {
      minTemp = 28.0;
      minTempId = 9169; // Messejana como fallback de segurança
    }

    // D. Mapear e Processar
    const processedStations: StationData[] = [];

    for (const dev of rawDevices) {
      const mapping = STATION_MAPPINGS[dev.id];
      if (!mapping) {
        continue;
      }

      let temp = dev.dashboard?.temp ?? 28.0;
      let humidity = dev.dashboard?.humi ?? 70;

      // Vento e Radiação do Plugfield (fallback para simulado se não existir)
      let windSpeed = dev.dashboard?.windSpeed ?? parseFloat((2.0 + Math.sin(dev.id) * 1.5).toFixed(1));
      let solarRadiation = dev.dashboard?.solarRadiation ??
        (new Date().getHours() >= 6 && new Date().getHours() <= 17
          ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (new Date().getHours() - 6) / 11)))
          : 0);

      // [Módulo de Integridade]: Validação de Dados (QC)
      let isSpurious = false;
      if (temp < 15 || temp > 50 || humidity < 10 || humidity > 100) {
        isSpurious = true;
        temp = STATION_BASELINES[dev.id] ?? 29.0;
        humidity = 70;
      }

      const idt = computeIDT(temp, humidity, windSpeed, solarRadiation);
      const icu = computeICU(temp, minTemp);
      const baseline = STATION_BASELINES[dev.id] ?? 29.0;
      const avgAnomaly = parseFloat((temp - baseline).toFixed(2));
      const isRef = dev.id === minTempId;
      const wbgt = computeWBGT(temp, humidity, windSpeed, solarRadiation);
      const sportFlag = computeSportFlag(wbgt);
      const isCoastal = dev.id === 9137 || dev.id === 8642 || mapping.cleanName.toLowerCase().includes('mucuripe') || mapping.cleanName.toLowerCase().includes('centro');

      processedStations.push({
        id: dev.id.toString(),
        name: mapping.cleanName + (isRef ? ' (Ref. Térmica)' : ''),
        lat: parseFloat(dev.latitude) || -3.76,
        lng: parseFloat(dev.longitude) || -38.53,
        temp,
        humidity,
        windSpeed,
        solarRadiation: parseFloat(solarRadiation.toFixed(1)),
        idt,
        icu,
        avgAnomaly,
        status: isSpurious ? 'OFFLINE' : computeStatus(idt),
        wbgt,
        sportFlag,
        isCoastal,
        primaryArea: mapping.primaryArea,
        secondaryAreas: mapping.secondaryAreas,
        isReference: isRef
      });
    }

    if (processedStations.length === 0) {
      throw new Error("No supported stations returned from Plugfield API");
    }

    // Ordenação dinâmica: maior temperatura real primeiro, seguida por sensação térmica (IDT)
    processedStations.sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });

    const response: StationsResponse = {
      success: true,
      source: "live_api",
      timestamp: new Date().toISOString(),
      stations: processedStations
    };
    cachedStations = { expiresAt: Date.now() + STATIONS_CACHE_TTL_MS, body: response };
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=30');
    res.status(200).json(response);

  } catch (error: any) {
    console.error("Plugfield API integration error, serving simulated fallback:", error);

    // Fallback de Resiliência: Simulação Física com Referência Térmica Dinâmica
    const simulatedStations = Object.entries(STATION_MAPPINGS).map(([idStr, mapping]) => {
      const id = parseInt(idStr);
      const baseline = STATION_BASELINES[id] ?? 29.0;

      const hashVal = id % 10;
      const temp = parseFloat((baseline + (Math.sin(Date.now() / 100000 + hashVal) * 1.5)).toFixed(1));
      const humidity = Math.max(30, Math.min(95, Math.round(65 + (Math.cos(Date.now() / 100000 + hashVal) * 10))));
      const windSpeed = parseFloat((2.5 + Math.sin(Date.now() / 50000 + hashVal) * 1.5).toFixed(1));
      const hour = new Date().getHours();
      const solarRadiation = hour >= 6 && hour <= 17
          ? Math.max(100, Math.min(1000, 800 * Math.sin(Math.PI * (hour - 6) / 11)))
          : 0;

      return {
        id: idStr,
        name: mapping.cleanName,
        lat: id === 9169 ? -3.82561 : (id === 8642 ? -3.72333 : (id === 8836 ? -3.77281 : -3.76 + (hashVal - 5) * 0.015)),
        lng: id === 9169 ? -38.48544 : (id === 8642 ? -38.53775 : (id === 8836 ? -38.55831 : -38.53 + (hashVal - 5) * 0.015)),
        temp,
        humidity,
        windSpeed,
        solarRadiation: parseFloat(solarRadiation.toFixed(1)),
        idt: computeIDT(temp, humidity, windSpeed, solarRadiation),
        icu: 0,
        avgAnomaly: parseFloat((temp - baseline).toFixed(2)),
        status: computeStatus(computeIDT(temp, humidity, windSpeed, solarRadiation)),
        primaryArea: mapping.primaryArea,
        secondaryAreas: mapping.secondaryAreas,
        isReference: false
      };
    });

    // Achar menor temperatura simulada
    let minTempSim = Infinity;
    let minTempIdSim = "9169";
    simulatedStations.forEach(s => {
      if (s.temp < minTempSim) {
        minTempSim = s.temp;
        minTempIdSim = s.id;
      }
    });

    const finalSimulated = simulatedStations.map(s => {
      const idt = computeIDT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
      const isRef = s.id === minTempIdSim;
      const wbgt = computeWBGT(s.temp, s.humidity, s.windSpeed, s.solarRadiation);
      const sportFlag = computeSportFlag(wbgt);
      const isCoastal = s.id === '9137' || s.id === '8642' || s.name.toLowerCase().includes('mucuripe') || s.name.toLowerCase().includes('centro');
      return {
        ...s,
        name: s.name + (isRef ? ' (Ref. Térmica)' : ''),
        idt,
        icu: computeICU(s.temp, minTempSim),
        status: computeStatus(idt),
        wbgt,
        sportFlag,
        isCoastal,
        isReference: isRef
      };
    });

    // Ordenação dinâmica para o fallback
    finalSimulated.sort((a, b) => {
      if (b.temp !== a.temp) return b.temp - a.temp;
      return b.idt - a.idt;
    });

    res.status(200).json({
      success: true,
      source: "simulated_fallback",
      timestamp: new Date().toISOString(),
      stations: finalSimulated
    });
  }
}
