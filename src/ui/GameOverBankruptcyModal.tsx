import { AlertOctagon, Award, Briefcase, RotateCcw, Shirt, Sparkles, TrendingDown } from 'lucide-react';
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
  const displayName = playerName.trim() || 'Analista';
  const pronounText =
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
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 lg-modal-backdrop pointer-events-auto overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-2xl lg-modal-floating border-rose-400/50 shadow-[0_0_50px_rgba(244,63,94,0.18)] overflow-hidden my-auto">
        {/* Top Corporate Liquidation Banner */}
        <div className="lg-modal-header border-b border-rose-400/25 px-5 py-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
            <AlertOctagon className="w-7 h-7 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                Game Over · Falência Decretada
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Jogo Reiniciado do Zero
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              A Empresa Faliu! Fim de Carreira.
            </h2>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4">
          {/* Official Dismissal & Bankruptcy Letter */}
          <div className="rounded-xl lg-inner-well p-4 space-y-2.5">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Olá, <strong className="text-white">{displayName}</strong>. Você ficou devendo créditos (
              <strong className="text-rose-400 font-mono-tabular">{finalPoints} pts</strong>), sua energia acabou (
              <strong className="text-rose-400">0%</strong>) e não restaram pontos nem para comprar café na{' '}
              <span className="text-amber-300 font-semibold">OverCoffee</span>.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sem energia para trabalhar e com as contas no vermelho, a{' '}
              <strong className="text-white">Overclocked Solutions faliu</strong> e fechou as portas. Agradecemos pelos seus serviços e{' '}
              <strong className="text-emerald-300">{pronounText}</strong>
            </p>
          </div>

          {/* Career Liquidation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl lg-inner-well border-rose-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                Dívida Final
              </span>
              <span className="text-base font-black font-mono-tabular text-rose-400 mt-1">
                {finalPoints} pts
              </span>
            </div>

            <div className="p-3 rounded-xl lg-inner-well flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                Chamados
              </span>
              <span className="text-base font-black font-mono-tabular text-white mt-1">
                {resolvedCount}
              </span>
            </div>

            <div className="p-3 rounded-xl lg-inner-well flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5 text-amber-400" />
                Roupas Resetadas
              </span>
              <span className="text-base font-black font-mono-tabular text-amber-300 mt-1">
                {extraClothesLost} {extraClothesLost === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="p-3 rounded-xl lg-inner-well flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Medalhas
              </span>
              <span className="text-base font-black font-mono-tabular text-purple-300 mt-1">
                {unlockedMedalsCount}
              </span>
            </div>
          </div>

          {/* Notice about full reset from 0 including presentation and clothes */}
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-[11px] text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Reset Geral Concluído:</strong> Todos os pontos, medalhas e compras de roupas/acessórios foram resetados. Clique abaixo para tentar novamente desde o zero, com a tela inicial e a apresentação da Dona Helena!
            </span>
          </div>

          {/* Primary Retry from Scratch Action Button */}
          <div className="pt-1 flex items-center justify-end">
            <button
              type="button"
              data-testid="bankruptcy-reset-btn"
              onClick={onConfirmFullReset}
              className="w-full py-3.5 px-5 rounded-xl lg-btn-emerald font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              Tentar Novamente · Recomeçar Jogo do Zero (Desde a Apresentação)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
