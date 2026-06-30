---
title: "Functions — Reusable Code Blocks"
description: "Organize code, avoid repetition, and build complex systems with functions"
pubDate: 2026-06-01
tags: ["C++", "beginner", "functions", "reusability", "modularity"]
lang: "en"
lessonNumber: 8
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 8: Functions - Reusable Code Blocks

Welcome back! So far, we've written all our code in `main()`. But as programs grow, this becomes unmanageable. **Functions** let us break code into reusable, testable, and readable pieces.

## What You'll Learn

- What functions are and why we need them
- Function declaration, definition, and calling
- Parameters and arguments (pass by value vs reference)
- Return values
- Function overloading
- Default parameters
- Scope and lifetime of variables

---

## Part 1: Why Functions?

Imagine calculating damage in an RPG. Without functions, you'd copy-paste the same code everywhere:

```cpp
// ❌ WITHOUT functions — terrible!
int main() {
    // First battle
    int damage1 = 15 + rand() % 10;
    int final1 = damage1 * 2;  // Critical check
    enemyHealth -= final1;
    
    // Later, another battle — same code again!
    int damage2 = 15 + rand() % 10;
    int final2 = damage2 * 2;
    anotherEnemyHealth -= final2;
    
    // And again... and again...
}
```

**With functions:**

```cpp
// ✅ WITH functions — clean!
int calculateDamage(int baseDamage) {
    int damage = baseDamage + rand() % 10;
    bool isCritical = (rand() % 100) < 20;
    return isCritical ? damage * 2 : damage;
}

int main() {
    enemyHealth -= calculateDamage(15);
    anotherEnemyHealth -= calculateDamage(15);
    bossHealth -= calculateDamage(25);  // Different base, same logic!
}
```

---

## Part 2: Function Anatomy

```cpp
// return_type function_name(parameter_list) {
//     body
//     return value;
// }

int add(int a, int b) {
    return a + b;
}
```

### Breaking It Down

| Part | Example | Purpose |
|------|---------|---------|
| Return type | `int` | Type of value returned (use `void` for nothing) |
| Function name | `add` | How you call the function |
| Parameters | `(int a, int b)` | Input values (can be zero or more) |
| Body | `{ return a + b; }` | Code that runs when called |
| Return | `return` | Sends value back to caller |

---

## Part 3: Your First Functions

```cpp
#include <iostream>

// Simple function — no parameters, no return
void sayHello() {
    std::cout << "Hello, adventurer!" << std::endl;
}

// Function with parameter, no return
void greetPlayer(std::string name) {
    std::cout << "Welcome, " << name << "!" << std::endl;
}

// Function with parameters and return
int add(int x, int y) {
    return x + y;
}

// Function that returns a value to use
int calculateExperience(int level, int enemyDifficulty) {
    int baseXP = 50;
    int xp = baseXP + (level * 10) + (enemyDifficulty * 20);
    return xp;
}

int main() {
    sayHello();
    greetPlayer("Stanislav");
    
    int result = add(5, 3);
    std::cout << "5 + 3 = " << result << std::endl;
    
    int xp = calculateExperience(5, 3);
    std::cout << "You gained " << xp << " XP!" << std::endl;
    
    // You can also use the function directly
    std::cout << "10 + 20 = " << add(10, 20) << std::endl;
    
    return 0;
}
```

**Output:**
```
Hello, adventurer!
Welcome, Stanislav!
5 + 3 = 8
You gained 160 XP!
10 + 20 = 30
```

---

## Part 4: Pass by Value vs Pass by Reference

### Pass by Value (Default) — Makes a Copy

```cpp
void modifyValue(int x) {
    x = 100;  // Modifies the COPY, not the original
}

int main() {
    int health = 50;
    modifyValue(health);
    std::cout << health;  // Still 50 — unchanged!
}
```

### Pass by Reference (`&`) — Modifies Original

```cpp
void heal(int& health, int amount) {
    health += amount;  // Modifies the ACTUAL variable
}

int main() {
    int playerHealth = 50;
    heal(playerHealth, 30);
    std::cout << playerHealth;  // 80 — changed!
}
```

### Real Game Example

