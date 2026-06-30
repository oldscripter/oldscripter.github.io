---
title: "File I/O — Saving and Loading Games"
description: "Persist data, save player progress, load configurations, and write logs"
pubDate: 2026-06-01
tags: ["C++", "beginner", "file-io", "fstream", "serialization"]
lang: "en"
lessonNumber: 10
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 10: File I/O — Saving and Loading Games

Welcome back! So far, all our data disappears when the program ends. **File I/O** lets us save data permanently — player progress, high scores, game settings, and save files.

## What You'll Learn

- **`fstream`** — file streams (read and write)
- **`ifstream`** — input file stream (read from files)
- **`ofstream`** — output file stream (write to files)
- Reading and writing different data types
- Saving and loading game states
- Binary vs text files
- Error handling with files

---

## Part 1: Why File I/O?

Without file I/O, players lose everything when they close your game. With file I/O:

```cpp
// ❌ No file I/O — progress lost forever
int main() {
    int level = 5;
    int gold = 1000;
    // Game closes — level and gold vanish!
}

// ✅ With file I/O — progress saved!
int main() {
    // Load previous save
    int level = loadLevel();
    int gold = loadGold();
    
    // Play game...
    
    // Save progress
    saveGame(level, gold);
    // Player can continue later!
}
```

---

## Part 2: Writing to Files (`ofstream`)

```cpp
#include <iostream>
#include <fstream>  // Required for file I/O
#include <string>

int main() {
    // Create output file stream
    std::ofstream outFile("savegame.txt");
    
    // Check if file opened successfully
    if (!outFile) {
        std::cerr << "Error: Could not create file!" << std::endl;
        return 1;
    }
    
    // Write to file (same as std::cout)
    outFile << "Player: Kaelen" << std::endl;
    outFile << "Level: 5" << std::endl;
    outFile << "Health: 100" << std::endl;
    outFile << "Gold: 500" << std::endl;
    
    // Close file (automatically closes when outFile goes out of scope)
    outFile.close();
    
    std::cout << "Game saved successfully!" << std::endl;
    
    return 0;
}
```

**File `savegame.txt` after running:**
```
Player: Kaelen
Level: 5
Health: 100
Gold: 500
```

### Appending to Files (Add, Don't Overwrite)

```cpp
#include <fstream>

int main() {
    // Open in append mode
    std::ofstream logFile("game_log.txt", std::ios::app);
    
    if (logFile.is_open()) {
        logFile << "Player started game at " << time(nullptr) << std::endl;
        logFile << "Defeated Goblin" << std::endl;
        logFile << "Found treasure chest" << std::endl;
        logFile.close();
    }
    
    return 0;
}
```

---

## Part 3: Reading from Files (`ifstream`)

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream inFile("savegame.txt");
    
    if (!inFile) {
        std::cerr << "Error: Could not open save file!" << std::endl;
        return 1;
    }
    
    std::string line;
    int lineNumber = 0;
    
    // Read line by line
    while (std::getline(inFile, line)) {
        lineNumber++;
        std::cout << lineNumber << ": " << line << std::endl;
    }
    
    inFile.close();
    
    return 0;
}
```

### Reading Specific Data Types

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream inFile("savegame.txt");
    
    if (!inFile) {
        std::cerr << "Error opening file!" << std::endl;
        return 1;
    }
    
    std::string label;
    std::string playerName;
    int level;
    int health;
    int gold;
    
    // Read formatted data
    inFile >> label >> playerName;  // Reads "Player:" and "Kaelen"
    inFile >> label >> level;        // Reads "Level:" and 5
    inFile >> label >> health;       // Reads "Health:" and 100
    inFile >> label >> gold;         // Reads "Gold:" and 500
    
    std::cout << "Loaded: " << playerName << std::endl;
    std::cout << "Level: " << level << std::endl;
    std::cout << "Health: " << health << std::endl;
    std::cout << "Gold: " << gold << std::endl;
    
    inFile.close();
    
    return 0;
}
```

---

## Part 4: Saving and Loading Structs

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

struct Player {
    std::string name;
    int level;
    int health;
    int mana;
    int gold;
    std::vector<std::string> inventory;
};

