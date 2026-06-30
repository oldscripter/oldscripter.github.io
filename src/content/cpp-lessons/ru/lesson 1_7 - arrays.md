---
title: "Arrays and Vectors"
description: "Store collections of data — inventories, high scores, enemy waves, and more"
pubDate: 2026-06-01
tags: ["C++", "beginner", "arrays", "vectors", "collections"]
lang: "ru"
lessonNumber: 7
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 7: Arrays and Vectors

Welcome back! So far, each variable stores ONE value. But games need **collections** — 100 enemies, 50 inventory slots, 10,000 particles. Arrays and vectors solve this.

## What You'll Learn

- **Static arrays** (fixed size, fast, simple)
- **Multi-dimensional arrays** (grids, tilemaps)
- **Vectors** (dynamic size, flexible, modern C++)
- When to use arrays vs vectors
- Common operations: adding, removing, searching
- Iteration patterns

---

## Part 1: Static Arrays (C-Style)

Think of an array as a **row of lockers** — each locker holds one value, all lockers are the same type.

```cpp
#include <iostream>

int main() {
    // Declare array of 5 integers
    int playerScores[5];
    
    // Assign values by index (0-based!)
    playerScores[0] = 95;
    playerScores[1] = 87;
    playerScores[2] = 100;
    playerScores[3] = 76;
    playerScores[4] = 82;
    
    // Access elements
    std::cout << "First score: " << playerScores[0] << std::endl;
    std::cout << "Third score: " << playerScores[2] << std::endl;
    
    // Initialize at declaration
    int enemyHealths[] = {30, 45, 25, 60, 100};  // Size automatically determined
    int itemPrices[4] = {10, 25, 50, 100};       // Explicit size
    
    return 0;
}
```

### Memory Layout

```
Array: [95][87][100][76][82]
Index:  0   1   2   3   4
```

### Important: No Bounds Checking!

```cpp
int arr[5] = {1, 2, 3, 4, 5};

arr[5] = 99;   // ❌ BUG! Index 5 is out of bounds (0-4)
arr[-1] = 42;  // ❌ BUG! Negative index

// This might crash, corrupt data, or silently fail
```

**You are responsible for staying within bounds!**

### Common Array Operations

```cpp
#include <iostream>

int main() {
    // Fixed-size array declaration
    const int MAX_ENEMIES = 10;
    int enemyHealth[MAX_ENEMIES];
    
    // Initialize all to 0
    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemyHealth[i] = 100;
    }
    
    // Damage the third enemy
    enemyHealth[2] -= 35;
    
    // Find total health of all enemies
    int totalHealth = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        totalHealth += enemyHealth[i];
    }
    std::cout << "Total enemy health: " << totalHealth << std::endl;
    
    // Find strongest enemy
    int maxHealth = enemyHealth[0];
    for (int i = 1; i < MAX_ENEMIES; i++) {
        if (enemyHealth[i] > maxHealth) {
            maxHealth = enemyHealth[i];
        }
    }
    std::cout << "Strongest enemy health: " << maxHealth << std::endl;
    
    return 0;
}
```

---

## Part 2: Array Size and `sizeof`

```cpp
#include <iostream>

int main() {
    int scores[] = {10, 20, 30, 40, 50};
    
    // sizeof returns bytes, not element count
    std::cout << "Size of array in bytes: " << sizeof(scores) << std::endl;      // 20 (5 * 4 bytes)
    std::cout << "Size of one element: " << sizeof(scores[0]) << std::endl;      // 4
    
    // Calculate number of elements
    int count = sizeof(scores) / sizeof(scores[0]);
    std::cout << "Number of elements: " << count << std::endl;  // 5
    
    return 0;
}
```

