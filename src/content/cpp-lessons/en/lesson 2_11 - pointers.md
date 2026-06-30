---
title: "Pointers and Dynamic Memory"
description: "Manage memory directly, create flexible data structures, and understand how games really work"
pubDate: 2026-06-01
tags: ["C++", "intermediate", "pointers", "dynamic-memory", "memory-management"]
lang: "en"
lessonNumber: 11
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 11: Pointers and Dynamic Memory

Welcome back! So far, all our variables have fixed sizes known at compile time. **Pointers** and **dynamic memory** let us create data that grows and shrinks at runtime — essential for games with unknown numbers of enemies, player inventories, and procedurally generated worlds.

## What You'll Learn

- What pointers are and why they matter
- Address-of operator (`&`) and dereference operator (`*`)
- Pointer arithmetic
- Dynamic memory with `new` and `delete`
- `nullptr` and null pointer safety
- Pointers to structs and arrays
- Smart pointers (modern C++)

---

## Part 1: What Are Pointers?

A pointer is a variable that **stores a memory address** instead of a value.

Think of memory as a giant apartment building:
- Each apartment has an **address** (like 0x1234)
- Each apartment contains a **value** (like 42)
- A **pointer** is a sticky note with an address written on it

```cpp
#include <iostream>

int main() {
    int health = 100;  // Regular variable
    
    // Pointer that can store the address of an int
    int* ptr = &health;  // & = "address of" operator
    
    std::cout << "Value of health: " << health << std::endl;     // 100
    std::cout << "Address of health: " << &health << std::endl;  // 0x16fdff3a8
    std::cout << "Value of ptr: " << ptr << std::endl;           // 0x16fdff3a8
    std::cout << "Value at address ptr: " << *ptr << std::endl;  // 100 (dereference)
    
    // Modify through pointer
    *ptr = 75;
    std::cout << "After *ptr = 75, health: " << health << std::endl;  // 75
    
    return 0;
}
```

### Pointer Syntax Cheat Sheet

| Syntax | Meaning |
|--------|---------|
| `int* ptr` | Pointer to an integer |
| `&variable` | Address of variable |
| `*ptr` | Value at address (dereference) |
| `ptr = &x` | Make ptr point to x |
| `*ptr = 42` | Change value at address to 42 |

---

## Part 2: Why Use Pointers?

### Problem 1: Functions can't modify original variables (without references)

```cpp
// ❌ Without pointers or references
void badHeal(int health) {
    health += 50;  // Modifies copy only
}

// ✅ With pointers (C-style)
void healWithPointer(int* health) {
    *health += 50;  // Modifies original!
}

// ✅ With references (C++ style — preferred when possible)
void healWithReference(int& health) {
    health += 50;
}

int main() {
    int hp = 30;
    badHeal(hp);           // hp still 30
    healWithPointer(&hp);  // hp becomes 80
    healWithReference(hp); // hp becomes 130
    return 0;
}
```

### Problem 2: Dynamic arrays (size unknown at compile time)

```cpp
// ❌ Static array — fixed size
int scores[100];  // Wastes memory if only 10 used, or too small if 200 needed

// ✅ Dynamic array — exact size at runtime
int size;
std::cout << "How many enemies? ";
std::cin >> size;

int* enemyHealths = new int[size];  // Allocate exactly 'size' integers

for (int i = 0; i < size; i++) {
    enemyHealths[i] = 100;
}

delete[] enemyHealths;  // Don't forget to free!
```

### Problem 3: Large data structures (avoid copying)

```cpp
struct GiantData {
    int data[1000000];  // 4 MB!
};

// ❌ Copies 4 MB every time!
void processByValue(GiantData d) { }

// ✅ No copy — just passes address (8 bytes)
void processByPointer(GiantData* d) { }

// ✅ Also no copy (C++ way)
void processByReference(GiantData& d) { }
```

---

## Part 3: Pointer Declarations

