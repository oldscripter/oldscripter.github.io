---
title: "Exception Handling — Graceful Error Management"
description: "Handle errors gracefully without crashing — file not found, invalid input, out of memory"
pubDate: 2026-05-13
tags: ["C++", "intermediate", "exceptions", "error-handling", "robust-code"]
lang: "en"
lessonNumber: 13
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 13: Exception Handling — Graceful Error Management

Welcome back! In real games, things go wrong — files are missing, network fails, memory runs out. **Exceptions** let us handle these errors gracefully without crashing or littering code with error checks.

## What You'll Learn

- What exceptions are and why they're better than error codes
- `try`/`catch` blocks
- Throwing exceptions (`throw`)
- Standard exception types
- Custom exceptions for game-specific errors
- Exception safety and best practices
- When NOT to use exceptions

---

## Part 1: The Problem with Error Codes

Before exceptions, C programmers used error codes:

```cpp
// ❌ Error code approach — messy!
int loadPlayer(const char* filename, Player* player) {
    FILE* file = fopen(filename, "r");
    if (!file) return -1;  // File not found
    
    if (fscanf(file, "%s", player->name) != 1) {
        fclose(file);
        return -2;  // Read error
    }
    
    if (fscanf(file, "%d", &player->health) != 1) {
        fclose(file);
        return -3;  // Invalid health
    }
    
    fclose(file);
    return 0;  // Success
}

// Every call needs error checking
int result = loadPlayer("save.txt", &player);
if (result == -1) {
    // Handle file error
} else if (result == -2) {
    // Handle read error
} else if (result == -3) {
    // Handle invalid data
}
```

**Problems:**
- Error checking clutters code
- Easy to forget checking
- Errors can be silently ignored
- Return value can't be used for something else

---

## Part 2: Basic Exception Handling

Exceptions provide a cleaner way:

```cpp
#include <iostream>
#include <string>
#include <fstream>

// ✅ Exception approach — clean!
void loadPlayer(const std::string& filename, Player& player) {
    std::ifstream file(filename);
    if (!file) {
        throw std::runtime_error("Cannot open file: " + filename);
    }
    
    if (!(file >> player.name >> player.health)) {
        throw std::runtime_error("Invalid save file format");
    }
    
    if (player.health < 0 || player.health > 100) {
        throw std::out_of_range("Health must be between 0 and 100");
    }
}

int main() {
    Player player;
    
    try {
        loadPlayer("save.txt", player);
        std::cout << "Loaded: " << player.name << " (HP: " << player.health << ")" << std::endl;
    }
    catch (const std::runtime_error& e) {
        std::cerr << "Runtime error: " << e.what() << std::endl;
        // Could create default save here
    }
    catch (const std::out_of_range& e) {
        std::cerr << "Data error: " << e.what() << std::endl;
    }
    catch (const std::exception& e) {
        std::cerr << "Unknown error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Part 3: Anatomy of Exception Handling

### The `throw` Statement

```cpp
#include <iostream>
#include <string>

int divide(int a, int b) {
    if (b == 0) {
        throw std::runtime_error("Division by zero!");  // Throw exception
    }
    return a / b;
}

