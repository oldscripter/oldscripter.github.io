---
title: "Basic Input/Output in C++"
description: "Make your programs interactive — read user input and format beautiful output"
pubDate: 2026-06-01
tags: ["C++", "beginner", "io", "cin", "cout"]
lang: "en"
lessonNumber: 3
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 3: Basic Input/Output

Welcome back! So far, our programs have been one-way conversations — we print, you read. Today, we'll make them **interactive** by reading user input and formatting output like a pro.

## What You'll Learn

- Output with `std::cout` (refresher + advanced formatting)
- Input with `std::cin`
- Handling strings with spaces (`std::getline`)
- Input validation basics
- Formatting output (width, precision, alignment)

---

## The I/O Streams Concept

C++ treats input and output as **streams** of data:

```
Keyboard → std::cin  → Program
Program  → std::cout → Console
Program  → std::cerr → Console (errors)
```

Think of them as pipes — data flows in one direction.

| Stream | Purpose | Direction |
|--------|---------|-----------|
| `std::cin` | Read user input | Into program |
| `std::cout` | Normal output | Out of program |
| `std::cerr` | Error messages | Out of program |
| `std::clog` | Logging messages | Out of program |

> You've already seen `std::cout`. Now let's master `std::cin`.

---

## Basic Output with `std::cout`

Refresher with new tricks:

```cpp
#include <iostream>

int main() {
    // Basic output
    std::cout << "Hello!" << std::endl;
    
    // Multiple items
    std::cout << "Player " << "has " << 100 << " health" << std::endl;
    
    // No new line
    std::cout << "Loading";
    std::cout << ".";
    std::cout << ".";
    std::cout << " Done!" << std::endl;
    
    return 0;
}
```

**Output:**
```
Hello!
Player has 100 health
Loading... Done!
```

### `endl` vs `\n`

Both create new lines, but they're different:

| | `std::endl` | `\n` |
|--|-------------|-----|
| Flushes buffer | ✅ Yes | ❌ No |
| Speed | Slower | Faster |
| When to use | Progress bars, logs | Most cases |

```cpp
std::cout << "Hello\n";     // Faster — use this normally
std::cout << "Error!\n";    // Also fine
std::cout << "Loading..." << std::endl;  // Force immediate output
```

> **Game Dev Tip:** Use `\n` in tight loops (thousands of prints). Use `std::endl` when you need output immediately (error messages, loading screens).

---

## Basic Input with `std::cin`

`std::cin` reads what the user types and stores it in variables.

```cpp
#include <iostream>

int main() {
    int age;
    std::string name;
    
    std::cout << "Enter your name: ";
    std::cin >> name;
    
    std::cout << "Enter your age: ";
    std::cin >> age;
    
    std::cout << "Hello " << name << ", you are " << age << " years old!" << std::endl;
    
    return 0;
}
```

**Example run:**
```
Enter your name: Stanislav
Enter your age: 28
Hello Stanislav, you are 28 years old!
```

### How `std::cin >>` Works

1. Program pauses and waits for input
2. User types and presses Enter
3. `>>` extracts the next **word** (stops at space/tab/newline)
4. Value is stored in the variable

```cpp
int x, y;
std::cin >> x >> y;  // User can type "10 20" or press Enter between
```

---

## The String Problem: `std::cin` Stops at Spaces

`std::cin >>` only reads until the first space. This fails for full names:

```cpp
std::string fullName;
std::cout << "Enter your full name: ";
std::cin >> fullName;  // User types "John Doe"
std::cout << fullName; // Only prints "John"!
```

**Solution:** Use `std::getline()` to read entire lines.

```cpp
#include <iostream>
#include <string>

int main() {
    std::string fullName;
    
    std::cout << "Enter your full name: ";
    std::getline(std::cin, fullName);  // Reads until Enter
    
    std::cout << "Hello, " << fullName << "!" << std::endl;
    
    return 0;
}
```

