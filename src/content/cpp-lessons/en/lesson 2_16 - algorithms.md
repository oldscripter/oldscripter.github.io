---
title: "STL Algorithms — Sorting, Searching, and Transforming Data"
description: "Master the algorithm header — write faster, cleaner code with standard algorithms"
pubDate: 2026-05-16
tags: ["C++", "intermediate", "STL", "algorithms", "functional-programming"]
lang: "en"
lessonNumber: 16
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 16: STL Algorithms — Sorting, Searching, and Transforming Data

Welcome back! You've mastered containers. Now it's time to master **algorithms** — the functions that manipulate containers. With STL algorithms, you can write complex operations in one line instead of ten.

## What You'll Learn

- Non-modifying algorithms: `find`, `count`, `search`, `equal`
- Modifying algorithms: `copy`, `transform`, `replace`, `fill`
- Sorting and ordering: `sort`, `stable_sort`, `partial_sort`, `nth_element`
- Set algorithms: `merge`, `set_union`, `set_intersection`
- Min/max and comparisons
- Lambda expressions (C++11) for custom logic
- Parallel algorithms (C++17)

---

## Part 1: Why Use STL Algorithms?

### Without STL Algorithms

```cpp
// ❌ Manual loops are error-prone and verbose
std::vector<int> scores = {95, 87, 100, 76, 92};

// Find first score > 90
int found = -1;
for (size_t i = 0; i < scores.size(); i++) {
    if (scores[i] > 90) {
        found = scores[i];
        break;
    }
}

// Copy even scores to new vector
std::vector<int> evens;
for (int s : scores) {
    if (s % 2 == 0) {
        evens.push_back(s);
    }
}

// Sum all scores
int sum = 0;
for (int s : scores) {
    sum += s;
}
```

### With STL Algorithms

```cpp
// ✅ Clean, expressive, less error-prone
#include <algorithm>
#include <numeric>  // for accumulate

std::vector<int> scores = {95, 87, 100, 76, 92};

// Find first score > 90
auto it = std::find_if(scores.begin(), scores.end(), [](int s) { return s > 90; });

// Copy even scores
std::vector<int> evens;
std::copy_if(scores.begin(), scores.end(), std::back_inserter(evens), 
             [](int s) { return s % 2 == 0; });

// Sum all scores
int sum = std::accumulate(scores.begin(), scores.end(), 0);
```

---

## Part 2: Non-Modifying Algorithms

