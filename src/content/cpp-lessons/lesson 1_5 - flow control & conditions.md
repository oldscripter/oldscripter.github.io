---
title: "Control Flow: if, else, and switch"
description: "Make decisions in your code — branching paths, multiple outcomes, and game logic"
pubDate: 2026-06-01
tags: ["C++", "beginner", "control-flow", "if-else", "switch"]
lessonNumber: 5
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 5: Control Flow — if, else, and switch

Welcome back! Now that we can calculate and compare values, it's time to make our programs **think**. Control flow statements let your code make decisions — the foundation of every game, from "did the player press jump?" to complex AI behavior.

## What You'll Learn

- The `if` statement (basic decisions)
- `else` and `else if` (multiple paths)
- Nested `if` statements
- The ternary operator (`? :`) — shorthand
- `switch` statements (multiple fixed choices)
- Best practices and common patterns

---

## Part 1: The `if` Statement

The most basic decision maker: "If this is true, do that."

```cpp
#include <iostream>

int main() {
    int health = 75;
    
    if (health < 100) {
        std::cout << "You are wounded! Find a health potion." << std::endl;
    }
    
    if (health <= 0) {
        std::cout << "Game Over!" << std::endl;
    }
    
    // Single statement (braces optional but NOT recommended)
    if (health > 50) 
        std::cout << "You're doing okay." << std::endl;  // Only this line is conditional
    
    // ALWAYS use braces for clarity and safety
    if (health > 50) {
        std::cout << "You're doing okay." << std::endl;
    }
    
    return 0;
}
```

### The Condition Can Be ANY Expression

```cpp
int score = 100;
int lives = 3;

// Direct boolean
if (lives > 0) { }

// Comparison
if (score == 100) { }

// Function that returns bool
if (isPlayerAlive()) { }

// Variable that is bool
bool hasKey = true;
if (hasKey) { }  // Same as if (hasKey == true)

// Zero = false, non-zero = true
int enemies = 5;
if (enemies) { }  // True because enemies != 0
```

---

## Part 2: `if-else` — Two Paths

"Either do this OR that."

```cpp
#include <iostream>

int main() {
    int mana = 30;
    
    if (mana >= 50) {
        std::cout << "Cast Fireball!" << std::endl;
        mana -= 50;
    } else {
        std::cout << "Not enough mana. Use a smaller spell." << std::endl;
    }
    
    // Real game example: critical hit
    int attackRoll = rand() % 20 + 1;  // 1-20
    
    if (attackRoll == 20) {
        std::cout << "CRITICAL HIT! Double damage!" << std::endl;
    } else {
        std::cout << "Normal hit." << std::endl;
    }
    
    return 0;
}
```

---

## Part 3: `else if` — Multiple Paths

When you have more than two possibilities.

```cpp
#include <iostream>

int main() {
    int grade = 85;
    
    if (grade >= 90) {
        std::cout << "A - Excellent!" << std::endl;
    } else if (grade >= 80) {
        std::cout << "B - Good job!" << std::endl;
    } else if (grade >= 70) {
        std::cout << "C - Passing" << std::endl;
    } else if (grade >= 60) {
        std::cout << "D - Needs improvement" << std::endl;
    } else {
        std::cout << "F - Failed" << std::endl;
    }
    
    return 0;
}
```

### Real Game Example: Player Rank

```cpp
#include <iostream>

int main() {
    int experience = 1250;
    std::string rank;
    
    if (experience >= 5000) {
        rank = "Legendary";
    } else if (experience >= 2500) {
        rank = "Master";
    } else if (experience >= 1000) {
        rank = "Expert";
    } else if (experience >= 500) {
        rank = "Veteran";
    } else if (experience >= 100) {
        rank = "Novice";
    } else {
        rank = "Rookie";
    }
    
    std::cout << "Your rank: " << rank << std::endl;
    
    return 0;
}
```

### Important: Order Matters!

Conditions are checked from top to bottom. The FIRST true block executes.

```cpp
int x = 75;

// ✅ Correct order (most specific first)
if (x > 100) {
    std::cout << "Over 100";
} else if (x > 50) {   // 75 > 50 is true, but we already checked >100
    std::cout << "51-100";
} else if (x > 0) {
    std::cout << "1-50";
}

// ❌ Wrong order (this never reaches x > 100)
if (x > 50) {          // 75 > 50 is true - executes here!
    std::cout << "Over 50";
} else if (x > 100) {  // NEVER runs because first condition was true
    std::cout << "Over 100";
}
```

---

## Part 4: Nested `if` Statements

`if` statements inside other `if` statements.

