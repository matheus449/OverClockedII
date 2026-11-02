/**
 * Brazilian Portuguese (pt-BR) Grapheme-to-Phoneme (G2P) IPA Converter
 * Engineered specifically for Kokoro-82M v1.0 ONNX ('pf_dora' & 'pm_alex' voices).
 * Outputs eSpeak-compatible Brazilian Portuguese IPA strings using strictly
 * tokens present in Kokoro-82M's 115-symbol vocabulary.
 */

// Exact IPA & punctuation characters supported by Kokoro-82M v1.0 tokenizer
const KOKORO_VALID_CHARS = new Set([
  ';', ':', ',', '.', '!', '?', '—', '…', '"', '(', ')', '“', '”', ' ',
  '\u0303', // combining tilde ̃
  'ʣ', 'ʥ', 'ʦ', 'ʨ', 'ᵝ', 'ꭧ', 'ᵊ',
  'a', 'b', 'c', 'd', 'e', 'f', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'ɑ', 'ɐ', 'ɒ', 'æ', 'β', 'ɔ', 'ɕ', 'ç', 'ɖ', 'ð', 'ʤ', 'ə', 'ɚ', 'ɛ',
  'ɜ', 'ɟ', 'ɡ', 'ɥ', 'ɨ', 'ɪ', 'ʝ', 'ɯ', 'ɰ', 'ŋ', 'ɳ', 'ɲ', 'ɴ', 'ø',
  'ɸ', 'θ', 'œ', 'ɹ', 'ɾ', 'ɻ', 'ʁ', 'ɽ', 'ʂ', 'ʃ', 'ʈ', 'ʧ', 'ʊ', 'ʋ',
  'ʌ', 'ɣ', 'ɤ', 'χ', 'ʎ', 'ʒ', 'ʔ', 'ˈ', 'ˌ', 'ː', 'ʰ', 'ʲ', 'ᵻ',
]);