// Save player to file
bool savePlayer(const Player& p, const std::string& filename) {
    std::ofstream outFile(filename);
    
    if (!outFile) {
        return false;
    }
    
    // Write player data
    outFile << p.name << std::endl;
    outFile << p.level << std::endl;
    outFile << p.health << std::endl;
    outFile << p.mana << std::endl;
    outFile << p.gold << std::endl;
    
    // Write inventory size and items
    outFile << p.inventory.size() << std::endl;
    for (const auto& item : p.inventory) {
        outFile << item << std::endl;
    }
    
    outFile.close();
    return true;
}

// Load player from file
bool loadPlayer(Player& p, const std::string& filename) {
    std::ifstream inFile(filename);
    
    if (!inFile) {
        return false;
    }
    
    // Read player data
    std::getline(inFile, p.name);
    inFile >> p.level;
    inFile >> p.health;
    inFile >> p.mana;
    inFile >> p.gold;
    
    // Read inventory
    int inventorySize;
    inFile >> inventorySize;
    inFile.ignore();  // Consume newline
    
    p.inventory.clear();
    for (int i = 0; i < inventorySize; i++) {
        std::string item;
        std::getline(inFile, item);
        p.inventory.push_back(item);
    }
    
    inFile.close();
    return true;
}

int main() {
    // Create a player
    Player hero;
    hero.name = "Kaelen";
    hero.level = 5;
    hero.health = 100;
    hero.mana = 50;
    hero.gold = 500;
    hero.inventory = {"Sword", "Shield", "Health Potion"};
    
    // Save the player
    if (savePlayer(hero, "player.sav")) {
        std::cout << "Game saved!" << std::endl;
    } else {
        std::cerr << "Failed to save!" << std::endl;
        return 1;
    }
    
    // Load the player into a new variable
    Player loadedHero;
    if (loadPlayer(loadedHero, "player.sav")) {
        std::cout << "\n=== LOADED CHARACTER ===" << std::endl;
        std::cout << "Name: " << loadedHero.name << std::endl;
        std::cout << "Level: " << loadedHero.level << std::endl;
        std::cout << "Health: " << loadedHero.health << std::endl;
        std::cout << "Mana: " << loadedHero.mana << std::endl;
        std::cout << "Gold: " << loadedHero.gold << std::endl;
        std::cout << "Inventory: ";
        for (const auto& item : loadedHero.inventory) {
            std::cout << item << " ";
        }
        std::cout << std::endl;
    } else {
        std::cerr << "Failed to load!" << std::endl;
    }
    
    return 0;
}
```

---

## Part 5: Binary Files (More Efficient)

Text files are human-readable but take more space. Binary files are smaller and faster but not human-readable.

```cpp
#include <iostream>
#include <fstream>
#include <string>

struct GameData {
    int level;
    int health;
    int gold;
    float positionX;
    float positionY;
    char name[50];  // Fixed-size for binary I/O
};

void saveBinary(const GameData& data, const std::string& filename) {
    std::ofstream outFile(filename, std::ios::binary);
    
    if (!outFile) {
        std::cerr << "Error creating binary file!" << std::endl;
        return;
    }
    
    // Write raw memory to file
    outFile.write(reinterpret_cast<const char*>(&data), sizeof(GameData));
    outFile.close();
    
    std::cout << "Binary save complete!" << std::endl;
}

bool loadBinary(GameData& data, const std::string& filename) {
    std::ifstream inFile(filename, std::ios::binary);
    
    if (!inFile) {
        return false;
    }
    
    // Read raw memory from file
    inFile.read(reinterpret_cast<char*>(&data), sizeof(GameData));
    inFile.close();
    
    return true;
}

int main() {
    GameData save;
    save.level = 7;
    save.health = 85;
    save.gold = 1250;
    save.positionX = 150.5f;
    save.positionY = 320.0f;
    std::strcpy(save.name, "Kaelen");
    
    saveBinary(save, "game.bin");
    
    GameData loaded;
    if (loadBinary(loaded, "game.bin")) {
        std::cout << "Binary loaded:" << std::endl;
        std::cout << "Name: " << loaded.name << std::endl;
        std::cout << "Level: " << loaded.level << std::endl;
        std::cout << "Health: " << loaded.health << std::endl;
        std::cout << "Gold: " << loaded.gold << std::endl;
        std::cout << "Position: (" << loaded.positionX << ", " << loaded.positionY << ")" << std::endl;
    }
    
    return 0;
}
```

### Text vs Binary — Which to Use?

| Feature | Text Files | Binary Files |
|---------|-----------|--------------|
| Human-readable | ✅ Yes | ❌ No |
| File size | Larger | Smaller |
| Speed | Slower | Faster |
| Cross-platform | ✅ Yes | ⚠️ Careful with endianness |
| Easy to edit | ✅ Yes | ❌ No |
| Use when | Save files, configs, logs | High scores, large data, network |

---

## Part 6: File Modes and Flags

```cpp
#include <fstream>

