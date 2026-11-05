import { DifficultyLevel, ProblemCategory } from '../problems/validator';

export type PlayerGender = 'masculino' | 'feminino';

export interface PlayerCustomization {
  genero: PlayerGender;
  roupaId: string;
  acessorioId: string;
  corCabelo: string;
  tomPele: string;
}

export interface OutfitItem {
  id: string;
  nome: string;
  descricao: string;
  corCamisa: string;
  corSecundaria: string;
  corCalca: string;
  estilo:
    | 'padrao'
    | 'hoodie'
    | 'blazer'
    | 'cyber'
    | 'sueter'
    | 'jaleco'
    | 'tropical'
    | 'overclocked';
  pontosNecessarios: number;
}

export type AccessoryCategory = 'oculos' | 'fones' | 'bones' | 'chapeus' | 'extras';

export interface AccessoryItem {
  id: string;
  nome: string;
  categoria: AccessoryCategory;
  descricao: string;
  corPrincipal: string;
  corDetalhe: string;
  pontosNecessarios: number;
}

export interface MedalDefinition {
  id: string;
  titulo: string;
  descricao: string;
  icone: 'award' | 'cpu' | 'laptop' | 'wifi' | 'sparkles' | 'zap' | 'Flame' | 'crown';
  cor: string;
  pontosRecompensa: number;
}

export const ALL_OUTFITS: OutfitItem[] = [
  {
    id: 'uniforme_ti',
    nome: 'Uniforme Clássico TI',
    descricao: 'Camisa polo azul técnica e calça executiva escura.',
    corCamisa: '#0284c7',
    corSecundaria: '#38bdf8',
    corCalca: '#0f172a',
    estilo: 'padrao',
    pontosNecessarios: 0,
  },
  {
    id: 'casual_hoodie',
    nome: 'Moletom Startup',
    descricao: 'Moletom confortável com capuz e calça jeans escura.',
    corCamisa: '#475569',
    corSecundaria: '#38bdf8',
    corCalca: '#1e293b',
    estilo: 'hoodie',
    pontosNecessarios: 80,
  },
  {
    id: 'camiseta_geek',
    nome: 'Camiseta Minimalista Dev',
    descricao: 'Camiseta preta fosca de algodão egípcio com gola ciano.',
    corCamisa: '#18181b',
    corSecundaria: '#22d3ee',
    corCalca: '#334155',
    estilo: 'padrao',
    pontosNecessarios: 100,
  },
  {
    id: 'executivo_blazer',
    nome: 'Blazer Executivo Sênior',
    descricao: 'Blazer azul-marinho sobre camisa social branca.',
    corCamisa: '#1e1b4b',
    corSecundaria: '#f8fafc',
    corCalca: '#0f172a',
    estilo: 'blazer',
    pontosNecessarios: 200,
  },
  {
    id: 'polo_esmeralda',
    nome: 'Polo Técnica Esmeralda',
    descricao: 'Camisa verde esmeralda respirável com calça chino bege.',
    corCamisa: '#059669',
    corSecundaria: '#a7f3d0',
    corCalca: '#d6d3d1',
    estilo: 'sueter',
    pontosNecessarios: 300,
  },
  {
    id: 'jaqueta_cyber',
    nome: 'Jaqueta Cyberpunk Neon',
    descricao: 'Jaqueta preta fosca com detalhes luminosos em ciano.',
    corCamisa: '#111827',
    corSecundaria: '#06b6d4',
    corCalca: '#1f2937',
    estilo: 'cyber',
    pontosNecessarios: 400,
  },
  {
    id: 'sueter_outono',
    nome: 'Tricô Terracota Outono',
    descricao: 'Suéter aconchegante terracota para dias de manutenção intensa.',
    corCamisa: '#c2410c',
    corSecundaria: '#fed7aa',
    corCalca: '#1e293b',
    estilo: 'sueter',
    pontosNecessarios: 500,
  },
  {
    id: 'jaleco_lab',
    nome: 'Jaleco Engenheiro de Lab',
    descricao: 'Jaleco branco de laboratório sobre camisa grafite.',
    corCamisa: '#f1f5f9',
    corSecundaria: '#0284c7',
    corCalca: '#334155',
    estilo: 'jaleco',
    pontosNecessarios: 600,
  },
  {
    id: 'jaqueta_couro',
    nome: 'Jaqueta Rock & Code',
    descricao: 'Jaqueta de couro vinho escuro com lapelas contrastantes.',
    corCamisa: '#4c0519',
    corSecundaria: '#f43f5e',
    corCalca: '#090d16',
    estilo: 'blazer',
    pontosNecessarios: 700,
  },
  {
    id: 'colete_infra',
    nome: 'Colete Tático de Infra',
    descricao: 'Colete cheio de bolsos para alicates de crimpagem e testadores.',
    corCamisa: '#3f6212',
    corSecundaria: '#bef264',
    corCalca: '#1c1917',
    estilo: 'hoodie',
    pontosNecessarios: 800,
  },
  {
    id: 'camisa_tropical',
    nome: 'Camisa Casual de Sexta',
    descricao: 'Camisa vibrante coral com detalhes solares e calça clara.',
    corCamisa: '#f43f5e',
    corSecundaria: '#fbbf24',
    corCalca: '#cbd5e1',
    estilo: 'tropical',
    pontosNecessarios: 950,
  },
  {
    id: 'terno_grafite',
    nome: 'Terno Slim Diretoria',
    descricao: 'Corte italiano grafite impecável com camisa azul-gelo.',
    corCamisa: '#334155',
    corSecundaria: '#bae6fd',
    corCalca: '#1e293b',
    estilo: 'blazer',
    pontosNecessarios: 1100,
  },
  {
    id: 'moletom_vaporwave',
    nome: 'Moletom Retrô Vaporwave',
    descricao: 'Combinação neon roxo e magenta inspirada nos anos 80.',
    corCamisa: '#6b21a8',
    corSecundaria: '#f472b6',
    corCalca: '#1e1b4b',
    estilo: 'cyber',
    pontosNecessarios: 1250,
  },
  {
    id: 'kimono_tech',
    nome: 'Casaco Techwear Urbano',
    descricao: 'Casaco longo impermeável com faixas refletivas.',
    corCamisa: '#0f172a',
    corSecundaria: '#10b981',
    corCalca: '#090d16',
    estilo: 'jaleco',
    pontosNecessarios: 1400,
  },
  {
    id: 'smoking_gala',
    nome: 'Smoking Gala Tech Awards',
    descricao: 'Traje de gala preto e branco para noite de premiação.',
    corCamisa: '#090d16',
    corSecundaria: '#ffffff',
    corCalca: '#090d16',
    estilo: 'blazer',
    pontosNecessarios: 1600,
  },
  {
    id: 'traje_overclocked',
    nome: 'Traje Lendário Overclocked',
    descricao: 'Traje supremo preto e dourado exclusivo de quem domina a TI.',
    corCamisa: '#090d16',
    corSecundaria: '#f59e0b',
    corCalca: '#18181b',
    estilo: 'overclocked',
    pontosNecessarios: 1800,
  },
];