```cpp
#include <iostream>

int main() {
    bool hasKey = true;
    bool hasTorch = false;
    bool isDaytime = true;
    
    // Entering a dark cave
    if (hasKey) {
        std::cout << "Door unlocked!" << std::endl;
        
        if (hasTorch || isDaytime) {
            std::cout << "You can see inside." << std::endl;
        } else {
            std::cout << "It's pitch black! You need a torch." << std::endl;
        }
    } else {
        std::cout << "The door is locked. Find the key." << std::endl;
    }
    
    return 0;
}
```

### Complex Game Logic Example

```cpp
#include <iostream>

int main() {
    int playerLevel = 12;
    int playerHealth = 45;
    int enemyHealth = 30;
    bool hasHealingPotion = true;
    
    // Decision: fight or flee?
    if (enemyHealth > 0) {
        // Enemy is alive
        if (playerHealth > 20) {
            // Safe enough to fight
            std::cout << "Attack the enemy!" << std::endl;
            
            if (playerLevel >= 10) {
                std::cout << "Use special ability!" << std::endl;
            }
        } else {
            // Low health
            if (hasHealingPotion) {
                std::cout << "Use healing potion, then fight!" << std::endl;
            } else {
                std::cout << "Flee! You're too weak." << std::endl;
            }
        }
    } else {
        std::cout << "Enemy already defeated." << std::endl;
    }
    
    return 0;
}
```

---

## Part 5: The Ternary Operator (`? :`)

A shorthand for simple `if-else` statements.

```cpp
// Traditional if-else
int health;
if (score > 100) {
    health = 100;
} else {
    health = 50;
}

// Ternary operator (condition ? true_value : false_value)
int health = (score > 100) ? 100 : 50;
```

### More Examples

```cpp
#include <iostream>
#include <string>

int main() {
    int mana = 45;
    
    // Set message based on condition
    std::string status = (mana >= 50) ? "Ready to cast" : "Need more mana";
    std::cout << status << std::endl;
    
    // Determine max health
    int level = 5;
    int maxHealth = (level >= 10) ? 200 : 100;
    
    // Nested ternary (readable? debatable)
    int score = 85;
    char grade = (score >= 90) ? 'A' :
                 (score >= 80) ? 'B' :
                 (score >= 70) ? 'C' :
                 (score >= 60) ? 'D' : 'F';
    
    // Game example: movement speed
    bool isSprinting = true;
    bool isCrouching = false;
    float baseSpeed = 5.0f;
    float currentSpeed = isSprinting ? baseSpeed * 2.0f : 
                        (isCrouching ? baseSpeed * 0.5f : baseSpeed);
    
    return 0;
}
```

**When to use ternary:**
- ✅ Simple, one-line assignments
- ✅ When it improves readability
- ❌ NOT for complex logic
- ❌ NOT for side effects (function calls)

---

## Part 6: The `switch` Statement

When you have many fixed values to check against a SINGLE variable.

```cpp
#include <iostream>

int main() {
    int weaponChoice = 2;
    
    switch (weaponChoice) {
        case 1:
            std::cout << "Sword equipped!" << std::endl;
            std::cout << "Damage: 15-25" << std::endl;
            break;  // Without break, execution "falls through"
        case 2:
            std::cout << "Bow equipped!" << std::endl;
            std::cout << "Damage: 10-30 (ranged)" << std::endl;
            break;
        case 3:
            std::cout << "Staff equipped!" << std::endl;
            std::cout << "Damage: 8-20 (magic)" << std::endl;
            break;
        default:  // Runs if no case matches
            std::cout << "Fists equipped!" << std::endl;
            std::cout << "Damage: 2-6" << std::endl;
            break;
    }
    
    return 0;
}
```

### Game Example: Movement Input

```cpp
#include <iostream>

int main() {
    char input;
    std::cout << "Press W/A/S/D to move: ";
    std::cin >> input;
    
    switch (input) {
        case 'w':
        case 'W':
            std::cout << "Moving UP" << std::endl;
            break;
        case 's':
        case 'S':
            std::cout << "Moving DOWN" << std::endl;
            break;
        case 'a':
        case 'A':
            std::cout << "Moving LEFT" << std::endl;
            break;
        case 'd':
        case 'D':
            std::cout << "Moving RIGHT" << std::endl;
            break;
        default:
            std::cout << "Invalid input!" << std::endl;
            break;
    }
    
    return 0;
}
```

### Fall-Through Behavior (Intentional)

Sometimes you WANT multiple cases to do the same thing.

```cpp
#include <iostream>

int main() {
    int month = 4;
    int days;
    
    switch (month) {
        case 2:  // February
            days = 28;
            break;
        case 4:
        case 6:
        case 9:
        case 11:  // April, June, September, November
            days = 30;
            break;
        default:  // January, March, May, July, August, October, December
            days = 31;
            break;
    }
    
    std::cout << "Days in month " << month << ": " << days << std::endl;
    
    return 0;
}
```

### switch vs if-else: Which to Use?

