import React, { useState } from 'react';
import { Moon, Sun, UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoginProps {
  initialName: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogin: (name: string) => void;
}

// Componente SVG da Defesa Civil de Fortaleza com correção de escala
export const DefesaCivilLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Caixa azul externa com cantos arredondados */}
      <rect width="500" height="500" rx="40" fill="#003594" />

      {/* Texto superior: DEFESA CIVIL */}
      <text
        x="250"
        y="75"
        fill="white"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="52"
        textAnchor="middle"
        letterSpacing="1"
      >
        DEFESA CIVIL
      </text>

      {/* Retângulo branco interno */}
      <rect x="15" y="110" width="470" height="280" fill="white" />

      {/* Texto inferior: FORTALEZA */}
      <text
        x="250"
        y="455"
        fill="white"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="52"
        textAnchor="middle"
        letterSpacing="1"
      >
        FORTALEZA
      </text>

      {/* Elementos internos do retângulo branco */}
      {/* Triângulo azul central */}
      <polygon points="250,185 185,285 315,285" fill="#003594" />

      {/* Mão laranja superior direita */}
      <polygon
        points="
          475,120
          330,150
          190,150
          150,240
          175,240
          205,185
          310,185
          385,200
          475,200
        "
        fill="#f47a00"
      />

      {/* Mão laranja inferior esquerda */}
      <polygon
        points="
          475,120
          330,150
          190,150
          150,240
          175,240
          205,185
          310,185
          385,200
          475,200
        "
        fill="#f47a00"
        transform="rotate(180, 250, 250)"
      />
    </svg>
  );
};

export const Login: React.FC<LoginProps> = ({ initialName, theme, onToggleTheme, onLogin }) => {
  const [name, setName] = useState(initialName);

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-slate-50 p-4 text-slate-900 selection:bg-blue-500/30">
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
      </button>

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-orange-500 to-red-600" />

        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="mb-4 flex h-36 w-36 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-inner transition-transform duration-300 hover:scale-105">
              <DefesaCivilLogo className="w-full h-full" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center justify-center gap-1">
              <span className="text-blue-500">DC</span><span>ESPORTE</span>
            </h1>
            <h2 className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              Monitoramento Térmico & Medicina Esportiva • Fortaleza
            </h2>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Fisiologia do Exercício, diretrizes esportivas e proteção de atletas em campos, arenas e na Orla.
            </p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); onLogin(name); }}>
            <label htmlFor="dcesporte-user-name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Usuário
            </label>
            <div className={cn(
              'flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20',
              name.trim() ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-300'
            )}>
              <UserRound size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              <input
                id="dcesporte-user-name"
                autoComplete="name"
                autoFocus
                maxLength={60}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Digite seu nome"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Acessar o portal
            </button>
          </form>
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
            Seu nome e sua preferência de tema ficam salvos somente neste navegador. Este portal não solicita senha nem autentica contas.
          </p>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>Acesso público</span>
          <span>v5.0.0</span>
        </footer>
      </div>
    </main>
  );
};