// High-frequency & irregular Portuguese words (exact eSpeak pt-br IPA)
const PT_BR_LEXICON: Record<string, string> = {
  // Unstressed function words (no primary stress mark)
  'a': 'a',
  'as': 'as',
  'o': 'u',
  'os': 'us',
  'e': 'i',
  'ou': 'ow',
  'de': 'ʤi',
  'do': 'du',
  'dos': 'dus',
  'da': 'da',
  'das': 'das',
  'em': 'ẽj̃',
  'no': 'nu',
  'nos': 'nus',
  'na': 'na',
  'nas': 'nas',
  'um': 'ũ',
  'uma': 'ˈũmɐ',
  'uns': 'ũs',
  'umas': 'ˈũmɐs',
  'por': 'poɾ',
  'para': 'pˈaɾɐ',
  'pra': 'pɾa',
  'pro': 'pɾu',
  'com': 'kõ',
  'sem': 'sˈẽj̃',
  'que': 'ki',
  'se': 'si',
  'me': 'mi',
  'te': 'ʧi',
  'lhe': 'ʎi',
  'ao': 'aw',
  'aos': 'aws',
  'à': 'a',
  'às': 'as',
  'pelo': 'pˈelu',
  'pela': 'pˈelɐ',
  'pelos': 'pˈelus',
  'pelas': 'pˈelɐs',

  // Pronouns & common verbs/adverbs
  'eu': 'ˈew',
  'tu': 'tˈu',
  'ele': 'ˈeli',
  'ela': 'ˈɛlɐ',
  'eles': 'ˈelis',
  'elas': 'ˈɛlɐs',
  'nós': 'nˈɔs',
  'você': 'vosˈe',
  'vocês': 'vosˈes',
  'meu': 'mˈew',
  'meus': 'mˈews',
  'minha': 'mˈĩɲɐ',
  'minhas': 'mˈĩɲɐs',
  'seu': 'sˈew',
  'seus': 'sˈews',
  'sua': 'sˈuɐ',
  'suas': 'sˈuɐs',
  'nosso': 'nˈɔsu',
  'nossa': 'nˈɔsɐ',
  'nossos': 'nˈɔsus',
  'nossas': 'nˈɔsɐs',
  'este': 'ˈesʧi',
  'esta': 'ˈestɐ',
  'esse': 'ˈesi',
  'essa': 'ˈɛsɐ',
  'isso': 'ˈisu',
  'isto': 'ˈistu',
  'aquilo': 'akˈilu',
  'aqui': 'akˈi',
  'ali': 'alˈi',
  'aí': 'aˈi',
  'lá': 'lˈa',
  'já': 'ʒˈa',
  'só': 'sˈɔ',
  'não': 'nˈɐ̃w̃',
  'sim': 'sˈĩ',
  'mais': 'mˈajs',
  'menos': 'mˈẽnus',
  'muito': 'mˈũj̃tu',
  'muita': 'mˈũj̃tɐ',
  'muitos': 'mˈũj̃tus',
  'muitas': 'mˈũj̃tɐs',
  'tudo': 'tˈudu',
  'todos': 'tˈodus',
  'todas': 'tˈodɐs',
  'todo': 'tˈodu',
  'toda': 'tˈodɐ',
  'nada': 'nˈadɐ',
  'bem': 'bˈẽj̃',
  'bom': 'bˈõ',
  'boa': 'bˈoɐ',
  'bons': 'bˈõs',
  'boas': 'bˈoɐs',
  'mal': 'mˈaw',
  'mau': 'mˈaw',
  'hoje': 'ˈoʒi',
  'ontem': 'ˈõtẽj̃',
  'amanhã': 'amɐ̃ɲˈɐ̃',
  'agora': 'aɡˈɔɾɐ',
  'sempre': 'sˈẽpɾi',
  'nunca': 'nˈũkɐ',
  'ainda': 'aˈĩdɐ',
  'também': 'tɐ̃bˈẽj̃',
  'alguém': 'awɡˈẽj̃',
  'ninguém': 'nĩɡˈẽj̃',
  'quem': 'kˈẽj̃',
  'qual': 'kwˈaw',
  'quais': 'kwˈajs',
  'quando': 'kwˈɐ̃du',
  'quanto': 'kwˈɐ̃tu',
  'como': 'kˈõmu',
  'onde': 'ˈõʤi',
  'porque': 'poʁkˈe',
  'porquê': 'poʁkˈe',
  'é': 'ˈɛ',
  'são': 'sˈɐ̃w̃',
  'foi': 'fˈoj',
  'era': 'ˈɛɾɐ',
  'está': 'estˈa',
  'estão': 'estˈɐ̃w̃',
  'estou': 'estˈow',
  'estamos': 'estˈɐ̃mus',
  'estava': 'estˈavɐ',
  'estavam': 'estˈavɐ̃w̃',
  'tem': 'tˈẽj̃',
  'têm': 'tˈẽj̃',
  'tenho': 'tˈẽɲu',
  'tinha': 'tˈĩɲɐ',
  'há': 'ˈa',
  'vai': 'vˈaj',
  'vão': 'vˈɐ̃w̃',
  'vou': 'vˈow',
  'vamos': 'vˈɐ̃mus',
  'pode': 'pˈɔʤi',
  'podem': 'pˈɔʤẽj̃',
  'posso': 'pˈɔsu',
  'quer': 'kˈɛʁ',
  'quero': 'kˈɛɾu',

  // Words with 'x' or open/closed vowel specifics in the game
  'próximo': 'pɾˈɔsimu',
  'próxima': 'pɾˈɔsimɐ',
  'máximo': 'mˈasimu',
  'máxima': 'mˈasimɐ',
  'trouxe': 'tɾˈowsi',
  'exame': 'ezˈɐ̃mi',
  'exemplo': 'ezˈẽplu',
  'executivo': 'ezekuʧˈivu',
  'executiva': 'ezekuʧˈivɐ',
  'conexão': 'koneksˈɐ̃w̃',
  'conexões': 'koneksˈõj̃s',
  'fixo': 'fˈiksu',
  'fixa': 'fˈiksɐ',
  'fluxo': 'flˈuksu',
  'anexo': 'anˈɛksu',
  'auxílio': 'awsˈiliu',
  'texto': 'tˈestu',
  'sexta': 'sˈestɐ',
  'excelente': 'eselˈẽʧi',
  'experiência': 'espeɾiˈẽsiɐ',
  'exatamente': 'ezatɐmˈẽʧi',
  'existe': 'ezˈisʧi',
  'existem': 'ezˈisʧẽj̃',
  'caixa': 'kˈajʃɐ',
  'baixo': 'bˈajʃu',
  'baixa': 'bˈajʃɐ',
  'deixar': 'dejʃˈaʁ',
  'deixa': 'dˈejʃɐ',
  'deixou': 'dejʃˈow',
  'mexer': 'meʃˈeʁ',
  'puxar': 'puʃˈaʁ',
  'frouxo': 'fɾˈowʃu',
  'frouxa': 'fɾˈowʃɐ',
  'roxo': 'ʁˈoʃu',
  'roxa': 'ʁˈoʃɐ',
  'taxa': 'tˈaʃɐ',
  'lixo': 'lˈiʃu',
  'faixa': 'fˈajʃɐ',
  'peixe': 'pˈejʃi',
  'fechar': 'feʃˈaʁ',
  'fechamento': 'feʃɐmˈẽtu',

  // Domain & Game vocabulary
  'deus': 'dˈews',
  'graças': 'ɡɾˈasɐs',
  'helena': 'elˈẽnɐ',
  'vasconcelos': 'vaskõsˈɛlus',
  'gerente': 'ʒeɾˈẽʧi',
  'empresa': 'ẽpɾˈezɐ',
  'período': 'peɾˈiudu',
  'super': 'sˈupeʁ',
  'corrido': 'koʁˈidu',
  'correria': 'koʁeɾˈiɐ',
  'projeto': 'pɾoʒˈɛtu',
  'projetos': 'pɾoʒˈɛtus',
  'equipamento': 'ekipɐmˈẽtu',
  'equipamentos': 'ekipɐmˈẽtus',
  'problema': 'pɾoblˈẽmɐ',
  'problemas': 'pɾoblˈẽmɐs',
  'mesmo': 'mˈezmu',
  'tempo': 'tˈẽpu',
  'cada': 'kˈadɐ',
  'acerto': 'asˈeʁtu',
  'soma': 'sˈõmɐ',
  'ponto': 'pˈõtu',
  'pontos': 'pˈõtus',
  'liberar': 'libeɾˈaʁ',
  'roupa': 'ʁˈowpɐ',
  'roupas': 'ʁˈowpɐs',
  'acessório': 'asesˈɔɾiu',
  'acessórios': 'asesˈɔɾius',
  'cuidado': 'kwidˈadu',
  'erro': 'ˈeʁu',
  'erros': 'ˈeʁus',
  'ficar': 'fikˈaʁ',
  'devendo': 'devˈẽdu',
  'começar': 'komesˈaʁ',
  'comece': 'komˈɛsi',
  'sugiro': 'suʒˈiɾu',
  'chamado': 'ʃɐmˈadu',
  'chamados': 'ʃɐmˈadus',
  'setor': 'setˈoʁ',
  'setores': 'setˈoɾis',
  'computador': 'kõputadˈoʁ',
  'computadores': 'kõputadˈoɾis',
  'sistema': 'sistˈẽmɐ',
  'operacional': 'opeɾasionˈaw',
  'impressora': 'ĩpɾesˈoɾɐ',
  'impressoras': 'ĩpɾesˈoɾɐs',
  'servidor': 'seʁvidˈoʁ',
  'servidores': 'seʁvidˈoɾis',
  'rede': 'ʁˈeʤi',
  'redes': 'ʁˈeʤis',
  'cabo': 'kˈabu',
  'cabos': 'kˈabus',
  'monitor': 'mõnitˈoʁ',
  'energia': 'eneʁʒˈiɐ',
  'café': 'kafˈɛ',
  'cafés': 'kafˈɛs',
  'cafeteria': 'kafeteɾˈiɐ',
  'obrigado': 'obɾiɡˈadu',
  'obrigada': 'obɾiɡˈadɐ',
  'ordem': 'ˈɔʁdẽj̃',
  'hora': 'ˈɔɾɐ',
  'horas': 'ˈɔɾɐs',
  'horário': 'oɾˈaɾiu',
  'pico': 'pˈiku',
  'analista': 'anɐlˈistɐ',
  'suporte': 'supˈɔʁʧi',
  'manutenção': 'mɐ̃nutẽsˈɐ̃w̃',
  'recepção': 'ʁesepsˈɐ̃w̃',
  'financeiro': 'finɐ̃sˈejɾu',
  'comercial': 'komeʁsiˈaw',
  'marketing': 'mˈaʁkeʧĩ',
  'desenvolvimento': 'dezẽvowvimˈẽtu',
  'laboratório': 'laboɾatˈɔɾiu',
  'reuniões': 'ʁewniˈõj̃s',
  'estoque': 'estˈɔki',
  'convivência': 'kõvivˈẽsiɐ',
  'administrativo': 'aʤministɾaʧˈivu',
};