**⚠️ Warning:** This trick only works on the original array, not on pointers (we'll cover that later).

---

## Part 3: Multi-Dimensional Arrays

Perfect for grids, tilemaps, or game boards.

```cpp
#include <iostream>

int main() {
    // 3x3 Tic-Tac-Toe board
    char board[3][3] = {
        {'X', 'O', 'X'},
        {'O', 'X', ' '},
        {' ', ' ', 'O'}
    };
    
    // Access element
    std::cout << "Center: " << board[1][1] << std::endl;  // 'X'
    
    // Print the board
    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            std::cout << board[row][col];
            if (col < 2) std::cout << " | ";
        }
        std::cout << std::endl;
        if (row < 2) std::cout << "---------" << std::endl;
    }
    
    return 0;
}
```

### Real Game Example: Simple Tilemap

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    const int WIDTH = 10;
    const int HEIGHT = 7;
    
    // 0 = empty, 1 = wall, 2 = treasure, 3 = enemy
    int tilemap[HEIGHT][WIDTH] = {0};
    
    // Generate random dungeon
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (x == 0 || x == WIDTH-1 || y == 0 || y == HEIGHT-1) {
                tilemap[y][x] = 1;  // Border walls
            } else if (std::rand() % 10 < 2) {  // 20% chance
                tilemap[y][x] = std::rand() % 3 + 2;  // 2=treasure, 3=enemy
            }
        }
    }
    
    // Render map
    std::cout << "=== DUNGEON MAP ===" << std::endl;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            switch (tilemap[y][x]) {
                case 0: std::cout << "· "; break;  // Empty
                case 1: std::cout << "█ "; break;  // Wall
                case 2: std::cout << "$ "; break;  // Treasure
                case 3: std::cout << "E "; break;  // Enemy
                default: std::cout << "? ";
            }
        }
        std::cout << std::endl;
    }
    
    // Count treasures
    int treasures = 0;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (tilemap[y][x] == 2) treasures++;
        }
    }
    std::cout << "\nTreasures found: " << treasures << std::endl;
    
    return 0;
}
```

---

## Part 4: Introduction to Vectors

Static arrays have a problem: **fixed size**. What if you don't know how many items you'll have?

**Vectors** grow and shrink automatically.

```cpp
#include <iostream>
#include <vector>  // Required!