| Use `switch` when... | Use `if-else` when... |
|---------------------|----------------------|
| Testing ONE variable | Complex conditions |
| Fixed values (integers, chars, enums) | Ranges (x > 5 && x < 10) |
| Many cases (more than 3-4) | Boolean logic (&&, \|\|) |
| Clear, mutually exclusive options | Different variables |

```cpp
// Good for switch
switch (difficulty) {
    case EASY:    health = 100; break;
    case NORMAL:  health = 75;  break;
    case HARD:    health = 50;  break;
}

// Must use if-else (ranges)
if (health <= 0) {
    // dead
} else if (health < 25) {
    // critical
} else if (health < 75) {
    // wounded
} else {
    // healthy
}
```

---

## Part 7: Common Patterns and Best Practices

### Pattern 1: Guard Clauses (Early Returns)

Check error conditions FIRST, then do the main work.

```cpp
// ❌ Deep nesting (bad)
void processDamage(int damage, int health) {
    if (damage > 0) {
        if (health > 0) {
            health -= damage;
            if (health <= 0) {
                std::cout << "Player died!";
            }
        }
    }
}

// ✅ Guard clauses (good)
void processDamage(int damage, int health) {
    if (damage <= 0) return;
    if (health <= 0) return;
    
    health -= damage;
    if (health <= 0) {
        std::cout << "Player died!";
    }
}
```

### Pattern 2: Combining Conditions with Logical Operators

Instead of nested `if`s, combine when possible.

```cpp
// ❌ Too nested
if (hasKey) {
    if (hasTorch) {
        if (level >= 5) {
            openChest();
        }
    }
}

// ✅ Combined
if (hasKey && hasTorch && level >= 5) {
    openChest();
}
```

### Pattern 3: Boolean Flags

```cpp
// ❌ Redundant comparison
if (isAlive == true) { }

// ✅ Direct
if (isAlive) { }

// ❌ Double negative
if (!isDead == false) { }

// ✅ Clear
if (isAlive) { }
```

### Pattern 4: Constant Conditions

Put constants on the left to catch `=` typos.

```cpp
// ❌ Easy to mistype =
if (health = 0) {  // Bug: assigns, then checks

// ✅ Compiler error if you type =
if (0 = health) {  // Error: can't assign to constant
}
```

---

## Part 8: Complete Game Example — RPG Dialogue System

```cpp
#include <iostream>
#include <string>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    std::string playerName;
    int reputation = 0;  // -100 to 100
    int gold = 50;
    
    std::cout << "=== THE VILLAGE ELDER ===" << std::endl;
    std::cout << "Enter your name: ";
    std::getline(std::cin, playerName);
    
    std::cout << "\nElder: Welcome, " << playerName << "! We need a hero.\n" << std::endl;
    
    // Dialogue choices
    std::cout << "How do you respond?\n";
    std::cout << "1. 'I'll help. What's the reward?' (Greedy)\n";
    std::cout << "2. 'I shall help. For honor!' (Noble)\n";
    std::cout << "3. '...' (Silent)\n";
    std::cout << "4. 'Not interested.' (Refuse)\n";
    std::cout << "Choice: ";
    
    int choice;
    std::cin >> choice;
    
    // Update reputation based on choice
    switch (choice) {
        case 1:
            std::cout << "\nElder: *frowns* Very well... There's 100 gold in it for you.\n";
            reputation -= 10;
            break;
        case 2:
            std::cout << "\nElder: *smiles* A true hero! The village thanks you.\n";
            reputation += 20;
            break;
        case 3:
            std::cout << "\nElder: ... I'll take that as a yes.\n";
            reputation += 5;  // Neutral, slight positive
            break;
        case 4:
            std::cout << "\nElder: *sighs* Then we have no hope...\n";
            reputation -= 30;
            gold = 0;  // Refuse quest, leave town
            break;
        default:
            std::cout << "\nElder: I'll assume that's a yes?\n";
            break;
    }
    
    // Quest reward based on reputation
    std::cout << "\n--- OUTCOME ---" << std::endl;
    
    if (reputation >= 20) {
        std::cout << "The elder gives you a family heirloom as thanks!\n";
        gold += 150;
    } else if (reputation >= 0) {
        std::cout << "The elder pays you the standard reward.\n";
        gold += 100;
    } else if (reputation > -20) {
        std::cout << "The elder pays you less than promised.\n";
        gold += 50;
    } else {
        std::cout << "The elder refuses to pay you. You leave in shame.\n";
        gold = 0;
    }
    
    // Final stats
    std::cout << "\n=== QUEST COMPLETE ===" << std::endl;
    std::cout << "Reputation: " << reputation << std::endl;
    std::cout << "Gold: " << gold << std::endl;
    
    // Final message based on reputation
    if (reputation >= 20) {
        std::cout << "The villagers cheer your name! You are a legend!" << std::endl;
    } else if (reputation >= 0) {
        std::cout << "The villagers respect you." << std::endl;
    } else if (reputation > -30) {
        std::cout << "The villagers avoid eye contact." << std::endl;
    } else {
        std::cout << "You are banned from the village forever." << std::endl;
    }
    
    return 0;
}
```

