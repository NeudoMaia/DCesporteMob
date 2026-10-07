/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Stethoscope,
  Award,
  FileText,
  AlertOctagon,
  HeartPulse,
  CheckCircle,
  ExternalLink,
  Info,
  ThermometerSnowflake,
  LifeBuoy
} from 'lucide-react';
import { WBGT_FLAG_DEFINITIONS } from '../../lib/sportUtils';

export const SportScientificManual: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
            <span>Evidências Clínicas & Normas Internacionais</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Fundamentação Médico-Científica do DCESPORTE
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Consolidado técnico de respaldo médico e científico para tomada de decisão, proteção de atletas, praticantes de atividades físicas na Beira-mar de Fortaleza e academias, baseado nas diretrizes oficiais do ACSM, COI, SBMEE e Fundacentro.
          </p>
        </div>
      </div>

      {/* 4 Pilares Científicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
            ACSM
          </div>
          <h4 className="font-extrabold text-sm text-slate-800">
            American College of Sports Medicine
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Padrão ouro para classificação de risco térmico por <strong>WBGT</strong> e diretrizes de prevenção de golpe de calor por esforço (Armstrong et al., 2007; Sawka et al., 2007).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
            COI
          </div>
          <h4 className="font-extrabold text-sm text-slate-800">
            Comitê Olímpico Internacional
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Protocolos de resfriamento corporal (<em>pre-cooling</em>), aclimatação térmica (10-14 dias) e planos de contingência para esportes de endurance sob calor extremo.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
            SBMEE
          </div>
          <h4 className="font-extrabold text-sm text-slate-800">
            Sociedade Brasileira de Med. do Esporte
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Diretriz Nacional de Hidratação no Esporte: limite de perda hídrica (&lt; 2% de peso), reposição de sódio (0,5 a 0,7 g/L) e prevenção de hiponatremia associada ao exercício (EAH).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
            NHO 06
          </div>
          <h4 className="font-extrabold text-sm text-slate-800">
            Fundacentro / Ministério do Trabalho
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Norma de Higiene Ocupacional para Avaliação da Sobrecarga Térmica Humana: cálculo do IBUTG e taxas metabólicas (M) para esforço leve, moderado, pesado e muito pesado.
          </p>
        </div>
      </div>

      {/* Tabela Comparativa de Bandeiras ACSM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Classificação Oficial das Bandeiras de Risco WBGT (ACSM / COI)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50">
                <th className="p-3">Bandeira</th>
                <th className="p-3">Faixa WBGT</th>
                <th className="p-3">Nível de Risco Clínico</th>
                <th className="p-3">Conduta Obrigatória para Atletas e Assessorias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {Object.values(WBGT_FLAG_DEFINITIONS).map((flag) => (
                <tr key={flag.flag} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-full font-black uppercase text-[10px] ${flag.badgeBg} ${flag.badgeText} border`}>
                      {flag.label}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{flag.rangeText}</td>
                  <td className="p-3 text-slate-700 font-semibold">{flag.name}</td>
                  <td className="p-3 text-slate-600">{flag.sportsGuideline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protocolo de Primeiros Socorros: Exaustão Térmica vs Golpe de Calor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-extrabold text-slate-800">
            Diferenciação Clínica de Emergência e Primeiros Socorros
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exaustão por Calor */}
          <div className="p-5 rounded-xl border border-amber-300 bg-amber-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Exaustão Térmica (Heat Exhaustion)
              </span>
              <span className="text-xs font-bold text-slate-500">Tcore &lt; 40°C</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Quadro clínico decorrente de desidratação e perda hidroeletrolítica severa.
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Sintomas:</strong> Pele fria e úmida, sudorese abundante, tontura, náuseas, dor de cabeça, fraqueza, pressão baixa ao ficar de pé (hipotensão postural).</p>
              <p><strong>Conduta Imediata:</strong></p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Interromper a atividade imediatamente.</li>
                <li>Levar o atleta para a sombra ou ambiente refrigerado.</li>
                <li>Elevar as pernas cerca de 30 cm para favorecer o retorno venoso.</li>
                <li>Oferecer líquidos gelados com eletrólitos se o atleta estiver consciente.</li>
              </ul>
            </div>
          </div>

          {/* Golpe de Calor */}
          <div className="p-5 rounded-xl border-2 border-red-600 bg-red-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white bg-red-600 px-2.5 py-0.5 rounded-full">
                GOLPE DE CALOR POR ESFORÇO (EHS) — EMERGÊNCIA
              </span>
              <span className="text-xs font-bold text-red-700">Tcore &gt; 40,5°C</span>
            </div>
            <p className="text-xs text-red-950 leading-relaxed font-bold">
              Falência do sistema termorregulador. Risco iminente de dano cerebral irreversível ou óbito.
            </p>
            <div className="space-y-1 text-xs text-slate-700">
              <p><strong>Sintomas:</strong> Confusão mental, desorientação, marcha atáxica (tropeços), comportamento irracional, vômitos, convulsão ou desmaio. A pele pode estar seca ou ainda molhada por suor recente.</p>
              <p className="text-red-900 font-extrabold"><strong>Regra de Ouro Médica (ACSM / COI): "COOL FIRST, TRANSPORT SECOND"</strong></p>
              <ul className="list-disc pl-5 space-y-0.5 text-red-950 font-medium">
                <li>Acionar o SAMU (192) imediatamente.</li>
                <li><strong>Resfriar agressivamente antes do transporte:</strong> Imersão em banheira com água e gelo (CWI) ou aplicação contínua de toalhas molhadas em água gelada sobre pescoço, axilas e virilha com ventilação direta.</li>
                <li>Não tentar administrar líquidos orais se houver rebaixamento de consciência.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Referências Bibliográficas Científicas com DOI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Referências Bibliográficas e Normas Regulamentadoras
        </h4>
        <div className="space-y-2 text-xs text-slate-600">
          <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <strong>1. Armstrong LE, et al.</strong> (2007). <em>Exertional Heat Illness during Training and Competition</em>. Medicine & Science in Sports & Exercise (ACSM Position Stand), 39(3):556-572. DOI: 10.1249/MSS.0b013e31802fa199.
          </p>
          <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <strong>2. Sawka MN, et al.</strong> (2007). <em>Exercise and Fluid Replacement</em>. Medicine & Science in Sports & Exercise (ACSM Position Stand), 39(2):377-390. DOI: 10.1249/mss.0b013e31802ca597.
          </p>
          <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <strong>3. Sociedade Brasileira de Medicina do Exercício e do Esporte (SBMEE).</strong> (2009). <em>Modificações dietéticas, reposição hídrica e suplementos no esporte</em>. Revista Brasileira de Medicina do Esporte, 15(3).
          </p>
          <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <strong>4. FUNDACENTRO.</strong> (2017). <em>Norma de Higiene Ocupacional NHO 06: Avaliação da Exposição Ocupacional ao Calor</em>. Ministério do Trabalho e Emprego, Brasília.
          </p>
          <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <strong>5. International Olympic Committee (IOC) Medical Commission.</strong> (2020). <em>Adverse Weather Impact Expert Working Group for the Olympic Games Tokyo 2020: Heat mitigation guidelines for athletes</em>. Br J Sports Med.
          </p>
        </div>
      </div>
    </div>
  );
};