```cpp
#include <iostream>
#include <string>

// Pass by value — we just need the value, don't need to modify
void displayStats(std::string name, int health, int mana) {
    std::cout << name << " — HP: " << health << " | MP: " << mana << std::endl;
}

// Pass by reference — we want to MODIFY the original
void takeDamage(int& health, int damage) {
    health -= damage;
    if (health < 0) health = 0;
    std::cout << "Took " << damage << " damage! Health: " << health << std::endl;
}

// Pass by reference — avoid copying large objects (const for read-only)
void printInventory(const std::vector<std::string>& items) {
    for (const auto& item : items) {
        std::cout << "- " << item << std::endl;
    }
}

int main() {
    std::string playerName = "Kaelen";
    int health = 100;
    int mana = 50;
    
    displayStats(playerName, health, mana);
    takeDamage(health, 35);
    displayStats(playerName, health, mana);
    takeDamage(health, 80);
    displayStats(playerName, health, mana);
    
    return 0;
}
```

**Output:**
```
Kaelen — HP: 100 | MP: 50
Took 35 damage! Health: 65
Kaelen — HP: 65 | MP: 50
Took 80 damage! Health: 0
Kaelen — HP: 0 | MP: 50
```

---

## Part 5: Return Values — Multiple Ways

### Single Return (Most Common)

```cpp
int square(int x) {
    return x * x;
}
```

### Early Return (Guard Clauses)

```cpp
int divide(int a, int b) {
    if (b == 0) {
        std::cerr << "Error: Division by zero!" << std::endl;
        return 0;  // Early return on error
    }
    return a / b;  // Normal return
}
```

### Returning Multiple Values (Using References)

```cpp
// Calculate both sum and product
void calculate(int a, int b, int& sum, int& product) {
    sum = a + b;
    product = a * b;
}

int main() {
    int s, p;
    calculate(5, 3, s, p);
    std::cout << "Sum: " << s << ", Product: " << p << std::endl;
    return 0;
}
```

---

## Part 6: Function Declaration vs Definition

**Declaration** (prototype) — tells compiler "this function exists"
**Definition** (implementation) — the actual code

```cpp
#include <iostream>

// Declarations (usually in header files)
int add(int a, int b);
void printMessage(const std::string& msg);
float calculateDamage(float base, float multiplier);

// Definitions (usually in .cpp files)
int add(int a, int b) {
    return a + b;
}

void printMessage(const std::string& msg) {
    std::cout << msg << std::endl;
}

float calculateDamage(float base, float multiplier) {
    return base * multiplier;
}

int main() {
    std::cout << add(5, 3) << std::endl;
    printMessage("Hello!");
    std::cout << calculateDamage(15.0f, 2.0f) << std::endl;
    return 0;
}
```

**Why declare separately?** You can put declarations at the top, and definitions anywhere (even in different files). This is how large projects are organized.

---

## Part 7: Function Overloading

Multiple functions with the **same name** but different parameters.

```cpp
#include <iostream>

// Different parameter types
int add(int a, int b) {
    return a + b;
}

float add(float a, float b) {
    return a + b;
}

// Different number of parameters
int add(int a, int b, int c) {
    return a + b + c;
}

int main() {
    std::cout << add(5, 3) << std::endl;           // Calls int version
    std::cout << add(5.5f, 3.2f) << std::endl;     // Calls float version
    std::cout << add(1, 2, 3) << std::endl;        // Calls 3-parameter version
    return 0;
}
```

**Game Example: Damage Calculation**

```cpp
// Standard damage
int calculateDamage(int baseDamage) {
    return baseDamage + rand() % 10;
}

// Damage with elemental modifier
int calculateDamage(int baseDamage, float elementalBonus) {
    return static_cast<int>((baseDamage + rand() % 10) * elementalBonus);
}

// Damage with critical chance
int calculateDamage(int baseDamage, int criticalChance, int criticalMultiplier) {
    int damage = baseDamage + rand() % 10;
    if ((rand() % 100) < criticalChance) {
        damage *= criticalMultiplier;
    }
    return damage;
}
```

---

## Part 8: Default Parameters

Give parameters default values.

```cpp
#include <iostream>

void heal(int& health, int amount = 20) {  // Default healing = 20
    health += amount;
}

void logMessage(const std::string& message, int importance = 1) {
    std::cout << "[Level " << importance << "] " << message << std::endl;
}

int main() {
    int hp = 50;
    
    heal(hp);           // Uses default 20 → hp becomes 70
    heal(hp, 50);       // Uses 50 → hp becomes 120
    
    logMessage("Player joined");           // Level 1
    logMessage("Critical error!", 5);      // Level 5
    
    return 0;
}
```

