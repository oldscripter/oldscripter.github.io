---
title: "Loops: while, do-while, and for"
description: "Repeat code efficiently — from game loops to processing thousands of enemies"
pubDate: 2026-06-01
tags: ["C++", "beginner", "loops", "iteration", "game-loop"]
lessonNumber: 6
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 6: Loops — while, do-while, and for

Welcome back! So far, our programs run each line once and stop. But games need repetition — updating 60 times per second, processing hundreds of enemies, drawing thousands of particles. **Loops** make this possible.

## What You'll Learn

- `while` loops (repeat while condition is true)
- `do-while` loops (run at least once)
- `for` loops (count-controlled repetition)
- Infinite loops and how to avoid them
- `break` and `continue` (control inside loops)
- Nested loops
- Range-based `for` loops (C++11 and later)

---

## Part 1: The `while` Loop

"While this condition is true, keep doing this."

```cpp
#include <iostream>

int main() {
    int countdown = 5;
    
    while (countdown > 0) {
        std::cout << countdown << "... ";
        countdown--;  // VERY IMPORTANT: change the condition!
    }
    
    std::cout << "Liftoff!" << std::endl;
    
    return 0;
}
```

**Output:**
```
5... 4... 3... 2... 1... Liftoff!
```

### Anatomy of a `while` Loop

```cpp
// Initialization (before the loop)
int i = 0;

// Condition (checked BEFORE each iteration)
while (i < 5) {
    // Body (runs while condition is true)
    std::cout << i << std::endl;
    
    // Update (changes toward ending the loop)
    i++;
}
// Continue here when condition becomes false
```

### Real Game Example: Enemy Spawner

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    int enemiesToSpawn = 10;
    int enemiesSpawned = 0;
    
    std::cout << "Wave 1: Spawning " << enemiesToSpawn << " enemies..." << std::endl;
    
    while (enemiesSpawned < enemiesToSpawn) {
        enemiesSpawned++;
        
        // Random enemy type
        int enemyType = std::rand() % 3;  // 0, 1, or 2
        
        if (enemyType == 0) {
            std::cout << "🐺 Goblin spawned (" << enemiesSpawned << "/" << enemiesToSpawn << ")" << std::endl;
        } else if (enemyType == 1) {
            std::cout << "🧟 Skeleton spawned (" << enemiesSpawned << "/" << enemiesToSpawn << ")" << std::endl;
        } else {
            std::cout << "🐉 Orc spawned (" << enemiesSpawned << "/" << enemiesToSpawn << ")" << std::endl;
        }
    }
    
    std::cout << "Wave complete! Prepare for battle!" << std::endl;
    
    return 0;
}
```

---

## Part 2: The `do-while` Loop

"DO this, THEN check the condition." — Guarantees at least one execution.

```cpp
#include <iostream>

int main() {
    int health = 0;  // Already dead
    
    // This loop ALWAYS runs at least once
    do {
        std::cout << "Health is " << health << " — trying to revive..." << std::endl;
        health += 10;  // Attempt to heal
    } while (health < 50);
    
    std::cout << "Successfully revived to " << health << " health!" << std::endl;
    
    return 0;
}
```

**Output:**
```
Health is 0 — trying to revive...
Successfully revived to 10 health!  (But wait, condition checks AFTER)
```

Actually, let me clarify:

```cpp
#include <iostream>

int main() {
    int health = 0;
    
    do {
        std::cout << "Current health: " << health << std::endl;
        health += 25;
        std::cout << "Healed to: " << health << std::endl;
    } while (health < 50);
    
    return 0;
}
```

**Output:**
```
Current health: 0
Healed to: 25
Current health: 25
Healed to: 50
```

### When to Use `do-while`

Best for: **Menu systems, input validation, and situations where you need at least one iteration.**

```cpp
#include <iostream>

