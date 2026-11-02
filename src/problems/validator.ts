import problemsRaw from '../data/problems.json';
import sectorsRaw from '../data/sectors.json';
import npcsRaw from '../data/npcs.json';

export type DifficultyLevel = 'facil' | 'normal' | 'dificil';
export type ProblemCategory = 'Hardware' | 'Software' | 'Redes' | 'Pegadinha';

export type DiagnosticAction =
  | 'conectar_tomada'
  | 'ligar_chave_fonte'
  | 'ligar_gabinete'
  | 'ligar_monitor'
  | 'conectar_hdmi'
  | 'conectar_teclado_usb'
  | 'conectar_mouse_usb'
  | 'conectar_cabo_rede'
  | 'abrir_gabinete'
  | 'limpar_ventoinha'
  | 'reencaixar_ram'
  | 'remover_papel_atolado'
  | 'repor_papel_impressora'
  | 'encerrar_processo_pesado'
  | 'desativar_apps_inicializacao'
  | 'esvaziar_lixeira'
  | 'restaurar_arquivo_lixeira'
  | 'limpar_arquivos_temporarios'
  | 'ativar_audio_sistema'
  | 'selecionar_saida_audio_correta'
  | 'ajustar_resolucao_nativa'
  | 'ajustar_idioma_abnt2'
  | 'ativar_antivirus'
  | 'executar_varredura_quarentena'
  | 'atualizar_driver_dispositivo'
  | 'reparar_aplicativo_corporativo'
  | 'desativar_modo_aviao'
  | 'ativar_wifi'
  | 'autenticar_senha_wifi'
  | 'conectar_wifi_corp'
  | 'ativar_dhcp_ip'
  | 'corrigir_dns';

export interface ProblemData {
  id: string;
  categoria: ProblemCategory;
  dificuldade: DifficultyLevel;
  setor: string;
  npc: string;
  descricaoCurta: string;
  falaNpc: string;
  agradecimentoNpc: string;
  sintomas: string;
  causa: string;
  etapas: string[];
  acoesRequeridas: DiagnosticAction[];
  criterioConclusao: string;
  feedbackEducativo: string;
  consequenciaErro: string;
}

export interface SectorBounds {
  x: number;
  z: number;
  w: number;
  d: number;
}

export interface SectorData {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  bounds: SectorBounds;
  door: { x: number; z: number; orientation: 'north' | 'south' | 'east' | 'west' };
  pcPos: { x: number; z: number; rotY: number };
  hasPrinter: boolean;
  printerPos?: { x: number; z: number };
  propType: string;
}

export interface NpcWaypoint {
  x: number;
  z: number;
  acao: 'pc' | 'cafe' | 'celular' | 'alongar';
}

export interface NpcData {
  id: string;
  nome: string;
  cargo: string;
  setor: string;
  altura: number;
  corCamisa: string;
  corCalca: string;
  corCabelo: string;
  tomPele: string;
  estiloCabelo: string;
  oculos: boolean;
  waypoints: NpcWaypoint[];
}

export interface WorkstationState {
  // Hardware
  tomadaConectada: boolean;
  chaveFonteLigada: boolean;
  gabineteLigado: boolean;
  monitorLigado: boolean;
  hdmiConectado: boolean;
  tecladoUsbConectado: boolean;
  mouseUsbConectado: boolean;
  caboRedeConectado: boolean;
  gabineteAberto: boolean;
  ventoinhaLimpa: boolean;
  ramEncaixada: boolean;
  impressoraSemAtolamento: boolean;
  impressoraComPapel: boolean;
  // Virtual OS & Network
  processoPesadoAtivo: boolean;
  appsInicializacaoOtimizados: boolean;
  lixeiraCheia: boolean;
  arquivoImportanteNaLixeira: boolean;
  arquivosTemporariosLimpos: boolean;
  audioAtivo: boolean;
  saidaAudioCorreta: boolean;
  resolucaoNativa: boolean;
  idiomaAbnt2: boolean;
  antivirusAtivo: boolean;
  ameacasEmQuarentena: boolean;
  driverAtualizado: boolean;
  aplicativoCorporativoIntegro: boolean;
  modoAviaoDesativado: boolean;
  wifiAtivo: boolean;
  senhaWifiAutenticada: boolean;
  wifiCorpConectado: boolean;
  dhcpAtivo: boolean;
  dnsCorreto: boolean;
  // Progress tracking
  completedActions: DiagnosticAction[];
  errorCount: number;
}

export const ALL_PROBLEMS: ProblemData[] = problemsRaw as ProblemData[];
export const ALL_SECTORS: SectorData[] = sectorsRaw as SectorData[];
export const ALL_NPCS: NpcData[] = npcsRaw as NpcData[];

