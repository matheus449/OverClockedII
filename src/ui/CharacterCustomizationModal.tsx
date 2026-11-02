import React, { useState } from 'react';
import {
  AccessoryCategory,
  AccessoryItem,
  ALL_ACCESSORIES,
  ALL_MEDALS,
  ALL_OUTFITS,
  DEFAULT_PURCHASED_ACCESSORIES,
  DEFAULT_PURCHASED_OUTFITS,
  getDynamicAccessoryPrice,
  getDynamicOutfitPrice,
  HAIR_COLORS,
  isGameCompleted,
  OutfitItem,
  PlayerCustomization,
  SKIN_TONES,
} from '../progression/progressionSystem';
import { DifficultyLevel } from '../problems/validator';
import {
  Award,
  Check,
  Cpu,
  Crown,
  Flame,
  Laptop,
  Lock,
  Shirt,
  ShoppingBag,
  Sparkles,
  Unlock,
  User,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

interface CharacterCustomizationModalProps {
  playerName: string;
  customization: PlayerCustomization;
  points: number;
  resolvedCount: number;
  difficulty?: DifficultyLevel;
  unlockedMedals: string[];
  purchasedOutfitIds?: string[];
  purchasedAccessoryIds?: string[];
  onChangeCustomization: (next: PlayerCustomization) => void;
  onPurchaseOutfit?: (outfit: OutfitItem) => { ok: boolean; message: string };
  onPurchaseAccessory?: (accessory: AccessoryItem) => { ok: boolean; message: string };
  onClose: () => void;
}

export const CharacterCustomizationModal: React.FC<CharacterCustomizationModalProps> = ({
  playerName,
  customization,
  points,
  resolvedCount,
  difficulty = 'normal',
  unlockedMedals,
  purchasedOutfitIds = DEFAULT_PURCHASED_OUTFITS,
  purchasedAccessoryIds = DEFAULT_PURCHASED_ACCESSORIES,
  onChangeCustomization,
  onPurchaseOutfit,
  onPurchaseAccessory,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'personagem' | 'roupas' | 'acessorios' | 'medalhas'>(
    'roupas'
  );
  const [accFilter, setAccFilter] = useState<'todos' | AccessoryCategory>('todos');
  const [purchaseToast, setPurchaseToast] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const triggerToast = (text: string, isError: boolean) => {
    setPurchaseToast({ text, isError });
    window.setTimeout(() => {
      setPurchaseToast((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  };

  const gameBeaten = isGameCompleted(points, resolvedCount, unlockedMedals);
  const selectedOutfit =
    ALL_OUTFITS.find((o) => o.id === customization.roupaId) || ALL_OUTFITS[0];
  const selectedAccessory =
    ALL_ACCESSORIES.find((a) => a.id === customization.acessorioId) || ALL_ACCESSORIES[0];

  const filteredAccessories =
    accFilter === 'todos'
      ? ALL_ACCESSORIES
      : ALL_ACCESSORIES.filter((a) => a.categoria === accFilter);

  const renderMedalIcon = (iconName: string, color: string) => {
    const props = { className: 'w-5 h-5', style: { color } };
    switch (iconName) {
      case 'cpu':
        return <Cpu {...props} />;
      case 'laptop':
        return <Laptop {...props} />;
      case 'wifi':
        return <Wifi {...props} />;
      case 'sparkles':
        return <Sparkles {...props} />;
      case 'zap':
        return <Zap {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'crown':
        return <Crown {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Personalização do Analista, Roupas, Acessórios e Medalhas"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto"
    >
      <div className="w-full max-w-4xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#090d16] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Guarda-Roupa & Carreira · {playerName.trim() || 'Analista'}
              </h2>
              <p className="text-xs text-slate-400">
                16 Roupas, 21 Acessórios (Óculos, Fones, Bonés, Chapéus) e 8 Medalhas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
                points < 0
                  ? 'bg-rose-500/15 border-rose-500/40'
                  : 'bg-amber-500/15 border-amber-500/30'
              }`}
            >
              <Award
                className={`w-4 h-4 ${points < 0 ? 'text-rose-400' : 'text-amber-400'}`}
              />
              <div className="text-right">
                <span
                  className={`text-[10px] uppercase tracking-wider block leading-none ${
                    points < 0 ? 'text-rose-300' : 'text-amber-300/80'
                  }`}
                >
                  {points < 0 ? 'Devendo Pontos' : 'Saldo de Pontos'}
                </span>
                <span
                  className={`text-sm font-bold font-mono-tabular ${
                    points < 0 ? 'text-rose-400' : 'text-amber-300'
                  }`}
                >
                  {points} pts
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Fechar Personalização"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Character Live Avatar Preview & Campaign Completion Status */}
          <div className="md:col-span-4 p-5 bg-[#0b111e] flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 flex flex-col items-center text-center">
                <svg viewBox="0 0 140 160" className="w-36 h-40">
                  <circle cx="70" cy="80" r="60" fill="#0f172a" />
                  {customization.acessorioId === 'mochila_dev' && (
                    <rect
                      x="38"
                      y="82"
                      width="64"
                      height="52"
                      rx="10"
                      fill="#1e293b"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  )}
                  {customization.genero === 'feminino' && (
                    <path
                      d="M44 52 C40 85 42 110 48 118 L92 118 C98 110 100 85 96 52 Z"
                      fill={customization.corCabelo}
                    />
                  )}
                  <path
                    d={
                      customization.genero === 'feminino'
                        ? 'M38 148 C40 102 100 102 102 148 Z'
                        : 'M32 148 C34 98 106 98 108 148 Z'
                    }
                    fill={selectedOutfit.corCamisa}
                  />
                  <path d="M58 104 L70 128 L82 104 Z" fill={selectedOutfit.corSecundaria} />
                  <rect x="62" y="82" width="16" height="22" rx="6" fill={customization.tomPele} />
                  <circle cx="70" cy="64" r="24" fill={customization.tomPele} />
                  {customization.genero === 'feminino' ? (
                    <path
                      d="M44 62 C44 34 96 34 96 62 C90 48 50 48 44 62 Z"
                      fill={customization.corCabelo}
                    />
                  ) : (
                    <path
                      d="M45 58 C45 34 95 34 95 58 C95 46 45 46 45 58 Z"
                      fill={customization.corCabelo}
                    />
                  )}
                  <circle cx="61" cy="64" r="2.8" fill="#0f172a" />
                  <circle cx="79" cy="64" r="2.8" fill="#0f172a" />
                  {customization.genero === 'feminino' ? (
                    <path
                      d="M65 75 Q70 79 75 75"
                      stroke="#e11d48"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M65 75 Q70 78 75 75"
                      stroke="#0f172a"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Dynamic Accessory Preview */}
                  {selectedAccessory.categoria === 'oculos' && (
                    <g
                      stroke={selectedAccessory.corPrincipal}
                      strokeWidth="2.4"
                      fill="rgba(15,23,42,0.55)"
                    >
                      <rect x="51" y="58" width="16" height="11" rx="2" />
                      <rect x="73" y="58" width="16" height="11" rx="2" />
                      <line x1="67" y1="63" x2="73" y2="63" />
                    </g>
                  )}
                  {selectedAccessory.categoria === 'fones' && (
                    <g>
                      <path
                        d="M44 64 A26 26 0 0 1 96 64"
                        fill="none"
                        stroke={selectedAccessory.corPrincipal}
                        strokeWidth="4.5"
                      />
                      <rect
                        x="39"
                        y="55"
                        width="8"
                        height="18"
                        rx="3.5"
                        fill={selectedAccessory.corPrincipal}
                      />
                      <rect
                        x="93"
                        y="55"
                        width="8"
                        height="18"
                        rx="3.5"
                        fill={selectedAccessory.corPrincipal}
                      />
                    </g>
                  )}
                  {(selectedAccessory.categoria === 'bones' ||
                    selectedAccessory.categoria === 'chapeus') && (
                    <g>
                      <path
                        d="M43 50 C43 26 97 26 97 50 Z"
                        fill={selectedAccessory.corPrincipal}
                      />
                      <rect
                        x="36"
                        y="46"
                        width="68"
                        height="6"
                        rx="3"
                        fill={selectedAccessory.corDetalhe}
                      />
                    </g>
                  )}
                  {customization.acessorioId === 'coroa_holo' && (
                    <ellipse
                      cx="70"
                      cy="29"
                      rx="23"
                      ry="6"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                    />
                  )}
                  <rect x="78" y="116" width="10" height="14" rx="2" fill="#38bdf8" />
                </svg>

                <span className="text-xs font-bold text-slate-100 mt-1">
                  {playerName.trim() || 'Analista'} (
                  {customization.genero === 'feminino' ? 'Mulher' : 'Homem'})
                </span>
                <span className="text-[11px] text-sky-400 font-medium mt-0.5">
                  {selectedOutfit.nome} · {selectedAccessory.nome}
                </span>
              </div>

              {/* Gender Switcher */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Gênero do Personagem
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeCustomization({ ...customization, genero: 'masculino' })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      customization.genero === 'masculino'
                        ? 'bg-[#0071e3] border-sky-400 text-white'
                        : 'bg-[#090d16] border-slate-800 text-slate-300'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Homem
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeCustomization({ ...customization, genero: 'feminino' })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      customization.genero === 'feminino'
                        ? 'bg-[#0071e3] border-sky-400 text-white'
                        : 'bg-[#090d16] border-slate-800 text-slate-300'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Mulher
                  </button>
                </div>
              </div>
            </div>

            {/* Strictly Locked Full Wardrobe Status unless Game is Beaten */}
            <div className="pt-3 border-t border-slate-800/80">
              <div
                className={`p-3 rounded-xl border text-xs ${
                  gameBeaten
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#090d16] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-slate-200 mb-1">
                  {gameBeaten ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Jogo Zerado! Tudo Liberado!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Desbloqueio Total ao Zerar</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-snug">
                  {gameBeaten
                    ? 'Parabéns! Você zerou a carreira e desbloqueou todas as 16 roupas e 21 acessórios!'
                    : `Desbloqueie itens somando pontos ou zere o jogo (1.500 pts ou 15 chamados — atual: ${resolvedCount}/15).`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Tabs */}
          <div className="md:col-span-8 p-5 flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-2 p-1 bg-[#090d16] rounded-xl border border-slate-800">
              {[
                { id: 'roupas', label: `Roupas (${ALL_OUTFITS.length})` },
                { id: 'acessorios', label: `Acessórios (${ALL_ACCESSORIES.length})` },
                { id: 'personagem', label: 'Pele & Cabelo' },
                {
                  id: 'medalhas',
                  label: `Medalhas (${unlockedMedals.length}/${ALL_MEDALS.length})`,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      t.id as 'personagem' | 'roupas' | 'acessorios' | 'medalhas'
                    )
                  }
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#0071e3] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {purchaseToast && (
              <div
                role="status"
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                  purchaseToast.isError
                    ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                    : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <span>{purchaseToast.text}</span>
              </div>
            )}

            {/* Tab: 16 Outfits (Purchased with Points as Currency) */}
            {activeTab === 'roupas' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[52vh] overflow-y-auto pr-1">
                {ALL_OUTFITS.map((outfit) => {
                  const isSelected = customization.roupaId === outfit.id;
                  const dynamicPrice = getDynamicOutfitPrice(
                    outfit,
                    difficulty,
                    points,
                    resolvedCount
                  );
                  const isOwned =
                    outfit.pontosNecessarios <= 0 ||
                    gameBeaten ||
                    isSelected ||
                    purchasedOutfitIds.includes(outfit.id);
                  const canAfford = points >= dynamicPrice;

                  return (
                    <button
                      key={outfit.id}
                      type="button"
                      disabled={!isOwned && !canAfford}
                      onClick={() => {
                        if (isOwned) {
                          onChangeCustomization({ ...customization, roupaId: outfit.id });
                          return;
                        }
                        if (onPurchaseOutfit) {
                          const res = onPurchaseOutfit(outfit);
                          triggerToast(res.message, !res.ok);
                        } else if (canAfford) {
                          onChangeCustomization({ ...customization, roupaId: outfit.id });
                        }
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-[#111c33] border-sky-400 shadow-md cursor-pointer'
                          : isOwned
                          ? 'bg-[#090d16] border-slate-800 hover:border-slate-700 cursor-pointer'
                          : canAfford
                          ? 'bg-[#090d16] border-amber-500/40 hover:border-amber-400 cursor-pointer'
                          : 'bg-[#090d16]/50 border-slate-800/60 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg border border-white/15 shrink-0 flex flex-col overflow-hidden">
                          <div
                            className="flex-1"
                            style={{ backgroundColor: outfit.corCamisa }}
                          />
                          <div
                            className="h-2.5"
                            style={{ backgroundColor: outfit.corCalca }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-100 block truncate">
                            {outfit.nome}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {outfit.descricao}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold font-mono-tabular ${
                              isSelected
                                ? 'text-sky-400'
                                : isOwned
                                ? 'text-emerald-400'
                                : canAfford
                                ? 'text-amber-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {isSelected ? (
                              'Em Uso (Equipado)'
                            ) : isOwned ? (
                              'Adquirido · Clique para vestir'
                            ) : canAfford ? (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                Comprar por {dynamicPrice} pts
                              </>
                            ) : (
                              `Custa ${dynamicPrice} pts (Faltam ${dynamicPrice - points} pts)`
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : isOwned ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                            Vestir
                          </span>
                        ) : canAfford ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold">
                            Comprar
                          </span>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab: 21 Accessories with Category Filter (Purchased with Points as Currency) */}
            {activeTab === 'acessorios' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'todos', label: 'Todos (21)' },
                    { id: 'oculos', label: 'Óculos' },
                    { id: 'fones', label: 'Fones & Headsets' },
                    { id: 'bones', label: 'Bonés' },
                    { id: 'chapeus', label: 'Chapéus & Gorros' },
                    { id: 'extras', label: 'Extras' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setAccFilter(cat.id as 'todos' | AccessoryCategory)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                        accFilter === cat.id
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-[#090d16] border border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {filteredAccessories.map((acc) => {
                    const isSelected = customization.acessorioId === acc.id;
                    const dynamicPrice = getDynamicAccessoryPrice(
                      acc,
                      difficulty,
                      points,
                      resolvedCount
                    );
                    const isOwned =
                      acc.pontosNecessarios <= 0 ||
                      gameBeaten ||
                      isSelected ||
                      purchasedAccessoryIds.includes(acc.id);
                    const canAfford = points >= dynamicPrice;

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={!isOwned && !canAfford}
                        onClick={() => {
                          if (isOwned) {
                            onChangeCustomization({
                              ...customization,
                              acessorioId: acc.id,
                            });
                            return;
                          }
                          if (onPurchaseAccessory) {
                            const res = onPurchaseAccessory(acc);
                            triggerToast(res.message, !res.ok);
                          } else if (canAfford) {
                            onChangeCustomization({
                              ...customization,
                              acessorioId: acc.id,
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-[#111c33] border-sky-400 shadow-md cursor-pointer'
                            : isOwned
                            ? 'bg-[#090d16] border-slate-800 hover:border-slate-700 cursor-pointer'
                            : canAfford
                            ? 'bg-[#090d16] border-amber-500/40 hover:border-amber-400 cursor-pointer'
                            : 'bg-[#090d16]/50 border-slate-800/60 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className="w-8 h-8 rounded-lg border border-white/15 shrink-0 mt-0.5"
                            style={{
                              background: `linear-gradient(135deg, ${acc.corPrincipal} 55%, ${acc.corDetalhe} 100%)`,
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-100 block truncate">
                              {acc.nome}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                              {acc.descricao}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold font-mono-tabular ${
                                isSelected
                                  ? 'text-sky-400'
                                  : isOwned
                                  ? 'text-emerald-400'
                                  : canAfford
                                  ? 'text-amber-300'
                                  : 'text-slate-400'
                              }`}
                            >
                              {isSelected ? (
                                'Em Uso (Equipado)'
                              ) : isOwned ? (
                                'Adquirido · Clique para equipar'
                              ) : canAfford ? (
                                <>
                                  <ShoppingBag className="w-3 h-3" />
                                  Comprar por {dynamicPrice} pts
                                </>
                              ) : (
                                `Custa ${dynamicPrice} pts (Faltam ${dynamicPrice - points} pts)`
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : isOwned ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                              Equipar
                            </span>
                          ) : canAfford ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold">
                              Comprar
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Appearance (Skin Tone & Hair Color) */}
            {activeTab === 'personagem' && (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Tom de Pele
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {SKIN_TONES.map((tone) => {
                      const active = customization.tomPele === tone.id;
                      return (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() =>
                            onChangeCustomization({ ...customization, tomPele: tone.id })
                          }
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer ${
                            active
                              ? 'bg-[#111c33] border-sky-400'
                              : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-full border border-white/20"
                            style={{ backgroundColor: tone.id }}
                          />
                          <span className="text-[11px] text-slate-300 font-medium">
                            {tone.nome}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Cor do Cabelo
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {HAIR_COLORS.map((hair) => {
                      const active = customization.corCabelo === hair.id;
                      return (
                        <button
                          key={hair.id}
                          type="button"
                          onClick={() =>
                            onChangeCustomization({ ...customization, corCabelo: hair.id })
                          }
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                            active
                              ? 'bg-[#111c33] border-sky-400'
                              : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: hair.id }}
                          />
                          <span className="text-xs text-slate-200 font-medium truncate">
                            {hair.nome}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Career Medals */}
            {activeTab === 'medalhas' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_MEDALS.map((medal) => {
                  const earned = unlockedMedals.includes(medal.id);
                  return (
                    <div
                      key={medal.id}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        earned
                          ? 'bg-[#111c33]/90 border-amber-500/40'
                          : 'bg-[#090d16]/60 border-slate-800 opacity-65'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: earned ? `${medal.cor}22` : '#0f172a',
                          borderColor: earned ? medal.cor : '#1e293b',
                        }}
                      >
                        {renderMedalIcon(medal.icone, earned ? medal.cor : '#64748b')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-100 truncate">
                            {medal.titulo}
                          </span>
                          <span className="text-[10px] font-bold font-mono-tabular text-amber-400 shrink-0">
                            +{medal.pontosRecompensa} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {medal.descricao}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#090d16] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Resolva chamados sem erros para ganhar pontos e liberar roupas, chapéus, óculos e fones!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold cursor-pointer"
          >
            Confirmar e Voltar
          </button>
        </div>
      </div>
    </div>
  );
};
