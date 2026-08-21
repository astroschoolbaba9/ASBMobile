// mobile-app/src/utils/chaldeanRecommendations.ts
// ==========================================================
// 100% Algorithmic Parity Port of Python numerology_engine.py
// ==========================================================

export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export const STRONG_COMPOUNDS = [14, 19, 23, 32, 37, 41, 46];
export const STRONG_NUMBERS = [14, 19, 23, 32, 37, 41, 46];
export const MEDIUM_NUMBERS = [10, 11, 15, 21, 24, 33, 42];
export const WEAK_NUMBERS = [12, 13, 16, 18, 26, 29, 34, 38];

export const POWERFUL_ROOTS = new Set([1, 3, 5, 6]);
export const MASTER_NUMBERS = new Set([11, 22, 33]);

// Traditional enemy conflict pairs: (1,8) and (3,6)
export const ENEMY_PAIRS: [number, number][] = [
  [1, 8],
  [3, 6],
];

export const FRIENDLY_GROUPS = [
  new Set([1, 2, 3]),
  new Set([4, 5, 6]),
  new Set([7, 8, 9]),
  new Set([1, 4, 7]),
  new Set([2, 5, 8]),
  new Set([3, 6, 9]),
];

export const PROFESSION_RULES: Record<string, { preferred: number[]; avoid: number[] }> = {
  teacher: { preferred: [3, 5, 9], avoid: [6, 8] },
  business: { preferred: [1, 5, 6], avoid: [2, 7] },
  artist: { preferred: [3, 5, 6], avoid: [4, 8] },
  doctor: { preferred: [7, 5], avoid: [8] },
  politician: { preferred: [1, 3, 9], avoid: [2] },
  others: { preferred: [], avoid: [] },
};

// ── Core Calculations ──────────────────────────────────────
export function calculateName(name: string) {
  if (!name || typeof name !== 'string') {
    return { name: '', compound: 0, root: 0, letters: [] };
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return { name: '', compound: 0, root: 0, letters: [] };
  }

  let total = 0;
  const letters: { letter: string; value: number }[] = [];

  for (const char of trimmed.toUpperCase()) {
    if (CHALDEAN_MAP[char]) {
      const val = CHALDEAN_MAP[char];
      letters.push({ letter: char, value: val });
      total += val;
    }
  }

  let root = total;
  while (root > 9 && !MASTER_NUMBERS.has(root)) {
    root = String(root).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }

  const titleCased = trimmed
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    name: titleCased,
    compound: total,
    root,
    letters,
  };
}

export function rootNumber(n: number): number {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}

export function getStrength(compound: number): string {
  if (STRONG_NUMBERS.includes(compound)) return 'Strong';
  if (MEDIUM_NUMBERS.includes(compound)) return 'Medium';
  return 'Weak';
}

const UI_PROFESSION_MAP: Record<string, string> = {
  'it & software': 'business',
  'business & entrepreneurship': 'business',
  'finance & banking': 'business',
  'medical & health': 'doctor',
  'arts & entertainment': 'artist',
  'law & judiciary': 'politician',
  'politics & governance': 'politician',
  'sports & fitness': 'others',
  'education & research': 'teacher',
  'media & journalism': 'artist',
  'others': 'others',
};

export function chooseTargetByProfession(currentValue: number, profession: string = 'others'): number {
  const raw = (profession || 'others').toLowerCase().trim();
  const prof = UI_PROFESSION_MAP[raw] || raw;
  const rules = PROFESSION_RULES[prof] || PROFESSION_RULES.others;

  if (prof === 'others' || !rules || (!rules.preferred.length && !rules.avoid.length)) {
    return STRONG_COMPOUNDS.reduce((closest, num) =>
      Math.abs(num - currentValue) < Math.abs(closest - currentValue) ? num : closest,
      STRONG_COMPOUNDS[0]
    );
  }

  const scored = STRONG_COMPOUNDS.map((num) => {
    const r = rootNumber(num);
    const priority = rules.preferred.includes(r) ? 0 : rules.avoid.includes(r) ? 2 : 1;
    return { priority, dist: Math.abs(num - currentValue), num };
  });

  scored.sort((a, b) => a.priority - b.priority || a.dist - b.dist);
  return scored[0].num;
}