---

## Common Mistakes

### 1. Forgetting Braces

```cpp
// ❌ Looks like both lines are conditional, but only the first is
if (health <= 0)
    std::cout << "Game Over" << std::endl;
    respawn();  // This ALWAYS runs!

// ✅ Braces fix it
if (health <= 0) {
    std::cout << "Game Over" << std::endl;
    respawn();
}
```

### 2. Missing `break` in `switch`

```cpp
int x = 2;
switch (x) {
    case 1:
        std::cout << "One";
        // Missing break! Falls through to case 2
    case 2:
        std::cout << "Two";  // Executes even though x == 2
        break;  // Without break, would fall to default
    default:
        std::cout << "Other";
}
// Output: "Two" (fine) but if x=1: output "OneTwo"
```

### 3. Using `=` instead of `==`

```cpp
int x = 5;
if (x = 10) {  // Assigns 10 to x, condition is TRUE (10 != 0)
    // This ALWAYS runs!
}
```

### 4. Semicolon after `if`

```cpp
if (health <= 0);  // Empty statement! The if does nothing
{
    std::cout << "Game Over";  // This ALWAYS runs
}
```

### 5. Overly Complex Conditions

```cpp
// ❌ Hard to read
if ((player.alive && !player.stunned) || (player.invincibleFrames > 0 && player.health > 0) && !player.isFrozen) {
    player.attack();
}

// ✅ Break it down
bool canAct = player.alive && !player.stunned && !player.isFrozen;
bool invincibleButAlive = player.invincibleFrames > 0 && player.health > 0;

if (canAct || invincibleButAlive) {
    player.attack();
}
```

---

## Quick Reference Card

```cpp
// Basic if
if (condition) {
    // runs if true
}

// if-else
if (condition) {
    // runs if true
} else {
    // runs if false
}

// if-else if-else
if (condition1) {
    // runs if condition1 true
} else if (condition2) {
    // runs if condition1 false AND condition2 true
} else {
    // runs if all false
}

// Ternary operator
variable = (condition) ? value_if_true : value_if_false;

// Switch
switch (expression) {
    case value1:
        // code
        break;
    case value2:
        // code
        break;
    default:
        // code
        break;
}

// Guard clause pattern
if (error_condition) return;
// main logic continues...
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a program that asks for a number and prints:
- "Positive" if > 0
- "Negative" if < 0
- "Zero" if == 0

**Exercise 2 (Easy):** Rock Paper Scissors. Ask for player choice (1=Rock, 2=Paper, 3=Scissors), generate random computer choice, determine winner using `switch`.

**Exercise 3 (Medium):** Create a "Grade Calculator" using `if-else if`. Input score (0-100), output letter grade (A=90+, B=80+, C=70+, D=60+, F=below 60). Add +/- (e.g., B+ for 87-89).

**Exercise 4 (Medium):** Write a "Simple Calculator" using `switch`. Input two numbers and an operator (+, -, *, /). Perform the calculation. Handle division by zero.

**Exercise 5 (Hard):** Create a "Day of Week" program using `switch`. Input number 1-7, output day name. Then extend with `if-else` to say "Weekend!" for Saturday/Sunday.

**Exercise 6 (Challenge):** Build a "Text Adventure" with at least 3 choices. Each choice leads to different outcomes. Track player stats (health, gold, reputation). Use nested `if` statements and `switch` for different branches.

---

## Summary

You now know:

✅ `if`, `else`, and `else if` for branching logic  
✅ The ternary operator for simple assignments  
✅ `switch` statements for multiple fixed values  
✅ Nested conditions and when to avoid deep nesting  
✅ Guard clauses and early returns  
✅ Common patterns and pitfalls  

## What's Next?

Next lesson: **Loops (while, do-while, for)** — we'll learn how to repeat code efficiently, from game loops to processing collections!

---

## Resources

- [C++ if Statement (cppreference)](https://en.cppreference.com/w/cpp/language/if)
- [C++ switch Statement (cppreference)](https://en.cppreference.com/w/cpp/language/switch)
- [C++ Tutorial: Control Flow](https://www.learncpp.com/cpp-tutorial/control-flow-introduction/)

---

**Practice Task:** Create a simple "Guess the Number" game where the computer picks a random number (1-100). Use `if-else` to tell the player "too high" or "too low". Use a counter to track attempts. Add different messages based on how many attempts they took (e.g., "Amazing!" for <5, "Good" for 5-10, "Better luck next time" for >10).