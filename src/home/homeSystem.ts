import { Vec2 } from '../pathfinding/trail';

export type GameLocation = 'office' | 'home';

export type FurnitureCategory = 'conforto' | 'tecnologia' | 'decoracao' | 'lazer';

export type FurnitureSlotId =
  | 'tapete_sala'
  | 'plantas_casa'
  | 'cafeteira_casa'
  | 'estante_quarto'
  | 'sofa_sala'
  | 'poltrona_leitura'
  | 'mesa_jantar'
  | 'cama_quarto'
  | 'geladeira_cozinha'
  | 'tv_sala'
  | 'arcade_lazer'
  | 'setup_gamer';

export interface HomeFurnitureItem {
  id: string;
  slotId: FurnitureSlotId;
  slotNome: string;
  versao: 1 | 2 | 3;
  tierLabel: string;
  nome: string;
  categoria: FurnitureCategory;
  comodo: string;
  preco: number;
  confortoBonus: number;
  descricao: string;
  corDestaque: string;
  pos: Vec2;
}

export const HOME_STAY_DURATION_SECONDS = 180; // 3 minutos contando até a volta para o emprego

export const ALL_FURNITURE_SLOTS: {
  slotId: FurnitureSlotId;
  slotNome: string;
  categoria: FurnitureCategory;
  comodo: string;
}[] = [
  { slotId: 'tapete_sala', slotNome: 'Tapete da Sala', categoria: 'decoracao', comodo: 'Sala de Estar' },
  { slotId: 'plantas_casa', slotNome: 'Jardim Interno & Vasos', categoria: 'decoracao', comodo: 'Sala & Quarto' },
  { slotId: 'cafeteira_casa', slotNome: 'Estação de Café', categoria: 'conforto', comodo: 'Cozinha' },
  { slotId: 'estante_quarto', slotNome: 'Estante & Biblioteca', categoria: 'decoracao', comodo: 'Estúdio / Quarto' },
  { slotId: 'sofa_sala', slotNome: 'Sofá & Mesa de Centro', categoria: 'conforto', comodo: 'Sala de Estar' },
  { slotId: 'poltrona_leitura', slotNome: 'Poltrona de Descanso', categoria: 'lazer', comodo: 'Quarto' },
  { slotId: 'mesa_jantar', slotNome: 'Conjunto de Jantar', categoria: 'conforto', comodo: 'Sala de Jantar' },
  { slotId: 'cama_quarto', slotNome: 'Cama do Quarto', categoria: 'conforto', comodo: 'Quarto' },
  { slotId: 'geladeira_cozinha', slotNome: 'Geladeira & Refrigeração', categoria: 'tecnologia', comodo: 'Cozinha' },
  { slotId: 'tv_sala', slotNome: 'Home Theater & TV', categoria: 'tecnologia', comodo: 'Sala de Estar' },
  { slotId: 'arcade_lazer', slotNome: 'Cabine de Jogos Arcade', categoria: 'lazer', comodo: 'Área de Lazer' },
  { slotId: 'setup_gamer', slotNome: 'Estação PC & Setup', categoria: 'tecnologia', comodo: 'Estúdio em Casa' },
];

