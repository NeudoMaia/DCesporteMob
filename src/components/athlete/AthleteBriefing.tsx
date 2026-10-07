import React, { useMemo, useState } from 'react';
import { AlertTriangle, Crosshair, Droplets, LocateFixed, MapPin, ShieldCheck, Sun, Wind } from 'lucide-react';
import { StationData, SportCategory } from '../../types';
import { assessSportRisk, SPORT_METADATA_LIST, WBGT_FLAG_DEFINITIONS } from '../../lib/sportUtils';
import { cn } from '../../lib/utils';

interface AthleteBriefingProps { stations: StationData[]; selectedSport: SportCategory; onSelectSport: (sport: SportCategory) => void; isLive: boolean; }
type Position = { latitude: number; longitude: number };

const distanceKm = (a: Position, b: StationData) => {
  const r = 6371, dLat = ((b.lat - a.latitude) * Math.PI) / 180, dLng = ((b.lng - a.longitude) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export function AthleteBriefing({ stations, selectedSport, onSelectSport, isLive }: AthleteBriefingProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const nearest = useMemo(() => !stations.length ? undefined : !position ? (stations.find((s) => s.isCoastal) ?? stations[0]) : [...stations].sort((a, b) => distanceKm(position, a) - distanceKm(position, b))[0], [position, stations]);
  const distance = position && nearest ? distanceKm(position, nearest) : null;
  const assessment = useMemo(() => nearest && assessSportRisk(selectedSport, nearest.temp, nearest.humidity, nearest.windSpeed, nearest.solarRadiation, 70), [nearest, selectedSport]);
  const flag = assessment ? WBGT_FLAG_DEFINITIONS[assessment.flag] : WBGT_FLAG_DEFINITIONS.GREEN;
  const locate = () => {
    if (!navigator.geolocation) return setLocationError('Seu navegador não oferece geolocalização. Escolhemos uma estação de referência.');
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(({ coords }) => setPosition({ latitude: coords.latitude, longitude: coords.longitude }), () => setLocationError('Não foi possível obter sua localização. Você pode permitir o acesso nas configurações do navegador.'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };
  if (!nearest || !assessment) return null;
  return <section className="mx-auto max-w-2xl space-y-4 pb-24">
    <div className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-7"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">DCE Esporte · seu briefing</span><h2 className="mt-2 text-3xl font-black tracking-tight">Antes de treinar</h2><p className="mt-1 text-sm text-slate-300">Condições térmicas e orientação prática perto de você.</p></div><div className={cn('rounded-2xl border px-3 py-2 text-center text-xs font-black', flag.badgeBg, flag.badgeText, flag.borderClass)}><span className="block text-[10px] uppercase opacity-70">Risco</span>{flag.label.replace('Bandeira ', '')}</div></div><div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/10 p-3"><div className="px-2"><span className="text-[10px] font-bold uppercase text-slate-400">WBGT</span><strong className="mt-1 block text-xl">{assessment.wbgt.toFixed(1)}°</strong></div><div className="px-3"><span className="text-[10px] font-bold uppercase text-slate-400">Temp.</span><strong className="mt-1 block text-xl">{nearest.temp.toFixed(1)}°</strong></div><div className="px-3"><span className="text-[10px] font-bold uppercase text-slate-400">Umidade</span><strong className="mt-1 block text-xl">{nearest.humidity}%</strong></div></div></div>
    <button onClick={locate} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[.99]"><span className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><LocateFixed size={20}/></span><span><strong className="block text-sm text-slate-800">{position ? 'Localização atualizada' : 'Usar minha localização'}</strong><small className="text-slate-500">{position ? `Estação mais próxima: ${nearest.name}${distance !== null ? ` · ${distance.toFixed(1)} km` : ''}` : 'Usada somente para encontrar a estação mais próxima'}</small></span></span><Crosshair size={19} className="text-blue-600" /></button>
    {locationError && <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">{locationError}</p>}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Referência local</p><h3 className="mt-1 flex items-center gap-1.5 font-extrabold text-slate-800"><MapPin className="text-rose-500" size={17}/>{nearest.name}</h3></div><span className={cn('rounded-full px-3 py-1 text-[10px] font-black uppercase', isLive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{isLive ? 'Dados ao vivo' : 'Estimativa local'}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><span className="rounded-xl bg-slate-50 p-2"><Wind className="mx-auto mb-1 text-slate-500" size={16}/>{nearest.windSpeed.toFixed(1)} m/s</span><span className="rounded-xl bg-slate-50 p-2"><Sun className="mx-auto mb-1 text-amber-500" size={16}/>{nearest.solarRadiation.toFixed(0)} W/m²</span><span className="rounded-xl bg-slate-50 p-2"><Droplets className="mx-auto mb-1 text-blue-500" size={16}/>{assessment.hydrationMlPerHour} ml/h</span></div></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Modalidade</p><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{SPORT_METADATA_LIST.map((sport) => <button key={sport.id} onClick={() => onSelectSport(sport.id)} className={cn('shrink-0 rounded-full border px-3 py-2 text-xs font-bold', selectedSport === sport.id ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 text-slate-600')}>{sport.name}</button>)}</div></div>
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><div className="flex gap-3"><AlertTriangle className="shrink-0 text-orange-600" size={20}/><div><h3 className="font-extrabold text-orange-950">{flag.recommendation}</h3><ul className="mt-3 space-y-2 text-sm text-orange-900">{assessment.recommendations.slice(0, 3).map((item) => <li key={item} className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0"/>{item}</li>)}</ul></div></div></div><p className="px-2 text-center text-[11px] leading-relaxed text-slate-500">Ferramenta de apoio à decisão, não substitui avaliação médica. Interrompa o exercício se houver mal-estar, confusão, tontura ou náusea.</p>
  </section>;
}
