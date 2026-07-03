---
title: "Operators and Expressions"
description: "Master arithmetic, comparison, and logical operators to build game logic"
pubDate: 2026-06-01
tags: ["C++", "beginner", "operators", "expressions", "game-logic"]
lang: "en"
lessonNumber: 104
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 4: Operators and Expressions

Welcome back! Now that we can store data and get user input, it's time to **make decisions and calculations**. Operators are the tools that let us manipulate data, compare values, and build complex game logic.

## What You'll Learn

- Arithmetic operators (math!)
- Assignment operators (`=`, `+=`, `-=`, etc.)
- Increment/decrement (`++`, `--`)
- Relational operators (`<`, `>`, `==`, `!=`, etc.)
- Logical operators (`&&`, `||`, `!`)
- Operator precedence (what happens first?)
- Bitwise operators (bonus: for power users)

---

## Part 1: Arithmetic Operators

These work just like basic math — but with a few C++ quirks.

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| `+` | Addition | `5 + 3` | `8` |
| `-` | Subtraction | `5 - 3` | `2` |
| `*` | Multiplication | `5 * 3` | `15` |
| `/` | Division | `5 / 2` | `2` (⚠️ integer division!) |
| `%` | Modulo (remainder) | `5 % 2` | `1` |

```cpp
#include <iostream>

int main() {
    int health = 100;
    int damage = 35;
    int healing = 20;
    
    // Basic arithmetic
    int newHealth = health - damage;        // 65
    int afterHeal = newHealth + healing;    // 85
    
    std::cout << "After damage: " << newHealth << std::endl;
    std::cout << "After heal: " << afterHeal << std::endl;
    
    // Multiplication
    int score = 10;
    int multiplier = 3;
    int totalScore = score * multiplier;     // 30
    
    // Division - WARNING: Integer division truncates!
    int players = 5;
    int candies = 17;
    int eachGets = candies / players;        // 3 (not 3.4!)
    int remainder = candies % players;       // 2
    
    std::cout << "Each player gets: " << eachGets << " candies" << std::endl;
    std::cout << "Leftover: " << remainder << " candies" << std::endl;
    
    return 0;
}
```

### The Integer Division Trap

```cpp
float result1 = 5 / 2;      // result1 = 2.0 (not 2.5!)
float result2 = 5.0f / 2;   // result2 = 2.5
float result3 = 5 / 2.0f;   // result3 = 2.5
float result4 = (float)5 / 2; // result4 = 2.5 (explicit cast)

// For game development, always use floats for division:
float attackPower = 45.0f;
float defense = 20.0f;
float damageMultiplier = attackPower / defense;  // 2.25
```

**Rule:** If both operands are integers, C++ does integer division (truncates). If at least one is a float/double, you get floating-point division.

### Modulo (`%`) — Surprisingly Useful in Games

```cpp
// Check if number is even
bool isEven = (number % 2 == 0);

// Wrap around (arrays, tilemaps)
int tileIndex = currentTile % totalTiles;  // Cycles 0,1,2,0,1,2...

// Extract digits
int lastDigit = number % 10;      // 123 % 10 = 3
int firstDigit = number / 100;    // 123 / 100 = 1

// Cooldown system
int frameCount = 0;
if (frameCount % 60 == 0) {
    // Do something every 60 frames (1 second at 60 FPS)
}
```

---

## Part 2: Assignment Operators

We've been using `=`, but there's a whole family:

| Operator | Example | Meaning |
|----------|---------|---------|
| `=` | `x = 5` | Assign 5 to x |
| `+=` | `x += 3` | `x = x + 3` |
| `-=` | `x -= 2` | `x = x - 2` |
| `*=` | `x *= 4` | `x = x * 4` |
| `/=` | `x /= 2` | `x = x / 2` |
| `%=` | `x %= 3` | `x = x % 3` |

```cpp
#include <iostream>

int main() {
    int health = 100;
    
    // Instead of: health = health + 20;
    health += 20;    // 120
    std::cout << "After potion: " << health << std::endl;
    
    // Instead of: health = health - 35;
    health -= 35;    // 85
    std::cout << "After hit: " << health << std::endl;
    
    // Instead of: score = score * 2;
    int score = 50;
    score *= 2;      // 100
    
    // Instead of: gold = gold / 4;
    int gold = 100;
    gold /= 4;       // 25
    
    return 0;
}
```