const NUMBER_WORDS: Record<number, string> = {
  0: 'zero',
  1: 'um',
  2: 'dois',
  3: 'três',
  4: 'quatro',
  5: 'cinco',
  6: 'seis',
  7: 'sete',
  8: 'oito',
  9: 'nove',
  10: 'dez',
  11: 'onze',
  12: 'doze',
  13: 'treze',
  14: 'quatorze',
  15: 'quinze',
  16: 'dezesseis',
  17: 'dezessete',
  18: 'dezoito',
  19: 'dezenove',
  20: 'vinte',
  30: 'trinta',
  40: 'quarenta',
  50: 'cinquenta',
  60: 'sessenta',
  70: 'setenta',
  80: 'oitenta',
  90: 'noventa',
  100: 'cem',
};

function numberToPortugueseWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return String(n);
  if (NUMBER_WORDS[n]) return NUMBER_WORDS[n];
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    return `${NUMBER_WORDS[tens]} e ${NUMBER_WORDS[ones]}`;
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    const hNames = [
      '',
      'cento',
      'duzentos',
      'trezentos',
      'quatrocentos',
      'quinhentos',
      'seiscentos',
      'setecentos',
      'oitocentos',
      'novecentos',
    ];
    if (rem === 0) return hundreds === 1 ? 'cem' : hNames[hundreds];
    return `${hNames[hundreds]} e ${numberToPortugueseWords(rem)}`;
  }
  return String(n);
}