export function getProblemsPool(difficulty: DifficultyLevel): ProblemData[] {
  if (difficulty === 'facil') {
    return ALL_PROBLEMS.filter((p) => p.dificuldade === 'facil');
  }
  if (difficulty === 'normal') {
    return ALL_PROBLEMS.filter((p) => p.dificuldade === 'facil' || p.dificuldade === 'normal');
  }
  // dificil includes normal and dificil problems so the pool remains broad and varied
  return ALL_PROBLEMS.filter((p) => p.dificuldade === 'normal' || p.dificuldade === 'dificil');
}

export function pickNextProblem(
  difficulty: DifficultyLevel,
  lastProblemId: string | null,
  recentProblemIds: string[] = [],
  deterministicIndex?: number
): ProblemData {
  const pool = getProblemsPool(difficulty);
  const candidates = pool.filter(
    (p) => p.id !== lastProblemId && !recentProblemIds.includes(p.id)
  );
  const effectivePool = candidates.length > 0 ? candidates : pool.filter((p) => p.id !== lastProblemId);
  const finalPool = effectivePool.length > 0 ? effectivePool : pool;

  if (typeof deterministicIndex === 'number') {
    return finalPool[Math.abs(deterministicIndex) % finalPool.length];
  }
  const idx = Math.floor(Math.random() * finalPool.length);
  return finalPool[idx];
}

export function createInitialWorkstationState(problem: ProblemData): WorkstationState {
  const req = new Set<DiagnosticAction>(problem.acoesRequeridas);

  const tomadaConectada = !req.has('conectar_tomada');
  const chaveFonteLigada = !req.has('ligar_chave_fonte');
  const gabineteLigado = !req.has('ligar_gabinete') && tomadaConectada && chaveFonteLigada;
  const monitorLigado = !req.has('ligar_monitor');

  return {
    tomadaConectada,
    chaveFonteLigada,
    gabineteLigado,
    monitorLigado,
    hdmiConectado: !req.has('conectar_hdmi'),
    tecladoUsbConectado: !req.has('conectar_teclado_usb'),
    mouseUsbConectado: !req.has('conectar_mouse_usb'),
    caboRedeConectado: !req.has('conectar_cabo_rede'),
    gabineteAberto: false,
    ventoinhaLimpa: !req.has('limpar_ventoinha'),
    ramEncaixada: !req.has('reencaixar_ram'),
    impressoraSemAtolamento: !req.has('remover_papel_atolado'),
    impressoraComPapel: !req.has('repor_papel_impressora'),

    processoPesadoAtivo: req.has('encerrar_processo_pesado'),
    appsInicializacaoOtimizados: !req.has('desativar_apps_inicializacao'),
    lixeiraCheia: req.has('esvaziar_lixeira'),
    arquivoImportanteNaLixeira: req.has('restaurar_arquivo_lixeira'),
    arquivosTemporariosLimpos: !req.has('limpar_arquivos_temporarios'),
    audioAtivo: !req.has('ativar_audio_sistema'),
    saidaAudioCorreta: !req.has('selecionar_saida_audio_correta'),
    resolucaoNativa: !req.has('ajustar_resolucao_nativa'),
    idiomaAbnt2: !req.has('ajustar_idioma_abnt2'),
    antivirusAtivo: !req.has('ativar_antivirus'),
    ameacasEmQuarentena: !req.has('executar_varredura_quarentena'),
    driverAtualizado: !req.has('atualizar_driver_dispositivo'),
    aplicativoCorporativoIntegro: !req.has('reparar_aplicativo_corporativo'),
    modoAviaoDesativado: !req.has('desativar_modo_aviao'),
    wifiAtivo: !req.has('ativar_wifi'),
    senhaWifiAutenticada: !req.has('autenticar_senha_wifi'),
    wifiCorpConectado: !req.has('conectar_wifi_corp'),
    dhcpAtivo: !req.has('ativar_dhcp_ip'),
    dnsCorreto: !req.has('corrigir_dns'),

    completedActions: [],
    errorCount: 0,
  };
}

export function canBootVirtualOS(state: WorkstationState): {
  canBoot: boolean;
  reason?: string;
} {
  if (!state.tomadaConectada) {
    return { canBoot: false, reason: 'O computador está fora da tomada. Verifique a Inspeção Física.' };
  }
  if (!state.chaveFonteLigada) {
    return { canBoot: false, reason: 'A chave traseira da fonte está desligada (posição O).' };
  }
  if (!state.gabineteLigado) {
    return { canBoot: false, reason: 'O gabinete está desligado. Pressione o botão Power na Inspeção Física.' };
  }
  if (!state.monitorLigado) {
    return { canBoot: false, reason: 'O monitor está desligado no botão Power.' };
  }
  if (!state.hdmiConectado) {
    return { canBoot: false, reason: 'O monitor exibe "Sem Sinal HDMI". Verifique o cabo de vídeo.' };
  }
  if (!state.ramEncaixada) {
    return { canBoot: false, reason: 'O gabinete está emitindo bipes de memória RAM e não inicia o vídeo.' };
  }
  return { canBoot: true };
}