**Game use cases:**
```cpp
playerHealth += potionAmount;
mana -= spellCost;
score *= comboMultiplier;
gold /= 2;  // "You paid half your gold as tax"
```

---

## Part 3: Increment/Decrement Operators

Used constantly in loops and counters.

| Operator | Meaning | Example |
|----------|---------|---------|
| `++x` | Pre-increment (increment, then use) | `int y = ++x` |
| `x++` | Post-increment (use, then increment) | `int y = x++` |
| `--x` | Pre-decrement | |
| `x--` | Post-decrement | |

```cpp
#include <iostream>

int main() {
    // Pre vs Post - THE CLASSIC CONFUSION
    int a = 5;
    int b = 5;
    
    int preResult = ++a;  // a becomes 6, then preResult gets 6
    int postResult = b++; // postResult gets 5, then b becomes 6
    
    std::cout << "After ++a: a=" << a << ", result=" << preResult << std::endl;
    std::cout << "After b++: b=" << b << ", result=" << postResult << std::endl;
    
    // Practical use - when alone, they work the same
    int kills = 0;
    kills++;    // kills becomes 1
    ++kills;    // kills becomes 2
    kills--;    // kills becomes 1
    
    // Game example: next item in inventory
    int currentItem = 0;
    int itemCount = 5;
    
    currentItem++;           // Move to next item
    if (currentItem >= itemCount) {
        currentItem = 0;     // Wrap around
    }
    
    return 0;
}
```

**Best practice:** Use `++i` (pre-increment) in most cases — it's slightly faster and more predictable. The difference matters in complex expressions.

---

## Part 4: Relational (Comparison) Operators

These answer YES/NO questions. The result is a `bool` (`true` or `false`).

| Operator | Meaning | Example (true) |
|----------|---------|----------------|
| `==` | Equal to | `5 == 5` |
| `!=` | Not equal to | `5 != 3` |
| `<` | Less than | `3 < 5` |
| `>` | Greater than | `5 > 3` |
| `<=` | Less than or equal | `5 <= 5` |
| `>=` | Greater than or equal | `5 >= 3` |

```cpp
#include <iostream>

int main() {
    int playerHealth = 75;
    int bossDamage = 80;
    int requiredLevel = 10;
    int playerLevel = 7;
    bool hasKey = true;
    
    // Comparisons
    bool willDie = (bossDamage >= playerHealth);  // 80 >= 75 = true
    bool canEnter = (playerLevel >= requiredLevel); // 7 >= 10 = false
    bool hasAccess = (canEnter && hasKey);  // false && true = false
    
    std::cout << std::boolalpha;
    std::cout << "Will die? " << willDie << std::endl;
    std::cout << "Can enter dungeon? " << canEnter << std::endl;
    std::cout << "Has full access? " << hasAccess << std::endl;
    
    // Common mistake: = vs ==
    if (playerHealth = 0) {  // WRONG: assigns 0, condition becomes false
        std::cout << "Game Over" << std::endl;  // This never runs
    }
    
    if (playerHealth == 0) { // CORRECT: compares
        std::cout << "Game Over" << std::endl;  // This runs correctly
    }
    
    return 0;
}
```

### Yoda Conditions (Defensive Programming)

Some developers write conditions backwards to catch `=` mistakes:

```cpp
if (0 == playerHealth) {  // Compiler error if you type = instead of ==
    // Game over
}
```

This prevents `if (playerHealth = 0)` bugs. Use if you like, but it's less readable.

---

## Part 5: Logical Operators

Combine multiple conditions into one.

| Operator | Meaning | Truth Table |
|----------|---------|-------------|
| `&&` | AND (both true) | `true && true = true`, everything else false |
| `||` | OR (at least one true) | `false || false = false`, everything else true |
| `!` | NOT (negation) | `!true = false`, `!false = true` |

