function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalized = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    const key = word.toLowerCase();
    if (alreadyFilled.has(key)) continue;

    const normalizedWord = normalizeText(word);

    if (normalizedWord.includes(' ')) {
      // Phrase: substring match
      if (normalized.includes(normalizedWord)) {
        detected.push(word);
      }
    } else {
      // Single word: boundary match
      const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, 'i');
      if (regex.test(normalized)) {
        detected.push(word);
      }
    }
  }

  return detected;
}

// Common speech-to-text variations for tricky words
const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration', 'continuous delivery'],
  'mvp': ['minimum viable product', 'm.v.p.'],
  'roi': ['return on investment', 'r.o.i.'],
  'api': ['a.p.i.', 'a p i'],
  'devops': ['dev ops', 'dev-ops'],
  'a/b test': ['a b test', 'ab test', 'split test'],
  'scrum master': ['scrummaster'],
  'product owner': ['po '],
};

export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const detected = detectWords(transcript, cardWords, alreadyFilled);
  const detectedKeys = new Set(detected.map((w) => w.toLowerCase()));
  const normalized = normalizeText(transcript);

  for (const word of cardWords) {
    const key = word.toLowerCase();
    if (alreadyFilled.has(key) || detectedKeys.has(key)) continue;

    const aliases = WORD_ALIASES[key];
    if (aliases) {
      for (const alias of aliases) {
        if (normalized.includes(alias)) {
          detected.push(word);
          detectedKeys.add(key);
          break;
        }
      }
    }
  }

  return detected;
}