export function normalizePortugueseText(rawText: string): string {
  return rawText
    .replace(/["“”«»]/g, '')
    .replace(/\bDra\./gi, 'Doutora')
    .replace(/\bDr\./gi, 'Doutor')
    .replace(/\bOverOS\b/gi, 'Over ó ésse')
    .replace(/\bOverCoffee\b/gi, 'Over cófi')
    .replace(/\bNexusCorp\b/gi, 'néksus córp')
    .replace(/\bPCs\b/g, 'computadores')
    .replace(/\bPC\b/g, 'computador')
    .replace(/\bSO\b/g, 'sistema operacional')
    .replace(/\bTI\b/g, 'tê i')
    .replace(/\bRH\b/g, 'érre agá')
    .replace(/\bWi-Fi\b/gi, 'uai fai')
    .replace(/\bUSB\b/gi, 'u ésse bê')
    .replace(/\bHDMI\b/gi, 'agá dê ême i')
    .replace(/\bDNS\b/gi, 'dê êne ésse')
    .replace(/\bDHCP\b/gi, 'dê agá cê pê')
    .replace(/\bIP\b/g, 'i pê')
    .replace(/\bRAM\b/g, 'memória rã')
    .replace(/\bSSD\b/gi, 'ésse ésse dê')
    .replace(/\bCPU\b/gi, 'cê pê u')
    .replace(/\bHD\b/g, 'agá dê')
    .replace(/\bpts\b/gi, 'pontos')
    .replace(/%/g, ' por cento')
    .replace(/\b\d{1,3}\b/g, (m) => numberToPortugueseWords(parseInt(m, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

const VOWEL_CHARS = new Set([
  'a', 'e', 'i', 'o', 'u',
  'á', 'é', 'í', 'ó', 'ú',
  'â', 'ê', 'ô',
  'ã', 'õ',
  'à', 'ü',
]);

const ACCENTED_VOWELS = new Set(['á', 'é', 'í', 'ó', 'ú', 'â', 'ê', 'ô', 'ã', 'õ']);

function isVowel(ch: string): boolean {
  return VOWEL_CHARS.has(ch);
}

/**
 * Converts a single lowercase Portuguese word into eSpeak-compatible Brazilian Portuguese IPA.
 */
function convertWordToPtBrIpa(rawWord: string): string {
  const word = rawWord.toLowerCase().trim();
  if (!word) return '';

  if (PT_BR_LEXICON[word]) {
    return PT_BR_LEXICON[word];
  }

  // Handle hyphenated words recursively
  if (word.includes('-')) {
    return word
      .split('-')
      .filter(Boolean)
      .map((part) => convertWordToPtBrIpa(part))
      .join(' ');
  }

  const len = word.length;

  // Step 1: Locate vowel nuclei (syllable centers) to determine primary stress position
  const nucleiIndices: number[] = [];
  let idx = 0;
  while (idx < len) {
    const ch = word[idx];
    // Skip 'u' in 'qu'/'gu' before vowel
    if (
      (ch === 'q' || ch === 'g') &&
      word[idx + 1] === 'u' &&
      idx + 2 < len &&
      isVowel(word[idx + 2])
    ) {
      idx += 2;
      continue;
    }
    if (isVowel(ch)) {
      nucleiIndices.push(idx);
      // Group diphthongs (e.g. ai, ei, oi, ui, au, eu, ou, ão, õe, ãe) as a single syllable nucleus
      const next = word[idx + 1];
      if (
        next &&
        (next === 'i' ||
          next === 'u' ||
          (ch === 'ã' && next === 'o') ||
          (ch === 'õ' && next === 'e') ||
          (ch === 'ã' && next === 'e'))
      ) {
        idx += 2;
        continue;
      }
    }
    idx++;
  }

  // Determine which nucleus index receives primary stress ˈ
  let stressedNucleusCharPos = -1;
  for (let i = 0; i < len; i++) {
    if (ACCENTED_VOWELS.has(word[i])) {
      // Find the nucleus that contains or starts at this accented vowel
      stressedNucleusCharPos = i;
      for (const nPos of nucleiIndices) {
        if (Math.abs(nPos - i) <= 1) {
          stressedNucleusCharPos = nPos;
          break;
        }
      }
      break;
    }
  }

  if (stressedNucleusCharPos === -1 && nucleiIndices.length > 0) {
    if (nucleiIndices.length === 1) {
      stressedNucleusCharPos = nucleiIndices[0];
    } else {
      // Portuguese default stress rules:
      // Oxytone if ending in r, l, z, x, i, is, u, us, im, ins, um, uns, om, ons
      const isOxytone = /(?:[rlzx]|[iu]s?|[iuo]m|[iuo]ns)$/.test(word);
      stressedNucleusCharPos = isOxytone
        ? nucleiIndices[nucleiIndices.length - 1]
        : nucleiIndices[nucleiIndices.length - 2];
    }
  }

  // Step 2: Walk through characters and emit IPA phonemes
  let out = '';
  let i = 0;
  let stressEmitted = false;

  while (i < len) {
    const ch = word[i];
    const next = word[i + 1] || '';
    const next2 = word[i + 2] || '';
    const prev = i > 0 ? word[i - 1] : '';

    // Insert primary stress marker right before the stressed vowel nucleus
    if (!stressEmitted && i === stressedNucleusCharPos) {
      out += 'ˈ';
      stressEmitted = true;
    }

    // 1. Multi-character vowel / nasal endings
    if (ch === 'ã' && next === 'o') {
      out += 'ɐ̃w̃';
      i += 2;
      continue;
    }
    if (ch === 'õ' && next === 'e') {
      out += 'õj̃';
      i += 2;
      continue;
    }
    if (ch === 'ã' && next === 'e') {
      out += 'ɐ̃j̃';
      i += 2;
      continue;
    }

    // Word-final "-am" (unstressed 3rd person plural verb ending, e.g., falaram -> falˈaɾɐ̃w̃)
    if (ch === 'a' && next === 'm' && i + 2 === len) {
      out += 'ɐ̃w̃';
      i += 2;
      continue;
    }

    // Word-final "-em" or "-ens" -> ẽj̃ / ẽj̃s
    if (
      (ch === 'e' || ch === 'ê') &&
      ((next === 'm' && i + 2 === len) ||
        (next === 'n' && next2 === 's' && i + 3 === len))
    ) {
      out += 'ẽj̃';
      if (next === 'n') {
        out += 's';
        i += 3;
      } else {
        i += 2;
      }
      continue;
    }

    // Nasal vowel before syllable-closing m/n (followed by consonant or end of word, except nh/m+vowel/n+vowel)
    if (
      isVowel(ch) &&
      (next === 'm' || next === 'n') &&
      next2 !== 'h' &&
      !isVowel(next2)
    ) {
      const baseVowel = ch.normalize('NFD')[0];
      if (baseVowel === 'a') out += 'ɐ̃';
      else if (baseVowel === 'e') out += 'ẽ';
      else if (baseVowel === 'i') out += 'ĩ';
      else if (baseVowel === 'o') out += 'õ';
      else if (baseVowel === 'u') out += 'ũ';
      i += 2;
      continue;
    }

    // Vowel + i/u oral diphthongs
    if (isVowel(ch) && (next === 'i' || next === 'u') && !ACCENTED_VOWELS.has(next)) {
      let v1 = 'a';
      if (ch === 'a' || ch === 'á') v1 = 'a';
      else if (ch === 'â' || ch === 'ã') v1 = 'ɐ̃';
      else if (ch === 'e' || ch === 'ê') v1 = 'e';
      else if (ch === 'é') v1 = 'ɛ';
      else if (ch === 'o' || ch === 'ô') v1 = 'o';
      else if (ch === 'ó') v1 = 'ɔ';
      else if (ch === 'u' || ch === 'ú') v1 = 'u';
      else if (ch === 'i' || ch === 'í') v1 = 'i';

      const glide = next === 'i' ? 'j' : 'w';
      out += v1 + glide;
      i += 2;
      continue;
    }

    // Single vowels
    if (isVowel(ch)) {
      const isFinalUnstressed =
        i !== stressedNucleusCharPos &&
        (i === len - 1 || (i === len - 2 && next === 's'));

      // Nasalize vowel if followed by 'nh' or 'm'/'n' + vowel in stressed position
      const beforeNasalConsonant =
        (next === 'n' && next2 === 'h') ||
        (i === stressedNucleusCharPos && (next === 'm' || next === 'n') && isVowel(next2));

      if (ch === 'á') out += 'a';
      else if (ch === 'â') out += 'ɐ̃';
      else if (ch === 'ã') out += 'ɐ̃';
      else if (ch === 'à') out += 'a';
      else if (ch === 'é') out += 'ɛ';
      else if (ch === 'ê') out += beforeNasalConsonant ? 'ẽ' : 'e';
      else if (ch === 'í') out += 'i';
      else if (ch === 'ó') out += 'ɔ';
      else if (ch === 'ô') out += beforeNasalConsonant ? 'õ' : 'o';
      else if (ch === 'õ') out += 'õ';
      else if (ch === 'ú' || ch === 'ü') out += 'u';
      else if (ch === 'a') {
        if (beforeNasalConsonant) out += 'ɐ̃';
        else if (isFinalUnstressed) out += 'ɐ';
        else out += 'a';
      } else if (ch === 'e') {
        if (beforeNasalConsonant) out += 'ẽ';
        else if (isFinalUnstressed) out += 'i';
        else out += 'e';
      } else if (ch === 'i') {
        out += beforeNasalConsonant ? 'ĩ' : 'i';
      } else if (ch === 'o') {
        if (beforeNasalConsonant) out += 'õ';
        else if (isFinalUnstressed) out += 'u';
        else out += 'o';
      } else if (ch === 'u') {
        out += beforeNasalConsonant ? 'ũ' : 'u';
      }
      i++;
      continue;
    }

    // 2. Consonant digraphs
    if (ch === 'l' && next === 'h') {
      out += 'ʎ';
      i += 2;
      continue;
    }
    if (ch === 'n' && next === 'h') {
      out += 'ɲ';
      i += 2;
      continue;
    }
    if (ch === 'c' && next === 'h') {
      out += 'ʃ';
      i += 2;
      continue;
    }
    if (ch === 'r' && next === 'r') {
      out += 'ʁ';
      i += 2;
      continue;
    }
    if (ch === 's' && next === 's') {
      out += 's';
      i += 2;
      continue;
    }
    if (ch === 's' && (next === 'c' || next === 'ç') && (next2 === 'e' || next2 === 'i' || next2 === 'é' || next2 === 'ê' || next2 === 'í')) {
      out += 's';
      i += 2;
      continue;
    }
    if (ch === 'q' && next === 'u') {
      if (next2 === 'e' || next2 === 'i' || next2 === 'é' || next2 === 'ê' || next2 === 'í') {
        out += 'k';
      } else {
        out += 'kw';
      }
      i += 2;
      continue;
    }
    if (ch === 'g' && next === 'u') {
      if (next2 === 'e' || next2 === 'i' || next2 === 'é' || next2 === 'ê' || next2 === 'í') {
        out += 'ɡ';
        i += 2;
        continue;
      } else if (isVowel(next2)) {
        out += 'ɡw';
        i += 2;
        continue;
      }
    }

    // 3. Single consonants with Brazilian Portuguese contextual allophones
    if (ch === 'h') {
      // Silent in Portuguese
      i++;
      continue;
    }

    if (ch === 't') {
      const unstressedFinalE =
        next === 'e' &&
        i + 1 !== stressedNucleusCharPos &&
        (i + 2 === len || (i + 3 === len && next2 === 's'));
      if (next === 'i' || next === 'í' || unstressedFinalE) {
        out += 'ʧ';
      } else {
        out += 't';
      }
      i++;
      continue;
    }

    if (ch === 'd') {
      const unstressedFinalE =
        next === 'e' &&
        i + 1 !== stressedNucleusCharPos &&
        (i + 2 === len || (i + 3 === len && next2 === 's'));
      if (next === 'i' || next === 'í' || unstressedFinalE) {
        out += 'ʤ';
      } else {
        out += 'd';
      }
      i++;
      continue;
    }

    if (ch === 'c') {
      if (next === 'e' || next === 'i' || next === 'é' || next === 'ê' || next === 'í') {
        out += 's';
      } else {
        out += 'k';
      }
      i++;
      continue;
    }

    if (ch === 'ç') {
      out += 's';
      i++;
      continue;
    }

    if (ch === 'g') {
      if (next === 'e' || next === 'i' || next === 'é' || next === 'ê' || next === 'í') {
        out += 'ʒ';
      } else {
        out += 'ɡ'; // U+0261 IPA script g
      }
      i++;
      continue;
    }

    if (ch === 'j') {
      out += 'ʒ';
      i++;
      continue;
    }

    if (ch === 'r') {
      // Word-initial 'r', after n/l/s, or syllable-final (before consonant or end of word) -> ʁ
      if (i === 0 || prev === 'n' || prev === 'l' || prev === 's' || !isVowel(next)) {
        out += 'ʁ';
      } else {
        out += 'ɾ';
      }
      i++;
      continue;
    }

    if (ch === 'l') {
      // L-vocalization in Brazilian Portuguese: syllable-final 'l' becomes 'w'
      if (!isVowel(next)) {
        out += 'w';
      } else {
        out += 'l';
      }
      i++;
      continue;
    }

    if (ch === 's') {
      // Intervocalic 's' -> 'z'
      if (isVowel(prev) && isVowel(next)) {
        out += 'z';
      } else {
        out += 's';
      }
      i++;
      continue;
    }

    if (ch === 'z') {
      if (i === len - 1) {
        out += 's';
      } else {
        out += 'z';
      }
      i++;
      continue;
    }

    if (ch === 'x') {
      // 'ex' + vowel at start of word -> 'ez'
      if (i === 1 && prev === 'e' && isVowel(next)) {
        out += 'z';
      } else if (i === len - 1) {
        out += 'ks';
      } else {
        out += 'ʃ';
      }
      i++;
      continue;
    }

    if (ch === 'k') {
      out += 'k';
      i++;
      continue;
    }
    if (ch === 'w') {
      out += 'w';
      i++;
      continue;
    }
    if (ch === 'y') {
      out += 'i';
      i++;
      continue;
    }

    if (KOKORO_VALID_CHARS.has(ch)) {
      out += ch;
    }
    i++;
  }

  return out;
}

/**
 * Converts a full Brazilian Portuguese sentence into a Kokoro-compatible IPA phoneme string,
 * preserving punctuation tokens (; : , . ! ? —) for natural prosody and pauses.
 */
export function phonemizePortugueseSentence(sentence: string): string {
  const normalized = normalizePortugueseText(sentence);
  if (!normalized) return '';

  // Tokenize into words and punctuation
  const tokens = normalized.match(/[a-záéíóúâêôãõàüç-]+|[;:,.!?—…]/gi) || [];
  const resultParts: string[] = [];

  for (const token of tokens) {
    if (/^[;:,.!?—…]$/.test(token)) {
      if (resultParts.length > 0) {
        resultParts[resultParts.length - 1] += token;
      }
    } else {
      const ipa = convertWordToPtBrIpa(token);
      if (ipa) {
        resultParts.push(ipa);
      }
    }
  }

  // Filter strictly to valid Kokoro vocabulary characters (decomposing precomposed nasal vowels into base + \u0303)
  const joined = resultParts
    .join(' ')
    .replace(/ã/g, 'ɐ\u0303')
    .normalize('NFD');
  let sanitized = '';
  for (const ch of joined) {
    if (ch === 'g') {
      sanitized += 'ɡ';
    } else if (KOKORO_VALID_CHARS.has(ch)) {
      sanitized += ch;
    }
  }

  return sanitized.replace(/\s+/g, ' ').trim();
}