```cpp
#include <iostream>

int main() {
    int health = 45;
    int mana = 30;
    bool hasShield = false;
    int level = 5;
    
    std::cout << std::boolalpha;
    
    // AND - BOTH must be true
    bool canCastSpell = (mana >= 20) && (health > 0);  // true && true = true
    std::cout << "Can cast spell? " << canCastSpell << std::endl;
    
    // OR - AT LEAST ONE must be true
    bool canSurvive = (health > 0) || hasShield;  // true || false = true
    std::cout << "Can survive hit? " << canSurvive << std::endl;
    
    // NOT - reverses
    bool isDead = (health <= 0);
    bool isAlive = !isDead;
    std::cout << "Is alive? " << isAlive << std::endl;
    
    // Complex game conditions
    bool canUseUltimate = (level >= 10) && (mana >= 100) && !isDead;
    
    // Short-circuit evaluation (important!)
    bool safeCheck = (ptr != nullptr) && (ptr->value > 10);  // Second part only runs if first is true
    
    return 0;
}
```

### Short-Circuit Evaluation

C++ stops evaluating as soon as the result is known:

```cpp
// For && (AND): if first is false, second NEVER runs
if (expensiveFunction() && cheapFunction()) { }
// If expensiveFunction() returns false, cheapFunction() never called

// For || (OR): if first is true, second NEVER runs
if (quickCheck() || slowDatabaseLookup()) { }
// If quickCheck() returns true, slowDatabaseLookup() never runs
```

**Game use:** Prevent null pointer crashes:
```cpp
if (player != nullptr && player->health > 0) {  // Safe!
    // Use player
}
```

---

## Part 6: Operator Precedence

Not all operators are equal — some happen before others, just like in math.

**Remember PEMDAS from math?** C++ has its own rules:

| Precedence | Operators | Example |
|------------|-----------|---------|
| 1 (highest) | `()` parentheses | `(a + b) * c` |
| 2 | `++` `--` `!` (unary) | `!isDone` |
| 3 | `*` `/` `%` | `a * b / c` |
| 4 | `+` `-` | `a + b - c` |
| 5 | `<` `>` `<=` `>=` | `a < b` |
| 6 | `==` `!=` | `a == b` |
| 7 | `&&` | `a && b` |
| 8 | `||` | `a \|\| b` |
| 9 (lowest) | `=` assignment | `x = 5` |

```cpp
#include <iostream>

int main() {
    // Without parentheses - follows precedence
    int result = 5 + 3 * 2;    // 5 + (3*2) = 11, NOT 16!
    
    // With parentheses - force your order
    int forced = (5 + 3) * 2;  // (8)*2 = 16
    
    std::cout << "5 + 3 * 2 = " << result << std::endl;
    std::cout << "(5 + 3) * 2 = " << forced << std::endl;
    
    // Complex example
    bool condition = (10 > 5) && (3 < 4) || (2 == 3);
    // Step by step:
    // (10 > 5) = true
    // (3 < 4) = true
    // (2 == 3) = false
    // (true && true) = true
    // (true || false) = true
    
    // WHEN IN DOUBT, USE PARENTHESES!
    bool clear = ((10 > 5) && (3 < 4)) || (2 == 3);  // Much clearer
    
    return 0;
}
```

**Golden Rule:** Use parentheses liberally. They cost nothing, make code clearer, and prevent bugs.

---

## Part 7: Real Game Example — Combat System

Let's combine everything into a damage calculation system:

```cpp
#include <iostream>
#include <string>
#include <iomanip>
#include <cstdlib>  // for rand()
#include <ctime>    // for time()

int main() {
    // Seed random number generator
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Player stats
    std::string playerName;
    int playerHealth = 100;
    int playerMaxHealth = 100;
    int playerStrength = 15;
    int playerDefense = 8;
    float playerCritChance = 0.20f;  // 20%
    
    // Enemy stats
    std::string enemyName = "Goblin";
    int enemyHealth = 45;
    int enemyStrength = 10;
    int enemyDefense = 5;
    
    std::cout << "=== BATTLE SIMULATOR ===" << std::endl;
    std::cout << "Enter your name: ";
    std::getline(std::cin, playerName);
    
    std::cout << "\nA wild " << enemyName << " appears!\n" << std::endl;
    
    // Combat loop
    bool battleOngoing = true;
    int turn = 1;
    
    while (battleOngoing) {
        std::cout << "\n--- Turn " << turn << " ---" << std::endl;
        std::cout << playerName << " Health: " << playerHealth << "/" << playerMaxHealth << std::endl;
        std::cout << enemyName << " Health: " << enemyHealth << std::endl;
        
        // Player turn
        std::cout << "\nChoose action: [1] Attack [2] Defend: ";
        int choice;
        std::cin >> choice;
        
        int damageDealt = 0;
        bool isCritical = false;
        
        if (choice == 1) {  // Attack
            // Base damage calculation
            int baseDamage = playerStrength + (std::rand() % 10);  // 15 + 0-9
            float randomFactor = 0.85f + (static_cast<float>(std::rand()) / RAND_MAX) * 0.3f;  // 0.85 - 1.15
            
            damageDealt = static_cast<int>(baseDamage * randomFactor) - enemyDefense;
            
            // Ensure minimum damage
            if (damageDealt < 5) damageDealt = 5;
            
            // Critical hit check
            float critRoll = static_cast<float>(std::rand()) / RAND_MAX;
            isCritical = (critRoll < playerCritChance);
            
            if (isCritical) {
                damageDealt = static_cast<int>(damageDealt * 1.5f);
                std::cout << "⚡ CRITICAL HIT! ⚡" << std::endl;
            }
            
            enemyHealth -= damageDealt;
            std::cout << "You hit the " << enemyName << " for " << damageDealt << " damage!" << std::endl;
        } 
        else if (choice == 2) {  // Defend
            int healAmount = 10 + (std::rand() % 15);
            playerHealth += healAmount;
            if (playerHealth > playerMaxHealth) playerHealth = playerMaxHealth;
            std::cout << "You defend and recover " << healAmount << " health!" << std::endl;
        }
        
        // Check if enemy defeated
        if (enemyHealth <= 0) {
            std::cout << "\n✦ " << enemyName << " defeated! Victory! ✦" << std::endl;
            break;
        }
        
        // Enemy turn
        std::cout << "\n" << enemyName << " attacks!" << std::endl;
        int enemyDamage = enemyStrength + (std::rand() % 8);
        enemyDamage -= (choice == 2 ? (playerDefense / 2) : (playerDefense / 4));  // Defending reduces damage
        
        if (enemyDamage < 3) enemyDamage = 3;
        
        playerHealth -= enemyDamage;
        std::cout << enemyName << " hits you for " << enemyDamage << " damage!" << std::endl;
        
        // Check if player defeated
        if (playerHealth <= 0) {
            std::cout << "\n✗ You have been defeated... Game Over ✗" << std::endl;
            battleOngoing = false;
            break;
        }
        
        turn++;
        
        // Safety limit (50 turns max)
        if (turn > 50) {
            std::cout << "\nBattle ends in a draw!" << std::endl;
            break;
        }
    }
    
    if (playerHealth > 0 && enemyHealth <= 0) {
        std::cout << "\n=== VICTORY! ===" << std::endl;
        int experienceGained = 50 + (turn * 5);
        std::cout << "You gained " << experienceGained << " XP!" << std::endl;
    }
    
    return 0;
}
```

---

## Part 8: Bitwise Operators (Bonus)

These operate on individual bits. Useful for flags, network protocols, and performance-critical code.

| Operator | Name | Example |
|----------|------|---------|
| `&` | AND | `flags & MASK` |
| `|` | OR | `flags | MASK` |
| `^` | XOR | `flags ^ MASK` |
| `~` | NOT | `~flags` |
| `<<` | Left shift | `value << 2` |
| `>>` | Right shift | `value >> 1` |

```cpp
#include <iostream>

int main() {
    // Game flags example
    const int HAS_SWORD   = 1 << 0;  // 1  (binary 001)
    const int HAS_SHIELD  = 1 << 1;  // 2  (binary 010)
    const int HAS_KEY     = 1 << 2;  // 4  (binary 100)
    
    int inventory = 0;
    
    // Add items
    inventory |= HAS_SWORD;    // Add sword
    inventory |= HAS_SHIELD;   // Add shield
    
    // Check if has sword
    if (inventory & HAS_SWORD) {
        std::cout << "Has sword!" << std::endl;
    }
    
    // Remove item
    inventory &= ~HAS_SHIELD;  // Remove shield
    
    // Check multiple flags
    bool hasBoth = ((inventory & (HAS_SWORD | HAS_KEY)) == (HAS_SWORD | HAS_KEY));
    
    return 0;
}
```

---

## Common Mistakes