std::ofstream outFile;

// Default mode (ios::out) — overwrites
outFile.open("file.txt");

// Append mode — adds to end
outFile.open("log.txt", std::ios::app);

// Binary mode — no newline conversion
outFile.open("data.bin", std::ios::binary);

// Truncate (clear file before writing)
outFile.open("save.txt", std::ios::trunc);

// Combined modes
outFile.open("settings.cfg", std::ios::out | std::ios::app);
```

### Common File Mode Flags

| Flag | Meaning |
|------|---------|
| `std::ios::in` | Open for reading |
| `std::ios::out` | Open for writing |
| `std::ios::app` | Append to end |
| `std::ios::binary` | Binary mode |
| `std::ios::trunc` | Delete contents |
| `std::ios::ate` | Start at end |

---

## Part 7: Error Handling with Files

```cpp
#include <iostream>
#include <fstream>

int main() {
    std::ifstream inFile("missing.txt");
    
    // Check if file opened
    if (!inFile) {
        std::cerr << "Error: File does not exist or cannot be opened!" << std::endl;
        return 1;
    }
    
    // Check stream state
    if (inFile.bad()) {
        std::cerr << "Critical stream error!" << std::endl;
        return 1;
    }
    
    // Check if eof (end of file) reached
    int value;
    inFile >> value;
    if (inFile.eof()) {
        std::cout << "Reached end of file" << std::endl;
    }
    
    // Clear error flags if needed
    inFile.clear();
    
    return 0;
}
```

---

## Complete Example: RPG Save System

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>

// Structures
struct Stats {
    int strength;
    int dexterity;
    int intelligence;
};

struct InventoryItem {
    std::string name;
    int quantity;
};

struct Player {
    std::string name;
    int level;
    int experience;
    int health;
    int maxHealth;
    int mana;
    int maxMana;
    int gold;
    Stats stats;
    std::vector<InventoryItem> inventory;
};

// Save functions
bool saveGame(const Player& player, const std::string& slot) {
    std::string filename = "save_" + slot + ".sav";
    std::ofstream outFile(filename);
    
    if (!outFile) {
        return false;
    }
    
    // Basic info
    outFile << "=== SAVED GAME ===" << std::endl;
    outFile << player.name << std::endl;
    outFile << player.level << std::endl;
    outFile << player.experience << std::endl;
    outFile << player.health << std::endl;
    outFile << player.maxHealth << std::endl;
    outFile << player.mana << std::endl;
    outFile << player.maxMana << std::endl;
    outFile << player.gold << std::endl;
    
    // Stats
    outFile << player.stats.strength << std::endl;
    outFile << player.stats.dexterity << std::endl;
    outFile << player.stats.intelligence << std::endl;
    
    // Inventory
    outFile << player.inventory.size() << std::endl;
    for (const auto& item : player.inventory) {
        outFile << item.name << std::endl;
        outFile << item.quantity << std::endl;
    }
    
    outFile << "=== END ===" << std::endl;
    outFile.close();
    
    return true;
}

bool loadGame(Player& player, const std::string& slot) {
    std::string filename = "save_" + slot + ".sav";
    std::ifstream inFile(filename);
    
    if (!inFile) {
        return false;
    }
    
    std::string line;
    std::getline(inFile, line);  // Skip header
    
    // Basic info
    std::getline(inFile, player.name);
    inFile >> player.level;
    inFile >> player.experience;
    inFile >> player.health;
    inFile >> player.maxHealth;
    inFile >> player.mana;
    inFile >> player.maxMana;
    inFile >> player.gold;
    
    // Stats
    inFile >> player.stats.strength;
    inFile >> player.stats.dexterity;
    inFile >> player.stats.intelligence;
    
    // Inventory
    int inventorySize;
    inFile >> inventorySize;
    inFile.ignore();  // Consume newline
    
    player.inventory.clear();
    for (int i = 0; i < inventorySize; i++) {
        InventoryItem item;
        std::getline(inFile, item.name);
        inFile >> item.quantity;
        inFile.ignore();
        player.inventory.push_back(item);
    }
    
    std::getline(inFile, line);  // Skip footer
    inFile.close();
    
    return true;
}

// Display functions
void displayStats(const Player& player) {
    std::cout << "\n=== " << player.name << " ===" << std::endl;
    std::cout << "Level: " << player.level << " (XP: " << player.experience << ")" << std::endl;
    std::cout << "Health: " << player.health << "/" << player.maxHealth << std::endl;
    std::cout << "Mana: " << player.mana << "/" << player.maxMana << std::endl;
    std::cout << "Gold: " << player.gold << std::endl;
    std::cout << "Stats: STR " << player.stats.strength 
              << " | DEX " << player.stats.dexterity 
              << " | INT " << player.stats.intelligence << std::endl;
    
    if (!player.inventory.empty()) {
        std::cout << "\nInventory:" << std::endl;
        for (const auto& item : player.inventory) {
            std::cout << "  - " << item.name << " x" << item.quantity << std::endl;
        }
    }
}

// Demo functions
void createNewGame(Player& player) {
    std::cin.ignore();
    std::cout << "Enter your name: ";
    std::getline(std::cin, player.name);
    
    player.level = 1;
    player.experience = 0;
    player.health = 100;
    player.maxHealth = 100;
    player.mana = 50;
    player.maxMana = 50;
    player.gold = 100;
    player.stats = {10, 10, 10};
    player.inventory = {{"Health Potion", 3}, {"Mana Potion", 2}};
    
    std::cout << "\nWelcome, " << player.name << "! Your adventure begins!" << std::endl;
}

void playGame(Player& player) {
    std::cout << "\n=== PLAYING ===" << std::endl;
    std::cout << "You explore the dungeon..." << std::endl;
    
    // Simulate some gameplay
    player.experience += 50;
    player.gold += 75;
    
    std::cout << "Gained 50 XP and 75 gold!" << std::endl;
    
    // Level up?
    if (player.experience >= 100) {
        player.level++;
        player.experience -= 100;
        player.maxHealth += 20;
        player.health = player.maxHealth;
        player.maxMana += 10;
        player.mana = player.maxMana;
        player.stats.strength += 2;
        player.stats.dexterity += 2;
        player.stats.intelligence += 2;
        
        std::cout << "*** LEVEL UP! You are now level " << player.level << "! ***" << std::endl;
    }
    
    // Find an item
    player.inventory.push_back({"Iron Sword", 1});
    std::cout << "Found: Iron Sword!" << std::endl;
}

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    Player player;
    bool running = true;
    
    while (running) {
        std::cout << "\n=== SAVE SYSTEM DEMO ===" << std::endl;
        std::cout << "1. New Game" << std::endl;
        std::cout << "2. Load Game (Slot 1)" << std::endl;
        std::cout << "3. Load Game (Slot 2)" << std::endl;
        std::cout << "4. Play" << std::endl;
        std::cout << "5. Save Game (Slot 1)" << std::endl;
        std::cout << "6. Save Game (Slot 2)" << std::endl;
        std::cout << "7. Display Current Stats" << std::endl;
        std::cout << "8. Quit" << std::endl;
        std::cout << "Choice: ";
        
        int choice;
        std::cin >> choice;
        
        switch (choice) {
            case 1:
                createNewGame(player);
                break;
            case 2:
                if (loadGame(player, "1")) {
                    std::cout << "Game loaded from Slot 1!" << std::endl;
                    displayStats(player);
                } else {
                    std::cout << "No save file in Slot 1!" << std::endl;
                }
                break;
            case 3:
                if (loadGame(player, "2")) {
                    std::cout << "Game loaded from Slot 2!" << std::endl;
                    displayStats(player);
                } else {
                    std::cout << "No save file in Slot 2!" << std::endl;
                }
                break;
            case 4:
                if (player.name.empty()) {
                    std::cout << "Create or load a character first!" << std::endl;
                } else {
                    playGame(player);
                }
                break;
            case 5:
                if (saveGame(player, "1")) {
                    std::cout << "Game saved to Slot 1!" << std::endl;
                } else {
                    std::cout << "Failed to save!" << std::endl;
                }
                break;
            case 6:
                if (saveGame(player, "2")) {
                    std::cout << "Game saved to Slot 2!" << std::endl;
                } else {
                    std::cout << "Failed to save!" << std::endl;
                }
                break;
            case 7:
                if (player.name.empty()) {
                    std::cout << "No character created!" << std::endl;
                } else {
                    displayStats(player);
                }
                break;
            case 8:
                running = false;
                std::cout << "Goodbye!" << std::endl;
                break;
            default:
                std::cout << "Invalid choice!" << std::endl;
        }
    }
    
    return 0;
}
```