export const ALL_ACCESSORIES: AccessoryItem[] = [
  // ÓCULOS
  {
    id: 'cracha',
    nome: 'Crachá Corporativo LED',
    categoria: 'extras',
    descricao: 'Identificação oficial do Analista de Suporte no peito.',
    corPrincipal: '#38bdf8',
    corDetalhe: '#0284c7',
    pontosNecessarios: 0,
  },
  {
    id: 'oculos_smart',
    nome: 'Óculos Tech Armação Fina',
    categoria: 'oculos',
    descricao: 'Armação leve com filtro de luz azul para longos turnos.',
    corPrincipal: '#38bdf8',
    corDetalhe: '#0f172a',
    pontosNecessarios: 0,
  },
  {
    id: 'oculos_sol_aviador',
    nome: 'Óculos Escuros Aviador',
    categoria: 'oculos',
    descricao: 'Armação dourada clássica com lentes escuras polarizadas.',
    corPrincipal: '#fbbf24',
    corDetalhe: '#090d16',
    pontosNecessarios: 120,
  },
  {
    id: 'oculos_pixel_retro',
    nome: 'Óculos Retrô 8-Bit Deal With It',
    categoria: 'oculos',
    descricao: 'Óculos pixelados pretos para comemorar chamados difíceis.',
    corPrincipal: '#111827',
    corDetalhe: '#f8fafc',
    pontosNecessarios: 260,
  },
  {
    id: 'oculos_ar_visor',
    nome: 'Visor Holográfico Cyber AR',
    categoria: 'oculos',
    descricao: 'Lente contínua neon ciano de realidade aumentada.',
    corPrincipal: '#06b6d4',
    corDetalhe: '#ec4899',
    pontosNecessarios: 640,
  },

  // FONES & HEADSETS
  {
    id: 'headset_pro',
    nome: 'Headset Suporte Pro Azul',
    categoria: 'fones',
    descricao: 'Fone circumaural azul com microfone dedicado para atendimento.',
    corPrincipal: '#0ea5e9',
    corDetalhe: '#0284c7',
    pontosNecessarios: 150,
  },
  {
    id: 'fone_estudio_branco',
    nome: 'Headphone Estúdio Minimalista',
    categoria: 'fones',
    descricao: 'Fone acústico branco pérola com isolamento de ruído.',
    corPrincipal: '#f8fafc',
    corDetalhe: '#94a3b8',
    pontosNecessarios: 320,
  },
  {
    id: 'headset_rgb_gamer',
    nome: 'Headset Gamer RGB Neon',
    categoria: 'fones',
    descricao: 'Headset preto fosco com iluminação lateral magenta e ciano.',
    corPrincipal: '#ec4899',
    corDetalhe: '#06b6d4',
    pontosNecessarios: 520,
  },
  {
    id: 'headset_gatinho',
    nome: 'Headset Streamer Orelhas Neon',
    categoria: 'fones',
    descricao: 'Headset estilizado com orelhinhas luminosas no arco superior.',
    corPrincipal: '#f472b6',
    corDetalhe: '#a855f7',
    pontosNecessarios: 780,
  },

  // BONÉS
  {
    id: 'bone_tech',
    nome: 'Boné Aba Curva Azul TI',
    categoria: 'bones',
    descricao: 'Boné esportivo azul-ciano com emblema do setor de suporte.',
    corPrincipal: '#0284c7',
    corDetalhe: '#38bdf8',
    pontosNecessarios: 180,
  },
  {
    id: 'bone_aba_reta_preto',
    nome: 'Boné Snapback Preto & Ouro',
    categoria: 'bones',
    descricao: 'Boné urbano de aba reta preto com detalhe dourado.',
    corPrincipal: '#18181b',
    corDetalhe: '#f59e0b',
    pontosNecessarios: 380,
  },
  {
    id: 'bone_para_tras',
    nome: 'Boné Virado para Trás',
    categoria: 'bones',
    descricao: 'Boné vermelho esportivo usado com a aba voltada para trás.',
    corPrincipal: '#e11d48',
    corDetalhe: '#fda4af',
    pontosNecessarios: 480,
  },

  // CHAPÉUS & GORROS
  {
    id: 'gorro_beanie',
    nome: 'Gorro de Lã Inverno (Beanie)',
    categoria: 'chapeus',
    descricao: 'Gorro de malha confortável perfeito para salas de servidores frias.',
    corPrincipal: '#e11d48',
    corDetalhe: '#fda4af',
    pontosNecessarios: 280,
  },
  {
    id: 'chapeu_fedora',
    nome: 'Chapéu Fedora Detetive de Redes',
    categoria: 'chapeus',
    descricao: 'Chapéu clássico marrom café com fita acetinada preta.',
    corPrincipal: '#78350f',
    corDetalhe: '#1e293b',
    pontosNecessarios: 560,
  },
  {
    id: 'chapeu_bucket',
    nome: 'Bucket Hat Streetwear',
    categoria: 'chapeus',
    descricao: 'Chapéu estilo pescador urbano em tecido esmeralda.',
    corPrincipal: '#10b981',
    corDetalhe: '#ecfdf5',
    pontosNecessarios: 680,
  },
  {
    id: 'chapeu_palha',
    nome: 'Chapéu de Palha Verão',
    categoria: 'chapeus',
    descricao: 'Chapéu de palha dourada com faixa vermelha descontraída.',
    corPrincipal: '#fcd34d',
    corDetalhe: '#ef4444',
    pontosNecessarios: 820,
  },
  {
    id: 'capacete_obra_ti',
    nome: 'Capacete Engenheiro de Infra',
    categoria: 'chapeus',
    descricao: 'Capacete de segurança amarelo para reformas de cabeamento.',
    corPrincipal: '#eab308',
    corDetalhe: '#fef08a',
    pontosNecessarios: 950,
  },
  {
    id: 'cartola_mago_ti',
    nome: 'Cartola "Mago do Suporte"',
    categoria: 'chapeus',
    descricao: 'Cartola alta preta com faixa dourada para quem faz milagres na TI.',
    corPrincipal: '#111827',
    corDetalhe: '#f59e0b',
    pontosNecessarios: 1200,
  },

  // EXTRAS
  {
    id: 'copo_cafe',
    nome: 'Copo Térmico de Café Expresso',
    categoria: 'extras',
    descricao: 'Combustível indispensável segurado na mão durante o turno.',
    corPrincipal: '#f8fafc',
    corDetalhe: '#b45309',
    pontosNecessarios: 220,
  },
  {
    id: 'mochila_dev',
    nome: 'Mochila Executiva Notebook',
    categoria: 'extras',
    descricao: 'Mochila impermeável nas costas repleta de cabos e ferramentas.',
    corPrincipal: '#1e293b',
    corDetalhe: '#38bdf8',
    pontosNecessarios: 440,
  },
  {
    id: 'coroa_holo',
    nome: 'Coroa Holográfica Overclocked',
    categoria: 'extras',
    descricao: 'Insígnia flutuante dourada para quem zerou os desafios do escritório.',
    corPrincipal: '#fbbf24',
    corDetalhe: '#38bdf8',
    pontosNecessarios: 1500,
  },
];