**⚠️ Rules for default parameters:**
1. Must be from right to left (can't skip)
2. ```cpp
   // ✅ Correct
   void func(int a, int b = 10, int c = 20);
   
   // ❌ Wrong
   void func(int a = 10, int b, int c = 20);  // Can't have non-default after default
   ```

---

## Part 9: Scope and Lifetime

Where variables "live" matters!

```cpp
#include <iostream>

int globalScore = 1000;  // Global — lives entire program

void myFunction() {
    int localVar = 42;    // Local — dies when function ends
    static int staticVar = 0;  // Static — keeps value between calls
    staticVar++;
    
    std::cout << "Static: " << staticVar << std::endl;
    std::cout << "Global in function: " << globalScore << std::endl;
}

int main() {
    int localMain = 10;   // Local to main
    
    myFunction();  // Static: 1
    myFunction();  // Static: 2
    myFunction();  // Static: 3
    
    // std::cout << localVar;  // ERROR! localVar doesn't exist here
    
    return 0;
}
```

### Variable Scope Summary

| Type | Scope | Lifetime | When to Use |
|------|-------|----------|-------------|
| Local | Inside function only | Function call | Default — most variables |
| Static local | Inside function only | Entire program | Count calls, preserve state |
| Global | Everywhere | Entire program | Rarely — config, constants |
| Parameter | Inside function | Function call | Input values |

---

## Complete Example: RPG Combat System with Functions

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>

// Constants
const int MAX_HEALTH = 100;
const int CRITICAL_CHANCE = 20;  // 20%

// Function declarations
int calculateDamage(int baseDamage, int strength);
int calculateDamage(int baseDamage, int strength, float elementalBonus);
void applyDamage(int& health, int damage);
bool isCriticalHit();
std::string getCombatMessage(int damage, bool isCritical);
void displayBattleStatus(const std::string& playerName, int playerHealth, 
                         const std::string& enemyName, int enemyHealth);

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Player stats
    std::string playerName = "Kaelen";
    int playerHealth = MAX_HEALTH;
    int playerStrength = 15;
    
    // Enemy stats
    std::string enemyName = "Dragon";
    int enemyHealth = 150;
    int enemyStrength = 20;
    
    std::cout << "=== EPIC BATTLE ===" << std::endl;
    std::cout << playerName << " vs " << enemyName << "!\n" << std::endl;
    
    int turn = 0;
    while (playerHealth > 0 && enemyHealth > 0) {
        turn++;
        std::cout << "\n--- Turn " << turn << " ---" << std::endl;
        displayBattleStatus(playerName, playerHealth, enemyName, enemyHealth);
        
        // Player turn
        int playerDamage = calculateDamage(15, playerStrength);
        bool playerCrit = isCriticalHit();
        if (playerCrit) playerDamage *= 2;
        
        std::cout << getCombatMessage(playerDamage, playerCrit);
        applyDamage(enemyHealth, playerDamage);
        
        if (enemyHealth <= 0) {
            std::cout << "\n✦ VICTORY! " << enemyName << " is defeated! ✦" << std::endl;
            break;
        }
        
        // Enemy turn
        int enemyDamage = calculateDamage(12, enemyStrength);
        bool enemyCrit = isCriticalHit();
        if (enemyCrit) enemyDamage *= 2;
        
        std::cout << enemyName << " attacks for " << enemyDamage << " damage";
        if (enemyCrit) std::cout << " (CRITICAL!)";
        std::cout << "!" << std::endl;
        
        applyDamage(playerHealth, enemyDamage);
        
        if (playerHealth <= 0) {
            std::cout << "\n✗ DEFEAT! " << playerName << " has fallen... ✗" << std::endl;
            break;
        }
    }
    
    return 0;
}

// Function definitions
int calculateDamage(int baseDamage, int strength) {
    int randomBonus = rand() % 15;
    return baseDamage + (strength / 3) + randomBonus;
}

int calculateDamage(int baseDamage, int strength, float elementalBonus) {
    return static_cast<int>(calculateDamage(baseDamage, strength) * elementalBonus);
}

void applyDamage(int& health, int damage) {
    health -= damage;
    if (health < 0) health = 0;
}

bool isCriticalHit() {
    return (rand() % 100) < CRITICAL_CHANCE;
}

std::string getCombatMessage(int damage, bool isCritical) {
    if (isCritical) {
        return "⚡ CRITICAL HIT! ⚡ You deal " + std::to_string(damage) + " damage! ";
    }
    return "You hit for " + std::to_string(damage) + " damage! ";
}

void displayBattleStatus(const std::string& playerName, int playerHealth, 
                         const std::string& enemyName, int enemyHealth) {
    std::cout << "\n" << playerName << " ❤️ " << playerHealth << "/" << MAX_HEALTH << std::endl;
    std::cout << enemyName << " ❤️ " << enemyHealth << "/150" << std::endl;
}
```

---

## Common Mistakes

### 1. Forgetting to Return a Value

```cpp
// ❌ Undefined behavior!
int add(int a, int b) {
    a + b;  // Missing return!
}