### 1. Using `=` instead of `==` in conditions
```cpp
if (health = 0)  // WRONG: assigns 0 to health, condition is false
if (health == 0) // CORRECT: compares
```

### 2. Integer division surprise
```cpp
float average = 5 / 2;  // 2.0, not 2.5!
float correct = 5.0f / 2;  // 2.5
```

### 3. Misunderstanding precedence
```cpp
int x = 5 + 3 * 2;  // 11, not 16
int y = (5 + 3) * 2; // 16
```

### 4. Chaining comparisons incorrectly
```cpp
// WRONG (always true because (5 < x) is bool, then compared)
if (5 < x < 10)  

// CORRECT
if (5 < x && x < 10)
```

### 5. Short-circuit surprises
```cpp
// This is safe if ptr is null (second part never runs)
if (ptr != nullptr && ptr->value > 10) { }

// This CRASHES if ptr is null (both parts run)
if (ptr->value > 10 && ptr != nullptr) { }  // DANGER!
```

---

## Quick Reference Card

```cpp
// Arithmetic
int sum = a + b;
int diff = a - b;
int product = a * b;
int quotient = a / b;  // Integer division!
int remainder = a % b; // Modulo

// Assignment shortcuts
a += 5;   // a = a + 5
a -= 5;   // a = a - 5
a *= 2;   // a = a * 2
a /= 2;   // a = a / 2
a %= 3;   // a = a % 3

// Increment/Decrement
a++;      // Post-increment (use then add)
++a;      // Pre-increment (add then use)

// Comparisons (result is bool)
bool b1 = (x == y);  // Equal
bool b2 = (x != y);  // Not equal
bool b3 = (x < y);   // Less than
bool b4 = (x > y);   // Greater than
bool b5 = (x <= y);  // Less or equal
bool b6 = (x >= y);  // Greater or equal

// Logical
bool andResult = (cond1 && cond2);  // AND - both true
bool orResult = (cond1 || cond2);   // OR - at least one true
bool notResult = !cond1;            // NOT - opposite
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a program that takes two numbers and prints:
- Their sum, difference, product, quotient, and remainder
- Whether they are equal
- Which one is larger

**Exercise 2 (Medium):** Create a "Level Up" system. Given current level and experience points:
- Each level requires `100 * level` XP
- Calculate XP needed for next level
- Determine how many levels the player gains (use integer division)
- Calculate remaining XP after leveling

**Exercise 3 (Medium):** Build a "Damage Calculator" where the user inputs:
- Base damage (int)
- Damage multiplier (float, 1.0-3.0)
- Enemy defense (int)
- Critical hit? (bool)
Calculate final damage = (base × multiplier - defense) × (2 if critical else 1). Ensure damage never goes below 5.

**Exercise 4 (Hard):** Create an "Eligibility Checker" for a guild. Requirements:
- Level >= 10
- Has completed at least 3 quests (int)
- Has at least 500 gold
- Is not banned
- (Bonus) Has either completed "Dragon Slayer" quest OR has a recommendation letter

Ask the user for all values and print whether they can join.

**Exercise 5 (Challenge):** Write a "Binary to Decimal" converter using bitwise operators. Convert a 4-bit binary number (user enters 0s and 1s as separate bits) to decimal.

---

## Summary

You now know:

✅ All arithmetic operators and the integer division trap  
✅ Assignment shortcuts (`+=`, `-=`, etc.)  
✅ Pre vs post increment/decrement  
✅ Comparison operators for conditions  
✅ Logical operators for complex game logic  
✅ Operator precedence (and the importance of parentheses)  
✅ Real game examples (combat system with random numbers)

## What's Next?

Next lesson: **Control Flow (if, else, switch)** — we'll learn how to make decisions in code, creating branching paths and multiple outcomes!

---

## Resources

- [C++ Operator Precedence (cppreference)](https://en.cppreference.com/w/cpp/language/operator_precedence)
- [Bitwise Operators Tutorial](https://www.learncpp.com/cpp-tutorial/bitwise-operators/)

---

**Practice Task:** Enhance the combat system from this lesson. Add new actions (special attack that costs mana, potion use, flee attempt). Add status effects (poison, stun, burn) that apply damage over time using the modulo operator for turn counting. Use logical operators for complex status combinations (e.g., "burning AND wet" = no damage).