int main() {
    try {
        int result = divide(10, 0);
        std::cout << "Result: " << result << std::endl;
    }
    catch (const std::runtime_error& e) {
        std::cout << "Caught: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Control Flow with Exceptions

```cpp
#include <iostream>
#include <string>

void functionC() {
    std::cout << "Function C starts" << std::endl;
    throw std::runtime_error("Error in C!");
    std::cout << "Function C ends (never reached)" << std::endl;
}

void functionB() {
    std::cout << "Function B starts" << std::endl;
    functionC();
    std::cout << "Function B ends (never reached)" << std::endl;
}

void functionA() {
    std::cout << "Function A starts" << std::endl;
    try {
        functionB();
    }
    catch (const std::runtime_error& e) {
        std::cout << "Caught in A: " << e.what() << std::endl;
    }
    std::cout << "Function A continues after catch" << std::endl;
}

int main() {
    std::cout << "Main starts" << std::endl;
    functionA();
    std::cout << "Main ends" << std::endl;
    return 0;
}
```

**Output:**
```
Main starts
Function A starts
Function B starts
Function C starts
Caught in A: Error in C!
Function A continues after catch
Main ends
```

---

## Part 4: Standard Exception Types

C++ provides a hierarchy of exception types:

```cpp
#include <iostream>
#include <exception>
#include <stdexcept>
#include <new>
#include <typeinfo>

int main() {
    try {
        // std::runtime_error — general runtime problems
        throw std::runtime_error("Something went wrong");
    }
    catch (const std::runtime_error& e) {
        std::cout << "Runtime error: " << e.what() << std::endl;
    }
    
    try {
        // std::out_of_range — index out of bounds
        std::vector<int> vec;
        vec.at(100);  // Throws std::out_of_range
    }
    catch (const std::out_of_range& e) {
        std::cout << "Out of range: " << e.what() << std::endl;
    }
    
    try {
        // std::invalid_argument — bad parameter
        int x = std::stoi("not a number");  // Throws std::invalid_argument
    }
    catch (const std::invalid_argument& e) {
        std::cout << "Invalid argument: " << e.what() << std::endl;
    }
    
    try {
        // std::bad_alloc — out of memory
        int* p = new int[1000000000000];  // May throw std::bad_alloc
    }
    catch (const std::bad_alloc& e) {
        std::cout << "Out of memory: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Exception Hierarchy

```
std::exception
├── std::logic_error
│   ├── std::invalid_argument
│   ├── std::domain_error
│   ├── std::length_error
│   ├── std::out_of_range
│   └── std::future_error
└── std::runtime_error
    ├── std::range_error
    ├── std::overflow_error
    ├── std::underflow_error
    └── std::system_error
```

---

## Part 5: Custom Exceptions

Create your own exception types for game-specific errors:

```cpp
#include <iostream>
#include <exception>
#include <string>

// Base game exception
class GameException : public std::exception {
private:
    std::string message;
    
public:
    explicit GameException(const std::string& msg) : message(msg) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
};

// Specific game exceptions
class SaveFileCorruptedException : public GameException {
public:
    explicit SaveFileCorruptedException(const std::string& file)
        : GameException("Save file corrupted: " + file) {}
};

class InventoryFullException : public GameException {
public:
    InventoryFullException() : GameException("Inventory is full! Cannot add item.") {}
};

class InvalidStatsException : public GameException {
public:
    InvalidStatsException(const std::string& stat, int value)
        : GameException("Invalid " + stat + " value: " + std::to_string(value)) {}
};

// Using custom exceptions
void addItemToInventory(Inventory& inv, const Item& item) {
    if (inv.isFull()) {
        throw InventoryFullException();
    }
    inv.add(item);
}

void loadSaveFile(const std::string& filename) {
    // Simulate corrupted save
    if (filename == "bad.sav") {
        throw SaveFileCorruptedException(filename);
    }
}

void createCharacter(const std::string& name, int health) {
    if (health < 1 || health > 999) {
        throw InvalidStatsException("health", health);
    }
    // Create character...
}

int main() {
    Inventory inventory(5);  // Max 5 items
    
    try {
        for (int i = 0; i < 10; i++) {
            addItemToInventory(inventory, Item{"Potion", 50});
        }
    }
    catch (const InventoryFullException& e) {
        std::cerr << "Inventory error: " << e.what() << std::endl;
    }
    
    try {
        loadSaveFile("bad.sav");
    }
    catch (const SaveFileCorruptedException& e) {
        std::cerr << "Save error: " << e.what() << std::endl;
        // Could try to load autosave or start new game
    }
    
    try {
        createCharacter("Kaelen", 1000);
    }
    catch (const InvalidStatsException& e) {
        std::cerr << "Creation error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Part 6: Rethrowing and Nested Exceptions

Sometimes you need to catch, log, and rethrow:

```cpp
#include <iostream>
#include <exception>
#include <fstream>

void criticalOperation() {
    throw std::runtime_error("Database connection failed");
}

void gameLogic() {
    try {
        criticalOperation();
    }
    catch (const std::exception& e) {
        // Log the error
        std::cerr << "[LOG] Error in gameLogic: " << e.what() << std::endl;
        
        // Add more context and rethrow
        throw std::runtime_error(std::string("Game logic failed: ") + e.what());
    }
}

int main() {
    try {
        gameLogic();
    }
    catch (const std::exception& e) {
        std::cerr << "Fatal: " << e.what() << std::endl;
        // Show error message to player
        // Attempt safe shutdown
    }
    
    return 0;
}
```

---

## Part 7: Exception Safety Guarantees

Functions should provide one of three exception safety levels:

### 1. Basic Guarantee — No leaks, valid state

```cpp
class Player {
private:
    std::string name;
    int* achievements;
    int achievementCount;
    
public:
    // Basic guarantee: if exception thrown, no memory leak
    void addAchievement(const std::string& achievement) {
        int* newArray = new int[achievementCount + 1];
        
        try {
            // Copy existing (might throw)
            for (int i = 0; i < achievementCount; i++) {
                newArray[i] = achievements[i];
            }
            // Add new (might throw)
            newArray[achievementCount] = encodeAchievement(achievement);
        }
        catch (...) {
            delete[] newArray;
            throw;  // Rethrow, but memory cleaned up
        }
        
        // Only now modify state
        delete[] achievements;
        achievements = newArray;
        achievementCount++;
    }
};
```

### 2. Strong Guarantee — Transaction-like (all or nothing)

```cpp
class BankAccount {
    int balance;
    
public:
    // Strong guarantee: either succeeds fully or changes nothing
    void transfer(BankAccount& target, int amount) {
        // Check if possible
        if (amount > balance) {
            throw std::runtime_error("Insufficient funds");
        }
        
        // Create temporary copies for rollback
        int tempBalance = balance - amount;
        int tempTargetBalance = target.balance + amount;
        
        // Commit (no-throw operations)
        balance = tempBalance;
        target.balance = tempTargetBalance;
    }
};
```

### 3. No-throw Guarantee — Never throws

```cpp
class SimpleVector {
    int* data;
    int size;
    
public:
    // No-throw guarantee
    int getSize() const noexcept {
        return size;
    }
    
    // No-throw guarantee
    void swap(SimpleVector& other) noexcept {
        std::swap(data, other.data);
        std::swap(size, other.size);
    }
};
```

---

## Complete Example: Robust Game Save System

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include <ctime>

// Custom exceptions
class SaveException : public std::exception {
protected:
    std::string message;
public:
    explicit SaveException(const std::string& msg) : message(msg) {}
    const char* what() const noexcept override { return message.c_str(); }
};

class FileOpenException : public SaveException {
public:
    explicit FileOpenException(const std::string& filename)
        : SaveException("Cannot open file: " + filename) {}
};

class CorruptSaveException : public SaveException {
public:
    explicit CorruptSaveException(const std::string& details)
        : SaveException("Save file corrupted: " + details) {}
};

class WriteProtectionException : public SaveException {
public:
    explicit WriteProtectionException(const std::string& filename)
        : SaveException("Cannot write to protected file: " + filename) {}
};

// Game data structures
struct GameStats {
    int level;
    int health;
    int gold;
    float playTime;
    
    void save(std::ofstream& file) const {
        file << level << '\n' << health << '\n' << gold << '\n' << playTime << '\n';
    }
    
    void load(std::ifstream& file) {
        file >> level >> health >> gold >> playTime;
        if (file.fail()) {
            throw CorruptSaveException("Invalid stats format");
        }
    }
};

struct InventoryItem {
    std::string name;
    int quantity;
    
    void save(std::ofstream& file) const {
        file << name << '\n' << quantity << '\n';
    }
    
    void load(std::ifstream& file) {
        std::getline(file, name);
        file >> quantity;
        file.ignore();
        if (file.fail()) {
            throw CorruptSaveException("Invalid item format");
        }
    }
};

struct SaveData {
    std::string playerName;
    std::time_t timestamp;
    GameStats stats;
    std::vector<InventoryItem> inventory;
    
    void save(const std::string& filename) const {
        std::ofstream file(filename);
        if (!file) {
            throw FileOpenException(filename);
        }
        
        try {
            // Write header
            file << "=== SAVED GAME ===\n";
            file << playerName << '\n';
            file << timestamp << '\n';
            
            // Write stats
            stats.save(file);
            
            // Write inventory
            file << inventory.size() << '\n';
            for (const auto& item : inventory) {
                item.save(file);
            }
            
            file << "=== END ===\n";
            
            if (!file) {
                throw WriteProtectionException(filename);
            }
        }
        catch (const std::exception& e) {
            throw SaveException(std::string("Save failed: ") + e.what());
        }
    }
    
    void load(const std::string& filename) {
        std::ifstream file(filename);
        if (!file) {
            throw FileOpenException(filename);
        }
        
        std::string line;
        
        try {
            // Read header
            std::getline(file, line);
            if (line != "=== SAVED GAME ===") {
                throw CorruptSaveException("Invalid file header");
            }
            
            // Read player data
            std::getline(file, playerName);
            file >> timestamp;
            file.ignore();
            
            // Read stats
            stats.load(file);
            
            // Read inventory
            int inventorySize;
            file >> inventorySize;
            file.ignore();
            
            inventory.clear();
            for (int i = 0; i < inventorySize; i++) {
                InventoryItem item;
                item.load(file);
                inventory.push_back(item);
            }
            
            // Read footer
            std::getline(file, line);
            if (line != "=== END ===") {
                throw CorruptSaveException("Missing end marker");
            }
        }
        catch (const CorruptSaveException&) {
            throw;
        }
        catch (const std::exception& e) {
            throw CorruptSaveException(std::string("Parse error: ") + e.what());
        }
    }
    
    void display() const {
        std::cout << "\n=== SAVED GAME ===" << std::endl;
        std::cout << "Player: " << playerName << std::endl;
        std::cout << "Saved: " << std::ctime(&timestamp);
        std::cout << "Level: " << stats.level << std::endl;
        std::cout << "Health: " << stats.health << std::endl;
        std::cout << "Gold: " << stats.gold << std::endl;
        std::cout << "Playtime: " << stats.playTime << " hours" << std::endl;
        
        std::cout << "\nInventory:" << std::endl;
        for (const auto& item : inventory) {
            std::cout << "  - " << item.name << " x" << item.quantity << std::endl;
        }
    }
};

// Save manager with retry logic
class SaveManager {
private:
    static constexpr int MAX_RETRIES = 3;
    
public:
    static void saveWithRetry(const SaveData& data, const std::string& filename) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                data.save(filename);
                std::cout << "✓ Game saved successfully!" << std::endl;
                return;
            }
            catch (const FileOpenException& e) {
                std::cerr << "Attempt " << attempt << " failed: " << e.what() << std::endl;
                if (attempt == MAX_RETRIES) throw;
                // Could try different filename or directory
            }
            catch (const WriteProtectionException& e) {
                std::cerr << "Attempt " << attempt << " failed: " << e.what() << std::endl;
                if (attempt == MAX_RETRIES) throw;
            }
        }
    }
    
    static SaveData loadWithBackup(const std::string& filename) {
        std::string backupFile = filename + ".backup";
        
        try {
            SaveData data;
            data.load(filename);
            return data;
        }
        catch (const CorruptSaveException& e) {
            std::cerr << "Main save corrupted: " << e.what() << std::endl;
            
            // Try backup
            try {
                SaveData backup;
                backup.load(backupFile);
                std::cout << "✓ Loaded from backup instead!" << std::endl;
                return backup;
            }
            catch (const std::exception& e2) {
                throw SaveException("Both save and backup are corrupted");
            }
        }
    }
};

int main() {
    // Create test data
    SaveData gameData;
    gameData.playerName = "Kaelen";
    gameData.timestamp = std::time(nullptr);
    gameData.stats = {5, 85, 1250, 12.5f};
    gameData.inventory = {
        {"Iron Sword", 1},
        {"Health Potion", 5},
        {"Mana Potion", 3},
        {"Leather Armor", 1}
    };
    
    // Save game with retry
    std::cout << "=== SAVING GAME ===" << std::endl;
    try {
        SaveManager::saveWithRetry(gameData, "savegame.dat");
        
        // Create backup
        SaveManager::saveWithRetry(gameData, "savegame.dat.backup");
    }
    catch (const SaveException& e) {
        std::cerr << "Fatal save error: " << e.what() << std::endl;
        return 1;
    }
    
    // Load game with fallback
    std::cout << "\n=== LOADING GAME ===" << std::endl;
    try {
        SaveData loaded = SaveManager::loadWithBackup("savegame.dat");
        loaded.display();
    }
    catch (const SaveException& e) {
        std::cerr << "Fatal load error: " << e.what() << std::endl;
        std::cout << "Starting new game instead..." << std::endl;
    }
    
    return 0;
}
```

---

## Common Mistakes

### 1. Catching by Value (Object Slicing)

```cpp
try {
    throw std::runtime_error("Error");
}
catch (std::exception e) {  // ❌ Slices the exception!
    // e is just std::exception, lost runtime_error info
}

// ✅ Catch by const reference
catch (const std::exception& e) {
    std::cout << e.what() << std::endl;
}
```

### 2. Throwing in Destructors

```cpp
class BadClass {
public:
    ~BadClass() {
        throw std::runtime_error("Error");  // ❌ NEVER throw in destructor!
    }
};

// If exception thrown during stack unwinding (another exception active),
// std::terminate is called immediately — program crashes!
```

### 3. Ignoring Exceptions

```cpp
try {
    dangerousOperation();
}
catch (...) {
    // ❌ Empty catch swallows all errors silently
}

// ✅ At least log something
catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << std::endl;
}
```

### 4. Using Exceptions for Normal Flow Control

```cpp
// ❌ Bad — exceptions are for exceptional cases
try {
    int result = divide(a, b);
}
catch (const DivisionByZero& e) {
    // Handle division by zero
}