```cpp
int main() {
    // Basic pointer declarations
    int* ptr1;      // Pointer to int
    float* ptr2;    // Pointer to float
    char* ptr3;     // Pointer to char
    bool* ptr4;     // Pointer to bool
    
    // Multiple pointers on one line
    int *a, *b, *c;  // Three pointers
    int* a, b, c;    // WRONG! Only 'a' is pointer, b and c are ints
    
    // Best practice: attach '*' to the variable name
    int *playerPtr;
    
    // Initialize to null (points to nothing)
    int* nullPtr = nullptr;
    
    return 0;
}
```

---

## Part 4: Dynamic Memory Allocation (`new` and `delete`)

### Single Variables

```cpp
#include <iostream>

int main() {
    // Allocate a single integer on the heap
    int* healthPtr = new int;
    *healthPtr = 100;
    
    std::cout << "Health: " << *healthPtr << std::endl;
    
    // Allocate and initialize
    int* manaPtr = new int(50);  // Creates int with value 50
    
    // Don't forget to free!
    delete healthPtr;
    delete manaPtr;
    healthPtr = nullptr;  // Good practice: set to null after delete
    manaPtr = nullptr;
    
    return 0;
}
```

### Arrays

```cpp
#include <iostream>

int main() {
    int size = 10;
    
    // Allocate array of 10 ints
    int* arr = new int[size];
    
    // Fill with values
    for (int i = 0; i < size; i++) {
        arr[i] = i * 10;  // Use like normal array
    }
    
    // Print
    for (int i = 0; i < size; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
    
    // Free array memory
    delete[] arr;
    arr = nullptr;
    
    return 0;
}
```

### Objects and Structs

```cpp
#include <iostream>
#include <string>

struct Player {
    std::string name;
    int health;
    int level;
};

int main() {
    // Allocate single struct
    Player* player1 = new Player;
    player1->name = "Kaelen";   // Arrow operator (->) for pointers
    player1->health = 100;
    player1->level = 5;
    
    // Allocate and initialize
    Player* player2 = new Player{"Aria", 80, 3};
    
    // Access members
    std::cout << player1->name << " (Level " << player1->level << ")" << std::endl;
    std::cout << player2->name << " (Health: " << player2->health << ")" << std::endl;
    
    // Don't forget to delete!
    delete player1;
    delete player2;
    
    return 0;
}
```

### The Arrow Operator (`->`)

```cpp
struct Point { float x, y; };

int main() {
    Point p = {10, 20};      // Regular struct
    Point* ptr = &p;          // Pointer to struct
    
    // These are equivalent:
    (*ptr).x = 30;   // Dereference first, then access member
    ptr->x = 30;     // Arrow operator (cleaner!)
    
    return 0;
}
```

---

## Part 5: `nullptr` and Null Pointers

Always initialize pointers to `nullptr` when they don't point to valid memory.

```cpp
#include <iostream>

int main() {
    int* ptr = nullptr;  // Points to nothing
    
    // Always check before using!
    if (ptr != nullptr) {
        *ptr = 100;  // Safe
    } else {
        std::cout << "Pointer is null! Can't use." << std::endl;
    }
    
    // After delete, set to nullptr
    int* data = new int(42);
    delete data;
    data = nullptr;  // Prevents accidental use after delete
    
    return 0;
}
```

---

## Part 6: Pointer Arithmetic

Pointers can be incremented/decremented to move through memory.

```cpp
#include <iostream>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int* ptr = arr;  // Points to first element
    
    std::cout << "First element: " << *ptr << std::endl;        // 10
    ptr++;  // Move to next integer (4 bytes forward)
    std::cout << "Second element: " << *ptr << std::endl;       // 20
    ptr += 2;  // Move forward 2 elements
    std::cout << "Fourth element: " << *ptr << std::endl;       // 40
    
    // Array indexing is pointer arithmetic!
    // arr[2] is same as *(arr + 2)
    std::cout << "arr[2] = " << arr[2] << std::endl;
    std::cout << "*(arr + 2) = " << *(arr + 2) << std::endl;  // Same!
    
    return 0;
}
```