---

## Common Mistakes

### 1. Forgetting to Close Files

```cpp
// ❌ File may not be fully written
std::ofstream outFile("data.txt");
outFile << "Hello";
// Program ends — buffer may not flush

// ✅ Always close or let destructor handle it
std::ofstream outFile("data.txt");
outFile << "Hello";
outFile.close();  // Or outFile goes out of scope
```

### 2. Not Checking If File Opened

```cpp
// ❌ May crash or read garbage
std::ifstream inFile("missing.txt");
int value;
inFile >> value;  // Fails silently

// ✅ Always check
if (!inFile) {
    std::cerr << "Error opening file!" << std::endl;
    return 1;
}
```

### 3. Using `>>` Then `getline`

```cpp
// ❌ Doesn't work as expected
int level;
std::string name;
inFile >> level;
std::getline(inFile, name);  // Reads leftover newline!

// ✅ Fix with ignore
inFile >> level;
inFile.ignore();  // Discard newline
std::getline(inFile, name);
```

### 4. Platform-Specific Paths

```cpp
// ❌ Windows only
outFile.open("data\\save.txt");

// ❌ Linux/Mac only
outFile.open("data/save.txt");

// ✅ Portable approach
#include <filesystem>
std::filesystem::path path = "data" / std::filesystem::path("save.txt");
```