export const HAIR_COLORS = [
  { id: '#1e293b', nome: 'Preto Grafite' },
  { id: '#78350f', nome: 'Castanho Escuro' },
  { id: '#b45309', nome: 'Castanho Dourado' },
  { id: '#eab308', nome: 'Loiro Claro' },
  { id: '#b91c1c', nome: 'Ruivo Acobreado' },
  { id: '#06b6d4', nome: 'Ciano Neon' },
];

export const SKIN_TONES = [
  { id: '#fde68a', nome: 'Tom 1' },
  { id: '#f1c27d', nome: 'Tom 2' },
  { id: '#e0ac69', nome: 'Tom 3' },
  { id: '#c68642', nome: 'Tom 4' },
  { id: '#8d5524', nome: 'Tom 5' },
  { id: '#5c3818', nome: 'Tom 6' },
];

export const ALL_MEDALS: MedalDefinition[] = [
  {
    id: 'primeiro_chamado',
    titulo: 'Primeiro Atendimento',
    descricao: 'Concluiu com sucesso o seu primeiro chamado técnico no escritório.',
    icone: 'award',
    cor: '#38bdf8',
    pontosRecompensa: 50,
  },
  {
    id: 'especialista_hardware',
    titulo: 'Mãos no Gabinete',
    descricao: 'Resolveu problemas físicos de cabos, energia, monitores ou peças.',
    icone: 'cpu',
    cor: '#f59e0b',
    pontosRecompensa: 60,
  },
  {
    id: 'mestre_overos',
    titulo: 'Especialista OverOS',
    descricao: 'Solucionou problemas de sistema operacional, armazenamento ou apps.',
    icone: 'laptop',
    cor: '#10b981',
    pontosRecompensa: 60,
  },
  {
    id: 'guardiao_rede',
    titulo: 'Guardião da Rede',
    descricao: 'Restaurou conexões Wi-Fi, cabos de rede ou servidores DNS.',
    icone: 'wifi',
    cor: '#6366f1',
    pontosRecompensa: 60,
  },
  {
    id: 'olho_clinico',
    titulo: 'Olho Clínico (Zero Erros)',
    descricao: 'Resolveu um chamado ou pegadinha de primeira, sem ações incorretas.',
    icone: 'sparkles',
    cor: '#ec4899',
    pontosRecompensa: 80,
  },
  {
    id: 'veterano_500',
    titulo: 'Analista Pleno (500+ pts)',
    descricao: 'Acumulou pelo menos 500 pontos de carreira em atendimentos.',
    icone: 'zap',
    cor: '#14b8a6',
    pontosRecompensa: 100,
  },
  {
    id: 'heroi_pico',
    titulo: 'Sobrevivente do Horário de Pico',
    descricao: 'Resolveu chamados sob pressão durante o Horário de Pico.',
    icone: 'Flame',
    cor: '#f97316',
    pontosRecompensa: 120,
  },
  {
    id: 'lenda_overclocked',
    titulo: 'Jogo Zerado: Lenda Overclocked',
    descricao: 'Conquistou a carreira completa (1.500+ pts ou 15 chamados) e liberou todo o guarda-roupa!',
    icone: 'crown',
    cor: '#eab308',
    pontosRecompensa: 200,
  },
];