---

## Part 7: Pointers to Pointers

Sometimes you need a pointer to a pointer (e.g., 2D dynamic arrays).

```cpp
#include <iostream>

int main() {
    // Create a 2D grid dynamically
    int rows = 5;
    int cols = 5;
    
    // Allocate array of pointers (rows)
    int** grid = new int*[rows];
    
    // Allocate each row (cols)
    for (int i = 0; i < rows; i++) {
        grid[i] = new int[cols];
    }
    
    // Use as normal 2D array
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            grid[i][j] = i * cols + j;
        }
    }
    
    // Print
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            std::cout << grid[i][j] << "\t";
        }
        std::cout << std::endl;
    }
    
    // Free memory (reverse order!)
    for (int i = 0; i < rows; i++) {
        delete[] grid[i];
    }
    delete[] grid;
    
    return 0;
}
```

---

## Part 8: Smart Pointers (Modern C++)

Raw pointers with `new`/`delete` are error-prone. **Smart pointers** automatically manage memory.

### `std::unique_ptr` — Exclusive ownership

```cpp
#include <iostream>
#include <memory>  // For smart pointers

struct Enemy {
    std::string name;
    int health;
    
    Enemy(const std::string& n, int h) : name(n), health(h) {
        std::cout << "Enemy " << name << " created" << std::endl;
    }
    ~Enemy() {
        std::cout << "Enemy " << name << " destroyed" << std::endl;
    }
};

int main() {
    // No manual delete needed!
    std::unique_ptr<Enemy> enemy1 = std::make_unique<Enemy>("Goblin", 30);
    std::unique_ptr<Enemy> enemy2 = std::make_unique<Enemy>("Orc", 80);
    
    // Use like normal pointer
    std::cout << enemy1->name << " has " << enemy1->health << " HP" << std::endl;
    
    // Transfer ownership (enemy1 becomes null)
    std::unique_ptr<Enemy> enemy3 = std::move(enemy1);
    
    if (enemy1 == nullptr) {
        std::cout << "enemy1 is now null" << std::endl;
    }
    
    // Automatically destroyed when out of scope
    
    return 0;
}
```

### `std::shared_ptr` — Shared ownership

```cpp
#include <iostream>
#include <memory>

int main() {
    std::shared_ptr<int> ptr1 = std::make_shared<int>(100);
    std::shared_ptr<int> ptr2 = ptr1;  // Both point to same int
    
    std::cout << "Value: " << *ptr1 << std::endl;
    std::cout << "Reference count: " << ptr1.use_count() << std::endl;  // 2
    
    ptr2.reset();  // Releases reference
    
    std::cout << "Reference count after reset: " << ptr1.use_count() << std::endl;  // 1
    
    // Memory freed when last shared_ptr goes out of scope
    
    return 0;
}
```

### Raw Pointers vs Smart Pointers

| Feature | Raw Pointer | `unique_ptr` | `shared_ptr` |
|---------|-------------|--------------|--------------|
| Manual delete | ✅ Required | ❌ Automatic | ❌ Automatic |
| Ownership | Unclear | Exclusive | Shared |
| Overhead | None | Very low | Low (reference count) |
| When to use | Observing, non-owning | Most cases | Shared resources |

---

## Complete Example: Dynamic Enemy System