export interface ActionApplicationResult {
  nextState: WorkstationState;
  success: boolean;
  message: string;
  isResolved: boolean;
}

export function applyDiagnosticAction(
  state: WorkstationState,
  problem: ProblemData,
  action: DiagnosticAction
): ActionApplicationResult {
  const next: WorkstationState = {
    ...state,
    completedActions: [...state.completedActions],
  };

  const isRequired = problem.acoesRequeridas.includes(action);

  // Prerequisite guards
  if (action === 'ligar_gabinete') {
    if (!next.tomadaConectada) {
      next.errorCount += 1;
      return {
        nextState: next,
        success: false,
        message: 'Nada acontece! O cabo de força ainda está fora da tomada.',
        isResolved: false,
      };
    }
    if (!next.chaveFonteLigada) {
      next.errorCount += 1;
      return {
        nextState: next,
        success: false,
        message: 'A chave traseira da fonte ATX ainda está na posição "O" (Desligado).',
        isResolved: false,
      };
    }
  }

  if ((action === 'limpar_ventoinha' || action === 'reencaixar_ram') && !next.gabineteAberto) {
    next.errorCount += 1;
    return {
      nextState: next,
      success: false,
      message: 'Abra primeiro a tampa lateral do gabinete para acessar os componentes internos.',
      isResolved: false,
    };
  }

  if (action === 'repor_papel_impressora' && !next.impressoraSemAtolamento) {
    next.errorCount += 1;
    return {
      nextState: next,
      success: false,
      message: 'Remova primeiro a folha atolada nos roletes antes de abastecer a bandeja!',
      isResolved: false,
    };
  }

  if (action === 'esvaziar_lixeira' && next.arquivoImportanteNaLixeira) {
    next.errorCount += 1;
    return {
      nextState: next,
      success: false,
      message: 'Cuidado! Há um documento importante do funcionário na Lixeira. Restaure-o antes de esvaziar!',
      isResolved: false,
    };
  }

  if (action === 'conectar_wifi_corp') {
    if (!next.modoAviaoDesativado) {
      next.errorCount += 1;
      return {
        nextState: next,
        success: false,
        message: 'Desative o Modo Avião antes de conectar a uma rede Wi-Fi.',
        isResolved: false,
      };
    }
    if (!next.wifiAtivo) {
      next.errorCount += 1;
      return {
        nextState: next,
        success: false,
        message: 'Ative o interruptor do Wi-Fi antes de selecionar a rede.',
        isResolved: false,
      };
    }
    if (!next.senhaWifiAutenticada) {
      next.errorCount += 1;
      return {
        nextState: next,
        success: false,
        message: 'Insira e valide a senha corporativa da rede antes de conectar.',
        isResolved: false,
      };
    }
  }

  // If action is not required by this problem (and not opening the case which is an inspection step)
  if (!isRequired && action !== 'abrir_gabinete') {
    next.errorCount += 1;
    return {
      nextState: next,
      success: false,
      message: problem.consequenciaErro,
      isResolved: false,
    };
  }

  // Apply valid state transitions
  let feedback = 'Etapa executada com sucesso.';
  switch (action) {
    case 'conectar_tomada':
      next.tomadaConectada = true;
      feedback = 'Cabo de força conectado firmemente à tomada.';
      break;
    case 'ligar_chave_fonte':
      next.chaveFonteLigada = true;
      feedback = 'Chave traseira da fonte alterada para a posição "I" (Energizado).';
      break;
    case 'ligar_gabinete':
      next.gabineteLigado = true;
      feedback = 'Gabinete ligado! Os LEDs e ventoinhas iniciaram.';
      break;
    case 'ligar_monitor':
      next.monitorLigado = true;
      feedback = 'Monitor ligado pelo botão frontal.';
      break;
    case 'conectar_hdmi':
      next.hdmiConectado = true;
      feedback = 'Cabo HDMI encaixado nas portas do gabinete e do monitor.';
      break;
    case 'conectar_teclado_usb':
      next.tecladoUsbConectado = true;
      feedback = 'Teclado USB conectado. Luz NumLock acesa.';
      break;
    case 'conectar_mouse_usb':
      next.mouseUsbConectado = true;
      feedback = 'Mouse USB conectado. Sensor óptico ativo.';
      break;
    case 'conectar_cabo_rede':
      next.caboRedeConectado = true;
      feedback = 'Cabo de rede RJ45 travado na porta Ethernet (Link 1 Gbps ativo).';
      break;
    case 'abrir_gabinete':
      next.gabineteAberto = true;
      feedback = 'Tampa lateral de vidro temperado aberta para inspeção interna.';
      break;
    case 'limpar_ventoinha':
      next.ventoinhaLimpa = true;
      feedback = 'Poeira removida das pás do cooler. Fluxo de ar e ruído normalizados!';
      break;
    case 'reencaixar_ram':
      next.ramEncaixada = true;
      feedback = 'Pente de memória DDR4 encaixado até o clique das travas laterais.';
      break;
    case 'remover_papel_atolado':
      next.impressoraSemAtolamento = true;
      feedback = 'Folha amassada removida com cuidado dos roletes de tração.';
      break;
    case 'repor_papel_impressora':
      next.impressoraComPapel = true;
      feedback = 'Resma de papel A4 alinhada e abastecida na bandeja.';
      break;
    case 'encerrar_processo_pesado':
      next.processoPesadoAtivo = false;
      feedback = 'Processo travado encerrado! Uso de CPU caiu de 99% para 8%.';
      break;
    case 'desativar_apps_inicializacao':
      next.appsInicializacaoOtimizados = true;
      feedback = 'Programas desnecessários desmarcados da inicialização do sistema.';
      break;
    case 'esvaziar_lixeira':
      next.lixeiraCheia = false;
      feedback = 'Lixeira esvaziada definitivamente. Espaço em disco liberado!';
      break;
    case 'restaurar_arquivo_lixeira':
      next.arquivoImportanteNaLixeira = false;
      feedback = 'Arquivo importante restaurado intacto para a pasta Documentos.';
      break;
    case 'limpar_arquivos_temporarios':
      next.arquivosTemporariosLimpos = true;
      feedback = 'Cache e arquivos temporários removidos com segurança.';
      break;
    case 'ativar_audio_sistema':
      next.audioAtivo = true;
      feedback = 'Modo Silencioso (Mudo) desativado e volume ajustado para 75%.';
      break;
    case 'selecionar_saida_audio_correta':
      next.saidaAudioCorreta = true;
      feedback = 'Saída de som direcionada para Alto-falantes / Headset Corporativo.';
      break;
    case 'ajustar_resolucao_nativa':
      next.resolucaoNativa = true;
      feedback = 'Resolução ajustada para 1920 x 1080 (Nativo Full HD). Imagem nítida!';
      break;
    case 'ajustar_idioma_abnt2':
      next.idiomaAbnt2 = true;
      feedback = 'Layout do teclado alterado para Português (Brasil - ABNT2).';
      break;
    case 'ativar_antivirus':
      next.antivirusAtivo = true;
      feedback = 'Proteção em Tempo Real do OverShield reativada.';
      break;
    case 'executar_varredura_quarentena':
      next.ameacasEmQuarentena = true;
      feedback = 'Varredura concluída: programas indesejados movidos para Quarentena.';
      break;
    case 'atualizar_driver_dispositivo':
      next.driverAtualizado = true;
      feedback = 'Driver reinstalado e certificado. Dispositivo funcionando sem alertas.';
      break;
    case 'reparar_aplicativo_corporativo':
      next.aplicativoCorporativoIntegro = true;
      feedback = 'Cache do aplicativo reparado. O programa voltou a abrir normalmente.';
      break;
    case 'desativar_modo_aviao':
      next.modoAviaoDesativado = true;
      feedback = 'Modo Avião desativado. Antenas sem fio liberadas.';
      break;
    case 'ativar_wifi':
      next.wifiAtivo = true;
      feedback = 'Adaptador Wi-Fi ativado. Redes disponíveis listadas.';
      break;
    case 'autenticar_senha_wifi':
      next.senhaWifiAutenticada = true;
      feedback = 'Credencial corporativa WPA3 validada com sucesso.';
      break;
    case 'conectar_wifi_corp':
      next.wifiCorpConectado = true;
      feedback = 'Conectado à rede corporativa OVERCLOCK_CORP_5G.';
      break;
    case 'ativar_dhcp_ip':
      next.dhcpAtivo = true;
      feedback = 'Configuração IP alterada para Automático (DHCP). Conflito resolvido.';
      break;
    case 'corrigir_dns':
      next.dnsCorreto = true;
      feedback = 'Servidor DNS restaurado (8.8.8.8 / Corporativo). Resolução de nomes ativa!';
      break;
  }

  if (!next.completedActions.includes(action)) {
    next.completedActions.push(action);
  }

  const isResolved = checkProblemResolved(next, problem);
  return {
    nextState: next,
    success: true,
    message: isResolved ? `${feedback} Chamado concluído!` : feedback,
    isResolved,
  };
}

export function checkProblemResolved(state: WorkstationState, problem: ProblemData): boolean {
  return problem.acoesRequeridas.every((reqAction) => state.completedActions.includes(reqAction));
}
