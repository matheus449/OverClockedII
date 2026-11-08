import React, { useState } from 'react';
import {
  ALL_FURNITURE_SLOTS,
  ALL_HOME_FURNITURE,
  calculateHomeComfortScore,
  FurnitureCategory,
  FurnitureSlotId,
  getActiveFurnitureIdForSlot,
  HomeFurnitureItem,
} from '../home/homeSystem';
import { formatCycleTimer } from '../cafeteria/cafeteriaSystem';
import {
  Award,
  BedDouble,
  CheckCircle2,
  Clock,
  Home,
  Lock,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

interface HomeFurnitureModalProps {
  points: number;
  purchasedFurnitureIds: string[];
  hasSleptAtHome: boolean;
  homeStayRemaining: number;
  onPurchaseFurniture: (item: HomeFurnitureItem) => { ok: boolean; message: string };
  onEquipFurnitureVersion?: (item: HomeFurnitureItem) => void;
  onReturnToOffice: () => void;
  onClose: () => void;
}

export const HomeFurnitureModal: React.FC<HomeFurnitureModalProps> = ({
  points,
  purchasedFurnitureIds,
  hasSleptAtHome,
  homeStayRemaining,
  onPurchaseFurniture,
  onEquipFurnitureVersion,
  onReturnToOffice,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | FurnitureCategory>('todos');
  const [selectedVersionBySlot, setSelectedVersionBySlot] = useState<Record<string, 1 | 2 | 3>>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const comfort = calculateHomeComfortScore(purchasedFurnitureIds);

  const categories: { id: 'todos' | FurnitureCategory; label: string }[] = [
    { id: 'todos', label: 'Todos os Cômodos (12 Móveis · 36 Versões)' },
    { id: 'conforto', label: 'Conforto' },
    { id: 'tecnologia', label: 'Tecnologia' },
    { id: 'decoracao', label: 'Decoração' },
    { id: 'lazer', label: 'Lazer' },
  ];

  const filteredSlots =
    selectedCategory === 'todos'
      ? ALL_FURNITURE_SLOTS
      : ALL_FURNITURE_SLOTS.filter((slot) => slot.categoria === selectedCategory);

  const getSelectedVersionForSlot = (slotId: FurnitureSlotId): 1 | 2 | 3 => {
    if (selectedVersionBySlot[slotId]) {
      return selectedVersionBySlot[slotId];
    }
    const activeId = getActiveFurnitureIdForSlot(slotId, purchasedFurnitureIds);
    if (activeId) {
      const activeItem = ALL_HOME_FURNITURE.find((f) => f.id === activeId);
      if (activeItem) return activeItem.versao;
    }
    return 1;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo de Móveis e Decoração da Casa"
      data-testid="home-furniture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 pointer-events-auto"
    >
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#090d16]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {comfort.levelTitle}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-semibold text-sky-300">
                  {comfort.ownedSlotsCount}/{comfort.totalSlots} Cômodos Mobiliados ({comfort.ownedCount}/{comfort.totalItems} Versões)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Catálogo de Móveis 3D · 3 Versões por Item
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-1.5 text-sky-300 text-xs font-bold font-mono-tabular">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Volta: {formatCycleTimer(homeStayRemaining)}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Conforto: +{comfort.totalComfort}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5 text-amber-300 text-xs font-extrabold font-mono-tabular">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{points} pts</span>
            </div>

            <button
              type="button"
              aria-label="Fechar Catálogo de Móveis"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap bg-[#0b111e]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {feedback && (
            <div
              role="status"
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                feedback.ok
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* Furniture Grid (12 Slots, each with Version I, II, III selector) */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSlots.map((slot) => {
            const versions = ALL_HOME_FURNITURE.filter((f) => f.slotId === slot.slotId);
            const selectedVer = getSelectedVersionForSlot(slot.slotId);
            const item = versions.find((v) => v.versao === selectedVer) || versions[0];
            const activeSlotItemId = getActiveFurnitureIdForSlot(
              slot.slotId,
              purchasedFurnitureIds
            );
            const isOwned = purchasedFurnitureIds.includes(item.id);
            const isEquipped = activeSlotItemId === item.id;
            const canAfford = points >= item.preco;

            return (
              <div
                key={slot.slotId}
                data-testid={`furniture-card-${item.id}`}
                className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                  isEquipped
                    ? 'bg-emerald-950/20 border-emerald-500/45'
                    : isOwned
                    ? 'bg-sky-950/20 border-sky-500/40'
                    : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-950"
                      style={{ backgroundColor: item.corDestaque }}
                    >
                      {item.comodo}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-300">
                      +{item.confortoBonus} Conforto
                    </span>
                  </div>

                  {/* 3-Version Selector Tabs (V1 / V2 / V3) */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                    {versions.map((verItem) => {
                      const verOwned = purchasedFurnitureIds.includes(verItem.id);
                      const verActive = verItem.versao === selectedVer;
                      return (
                        <button
                          key={verItem.id}
                          type="button"
                          data-testid={`select-version-${verItem.id}`}
                          onClick={() =>
                            setSelectedVersionBySlot((prev) => ({
                              ...prev,
                              [slot.slotId]: verItem.versao,
                            }))
                          }
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            verActive
                              ? 'bg-sky-500 text-slate-950 shadow-sm'
                              : verOwned
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>V{verItem.versao}</span>
                          <span className="font-mono-tabular opacity-85">({verItem.preco})</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                      {item.tierLabel}
                    </span>
                    <h3 className="text-sm font-extrabold text-white mt-0.5">{item.nome}</h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{item.descricao}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold font-mono-tabular text-amber-300">
                    {item.preco} pts
                  </span>

                  {isEquipped ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Instalado (V{item.versao})
                    </span>
                  ) : isOwned ? (
                    <button
                      type="button"
                      data-testid={`equip-furniture-${item.id}`}
                      onClick={() => {
                        onEquipFurnitureVersion?.(item);
                        setFeedback({
                          ok: true,
                          text: `${item.nome} (${item.tierLabel}) equipado em 3D!`,
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Usar V{item.versao}
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid={`buy-furniture-${item.id}`}
                      onClick={() => {
                        const res = onPurchaseFurniture(item);
                        setFeedback({ ok: res.ok, text: res.message });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Comprar V{item.versao}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#090d16] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {hasSleptAtHome ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-emerald-400 shrink-0" />
                Você já dormiu na cama (100% Energia)! Pode voltar ao escritório quando quiser.
              </span>
            ) : (
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-amber-400 shrink-0" />
                Para voltar ao escritório, caminhe até a cama no quarto e clique para dormir!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              Caminhar pela Casa
            </button>
            <button
              type="button"
              data-testid="modal-return-office-btn"
              onClick={onReturnToOffice}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md ${
                hasSleptAtHome
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
              }`}
            >
              {hasSleptAtHome ? (
                <>
                  <Sun className="w-4 h-4" />
                  Voltar ao Escritório (Novo Dia)
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Durma na Cama Primeiro
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
