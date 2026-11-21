use std::{env, error::Error, fs};

type ResultText = Result<String, &'static str>;

fn index(value: usize, limit: usize) -> Result<usize, &'static str> {
    if value == 0 || value > limit { return Err("Position outside the available range"); }
    Ok(value - 1)
}

// Include this file with mod codex; and borrow the digits for the reader's lifetime.
pub struct CodexReader<'a> { digits: &'a [u8] }

impl<'a> CodexReader<'a> {
    pub fn new(input: &'a str) -> Result<Self, &'static str> {
        let digits = input.trim().as_bytes();
        if digits.is_empty() || digits.len() % 2 != 0 || !digits.iter().all(u8::is_ascii_digit) {
            return Err("Expected decimal digits of pi in complete pairs, without 3.");
        }
        Ok(Self { digits })
    }

    pub fn syllable(&self, position: usize) -> ResultText {
        let i = 2 * index(position, self.digits.len() / 2)?;
        let a = usize::from(self.digits[i] - b'0');
        let b = usize::from(self.digits[i + 1] - b'0');
        Ok(format!("{}{}{}", b"lmnrsvzfkt"[a] as char, b"aeiou"[b / 2] as char,
                   b"nlkstfmpdr"[(a + b) % 10] as char))
    }

    pub fn passage(&self, start: usize, count: usize) -> ResultText {
        let available = self.digits.len() / 2;
        let offset = index(start, available)?;
        index(count, available - offset)?;
        let words: Result<Vec<_>, _> = (0..count).map(|i| self.syllable(start + i)).collect();
        Ok(words?.join("-"))
    }

    pub fn phrase(&self, volume: usize, chapter: usize, verse: usize, phrase: usize) -> ResultText {
        let v = index(volume, self.digits.len().div_ceil(8_000_000))?;
        let c = index(chapter, 1000)?;
        let line = index(verse, 100)?;
        let p = index(phrase, 10)?;
        self.passage(1 + ((v * 1000 + c) * 100 + line) * 40 + p * 4, 4)
    }

    pub fn verse(&self, volume: usize, chapter: usize, verse: usize) -> ResultText {
        let phrases: Result<Vec<_>, _> = (1..=10)
            .map(|p| self.phrase(volume, chapter, verse, p)).collect();
        Ok(phrases?.join(" "))
    }

    pub fn chapter(&self, volume: usize, chapter: usize) -> ResultText {
        let mut lines = Vec::with_capacity(100);
        for verse in 1..=100 {
            lines.push(format!("{}. {}", verse, self.verse(volume, chapter, verse)?));
        }
        Ok(lines.join("\n"))
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut args = env::args().skip(1);
    let volume = args.next().as_deref().unwrap_or("1").parse()?;
    let chapter = args.next().as_deref().unwrap_or("1").parse()?;
    if args.next().is_some() { return Err("Usage: codex [volume] [chapter]".into()); }
    let digits = fs::read_to_string("pi.txt")?;
    println!("{}", CodexReader::new(&digits)?.chapter(volume, chapter)?);
    Ok(())
}
