import React, { useState } from 'react';
import {
  canBootVirtualOS,
  DiagnosticAction,
  ProblemData,
  WorkstationState,
} from '../problems/validator';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FolderOpen,
  HardDrive,
  Keyboard,
  Maximize2,
  Monitor,
  Plane,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';

interface VirtualOSProps {
  problem: ProblemData;
  state: WorkstationState;
  lastMessage: { text: string; isError: boolean } | null;
  difficulty: 'facil' | 'normal' | 'dificil';
  onExecuteAction: (action: DiagnosticAction) => void;
  onSwitchToHardware: () => void;
  onClose: () => void;
}

type OSAppId =
  | 'arquivos'
  | 'lixeira'
  | 'tarefas'
  | 'configuracoes'
  | 'rede'
  | 'seguranca'
  | 'dispositivos';

export const VirtualOSModal: React.FC<VirtualOSProps> = ({
  problem,
  state,
  lastMessage,
  difficulty,
  onExecuteAction,
  onSwitchToHardware,
  onClose,
}) => {
  const [activeApp, setActiveApp] = useState<OSAppId>(() => {
    const req = problem.acoesRequeridas;
    if (problem.categoria === 'Redes' || req.includes('conectar_wifi_corp') || req.includes('corrigir_dns') || req.includes('ativar_dhcp_ip')) {
      return 'rede';
    }
    if (req.includes('esvaziar_lixeira') || req.includes('restaurar_arquivo_lixeira')) {
      return 'lixeira';
    }
    if (
      req.includes('ativar_audio_sistema') ||
      req.includes('selecionar_saida_audio_correta') ||
      req.includes('ajustar_resolucao_nativa') ||
      req.includes('ajustar_idioma_abnt2') ||
      req.includes('limpar_arquivos_temporarios')
    ) {
      return 'configuracoes';
    }
    if (req.includes('ativar_antivirus') || req.includes('executar_varredura_quarentena')) {
      return 'seguranca';
    }
    if (req.includes('atualizar_driver_dispositivo') || req.includes('reparar_aplicativo_corporativo')) {
      return 'dispositivos';
    }
    return 'tarefas';
  });
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [wifiPasswordInput, setWifiPasswordInput] = useState('TI@Over2026');

  const bootCheck = canBootVirtualOS(state);
  const showHints = difficulty !== 'dificil';

  const apps: { id: OSAppId; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    {
      id: 'arquivos',
      label: 'Explorador de Arquivos',
      icon: <FolderOpen className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'lixeira',
      label: 'Lixeira',
      icon: <Trash2 className="w-5 h-5 text-slate-300" />,
      badge: state.lixeiraCheia || state.arquivoImportanteNaLixeira,
    },
    {
      id: 'tarefas',
      label: 'Gerenciador de Tarefas',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      badge: state.processoPesadoAtivo || !state.appsInicializacaoOtimizados,
    },
    {
      id: 'configuracoes',
      label: 'Configurações do Sistema',
      icon: <Sliders className="w-5 h-5 text-sky-400" />,
      badge:
        !state.audioAtivo ||
        !state.saidaAudioCorreta ||
        !state.resolucaoNativa ||
        !state.idiomaAbnt2 ||
        !state.arquivosTemporariosLimpos,
    },
    {
      id: 'rede',
      label: 'Rede e Wi-Fi',
      icon: <Wifi className="w-5 h-5 text-indigo-400" />,
      badge:
        !state.modoAviaoDesativado ||
        !state.wifiAtivo ||
        !state.wifiCorpConectado ||
        !state.dhcpAtivo ||
        !state.dnsCorreto,
    },
    {
      id: 'seguranca',
      label: 'Central de Segurança',
      icon: <Shield className="w-5 h-5 text-teal-400" />,
      badge: !state.antivirusAtivo || !state.ameacasEmQuarentena,
    },
    {
      id: 'dispositivos',
      label: 'Dispositivos e Programas',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      badge: !state.driverAtualizado || !state.aplicativoCorporativoIntegro,
    },
  ];

  // If the hardware cannot boot or show video, render a realistic dark monitor bezel with a switch to Hardware Inspection
  if (!bootCheck.canBoot) {
    return (
      <div
        role="dialog"
        aria-label="Monitor sem sinal ou computador desligado"
        className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
      >
        <div className="w-full max-w-2xl bg-[#090d16] border-4 border-slate-800 rounded-2xl p-10 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <Monitor className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Monitor Sem Imagem / Sistema Não Iniciado
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            {bootCheck.reason}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onSwitchToHardware}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              Inspecionar Cabos e Hardware Físico
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Computador Virtual OverOS"
      className="fixed inset-0 z-30 flex items-center justify-center p-3 md:p-6 bg-black/75 pointer-events-auto"
    >
      {/* Monitor Frame */}
      <div
        className={`w-full max-w-6xl h-[86vh] bg-[#0b1324] border-4 border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative ${
          !state.resolucaoNativa ? 'scale-y-95 tracking-widest' : ''
        }`}
      >
        {/* Top Bezel Bar: NPC Quote + Switch to Physical Hardware + Close */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d16] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-bold text-sky-400 whitespace-nowrap">
              OverOS Pro · Estação {problem.setor.toUpperCase()}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 truncate">
              &ldquo;{problem.falaNpc}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSwitchToHardware}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              Inspecionar Cabos / Hardware
            </button>
            <button
              type="button"
              aria-label="Fechar Computador Virtual"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Feedback Strip */}
        {lastMessage && (
          <div
            className={`px-5 py-2 text-xs font-medium flex items-center justify-between border-b shrink-0 ${
              lastMessage.isError
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
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
            <span className="font-mono-tabular text-[11px]">
              Progresso: {state.completedActions.length} / {problem.acoesRequeridas.length}
            </span>
          </div>
        )}

        {/* Main Virtual Desktop Workspace */}
        <div className="flex-1 flex overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#13203c] to-[#0b1324] relative">
          {/* Left Desktop Icons Column */}
          <div className="w-60 p-3 flex flex-col gap-1.5 border-r border-slate-800/70 bg-[#090d16]/50 shrink-0 overflow-y-auto">
            <span className="text-[11px] font-semibold text-slate-400 px-2 py-1">
              Ferramentas do Sistema
            </span>
            {apps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  setActiveApp(app.id);
                  setStartMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  activeApp === app.id
                    ? 'bg-[#0071e3] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {app.icon}
                  <span className="text-xs font-medium whitespace-nowrap">{app.label}</span>
                </div>
                {app.badge && (
                  <span className="text-[10px] font-mono-tabular font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                    !
                  </span>
                )}
              </button>
            ))}

            {showHints && (
              <div className="mt-auto p-3 rounded-xl bg-[#090d16]/90 border border-slate-800">
                <p className="text-[11px] font-semibold text-sky-400 mb-1">
                  Guia Passo a Passo:
                </p>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside leading-snug">
                  {problem.etapas.map((et, i) => (
                    <li key={i}>{et}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Active OS Window Area */}
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              {/* Window Title Bar */}
              <div className="px-5 py-3 bg-[#1e293b]/70 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">
                  {apps.find((a) => a.id === activeApp)?.label}
                </span>
                <span className="text-xs text-slate-400 font-mono-tabular">
                  OverOS v14.2
                </span>
              </div>

              {/* Window Content Body */}
              <div className="p-6">
                {activeApp === 'tarefas' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
                        <span className="text-xs text-slate-400">Uso de Processador (CPU)</span>
                        <div className="text-2xl font-bold font-mono-tabular mt-1 text-slate-100">
                          {state.processoPesadoAtivo ? (
                            <span className="text-rose-400">99% (Crítico)</span>
                          ) : (
                            <span className="text-emerald-400">8% (Estável)</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
                        <span className="text-xs text-slate-400">Programas na Inicialização</span>
                        <div className="text-2xl font-bold font-mono-tabular mt-1">
                          {state.appsInicializacaoOtimizados ? (
                            <span className="text-emerald-400">Otimizado (2 apps)</span>
                          ) : (
                            <span className="text-amber-400">Sobrecarga (11 apps)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-900 text-xs font-semibold text-slate-400 flex justify-between">
                        <span>Processo em Execução</span>
                        <span>Status / Ação</span>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {state.processoPesadoAtivo ? (
                          <div className="px-4 py-3 bg-rose-950/30 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-rose-200">
                                GeradorRelatorios_Legacy.exe (Não Respondendo)
                              </p>
                              <p className="text-[11px] text-rose-400 font-mono-tabular">
                                CPU: 94.2% · Memória: 4.850 MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onExecuteAction('encerrar_processo_pesado')}
                              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                            >
                              Encerrar Tarefa
                            </button>
                          </div>
                        ) : (
                          <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                            <span>Nenhum processo travado no momento.</span>
                            <span className="text-emerald-400 font-semibold">Normal</span>
                          </div>
                        )}

                        <div className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              Aplicativos Pesados na Inicialização Automática
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Impede que dezenas de janelas abram sozinhas ao ligar o PC
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onExecuteAction('desativar_apps_inicializacao')}
                            disabled={state.appsInicializacaoOtimizados}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                              state.appsInicializacaoOtimizados
                                ? 'bg-slate-800 text-slate-500 cursor-default'
                                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                            }`}
                          >
                            {state.appsInicializacaoOtimizados
                              ? 'Inicialização Otimizada'
                              : 'Desativar Apps de Inicialização'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === 'lixeira' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#090d16] border border-slate-800">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                          Gerenciamento da Lixeira do Sistema
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Verifique se há documentos importantes antes de esvaziar a Lixeira.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExecuteAction('esvaziar_lixeira')}
                        disabled={!state.lixeiraCheia}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                          !state.lixeiraCheia
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {state.lixeiraCheia ? 'Esvaziar Lixeira (42 GB)' : 'Lixeira Vazia'}
                      </button>
                    </div>

                    <div className="border border-slate-800 rounded-xl divide-y divide-slate-800">
                      {state.arquivoImportanteNaLixeira && (
                        <div className="p-4 bg-amber-950/30 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-amber-200">
                              Documento_Importante_Setor.xlsx
                            </p>
                            <p className="text-[11px] text-amber-400">
                              Excluído acidentalmente da pasta Documentos
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onExecuteAction('restaurar_arquivo_lixeira')}
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Restaurar Arquivo
                          </button>
                        </div>
                      )}

                      {state.lixeiraCheia && (
                        <div className="p-4 flex items-center justify-between text-xs text-slate-300">
                          <span>Pacote_Rascunhos_Antigos_Descartados.zip (42.4 GB)</span>
                          <span className="text-slate-400">Aguardando Esvaziar Lixeira</span>
                        </div>
                      )}

                      {!state.arquivoImportanteNaLixeira && !state.lixeiraCheia && (
                        <div className="p-6 text-center text-xs text-slate-400">
                          A Lixeira está limpa e nenhum arquivo importante aguarda restauração.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeApp === 'arquivos' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200">
                            Pasta Documentos do Usuário
                          </span>
                          <FolderOpen className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                          {state.arquivoImportanteNaLixeira
                            ? 'Alerta: O arquivo principal do setor sumiu desta pasta (verifique a Lixeira!).'
                            : 'Todos os documentos de trabalho estão presentes e salvos na pasta.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200">
                            Disco Local (C:)
                          </span>
                          <HardDrive className="w-4 h-4 text-sky-400" />
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                          {state.lixeiraCheia || !state.arquivosTemporariosLimpos
                            ? 'Ocupação elevada (98% cheio).'
                            : 'Espaço saudável (64% livre).'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveApp('lixeira')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                          >
                            Ir para Lixeira
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveApp('configuracoes')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                          >
                            Ir para Armazenamento
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === 'configuracoes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audio Card */}
                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200">
                            Som e Dispositivo de Saída
                          </span>
                          {state.audioAtivo ? (
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Volume: {state.audioAtivo ? '75% (Ativo)' : '0% (Silenciado / Mudo)'} · Saída:{' '}
                          {state.saidaAudioCorreta
                            ? 'Alto-falantes / Headset Corporativo'
                            : 'Saída Digital Desconectada'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => onExecuteAction('ativar_audio_sistema')}
                          disabled={state.audioAtivo}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                            state.audioAtivo
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                          }`}
                        >
                          {state.audioAtivo ? 'Áudio Ativado' : 'Desativar Mudo e Subir Volume'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onExecuteAction('selecionar_saida_audio_correta')}
                          disabled={state.saidaAudioCorreta}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                            state.saidaAudioCorreta
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                          }`}
                        >
                          {state.saidaAudioCorreta
                            ? 'Saída Padrão Selecionada'
                            : 'Selecionar Alto-falantes / Headset'}
                        </button>
                      </div>
                    </div>

                    {/* Display Resolution Card */}
                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200">
                            Tela e Resolução de Vídeo
                          </span>
                          <Maximize2 className="w-4 h-4 text-sky-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                          Atual:{' '}
                          {state.resolucaoNativa
                            ? '1920 x 1080 (Full HD Nativo)'
                            : '800 x 600 (Imagem Esticada / Baixa Nitidez)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExecuteAction('ajustar_resolucao_nativa')}
                        disabled={state.resolucaoNativa}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                          state.resolucaoNativa
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                        }`}
                      >
                        {state.resolucaoNativa
                          ? 'Resolução 1920x1080 Aplicada'
                          : 'Aplicar 1920 x 1080 (Recomendado)'}
                      </button>
                    </div>

                    {/* Keyboard Layout Card */}
                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200">
                            Idioma e Layout do Teclado
                          </span>
                          <Keyboard className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                          Padrão atual:{' '}
                          {state.idiomaAbnt2
                            ? 'Português (Brasil - ABNT2 com Ç)'
                            : 'Inglês (Estados Unidos - Sem tecla Ç)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExecuteAction('ajustar_idioma_abnt2')}
                        disabled={state.idiomaAbnt2}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                          state.idiomaAbnt2
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                        }`}
                      >
                        {state.idiomaAbnt2
                          ? 'Layout ABNT2 Ativo'
                          : 'Definir Português (Brasil - ABNT2)'}
                      </button>
                    </div>

                    {/* Storage Temp Cleanup Card */}
                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-200">
                            Sensor de Armazenamento e Arquivos Temporários
                          </span>
                          <HardDrive className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                          {state.arquivosTemporariosLimpos
                            ? 'Cache temporário limpo (0 MB de resíduos).'
                            : '34,8 GB de arquivos temporários e logs antigos ocupando o Disco C:.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExecuteAction('limpar_arquivos_temporarios')}
                        disabled={state.arquivosTemporariosLimpos}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                          state.arquivosTemporariosLimpos
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        {state.arquivosTemporariosLimpos
                          ? 'Arquivos Temporários Limpos'
                          : 'Limpar Arquivos Temporários e Cache'}
                      </button>
                    </div>
                  </div>
                )}

                {activeApp === 'rede' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Wireless & Airplane Controls */}
                      <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">
                            Adaptador Sem Fio (Wi-Fi) e Modo Avião
                          </span>
                          {state.wifiAtivo && state.modoAviaoDesativado ? (
                            <Wifi className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-rose-400" />
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => onExecuteAction('desativar_modo_aviao')}
                            disabled={state.modoAviaoDesativado}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                              state.modoAviaoDesativado
                                ? 'bg-slate-800 text-slate-500 cursor-default'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            }`}
                          >
                            <span>
                              {state.modoAviaoDesativado
                                ? 'Modo Avião: Desligado'
                                : 'Desativar Modo Avião'}
                            </span>
                            <Plane className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onExecuteAction('ativar_wifi')}
                            disabled={state.wifiAtivo}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                              state.wifiAtivo
                                ? 'bg-slate-800 text-slate-500 cursor-default'
                                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                            }`}
                          >
                            <span>
                              {state.wifiAtivo ? 'Wi-Fi: Ativado' : 'Ativar Adaptador Wi-Fi'}
                            </span>
                            <Wifi className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Password authentication box */}
                        {!state.senhaWifiAutenticada && (
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2">
                            <label className="block text-[11px] text-slate-300">
                              Senha Corporativa (Etiqueta TI: <strong className="text-sky-400">TI@Over2026</strong>):
                              <input
                                type="text"
                                value={wifiPasswordInput}
                                onChange={(e) => setWifiPasswordInput(e.target.value)}
                                className="mt-1 w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono-tabular"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => onExecuteAction('autenticar_senha_wifi')}
                              className="w-full px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              Validar Senha WPA3
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => onExecuteAction('conectar_wifi_corp')}
                          disabled={state.wifiCorpConectado}
                          className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            state.wifiCorpConectado
                              ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 cursor-default'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {state.wifiCorpConectado
                            ? 'Conectado em OVERCLOCK_CORP_5G'
                            : 'Conectar na Rede OVERCLOCK_CORP_5G'}
                        </button>
                      </div>

                      {/* IP / DHCP & DNS Configuration */}
                      <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-200 block">
                            Parâmetros IPv4 e Servidor DNS
                          </span>
                          <div className="p-3 rounded-lg bg-slate-900/90 text-xs space-y-1.5 font-mono-tabular">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Endereçamento IP:</span>
                              <span className={state.dhcpAtivo ? 'text-emerald-400' : 'text-rose-400'}>
                                {state.dhcpAtivo ? 'Automático (DHCP)' : '192.168.1.99 (Conflito!)'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Servidor DNS:</span>
                              <span className={state.dnsCorreto ? 'text-emerald-400' : 'text-rose-400'}>
                                {state.dnsCorreto ? '8.8.8.8 (Ativo)' : '0.0.0.0 (Inválido)'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Cabo Físico RJ45:</span>
                              <span className={state.caboRedeConectado ? 'text-emerald-400' : 'text-amber-400'}>
                                {state.caboRedeConectado ? 'Conectado' : 'Desconectado (Ver Hardware)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => onExecuteAction('ativar_dhcp_ip')}
                            disabled={state.dhcpAtivo}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                              state.dhcpAtivo
                                ? 'bg-slate-800 text-slate-500 cursor-default'
                                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                            }`}
                          >
                            {state.dhcpAtivo ? 'IP em Modo DHCP' : 'Ativar IP Automático (DHCP)'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onExecuteAction('corrigir_dns')}
                            disabled={state.dnsCorreto}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                              state.dnsCorreto
                                ? 'bg-slate-800 text-slate-500 cursor-default'
                                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                            }`}
                          >
                            {state.dnsCorreto ? 'DNS Padrão Restaurado' : 'Restaurar DNS Automático (8.8.8.8)'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === 'seguranca' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {state.antivirusAtivo && state.ameacasEmQuarentena ? (
                          <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-8 h-8 text-rose-400" />
                        )}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">
                            OverShield Endpoint Security
                          </h3>
                          <p className="text-xs text-slate-400">
                            Proteção em Tempo Real:{' '}
                            <strong className={state.antivirusAtivo ? 'text-emerald-400' : 'text-rose-400'}>
                              {state.antivirusAtivo ? 'ATIVADA' : 'DESATIVADA'}
                            </strong>{' '}
                            · Status de Ameaças:{' '}
                            <strong className={state.ameacasEmQuarentena ? 'text-emerald-400' : 'text-amber-400'}>
                              {state.ameacasEmQuarentena ? 'Nenhuma ameaça ativa' : 'Adware detectado!'}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onExecuteAction('ativar_antivirus')}
                          disabled={state.antivirusAtivo}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                            state.antivirusAtivo
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                          }`}
                        >
                          {state.antivirusAtivo ? 'Escudo Ativo' : 'Ativar Proteção em Tempo Real'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onExecuteAction('executar_varredura_quarentena')}
                          disabled={state.ameacasEmQuarentena}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                            state.ameacasEmQuarentena
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {state.ameacasEmQuarentena
                            ? 'Sistema Limpo'
                            : 'Verificar e Mover para Quarentena'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === 'dispositivos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block mb-1">
                          Gerenciador de Dispositivos (Drivers)
                        </span>
                        <p className="text-xs text-slate-400">
                          {state.driverAtualizado
                            ? 'Todos os controladores de Áudio, Vídeo e USB estão funcionando corretamente.'
                            : 'Alerta (!): Controlador de Hardware com driver corrompido ou ausente.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExecuteAction('atualizar_driver_dispositivo')}
                        disabled={state.driverAtualizado}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                          state.driverAtualizado
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {state.driverAtualizado ? 'Drivers Atualizados' : 'Atualizar / Reinstalar Driver'}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block mb-1">
                          Central de Programas Corporativos
                        </span>
                        <p className="text-xs text-slate-400">
                          {state.aplicativoCorporativoIntegro
                            ? 'Suíte ERP / Folha / Analisador operando normalmente.'
                            : 'O aplicativo principal do setor não abre devido a sessão presa em cache.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onExecuteAction('reparar_aplicativo_corporativo')}
                        disabled={state.aplicativoCorporativoIntegro}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                          state.aplicativoCorporativoIntegro
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        <Wrench className="w-4 h-4" />
                        {state.aplicativoCorporativoIntegro
                          ? 'Aplicativo Íntegro'
                          : 'Reparar / Reiniciar Aplicativo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional Start Menu Popover */}
          {startMenuOpen && (
            <div className="absolute bottom-3 left-3 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-3 z-20">
              <div className="text-xs font-semibold text-slate-400 px-2 py-1 border-b border-slate-800 mb-2">
                Menu Iniciar — OverOS
              </div>
              {apps.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setActiveApp(a.id);
                    setStartMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  {a.icon}
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Taskbar */}
        <div className="h-11 bg-[#090d16] border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStartMenuOpen((prev) => !prev)}
              className="px-3 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold cursor-pointer"
            >
              Iniciar
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {apps.find((a) => a.id === activeApp)?.label}
            </span>
          </div>

          {/* System Tray Status Icons */}
          <div className="flex items-center gap-4 text-xs text-slate-300 font-mono-tabular">
            <button
              type="button"
              onClick={() => setActiveApp('configuracoes')}
              className="hover:text-white cursor-pointer"
              title="Layout do Teclado"
            >
              {state.idiomaAbnt2 ? 'POR ABNT2' : 'ENG US'}
            </button>
            <button
              type="button"
              onClick={() => setActiveApp('seguranca')}
              className="hover:text-white cursor-pointer flex items-center gap-1"
              title="Antivírus"
            >
              <Shield className={`w-3.5 h-3.5 ${state.antivirusAtivo ? 'text-emerald-400' : 'text-rose-400'}`} />
            </button>
            <button
              type="button"
              onClick={() => setActiveApp('rede')}
              className="hover:text-white cursor-pointer flex items-center gap-1"
              title="Status de Rede"
            >
              <Wifi className={`w-3.5 h-3.5 ${state.wifiCorpConectado && state.dnsCorreto ? 'text-emerald-400' : 'text-amber-400'}`} />
            </button>
            <button
              type="button"
              onClick={() => setActiveApp('configuracoes')}
              className="hover:text-white cursor-pointer flex items-center gap-1"
              title="Volume"
            >
              {state.audioAtivo ? (
                <Volume2 className="w-3.5 h-3.5 text-slate-200" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              )}
            </button>
            <span>09:42</span>
          </div>
        </div>
      </div>
    </div>
  );
};