### Searching with `find`, `find_if`, `find_first_of`

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50, 30, 60};
    
    // Find first occurrence of a value
    auto it = std::find(numbers.begin(), numbers.end(), 30);
    if (it != numbers.end()) {
        std::cout << "Found 30 at position: " << (it - numbers.begin()) << std::endl;
    }
    
    // Find first number > 35
    it = std::find_if(numbers.begin(), numbers.end(), 
                      [](int n) { return n > 35; });
    std::cout << "First number > 35: " << *it << std::endl;
    
    // Find first even number
    it = std::find_if(numbers.begin(), numbers.end(), 
                      [](int n) { return n % 2 == 0; });
    
    // Find first number NOT divisible by 3
    it = std::find_if_not(numbers.begin(), numbers.end(), 
                          [](int n) { return n % 3 == 0; });
    
    // Count occurrences
    int count = std::count(numbers.begin(), numbers.end(), 30);
    std::cout << "30 appears " << count << " times" << std::endl;
    
    // Count if condition
    count = std::count_if(numbers.begin(), numbers.end(), 
                          [](int n) { return n > 25; });
    std::cout << "Numbers > 25: " << count << std::endl;
    
    // Check if all, any, none
    bool allPositive = std::all_of(numbers.begin(), numbers.end(), 
                                    [](int n) { return n > 0; });
    bool anyEven = std::any_of(numbers.begin(), numbers.end(), 
                               [](int n) { return n % 2 == 0; });
    bool noneZero = std::none_of(numbers.begin(), numbers.end(), 
                                  [](int n) { return n == 0; });
    
    std::cout << "All positive: " << allPositive << std::endl;
    std::cout << "Any even: " << anyEven << std::endl;
    std::cout << "None zero: " << noneZero << std::endl;
    
    // Search for subrange
    std::vector<int> pattern = {40, 50};
    it = std::search(numbers.begin(), numbers.end(), 
                     pattern.begin(), pattern.end());
    if (it != numbers.end()) {
        std::cout << "Pattern found at index " << (it - numbers.begin()) << std::endl;
    }
    
    // Find adjacent equal elements
    it = std::adjacent_find(numbers.begin(), numbers.end());
    if (it != numbers.end()) {
        std::cout << "Adjacent equal: " << *it << std::endl;
    }
    
    return 0;
}
```

### Comparing Ranges

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> a = {1, 2, 3, 4, 5};
    std::vector<int> b = {1, 2, 3, 4, 5};
    std::vector<int> c = {1, 2, 3, 4, 6};
    
    // Check if equal
    bool equal = std::equal(a.begin(), a.end(), b.begin());
    std::cout << "a == b: " << equal << std::endl;
    
    equal = std::equal(a.begin(), a.end(), c.begin());
    std::cout << "a == c: " << equal << std::endl;
    
    // Lexicographical comparison (like dictionary order)
    std::vector<int> first = {1, 2, 3};
    std::vector<int> second = {1, 2, 4};
    
    bool less = std::lexicographical_compare(
        first.begin(), first.end(),
        second.begin(), second.end()
    );
    std::cout << "first < second: " << less << std::endl;
    
    // Mismatch — find first difference
    auto mismatch = std::mismatch(a.begin(), a.end(), c.begin());
    if (mismatch.first != a.end()) {
        std::cout << "First difference: a=" << *mismatch.first 
                  << ", c=" << *mismatch.second << std::endl;
    }
    
    return 0;
}
```

---

## Part 3: Modifying Algorithms

### Copy and Transform

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>

int main() {
    std::vector<int> source = {1, 2, 3, 4, 5};
    std::vector<int> dest(source.size());
    
    // Copy entire range
    std::copy(source.begin(), source.end(), dest.begin());
    
    // Copy only first 3 elements
    std::copy_n(source.begin(), 3, dest.begin());
    
    // Copy if condition
    std::vector<int> evens;
    std::copy_if(source.begin(), source.end(), 
                 std::back_inserter(evens),
                 [](int n) { return n % 2 == 0; });
    
    // Transform (apply function to each element)
    std::vector<int> doubled(source.size());
    std::transform(source.begin(), source.end(), doubled.begin(),
                   [](int n) { return n * 2; });
    
    // Transform two ranges into one
    std::vector<int> sums(source.size());
    std::transform(source.begin(), source.end(), doubled.begin(), sums.begin(),
                   [](int a, int b) { return a + b; });
    
    // Generate values
    std::vector<int> generated(5);
    int value = 0;
    std::generate(generated.begin(), generated.end(), 
                  [&value]() { return value += 10; });
    
    // Fill with specific value
    std::vector<int> filled(10);
    std::fill(filled.begin(), filled.end(), 42);
    
    // Replace values
    std::vector<int> data = {1, 2, 3, 2, 4, 2, 5};
    std::replace(data.begin(), data.end(), 2, 99);
    
    // Replace if condition
    std::replace_if(data.begin(), data.end(),
                    [](int n) { return n > 50; }, 0);
    
    // Remove elements (erase-remove idiom)
    data.erase(std::remove(data.begin(), data.end(), 99), data.end());
    
    // Remove if
    data.erase(std::remove_if(data.begin(), data.end(),
                              [](int n) { return n % 2 == 0; }),
               data.end());
    
    return 0;
}
```

### Swapping and Reversing

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5};
    
    // Swap two elements
    std::swap(vec[0], vec[4]);  // {5, 2, 3, 4, 1}
    
    // Swap ranges
    std::vector<int> other = {10, 20, 30};
    std::swap_ranges(vec.begin(), vec.begin() + 3, other.begin());
    
    // Reverse
    std::reverse(vec.begin(), vec.end());
    
    // Rotate (move element to front)
    std::rotate(vec.begin(), vec.begin() + 2, vec.end());
    
    // Shuffle (randomize)
    std::random_device rd;
    std::mt19937 g(rd());
    std::shuffle(vec.begin(), vec.end(), g);
    
    return 0;
}
```