int main() {
    // Create empty vector
    std::vector<int> playerScores;
    
    // Add elements
    playerScores.push_back(95);   // [95]
    playerScores.push_back(87);   // [95, 87]
    playerScores.push_back(100);  // [95, 87, 100]
    
    // Access elements (same as arrays)
    std::cout << "First score: " << playerScores[0] << std::endl;
    
    // Get size
    std::cout << "Number of scores: " << playerScores.size() << std::endl;
    
    // Remove last element
    playerScores.pop_back();  // [95, 87]
    
    // Iterate with index
    for (int i = 0; i < playerScores.size(); i++) {
        std::cout << playerScores[i] << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Vector Initialization

```cpp
#include <iostream>
#include <vector>

int main() {
    // Empty vector
    std::vector<int> empty;
    
    // Size 5, all elements 0
    std::vector<int> zeros(5);
    
    // Size 10, all elements 100
    std::vector<int> defaults(10, 100);
    
    // Initialize with values
    std::vector<int> enemyHealths = {30, 45, 60, 25, 100};
    
    // Copy from another vector
    std::vector<int> copy = enemyHealths;
    
    std::cout << "enemyHealths size: " << enemyHealths.size() << std::endl;
    std::cout << "First enemy: " << enemyHealths[0] << std::endl;
    std::cout << "Last enemy: " << enemyHealths.back() << std::endl;
    std::cout << "First enemy (alternative): " << enemyHealths.front() << std::endl;
    
    return 0;
}
```

---

## Part 5: Vector Operations

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> inventory;
    
    // Add items
    inventory.push_back("Sword");
    inventory.push_back("Shield");
    inventory.push_back("Health Potion");
    inventory.push_back("Mana Potion");
    
    std::cout << "Inventory: ";
    for (const std::string& item : inventory) {
        std::cout << item << " | ";
    }
    std::cout << std::endl;
    
    // Insert at position (index 1, after first item)
    inventory.insert(inventory.begin() + 1, "Leather Armor");
    
    std::cout << "After inserting armor: ";
    for (const std::string& item : inventory) {
        std::cout << item << " | ";
    }
    std::cout << std::endl;
    
    // Remove element at position 2 (Shield)
    inventory.erase(inventory.begin() + 2);
    
    std::cout << "After removing shield: ";
    for (const std::string& item : inventory) {
        std::cout << item << " | ";
    }
    std::cout << std::endl;
    
    // Check if vector is empty
    if (!inventory.empty()) {
        std::cout << "Inventory has " << inventory.size() << " items" << std::endl;
    }
    
    // Clear all items
    inventory.clear();
    std::cout << "After clearing: " << inventory.size() << " items" << std::endl;
    
    return 0;
}
```

---

## Part 6: Range-Based For Loops with Vectors

The cleanest way to iterate.

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> damageDealt = {15, 22, 8, 35, 12};
    
    // Read-only
    int totalDamage = 0;
    for (int damage : damageDealt) {
        totalDamage += damage;
    }
    std::cout << "Total damage: " << totalDamage << std::endl;
    
    // Modify elements (use reference)
    for (int& damage : damageDealt) {
        damage *= 2;  // Double each damage value
    }
    
    std::cout << "Doubled damage: ";
    for (int damage : damageDealt) {
        std::cout << damage << " ";
    }
    std::cout << std::endl;
    
    // With const reference (avoid copying)
    std::vector<std::string> names = {"Warrior", "Mage", "Rogue"};
    for (const std::string& name : names) {
        std::cout << name << std::endl;
    }
    
    return 0;
}
```

---

## Part 7: Arrays vs Vectors — Which to Use?

| Feature | Static Array | Vector |
|---------|--------------|--------|
| Size | Fixed at compile time | Dynamic, grows/shrinks |
| Memory | Stack (fast) | Heap (slightly slower) |
| Bounds checking | None | `.at()` method checks |
| Convenience | Minimal | Rich methods |
| Performance | Slightly faster | Very close |
| Use when | Size known, small, performance critical | Size unknown, changing, convenience needed |

```cpp
#include <iostream>
#include <vector>

int main() {
    // ✅ Good for arrays: fixed-size game board
    char gameBoard[8][8];  // Chess board, always 8x8
    
    // ✅ Good for vectors: player inventory
    std::vector<std::string> inventory;  // Player can have any number of items
    
    // ✅ Good for arrays: high scores for 10 players
    int highScores[10];
    
    // ✅ Good for vectors: enemies in a level
    std::vector<Enemy> enemies;  // Number of enemies varies
    
    return 0;
}
```

---

## Part 8: Common Patterns with Vectors

### Searching

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> quests = {
        "Slay the Dragon",
        "Find the Amulet",
        "Rescue the Princess",
        "Collect 10 Herbs"
    };
    
    std::string searchFor = "Amulet";
    bool found = false;
    int index = -1;
    
    // Linear search
    for (int i = 0; i < quests.size(); i++) {
        if (quests[i].find(searchFor) != std::string::npos) {
            found = true;
            index = i;
            break;
        }
    }
    
    if (found) {
        std::cout << "Found '" << searchFor << "' at index " << index << std::endl;
    } else {
        std::cout << "Not found" << std::endl;
    }
    
    return 0;
}
```

### Removing All Elements That Match

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {95, 42, 87, 42, 100, 42, 76};
    int valueToRemove = 42;
    
    // Method 1: Traditional loop (moving backwards)
    for (int i = scores.size() - 1; i >= 0; i--) {
        if (scores[i] == valueToRemove) {
            scores.erase(scores.begin() + i);
        }
    }
    
    // Method 2: Modern C++ (erase-remove idiom)
    // scores.erase(std::remove(scores.begin(), scores.end(), valueToRemove), scores.end());
    
    std::cout << "After removing 42s: ";
    for (int score : scores) {
        std::cout << score << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

---

## Complete Example: RPG Inventory System

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>

struct Item {
    std::string name;
    int value;
    int weight;
};

int main() {
    std::vector<Item> inventory;
    int maxWeight = 50;
    int currentWeight = 0;
    
    // Add some starting items
    inventory.push_back({"Iron Sword", 100, 8});
    inventory.push_back({"Leather Armor", 75, 12});
    inventory.push_back({"Health Potion", 50, 1});
    inventory.push_back({"Health Potion", 50, 1});
    inventory.push_back({"Mana Potion", 50, 1});
    
    // Calculate total weight
    for (const Item& item : inventory) {
        currentWeight += item.weight;
    }
    
    bool running = true;
    
    while (running) {
        // Display inventory
        std::cout << "\n========================================" << std::endl;
        std::cout << "              INVENTORY" << std::endl;
        std::cout << "========================================" << std::endl;
        std::cout << std::left << std::setw(20) << "Item Name" 
                  << std::setw(10) << "Value" 
                  << std::setw(10) << "Weight" << std::endl;
        std::cout << "----------------------------------------" << std::endl;
        
        for (size_t i = 0; i < inventory.size(); i++) {
            std::cout << std::left << std::setw(20) << inventory[i].name
                      << std::setw(10) << inventory[i].value
                      << std::setw(10) << inventory[i].weight << std::endl;
        }
        
        std::cout << "----------------------------------------" << std::endl;
        std::cout << "Total weight: " << currentWeight << "/" << maxWeight << std::endl;
        std::cout << "Item count: " << inventory.size() << std::endl;
        
        // Menu
        std::cout << "\nOptions:" << std::endl;
        std::cout << "1. Pick up item" << std::endl;
        std::cout << "2. Drop item" << std::endl;
        std::cout << "3. Quit" << std::endl;
        std::cout << "Choice: ";
        
        int choice;
        std::cin >> choice;
        
        if (choice == 1) {
            // Add item
            Item newItem;
            std::cin.ignore();
            std::cout << "Item name: ";
            std::getline(std::cin, newItem.name);
            std::cout << "Item value: ";
            std::cin >> newItem.value;
            std::cout << "Item weight: ";
            std::cin >> newItem.weight;
            
            // Check weight limit
            if (currentWeight + newItem.weight <= maxWeight) {
                inventory.push_back(newItem);
                currentWeight += newItem.weight;
                std::cout << "Added " << newItem.name << " to inventory!" << std::endl;
            } else {
                std::cout << "Cannot carry " << newItem.name << " — too heavy!" << std::endl;
            }
            
        } else if (choice == 2) {
            // Drop item
            if (inventory.empty()) {
                std::cout << "Inventory is empty!" << std::endl;
                continue;
            }
            
            std::cout << "Enter item number (1-" << inventory.size() << "): ";
            int index;
            std::cin >> index;
            index--;  // Convert to 0-based
            
            if (index >= 0 && index < static_cast<int>(inventory.size())) {
                currentWeight -= inventory[index].weight;
                std::cout << "Dropped " << inventory[index].name << std::endl;
                inventory.erase(inventory.begin() + index);
            } else {
                std::cout << "Invalid item number!" << std::endl;
            }
            
        } else if (choice == 3) {
            running = false;
            std::cout << "Goodbye!" << std::endl;
        }
    }
    
    // Final inventory value
    int totalValue = 0;
    for (const Item& item : inventory) {
        totalValue += item.value;
    }
    std::cout << "Final inventory value: " << totalValue << " gold" << std::endl;
    
    return 0;
}
```

