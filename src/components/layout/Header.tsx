/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { DefesaCivilLogo } from '../auth/Login';

interface HeaderProps {
  title: string;
  isLive?: boolean;
  userName: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSwitchUser: () => void;
}

export function Header({ title, isLive, userName, theme, onToggleTheme, onSwitchUser }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const initials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="z-10 flex min-h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm sm:h-10 sm:w-10">
          <DefesaCivilLogo className="h-full w-full rounded-lg" />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-black leading-tight sm:text-lg">
            <span className="shrink-0 text-blue-700">DC ESPORTE</span>
            <span className="hidden font-normal text-slate-300 sm:inline">|</span>
            <span className="hidden truncate font-bold text-indigo-600 sm:inline">{title}</span>
          </div>
          <h1 className="truncate text-sm font-bold leading-tight text-slate-800 sm:hidden">{title}</h1>
          <p className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
            Monitoramento Térmico Esportivo • WBGT (ACSM/COI) • Beira-Mar & Academias
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 md:hidden">
          <span className={`flex h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-[9px] font-bold uppercase text-slate-600">
            {isLive ? 'Ao vivo' : 'Estimado'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full animate-pulse ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
            {isLive ? 'Tempo Real (Plugfield)' : 'Dados estimados'}
          </span>
        </div>
        <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
        <div className="flex gap-3">
          <button className="hidden sm:block px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-black rounded border border-slate-200 uppercase tracking-widest hover:bg-slate-200 transition-colors">
            Exportar Dados
          </button>
          <div className="flex items-center gap-1.5 sm:ml-2 sm:gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <div className="text-right hidden sm:block">
              <p className="max-w-32 truncate text-[10px] text-slate-500 uppercase font-black tracking-tighter">{userName}</p>
              <p className="text-xs font-bold text-slate-800">{time.toLocaleTimeString('pt-BR')}</p>
            </div>
            <button
              type="button"
              onClick={onSwitchUser}
              aria-label="Trocar nome de usuário neste navegador"
              title="Trocar nome de usuário"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-xs font-bold text-white transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <span className="sm:hidden">{initials}</span>
              <LogOut size={16} className="hidden sm:block" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