// ✅ Better — check before
if (b != 0) {
    int result = divide(a, b);
} else {
    // Handle zero case
}
```

---

## Quick Reference Card

```cpp
#include <exception>
#include <stdexcept>

// Throwing
throw std::runtime_error("Error message");
throw std::invalid_argument("Bad value");
throw std::out_of_range("Index too large");

// Catching
try {
    // Risky code
}
catch (const std::runtime_error& e) {
    std::cerr << e.what() << std::endl;
}
catch (const std::exception& e) {
    // Catch any std::exception
}
catch (...) {
    // Catch anything (use sparingly)
}

// Custom exception
class MyException : public std::exception {
    const char* what() const noexcept override {
        return "My error";
    }
};

// No-throw guarantee (function never throws)
void safeFunction() noexcept {
    // Only code that won't throw
}

// Rethrow
try {
    // code
}
catch (...) {
    // Log or cleanup
    throw;  // Rethrow original exception
}
```

---

## When to Use Exceptions

### ✅ Good Use Cases

```cpp
// Constructor failure
Player::Player(const std::string& name) {
    if (name.empty()) {
        throw std::invalid_argument("Player name cannot be empty");
    }
}

// File operations
void loadFile(const std::string& path) {
    std::ifstream file(path);
    if (!file) {
        throw std::runtime_error("Cannot open: " + path);
    }
}