export function calculateDobNumbers(dob: string): { driver: number; destiny: number } {
  if (!dob || typeof dob !== 'string') return { driver: 0, destiny: 0 };
  const parts = dob.trim().split(/[\/\-]/);
  if (parts.length !== 3) return { driver: 0, destiny: 0 };

  let day: number, month: number, year: number;
  if (parts[0].length === 4) {
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return { driver: 0, destiny: 0 };

  let driver = day;
  while (driver > 9) {
    driver = String(driver).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }

  let destiny = day + month + year;
  while (destiny > 9 && !MASTER_NUMBERS.has(destiny)) {
    destiny = String(destiny).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }

  return { driver, destiny };
}

// ── Root & Compatibility Checks ───────────────────────────
export function isRootCompatible(nameRoot: number, driver: number, destiny: number): boolean {
  if (MASTER_NUMBERS.has(nameRoot)) return true;

  for (const [a, b] of ENEMY_PAIRS) {
    if (driver && !MASTER_NUMBERS.has(driver)) {
      if ((a === nameRoot && b === driver) || (b === nameRoot && a === driver)) return false;
    }
    if (destiny && !MASTER_NUMBERS.has(destiny)) {
      if ((a === nameRoot && b === destiny) || (b === nameRoot && a === destiny)) return false;
    }
  }
  return true;
}

export function rootCompatibilityLabel(nameRoot: number, driver: number, destiny: number): string {
  if (!isRootCompatible(nameRoot, driver, destiny)) return 'Poor';

  let score = 0;
  for (const group of FRIENDLY_GROUPS) {
    if (group.has(nameRoot) && group.has(driver)) score += 2;
    if (group.has(nameRoot) && group.has(destiny)) score += 2;
    if (group.has(driver) && group.has(destiny)) score += 1;
  }

  if (nameRoot === driver && driver === destiny) return 'Excellent';
  if (MASTER_NUMBERS.has(nameRoot)) return 'Excellent';
  if (score >= 6) return 'Excellent';
  if (score >= 3) return 'Good';
  return 'Average';
}

export function calculateRecommendationScore(
  compound: number,
  target: number,
  strength: string,
  compat: string
): number {
  let score = Math.abs(compound - target) * 10;
  score += strength === 'Strong' ? 0 : strength === 'Medium' ? 5 : 10;
  score += compat.includes('Excellent') ? 0 : compat === 'Good' ? 3 : compat === 'Average' ? 6 : 9;
  if (compound === target) score -= 20;
  return score;
}

// ── Real Name Phonetic Swaps & Realism Filters ─────────────
const PHONETIC_SWAPS: [string, string][] = [
  ['v', 'w'],
  ['k', 'c'],
  ['s', 'z'],
  ['ck', 'k'],
  ['ph', 'f'],
  ['sh', 's'],
  ['th', 't'],
  ['kh', 'k'],
  ['gh', 'g'],
  ['dh', 'd'],
  ['bh', 'b'],
  ['tt', 't'],
  ['nn', 'n'],
  ['ll', 'l'],
  ['mm', 'm'],
  ['rr', 'r'],
  ['ss', 's'],
  ['pp', 'p'],
  ['ee', 'i'],
  ['aa', 'a'],
  ['oo', 'u'],
  ['ai', 'ei'],
  ['ae', 'a'],
  ['ea', 'e'],
  ['ou', 'o'],
  ['au', 'a'],
  ['ie', 'i'],
  ['ey', 'ay'],
  ['ya', 'ia'],
  ['yu', 'iu'],
];

const TRAILING_ADD = ['a', 'e', 'i', 'aa', 'ah'];
const TRAILING_REMOVE = ['a', 'e', 'i', 'ah'];

function looksReal(name: string): boolean {
  if (name.length < 3) return false;
  const n = name.toLowerCase();
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

  if (![...n].some((c) => vowels.has(c))) return false;

  const allowedClusters = new Set([
    'shr', 'str', 'scr', 'spl', 'spr', 'thr', 'chr', 'phr',
    'shk', 'nsh', 'ksh', 'shn', 'ngh',
  ]);

  for (let i = 0; i < n.length - 2; i++) {
    const trio = n.slice(i, i + 3);
    if ([...trio].every((c) => !vowels.has(c)) && !allowedClusters.has(trio)) {
      return false;
    }
  }

  for (let i = 0; i < n.length - 2; i++) {
    if (n[i] === n[i + 1] && n[i] === n[i + 2]) return false;
  }

  return true;
}

export function generateRealisticSpellingVariations(name: string, isLastName: boolean = false): string[] {
  const base = name.trim().toLowerCase();
  if (!base) return [];

  const results = new Set<string>();
  results.add(base);

  // 1. Phonetic swap
  for (const [oldVal, newVal] of PHONETIC_SWAPS) {
    if (base.includes(oldVal)) results.add(base.replace(oldVal, newVal));
    if (base.includes(newVal)) results.add(base.replace(newVal, oldVal));
  }

  // 2. Double / un-double single vowel
  for (let i = 0; i < base.length; i++) {
    const ch = base[i];
    if ('aeiou'.includes(ch)) {
      results.add(base.slice(0, i) + ch + ch + base.slice(i + 1));
      if (i > 0 && base[i - 1] === ch) {
        results.add(base.slice(0, i - 1) + ch + base.slice(i + 1));
      }
    }
  }

  // 3. Natural consonants
  const doublingOk = new Set(['l', 'n', 'r', 'm', 's', 'p', 't']);
  for (let i = 0; i < base.length; i++) {
    const ch = base[i];
    if (doublingOk.has(ch) && !'aeiou'.includes(ch)) {
      if (i === 0 || base[i - 1] !== ch) {
        results.add(base.slice(0, i) + ch + ch + base.slice(i + 1));
      }
      if (i > 0 && base[i - 1] === ch) {
        results.add(base.slice(0, i) + base.slice(i + 1));
      }
    }
  }

  // 4. Trailing
  for (const suffix of TRAILING_ADD) results.add(base + suffix);
  for (const suffix of TRAILING_REMOVE) {
    if (base.endsWith(suffix) && base.length - suffix.length >= 3) {
      results.add(base.slice(0, -suffix.length));
    }
  }

  // 5. Filter realism
  const valid: string[] = [];
  for (const v of results) {
    if (looksReal(v)) {
      if (isLastName) {
        const lenDiff = Math.abs(v.length - base.length);
        if (lenDiff > 1) continue;
        let charDiff = 0;
        const minLen = Math.min(v.length, base.length);
        for (let i = 0; i < minLen; i++) {
          if (v[i] !== base[i]) charDiff++;
        }
        if (charDiff + lenDiff <= 1) valid.push(v);
      } else {
        valid.push(v);
      }
    }
  }

  const titleCased = Array.from(new Set(valid)).map((v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase());
  titleCased.sort();
  const origTitle = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  return [origTitle, ...titleCased.filter((v) => v !== origTitle)];
}

export function singleNameRecoveryVariants(name: string): string[] {
  const base = (name || '').trim().toLowerCase();
  if (!base) return [];

  const variants = new Set<string>();
  variants.add(base);

  const baseVars = generateRealisticSpellingVariations(base, false);
  for (const v of baseVars) variants.add(v.toLowerCase());

  for (const candidate of Array.from(variants)) {
    const lower = candidate.toLowerCase();
    variants.add(lower);
    const fixes: [string, string][] = [
      ['aee', 'i'], ['ee', 'i'], ['ae', 'a'], ['ea', 'e'], ['ai', 'a'],
      ['ei', 'i'], ['ie', 'i'], ['aa', 'a'], ['oo', 'u'], ['ou', 'o'],
      ['au', 'a'], ['ya', 'ia'], ['yu', 'iu'],
    ];
    for (const [oldVal, newVal] of fixes) {
      if (lower.includes(oldVal)) {
        variants.add(lower.replace(oldVal, newVal));
      }
    }

    const letters = [...lower];
    for (let i = 0; i < letters.length - 1; i++) {
      if ('aeiou'.includes(letters[i]) && letters[i + 1] === letters[i]) {
        variants.add(letters.slice(0, i).join('') + letters[i] + letters.slice(i + 2).join(''));
      }
    }
  }

  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of Array.from(variants).sort()) {
    const clean = item.trim().charAt(0).toUpperCase() + item.trim().slice(1).toLowerCase();
    if (clean.length >= 3 && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }
  return out;
}

export function collectFamilyMiddleNames(familyNames: string[]): string[] {
  const naturalPrefixes = new Set([
    'S', 'Sh', 'Sha', 'Shree', 'R', 'Ra', 'Ram', 'D', 'Da', 'Day',
    'K', 'Ka', 'Kri', 'L', 'La', 'Lak', 'V', 'Vi', 'Vij', 'P', 'Pr', 'Pra',
    'M', 'Ma', 'Mah', 'G', 'Ga', 'Gau',
  ]);
  const commonMiddle = new Set(['Devi', 'Lal', 'Das', 'Kumar', 'Singh', 'Bai']);
  const validInitials = new Set(['A', 'B', 'D', 'G', 'K', 'L', 'M', 'P', 'R', 'S', 'V']);

  const results = new Set<string>();
  for (const n of familyNames || []) {
    if (!n || typeof n !== 'string') continue;
    const clean = n.trim().charAt(0).toUpperCase() + n.trim().slice(1).toLowerCase();
    if (!clean) continue;

    const firstChar = clean[0].toUpperCase();
    if (/[A-Z]/.test(firstChar)) results.add(firstChar);
    if (clean.length >= 2 && naturalPrefixes.has(clean.slice(0, 2))) results.add(clean.slice(0, 2));
    if (clean.length >= 3 && naturalPrefixes.has(clean.slice(0, 3))) results.add(clean.slice(0, 3));
    if (commonMiddle.has(clean) || clean.length <= 4) results.add(clean);
  }
  return Array.from(results).filter((r) => r.length > 1 || validInitials.has(r));
}

const MIDDLE_BANK: Record<number, string[]> = {
  1: ['A', 'Ai', 'Jai', 'Raj'],
  2: ['B', 'Bala', 'Ram'],
  3: ['C', 'Gal', 'Lal', 'Sri'],
  4: ['D', 'Das', 'Mala', 'Tara'],
  5: ['E', 'Hem', 'Neel', 'Hari'],
  6: ['Uma', 'Vasu', 'Dev'],
  7: ['Om', 'Zara'],
  8: ['Fay', 'Pal'],
  9: ['Ira', 'Nara', 'Raj'],
  10: ['Asha', 'Daya', 'Kala'],
  11: ['Anuj', 'Ravi', 'Shiv'],
  12: ['Anup', 'Bela', 'Gita'],
  13: ['Arun', 'Mani'],
  14: ['Arjun', 'Leela'],
  15: ['Asha', 'Neela'],
  16: ['Ohm', 'Pari'],
  17: ['Priya', 'Rohan'],
  18: ['Rahul', 'Simran'],
  19: ['Radha', 'Sunil'],
  20: ['Raman', 'Seema'],
  21: ['Ramesh', 'Sunita'],
  22: ['Rakesh', 'Varsha'],
};

export function targetNameBuilder(first: string, last: string, target: number): any[] {
  const fVal = calculateName(first).compound;
  const lVal = calculateName(last).compound;
  const needed = target - (fVal + lVal);
  if (needed <= 0) return [];

  const candidates = MIDDLE_BANK[needed] || [];
  const results: any[] = [];

  for (const m of candidates) {
    const full = `${first.trim()} ${m} ${last.trim()}`.trim();
    const calc = calculateName(full);
    if (calc.compound === target) {
      results.push({
        name: calc.name,
        compound: calc.compound,
        root: calc.root,
        strength: getStrength(calc.compound),
      });
    }
  }
  return results.slice(0, 5);
}

// ── Main Recommendation Engine ────────────────────────────
export function generatePriorityRecommendations(
  firstName: string,
  lastName: string,
  target: number,
  driver: number,
  destiny: number,
  familyNames: string[] = []
): {
  priority_1: any[];
  priority_2: any[];
  priority_3: any[];
  priority_4: any[];
  best: any | null;
} {
  const isSingleName = !lastName || lastName.trim() === '';
  const firstVars = generateRealisticSpellingVariations(firstName, false);
  const lastVars = isSingleName ? [] : generateRealisticSpellingVariations(lastName, true);

  const joinName = (...parts: string[]) =>
    parts
      .filter(Boolean)
      .map((p) => p.trim())
      .join(' ')
      .replace(/\s+/g, ' ');

  const createEntry = (fullName: string, exactOnly: boolean = true): any | null => {
    const calc = calculateName(fullName);
    if (exactOnly && calc.compound !== target) return null;
    if (!POWERFUL_ROOTS.has(calc.root)) return null;
    if (!isRootCompatible(calc.root, driver, destiny)) return null;

    const strength = getStrength(calc.compound);
    const compatibility = rootCompatibilityLabel(calc.root, driver, destiny);
    const score = calculateRecommendationScore(calc.compound, target, strength, compatibility);

    return {
      name: calc.name,
      spelling: calc.name,
      compound: calc.compound,
      root: calc.root,
      strength,
      compatibility,
      score,
    };
  };

  const dedupeSort = (list: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    const sorted = [...list].sort((a, b) => a.score - b.score);
    for (const item of sorted) {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    }
    return out;
  };

  const originalFirst = firstName.trim().toLowerCase();
  const originalLast = isSingleName ? '' : lastName.trim().toLowerCase();

  // P1: First name only
  let p1: any[] = [];
  const seenP1 = new Set<string>();
  const candidateFirsts = isSingleName
    ? Array.from(new Set([...firstVars, ...singleNameRecoveryVariants(firstName)]))
    : firstVars;

  for (const f of candidateFirsts) {
    if (f.toLowerCase() === originalFirst) continue;
    const full = isSingleName ? f : joinName(f, lastName);
    if (seenP1.has(full.toLowerCase())) continue;
    seenP1.add(full.toLowerCase());
    const entry = createEntry(full);
    if (entry) p1.push(entry);
  }
  p1 = dedupeSort(p1).slice(0, 5);

  // P2: Last name only or middle for single
  let p2: any[] = [];
  const seenP2 = new Set<string>();
  if (isSingleName) {
    const p2Raw = targetNameBuilder(firstName, '', target);
    if (familyNames && familyNames.length > 0) {
      const mids = collectFamilyMiddleNames(familyNames);
      for (const m of mids) {
        const full = joinName(firstName, m);
        const calc = calculateName(full);
        if (calc.compound === target && POWERFUL_ROOTS.has(calc.root)) {
          p2Raw.push({
            name: full,
            compound: calc.compound,
            root: calc.root,
            strength: getStrength(calc.compound),
          });
        }
      }
    }
    for (const item of p2Raw) {
      const entry = createEntry(item.name);
      if (entry && !seenP2.has(entry.name.toLowerCase())) {
        seenP2.add(entry.name.toLowerCase());
        p2.push(entry);
      }
    }
  } else {
    for (const l of lastVars) {
      if (l.toLowerCase() === originalLast) continue;
      const full = joinName(firstName, l);
      if (seenP2.has(full.toLowerCase())) continue;
      seenP2.add(full.toLowerCase());
      const entry = createEntry(full);
      if (entry) p2.push(entry);
    }
  }
  p2 = dedupeSort(p2).slice(0, 5);

  // P3: Both changed
  let p3: any[] = [];
  const seenP3 = new Set<string>();
  if (!isSingleName) {
    for (const f of firstVars) {
      for (const l of lastVars) {
        if (f.toLowerCase() === originalFirst || l.toLowerCase() === originalLast) continue;
        const full = joinName(f, l);
        if (seenP3.has(full.toLowerCase())) continue;
        seenP3.add(full.toLowerCase());
        const entry = createEntry(full);
        if (entry) p3.push(entry);
      }
    }
  }
  p3 = dedupeSort(p3).slice(0, 5);

  // P4: Middle name
  let p4: any[] = [];
  if (!isSingleName && !p1.length && !p2.length && !p3.length) {
    const p4Raw = targetNameBuilder(firstName, lastName, target);
    for (const item of p4Raw) {
      const entry = createEntry(item.name);
      if (entry) p4.push(entry);
    }
    p4 = dedupeSort(p4).slice(0, 5);
  }

  // Fallbacks if nothing matched exact target
  if (!p1.length && !p2.length && !p3.length && !p4.length) {
    for (const f of firstVars) {
      if (f.toLowerCase() === originalFirst) continue;
      const full = isSingleName ? f : joinName(f, lastName);
      const entry = createEntry(full, false);
      if (entry) p1.push(entry);
    }
    p1 = dedupeSort(p1).slice(0, 5);
  }

  let best: any | null = null;
  for (const list of [p1, p2, p3, p4]) {
    if (list.length > 0) {
      best = list[0];
      break;
    }
  }

  return { priority_1: p1, priority_2: p2, priority_3: p3, priority_4: p4, best };
}

// ── Drop-in Local Recommendations Runner ──────────────────
export function generateLocalRecommendations(
  fullName: string,
  dob: string,
  profession: string = 'others'
): any[] {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return [];

  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  const { driver, destiny } = calculateDobNumbers(dob);
  const currentCalc = calculateName(fullName);
  const target = chooseTargetByProfession(currentCalc.compound, profession);

  const res = generatePriorityRecommendations(firstName, lastName, target, driver, destiny);

  const combined: any[] = [];
  if (res.best) combined.push(res.best);
  combined.push(...res.priority_1, ...res.priority_2, ...res.priority_3, ...res.priority_4);

  const seen = new Set<string>();
  const out: any[] = [];
  for (const item of combined) {
    const key = (item.name || item.spelling || '').trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out.slice(0, 8);
}