---

## Part 4: Sorting Algorithms

### Basic Sorting

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // Sort ascending (default)
    std::sort(numbers.begin(), numbers.end());
    // {1, 2, 3, 4, 5, 6, 7, 8, 9}
    
    // Sort descending
    std::sort(numbers.begin(), numbers.end(), 
              [](int a, int b) { return a > b; });
    
    // Sort with custom comparator
    std::vector<std::string> words = {"apple", "banana", "kiwi", "grape"};
    std::sort(words.begin(), words.end(),
              [](const std::string& a, const std::string& b) {
                  return a.length() < b.length();
              });
    // {"kiwi", "apple", "grape", "banana"}
    
    // Stable sort (preserves relative order of equal elements)
    std::stable_sort(numbers.begin(), numbers.end());
    
    // Partial sort (only sort first N elements)
    std::partial_sort(numbers.begin(), numbers.begin() + 3, numbers.end());
    // First 3 are smallest, rest unsorted
    
    // Nth element (put Nth smallest element in correct position)
    std::nth_element(numbers.begin(), numbers.begin() + 4, numbers.end());
    // Element at index 4 is the 5th smallest
    
    // Check if sorted
    bool sorted = std::is_sorted(numbers.begin(), numbers.end());
    
    // Find first out-of-order element
    auto it = std::is_sorted_until(numbers.begin(), numbers.end());
    
    return 0;
}
```

### Real Game Example: Score Ranking

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct PlayerScore {
    std::string name;
    int score;
    std::chrono::system_clock::time_point timestamp;
};

int main() {
    std::vector<PlayerScore> scores = {
        {"Kaelen", 2500},
        {"Aria", 3100},
        {"Thorne", 1800},
        {"Luna", 2900},
        {"Zane", 2200},
        {"Kaelen", 2700},  // New high score
        {"Mira", 1950}
    };
    
    // Sort by score descending
    std::sort(scores.begin(), scores.end(),
              [](const PlayerScore& a, const PlayerScore& b) {
                  return a.score > b.score;
              });
    
    std::cout << "=== HIGH SCORES ===" << std::endl;
    for (size_t i = 0; i < std::min(scores.size(), size_t(5)); i++) {
        std::cout << i+1 << ". " << scores[i].name 
                  << " - " << scores[i].score << std::endl;
    }
    
    // Get top 3 scores
    std::vector<PlayerScore> top3(3);
    std::partial_sort_copy(scores.begin(), scores.end(),
                           top3.begin(), top3.end(),
                           [](const PlayerScore& a, const PlayerScore& b) {
                               return a.score > b.score;
                           });
    
    // Find player's best score
    auto best = std::max_element(scores.begin(), scores.end(),
        [](const PlayerScore& a, const PlayerScore& b) {
            return a.score < b.score;
        });
    
    if (best != scores.end()) {
        std::cout << "\nBest score: " << best->name 
                  << " with " << best->score << std::endl;
    }
    
    return 0;
}
```

---