**Output:**
```
Enter your full name: John Doe
Hello, John Doe!
```

### The `std::cin` + `std::getline` Gotcha

After using `std::cin >>`, the newline character stays in the buffer. Then `std::getline` immediately reads that newline and skips your input!

```cpp
// ❌ This doesn't work as expected
int age;
std::string name;

std::cout << "Enter age: ";
std::cin >> age;                    // User presses Enter after typing
std::cout << "Enter name: ";
std::getline(std::cin, name);       // Reads the leftover newline! Skips input.
```

**Fix:** Call `std::cin.ignore()` to discard the newline.

```cpp
// ✅ Correct way
int age;
std::string name;

std::cout << "Enter age: ";
std::cin >> age;
std::cin.ignore();                   // Discard the newline
std::cout << "Enter name: ";
std::getline(std::cin, name);        // Now works correctly

std::cout << name << " is " << age << " years old" << std::endl;
```

Or use `std::getline` for everything and convert:

```cpp
std::string ageInput;
std::cout << "Enter age: ";
std::getline(std::cin, ageInput);
int age = std::stoi(ageInput);  // Convert string to int
```

---

## Multiple Inputs: One Line vs Multiple Lines

Users can input multiple values in one line OR across multiple lines — both work!

```cpp
#include <iostream>

int main() {
    int health, mana, stamina;
    
    std::cout << "Enter health, mana, stamina: ";
    std::cin >> health >> mana >> stamina;
    
    std::cout << "Health: " << health << std::endl;
    std::cout << "Mana: " << mana << std::endl;
    std::cout << "Stamina: " << stamina << std::endl;
    
    return 0;
}
```

**User can type:**
```
100 50 75
```
**OR:**
```
100
50
75
```
Both work identically!

---

## Error Output: `std::cerr`

Use `std::cerr` for error messages. It's separate from normal output and often appears immediately (no buffering).

```cpp
#include <iostream>

int main() {
    int age;
    
    std::cout << "Enter your age: ";
    std::cin >> age;
    
    if (age < 0) {
        std::cerr << "Error: Age cannot be negative!" << std::endl;
        return 1;  // Non-zero return indicates error
    }
    
    std::cout << "Age accepted: " << age << std::endl;
    return 0;
}
```

**Why `std::cerr`?**
- Redirectable independently (`program.exe 2> errors.txt`)
- Unbuffered (appears immediately, even if the program crashes)
- Standard practice for professional code

---

## Formatting Output

### Setting Width

```cpp
#include <iostream>
#include <iomanip>  // Required for manipulators

int main() {
    std::cout << "=== Character Stats ===" << std::endl;
    
    std::cout << std::setw(15) << "Health" << ": " << 100 << std::endl;
    std::cout << std::setw(15) << "Mana" << ": " << 50 << std::endl;
    std::cout << std::setw(15) << "Armor Rating" << ": " << 25 << std::endl;
    
    return 0;
}
```

**Output:**
```
=== Character Stats ===
         Health: 100
           Mana: 50
   Armor Rating: 25
```

### Setting Precision for Floats

```cpp
#include <iostream>
#include <iomanip>

int main() {
    float pi = 3.14159265359f;
    
    std::cout << "Default: " << pi << std::endl;
    std::cout << "2 decimals: " << std::fixed << std::setprecision(2) << pi << std::endl;
    std::cout << "5 decimals: " << std::fixed << std::setprecision(5) << pi << std::endl;
    
    // Scientific notation
    std::cout << "Scientific: " << std::scientific << pi << std::endl;
    
    return 0;
}
```

**Output:**
```
Default: 3.14159
2 decimals: 3.14
5 decimals: 3.14159
Scientific: 3.14159e+00
```

### Alignment (Left/Right)