export const ALL_HOME_FURNITURE: HomeFurnitureItem[] = [
  // 1. TAPETE DA SALA (3 versões)
  {
    id: 'tapete_persa_sala',
    slotId: 'tapete_sala',
    slotNome: 'Tapete da Sala',
    versao: 1,
    tierLabel: 'Versão I · Nórdico',
    nome: 'Tapete Geométrico Nórdico',
    categoria: 'decoracao',
    comodo: 'Sala de Estar',
    preco: 115,
    confortoBonus: 12,
    descricao: 'Tapete tecido em algodão azul-ártico com bordas geométricas escandinavas.',
    corDestaque: '#38bdf8',
    pos: { x: -3.2, z: 1.6 },
  },
  {
    id: 'tapete_persa_sala_v2',
    slotId: 'tapete_sala',
    slotNome: 'Tapete da Sala',
    versao: 2,
    tierLabel: 'Versão II · Persa Terracota',
    nome: 'Tapete Persa Clássico Terracota',
    categoria: 'decoracao',
    comodo: 'Sala de Estar',
    preco: 210,
    confortoBonus: 22,
    descricao: 'Tapete encorpado em lã tramada com medalhão central carmesim e franjas douradas.',
    corDestaque: '#f59e0b',
    pos: { x: -3.2, z: 1.6 },
  },
  {
    id: 'tapete_persa_sala_v3',
    slotId: 'tapete_sala',
    slotNome: 'Tapete da Sala',
    versao: 3,
    tierLabel: 'Versão III · Veludo Imperial',
    nome: 'Tapete Imperial em Veludo & Ouro',
    categoria: 'decoracao',
    comodo: 'Sala de Estar',
    preco: 340,
    confortoBonus: 36,
    descricao: 'Tapete de altíssima densidade em veludo meia-noite com fios acetinados dourados.',
    corDestaque: '#eab308',
    pos: { x: -3.2, z: 1.6 },
  },

  // 2. JARDIM INTERNO & VASOS (3 versões)
  {
    id: 'kit_plantas_monstera',
    slotId: 'plantas_casa',
    slotNome: 'Jardim Interno & Vasos',
    versao: 1,
    tierLabel: 'Versão I · Vasos Cerâmicos',
    nome: 'Trio de Vasos Cerâmicos & Ficus',
    categoria: 'decoracao',
    comodo: 'Sala & Quarto',
    preco: 125,
    confortoBonus: 14,
    descricao: 'Três vasos de terracota artesanal com folhagens naturais para os cantos da casa.',
    corDestaque: '#10b981',
    pos: { x: -7.25, z: -4.35 },
  },
  {
    id: 'kit_plantas_monstera_v2',
    slotId: 'plantas_casa',
    slotNome: 'Jardim Interno & Vasos',
    versao: 2,
    tierLabel: 'Versão II · Monstera Tropical',
    nome: 'Jardim Monstera & Cachepôs em Latão',
    categoria: 'decoracao',
    comodo: 'Sala & Quarto',
    preco: 225,
    confortoBonus: 25,
    descricao: 'Costelas-de-adão frondosas em cachepôs elevados de madeira nobre e anel de latão.',
    corDestaque: '#059669',
    pos: { x: -7.25, z: -4.35 },
  },
  {
    id: 'kit_plantas_monstera_v3',
    slotId: 'plantas_casa',
    slotNome: 'Jardim Interno & Vasos',
    versao: 3,
    tierLabel: 'Versão III · Jardim Zen Iluminado',
    nome: 'Jardim Botânico Zen & Bonsai Iluminado',
    categoria: 'decoracao',
    comodo: 'Sala & Quarto',
    preco: 360,
    confortoBonus: 40,
    descricao: 'Arranjos esculturais com bambu-mossô, pedras brancas de rio e iluminação focal LED.',
    corDestaque: '#34d399',
    pos: { x: -7.25, z: -4.35 },
  },

  // 3. ESTAÇÃO DE CAFÉ (3 versões)
  {
    id: 'cafeteira_barista_casa',
    slotId: 'cafeteira_casa',
    slotNome: 'Estação de Café',
    versao: 1,
    tierLabel: 'Versão I · Expresso Compacta',
    nome: 'Cafeteira Italiana & Canecas Térmicas',
    categoria: 'conforto',
    comodo: 'Cozinha',
    preco: 145,
    confortoBonus: 16,
    descricao: 'Máquina de expresso doméstica em inox com trio de canecas coloridas na bancada.',
    corDestaque: '#f59e0b',
    pos: { x: 4.7, z: -4.65 },
  },
  {
    id: 'cafeteira_barista_casa_v2',
    slotId: 'cafeteira_casa',
    slotNome: 'Estação de Café',
    versao: 2,
    tierLabel: 'Versão II · Barista Pro',
    nome: 'Estação Barista Dual-Boiler & Moedor',
    categoria: 'conforto',
    comodo: 'Cozinha',
    preco: 255,
    confortoBonus: 28,
    descricao: 'Cafeteira italiana de alavanca cromada, moedor cônico de grãos e bandeja de madeira.',
    corDestaque: '#d97706',
    pos: { x: 4.7, z: -4.65 },
  },
  {
    id: 'cafeteira_barista_casa_v3',
    slotId: 'cafeteira_casa',
    slotNome: 'Estação de Café',
    versao: 3,
    tierLabel: 'Versão III · Roastery Ouro & Cobre',
    nome: 'Coffee Bar Artesanal Cobre & Manômetro',
    categoria: 'conforto',
    comodo: 'Cozinha',
    preco: 390,
    confortoBonus: 44,
    descricao: 'Máquina de torrefação e extração em cobre polido com vaporizador duplo e porta-xícaras aquecido.',
    corDestaque: '#fbbf24',
    pos: { x: 4.7, z: -4.65 },
  },

  // 4. ESTANTE & BIBLIOTECA (3 versões)
  {
    id: 'estante_livros_geek',
    slotId: 'estante_quarto',
    slotNome: 'Estante & Biblioteca',
    versao: 1,
    tierLabel: 'Versão I · Estante Carvalho',
    nome: 'Estante de Livros Técnicos em Carvalho',
    categoria: 'decoracao',
    comodo: 'Estúdio / Quarto',
    preco: 160,
    confortoBonus: 18,
    descricao: 'Estante aberta em madeira carvalho com livros de redes, algoritmos e cadernos.',
    corDestaque: '#a855f7',
    pos: { x: -7.55, z: -1.9 },
  },
  {
    id: 'estante_livros_geek_v2',
    slotId: 'estante_quarto',
    slotNome: 'Estante & Biblioteca',
    versao: 2,
    tierLabel: 'Versão II · Biblioteca Nogueira',
    nome: 'Biblioteca Dupla em Nogueira & Colecionáveis',
    categoria: 'decoracao',
    comodo: 'Estúdio / Quarto',
    preco: 275,
    confortoBonus: 30,
    descricao: 'Estante executiva em nogueira escura com divisórias assimétricas, globo e miniaturas.',
    corDestaque: '#9333ea',
    pos: { x: -7.55, z: -1.9 },
  },
  {
    id: 'estante_livros_geek_v3',
    slotId: 'estante_quarto',
    slotNome: 'Estante & Biblioteca',
    versao: 3,
    tierLabel: 'Versão III · Vitrine LED & Troféus',
    nome: 'Galeria Iluminada de Troféus & Raridades',
    categoria: 'decoracao',
    comodo: 'Estúdio / Quarto',
    preco: 415,
    confortoBonus: 48,
    descricao: 'Estante arquitetônica com fitas de LED embutidas, bustos colecionáveis e enciclopédias.',
    corDestaque: '#c084fc',
    pos: { x: -7.55, z: -1.9 },
  },

  // 5. SOFÁ & MESA DE CENTRO (3 versões)
  {
    id: 'sofa_retratil',
    slotId: 'sofa_sala',
    slotNome: 'Sofá & Mesa de Centro',
    versao: 1,
    tierLabel: 'Versão I · Linho Nórdico',
    nome: 'Sofá de Linho 3 Lugares + Mesa',
    categoria: 'conforto',
    comodo: 'Sala de Estar',
    preco: 185,
    confortoBonus: 22,
    descricao: 'Sofá aconchegante em linho azul-petróleo com braços cilindrados e mesa de centro.',
    corDestaque: '#0ea5e9',
    pos: { x: -3.2, z: 2.35 },
  },
  {
    id: 'sofa_retratil_v2',
    slotId: 'sofa_sala',
    slotNome: 'Sofá & Mesa de Centro',
    versao: 2,
    tierLabel: 'Versão II · Chaise L-Shape',
    nome: 'Sofá Retrátil em L com Chaise & Nogueira',
    categoria: 'conforto',
    comodo: 'Sala de Estar',
    preco: 310,
    confortoBonus: 36,
    descricao: 'Sofá amplo com chaise-longue estendida, almofadas capitonê e mesa dupla com bandeja.',
    corDestaque: '#0284c7',
    pos: { x: -3.2, z: 2.35 },
  },
  {
    id: 'sofa_retratil_v3',
    slotId: 'sofa_sala',
    slotNome: 'Sofá & Mesa de Centro',
    versao: 3,
    tierLabel: 'Versão III · Lounge Italiano Couro',
    nome: 'Lounge Modular Italiano Couro & Mármore',
    categoria: 'conforto',
    comodo: 'Sala de Estar',
    preco: 460,
    confortoBonus: 54,
    descricao: 'Conjunto modular em couro conhaque pespontado, pufe lateral e mesa em mármore Carrara.',
    corDestaque: '#38bdf8',
    pos: { x: -3.2, z: 2.35 },
  },

  // 6. POLTRONA DE DESCANSO (3 versões)
  {
    id: 'poltrona_massagem',
    slotId: 'poltrona_leitura',
    slotNome: 'Poltrona de Descanso',
    versao: 1,
    tierLabel: 'Versão I · Leitura Clássica',
    nome: 'Poltrona de Leitura & Luminária de Piso',
    categoria: 'lazer',
    comodo: 'Quarto',
    preco: 195,
    confortoBonus: 22,
    descricao: 'Poltrona estofada caramelo com pufe para os pés e luminária de leitura quente.',
    corDestaque: '#d97706',
    pos: { x: -2.1, z: -2.45 },
  },
  {
    id: 'poltrona_massagem_v2',
    slotId: 'poltrona_leitura',
    slotNome: 'Poltrona de Descanso',
    versao: 2,
    tierLabel: 'Versão II · Eames Lounge Couro',
    nome: 'Poltrona Charles Eames em Pau-Ferro & Couro',
    categoria: 'lazer',
    comodo: 'Quarto',
    preco: 325,
    confortoBonus: 38,
    descricao: 'Ícone do design em madeira curvada e couro legítimo com base giratória em estrela.',
    corDestaque: '#b45309',
    pos: { x: -2.1, z: -2.45 },
  },
  {
    id: 'poltrona_massagem_v3',
    slotId: 'poltrona_leitura',
    slotNome: 'Poltrona de Descanso',
    versao: 3,
    tierLabel: 'Versão III · Cápsula Massagem Zero-G',
    nome: 'Poltrona Robótica de Massagem Zero-Gravity',
    categoria: 'lazer',
    comodo: 'Quarto',
    preco: 480,
    confortoBonus: 58,
    descricao: 'Cápsula reclinável motorizada com massagem térmica lombar, painel touch e arco LED.',
    corDestaque: '#f59e0b',
    pos: { x: -2.1, z: -2.45 },
  },

  // 7. CONJUNTO DE JANTAR (3 versões)
  {
    id: 'mesa_jantar_madeira',
    slotId: 'mesa_jantar',
    slotNome: 'Conjunto de Jantar',
    versao: 1,
    tierLabel: 'Versão I · Bistrô Carvalho',
    nome: 'Mesa de Jantar em Carvalho + 4 Cadeiras',
    categoria: 'conforto',
    comodo: 'Sala de Jantar',
    preco: 210,
    confortoBonus: 24,
    descricao: 'Mesa retangular em carvalho claro com 4 cadeiras estofadas e fruteira central.',
    corDestaque: '#b45309',
    pos: { x: 4.2, z: 1.5 },
  },
  {
    id: 'mesa_jantar_madeira_v2',
    slotId: 'mesa_jantar',
    slotNome: 'Conjunto de Jantar',
    versao: 2,
    tierLabel: 'Versão II · Nogueira & Pendente',
    nome: 'Mesa Executiva em Nogueira + Jogo Americano',
    categoria: 'conforto',
    comodo: 'Sala de Jantar',
    preco: 345,
    confortoBonus: 40,
    descricao: 'Mesa chanfrada em nogueira maciça com 4 cadeiras de encosto curvo e serviço de jantar.',
    corDestaque: '#d97706',
    pos: { x: 4.2, z: 1.5 },
  },
  {
    id: 'mesa_jantar_madeira_v3',
    slotId: 'mesa_jantar',
    slotNome: 'Conjunto de Jantar',
    versao: 3,
    tierLabel: 'Versão III · Mármore & 6 Lugares',
    nome: 'Mesa Imperial em Mármore Carrara + 6 Poltronas',
    categoria: 'conforto',
    comodo: 'Sala de Jantar',
    preco: 500,
    confortoBonus: 62,
    descricao: 'Tampo de mármore italiano sobre base escultural dourada, 6 cadeiras de veludo e candelabro.',
    corDestaque: '#fbbf24',
    pos: { x: 4.2, z: 1.5 },
  },

  // 8. CAMA DO QUARTO (3 versões)
  {
    id: 'cama_king_hotel',
    slotId: 'cama_quarto',
    slotNome: 'Cama do Quarto',
    versao: 1,
    tierLabel: 'Versão I · Casal Ortopédica',
    nome: 'Cama Box Casal Ortopédica + Criado-Mudo',
    categoria: 'conforto',
    comodo: 'Quarto',
    preco: 225,
    confortoBonus: 28,
    descricao: 'Substitui a cama simples por uma cama de casal macia com cabeceira em madeira e abajur.',
    corDestaque: '#6366f1',
    pos: { x: -5.3, z: -3.4 },
  },
  {
    id: 'cama_king_hotel_v2',
    slotId: 'cama_quarto',
    slotNome: 'Cama do Quarto',
    versao: 2,
    tierLabel: 'Versão II · Queen Capitonê',
    nome: 'Cama Queen Estofada + Duplo Criado-Mudo',
    categoria: 'conforto',
    comodo: 'Quarto',
    preco: 365,
    confortoBonus: 45,
    descricao: 'Cama Queen Size com cabeceira estofada em linho, 4 travesseiros e dois abajures dourados.',
    corDestaque: '#818cf8',
    pos: { x: -5.3, z: -3.4 },
  },
  {
    id: 'cama_king_hotel_v3',
    slotId: 'cama_quarto',
    slotNome: 'Cama do Quarto',
    versao: 3,
    tierLabel: 'Versão III · King Presidential 5★',
    nome: 'Cama King Presidential 5★ + LED & Recamier',
    categoria: 'conforto',
    comodo: 'Quarto',
    preco: 520,
    confortoBonus: 68,
    descricao: 'Cama King de hotel 5 estrelas com cabeceira panorâmica LED, banco recamier aos pés e seda.',
    corDestaque: '#a855f7',
    pos: { x: -5.3, z: -3.4 },
  },

  // 9. GELADEIRA DA COZINHA (3 versões)
  {
    id: 'geladeira_inox_smart',
    slotId: 'geladeira_cozinha',
    slotNome: 'Geladeira & Refrigeração',
    versao: 1,
    tierLabel: 'Versão I · Frost Free Inox',
    nome: 'Geladeira Duplex Frost Free Inox',
    categoria: 'tecnologia',
    comodo: 'Cozinha',
    preco: 235,
    confortoBonus: 26,
    descricao: 'Geladeira duplex em aço escovado com puxadores tubulares e freezer superior.',
    corDestaque: '#64748b',
    pos: { x: 7.0, z: -4.45 },
  },
  {
    id: 'geladeira_inox_smart_v2',
    slotId: 'geladeira_cozinha',
    slotNome: 'Geladeira & Refrigeração',
    versao: 2,
    tierLabel: 'Versão II · Side-by-Side Dispenser',
    nome: 'Geladeira Side-by-Side Inox com Água & Gelo',
    categoria: 'tecnologia',
    comodo: 'Cozinha',
    preco: 380,
    confortoBonus: 42,
    descricao: 'Geladeira de duas portas verticais com dispenser externo iluminado de água e gelo.',
    corDestaque: '#94a3b8',
    pos: { x: 7.0, z: -4.45 },
  },
  {
    id: 'geladeira_inox_smart_v3',
    slotId: 'geladeira_cozinha',
    slotNome: 'Geladeira & Refrigeração',
    versao: 3,
    tierLabel: 'Versão III · French Door Smart Hub',
    nome: 'Geladeira Smart French Door 4 Portas + Adega',
    categoria: 'tecnologia',
    comodo: 'Cozinha',
    preco: 540,
    confortoBonus: 65,
    descricao: 'Centro culinário em titânio preto com tela touch interativa, vitrine iluminada e adega.',
    corDestaque: '#38bdf8',
    pos: { x: 7.0, z: -4.45 },
  },

  // 10. HOME THEATER & TV (3 versões)
  {
    id: 'tv_oled_65',
    slotId: 'tv_sala',
    slotNome: 'Home Theater & TV',
    versao: 1,
    tierLabel: 'Versão I · Smart TV 50"',
    nome: 'Smart TV 4K 50" + Rack Nogueira',
    categoria: 'tecnologia',
    comodo: 'Sala de Estar',
    preco: 250,
    confortoBonus: 30,
    descricao: 'Rack de sala em madeira nogueira com Smart TV 50 polegadas de bordas finas.',
    corDestaque: '#ec4899',
    pos: { x: -3.2, z: -0.22 },
  },
  {
    id: 'tv_oled_65_v2',
    slotId: 'tv_sala',
    slotNome: 'Home Theater & TV',
    versao: 2,
    tierLabel: 'Versão II · OLED 65" + Soundbar',
    nome: 'Smart TV OLED 65" + Soundbar Dolby Atmos',
    categoria: 'tecnologia',
    comodo: 'Sala de Estar',
    preco: 400,
    confortoBonus: 48,
    descricao: 'Painel ripado com TV OLED 65", soundbar central, subwoofer e iluminação Ambilight.',
    corDestaque: '#f43f5e',
    pos: { x: -3.2, z: -0.22 },
  },
  {
    id: 'tv_oled_65_v3',
    slotId: 'tv_sala',
    slotNome: 'Home Theater & TV',
    versao: 3,
    tierLabel: 'Versão III · Cinema 85" + Torres Hi-Fi',
    nome: 'Home Cinema MicroLED 85" + Torres Acústicas',
    categoria: 'tecnologia',
    comodo: 'Sala de Estar',
    preco: 570,
    confortoBonus: 72,
    descricao: 'Parede de cinema 8K com duas torres acústicas Hi-Fi de piso, receiver e console next-gen.',
    corDestaque: '#fb7185',
    pos: { x: -3.2, z: -0.22 },
  },

  // 11. CABINE DE JOGOS ARCADE (3 versões)
  {
    id: 'fliperama_arcade',
    slotId: 'arcade_lazer',
    slotNome: 'Cabine de Jogos Arcade',
    versao: 1,
    tierLabel: 'Versão I · Arcade Clássico 80s',
    nome: 'Gabinete Fliperama Retrô Anos 80',
    categoria: 'lazer',
    comodo: 'Área de Lazer',
    preco: 265,
    confortoBonus: 34,
    descricao: 'Máquina de fliperama clássica com controles arcade vermelhos e letreiro iluminado.',
    corDestaque: '#f43f5e',
    pos: { x: 7.35, z: 1.4 },
  },
  {
    id: 'fliperama_arcade_v2',
    slotId: 'arcade_lazer',
    slotNome: 'Cabine de Jogos Arcade',
    versao: 2,
    tierLabel: 'Versão II · Arcade Duplo + Pinball',
    nome: 'Fliperama Deluxe 2-Players & Neon',
    categoria: 'lazer',
    comodo: 'Área de Lazer',
    preco: 420,
    confortoBonus: 54,
    descricao: 'Cabine arcade widescreen para 2 jogadores com alto-falantes RGB, banqueta cromada e neon.',
    corDestaque: '#ec4899',
    pos: { x: 7.35, z: 1.4 },
  },
  {
    id: 'fliperama_arcade_v3',
    slotId: 'arcade_lazer',
    slotNome: 'Cabine de Jogos Arcade',
    versao: 3,
    tierLabel: 'Versão III · Cockpit Simulador Pro',
    nome: 'Arcade Twin-Cab + Cockpit Simulador Hidráulico',
    categoria: 'lazer',
    comodo: 'Área de Lazer',
    preco: 600,
    confortoBonus: 78,
    descricao: 'Estação de entretenimento suprema com gabinete arcade neon e cockpit de corrida com volante.',
    corDestaque: '#e11d48',
    pos: { x: 7.35, z: 1.4 },
  },

  // 12. ESTAÇÃO PC & SETUP (3 versões)
  {
    id: 'setup_gamer_casa',
    slotId: 'setup_gamer',
    slotNome: 'Estação PC & Setup',
    versao: 1,
    tierLabel: 'Versão I · Home Office Clean',
    nome: 'Bancada Home Office Ultrawide + Cadeira Ergonômica',
    categoria: 'tecnologia',
    comodo: 'Estúdio em Casa',
    preco: 280,
    confortoBonus: 38,
    descricao: 'Mesa de trabalho com monitor ultrawide, notebook em suporte, luminária e cadeira mesh.',
    corDestaque: '#06b6d4',
    pos: { x: 0.6, z: -4.35 },
  },
  {
    id: 'setup_gamer_casa_v2',
    slotId: 'setup_gamer',
    slotNome: 'Estação PC & Setup',
    versao: 2,
    tierLabel: 'Versão II · Dual-Monitor RGB',
    nome: 'Setup Gamer Dual-Monitor + Gabinete Aquário RGB',
    categoria: 'tecnologia',
    comodo: 'Estúdio em Casa',
    preco: 450,
    confortoBonus: 58,
    descricao: 'Bancada gamer com fita LED, dois monitores curvos em braço articulado e PC watercooler.',
    corDestaque: '#0891b2',
    pos: { x: 0.6, z: -4.35 },
  },
  {
    id: 'setup_gamer_casa_v3',
    slotId: 'setup_gamer',
    slotNome: 'Estação PC & Setup',
    versao: 3,
    tierLabel: 'Versão III · Battlestation Triple-Screen',
    nome: 'Battlestation DevOps Triple-Monitor + Estúdio Podcast',
    categoria: 'tecnologia',
    comodo: 'Estúdio em Casa',
    preco: 640,
    confortoBonus: 86,
    descricao: 'Três monitores 4K, microfone de estúdio em braço articulado, torre full-tower líquida e cadeira pro.',
    corDestaque: '#22d3ee',
    pos: { x: 0.6, z: -4.35 },
  },
];

