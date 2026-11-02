import React from 'react';
import {
  DiagnosticAction,
  ProblemData,
  WorkstationState,
} from '../problems/validator';
import {
  Power,
  Plug,
  Monitor,
  Cable,
  Usb,
  Fan,
  Cpu,
  Printer,
  Network,
  Box,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  X,
} from 'lucide-react';

interface HardwareWorkbenchProps {
  problem: ProblemData;
  state: WorkstationState;
  lastMessage: { text: string; isError: boolean } | null;
  difficulty: 'facil' | 'normal' | 'dificil';
  onExecuteAction: (action: DiagnosticAction) => void;
  onSwitchToVirtualOS: () => void;
  onClose: () => void;
}

export const HardwareWorkbenchModal: React.FC<HardwareWorkbenchProps> = ({
  problem,
  state,
  lastMessage,
  difficulty,
  onExecuteAction,
  onSwitchToVirtualOS,
  onClose,
}) => {
  const showHints = difficulty !== 'dificil';

  return (
    <div
      role="dialog"
      aria-label="Bancada de Inspeção Física de Hardware"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/75 pointer-events-auto"
    >
      <div className="w-full max-w-5xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Apple-style Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Inspeção Física do Equipamento — {problem.setor.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-400">
                Relato: &ldquo;{problem.falaNpc}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToVirtualOS}
              className="px-3.5 py-2 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Laptop className="w-4 h-4" />
              Abrir Computador Virtual (OverOS)
            </button>
            <button
              type="button"
              aria-label="Fechar Inspeção de Hardware"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Feedback Banner */}
        {lastMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              lastMessage.isError
                ? 'bg-rose-950/80 border-rose-800/60 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-800/60 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {lastMessage.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{lastMessage.text}</span>
            </div>
            <span className="font-mono-tabular text-[11px] opacity-80">
              Etapas concluídas: {state.completedActions.length} / {problem.acoesRequeridas.length}
            </span>
          </div>
        )}

        {/* Main Interactive Hardware Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1: Energia e Alimentação */}
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  01. Energia e Alimentação
                </span>
                <Plug className="w-4 h-4 text-amber-400" />
              </div>

              {/* Interactive Schematic Visualization */}
              <div className="bg-[#090d16] border border-slate-800 rounded-lg p-4 mb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tomada de Parede AC</span>
                  <span
                    className={`font-mono-tabular font-semibold ${
                      state.tomadaConectada ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {state.tomadaConectada ? 'CONECTADA' : 'DESCONECTADA'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Chave Fonte ATX (I/O)</span>
                  <span
                    className={`font-mono-tabular font-semibold ${
                      state.chaveFonteLigada ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {state.chaveFonteLigada ? 'POSIÇÃO I (ON)' : 'POSIÇÃO O (OFF)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status do Gabinete</span>
                  <span
                    className={`font-mono-tabular font-semibold ${
                      state.gabineteLigado ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {state.gabineteLigado ? 'LIGADO (LED ON)' : 'DESLIGADO'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onExecuteAction('conectar_tomada')}
                  disabled={state.tomadaConectada}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.tomadaConectada
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <span>Conectar Cabo na Tomada</span>
                  <Plug className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('ligar_chave_fonte')}
                  disabled={state.chaveFonteLigada}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.chaveFonteLigada
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <span>Ligar Chave da Fonte (Posição I)</span>
                  <Power className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('ligar_gabinete')}
                  disabled={state.gabineteLigado}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.gabineteLigado
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                  }`}
                >
                  <span>Apertar Botão Power do Gabinete</span>
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dica física: A corrente elétrica passa da tomada para a chave da fonte traseira antes de chegar ao botão Power frontal.
            </p>
          </div>

          {/* Column 2: Monitor, Cabos e Periféricos */}
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  02. Vídeo, USB e Cabo de Rede
                </span>
                <Monitor className="w-4 h-4 text-sky-400" />
              </div>

              <div className="bg-[#090d16] border border-slate-800 rounded-lg p-4 mb-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Botão do Monitor</span>
                  <span className={state.monitorLigado ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {state.monitorLigado ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cabo de Vídeo HDMI</span>
                  <span className={state.hdmiConectado ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {state.hdmiConectado ? 'CONECTADO' : 'SOLTO (SEM SINAL)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Teclado / Mouse USB</span>
                  <span className={state.tecladoUsbConectado && state.mouseUsbConectado ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {state.tecladoUsbConectado && state.mouseUsbConectado ? 'AMBOS OK' : 'CABO USB SOLTO'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 whitespace-nowrap">Cabo Ethernet RJ45</span>
                  <span className={`whitespace-nowrap font-mono-tabular ${state.caboRedeConectado ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}`}>
                    {state.caboRedeConectado ? 'CONECTADO' : 'DESCONECTADO'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onExecuteAction('ligar_monitor')}
                  disabled={state.monitorLigado}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.monitorLigado
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  <span>Ligar Botão Power do Monitor</span>
                  <Monitor className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('conectar_hdmi')}
                  disabled={state.hdmiConectado}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.hdmiConectado
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  <span>Conectar Cabo HDMI de Vídeo</span>
                  <Cable className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onExecuteAction('conectar_teclado_usb')}
                    disabled={state.tecladoUsbConectado}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      state.tecladoUsbConectado
                        ? 'bg-slate-800/50 text-slate-500 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                    }`}
                  >
                    <span>Plugar Teclado</span>
                    <Usb className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onExecuteAction('conectar_mouse_usb')}
                    disabled={state.mouseUsbConectado}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      state.mouseUsbConectado
                        ? 'bg-slate-800/50 text-slate-500 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                    }`}
                  >
                    <span>Plugar Mouse</span>
                    <Usb className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onExecuteAction('conectar_cabo_rede')}
                  disabled={state.caboRedeConectado}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.caboRedeConectado
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                  }`}
                >
                  <span>Encaixar Cabo de Rede RJ45</span>
                  <Network className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cabos de vídeo, USB e rede possuem encaixe firme na parte traseira do gabinete.
            </p>
          </div>

          {/* Column 3: Interior do Gabinete & Impressora do Setor */}
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  03. Interior do Gabinete & Impressora
                </span>
                <Fan className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="bg-[#090d16] border border-slate-800 rounded-lg p-4 mb-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tampa Lateral</span>
                  <span className="font-mono-tabular font-semibold text-slate-200">
                    {state.gabineteAberto ? 'ABERTA' : 'FECHADA'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 whitespace-nowrap">Cooler / Ventoinha</span>
                  <span className={`whitespace-nowrap font-mono-tabular ${state.ventoinhaLimpa ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}`}>
                    {state.ventoinhaLimpa ? 'LIMPA (OK)' : 'COM POEIRA'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 whitespace-nowrap">Memória RAM DDR4</span>
                  <span className={`whitespace-nowrap font-mono-tabular ${state.ramEncaixada ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}`}>
                    {state.ramEncaixada ? 'TRAVADA NO SLOT' : 'MAL ENCAIXADA'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Impressora do Setor</span>
                  <span
                    className={
                      state.impressoraSemAtolamento && state.impressoraComPapel
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {!state.impressoraSemAtolamento
                      ? 'PAPEL ATOLADO'
                      : !state.impressoraComPapel
                        ? 'BANDEJA SEM PAPEL'
                        : 'PRONTA'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onExecuteAction('abrir_gabinete')}
                  disabled={state.gabineteAberto}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.gabineteAberto
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                  }`}
                >
                  <span>Abrir Tampa Lateral do Gabinete</span>
                  <Box className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('limpar_ventoinha')}
                  disabled={state.ventoinhaLimpa}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.ventoinhaLimpa
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <span>Limpar Poeira da Ventoinha (Cooler)</span>
                  <Fan className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('reencaixar_ram')}
                  disabled={state.ramEncaixada}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    state.ramEncaixada
                      ? 'bg-slate-800/50 text-slate-500 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <span>Reencaixar Pente de Memória RAM</span>
                  <Cpu className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onExecuteAction('remover_papel_atolado')}
                    disabled={state.impressoraSemAtolamento}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      state.impressoraSemAtolamento
                        ? 'bg-slate-800/50 text-slate-500 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <span>Tirar Folha Presa</span>
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onExecuteAction('repor_papel_impressora')}
                    disabled={state.impressoraComPapel}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      state.impressoraComPapel
                        ? 'bg-slate-800/50 text-slate-500 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <span>Repor Papel A4</span>
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {showHints && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-sky-400 mb-1">
                  Roteiro Didático ({difficulty === 'facil' ? 'Modo Fácil' : 'Modo Normal'}):
                </p>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  {problem.etapas.map((etapa, i) => (
                    <li key={i}>{etapa}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