---

## Common Mistakes

### 1. Off-by-One Errors

```cpp
int arr[5] = {1, 2, 3, 4, 5};

// ❌ Wrong — index 5 doesn't exist
for (int i = 0; i <= 5; i++) {
    std::cout << arr[i] << std::endl;
}

// ✅ Correct
for (int i = 0; i < 5; i++) {
    std::cout << arr[i] << std::endl;
}
```

### 2. Using Uninitialized Arrays

```cpp
int scores[5];
// scores contain random garbage values!
scores[0] = 100;  // Only first is initialized

// ✅ Always initialize
int scores[5] = {0};  // All zero
```

### 3. Forgetting `#include <vector>`

```cpp
std::vector<int> myVector;  // ERROR without #include <vector>
```

### 4. Mixing Signed/Unsigned Comparisons

```cpp
std::vector<int> vec = {1, 2, 3};

// ❌ Warning: comparison between signed and unsigned
for (int i = 0; i < vec.size(); i++) { }

// ✅ Use size_t
for (size_t i = 0; i < vec.size(); i++) { }

// ✅ Or range-based for
for (int val : vec) { }
```

### 5. Invalid Iterators After Modification

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};
auto it = vec.begin() + 2;  // Points to 3
vec.erase(it);               // Iterator is now invalid!
// it++;  // ❌ DON'T use it after erase
```

---

## Quick Reference Card

```cpp
// Static array
int arr[size];                           // Declaration
int arr[] = {1, 2, 3};                   // Initialization
arr[0] = 5;                              // Assignment
int x = arr[2];                          // Access

