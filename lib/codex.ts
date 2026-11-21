/** Public Rayo Codex language specification, v2. */
export const ONSETS = "LMNRSVZFKT";
export const VOWELS = "AEIOU";
export const CODAS = "NLKSTFMPDR";
export const MAX_SYLLABLES = 100_000;
export const MAX_LETTERS = MAX_SYLLABLES * 3;
export const MAX_LETTER_REQUEST = 360;
export const SYLLABLES_PER_PHRASE = 4;
export const PHRASES_PER_VERSE = 10;
export const VERSES_PER_CHAPTER = 100;
export const CHAPTERS_PER_VOLUME = 1000;
export const SYLLABLES_PER_VERSE = 40;
export const SYLLABLES_PER_CHAPTER = 4000;
export const SYLLABLES_PER_VOLUME = 4_000_000;
export interface Address { volume: number; chapter: number; verse: number; phrase: number; }
export const INITIAL_ADDRESS: Address = { volume: 1, chapter: 3, verse: 17, phrase: 4 };
export function isValidAddress(a: Address): boolean {
  return Number.isSafeInteger(a.volume) && a.volume >= 1 &&
    Number.isSafeInteger(a.chapter) && a.chapter >= 1 && a.chapter <= CHAPTERS_PER_VOLUME &&
    Number.isSafeInteger(a.verse) && a.verse >= 1 && a.verse <= VERSES_PER_CHAPTER &&
    Number.isSafeInteger(a.phrase) && a.phrase >= 1 && a.phrase <= PHRASES_PER_VERSE;
}
export function startSyllable(a: Address): number {
  if (!isValidAddress(a)) throw new RangeError("Invalid Codex address");
  return (a.volume-1)*SYLLABLES_PER_VOLUME +
    (a.chapter-1)*SYLLABLES_PER_CHAPTER + (a.verse-1)*SYLLABLES_PER_VERSE +
    (a.phrase-1)*SYLLABLES_PER_PHRASE + 1;
}
export function isAddressArchived(a: Address): boolean {
  return isValidAddress(a) && startSyllable(a)+3 <= MAX_SYLLABLES;
}
export function syllableForPair(number: number): string {
  if (!Number.isInteger(number) || number < 0 || number > 99) throw new RangeError("Expected a pair from 00 to 99");
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  return ONSETS[tens] + VOWELS[Math.floor(ones / 2)] + CODAS[(tens + ones) % CODAS.length];
}
export function syllableAt(digits: string, position: number): string {
  if (!Number.isSafeInteger(position) || position < 1 || position > MAX_SYLLABLES) throw new RangeError("Syllable out of archive bounds");
  const pair = digits.slice((position-1)*2,(position-1)*2+2);
  if (!/^\d{2}$/.test(pair)) throw new Error("Pi digit archive incomplete");
  return syllableForPair(Number(pair));
}
export function syllablesAt(digits: string, start: number, count: number): string[] {
  if (!Number.isSafeInteger(count) || count < 1 || count > 122 || !Number.isSafeInteger(start) || start < 1 || start+count-1 > MAX_SYLLABLES)
    throw new RangeError("Invalid syllable range");
  return Array.from({length:count},(_,i)=>syllableAt(digits,start+i));
}
export function lettersAt(digits: string, start: number, end: number): string {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start ||
      end > MAX_LETTERS || end-start+1 > MAX_LETTER_REQUEST) throw new RangeError("Letter range outside archive or over 360 characters");
  const first=Math.floor((start-1)/3)+1, last=Math.floor((end-1)/3)+1;
  return syllablesAt(digits,first,last-first+1).join("").slice((start-1)%3,(start-1)%3+end-start+1);
}
export function formatPhrase(syllables:string[]):string {
  return syllables.map((s,i)=>i===0?s:s.toLowerCase()).join("-");
}
export function formatVerse(syllables:string[]):string {
  const phrases:string[]=[];
  for (let i=0;i<syllables.length;i+=4) phrases.push(formatPhrase(syllables.slice(i,i+4)));
  return phrases.join(" / ");
}
export function padded(n:number,w=4):string { return String(n).padStart(w,"0"); }