int main() {
    int choice;
    
    // Menu loop — always show menu at least once
    do {
        std::cout << "\n=== MAIN MENU ===" << std::endl;
        std::cout << "1. Start Game" << std::endl;
        std::cout << "2. Options" << std::endl;
        std::cout << "3. Quit" << std::endl;
        std::cout << "Choice: ";
        std::cin >> choice;
        
        switch (choice) {
            case 1:
                std::cout << "Starting game..." << std::endl;
                break;
            case 2:
                std::cout << "Opening options..." << std::endl;
                break;
            case 3:
                std::cout << "Goodbye!" << std::endl;
                break;
            default:
                std::cout << "Invalid choice. Try again." << std::endl;
        }
    } while (choice != 3);
    
    return 0;
}
```

---

## Part 3: The `for` Loop

The most common loop for counting. "For this variable from start to end, do this."

```cpp
#include <iostream>

int main() {
    // for (initialization; condition; update)
    for (int i = 0; i < 5; i++) {
        std::cout << "Iteration " << i << std::endl;
    }
    
    return 0;
}
```

**Output:**
```
Iteration 0
Iteration 1
Iteration 2
Iteration 3
Iteration 4
```

### Breaking Down the `for` Loop

```cpp
for (int i = 0;    // 1. Initialization (runs once at the beginning)
     i < 5;        // 2. Condition (checked BEFORE each iteration)
     i++) {        // 3. Update (runs AFTER each iteration)
    
    // 4. Body (runs each time condition is true)
}
```

**Execution order:**
1. Initialization (`int i = 0`)
2. Condition check (`i < 5`?) — if false, exit loop
3. Body (the code inside `{}`)
4. Update (`i++`)
5. Go back to step 2

### Common `for` Loop Patterns

```cpp
// Count up
for (int i = 0; i < 10; i++) {
    std::cout << i << " ";
}
// Output: 0 1 2 3 4 5 6 7 8 9

// Count down
for (int i = 10; i > 0; i--) {
    std::cout << i << " ";
}
// Output: 10 9 8 7 6 5 4 3 2 1

// Step by 2
for (int i = 0; i <= 10; i += 2) {
    std::cout << i << " ";
}
// Output: 0 2 4 6 8 10

// Multiple variables
for (int i = 0, j = 10; i < j; i++, j--) {
    std::cout << "i=" << i << ", j=" << j << std::endl;
}
```

### Real Game Example: Experience System

```cpp
#include <iostream>

int main() {
    int currentLevel = 1;
    int currentXP = 0;
    const int MAX_LEVEL = 10;
    
    std::cout << "=== LEVELING SYSTEM ===" << std::endl;
    
    for (int level = 1; level <= MAX_LEVEL; level++) {
        int xpNeeded = level * 100;
        currentXP += xpNeeded;
        
        std::cout << "Reached level " << level << "! ";
        std::cout << "Total XP: " << currentXP << std::endl;
    }
    
    std::cout << "\nMax level reached!" << std::endl;
    
    return 0;
}
```

---

## Part 4: Infinite Loops (and How to Avoid Them)

```cpp
// ❌ INFINITE LOOP — condition never becomes false
int i = 0;
while (i < 10) {
    std::cout << i << std::endl;
    // Missing i++!
}

// ❌ Another infinite loop
for (int i = 0; i < 10; i--) {  // Counting down, will never reach 10
    std::cout << i << std::endl;
}

// ❌ Condition always true
while (true) {
    // This runs forever unless you have break
}
```

### Intentional Infinite Loops (Game Loops)

Games use intentional infinite loops:

```cpp
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    bool isRunning = true;
    int frame = 0;
    
    // Game loop — runs until player quits
    while (isRunning) {
        // Process input
        // Update game logic
        // Render graphics
        
        frame++;
        std::cout << "Frame: " << frame << std::endl;
        
        // Simulate 60 FPS (in real code, you'd use proper timing)
        std::this_thread::sleep_for(std::chrono::milliseconds(16));
        
        // Check quit condition (simplified)
        if (frame >= 60) {
            isRunning = false;  // Exit loop
        }
    }
    
    std::cout << "Game exited." << std::endl;
    
    return 0;
}
```

---

## Part 5: `break` and `continue`

### `break` — Exit the Loop Immediately

```cpp
#include <iostream>

