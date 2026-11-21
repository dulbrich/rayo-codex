from pathlib import Path


def passage(digits: str, start: int, count: int) -> str:
    """Read count syllables starting at one-based position start."""
    if start < 1 or count < 1 or start - 1 + count > len(digits) // 2:
        raise ValueError("Passage outside the digit file")
    syllables = []
    for i in range(start - 1, start - 1 + count):
        pair = digits[2*i : 2*i+2]
        if not (pair.isascii() and pair.isdigit()):
            raise ValueError("Expected decimal digits")
        a, b = map(int, pair)
        syllables.append("lmnrsvzfkt"[a] + "aeiou"[b // 2] + "nlkstfmpdr"[(a + b) % 10])
    return "-".join(syllables)


if __name__ == "__main__":
    digits = Path("pi.txt").read_text(encoding="ascii").strip()
    print(passage(digits, 1, 4))
