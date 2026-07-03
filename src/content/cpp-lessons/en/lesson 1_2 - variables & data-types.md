---
title: "Variables and Data Types in C++"
description: "Store numbers, text, and true/false values — the building blocks of every program"
pubDate: 2026-05-31
tags: ["C++", "beginner", "variables", "data-types"]
lang: "en"
lessonNumber: 102
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 2: Variables and Data Types

Welcome back! Last lesson we set up our environment and wrote "Hello, World!". Now it's time to learn how to **store and manipulate data** — the foundation of every game.

## What You'll Learn

- What variables are and why we need them
- C++'s basic data types (integers, floats, booleans, characters, strings)
- How to declare, initialize, and modify variables
- Variable naming rules and best practices
- Constants: values that never change

---

## What Are Variables?

Imagine variables as **labeled boxes** that hold values:

```
┌────────────────┐
   playerHealth    ← variable name
                 
       100         ← stored value
└────────────────┘
```

- The **name** (`playerHealth`) is how we refer to the box
- The **type** (`int`) determines what kind of data can go inside
- The **value** (100) is what's currently stored

---

## Basic Data Types

C++ has several built-in types. Here are the ones you'll use 99% of the time:

| Type | Keyword | Size | Range / Example |
|------|---------|------|-----------------|
| **Integer** | `int` | 4 bytes | -2B to +2B (`42`, `-7`, `0`) |
| **Floating-point** | `float` | 4 bytes | ~7 decimal digits (`3.14f`) |
| **Double** | `double` | 8 bytes | ~15 decimal digits (`3.1415926535`) |
| **Character** | `char` | 1 byte | Single character (`'A'`, `'9'`, `'?'`) |
| **Boolean** | `bool` | 1 byte | `true` or `false` |
| **String** | `std::string` | Varies | Text (`"Hello!"`) |

> **Note:** `std::string` requires `#include <string>` — more on this later.

---

## Integers (`int`)

Whole numbers without decimals.

```cpp
#include <iostream>

int main() {
    int score = 0;
    int playerLevel = 5;
    int enemyCount = 10;
    int temperature = -15;
    
    std::cout << "Score: " << score << std::endl;
    std::cout << "Level: " << playerLevel << std::endl;
    std::cout << "Enemies: " << enemyCount << std::endl;
    std::cout << "Temperature: " << temperature << "°C" << std::endl;
    
    return 0;
}
```

**Output:**
```
Score: 0
Level: 5
Enemies: 10
Temperature: -15°C
```

### Integer Variations (For When You Care About Memory)

| Type | Range | Use Case |
|------|-------|----------|
| `short` | -32,768 to 32,767 | Tiny counters |
| `int` | -2B to 2B | Most cases |
| `long` | -9 quintillion to +9 quintillion | Very large numbers |
| `unsigned int` | 0 to 4B | Health, ammo (never negative) |

```cpp
unsigned int health = 100;  // Can't be negative
long galaxyStars = 100000000000;
```

---

## Floating-Point Numbers (`float` and `double`)

Numbers with decimals. Perfect for positions, speeds, health percentages.

```cpp
#include <iostream>

int main() {
    float playerSpeed = 5.75f;      // Note the 'f' suffix
    double pi = 3.141592653589793;
    float gravity = -9.81f;
    
    std::cout << "Speed: " << playerSpeed << std::endl;
    std::cout << "Pi: " << pi << std::endl;
    std::cout << "Gravity: " << gravity << std::endl;
    
    return 0;
}
```

**Why `float` vs `double`?**
- `float` uses less memory (good for thousands of objects)
- `double` is more precise (good for calculations that accumulate error)

> **Game Dev Tip:** Use `float` for positions, velocities, and timers. Use `double` only when you need extreme precision (like orbital mechanics).

---

## Boolean (`bool`)

True or false. Every condition in your game eventually becomes a boolean.

```cpp
#include <iostream>

int main() {
    bool isGameOver = false;
    bool hasKey = true;
    bool isPlayerAlive = true;
    
    std::cout << "Game over? " << isGameOver << std::endl;   // Prints 0
    std::cout << "Has key? " << hasKey << std::endl;         // Prints 1
    
    // Better output for booleans
    std::cout << std::boolalpha;
    std::cout << "Game over? " << isGameOver << std::endl;   // Prints false
    std::cout << "Has key? " << hasKey << std::endl;         // Prints true
    
    return 0;
}
```