## Part 5: Set Algorithms (for Sorted Ranges)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // Input ranges MUST be sorted
    std::vector<int> set1 = {1, 2, 3, 4, 5, 6};
    std::vector<int> set2 = {4, 5, 6, 7, 8, 9};
    
    std::vector<int> result;
    
    // Union (elements in either set)
    std::set_union(set1.begin(), set1.end(),
                   set2.begin(), set2.end(),
                   std::back_inserter(result));
    // {1, 2, 3, 4, 5, 6, 7, 8, 9}
    
    result.clear();
    
    // Intersection (elements in both sets)
    std::set_intersection(set1.begin(), set1.end(),
                          set2.begin(), set2.end(),
                          std::back_inserter(result));
    // {4, 5, 6}
    
    result.clear();
    
    // Difference (elements in set1 but not set2)
    std::set_difference(set1.begin(), set1.end(),
                        set2.begin(), set2.end(),
                        std::back_inserter(result));
    // {1, 2, 3}
    
    result.clear();
    
    // Symmetric difference (elements in either, not both)
    std::set_symmetric_difference(set1.begin(), set1.end(),
                                  set2.begin(), set2.end(),
                                  std::back_inserter(result));
    // {1, 2, 3, 7, 8, 9}
    
    // Merge two sorted ranges
    std::vector<int> merged;
    std::merge(set1.begin(), set1.end(),
               set2.begin(), set2.end(),
               std::back_inserter(merged));
    
    // Check if one range includes another
    bool includes = std::includes(set1.begin(), set1.end(),
                                  result.begin(), result.end());
    
    return 0;
}
```

### Real Example: Player Inventory Merge

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct Item {
    std::string name;
    int quantity;
    
    bool operator<(const Item& other) const {
        return name < other.name;
    }
};

int main() {
    std::vector<Item> inventory1 = {
        {"Health Potion", 3},
        {"Iron Sword", 1},
        {"Mana Potion", 2},
        {"Shield", 1}
    };
    
    std::vector<Item> inventory2 = {
        {"Health Potion", 2},
        {"Leather Armor", 1},
        {"Mana Potion", 1},
        {"Silver Sword", 1}
    };
    
    // Sort both inventories
    std::sort(inventory1.begin(), inventory1.end());
    std::sort(inventory2.begin(), inventory2.end());
    
    // Merge inventory2 into inventory1
    std::vector<Item> merged;
    std::merge(inventory1.begin(), inventory1.end(),
               inventory2.begin(), inventory2.end(),
               std::back_inserter(merged));
    
    // Combine quantities for duplicate items
    std::vector<Item> combined;
    for (size_t i = 0; i < merged.size(); i++) {
        if (i > 0 && merged[i].name == merged[i-1].name) {
            combined.back().quantity += merged[i].quantity;
        } else {
            combined.push_back(merged[i]);
        }
    }
    
    std::cout << "=== COMBINED INVENTORY ===" << std::endl;
    for (const auto& item : combined) {
        std::cout << item.name << ": " << item.quantity << std::endl;
    }
    
    // Find items in both inventories (intersection)
    std::vector<Item> common;
    std::set_intersection(inventory1.begin(), inventory1.end(),
                          inventory2.begin(), inventory2.end(),
                          std::back_inserter(common));
    
    std::cout << "\n=== ITEMS IN BOTH ===" << std::endl;
    for (const auto& item : common) {
        std::cout << item.name << std::endl;
    }
    
    return 0;
}
```

---

