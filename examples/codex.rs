use std::{error::Error, fs};

fn passage(digits: &str, start: usize, count: usize) -> Result<String, &'static str> {
    let first = start.checked_sub(1).ok_or("Positions start at one")?;
    let available = digits.len() / 2;
    if count == 0 || first >= available || count > available - first {
        return Err("Passage outside the digit file");
    }
    let mut syllables = Vec::new();
    for pair in digits.as_bytes()[2 * first..2 * (first + count)].chunks_exact(2) {
        if !pair.iter().all(u8::is_ascii_digit) {
            return Err("Expected decimal digits");
        }
        let a = usize::from(pair[0] - b'0');
        let b = usize::from(pair[1] - b'0');
        syllables.push(format!("{}{}{}", b"lmnrsvzfkt"[a] as char,
            b"aeiou"[b / 2] as char, b"nlkstfmpdr"[(a + b) % 10] as char));
    }
    Ok(syllables.join("-"))
}

fn main() -> Result<(), Box<dyn Error>> {
    let digits = fs::read_to_string("pi.txt")?;
    println!("{}", passage(digits.trim(), 1, 4)?);
    Ok(())
}