export const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  genero: 'masculino',
  roupaId: 'uniforme_ti',
  acessorioId: 'oculos_smart',
  corCabelo: '#1e293b',
  tomPele: '#f1c27d',
};

export interface TicketScoreBreakdown {
  basePoints: number;
  cleanBonus: number;
  rushHourBonus: number;
  nightShiftBonus: number;
  medalBonus: number;
  totalEarned: number;
  newlyUnlockedMedals: MedalDefinition[];
}

/**
 * Checks whether the player has beaten the game ("zerou o jogo").
 * Only when the game is beaten are all outfits and accessories unlocked unconditionally.
 */
export function isGameCompleted(
  points: number,
  resolvedCount: number,
  unlockedMedals: string[]
): boolean {
  return (
    points >= 1500 ||
    resolvedCount >= 15 ||
    unlockedMedals.includes('lenda_overclocked') ||
    unlockedMedals.length >= ALL_MEDALS.length
  );
}

/**
 * Scales accessory prices dynamically according to the player's difficulty point-gain rate
 * and career point earnings ("o preço dos acessórios também tem que acompanhar o ganho de pontos do usuário").
 */
export function getDynamicAccessoryPrice(
  accessory: AccessoryItem,
  difficulty: DifficultyLevel = 'facil',
  currentPoints = 0,
  resolvedCount = 0
): number {
  if (accessory.pontosNecessarios <= 0) return 0;
  const diffMultiplier =
    difficulty === 'facil' ? 1.0 : difficulty === 'normal' ? 1.38 : 1.85;
  const earningsTier = Math.floor(Math.max(0, currentPoints) / 350);
  const progressionMultiplier = 1 + earningsTier * 0.12 + Math.max(0, resolvedCount) * 0.05;
  const raw = accessory.pontosNecessarios * diffMultiplier * progressionMultiplier;
  if (difficulty === 'facil' && earningsTier === 0 && resolvedCount === 0) {
    return accessory.pontosNecessarios;
  }
  return Math.max(accessory.pontosNecessarios, Math.round(raw / 10) * 10);
}