export const DEFAULT_PURCHASED_FURNITURE: string[] = [];

/**
 * Returns the active (equipped) furniture item ID for a given slot based on the order in purchasedFurnitureIds.
 * Buying or equipping a version places its ID at the end of purchasedFurnitureIds so it becomes the active 3D model.
 */
export function getActiveFurnitureIdForSlot(
  slotId: FurnitureSlotId,
  purchasedFurnitureIds: string[]
): string | null {
  const slotItemIds = new Set(
    ALL_HOME_FURNITURE.filter((item) => item.slotId === slotId).map((item) => item.id)
  );
  let activeId: string | null = null;
  for (const id of purchasedFurnitureIds) {
    if (slotItemIds.has(id)) {
      activeId = id;
    }
  }
  return activeId;
}

/**
 * Returns the set of currently active (equipped) furniture IDs across all 12 slots.
 */
export function getActiveFurnitureIds(purchasedFurnitureIds: string[]): string[] {
  const active: string[] = [];
  for (const slot of ALL_FURNITURE_SLOTS) {
    const id = getActiveFurnitureIdForSlot(slot.slotId, purchasedFurnitureIds);
    if (id) active.push(id);
  }
  return active;
}

/**
 * Moves an already-owned furniture version to the end of purchasedFurnitureIds so it is rendered as the active version in 3D.
 */