int main() {
    // Search for treasure
    for (int chest = 1; chest <= 100; chest++) {
        std::cout << "Opening chest " << chest << "... ";
        
        if (chest == 42) {
            std::cout << "FOUND LEGENDARY SWORD! 🗡️" << std::endl;
            break;  // Exit the loop immediately
        }
        
        std::cout << "Nothing special." << std::endl;
    }
    
    std::cout << "Treasure hunt complete!" << std::endl;
    
    return 0;
}
```

### `continue` — Skip This Iteration

```cpp
#include <iostream>

int main() {
    // Process only even numbers
    for (int i = 1; i <= 10; i++) {
        if (i % 2 != 0) {
            continue;  // Skip odd numbers
        }
        
        std::cout << "Processing even number: " << i << std::endl;
    }
    
    return 0;
}
```

**Output:**
```
Processing even number: 2
Processing even number: 4
Processing even number: 6
Processing even number: 8
Processing even number: 10
```

### Real Game Example: Combat System with Break

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    int playerHealth = 100;
    int playerDamage = 15;
    int enemyHealth = 80;
    int turn = 0;
    
    std::cout << "=== BATTLE START ===" << std::endl;
    
    while (true) {  // Game loop
        turn++;
        std::cout << "\n--- Turn " << turn << " ---" << std::endl;
        
        // Player turn
        int damage = playerDamage + (std::rand() % 10);
        enemyHealth -= damage;
        std::cout << "You deal " << damage << " damage! Enemy health: " << enemyHealth << std::endl;
        
        if (enemyHealth <= 0) {
            std::cout << "Victory! You defeated the enemy!" << std::endl;
            break;  // Exit battle loop
        }
        
        // Enemy turn
        int enemyDamage = 10 + (std::rand() % 15);
        playerHealth -= enemyDamage;
        std::cout << "Enemy deals " << enemyDamage << " damage! Your health: " << playerHealth << std::endl;
        
        if (playerHealth <= 0) {
            std::cout << "You were defeated... Game Over." << std::endl;
            break;  // Exit battle loop
        }
        
        // Escape chance every 3 turns
        if (turn % 3 == 0) {
            std::cout << "Do you want to flee? (1=Yes, 0=No): ";
            int flee;
            std::cin >> flee;
            
            if (flee == 1) {
                std::cout << "You fled from battle!" << std::endl;
                break;
            }
        }
    }
    
    std::cout << "Battle ended after " << turn << " turns." << std::endl;
    
    return 0;
}
```

---

## Part 6: Nested Loops

Loops inside loops — essential for grids, tilemaps, and 2D content.

```cpp
#include <iostream>

int main() {
    // Simple 3x3 grid
    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            std::cout << "(" << row << "," << col << ") ";
        }
        std::cout << std::endl;  // New line after each row
    }
    
    return 0;
}
```

**Output:**
```
(0,0) (0,1) (0,2) 
(1,0) (1,1) (1,2) 
(2,0) (2,1) (2,2) 
```

### Real Game Example: Tilemap Rendering

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    const int WIDTH = 10;
    const int HEIGHT = 5;
    
    // Generate random tilemap
    char tilemap[HEIGHT][WIDTH];
    
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            int tileType = std::rand() % 4;
            
            switch (tileType) {
                case 0: tilemap[y][x] = '.'; break;  // Floor
                case 1: tilemap[y][x] = '#'; break;  // Wall
                case 2: tilemap[y][x] = 'E'; break;  // Enemy
                case 3: tilemap[y][x] = 'T'; break;  // Treasure
            }
        }
    }
    
    // Render the tilemap
    std::cout << "=== DUNGEON MAP ===" << std::endl;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            std::cout << tilemap[y][x] << " ";
        }
        std::cout << std::endl;
    }
    
    // Find all enemies
    int enemyCount = 0;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (tilemap[y][x] == 'E') {
                enemyCount++;
            }
        }
    }
    
    std::cout << "\nEnemies detected: " << enemyCount << std::endl;
    
    return 0;
}
```

### Multiplication Table (Classic Example)

```cpp
#include <iostream>
#include <iomanip>