export const DEFAULT_PURCHASED_OUTFITS: string[] = ['uniforme_ti'];
export const DEFAULT_PURCHASED_ACCESSORIES: string[] = ['cracha', 'oculos_smart'];

/**
 * Pure helper that resets all career progression and wardrobe purchases back to initial defaults
 * when the company goes bankrupt (Game Over Reset Geral), while preserving character gender/skin/hair.
 */
export function buildResetCareerState(currentCustomization?: PlayerCustomization): {
  points: number;
  energy: number;
  resolvedCount: number;
  unlockedMedals: string[];
  purchasedOutfitIds: string[];
  purchasedAccessoryIds: string[];
  playerCustomization: PlayerCustomization;
} {
  return {
    points: 0,
    energy: 100,
    resolvedCount: 0,
    unlockedMedals: [],
    purchasedOutfitIds: [...DEFAULT_PURCHASED_OUTFITS],
    purchasedAccessoryIds: [...DEFAULT_PURCHASED_ACCESSORIES],
    playerCustomization: {
      ...DEFAULT_CUSTOMIZATION,
      genero: currentCustomization?.genero ?? DEFAULT_CUSTOMIZATION.genero,
      corCabelo: currentCustomization?.corCabelo ?? DEFAULT_CUSTOMIZATION.corCabelo,
      tomPele: currentCustomization?.tomPele ?? DEFAULT_CUSTOMIZATION.tomPele,
      roupaId: DEFAULT_CUSTOMIZATION.roupaId,
      acessorioId: DEFAULT_CUSTOMIZATION.acessorioId,
    },
  };
}


/**
 * Scales outfit prices dynamically according to the player's difficulty point-gain rate
 * and career point earnings.
 */
export function getDynamicOutfitPrice(
  outfit: OutfitItem,
  difficulty: DifficultyLevel = 'facil',
  currentPoints = 0,
  resolvedCount = 0
): number {
  if (outfit.pontosNecessarios <= 0) return 0;
  const diffMultiplier =
    difficulty === 'facil' ? 1.0 : difficulty === 'normal' ? 1.38 : 1.85;
  const earningsTier = Math.floor(Math.max(0, currentPoints) / 350);
  const progressionMultiplier = 1 + earningsTier * 0.12 + Math.max(0, resolvedCount) * 0.05;
  const raw = outfit.pontosNecessarios * diffMultiplier * progressionMultiplier;
  if (difficulty === 'facil' && earningsTier === 0 && resolvedCount === 0) {
    return outfit.pontosNecessarios;
  }
  return Math.max(outfit.pontosNecessarios, Math.round(raw / 10) * 10);
}