```cpp
#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <cstdlib>
#include <ctime>

struct Enemy {
    std::string type;
    int health;
    int damage;
    
    Enemy(const std::string& t, int h, int d) 
        : type(t), health(h), damage(d) {
        std::cout << "Spawned: " << type << std::endl;
    }
    
    ~Enemy() {
        std::cout << "Defeated: " << type << std::endl;
    }
    
    void attack() {
        std::cout << type << " deals " << damage << " damage!" << std::endl;
    }
    
    void takeDamage(int amount) {
        health -= amount;
        std::cout << type << " takes " << amount << " damage (HP: " << health << ")" << std::endl;
    }
    
    bool isAlive() const {
        return health > 0;
    }
};

class EnemyWave {
private:
    std::vector<std::unique_ptr<Enemy>> enemies;
    int waveNumber;
    
public:
    EnemyWave(int wave) : waveNumber(wave) {
        int enemyCount = 3 + (wave % 5);
        std::cout << "\n=== WAVE " << wave << " - " << enemyCount << " enemies ===" << std::endl;
        
        for (int i = 0; i < enemyCount; i++) {
            // Random enemy type
            int type = rand() % 3;
            std::string name;
            int health, damage;
            
            switch (type) {
                case 0:
                    name = "Goblin";
                    health = 30 + wave * 5;
                    damage = 8 + wave;
                    break;
                case 1:
                    name = "Orc";
                    health = 50 + wave * 8;
                    damage = 12 + wave;
                    break;
                case 2:
                    name = "Troll";
                    health = 80 + wave * 10;
                    damage = 15 + wave;
                    break;
                default:
                    name = "Skeleton";
                    health = 35 + wave * 5;
                    damage = 10 + wave;
            }
            
            enemies.push_back(std::make_unique<Enemy>(name, health, damage));
        }
    }
    
    bool hasEnemies() const {
        return !enemies.empty();
    }
    
    void fightTurn() {
        // Remove dead enemies
        for (auto it = enemies.begin(); it != enemies.end(); ) {
            if (!(*it)->isAlive()) {
                it = enemies.erase(it);
            } else {
                ++it;
            }
        }
        
        if (enemies.empty()) {
            std::cout << "Wave cleared!" << std::endl;
            return;
        }
        
        // First enemy attacks
        enemies[0]->attack();
    }
    
    int getRemainingCount() const {
        return enemies.size();
    }
};

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    std::cout << "=== DYNAMIC ENEMY SYSTEM ===" << std::endl;
    
    int wave = 1;
    int playerHealth = 100;
    
    while (wave <= 3 && playerHealth > 0) {
        EnemyWave currentWave(wave);
        
        while (currentWave.hasEnemies() && playerHealth > 0) {
            std::cout << "\nEnemies remaining: " << currentWave.getRemainingCount() << std::endl;
            std::cout << "Player health: " << playerHealth << std::endl;
            
            // Player attacks first enemy
            int damage = 15 + rand() % 20;
            std::cout << "You attack for " << damage << " damage!" << std::endl;
            currentWave.fightTurn();  // Enemy attacks after
            
            // Simulate enemy damage (simplified)
            playerHealth -= 5 + rand() % 10;
        }
        
        if (playerHealth > 0) {
            std::cout << "\n*** WAVE " << wave << " COMPLETE! ***" << std::endl;
            wave++;
        }
    }
    
    if (playerHealth > 0) {
        std::cout << "\n✦ VICTORY! You defeated all waves! ✦" << std::endl;
    } else {
        std::cout << "\n✗ GAME OVER! You were defeated. ✗" << std::endl;
    }
    
    // All enemies automatically cleaned up by unique_ptr
    return 0;
}
```

---

## Common Mistakes

### 1. Using Memory After Delete

```cpp
int* ptr = new int(42);
delete ptr;
*ptr = 100;  // ❌ CRASH! Using deleted memory

// ✅ Set to nullptr after delete
delete ptr;
ptr = nullptr;
if (ptr != nullptr) {
    *ptr = 100;  // Safe
}
```

### 2. Forgetting to Delete (Memory Leak)

```cpp
// ❌ Memory leak — never deleted
void leakMemory() {
    int* data = new int[1000];
    // Function ends, data lost — can't delete!
}

// ✅ Always delete
void noLeak() {
    int* data = new int[1000];
    delete[] data;
}
```