int main() {
    std::cout << "Multiplication Table (1-10)" << std::endl;
    std::cout << "    ";
    
    // Header
    for (int i = 1; i <= 10; i++) {
        std::cout << std::setw(4) << i;
    }
    std::cout << std::endl;
    
    std::cout << "    " << std::string(40, '-') << std::endl;
    
    // Table body
    for (int row = 1; row <= 10; row++) {
        std::cout << std::setw(2) << row << " |";
        
        for (int col = 1; col <= 10; col++) {
            std::cout << std::setw(4) << (row * col);
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

---

## Part 7: Range-based `for` Loop (C++11)

Modern C++ feature for iterating through collections.

```cpp
#include <iostream>
#include <vector>

int main() {
    // Arrays
    int scores[] = {95, 87, 76, 100, 82};
    
    std::cout << "Scores: ";
    for (int score : scores) {
        std::cout << score << " ";
    }
    std::cout << std::endl;
    
    // Vectors
    std::vector<std::string> inventory = {"Sword", "Shield", "Potion"};
    
    std::cout << "Inventory: ";
    for (const std::string& item : inventory) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
    
    // Modify values (use reference)
    int numbers[] = {1, 2, 3, 4, 5};
    for (int& num : numbers) {
        num *= 2;  // Double each number
    }
    
    std::cout << "Doubled: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

---

## Part 8: Loop Performance Tips

### Pre-increment vs Post-increment

```cpp
// For simple types (int, char), no difference
for (int i = 0; i < 1000000; i++) { }   // Fine
for (int i = 0; i < 1000000; ++i) { }   // Also fine

// For iterators (in real code), ++i is slightly faster
for (auto it = vec.begin(); it != vec.end(); ++it) { }  // Preferred
```

### Move Invariant Checks Outside Loop

```cpp
// ❌ Slow — checks condition 1000 times
for (int i = 0; i < 1000; i++) {
    if (someConstantCondition) {
        // do something
    }
}

// ✅ Faster — check once
if (someConstantCondition) {
    for (int i = 0; i < 1000; i++) {
        // do something
    }
}
```

### Cache-Friendly Loops

```cpp
// ✅ Better — access memory sequentially
int matrix[1000][1000];
for (int row = 0; row < 1000; row++) {
    for (int col = 0; col < 1000; col++) {
        sum += matrix[row][col];  // Row-major order
    }
}

// ❌ Worse — jumps through memory
for (int col = 0; col < 1000; col++) {
    for (int row = 0; row < 1000; row++) {
        sum += matrix[row][col];  // Column-major order
    }
}
```

---

## Complete Example: RPG Battle System with All Loop Types

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>
#include <vector>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Player stats
    std::string playerName;
    int playerHealth = 100;
    int playerMaxHealth = 100;
    int playerMana = 50;
    int playerLevel = 1;
    
    // Enemy list
    std::vector<std::string> enemyTypes = {"Goblin", "Orc", "Troll", "Dark Knight"};
    std::vector<int> enemyHealths = {30, 50, 80, 120};
    std::vector<int> enemyDamages = {8, 15, 20, 25};
    
    std::cout << "=== EPIC RPG BATTLE SYSTEM ===" << std::endl;
    std::cout << "Enter your name: ";
    std::getline(std::cin, playerName);
    
    bool gameRunning = true;
    
    // Main game loop
    while (gameRunning) {
        std::cout << "\n--- New Encounter ---" << std::endl;
        
        // Select random enemy
        int enemyIndex = std::rand() % enemyTypes.size();
        std::string enemyName = enemyTypes[enemyIndex];
        int enemyHealth = enemyHealths[enemyIndex];
        int enemyMaxHealth = enemyHealths[enemyIndex];
        int enemyDamage = enemyDamages[enemyIndex];
        
        std::cout << "A level " << playerLevel << " " << enemyName << " appears!" << std::endl;
        std::cout << "Enemy Health: " << enemyHealth << "/" << enemyMaxHealth << std::endl;
        
        bool battleRunning = true;
        int turnCount = 0;
        
        // Battle loop
        while (battleRunning) {
            turnCount++;
            std::cout << "\n=== Turn " << turnCount << " ===" << std::endl;
            std::cout << playerName << " Health: " << playerHealth << "/" << playerMaxHealth << std::endl;
            std::cout << enemyName << " Health: " << enemyHealth << "/" << enemyMaxHealth << std::endl;
            
            // Player turn
            std::cout << "\nChoose action:" << std::endl;
            std::cout << "1. Attack" << std::endl;
            std::cout << "2. Cast Spell (Mana: " << playerMana << ")" << std::endl;
            std::cout << "3. Flee" << std::endl;
            std::cout << "Choice: ";
            
            int choice;
            std::cin >> choice;
            
            int damage = 0;
            bool fled = false;
            
            switch (choice) {
                case 1:  // Attack
                    damage = 15 + (std::rand() % 15) + (playerLevel * 2);
                    std::cout << "You attack for " << damage << " damage!" << std::endl;
                    enemyHealth -= damage;
                    break;
                    
                case 2:  // Spell
                    if (playerMana >= 10) {
                        damage = 25 + (std::rand() % 20) + (playerLevel * 3);
                        playerMana -= 10;
                        std::cout << "You cast Fireball for " << damage << " damage!" << std::endl;
                        enemyHealth -= damage;
                    } else {
                        std::cout << "Not enough mana! You stumble..." << std::endl;
                        damage = 5;
                        enemyHealth -= damage;
                    }
                    break;
                    
                case 3:  // Flee
                    if (std::rand() % 100 < 50 + (playerLevel * 5)) {
                        std::cout << "You fled successfully!" << std::endl;
                        fled = true;
                    } else {
                        std::cout << "Failed to flee!" << std::endl;
                    }
                    break;
                    
                default:
                    std::cout << "Invalid choice! You hesitate..." << std::endl;
            }
            
            if (fled) {
                battleRunning = false;
                continue;
            }
            
            // Check victory
            if (enemyHealth <= 0) {
                std::cout << "\n✦ VICTORY! ✦" << std::endl;
                int xpGain = 50 + (enemyIndex * 20);
                std::cout << "Gained " << xpGain << " XP!" << std::endl;
                
                // Level up check (simple)
                if (xpGain > 100 && playerLevel < 5) {
                    playerLevel++;
                    playerMaxHealth += 20;
                    playerHealth = playerMaxHealth;
                    playerMana += 10;
                    std::cout << "LEVEL UP! You are now level " << playerLevel << "!" << std::endl;
                }
                
                battleRunning = false;
                continue;
            }
            
            // Enemy turn
            std::cout << "\n" << enemyName << " attacks!" << std::endl;
            int enemyHit = enemyDamage + (std::rand() % 10);
            playerHealth -= enemyHit;
            std::cout << enemyName << " deals " << enemyHit << " damage!" << std::endl;
            
            // Check defeat
            if (playerHealth <= 0) {
                std::cout << "\n✗ You have been defeated! ✗" << std::endl;
                battleRunning = false;
                gameRunning = false;
            }
        }
        
        // After battle, offer healing if player survived
        if (playerHealth > 0) {
            std::cout << "\nContinue exploring? (1=Yes, 0=No): ";
            int continueChoice;
            std::cin >> continueChoice;
            
            if (continueChoice == 0) {
                gameRunning = false;
                std::cout << "Thanks for playing, " << playerName << "!" << std::endl;
            } else {
                // Heal between battles
                playerHealth = playerMaxHealth;
                playerMana = 50;
                std::cout << "You rest and recover full health and mana." << std::endl;
            }
        }
    }
    
    return 0;
}
```

---

## Common Mistakes

### 1. Off-by-One Errors

```cpp
// ❌ Wrong — prints 0 to 4 (5 items)
for (int i = 0; i <= 5; i++) {  // Should be i < 5

// ✅ Correct
for (int i = 0; i < 5; i++) {  // Prints 0-4

// For 1-based counting
for (int i = 1; i <= 5; i++) {  // Prints 1-5
```

### 2. Forgetting to Update Loop Variable

```cpp
// ❌ Infinite loop
int i = 0;
while (i < 10) {
    std::cout << i << std::endl;
    // Missing i++
}

// ✅ Correct
while (i < 10) {
    std::cout << i << std::endl;
    i++;
}
```

### 3. Semicolon After Loop

```cpp
// ❌ Empty loop body
for (int i = 0; i < 10; i++);
{
    std::cout << "This runs once, not 10 times!" << std::endl;
}

// ✅ Correct
for (int i = 0; i < 10; i++) {
    std::cout << "Runs 10 times" << std::endl;
}
```

### 4. Modifying Container While Iterating

```cpp
// ❌ Dangerous — invalidates iterator
std::vector<int> vec = {1, 2, 3, 4, 5};
for (int val : vec) {
    if (val == 3) {
        vec.push_back(6);  // BAD! Vector changes while iterating
    }
}

// ✅ Safe approach — collect indices to remove later
```

---

## Quick Reference Card

```cpp
// while loop
while (condition) {
    // runs while condition is true
}

// do-while loop
do {
    // runs at least once
} while (condition);

// for loop
for (initialization; condition; update) {
    // runs until condition false
}

// break — exit loop immediately
// continue — skip to next iteration

// Range-based for (C++11)
for (type variable : container) {
    // iterates through entire container
}

// Nested loops
for (int i = 0; i < 10; i++) {
    for (int j = 0; j < 10; j++) {
        // inner loop runs 10x for each outer iteration
    }
}
```

---

## Practice Exercises

**Exercise 1 (Easy):** Print numbers from 1 to 100. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz".

**Exercise 2 (Easy):** Calculate the sum of all numbers from 1 to N (user input) using a `for` loop.

**Exercise 3 (Medium):** Create a number guessing game. Generate random 1-100, let user guess, tell "too high" or "too low". Count attempts. Use a `while` loop.

**Exercise 4 (Medium):** Print a triangle pattern:
```
*
**
***
****
*****
```
Use nested loops.

**Exercise 5 (Hard):** Create a "Bank Interest Calculator" where a user deposits an amount and interest compounds annually. Show balance for 10 years using a `for` loop.

**Exercise 6 (Challenge):** Build a "Dungeon Crawler" text game with:
- 5x5 grid (nested loops for display)
- Player starts at (0,0), goal at (4,4)
- Random enemies placed on grid
- Player moves with W/A/S/D
- Combat uses previous battle system
- Win by reaching goal

---

## Summary

You now know:

✅ `while` loops for condition-controlled repetition  
✅ `do-while` loops for guaranteed first execution  
✅ `for` loops for counting and iteration  
✅ How to avoid infinite loops  
✅ `break` and `continue` for flow control  
✅ Nested loops for 2D content  
✅ Range-based `for` loops (modern C++)  

## What's Next?

Next lesson: **Arrays and Vectors** — storing collections of data (inventories, high scores, enemy lists)!

---

## Resources

- [C++ Loops (cppreference)](https://en.cppreference.com/w/cpp/language/for)
- [Range-based for loop](https://en.cppreference.com/w/cpp/language/range-for)

---

**Practice Task:** Create a "Dice Roll Simulator" that rolls two dice 1000 times and tracks how many times each sum (2-12) appears. Use a `for` loop for the rolls, another `for` loop to display results. This is excellent practice for loops and will be useful when we cover arrays next!