/**
 * Purchases an outfit using the player's points as currency ("as roupas vao custar pontos do usuario como moeda de compra").
 * Deducts the price from currentPoints and adds outfit.id to purchasedOutfitIds.
 */
export function purchaseOutfitWithPoints(params: {
  outfit: OutfitItem;
  currentPoints: number;
  purchasedOutfitIds: string[];
  difficulty?: DifficultyLevel;
  resolvedCount?: number;
}): {
  success: boolean;
  alreadyOwned: boolean;
  costPaid: number;
  nextPoints: number;
  nextPurchasedOutfitIds: string[];
  message: string;
} {
  const {
    outfit,
    currentPoints,
    purchasedOutfitIds,
    difficulty = 'facil',
    resolvedCount = 0,
  } = params;

  if (outfit.pontosNecessarios <= 0 || purchasedOutfitIds.includes(outfit.id)) {
    const nextIds = purchasedOutfitIds.includes(outfit.id)
      ? purchasedOutfitIds
      : [...purchasedOutfitIds, outfit.id];
    return {
      success: true,
      alreadyOwned: true,
      costPaid: 0,
      nextPoints: currentPoints,
      nextPurchasedOutfitIds: nextIds,
      message: `${outfit.nome} equipada com sucesso!`,
    };
  }

  const price = getDynamicOutfitPrice(outfit, difficulty, currentPoints, resolvedCount);
  if (currentPoints < price) {
    return {
      success: false,
      alreadyOwned: false,
      costPaid: 0,
      nextPoints: currentPoints,
      nextPurchasedOutfitIds: purchasedOutfitIds,
      message: `Pontos insuficientes para comprar ${outfit.nome} (custa ${price} pts · seu saldo: ${currentPoints} pts).`,
    };
  }

  const nextPoints = currentPoints - price;
  const nextPurchasedOutfitIds = [...purchasedOutfitIds, outfit.id];
  return {
    success: true,
    alreadyOwned: false,
    costPaid: price,
    nextPoints,
    nextPurchasedOutfitIds,
    message: `Você comprou ${outfit.nome} por ${price} pts! Saldo restante: ${nextPoints} pts.`,
  };
}

/**
 * Purchases an accessory using the player's points as currency.
 */
export function purchaseAccessoryWithPoints(params: {
  accessory: AccessoryItem;
  currentPoints: number;
  purchasedAccessoryIds: string[];
  difficulty?: DifficultyLevel;
  resolvedCount?: number;
}): {
  success: boolean;
  alreadyOwned: boolean;
  costPaid: number;
  nextPoints: number;
  nextPurchasedAccessoryIds: string[];
  message: string;
} {
  const {
    accessory,
    currentPoints,
    purchasedAccessoryIds,
    difficulty = 'facil',
    resolvedCount = 0,
  } = params;

  if (accessory.pontosNecessarios <= 0 || purchasedAccessoryIds.includes(accessory.id)) {
    const nextIds = purchasedAccessoryIds.includes(accessory.id)
      ? purchasedAccessoryIds
      : [...purchasedAccessoryIds, accessory.id];
    return {
      success: true,
      alreadyOwned: true,
      costPaid: 0,
      nextPoints: currentPoints,
      nextPurchasedAccessoryIds: nextIds,
      message: `${accessory.nome} equipado com sucesso!`,
    };
  }

  const price = getDynamicAccessoryPrice(accessory, difficulty, currentPoints, resolvedCount);
  if (currentPoints < price) {
    return {
      success: false,
      alreadyOwned: false,
      costPaid: 0,
      nextPoints: currentPoints,
      nextPurchasedAccessoryIds: purchasedAccessoryIds,
      message: `Pontos insuficientes para comprar ${accessory.nome} (custa ${price} pts · seu saldo: ${currentPoints} pts).`,
    };
  }

  const nextPoints = currentPoints - price;
  const nextPurchasedAccessoryIds = [...purchasedAccessoryIds, accessory.id];
  return {
    success: true,
    alreadyOwned: false,
    costPaid: price,
    nextPoints,
    nextPurchasedAccessoryIds,
    message: `Você comprou ${accessory.nome} por ${price} pts! Saldo restante: ${nextPoints} pts.`,
  };
}