export function equipHomeFurnitureVersion(
  furnitureId: string,
  purchasedFurnitureIds: string[]
): string[] {
  if (!purchasedFurnitureIds.includes(furnitureId)) {
    return purchasedFurnitureIds;
  }
  return [...purchasedFurnitureIds.filter((id) => id !== furnitureId), furnitureId];
}

export interface PurchaseFurnitureResult {
  success: boolean;
  nextPoints: number;
  nextPurchasedFurnitureIds: string[];
  message: string;
}

export function purchaseHomeFurniture(params: {
  furnitureId: string;
  currentPoints: number;
  purchasedFurnitureIds: string[];
}): PurchaseFurnitureResult {
  const { furnitureId, currentPoints, purchasedFurnitureIds } = params;
  const item = ALL_HOME_FURNITURE.find((f) => f.id === furnitureId);
  if (!item) {
    return {
      success: false,
      nextPoints: currentPoints,
      nextPurchasedFurnitureIds: purchasedFurnitureIds,
      message: 'Móvel não encontrado no catálogo.',
    };
  }

  if (purchasedFurnitureIds.includes(item.id)) {
    return {
      success: false,
      nextPoints: currentPoints,
      nextPurchasedFurnitureIds: purchasedFurnitureIds,
      message: `${item.nome} já foi comprado!`,
    };
  }

  if (currentPoints < item.preco) {
    return {
      success: false,
      nextPoints: currentPoints,
      nextPurchasedFurnitureIds: purchasedFurnitureIds,
      message: `Pontos insuficientes! Você precisa de ${item.preco} pts (Saldo atual: ${currentPoints} pts).`,
    };
  }

  const nextPoints = currentPoints - item.preco;
  const nextPurchasedFurnitureIds = [...purchasedFurnitureIds, item.id];

  return {
    success: true,
    nextPoints,
    nextPurchasedFurnitureIds,
    message: `${item.nome} (${item.tierLabel}) instalado em ${item.comodo}! (-${item.preco} pts)`,
  };
}