---

## Quick Reference Card

```cpp
#include <fstream>

// Write to file
std::ofstream outFile("filename.txt");
outFile << "Text" << std::endl;
outFile.close();

// Read from file
std::ifstream inFile("filename.txt");
std::string line;
std::getline(inFile, line);
inFile >> variable;
inFile.close();

// Append mode
std::ofstream outFile("log.txt", std::ios::app);

// Binary mode
std::ofstream outFile("data.bin", std::ios::binary);
outFile.write(reinterpret_cast<char*>(&data), sizeof(data));

// Check if open
if (inFile.is_open()) { }
if (!outFile) { }  // Works too

// File state
inFile.good()  // Everything okay
inFile.eof()   // End of file reached
inFile.fail()  // Non-fatal error
inFile.bad()   // Fatal error

// Clear errors
inFile.clear();
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a program that saves a list of high scores to a file. Then load and display them sorted.

**Exercise 2 (Easy):** Create a "Configuration Manager" that saves/loads game settings (volume, resolution, difficulty) to/from a config file.

**Exercise 3 (Medium):** Build a "Journal/Diary" system. Each entry has a date, title, and content. Save all entries to a file, load them back, and display by date.

**Exercise 4 (Medium):** Create a "CSV Exporter" for character stats. Save player data in CSV format, then import into a spreadsheet program.

**Exercise 5 (Hard):** Implement a "Save Game Manager" that supports:
- Multiple save slots (3-5)
- Auto-save every X minutes
- Save metadata (timestamp, playtime, location)
- Load screen showing preview of each save

**Exercise 6 (Challenge):** Create a "Binary Asset Packer" that takes multiple text files (dialog, stats, items) and packs them into a single binary file for faster loading in games.

---

## Summary

You now know:

✅ **`ofstream`** — writing to files  
✅ **`ifstream`** — reading from files  
✅ Text vs binary files (pros and cons)  
✅ File modes and flags  
✅ Error handling with files  
✅ Complete RPG save/load system  
✅ Struct serialization patterns  

## What's Next?

Next lesson: **Pointers and Dynamic Memory** — manage memory directly, create flexible data structures, and understand how games really work!

---

## Resources

- [C++ File I/O (cppreference)](https://en.cppreference.com/w/cpp/io/basic_fstream)
- [std::fstream documentation](https://en.cppreference.com/w/cpp/io/basic_fstream)

---

**Practice Task:** Create a "Game Save Editor" that can load save files, display all values, allow the user to modify them (health, gold, etc.), and save back. This is how many game trainers and save editors work!