/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen, Calculator, Database, PenTool, GitBranch, TrendingUp,
  ChevronDown, ChevronUp, Stethoscope, HeartPulse, Activity, ShieldCheck,
  FileText, Minimize2, Award, Waves, Dumbbell, Droplets, AlertTriangle, LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { WBGT_FLAG_DEFINITIONS } from '../../lib/sportUtils';

interface TechnicalManualProps {
  defaultExpanded?: boolean;
}

export const TechnicalManual: React.FC<TechnicalManualProps> = ({ defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner & Collapse Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-slate-800 tracking-tight">
                Documentação Técnica: DCESPORTE v5.0
              </h2>
              <p className="text-slate-500 font-medium text-xs lg:text-sm">
                Fisiologia do Exercício, Termorregulação no Calor Extremo e Diretrizes Médicas Esportivas
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer border border-slate-700 group"
          >
            <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>{isExpanded ? "Retrair Manual Técnico" : "Manual Técnico & Científico"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Resumo compacto quando retraído */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-1">Índice Padrão Ouro (WBGT)</span>
              <p className="text-xs text-slate-700 font-medium">Modelagem física de Bulbo Úmido e Termômetro de Globo (Stull/Liljegren) adotada por ACSM, COI e FIFA.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-100">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block mb-1">Foco na Estação Crítica</span>
              <p className="text-xs text-slate-700 font-medium">Identificação em tempo real da estação com maior sobrecarga térmica para emissão de prescrições médicas esportivas.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">Diretrizes Clínicas SBMEE</span>
                <p className="text-xs text-slate-700 font-medium">Prescrição de hidratação, reposição eletrolítica de sódio e prevenção do Golpe de Calor por Esforço (EHS).</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Conteúdo Completo (Expandido) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Seção 1: Escopo do DCESPORTE */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> 1. Escopo Científico e Propósito
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                    O <strong>DCESPORTE</strong> é a plataforma oficial de medicina esportiva e vigilância microclimática voltada à segurança de atletas, assessorias de corrida, praticantes de atividades físicas na orla da Beira-Mar, praias, parques e academias de Fortaleza.
                    O sistema processa telemétrica e continuamente os dados das estações meteorológicas automáticas, identificando microclimas de risco e emitindo recomendações baseadas nos consensos internacionais do <strong>ACSM</strong> (*American College of Sports Medicine*), <strong>COI</strong> (*Comitê Olímpico Internacional*) e <strong>SBMEE</strong> (*Sociedade Brasileira de Medicina do Exercício e do Esporte*).
                  </p>
                </div>

                {/* Seção 2: Fisiologia da Termorregulação no Esporte */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" /> 2. Fisiologia da Termorregulação sob Esforço
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                    Durante o exercício, os músculos em contração produzem uma enorme quantidade de calor metabólico (M). Em Fortaleza, com temperaturas do ar próximas à temperatura cutânea (~34°C a 35°C), <strong>a evaporação do suor torna-se o único mecanismo fisiológico capaz de dissipar calor</strong>. Contudo, quando a umidade relativa (UR) é elevada (&gt; 65%), o ar fica saturado, impedindo a evaporação do suor, que escorre sem resfriar o atleta, provocando rápido acúmulo de calor interno (Tcore &gt; 39°C).
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                    Balanço Térmico: S = M - W ± R ± C ± K - E<br/>
                    (S = acúmulo de calor; M = taxa metabólica; E = resfriamento evaporativo)
                  </div>
                </div>

                {/* Seção 3: Dicionário de Variáveis Esportivas */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" /> 3. Dicionário de Variáveis Telemétricas e Fisiológicas
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-medium">
                    <li><strong>$T_d$ (Temperatura de Bulbo Seco)</strong>: Temperatura real do ar medido pelos termohigrômetros das estações.</li>
                    <li><strong>$T_w$ (Temperatura de Bulbo Úmido Natural)</strong>: Calculada pelo modelo psicrométrico de Stull (2011), representa a capacidade de evaporação do suor na atmosfera.</li>
                    <li><strong>$T_g$ (Temperatura de Globo Negro)</strong>: Integra a temperatura do ar, o vento e a carga solar radiante incidente ($W/m^2$).</li>
                    <li><strong>WBGT (Wet-Bulb Globe Temperature)</strong>: Índice composto internacional para medicina esportiva. Outdoor: $0.7 \times T_w + 0.2 \times T_g + 0.1 \times T_d$.</li>
                    <li><strong>Taxa de Sudorese ($ml/h$)</strong>: Volume de líquido perdido por hora de esforço, calibrado pelo peso corporal ($kg$), intensidade ($METs$) e estresse térmico ($WBGT$).</li>
                  </ul>
                </div>

                {/* Seção 4: Cenários Específicos de Fortaleza */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <Waves className="w-4 h-4" /> 4. Microclimas Esportivos: Orla vs. Academias
                  </h3>
                  <div className="bg-slate-50 p-3.5 rounded-lg text-xs text-slate-700 space-y-2 font-medium">
                    <p><strong>• Calçadão da Beira-Mar & Asfalto:</strong> O pavimento asfáltico e o piso de concreto absorvem radiação de ondas curtas e reemitem calor por ondas longas (infravermelho), elevando o microclima do corredor em até 3°C a 5°C acima da temperatura do ar livre.</p>
                    <p><strong>• Remo & Náuticos (Enseada do Mucuripe):</strong> A lâmina d'água reflete radiação solar (+20%), e a brisa marinha fresca mascara a percepção de sede, induzindo desidratação silenciosa.</p>
                    <p><strong>• Beach Tennis & Arenas de Areia:</strong> A temperatura superficial da areia pode ultrapassar 50°C, gerando sobrecarga condutiva nos membros inferiores.</p>
                    <p><strong>• Boxes de Crossfit & Galpões:</strong> A respiração e transpiração conjunta de dezenas de atletas eleva a umidade interna, saturando o ambiente.</p>
                  </div>
                </div>

              </div>

              {/* SEÇÃO ESPECIAL 5: COMO A ANÁLISE MÉDICA AVALIA A ESTAÇÃO MAIS QUENTE */}
              <div className="pt-6 border-t border-slate-200 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-md">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      5. Motor de Inferência Médica Esportiva: Análise da Estação de Maior Temperatura
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      Algoritmo clínico para determinação de condutas esportivas preventivas e emergenciais
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Passo A */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">Passo A • Identificação da Estação Crítica</span>
                    <h4 className="text-xs font-bold text-slate-900">Ponto Focal de Sobrecarga Térmica</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      O sistema analisa todas as estações telemétricas da cidade e isola a estação que registra a maior temperatura real e sensação térmica no instante da leitura. O microclima dessa estação passa a nortear o nível de atenção epidemiológica e esportiva para assessorias de treino, clubes e escolas de esporte.
                    </p>
                  </div>

                  {/* Passo B */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Passo B • Cãibras Térmicas & Síncope do Calor</span>
                    <h4 className="text-xs font-bold text-slate-900">Perda Hidroeletrolítica e Estase Venosa</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Nas faixas de Bandeira Amarela e Laranja (WBGT 18,0°C a 27,9°C), a perda de sódio pelo suor profuso precipita espasmos musculares involuntários dolorosos (cãibras térmicas). A interrupção abrupta da corrida provoca acúmulo de sangue periférico nas pernas vasodilatadas (estase venosa), gerando hipotensão ortostática e desmaio pós-exercício (síncope do calor).
                    </p>
                  </div>

                  {/* Passo C */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block">Passo C • Exaustão Térmica por Esforço</span>
                    <h4 className="text-xs font-bold text-slate-900">Incapacidade Cardiovascular sob Calor Extremo</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Sob Bandeira Vermelha (WBGT 28,0°C a 30,0°C), a desidratação combinada com a vasodilatação maciça compromete o débito cardíaco. O atleta apresenta pele pálida/fria, taquicardia intensa, náuseas, tontura e incapacidade motora de manter o ritmo de treino.                       A temperatura corporal central (<i>T<sub>core</sub></i>) permanece abaixo de 40°C e a função neurológica preservada.
                    </p>
                  </div>

                  {/* Passo D */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">Passo D • Golpe de Calor por Esforço (EHS) — EMERGÊNCIA</span>
                    <h4 className="text-xs font-bold text-slate-900">Falência Termorreguladora e Hipertermia Crítica</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Sob Bandeira Preta (WBGT &gt; 30,1°C), o estresse atinge níveis potencialmente fatais. O centro termorregulador entra em colapso, a <i>T<sub>core</sub></i> ultrapassa 40,5°C e o atleta manifesta confusão mental, marcha desordenada, vômitos ou convulsão. Aplica-se a regra de ouro internacional do ACSM e COI: <strong>"Cool First, Transport Second"</strong> (imersão imediata em água gelada antes da remoção hospitalar).
                    </p>
                  </div>

                </div>

                {/* Caixa de Protocolos Esportivos Mandatórios */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-blue-900">Diretrizes Obrigatórias para Assessorias de Corrida e Eventos Esportivos</h4>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Em dias com a estação mais quente em Bandeira Laranja ou Vermelha, eventos e treinos de corrida na Beira-Mar devem obrigatoriamente: (1) Adiantar largadas para horários antes das 06h00; (2) Reduzir distâncias de tiro ou fracionar o volume de treino; (3) Posicionar postos de hidratação com isotônicos a cada 1,5 km a 2 km; (4) Disponibilizar banheiras de imersão rápida ou toalhas frias para resfriamento de emergência na chegada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção 6: Literatura e Consensos Oficiais */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-indigo-700" />
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-widest">
                    6. Literatura Científica e Diretrizes Normativas de Respaldo
                  </h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <strong>1. ACSM (American College of Sports Medicine):</strong> <em>Exertional Heat Illness during Training and Competition</em>. Medicine & Science in Sports & Exercise, 2007.
                  </p>
                  <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <strong>2. COI / IOC Medical Commission:</strong> <em>Consensus statement on recommendations and regulations for sports events in the heat</em>. British Journal of Sports Medicine, 2020-2023.
                  </p>
                  <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <strong>3. SBMEE (Sociedade Brasileira de Medicina do Exercício e do Esporte):</strong> <em>Diretriz de Modificações Dietéticas, Reposição Hídrica e Suplementos no Esporte</em>. Rev Bras Med Esporte, 2009.
                  </p>
                  <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <strong>4. NATA (National Athletic Trainers' Association):</strong> <em>Prehospital Care of Exertional Heat Stroke</em>. Journal of Athletic Training.
                  </p>
                </div>
              </div>

              {/* Botão para retrair */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Retrair Manual Técnico</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