export interface HomeComfortSummary {
  totalComfort: number;
  ownedCount: number;
  totalItems: number;
  ownedSlotsCount: number;
  totalSlots: number;
  levelTitle: string;
}

export function calculateHomeComfortScore(
  purchasedFurnitureIds: string[]
): HomeComfortSummary {
  const uniqueIds = new Set(purchasedFurnitureIds);
  let ownedCount = 0;

  // For each slot, sum the highest comfort bonus among owned versions of that slot, plus a collection bonus for extra versions
  const maxComfortBySlot = new Map<FurnitureSlotId, number>();
  let extraVersionBonus = 0;

  for (const item of ALL_HOME_FURNITURE) {
    if (uniqueIds.has(item.id)) {
      ownedCount++;
      const prevMax = maxComfortBySlot.get(item.slotId) || 0;
      if (item.confortoBonus > prevMax) {
        if (prevMax > 0) extraVersionBonus += Math.round(prevMax * 0.25);
        maxComfortBySlot.set(item.slotId, item.confortoBonus);
      } else {
        extraVersionBonus += Math.round(item.confortoBonus * 0.25);
      }
    }
  }

  let totalComfort = extraVersionBonus;
  for (const val of maxComfortBySlot.values()) {
    totalComfort += val;
  }

  const ownedSlotsCount = maxComfortBySlot.size;

  let levelTitle = 'Quitinete Inicial';
  if (ownedSlotsCount >= 10 || totalComfort >= 380) {
    levelTitle = 'Cobertura High-Tech dos Sonhos';
  } else if (ownedSlotsCount >= 6 || totalComfort >= 210) {
    levelTitle = 'Loft Executivo Completo';
  } else if (ownedSlotsCount >= 3 || totalComfort >= 40) {
    levelTitle = 'Apartamento Aconchegante';
  } else if (ownedSlotsCount >= 1) {
    levelTitle = 'Lar em Evolução';
  }

  return {
    totalComfort,
    ownedCount,
    totalItems: ALL_HOME_FURNITURE.length,
    ownedSlotsCount,
    totalSlots: ALL_FURNITURE_SLOTS.length,
    levelTitle,
  };
}