## Part 6: Binary Search (on Sorted Ranges)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 3, 5, 7, 9, 11, 13, 15};
    
    // Binary search (O(log n))
    bool found = std::binary_search(numbers.begin(), numbers.end(), 7);
    std::cout << "Found 7: " << found << std::endl;
    
    // Lower bound (first position where value can be inserted without breaking order)
    auto it = std::lower_bound(numbers.begin(), numbers.end(), 8);
    if (it != numbers.end()) {
        std::cout << "First element >= 8: " << *it << " at index " 
                  << (it - numbers.begin()) << std::endl;
    }
    
    // Upper bound (first position > value)
    it = std::upper_bound(numbers.begin(), numbers.end(), 7);
    std::cout << "First element > 7: " << *it << std::endl;
    
    // Equal range (both bounds)
    auto range = std::equal_range(numbers.begin(), numbers.end(), 7);
    std::cout << "Range for 7: [" << (range.first - numbers.begin())
              << ", " << (range.second - numbers.begin()) << ")" << std::endl;
    
    // With duplicates
    std::vector<int> withDupes = {1, 2, 2, 2, 3, 4, 4, 5};
    auto bounds = std::equal_range(withDupes.begin(), withDupes.end(), 2);
    std::cout << "2 appears " << (bounds.second - bounds.first) << " times" << std::endl;
    
    return 0;
}
```

---

## Part 7: Min/Max and Comparisons

```cpp
#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    // Two values
    int a = 10, b = 20;
    int minVal = std::min(a, b);
    int maxVal = std::max(a, b);
    auto [min, max] = std::minmax(a, b);
    
    // Multiple values (initializer_list)
    int minList = std::min({5, 2, 8, 1, 9});
    int maxList = std::max({5, 2, 8, 1, 9});
    auto minMaxList = std::minmax({5, 2, 8, 1, 9});
    
    // Ranges
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    auto minIt = std::min_element(vec.begin(), vec.end());
    auto maxIt = std::max_element(vec.begin(), vec.end());
    auto minMaxIt = std::minmax_element(vec.begin(), vec.end());
    
    std::cout << "Min: " << *minIt << " at index " 
              << (minIt - vec.begin()) << std::endl;
    std::cout << "Max: " << *maxIt << std::endl;
    
    // Clamp value to range (C++17)
    int value = 15;
    int clamped = std::clamp(value, 0, 10);
    std::cout << "Clamped 15 to [0,10]: " << clamped << std::endl;
    
    return 0;
}
```

---

## Part 8: Partition Operations

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // Partition (reorder so evens go first)
    auto it = std::partition(numbers.begin(), numbers.end(),
                             [](int n) { return n % 2 == 0; });
    
    std::cout << "After partition (evens first): ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\nPartition point: " << (it - numbers.begin()) << std::endl;
    
    // Stable partition (preserves relative order)
    std::vector<int> stable = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    std::stable_partition(stable.begin(), stable.end(),
                          [](int n) { return n % 2 == 0; });
    
    // Check if partitioned
    bool isPartitioned = std::is_partitioned(numbers.begin(), numbers.end(),
                                             [](int n) { return n % 2 == 0; });
    
    // Partition copy
    std::vector<int> evens, odds;
    std::partition_copy(numbers.begin(), numbers.end(),
                        std::back_inserter(evens),
                        std::back_inserter(odds),
                        [](int n) { return n % 2 == 0; });
    
    // Partition point (find where condition becomes false)
    auto partitionPoint = std::partition_point(numbers.begin(), numbers.end(),
                                               [](int n) { return n % 2 == 0; });
    
    return 0;
}
```

---

## Complete Example: Arena Combat System

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <random>
#include <chrono>

struct Combatant {
    std::string name;
    int health;
    int damage;
    int speed;
    bool isAlive;
    
    Combatant(const std::string& n, int h, int d, int s)
        : name(n), health(h), damage(d), speed(s), isAlive(true) {}
    
    void takeDamage(int amount) {
        health -= amount;
        if (health <= 0) {
            health = 0;
            isAlive = false;
        }
    }
    
    bool operator<(const Combatant& other) const {
        return speed > other.speed;  // Higher speed goes first
    }
};

class Arena {
private:
    std::vector<Combatant> combatants;
    std::mt19937 rng;
    
public:
    Arena() : rng(std::chrono::steady_clock::now().time_since_epoch().count()) {}
    
    void addCombatant(const Combatant& c) {
        combatants.push_back(c);
    }
    