// Out of bounds access (container)
T& at(size_t index) {
    if (index >= size) {
        throw std::out_of_range("Index out of bounds");
    }
    return data[index];
}
```

### ❌ Bad Use Cases

```cpp
// Don't use for regular control flow
if (player.hasItem("key")) {
    // Use door
}

// Not for expected cases (end of file)
while (true) {
    try {
        int value = readInt();
        // process
    }
    catch (EOFException&) {
        break;
    }
}

// Not for performance-critical code (exceptions are slow)
for (int i = 0; i < 1000000; i++) {
    try {
        process(i);
    }
    catch (...) { }
}
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a function `int safeDivide(int a, int b)` that throws `std::runtime_error` when b is zero. Test with try/catch.

**Exercise 2 (Medium):** Create a `BankAccount` class with `withdraw` method. Throw `InsufficientFundsException` (custom) if balance is insufficient.

**Exercise 3 (Medium):** Write a function that reads a number from user input. Throw `InvalidInputException` if input is not a valid number. Keep asking until valid.

**Exercise 4 (Hard):** Implement a `ResourceManager` class that loads textures/sounds. Use RAII with exceptions — if one resource fails to load, clean up already loaded ones and rethrow.

**Exercise 5 (Hard):** Create a `parseConfig` function that reads a configuration file. Handle missing files, malformed lines, invalid values with specific exceptions. Provide useful error messages with line numbers.

**Exercise 6 (Challenge):** Build a "Transaction System" that supports rollback on exception. If any step of a multi-step operation (buy item, remove gold, add to inventory, update quest) fails, revert all previous changes.

---

## Summary

You now know:

✅ What exceptions are and why they beat error codes  
✅ `try`/`catch`/`throw` syntax  
✅ Standard exception hierarchy  
✅ Creating custom exceptions for games  
✅ Exception safety levels (basic, strong, no-throw)  
✅ Complete robust save system with retry and backup  
✅ When to use (and not use) exceptions  

## What's Next?

Next lesson: **Templates** — write code once, use with any type! Create generic containers and algorithms.

---

## Resources

- [C++ Exceptions (cppreference)](https://en.cppreference.com/w/cpp/error/exception)
- [Standard exception types](https://en.cppreference.com/w/cpp/error/exception#Standard_exception_types)
- [Exception safety](https://en.cppreference.com/w/cpp/language/exceptions)

---

**Practice Task:** Build a "Mod Manager" for a game. Load mods from DLL files. Handle exceptions when mods fail to load (missing dependencies, incompatible versions). Ensure if one mod fails, others still load and game continues. Log all errors to a file for debugging.