```cpp
#include <iostream>
#include <iomanip>

int main() {
    std::cout << std::left << std::setw(15) << "Name"
              << std::right << std::setw(10) << "Health" << std::endl;
    std::cout << std::left << std::setw(15) << "Warrior"
              << std::right << std::setw(10) << 100 << std::endl;
    std::cout << std::left << std::setw(15) << "Mage"
              << std::right << std::setw(10) << 80 << std::endl;
    
    return 0;
}
```

**Output:**
```
Name                    Health
Warrior                    100
Mage                        80
```

### Boolean Formatting

```cpp
#include <iostream>

int main() {
    bool isAlive = true;
    bool hasKey = false;
    
    std::cout << "Default: " << isAlive << " " << hasKey << std::endl;
    std::cout << std::boolalpha;
    std::cout << "With boolalpha: " << isAlive << " " << hasKey << std::endl;
    
    return 0;
}
```

**Output:**
```
Default: 1 0
With boolalpha: true false
```

---

## Complete Example: Character Creator

Let's combine everything we've learned:

```cpp
#include <iostream>
#include <string>
#include <iomanip>

int main() {
    std::string name, className;
    int health, strength, agility;
    float critChance;
    
    // Welcome
    std::cout << "========================================" << std::endl;
    std::cout << "       CHARACTER CREATOR v1.0" << std::endl;
    std::cout << "========================================" << std::endl;
    
    // Input with proper handling
    std::cout << "\nEnter character name: ";
    std::getline(std::cin, name);
    
    std::cout << "Enter class (Warrior/Mage/Rogue): ";
    std::getline(std::cin, className);
    
    std::cout << "Enter health (1-100): ";
    std::cin >> health;
    
    std::cout << "Enter strength (1-20): ";
    std::cin >> strength;
    
    std::cout << "Enter agility (1-20): ";
    std::cin >> agility;
    
    std::cout << "Enter critical hit chance (0.0-50.0): ";
    std::cin >> critChance;
    
    // Clear input buffer for any future getline
    std::cin.ignore();
    
    // Validation check
    if (health < 1 || health > 100) {
        std::cerr << "Error: Health must be between 1 and 100!" << std::endl;
        return 1;
    }
    
    // Output character sheet with formatting
    std::cout << "\n========================================" << std::endl;
    std::cout << "         CHARACTER SHEET" << std::endl;
    std::cout << "========================================" << std::endl;
    
    std::cout << std::left << std::setw(15) << "Name" << ": " << name << std::endl;
    std::cout << std::left << std::setw(15) << "Class" << ": " << className << std::endl;
    std::cout << std::left << std::setw(15) << "Health" << ": " << health << std::endl;
    std::cout << std::left << std::setw(15) << "Strength" << ": " << strength << std::endl;
    std::cout << std::left << std::setw(15) << "Agility" << ": " << agility << std::endl;
    
    std::cout << std::left << std::setw(15) << "Crit Chance" << ": ";
    std::cout << std::fixed << std::setprecision(1) << critChance << "%" << std::endl;
    
    // Stat calculation
    int damage = strength * 2;
    int dodgeChance = agility * 2;
    
    std::cout << "\n=== Derived Stats ===" << std::endl;
    std::cout << "Base Damage: " << damage << std::endl;
    std::cout << "Dodge Chance: " << dodgeChance << "%" << std::endl;
    
    std::cout << "\nWelcome to the adventure, " << name << "!" << std::endl;
    
    return 0;
}
```

**Example run:**
```
========================================
       CHARACTER CREATOR v1.0
========================================

Enter character name: Kaelen
Enter class (Warrior/Mage/Rogue): Warrior
Enter health (1-100): 95
Enter strength (1-20): 18
Enter agility (1-20): 12
Enter critical hit chance (0.0-50.0): 15.5

========================================
         CHARACTER SHEET
========================================
Name           : Kaelen
Class          : Warrior
Health         : 95
Strength       : 18
Agility        : 12
Crit Chance    : 15.5%

=== Derived Stats ===
Base Damage: 36
Dodge Chance: 24%

Welcome to the adventure, Kaelen!
```