**Output:**
```
Game over? 0
Has key? 1
Game over? false
Has key? true
```

> `std::boolalpha` makes booleans print as `true`/`false` instead of `1`/`0`.

---

## Characters (`char`)

Single characters — letters, digits, symbols.

```cpp
#include <iostream>

int main() {
    char grade = 'A';
    char initial = 'S';
    char newline = '\n';      // Escape sequence
    char percentSymbol = '%';
    
    std::cout << "Grade: " << grade << std::endl;
    std::cout << "Initial: " << initial << std::endl;
    std::cout << "Symbol: " << percentSymbol << std::endl;
    
    return 0;
}
```

### Common Escape Sequences

| Escape | Meaning |
|--------|---------|
| `\n` | New line |
| `\t` | Tab |
| `\'` | Single quote |
| `\"` | Double quote |
| `\\` | Backslash |

---

## Strings (`std::string`)

Text — multiple characters together. **Requires `#include <string>`**.

```cpp
#include <iostream>
#include <string>    // Don't forget this!

int main() {
    std::string playerName = "Stanislav";
    std::string gameTitle = "Project Dragonheart";
    std::string emptyString = "";
    
    std::cout << "Player: " << playerName << std::endl;
    std::cout << "Game: " << gameTitle << std::endl;
    
    // Combine strings (concatenation)
    std::string message = "Welcome, " + playerName + "!";
    std::cout << message << std::endl;
    
    // Get string length
    std::cout << "Your name has " << playerName.length() << " letters" << std::endl;
    
    return 0;
}
```

**Output:**
```
Player: Stanislav
Game: Project Dragonheart
Welcome, Stanislav!
Your name has 9 letters
```

---

## Declaring vs. Initializing Variables

```cpp
int health;           // Declaration (no value yet — contains garbage!)
health = 100;         // Assignment

int mana = 50;        // Declaration + initialization (recommended)

int a = 5, b = 10, c; // Multiple declarations
c = a + b;            // c becomes 15
```

> **Always initialize your variables!** Uninitialized variables contain random "garbage" values and cause hard-to-find bugs.

---

## Variable Naming Rules

**Must follow:**
- Letters, digits, underscores only (no spaces!)
- Cannot start with a digit
- Case-sensitive (`health` ≠ `Health`)
- Cannot use C++ keywords (`int`, `return`, `if`, etc.)

**Best practices (follow these for clean code):**

```cpp
// ✅ Good examples
int playerHealth = 100;
float moveSpeed = 5.5f;
bool isJumping = false;
std::string playerName = "Hero";
int totalEnemiesKilled = 42;

// ❌ Bad examples
int a = 100;                    // What is 'a'?
float speeds = 5.5f;           // Ambiguous
int PlayerHealth = 100;         // Inconsistent capitalization (use camelCase)
int player_health = 100;        // snake_case is okay but less common in C++
int p = 42;                     // Too short, meaningless
```

**C++ convention:** Use **camelCase** for variables — lowercase first letter, capitalize each subsequent word.

---

## Constants: Values That Never Change

Use `const` or `constexpr` for values that should remain fixed.

```cpp
#include <iostream>

int main() {
    const int MAX_PLAYERS = 4;
    const float GRAVITY = -9.81f;
    const std::string GAME_TITLE = "Dragonheart";
    
    // MAX_PLAYERS = 8;  // ❌ ERROR! Can't modify a const
    
    std::cout << "Max players: " << MAX_PLAYERS << std::endl;
    std::cout << "Gravity: " << GRAVITY << std::endl;
    
    return 0;
}
```

**Why use constants?**
- Code self-documentation (GRAVITY is clearly meant to be fixed)
- Prevent accidental changes
- Easy to update in one place

> **Game Dev Tip:** Use constants for magic numbers like `MAX_AMMO`, `PLAYER_START_HEALTH`, `FRAME_RATE`.

---

## Practice: Putting It All Together

Let's make a simple character stats system:

```cpp
#include <iostream>
#include <string>

int main() {
    // Character stats
    std::string characterName = "Kaelen";
    int health = 100;
    int mana = 50;
    float movementSpeed = 5.75f;
    int level = 1;
    bool isAlive = true;
    
    // Constants
    const int MAX_HEALTH = 100;
    const int MAX_MANA = 100;
    
    // Display stats
    std::cout << "=== Character Sheet ===" << std::endl;
    std::cout << "Name: " << characterName << std::endl;
    std::cout << "Health: " << health << "/" << MAX_HEALTH << std::endl;
    std::cout << "Mana: " << mana << "/" << MAX_MANA << std::endl;
    std::cout << "Speed: " << movementSpeed << std::endl;
    std::cout << "Level: " << level << std::endl;
    std::cout << "Alive: " << std::boolalpha << isAlive << std::endl;
    
    // Modify some values
    health = 75;  // Took damage
    mana = 30;    // Cast a spell
    level = 2;    // Leveled up!
    
    std::cout << "\n=== After Combat ===" << std::endl;
    std::cout << "Health: " << health << "/" << MAX_HEALTH << std::endl;
    std::cout << "Mana: " << mana << "/" << MAX_MANA << std::endl;
    std::cout << "Level: " << level << std::endl;
    
    return 0;
}
```

**Try running this code!** Modify the values and see what happens.

---

## Common Mistakes

### 1. Using uninitialized variables
```cpp
int x;                    // x has garbage value
std::cout << x;           // Undefined behavior!
```

### 2. Wrong type assignment
```cpp
int health = 100.5f;      // 100.5 becomes 100 (truncated)
float percent = 50;       // 50 becomes 50.0 (safe)
```

### 3. Forgetting `#include <string>`
```cpp
std::string name = "Hero"; // ERROR without #include <string>
```

### 4. Mixing up `=` and `==`
```cpp
if (health = 0)      // WRONG: assigns 0, then checks if 0 is true
if (health == 0)     // CORRECT: checks if health equals 0
```

### 5. Integer division surprise
```cpp
float result = 5 / 2;    // result = 2.0 (not 2.5!)
float correct = 5.0f / 2; // correct = 2.5
```

---

## Quick Reference Card

```cpp
// Declaration
int score;
float speed;
bool isGameOver;
char grade;
std::string name;

// Initialization
int score = 0;
float speed = 5.5f;
bool isGameOver = false;
char grade = 'A';
std::string name = "Player";

// Constants
const int MAX_LIVES = 3;
const float PI = 3.14159f;

// Output
std::cout << "Value: " << variable << std::endl;
```

---

## Practice Exercises

Try these on your own:

**Exercise 1:** Create variables for a spaceship: name, hull integrity (0-100), shield power (float), ammo count, and whether engines are online. Print them all.

**Exercise 2:** Write a program that calculates the area of a rectangle. Store width and height as integers, area as integer. (Area = width × height)

**Exercise 3:** Create a temperature converter. Store Celsius as a float, calculate and store Fahrenheit. (F = C × 9/5 + 32)

**Exercise 4:** What's wrong with this code? Fix it:
```cpp
#include <iostream>
int main() {
    string player = "Archer";
    int health = 100.5
    const int MAX_AMMO = 50;
    MAX_AMMO = 60;
    std::cout >> "Player: " >> player;
    return 0;
}
```

---

## Summary

You now understand:

✅ What variables are and how to use them  
✅ The core data types: `int`, `float`, `double`, `bool`, `char`, `std::string`  
✅ How to declare, initialize, and modify variables  
✅ Naming conventions and best practices  
✅ Using `const` for values that shouldn't change  

## What's Next?

Next lesson: **Basic Input/Output** — we'll learn how to read user input with `std::cin` and build interactive programs!

---

## Resources

- [C++ Data Types (cppreference)](https://en.cppreference.com/w/cpp/language/types)
- [std::string documentation](https://en.cppreference.com/w/cpp/string/basic_string)

---

**Practice Task:** Create a simple character creator program. Store name (string), class (string), health (int), mana (int), strength (int), and agility (int). Initialize them with starting values and print a beautiful character sheet to the console.

*Next lesson: Making programs interactive with `std::cin`!*