// Multi-dimensional
int grid[rows][cols];
grid[row][col] = value;

// Vector (requires #include <vector>)
std::vector<int> v;                      // Empty
std::vector<int> v(10);                  // Size 10, value 0
std::vector<int> v(10, 5);               // Size 10, all 5s
std::vector<int> v = {1, 2, 3};          // With values

v.push_back(4);                          // Add to end
v.pop_back();                            // Remove from end
v.size();                                // Number of elements
v.empty();                               // True if empty
v.clear();                               // Remove all
v.front();                               // First element
v.back();                                // Last element
v.insert(v.begin() + i, value);          // Insert at position
v.erase(v.begin() + i);                  // Remove at position

// Iteration
for (size_t i = 0; i < v.size(); i++) { }           // Index
for (int val : v) { }                               // Range-based
for (int& val : v) { val *= 2; }                    // Modify
```

---

## Practice Exercises

**Exercise 1 (Easy):** Create an array of 5 integers, fill with user input, then print them in reverse order.

**Exercise 2 (Easy):** Use a vector to store daily temperatures for a week. Ask user for each day's temperature, then calculate average, min, and max.

**Exercise 3 (Medium):** Create a "High Score" system. Store top 10 scores in a vector. When a new score arrives, insert it in the correct position (maintaining sorted order) and keep only top 10.

**Exercise 4 (Medium):** Implement a "Simple Text Editor" using vector of strings for lines. Support: add line, delete line, list all lines, save, load.

**Exercise 5 (Hard):** Create a "Card Game" with:
- Vector of cards (1-10, Jack, Queen, King)
- Shuffle function
- Deal 5 cards to player and computer
- Compare hands to see who wins

**Exercise 6 (Challenge):** Build a "Tile Map Editor" with a 20x15 grid. Allow user to place different tiles (floor, wall, water, lava). Save map to file, load map from file. Use 2D vector.

---

## Summary

You now know:

✅ Static arrays for fixed-size collections  
✅ Multi-dimensional arrays for grids  
✅ Vectors for dynamic, flexible collections  
✅ Adding, removing, and accessing elements  
✅ Iteration patterns (index, range-based)  
✅ When to use arrays vs vectors  
✅ Inventory system as complete example  

## What's Next?

Next lesson: **Functions** — organize code into reusable blocks, avoid repetition, and build complex systems!

---

## Resources

- [std::vector documentation (cppreference)](https://en.cppreference.com/w/cpp/container/vector)
- [Arrays in C++ (learncpp)](https://www.learncpp.com/cpp-tutorial/arrays-part-i/)

---

**Practice Task:** Create a "Party System" for an RPG. Use a vector to store party members (struct with name, health, mana, class). Add functions to add/remove members, heal party, display party status, and sort by health. This combines structs, vectors, and loops!