export interface NightfallDecisionOutcome {
  nextLocation: GameLocation;
  isNightShift: boolean;
  nextEnergy: number;
  nextCycleSeconds: number;
  homeStaySeconds: number;
  hasSleptAtHome: boolean;
  requiresSleepCutscene: boolean;
}

/**
 * Resolves the player's choice when night falls in the office.
 * Note: Going home places the player in their 3D Home with a 3-minute countdown (180s)
 * and keeps their current energy until they walk to the bed and click to sleep!
 */
export function resolveNightfallChoice(
  choice: 'night_shift' | 'go_home',
  currentEnergy: number,
  dayDurationSeconds = 180,
  nightDurationSeconds = 120
): NightfallDecisionOutcome {
  if (choice === 'night_shift') {
    return {
      nextLocation: 'office',
      isNightShift: true,
      nextEnergy: currentEnergy,
      nextCycleSeconds: nightDurationSeconds,
      homeStaySeconds: 0,
      hasSleptAtHome: false,
      requiresSleepCutscene: false,
    };
  }

  return {
    nextLocation: 'home',
    isNightShift: false,
    nextEnergy: currentEnergy,
    nextCycleSeconds: dayDurationSeconds,
    homeStaySeconds: HOME_STAY_DURATION_SECONDS,
    hasSleptAtHome: false,
    requiresSleepCutscene: false,
  };
}

