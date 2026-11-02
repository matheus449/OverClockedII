import React, { useState } from 'react';
import {
  Coffee,
  Zap,
  Award,
  MessageCircle,
  X,
  Sparkles,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ALL_COFFEES,
  CAFETERIA_NPCS,
  CoffeeItem,
  CafeteriaNpc,
  getCoffeeDynamicPrice,
} from '../cafeteria/cafeteriaSystem';
import { DifficultyLevel } from '../problems/validator';
import { soundEngine } from '../audio/soundEngine';
import { voiceNarrator } from '../audio/voiceNarrator';

interface CafeteriaModalProps {
  energy: number;
  points: number;
  difficulty: DifficultyLevel;
  resolvedCount: number;
  voiceEnabled: boolean;
  onDrinkCoffee: (coffee: CoffeeItem) => { ok: boolean; reason?: string };
  onTalkToNpcInRoom?: (npc: CafeteriaNpc) => void;
  onClose: () => void;
}

export const CafeteriaModal: React.FC<CafeteriaModalProps> = ({
  energy,
  points,
  difficulty,
  resolvedCount,
  voiceEnabled,
  onDrinkCoffee,
  onTalkToNpcInRoom,
  onClose,
}) => {
  const barista = CAFETERIA_NPCS[0];
  const [baristaLine, setBaristaLine] = useState<string>(barista.falasAleatorias[0]);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const handleOrderCoffee = (coffee: CoffeeItem) => {
    const res = onDrinkCoffee(coffee);
    if (res.ok) {
      soundEngine.playSuccess();
      setToastMsg({
        text: `Você tomou ${coffee.nome}! (+${coffee.energiaRecuperada}% de Energia)`,
        type: 'success',
      });
      const msg = `Saindo um ${coffee.nome} quentinho no capricho! Bom trabalho hoje!`;
      setBaristaLine(msg);
      if (voiceEnabled) {
        voiceNarrator.speakProblem(msg, {
          npcId: barista.id,
          npcName: barista.nome,
        });
      }
    } else {
      soundEngine.playError();
      setToastMsg({
        text: res.reason || 'Não foi possível pedir este café.',
        type: 'error',
      });
    }
    setTimeout(() => setToastMsg(null), 4000);
  };

  const energyColor =
    energy >= 60
      ? 'from-emerald-400 to-teal-500'
      : energy >= 30
      ? 'from-amber-400 to-orange-500'
      : 'from-rose-500 to-red-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Balcão da Cafeteria OverCoffee
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                  Nível: {difficulty === 'dificil' ? 'Difícil (Preços Alta Demanda)' : difficulty === 'normal' ? 'Normal' : 'Fácil'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Repor energia no balcão com o Barista Léo · Os preços acompanham seu ganho de pontos e dificuldade.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Voltar ao Espaço da Cafeteria (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar: Energia + Pontos */}
        <div className="px-6 py-3.5 bg-slate-950/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <Zap
                className={`w-5 h-5 ${
                  energy >= 60
                    ? 'text-emerald-400'
                    : energy >= 30
                    ? 'text-amber-400'
                    : 'text-rose-400 animate-pulse'
                }`}
              />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sua Energia Atual
                </div>
                <div className="text-sm font-black text-white">{energy}%</div>
              </div>
            </div>

            <div className="flex-1 max-w-xs h-3.5 bg-slate-800 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${energyColor} transition-all duration-500`}
                style={{ width: `${Math.max(4, Math.min(100, energy))}%` }}
              />
            </div>

            {energy < 35 && (
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                Energia baixa! Tome um café para continuar atendendo bem.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">Seus Pontos:</span>
            <span
              className={`text-sm font-black ${
                points < 0 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {points} pts
            </span>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMsg && (
          <div
            className={`mx-6 mt-4 px-4 py-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cardápio Dinâmico de Cafés (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Cardápio de Cafés & Energia
              </h3>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Preços ajustados aos seus pontos ({points} pts) e nível ({difficulty})
              </span>
            </div>

            <div className="space-y-2.5">
              {ALL_COFFEES.map((coffee) => {
                const dynamicCost = getCoffeeDynamicPrice(
                  coffee,
                  difficulty,
                  points,
                  resolvedCount
                );
                const isFull = energy >= 100;
                const canAfford = points >= dynamicCost;
                return (
                  <div
                    key={coffee.id}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800/90 border border-white/10 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/15 shadow-md"
                        style={{ backgroundColor: coffee.corLiquido }}
                      >
                        <Coffee className="w-5 h-5 text-white drop-shadow" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">
                            {coffee.nome}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            +{coffee.energiaRecuperada}% Energia
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono-tabular bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {dynamicCost} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {coffee.descricao}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOrderCoffee(coffee)}
                      disabled={isFull || !canAfford}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                        isFull
                          ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                          : !canAfford
                          ? 'bg-rose-950/40 text-rose-300/60 border border-rose-500/20 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      }`}
                    >
                      {isFull
                        ? 'Energia Cheia'
                        : !canAfford
                        ? `Faltam ${dynamicCost - points} pts`
                        : 'Tomar Café'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Barista Léo & In-Room Colleagues Guide (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                Atendimento no Balcão
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-white">{barista.nome}</span>
                  <span className="text-[11px] text-sky-400">· {barista.cargo}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  &ldquo;{baristaLine}&rdquo;
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10 space-y-2.5">
                <span className="text-xs font-bold text-amber-300 block">
                  Pessoal nas Mesas da Cafeteria (3D)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Caminhe até os colegas nas mesas dentro da sala da cafeteria e pressione{' '}
                  <strong className="text-white">[E]</strong> (ou clique abaixo) para conversar diretamente com eles no mapa!
                </p>

                <div className="space-y-1.5 pt-1">
                  {CAFETERIA_NPCS.map((npc) => (
                    <button
                      key={npc.id}
                      type="button"
                      onClick={() => {
                        if (onTalkToNpcInRoom) {
                          onClose();
                          onTalkToNpcInRoom(npc);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 flex items-center justify-between gap-2 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: npc.corCamisa }}
                        >
                          {npc.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {npc.nome}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {npc.cargo}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-bold shrink-0">
                        Ir Conversar
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            No Modo Difícil os cafés têm custo elevado de alta demanda. Caminhe até os colegas na sala para bater papo!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Voltar à Sala da Cafeteria
          </button>
        </div>
      </div>
    </div>
  );
};