---

## Common Mistakes

### 1. Forgetting `#include <iomanip>`
```cpp
std::cout << std::setw(10);  // ERROR without #include <iomanip>
```

### 2. Mixing `cin` and `getline` without `ignore()`
```cpp
std::cin >> age;
std::getline(std::cin, name);  // Reads leftover newline — silent bug!
```

### 3. Not checking for invalid input
```cpp
int age;
std::cin >> age;  // User types "abc" — age becomes 0 and cin enters error state
```

### 4. Using `endl` too often in loops
```cpp
for (int i = 0; i < 10000; i++) {
    std::cout << i << std::endl;  // SLOW — flushes every iteration
}
// Better:
for (int i = 0; i < 10000; i++) {
    std::cout << i << '\n';  // Fast
}
```

---

## Quick Reference Card

```cpp
// Output
std::cout << "Text" << std::endl;   // With newline + flush
std::cout << "Text\n";              // Just newline (faster)
std::cout << "Text";                // No newline

// Error output
std::cerr << "Error message" << std::endl;

// Basic input
int x;
std::cin >> x;                      // Reads one value

// Multiple inputs
std::cin >> a >> b >> c;            // Space or Enter separated

// String with spaces
std::string line;
std::getline(std::cin, line);       // Reads entire line

// Clear buffer
std::cin.ignore();                  // Discard one character
std::cin.ignore(1000, '\n');        // Discard up to 1000 chars or until newline

// Formatting (requires <iomanip>)
std::cout << std::setw(10);         // Set field width
std::cout << std::left;             // Left align
std::cout << std::right;            // Right align
std::cout << std::fixed;            // Fixed decimal notation
std::cout << std::setprecision(2);  // 2 decimal places
std::cout << std::boolalpha;        // Print true/false instead of 1/0
```

---

## Practice Exercises

**Exercise 1 (Easy):** Ask the user for their favorite game and how many hours they've played. Print a summary.

**Exercise 2 (Medium):** Create a simple login system. Ask for username and password (just strings). If username is "admin" and password is "1234", print "Access granted!" otherwise print "Access denied!"

**Exercise 3 (Medium):** Build a tip calculator. Ask for bill amount (float) and tip percentage (int). Calculate and display the tip amount and total with 2 decimal places.

**Exercise 4 (Hard):** Create an interactive "Guess My Number" game. Generate a random number between 1-100 (use `rand()` for now). Let the user guess repeatedly until they get it right, telling them "too high" or "too low" each time.

**Exercise 5 (Challenge):** Fix this buggy code:
```cpp
#include <iostream>
#include <string>
int main() {
    int year;
    std::string game;
    std::cout << "Enter release year: ";
    std::cin >> year;
    std::cout << "Enter game name: ";
    std::getline(std::cin, game);
    std::cout << game << " was released in " << year;
    return 0;
}
```

---

## Summary

You now know:

✅ How to read user input with `std::cin`  
✅ The difference between `std::cin >>` and `std::getline()`  
✅ How to fix the `cin`/`getline` buffer issue with `ignore()`  
✅ Professional output formatting (width, precision, alignment)  
✅ When to use `std::endl` vs `\n`  
✅ Error output with `std::cerr`  

## What's Next?

Next lesson: **Operators and Expressions** — we'll learn arithmetic, comparison, and logical operators to build game logic (damage calculation, stat checks, conditions)!

---

## Resources

- [C++ I/O Manipulators (cppreference)](https://en.cppreference.com/w/cpp/io/manip)
- [std::cin, std::cout documentation](https://en.cppreference.com/w/cpp/io/cin)

---

**Practice Task:** Build a "Dice Roller" program. Ask the user how many dice to roll and how many sides each die has (e.g., 2 dice, 6 sides each). Calculate and display the total. Bonus: Show each individual roll result.