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
      className="fixed inset-0 z-30 flex items-center justify-center p-2.5 sm:p-4 lg-modal-backdrop pointer-events-auto"
    >
      <div className="w-full max-w-5xl lg-modal-floating rounded-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-3 sm:py-4 lg-modal-header">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                Inspeção Física do Equipamento — {problem.setor.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-300 truncate">
                Relato: &ldquo;{problem.falaNpc}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSwitchToVirtualOS}
              className="px-3 sm:px-3.5 py-2 rounded-lg lg-btn-primary text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Laptop className="w-4 h-4" />
              <span>OverOS Virtual</span>
            </button>
            <button
              type="button"
              aria-label="Fechar Inspeção de Hardware"
              onClick={onClose}
              className="p-2 rounded-lg lg-btn-secondary text-slate-300 cursor-pointer"
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
          <div className="lg-choice-card rounded-xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">
                  01. Energia e Alimentação
                </span>
                <Plug className="w-4 h-4 text-amber-400" />
              </div>

              {/* Interactive Schematic Visualization */}
              <div className="lg-inner-well rounded-lg p-4 mb-4 flex flex-col gap-3">
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
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.tomadaConectada
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-amber'
                  }`}
                >
                  <span>Conectar Cabo na Tomada</span>
                  <Plug className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('ligar_chave_fonte')}
                  disabled={state.chaveFonteLigada}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.chaveFonteLigada
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-amber'
                  }`}
                >
                  <span>Ligar Chave da Fonte (Posição I)</span>
                  <Power className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('ligar_gabinete')}
                  disabled={state.gabineteLigado}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.gabineteLigado
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-primary'
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
          <div className="lg-choice-card rounded-xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">
                  02. Vídeo, USB e Cabo de Rede
                </span>
                <Monitor className="w-4 h-4 text-sky-400" />
              </div>

              <div className="lg-inner-well rounded-lg p-4 mb-4 flex flex-col gap-2.5">
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
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.monitorLigado
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-primary'
                  }`}
                >
                  <span>Ligar Botão Power do Monitor</span>
                  <Monitor className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('conectar_hdmi')}
                  disabled={state.hdmiConectado}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.hdmiConectado
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-primary'
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
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      state.tecladoUsbConectado
                        ? 'lg-btn-secondary text-slate-500 cursor-default'
                        : 'lg-btn-primary'
                    }`}
                  >
                    <span>Plugar Teclado</span>
                    <Usb className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onExecuteAction('conectar_mouse_usb')}
                    disabled={state.mouseUsbConectado}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      state.mouseUsbConectado
                        ? 'lg-btn-secondary text-slate-500 cursor-default'
                        : 'lg-btn-primary'
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
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.caboRedeConectado
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-emerald'
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
          <div className="lg-choice-card rounded-xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">
                  03. Interior do Gabinete & Impressora
                </span>
                <Fan className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="lg-inner-well rounded-lg p-4 mb-4 flex flex-col gap-2.5">
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
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.gabineteAberto
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-secondary text-slate-100'
                  }`}
                >
                  <span>Abrir Tampa Lateral do Gabinete</span>
                  <Box className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('limpar_ventoinha')}
                  disabled={state.ventoinhaLimpa}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.ventoinhaLimpa
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-emerald'
                  }`}
                >
                  <span>Limpar Poeira da Ventoinha (Cooler)</span>
                  <Fan className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteAction('reencaixar_ram')}
                  disabled={state.ramEncaixada}
                  className={`w-full px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    state.ramEncaixada
                      ? 'lg-btn-secondary text-slate-500 cursor-default'
                      : 'lg-btn-emerald'
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
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      state.impressoraSemAtolamento
                        ? 'lg-btn-secondary text-slate-500 cursor-default'
                        : 'lg-btn-amber'
                    }`}
                  >
                    <span>Tirar Folha Presa</span>
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onExecuteAction('repor_papel_impressora')}
                    disabled={state.impressoraComPapel}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      state.impressoraComPapel
                        ? 'lg-btn-secondary text-slate-500 cursor-default'
                        : 'lg-btn-amber'
                    }`}
                  >
                    <span>Repor Papel A4</span>
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {showHints && (
              <div className="lg-inner-well rounded-lg p-3">
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