    void fight() {
        // Sort by speed (highest first)
        std::sort(combatants.begin(), combatants.end());
        
        std::cout << "=== BATTLE START ===" << std::endl;
        printStatus();
        
        int turn = 0;
        while (std::count_if(combatants.begin(), combatants.end(),
                             [](const Combatant& c) { return c.isAlive; }) > 1) {
            turn++;
            std::cout << "\n--- Turn " << turn << " ---" << std::endl;
            
            // Process turns in speed order
            for (auto& attacker : combatants) {
                if (!attacker.isAlive) continue;
                
                // Find random alive target
                std::vector<Combatant*> alive;
                for (auto& c : combatants) {
                    if (c.isAlive && &c != &attacker) {
                        alive.push_back(&c);
                    }
                }
                
                if (alive.empty()) break;
                
                std::uniform_int_distribution<int> dist(0, alive.size() - 1);
                Combatant* target = alive[dist(rng)];
                
                // Attack
                int damage = attacker.damage + (std::uniform_int_distribution<int>(1, 10)(rng));
                target->takeDamage(damage);
                
                std::cout << attacker.name << " hits " << target->name 
                          << " for " << damage << " damage! (HP: " 
                          << std::max(0, target->health) << ")" << std::endl;
                
                if (!target->isAlive) {
                    std::cout << "⚡ " << target->name << " has been defeated! ⚡" << std::endl;
                }
            }
            
            // Remove dead combatants
            combatants.erase(std::remove_if(combatants.begin(), combatants.end(),
                                            [](const Combatant& c) { return !c.isAlive; }),
                             combatants.end());
        }
        
        // Winner!
        if (!combatants.empty()) {
            std::cout << "\n🏆 WINNER: " << combatants[0].name << "! 🏆" << std::endl;
        }
    }
    
    void printStatus() const {
        std::vector<Combatant> temp = combatants;
        std::sort(temp.begin(), temp.end(), 
                  [](const Combatant& a, const Combatant& b) { return a.name < b.name; });
        
        for (const auto& c : temp) {
            std::cout << c.name << ": ❤️ " << c.health 
                      << " | ⚔️ " << c.damage 
                      << " | ⚡ " << c.speed << std::endl;
        }
    }
    
    void printLeaderboard() const {
        std::vector<Combatant> temp = combatants;
        std::sort(temp.begin(), temp.end(),
                  [](const Combatant& a, const Combatant& b) {
                      return a.health > b.health;
                  });
        
        std::cout << "\n=== HEALTH LEADERBOARD ===" << std::endl;
        for (size_t i = 0; i < std::min(temp.size(), size_t(3)); i++) {
            std::cout << i+1 << ". " << temp[i].name 
                      << " - " << temp[i].health << " HP" << std::endl;
        }
    }
};

int main() {
    Arena arena;
    
    arena.addCombatant({"Kaelen", 120, 25, 15});
    arena.addCombatant({"Aria", 80, 35, 18});
    arena.addCombatant({"Thorne", 150, 20, 10});
    arena.addCombatant({"Luna", 90, 30, 16});
    arena.addCombatant({"Zane", 100, 28, 14});
    arena.addCombatant({"Mira", 110, 22, 12});
    
    arena.fight();
    arena.printLeaderboard();
    
    return 0;
}
```

---

## Part 9: Lambda Expressions Deep Dive

Lambdas are essential for STL algorithms:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // Basic lambda
    auto print = [](int n) { std::cout << n << " "; };
    std::for_each(numbers.begin(), numbers.end(), print);
    
    // Capture by value
    int multiplier = 2;
    auto multiply = [multiplier](int n) { return n * multiplier; };
    
    std::vector<int> doubled;
    std::transform(numbers.begin(), numbers.end(), 
                   std::back_inserter(doubled), multiply);
    
    // Capture by reference
    int sum = 0;
    std::for_each(numbers.begin(), numbers.end(), 
                  [&sum](int n) { sum += n; });
    
    // Mutable lambda (can modify captured values)
    int count = 0;
    auto counter = [count]() mutable { return ++count; };
    
    // Generic lambda (C++14)
    auto genericAdd = [](auto a, auto b) { return a + b; };
    
    // Capture everything
    int x = 10, y = 20;
    auto byValue = [=]() { return x + y; };      // Copy all
    auto byRef = [&]() { x++; y++; };             // Reference all
    
    // Return type deduction
    auto divide = [](double a, double b) -> double {
        if (b == 0) return 0;
        return a / b;
    };
    
    return 0;
}
```

---

## Quick Reference Card

