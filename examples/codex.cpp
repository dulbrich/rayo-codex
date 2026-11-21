#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <string_view>

std::string passage(std::string_view digits, std::size_t start, std::size_t count) {
    const auto available = digits.size() / 2;
    if (start == 0 || start > available || count == 0 || count > available - start + 1)
        throw std::out_of_range("Passage outside the digit file");

    std::string result;
    for (std::size_t i = start - 1; i < start - 1 + count; ++i) {
        const int a = digits[2 * i] - '0';
        const int b = digits[2 * i + 1] - '0';
        if (a < 0 || a > 9 || b < 0 || b > 9)
            throw std::invalid_argument("Expected decimal digits");
        if (i != start - 1) result += '-';
        result += "lmnrsvzfkt"[a];
        result += "aeiou"[b / 2];
        result += "nlkstfmpdr"[(a + b) % 10];
    }
    return result;
}

int main() {
    std::ifstream input("pi.txt");
    std::string digits;
    if (!(input >> digits)) {
        std::cerr << "Could not read pi.txt\n";
        return 1;
    }
    std::cout << passage(digits, 1, 4) << '\n';
}