### 3. Mismatched `new` and `delete`

```cpp
int* a = new int;      // Single
delete[] a;            // ❌ Wrong! Should be delete a

int* b = new int[10];  // Array
delete b;              // ❌ Wrong! Should be delete[] b
```

### 4. Dereferencing Null Pointer

```cpp
int* ptr = nullptr;
*ptr = 42;  // ❌ CRASH!

// ✅ Always check
if (ptr != nullptr) {
    *ptr = 42;
}
```

### 5. Returning Pointer to Local Variable

```cpp
// ❌ DANGEROUS! Local variable destroyed when function ends
int* badFunction() {
    int x = 42;
    return &x;  // Returns address of destroyed variable!
}

// ✅ Return dynamic memory or use parameter
int* goodFunction() {
    return new int(42);  // Caller must delete
}
```

---

## Quick Reference Card

```cpp
// Pointer declaration
int* ptr;                    // Pointer to int
int *ptr;                    // Same, different style
int* ptr1, ptr2;             // ptr1 is pointer, ptr2 is int

// Address and dereference
int x = 10;
int* p = &x;                 // p holds address of x
int y = *p;                  // y = 10
*p = 20;                     // x becomes 20

// Dynamic memory
int* p = new int;            // Single int
int* p = new int(42);        // Initialize to 42
int* arr = new int[100];     // Array of 100 ints

// Delete
delete p;                    // Single
delete[] arr;                // Array

// nullptr
int* p = nullptr;            // Points to nothing
if (p != nullptr) { }        // Check before use

// Arrow operator (->)
struct Point { int x, y; };
Point* p = new Point{10, 20};
p->x = 30;                   // Same as (*p).x = 30

// Smart pointers (C++11)
#include <memory>
std::unique_ptr<int> u = std::make_unique<int>(42);
std::shared_ptr<int> s = std::make_shared<int>(42);
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a function that swaps two integers using pointers (not references).

**Exercise 2 (Medium):** Create a dynamic array that can grow. Start with size 5, double the size when full. Implement `add`, `get`, `size` functions.

**Exercise 3 (Medium):** Implement a simple linked list node:
```cpp
struct Node {
    int data;
    Node* next;
};
```
Write functions to add to front, print list, and delete entire list.

**Exercise 4 (Hard):** Create a "Dynamic Inventory" system where items are stored in a dynamically allocated array. Support adding items (grow array), removing items (shrink or mark as empty), and displaying inventory.

**Exercise 5 (Hard):** Build a "Memory Pool" allocator. Pre-allocate a large block of memory and implement your own `allocate()` and `deallocate()` functions that manage this pool.

**Exercise 6 (Challenge):** Create a "Smart Pointer" from scratch (simplified). Implement a class template that manages dynamic memory with reference counting (like `shared_ptr`).

---

## Summary

You now know:

✅ What pointers are and how to use them  
✅ Address-of (`&`) and dereference (`*`) operators  
✅ Dynamic memory with `new` and `delete`  
✅ `nullptr` and null pointer safety  
✅ Pointer arithmetic for arrays  
✅ Smart pointers (`unique_ptr`, `shared_ptr`)  
✅ Complete enemy wave system using dynamic memory  

## What's Next?

Next lesson: **Strings (Advanced)** — string manipulation, searching, replacing, parsing, and building text systems for games!

---

## Resources

- [C++ Pointers (cppreference)](https://en.cppreference.com/w/cpp/language/pointer)
- [Smart pointers (learncpp)](https://www.learncpp.com/cpp-tutorial/introduction-to-smart-pointers-move-semantics/)

---

**Practice Task:** Create a "Save Game Manager" that stores saves in a dynamic array (vector would be easier, but use raw pointers!). Each save contains player name, level, gold, timestamp. Implement load, save, delete, and list functions with proper memory management.