export interface SleepInBedOutcome {
  nextEnergy: number;
  hasSleptAtHome: boolean;
  message: string;
}

/**
 * Triggered when the player walks to the bed in their 3D Home and clicks to sleep.
 * Restores energy to 100% and unlocks returning to the office!
 */
export function sleepInHomeBed(): SleepInBedOutcome {
  return {
    nextEnergy: 100,
    hasSleptAtHome: true,
    message:
      'Você dormiu profundamente na sua cama e recuperou 100% da sua energia! Agora você já pode voltar ao escritório pela porta de saída.',
  };
}

export function canReturnToOfficeFromHome(hasSleptAtHome: boolean): {
  allowed: boolean;
  reason: string | null;
} {
  if (!hasSleptAtHome) {
    return {
      allowed: false,
      reason:
        'Você ainda não descansou! Caminhe até a cama no quarto e clique em Dormir para recuperar 100% da sua energia antes de voltar para o escritório.',
    };
  }
  return {
    allowed: true,
    reason: null,
  };
}

export function advanceHomeStayTimer(
  remainingSeconds: number,
  hasSleptAtHome: boolean
): {
  nextRemainingSeconds: number;
  shouldAutoReturnToOffice: boolean;
  shouldPromptMustSleep: boolean;
} {
  if (remainingSeconds > 1) {
    return {
      nextRemainingSeconds: remainingSeconds - 1,
      shouldAutoReturnToOffice: false,
      shouldPromptMustSleep: false,
    };
  }
  // Timer reached 0: if the player already slept in the bed, automatically return to the office!
  // Otherwise, hold at 0 and prompt the player to walk to the bed and sleep.
  if (hasSleptAtHome) {
    return {
      nextRemainingSeconds: 0,
      shouldAutoReturnToOffice: true,
      shouldPromptMustSleep: false,
    };
  }
  return {
    nextRemainingSeconds: 0,
    shouldAutoReturnToOffice: false,
    shouldPromptMustSleep: true,
  };
}

// ============================================================================
// HOME 2D PHYSICS & COLLISION SYSTEM (Walls, Built-in Counters & 3D Furniture)
// ============================================================================