/**
 * Calculates the point penalty when the player makes a diagnostic mistake.
 * Points can go below zero (owing points / "ficar devendo pontos").
 */
export function calculateErrorPenalty(difficulty: DifficultyLevel): number {
  if (difficulty === 'facil') return 25;
  if (difficulty === 'normal') return 40;
  return 60;
}

export function applyErrorPenalty(currentPoints: number, difficulty: DifficultyLevel): {
  penalty: number;
  nextPoints: number;
} {
  const penalty = calculateErrorPenalty(difficulty);
  return {
    penalty,
    nextPoints: currentPoints - penalty, // Can go negative ("devendo pontos")!
  };
}

export function calculateTicketReward(params: {
  difficulty: DifficultyLevel;
  categoria: ProblemCategory;
  errorCount: number;
  isRushHour: boolean;
  isNightShift?: boolean;
  currentPoints: number;
  resolvedCountAfter: number;
  unlockedMedals: string[];
}): TicketScoreBreakdown {
  const basePoints =
    params.difficulty === 'facil' ? 120 : params.difficulty === 'normal' ? 180 : 260;
  const cleanBonus = params.errorCount === 0 ? 40 : 0;
  const rushHourBonus = params.isRushHour ? 75 : 0;
  const nightShiftBonus = params.isNightShift ? Math.round(basePoints * 0.5) : 0;

  const newlyUnlockedMedals: MedalDefinition[] = [];
  const has = (id: string) =>
    params.unlockedMedals.includes(id) || newlyUnlockedMedals.some((m) => m.id === id);

  const tryUnlock = (id: string) => {
    if (!has(id)) {
      const def = ALL_MEDALS.find((m) => m.id === id);
      if (def) newlyUnlockedMedals.push(def);
    }
  };

  if (params.resolvedCountAfter >= 1) {
    tryUnlock('primeiro_chamado');
  }
  if (params.categoria === 'Hardware') {
    tryUnlock('especialista_hardware');
  }
  if (params.categoria === 'Software') {
    tryUnlock('mestre_overos');
  }
  if (params.categoria === 'Redes') {
    tryUnlock('guardiao_rede');
  }
  if (params.errorCount === 0 || params.categoria === 'Pegadinha') {
    tryUnlock('olho_clinico');
  }
  if (params.isRushHour) {
    tryUnlock('heroi_pico');
  }

  let runningTotal =
    params.currentPoints +
    basePoints +
    cleanBonus +
    rushHourBonus +
    nightShiftBonus +
    newlyUnlockedMedals.reduce((acc, m) => acc + m.pontosRecompensa, 0);

  if (runningTotal >= 500) {
    tryUnlock('veterano_500');
  }
  runningTotal =
    params.currentPoints +
    basePoints +
    cleanBonus +
    rushHourBonus +
    nightShiftBonus +
    newlyUnlockedMedals.reduce((acc, m) => acc + m.pontosRecompensa, 0);

  if (runningTotal >= 1500 || params.resolvedCountAfter >= 15) {
    tryUnlock('lenda_overclocked');
  }

  const medalBonus = newlyUnlockedMedals.reduce((acc, m) => acc + m.pontosRecompensa, 0);
  const totalEarned = basePoints + cleanBonus + rushHourBonus + nightShiftBonus + medalBonus;

  return {
    basePoints,
    cleanBonus,
    rushHourBonus,
    nightShiftBonus,
    medalBonus,
    totalEarned,
    newlyUnlockedMedals,
  };
}

export function computeNextTicketDelaySeconds(
  difficulty: DifficultyLevel,
  isRushHour: boolean
): number {
  const rand = Math.random();
  if (difficulty === 'facil') {
    return Math.round(14 + rand * 7); // 14 to 21s
  }
  if (difficulty === 'normal') {
    return Math.round(8 + rand * 6); // 8 to 14s
  }
  if (isRushHour) {
    return Math.round(6 + rand * 4); // 6 to 10s rapid accumulation during Rush Hour!
  }
  return Math.round(8 + rand * 4);
}

export function getMaxSimultaneousTickets(
  difficulty: DifficultyLevel,
  isRushHour: boolean
): number {
  if (difficulty === 'facil') return 1;
  if (difficulty === 'normal') return 2;
  return isRushHour ? 4 : 2;
}
