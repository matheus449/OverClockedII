import { AlertOctagon, Award, Briefcase, Coffee, RotateCcw, Shirt, TrendingDown } from 'lucide-react';
import { PlayerGender } from '../progression/progressionSystem';

interface GameOverBankruptcyModalProps {
  playerName: string;
  gender: PlayerGender;
  finalPoints: number;
  resolvedCount: number;
  unlockedMedalsCount: number;
  purchasedOutfitsCount: number;
  onConfirmFullReset: () => void;
}

export function GameOverBankruptcyModal({
  playerName,
  gender,
  finalPoints,
  resolvedCount,
  unlockedMedalsCount,
  purchasedOutfitsCount,
  onConfirmFullReset,
}: GameOverBankruptcyModalProps) {
  const displayName = playerName.trim() || (gender === 'feminino' ? 'Analista' : 'Analista');
  const pronounDesejo =
    gender === 'feminino'
      ? 'desejamos muita sorte no seu próximo emprego, Analista!'
      : 'desejamos muita sorte no seu próximo emprego, Analista!';

  const extraClothesLost = Math.max(0, purchasedOutfitsCount - 1);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Game Over — A Empresa Faliu"
      data-testid="bankruptcy-gameover-modal"
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md pointer-events-auto overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#0b1120] border-2 border-rose-500/80 shadow-[0_0_60px_rgba(244,63,94,0.25)] overflow-hidden my-auto">
        {/* Top Corporate Liquidation Banner */}
        <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-b border-rose-500/30 px-5 py-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
            <AlertOctagon className="w-7 h-7 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                Game Over · Falência Decretada
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Comunicado Oficial da Diretoria
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              A Empresa Faliu! Fim de Expediente.
            </h2>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4">
          {/* Official Dismissal & Bankruptcy Letter */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Olá, <strong className="text-white">{displayName}</strong>. Seus créditos ficaram no vermelho (
              <strong className="text-rose-400 font-mono-tabular">{finalPoints} pts</strong>), sua energia se esgotou completamente (
              <strong className="text-rose-400">0%</strong>) e não restou saldo nem para um cafezinho na{' '}
              <span className="text-amber-300 font-semibold">OverCoffee</span>.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Com os servidores parados e as contas acumuladas, a{' '}
              <strong className="text-white">Overclocked Solutions decretou falência</strong> e precisou fechar as portas. A diretoria e a Dona Helena agradecem pelos serviços prestados e{' '}
              <strong className="text-emerald-300">{pronounDesejo}</strong>
            </p>
          </div>

          {/* Career Liquidation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#090d16] border border-rose-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                Saldo Final
              </span>
              <span className="text-base font-black font-mono-tabular text-rose-400 mt-1">
                {finalPoints} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                Chamados
              </span>
              <span className="text-base font-black font-mono-tabular text-white mt-1">
                {resolvedCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5 text-amber-400" />
                Roupas Resetadas
              </span>
              <span className="text-base font-black font-mono-tabular text-amber-300 mt-1">
                {extraClothesLost} {extraClothesLost === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Medalhas
              </span>
              <span className="text-base font-black font-mono-tabular text-purple-300 mt-1">
                {unlockedMedalsCount}
              </span>
            </div>
          </div>

          {/* Notice about full reset including clothes */}
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-[11px] text-amber-200">
            <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Reset Geral:</strong> Todas as compras de roupas, acessórios, medalhas e dívidas foram zeradas. Você iniciará seu novo emprego com{' '}
              <strong>100% de energia</strong>, <strong>0 pontos</strong> e o uniforme padrão de TI.
            </span>
          </div>

          {/* Primary Reset Action Button */}
          <div className="pt-1 flex items-center justify-end">
            <button
              type="button"
              data-testid="bankruptcy-reset-btn"
              onClick={onConfirmFullReset}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              Reset Geral · Iniciar no Próximo Emprego (100% Energia e 0 Pts)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