export interface HomeBoxCollider {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const HOME_PLAYER_RADIUS = 0.36;

export function buildHomeColliders(purchasedFurnitureIds: string[] = []): HomeBoxCollider[] {
  const activeBySlot = new Set<FurnitureSlotId>();
  for (const slot of ALL_FURNITURE_SLOTS) {
    if (getActiveFurnitureIdForSlot(slot.slotId, purchasedFurnitureIds)) {
      activeBySlot.add(slot.slotId);
    }
  }

  const colliders: HomeBoxCollider[] = [
    // Interior Bedroom Divider Wall (North-West vs South-West)
    { id: 'bedroom_divider', minX: -8.35, maxX: -4.4, minZ: -0.5, maxZ: -0.3 },
    // Built-in Kitchenette Counter & Sink (North-East)
    { id: 'kitchen_counter', minX: 2.68, maxX: 6.12, minZ: -5.2, maxZ: -4.22 },
  ];

  // Bed Collider (Starter Bed vs Upgraded Bed V1/V2/V3)
  if (activeBySlot.has('cama_quarto')) {
    colliders.push({
      id: 'bed_upgraded',
      minX: -6.48,
      maxX: -4.12,
      minZ: -4.65,
      maxZ: -2.2,
    });
  } else {
    colliders.push({
      id: 'bed_starter',
      minX: -6.15,
      maxX: -4.65,
      minZ: -4.55,
      maxZ: -2.45,
    });
  }

  // Dynamic Purchasable Furniture Colliders (Rugs 'tapete_sala' and Countertop 'cafeteira_casa' are walkable/on counter)
  if (activeBySlot.has('plantas_casa')) {
    colliders.push(
      { id: 'plant_nw', minX: -7.75, maxX: -6.82, minZ: -4.85, maxZ: -3.92 },
      { id: 'plant_sw', minX: -7.75, maxX: -6.82, minZ: 3.72, maxZ: 4.65 },
      { id: 'plant_se', minX: 6.92, maxX: 7.85, minZ: 3.72, maxZ: 4.65 }
    );
  }

  if (activeBySlot.has('estante_quarto')) {
    colliders.push({
      id: 'shelf_bedroom',
      minX: -8.05,
      maxX: -7.22,
      minZ: -2.78,
      maxZ: -1.02,
    });
  }

  if (activeBySlot.has('sofa_sala')) {
    colliders.push(
      { id: 'sofa_main', minX: -6.95, maxX: -4.25, minZ: 2.05, maxZ: 3.12 },
      { id: 'sofa_coffee_table', minX: -5.9, maxX: -4.6, minZ: 1.18, maxZ: 1.78 }
    );
  }

  if (activeBySlot.has('poltrona_leitura')) {
    colliders.push({
      id: 'recliner_bedroom',
      minX: -2.75,
      maxX: -1.75,
      minZ: -4.65,
      maxZ: -3.45,
    });
  }

  if (activeBySlot.has('mesa_jantar')) {
    colliders.push({
      id: 'dining_table',
      minX: 3.05,
      maxX: 5.35,
      minZ: 0.58,
      maxZ: 2.42,
    });
  }

  if (activeBySlot.has('geladeira_cozinha')) {
    colliders.push({
      id: 'fridge_kitchen',
      minX: 6.38,
      maxX: 7.62,
      minZ: -4.95,
      maxZ: -3.98,
    });
  }

  if (activeBySlot.has('tv_sala')) {
    colliders.push({
      id: 'tv_rack',
      minX: -7.05,
      maxX: -4.55,
      minZ: -0.28,
      maxZ: 0.32,
    });
  }

  if (activeBySlot.has('arcade_lazer')) {
    colliders.push({
      id: 'arcade_machine',
      minX: 6.82,
      maxX: 7.85,
      minZ: 0.85,
      maxZ: 2.05,
    });
  }

  if (activeBySlot.has('setup_gamer')) {
    colliders.push({
      id: 'gamer_desk',
      minX: -0.4,
      maxX: 1.62,
      minZ: -4.85,
      maxZ: -3.55,
    });
  }

  return colliders;
}

function collidesWithAnyHomeBox(
  x: number,
  z: number,
  radius: number,
  colliders: HomeBoxCollider[]
): HomeBoxCollider | null {
  for (const box of colliders) {
    const closestX = Math.max(box.minX, Math.min(x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < radius * radius) {
      return box;
    }
  }
  return null;
}

export function clampTapTargetToHomeBounds(target: Vec2): Vec2 {
  return {
    x: Math.max(-7.4, Math.min(7.4, target.x)),
    z: Math.max(-4.6, Math.min(4.6, target.z)),
  };
}

/**
 * Resolves 2D player movement inside the 3D Home map with physical collision against walls,
 * built-in counters, the bed, and all installed 3D furniture pieces.
 */
export function resolveHomePlayerMovement(
  pos: Vec2,
  delta: Vec2,
  purchasedFurnitureIds: string[] = []
): Vec2 {
  const colliders = buildHomeColliders(purchasedFurnitureIds);

  // If the player just bought a furniture piece while standing inside its footprint, gently nudge them out
  const stuckBox = collidesWithAnyHomeBox(pos.x, pos.z, HOME_PLAYER_RADIUS * 0.85, colliders);
  let curX = pos.x;
  let curZ = pos.z;
  if (stuckBox) {
    const centerBoxX = (stuckBox.minX + stuckBox.maxX) * 0.5;
    const centerBoxZ = (stuckBox.minZ + stuckBox.maxZ) * 0.5;
    const pushDirX = curX >= centerBoxX ? 1 : -1;
    const pushDirZ = curZ >= centerBoxZ ? 1 : -1;
    const distToEdgeX =
      pushDirX > 0
        ? stuckBox.maxX + HOME_PLAYER_RADIUS + 0.04 - curX
        : curX - (stuckBox.minX - HOME_PLAYER_RADIUS - 0.04);
    const distToEdgeZ =
      pushDirZ > 0
        ? stuckBox.maxZ + HOME_PLAYER_RADIUS + 0.04 - curZ
        : curZ - (stuckBox.minZ - HOME_PLAYER_RADIUS - 0.04);
    if (distToEdgeX < distToEdgeZ) {
      curX += pushDirX * distToEdgeX;
    } else {
      curZ += pushDirZ * distToEdgeZ;
    }
  }

  // Axis-separated sliding collision (X first, then Z)
  const candidateX = Math.max(-7.5, Math.min(7.5, curX + delta.x));
  if (!collidesWithAnyHomeBox(candidateX, curZ, HOME_PLAYER_RADIUS, colliders)) {
    curX = candidateX;
  }

  const candidateZ = Math.max(-4.5, Math.min(4.6, curZ + delta.z));
  if (!collidesWithAnyHomeBox(curX, candidateZ, HOME_PLAYER_RADIUS, colliders)) {
    curZ = candidateZ;
  }

  return { x: curX, z: curZ };
}

export const HOME_DOOR_POS: Vec2 = { x: 0, z: 4.55 };
export const HOME_BED_POS: Vec2 = { x: -5.3, z: -3.4 };

export function isPlayerNearHomeDoor(pos: Vec2): boolean {
  return Math.hypot(pos.x - HOME_DOOR_POS.x, pos.z - HOME_DOOR_POS.z) <= 2.4;
}

export function isPlayerNearHomeBed(pos: Vec2): boolean {
  return Math.hypot(pos.x - HOME_BED_POS.x, pos.z - HOME_BED_POS.z) <= 3.6;
}
