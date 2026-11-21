#include <charconv>
#include <fstream>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <string>
#include <string_view>
#include <utility>

// Define CODEX_LIBRARY_ONLY before including this file in another program.
class CodexReader {
    std::string digits;

    static std::size_t index(std::size_t value, std::size_t limit) {
        if (value == 0 || value > limit)
            throw std::out_of_range("Position outside the available range");
        return value - 1;
    }

public:
    explicit CodexReader(std::string input) : digits(std::move(input)) {
        const auto first = digits.find_first_not_of(" \r\n\t");
        if (first == std::string::npos) throw std::invalid_argument("Empty digit file");
        digits.erase(digits.find_last_not_of(" \r\n\t") + 1);
        digits.erase(0, first);
        if (digits.size() % 2 || digits.find_first_not_of("0123456789") != std::string::npos)
            throw std::invalid_argument("Expected decimal digits of pi in complete pairs, without 3.");
    }

    std::string syllable(std::size_t position) const {
        const auto i = 2 * index(position, digits.size() / 2);
        const int a = digits[i] - '0', b = digits[i + 1] - '0';
        return { "lmnrsvzfkt"[a], "aeiou"[b / 2], "nlkstfmpdr"[(a + b) % 10] };
    }

    std::string passage(std::size_t start, std::size_t count) const {
        const auto available = digits.size() / 2;
        const auto offset = index(start, available);
        index(count, available - offset);
        std::string result;
        for (std::size_t i = 0; i < count; ++i) {
            if (i) result += '-';
            result += syllable(start + i);
        }
        return result;
    }

    std::string phrase(std::size_t volume, std::size_t chapter, std::size_t verse,
                       std::size_t phrase_number) const {
        const auto v = index(volume, 1 + (digits.size() - 1) / 8000000);
        const auto c = index(chapter, 1000);
        const auto line = index(verse, 100);
        const auto p = index(phrase_number, 10);
        return passage(1 + ((v * 1000 + c) * 100 + line) * 40 + p * 4, 4);
    }

    std::string verse(std::size_t volume, std::size_t chapter, std::size_t number) const {
        std::string result;
        for (int p = 1; p <= 10; ++p) {
            if (p > 1) result += ' ';
            result += phrase(volume, chapter, number, p);
        }
        return result;
    }

    std::string chapter(std::size_t volume, std::size_t number) const {
        std::string result;
        for (int v = 1; v <= 100; ++v) {
            if (v > 1) result += '\n';
            result += std::to_string(v) + ". " + verse(volume, number, v);
        }
        return result;
    }
};

inline std::string passage(std::string_view digits, std::size_t start, std::size_t count) {
    return CodexReader(std::string(digits)).passage(start, count);
}

#ifndef CODEX_LIBRARY_ONLY
static std::size_t argument(std::string_view text) {
    std::size_t value;
    auto end = text.data() + text.size();
    auto parsed = std::from_chars(text.data(), end, value);
    if (parsed.ec != std::errc{} || parsed.ptr != end)
        throw std::invalid_argument("Expected a whole number");
    return value;
}

int main(int argc, char** argv) {
    try {
        if (argc > 3) throw std::invalid_argument("Usage: codex [volume] [chapter]");
        std::ifstream input("pi.txt");
        if (!input) throw std::runtime_error("Could not read pi.txt");
        std::string digits{std::istreambuf_iterator<char>(input), {}};
        CodexReader reader(std::move(digits));
        std::cout << reader.chapter(argc > 1 ? argument(argv[1]) : 1,
                                    argc > 2 ? argument(argv[2]) : 1) << '\n';
    } catch (const std::exception& e) {
        std::cerr << e.what() << '\n';
        return 1;
    }
}
#endif
