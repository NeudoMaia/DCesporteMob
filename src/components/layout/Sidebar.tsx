/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Map as MapIcon,
  ShieldCheck,
  Radio,
  BarChart3,
  Heart,
  Droplets,
  BookOpen,
  Flame,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TabType } from '../../types';
import { DefesaCivilLogo } from '../auth/Login';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const dcpetUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/dcpet/'
    : 'http://172.31.3.60/dcpet/';

  const dccalorUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/dccalor/'
    : 'http://172.31.3.60/dccalor/';

  const items = [
    { id: 'athlete', label: 'Meu treino agora', icon: Activity, category: 'Dashboard' },
    { id: 'map', label: 'Monitoramento Esportivo', icon: MapIcon, category: 'Dashboard' },
    { id: 'calculator', label: 'Calculadora de Hidratação', icon: Droplets, category: 'Dashboard' },
    { id: 'protocols', label: 'Diretrizes Médicas Esportivas', icon: ShieldCheck, category: 'Dashboard' },
    { id: 'science', label: 'Respaldo Científico & Normas', icon: BookOpen, category: 'Dashboard' },
    { id: 'dccalor', label: 'DCCALOR - Clima Urbano', icon: Flame, category: 'Sistemas Integrados', url: dccalorUrl },
    { id: 'dcpet', label: 'DCPET - Saúde Animal', icon: Heart, category: 'Sistemas Integrados', url: dcpetUrl },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-full shrink-0">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {['Dashboard', 'Sistemas Integrados'].map((cat) => (
            <div key={cat} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-4 mb-2 uppercase tracking-widest leading-none">
                {cat}
              </div>
              <div className="space-y-1">
                {items
                  .filter((i) => i.category === cat)
                  .map((item) => {
                    const isExternal = !!item.url;
                    const content = (
                      <>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          activeTab === item.id ? "bg-blue-700 scale-100" : "bg-slate-300 scale-75 group-hover:bg-slate-400"
                        )} />
                        <span className={cn(
                          "text-sm tracking-tight",
                          activeTab === item.id ? "font-bold uppercase" : "font-medium"
                        )}>
                          {item.label}
                        </span>
                      </>
                    );

                    const commonClasses = cn(
                      "w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    );

                    if (isExternal) {
                      return (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={commonClasses}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className={commonClasses}
                      >
                        {content}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Logo da Defesa Civil de Fortaleza */}
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-2 shrink-0">
            <div className="w-24 h-24 flex items-center justify-center shrink-0">
              <DefesaCivilLogo className="w-full h-full drop-shadow-sm transform hover:scale-105 transition-all duration-300" />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
              Defesa Civil<br />Fortaleza
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xl shadow-slate-900/10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Status da Malha</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">ONLINE</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">v4.0</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 text-[9px] text-slate-500 font-medium space-y-1">
            <p>IDT (Thom) + ICU + IDW</p>
            <p>Modelo Holt ativo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