// ✅ Correct
int add(int a, int b) {
    return a + b;
}
```

### 2. Returning a Reference to a Local Variable

```cpp
// ❌ DANGEROUS! Local variable dies after function ends
int& getValue() {
    int x = 42;
    return x;  // x is destroyed!
}

// ✅ Return by value
int getValue() {
    int x = 42;
    return x;
}
```

### 3. Mismatched Parameter Types

```cpp
void setHealth(float health) { }

int main() {
    setHealth(100);  // int converted to float — okay but be aware
    setHealth(100.5f);  // Correct
}
```

### 4. Unused Parameters

```cpp
// ❌ Warning: unused parameter
void logMessage(std::string message, int level) {
    std::cout << message << std::endl;  // 'level' never used
}

// ✅ Omit parameter name
void logMessage(std::string message, int /*level*/) {
    std::cout << message << std::endl;
}
```

### 5. Confusing Pass by Value vs Reference

```cpp
// This won't change the original
void addHealth(int health, int amount) {
    health += amount;
}

// This will
void addHealth(int& health, int amount) {
    health += amount;
}
```

---

## Quick Reference Card

```cpp
// Basic function
returnType functionName(parameters) {
    // code
    return value;
}

// Void function (no return)
void functionName(parameters) {
    // code
    // no return needed (or just 'return;')
}

// Pass by value (copy)
void func(Type param) { param = newValue; }

// Pass by reference (modify original)
void func(Type& param) { param = newValue; }

// Const reference (read-only, no copy)
void func(const Type& param) { /* read only */ }

// Function declaration (prototype)
returnType functionName(parameters);

// Default parameters
void func(int a, int b = 10, int c = 20);

// Function overloading — same name, different parameters
void display(int x);
void display(float x);
void display(int x, int y);

// Static local variable (keeps value)
void counter() {
    static int count = 0;
    count++;
}
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a function `bool isEven(int n)` that returns `true` if a number is even. Test it in `main()` with several values.

**Exercise 2 (Easy):** Write functions for:
- `int max(int a, int b)` — returns larger number
- `int min(int a, int b)` — returns smaller number
- `int clamp(int value, int low, int high)` — restricts value to range

**Exercise 3 (Medium):** Create a "Temperature Converter" with functions:
- `float celsiusToFahrenheit(float c)`
- `float fahrenheitToCelsius(float f)`
- `float celsiusToKelvin(float c)`
Menu system to choose conversion

**Exercise 4 (Medium):** Write a "Geometry Calculator" with functions:
- `float circleArea(float radius)`
- `float rectangleArea(float length, float width)`
- `float triangleArea(float base, float height)`
Menu to choose shape and calculate area

**Exercise 5 (Hard):** Create a "Bank Account" system with functions:
- `void deposit(float& balance, float amount)`
- `bool withdraw(float& balance, float amount)`
- `void displayBalance(float balance)`
- `void applyInterest(float& balance, float rate)` (rate as percentage, e.g., 5.0 for 5%)
Main program loop with menu

**Exercise 6 (Challenge):** Build a "Dice Game" with functions:
- `int rollDice(int sides)` — returns random 1 to sides
- `int rollMultiple(int count, int sides)` — sum of multiple dice
- `bool checkSuccess(int roll, int target)` — returns true if roll >= target
- `void displayRollHistory(const std::vector<int>& rolls)` — shows all rolls
Create a simple game where player tries to beat a target score

---

## Summary

You now know:

✅ Why functions make code reusable and readable  
✅ Function declaration vs definition  
✅ Parameters — pass by value vs reference  
✅ Return values and early returns  
✅ Function overloading (same name, different parameters)  
✅ Default parameters  
✅ Scope and lifetime of variables  

## What's Next?

Next lesson: **Structs and Enums** — create custom data types to organize related information (characters, items, game states)!

---

## Resources

- [C++ Functions (cppreference)](https://en.cppreference.com/w/cpp/language/functions)
- [Pass by value vs reference](https://www.learncpp.com/cpp-tutorial/pass-by-value-vs-pass-by-reference/)

---

**Practice Task:** Create a "Character Creator" system. Write functions for:
- `void createCharacter(std::string& name, int& health, int& strength)`
- `void displayCharacter(const std::string& name, int health, int strength)`
- `void levelUp(int& health, int& strength)`
- `bool saveCharacter(const std::string& name, int health, int strength)` — to file
- `bool loadCharacter(std::string& name, int& health, int& strength)` — from file

This combines functions, references, and file I/O (we'll cover file I/O in a future lesson if you need it)!