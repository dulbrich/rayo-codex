from pathlib import Path


def _index(value, limit, name):
    if type(value) is not int or not 1 <= value <= limit:
        raise ValueError(f"{name} outside the available range")
    return value - 1


class CodexReader:
    def __init__(self, digits: str):
        self._digits = digits.strip()
        if not (self._digits.isascii() and self._digits.isdigit()) or len(self._digits) % 2:
            raise ValueError("Expected decimal digits of pi in complete pairs, without 3.")

    def syllable(self, position: int) -> str:
        i = 2 * _index(position, len(self._digits) // 2, "Syllable")
        a, b = map(int, self._digits[i:i + 2])
        return "lmnrsvzfkt"[a] + "aeiou"[b // 2] + "nlkstfmpdr"[(a + b) % 10]

    def passage(self, start: int, count: int) -> str:
        available = len(self._digits) // 2
        offset = _index(start, available, "Start")
        _index(count, available - offset, "Count")
        return "-".join(self.syllable(i) for i in range(start, start + count))

    def phrase(self, volume: int, chapter: int, verse: int, phrase: int) -> str:
        v = _index(volume, (len(self._digits) + 7999999) // 8000000, "Volume")
        c = _index(chapter, 1000, "Chapter")
        line = _index(verse, 100, "Verse")
        p = _index(phrase, 10, "Phrase")
        return self.passage(1 + ((v * 1000 + c) * 100 + line) * 40 + p * 4, 4)

    def verse(self, volume: int, chapter: int, verse: int) -> str:
        return " ".join(self.phrase(volume, chapter, verse, p) for p in range(1, 11))

    def chapter(self, volume: int, chapter: int) -> str:
        return "\n".join(f"{v}. {self.verse(volume, chapter, v)}" for v in range(1, 101))


def passage(digits: str, start: int, count: int) -> str:
    return CodexReader(digits).passage(start, count)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Print a Codex chapter.")
    parser.add_argument("volume", type=int, nargs="?", default=1)
    parser.add_argument("chapter", type=int, nargs="?", default=1)
    args = parser.parse_args()
    reader = CodexReader(Path("pi.txt").read_text(encoding="ascii"))
    print(reader.chapter(args.volume, args.chapter))
