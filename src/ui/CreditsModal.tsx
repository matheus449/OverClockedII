import React from 'react';
import {
  Award,
  Code2,
  Coffee,
  Cpu,
  GraduationCap,
  Heart,
  Layers,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';

export const OVERCLOCKED_LOGO_URL =
  './assets/aistudio/WhatsApp_Image_2026-10-27_at_17.34.43_1__68d8b1eb.jpeg';
export const OVERCLOCKED_ICON_URL =
  './assets/aistudio/WhatsApp_Image_2026-10-27_at_17.34.43_8e0ea5a1.jpeg';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-label="Créditos e Sobre o Jogo OVERCLOCKED"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg-modal-backdrop pointer-events-auto"
    >
      <div className="w-full max-w-3xl max-h-[90vh] lg-modal-floating border-purple-500/35 rounded-3xl overflow-hidden flex flex-col">
        {/* Top Modal Header */}
        <div className="px-6 py-4 lg-modal-header flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 border border-purple-400/50 shadow-md flex items-center justify-center shrink-0">
              <img
                src={OVERCLOCKED_ICON_URL}
                alt="Símbolo Oficial OVERCLOCKED"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                Ficha Técnica & Identidade Oficial
              </span>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                Créditos · OVERCLOCKED
              </h2>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fechar tela de créditos"
            onClick={onClose}
            className="p-2 rounded-xl lg-btn-secondary text-slate-300 hover:text-white cursor-pointer"
            title="Fechar [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Credits Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Official Brand Banner Showcase (Both Official Images) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            <div className="md:col-span-8 rounded-2xl bg-white p-5 border-2 border-purple-500/30 shadow-xl flex flex-col items-center justify-center">
              <img
                src={OVERCLOCKED_LOGO_URL}
                alt="Logotipo Oficial OVERCLOCKED"
                className="w-full max-w-md h-24 md:h-28 object-contain"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-2">
                Logotipo Oficial · Simulador de Suporte e Rotina em TI
              </span>
            </div>

            <div className="md:col-span-4 rounded-2xl bg-white p-5 border-2 border-purple-500/30 shadow-xl flex flex-col items-center justify-center">
              <img
                src={OVERCLOCKED_ICON_URL}
                alt="Ícone Power Oficial OVERCLOCKED"
                className="w-24 h-24 md:w-28 md:h-28 object-contain"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-700 mt-2 text-center">
                Emblema Power Oficial
              </span>
            </div>
          </div>

          {/* About & Author / Idealization Card */}
          <div className="p-5 rounded-2xl lg-inner-well space-y-3">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Idealização, Conceito & Propósito Educacional</span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              <strong>OVERCLOCKED</strong> foi concebido como um simulador interativo em 3D
              isométrico voltado ao aprendizado prático da rotina de Tecnologia da Informação
              e Suporte Técnico (Help Desk). No papel de um(a) analista recém-contratado(a)
              na <strong>NexusCorp Operações</strong>, o jogador vivencia diagnósticos reais de
              hardware, sistemas operacionais, redes e atendimento humano.
            </p>
            <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl lg-hud-pill">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                  Direção & Criação
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  Projeto OVERCLOCKED
                </span>
                <span className="text-[11px] text-slate-400">
                  Idealização, Roteiro & Regras de Simulação
                </span>
              </div>
              <div className="p-3 rounded-xl lg-hud-pill">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                  Identidade Visual
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  Marca OVERCLOCKED
                </span>
                <span className="text-[11px] text-slate-400">
                  Logotipo Power Roxo & Design Isométrico 3D
                </span>
              </div>
              <div className="p-3 rounded-xl lg-hud-pill">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Didática em TI
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  64 Chamados Reais
                </span>
                <span className="text-[11px] text-slate-400">
                  Hardware, Software, Redes e Camada 8
                </span>
              </div>
            </div>
          </div>

          {/* Game Systems & Mechanics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl lg-inner-well space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>Simulação Técnica & Diagnóstico</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <li>• <strong>15 Setores Corporativos</strong> com problemas e personagens próprios.</li>
                <li>• <strong>Bancada de Hardware 3D</strong>: cabos, fonte ATX, cooler, memória RAM e impressora.</li>
                <li>• <strong>Sistema Operacional Virtual (OverOS)</strong>: processos, rede IP/DNS, lixeira e áudio.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl lg-inner-well space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Coffee className="w-4 h-4" />
                <span>Rotina, Cafeteria & Progressão</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <li>• <strong>Cafeteria OverCoffee 3D</strong>: espaço físico completo com barista e colegas.</li>
                <li>• <strong>Gestão de Energia</strong>: alerta aos 20% e cochilo no expediente aos 0%.</li>
                <li>• <strong>Guarda-Roupa & Carreira</strong>: 16 roupas, 21 acessórios 3D e 8 medalhas.</li>
              </ul>
            </div>
          </div>

          {/* Tech Stack Footer */}
          <div className="p-4 rounded-2xl lg-hud-pill flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Code2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Desenvolvido com <strong>React 19</strong>, <strong>TypeScript</strong>,{' '}
                <strong>Three.js (WebGL 3D)</strong>, <strong>Tailwind CSS</strong> &{' '}
                <strong>Web Audio / Speech API</strong>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
              Obrigado por jogar OVERCLOCKED!
            </span>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="px-6 py-4 lg-modal-footer flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl lg-btn-primary text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Voltar ao Jogo
          </button>
        </div>
      </div>
    </div>
  );
};