```cpp
// Non-modifying
find(beg, end, val)           // Find first occurrence
find_if(beg, end, pred)       // Find first matching predicate
count(beg, end, val)          // Count occurrences
count_if(beg, end, pred)      // Count matching predicate
all_of(beg, end, pred)        // Check if all match
any_of(beg, end, pred)        // Check if any match
none_of(beg, end, pred)       // Check if none match
equal(beg1, end1, beg2)       // Check if ranges equal
search(beg1, end1, beg2, end2) // Find subrange

// Modifying
copy(beg, end, dest)          // Copy elements
copy_if(beg, end, dest, pred) // Copy if condition
transform(beg, end, dest, op) // Apply function
fill(beg, end, val)           // Fill with value
replace(beg, end, old, new)   // Replace value
replace_if(beg, end, pred, new) // Replace if condition
remove(beg, end, val)         // Remove value (needs erase)
reverse(beg, end)             // Reverse order
rotate(beg, mid, end)         // Rotate elements
swap(a, b)                    // Swap two values

// Sorting
sort(beg, end)                // Sort ascending
sort(beg, end, comp)          // Sort with comparator
stable_sort(beg, end)         // Stable sort
partial_sort(beg, mid, end)   // Partial sort
nth_element(beg, nth, end)    // Partition by nth element
is_sorted(beg, end)           // Check if sorted

// Binary search (requires sorted range)
binary_search(beg, end, val)  // Check if exists
lower_bound(beg, end, val)    // First position >= val
upper_bound(beg, end, val)    // First position > val
equal_range(beg, end, val)    // Both bounds

// Set operations (requires sorted ranges)
set_union(beg1, end1, beg2, end2, dest)
set_intersection(beg1, end1, beg2, end2, dest)
set_difference(beg1, end1, beg2, end2, dest)

// Min/Max
min(a, b)                     // Smaller value
max(a, b)                     // Larger value
minmax(a, b)                  // Pair of both
min_element(beg, end)         // Iterator to minimum
max_element(beg, end)         // Iterator to maximum
clamp(val, low, high)         // Clamp value to range (C++17)

// Numeric (requires <numeric>)
accumulate(beg, end, init)    // Sum or reduce
inner_product(beg1, end1, beg2, init) // Dot product
partial_sum(beg, end, dest)   // Running sum
```

---

## Practice Exercises

**Exercise 1 (Easy):** Use `std::sort` and `std::unique` to remove duplicates from a vector.

**Exercise 2 (Medium):** Create a function that takes two vectors and returns their intersection using `std::set_intersection`.

**Exercise 3 (Medium):** Use `std::transform` to convert a vector of Celsius temperatures to Fahrenheit.

**Exercise 4 (Hard):** Implement a "Search and Highlight" feature for a text document. Use `std::search` to find all occurrences of a word and `std::replace` to wrap them in markup.

**Exercise 5 (Hard):** Build a "Statistics Calculator" using `std::accumulate`, `std::minmax_element`, `std::sort`, `std::nth_element` (for median). Calculate mean, median, mode, min, max.

**Exercise 6 (Challenge):** Create a "Fuzzy Matching" search for an inventory. Use `std::find_if` with a lambda that checks if item name contains the search string (case-insensitive using `std::tolower` and `std::search`).

---

## Summary

You now know:

✅ Non-modifying algorithms (find, count, search)  
✅ Modifying algorithms (copy, transform, replace)  
✅ Sorting and ordering (sort, stable_sort, partial_sort)  
✅ Set algorithms (union, intersection, difference)  
✅ Binary search on sorted ranges  
✅ Partition operations  
✅ Lambda expressions for custom logic  
✅ Complete arena combat system  

## What's Next?

Next lesson: **Smart Pointers and RAII** — deep dive into `unique_ptr`, `shared_ptr`, `weak_ptr`, and resource management!

---

## Resources

- [STL Algorithms (cppreference)](https://en.cppreference.com/w/cpp/algorithm)
- [Algorithm header documentation](https://en.cppreference.com/w/cpp/header/algorithm)
- [Lambda expressions](https://en.cppreference.com/w/cpp/language/lambda)

---

**Practice Task:** Build a "Replay Analyzer" for a game. Read a log file with events (kill, death, item pickup, level up). Use STL algorithms to:
- Find the player's longest kill streak
- Count kills per weapon type
- Find most common death cause
- Calculate average time between events
- Generate a summary report