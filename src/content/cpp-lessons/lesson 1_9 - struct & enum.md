---
title: "Structs and Enums — Creating Custom Types"
description: "Organize related data and represent game states with custom types"
pubDate: 2026-06-01
tags: ["C++", "beginner", "structs", "enums", "custom-types"]
lessonNumber: 9
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 9: Structs and Enums — Creating Custom Types

Welcome back! So far, we've used basic types like `int`, `float`, and `string`. But real games need to represent complex things — players, enemies, weapons, spells. **Structs** group related data, and **enums** create named constants. Let's build them!

## What You'll Learn

- **Structs** — create custom data types that group multiple values
- **Enums** — named constants for states, types, and options
- **Enum classes** — type-safe enums (C++11 and later)
- Putting it all together — RPG character system
- Best practices and common patterns

---

## Part 1: Why Structs?

Without structs, tracking a player means multiple separate variables:

```cpp
// ❌ Without structs — messy!
std::string playerName = "Kaelen";
int playerHealth = 100;
int playerMana = 50;
float playerX = 10.0f;
float playerY = 20.0f;
int playerLevel = 5;
std::vector<std::string> playerInventory;

// Every time you pass to a function — many parameters
void displayPlayer(std::string name, int health, int mana, float x, float y, int level) {
    // ...
}
```

**With structs — clean!**

```cpp
// ✅ With structs — organized!
struct Player {
    std::string name;
    int health;
    int mana;
    float x;
    float y;
    int level;
    std::vector<std::string> inventory;
};

Player player;
player.name = "Kaelen";
player.health = 100;

void displayPlayer(const Player& p) {
    // One parameter for everything!
}
```

---

## Part 2: Basic Structs

```cpp
#include <iostream>
#include <string>

// Define a struct (usually outside main, often in header)
struct Enemy {
    std::string name;
    int health;
    int damage;
    float x;
    float y;
};

int main() {
    // Create an Enemy instance
    Enemy goblin;
    goblin.name = "Goblin Archer";
    goblin.health = 30;
    goblin.damage = 8;
    goblin.x = 15.0f;
    goblin.y = 25.0f;
    
    // Access members with dot operator
    std::cout << "Enemy: " << goblin.name << std::endl;
    std::cout << "Health: " << goblin.health << std::endl;
    std::cout << "Damage: " << goblin.damage << std::endl;
    std::cout << "Position: (" << goblin.x << ", " << goblin.y << ")" << std::endl;
    
    // Modify members
    goblin.health -= 15;
    std::cout << "\nAfter hit! Health: " << goblin.health << std::endl;
    
    return 0;
}
```

**Output:**
```
Enemy: Goblin Archer
Health: 30
Damage: 8
Position: (15, 25)

After hit! Health: 15
```

---

## Part 3: Initializing Structs

```cpp
#include <iostream>
#include <string>
#include <vector>

struct Weapon {
    std::string name;
    int damage;
    float weight;
    bool isMagic;
};

struct Character {
    std::string name;
    int health;
    int mana;
    Weapon equipped;
    std::vector<std::string> inventory;
};

int main() {
    // Method 1: Member-by-member (most common)
    Weapon sword;
    sword.name = "Longsword";
    sword.damage = 25;
    sword.weight = 3.5f;
    sword.isMagic = false;
    
    // Method 2: Aggregate initialization (C++11)
    Weapon bow = {"Elven Bow", 18, 2.0f, true};
    
    // Method 3: Designated initializers (C++20, more readable)
    Weapon axe = {
        .name = "Dwarven Axe",
        .damage = 30,
        .weight = 6.0f,
        .isMagic = true
    };
    
    // Complex struct
    Character hero = {
        .name = "Aragorn",
        .health = 120,
        .mana = 0,
        .equipped = sword,
        .inventory = {"Health Potion", "Mana Potion", "Key"}
    };
    
    std::cout << hero.name << " wields " << hero.equipped.name 
              << " (damage: " << hero.equipped.damage << ")" << std::endl;
    
    return 0;
}
```

---

## Part 4: Structs with Functions

```cpp
#include <iostream>
#include <string>

struct Player {
    std::string name;
    int health;
    int maxHealth;
    int strength;
};

// Pass by reference to modify
void heal(Player& player, int amount) {
    player.health += amount;
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    std::cout << player.name << " healed to " << player.health << " HP!" << std::endl;
}

// Pass by value (copy) — doesn't modify original
void displayPlayer(Player p) {
    std::cout << "Name: " << p.name << std::endl;
    std::cout << "Health: " << p.health << "/" << p.maxHealth << std::endl;
}

// Pass by const reference (read-only, no copy)
int calculateDamage(const Player& attacker, int baseDamage) {
    return baseDamage + (attacker.strength / 5);
}

int main() {
    Player hero = {"Kaelen", 75, 100, 18};
    
    displayPlayer(hero);
    std::cout << "Damage: " << calculateDamage(hero, 15) << std::endl;
    heal(hero, 30);
    
    return 0;
}
```

---

## Part 5: Nested Structs

Structs can contain other structs — perfect for complex game objects.

```cpp
#include <iostream>
#include <string>
#include <vector>

struct Vector2 {
    float x;
    float y;
};

struct Item {
    std::string name;
    int value;
    float weight;
};

struct Inventory {
    std::vector<Item> items;
    int gold;
    int maxWeight;
};

struct Player {
    std::string name;
    int health;
    Vector2 position;
    Inventory inventory;
};

int main() {
    Player hero;
    hero.name = "Geralt";
    hero.health = 100;
    hero.position = {100.0f, 200.0f};
    hero.inventory.gold = 500;
    hero.inventory.maxWeight = 100;
    hero.inventory.items = {
        {"Silver Sword", 1000, 5.0f},
        {"Health Potion", 50, 0.5f},
        {"Leather Armor", 200, 8.0f}
    };
    
    // Access nested members
    std::cout << "Player: " << hero.name << std::endl;
    std::cout << "Position: (" << hero.position.x << ", " << hero.position.y << ")" << std::endl;
    std::cout << "Gold: " << hero.inventory.gold << std::endl;
    std::cout << "First item: " << hero.inventory.items[0].name << std::endl;
    
    return 0;
}
```

---

## Part 6: Enums — Named Constants

Enums give names to related constants.

```cpp
#include <iostream>

// Basic enum
enum Difficulty {
    EASY,     // 0
    NORMAL,   // 1
    HARD,     // 2
    NIGHTMARE // 3
};

// Specify values
enum Element {
    FIRE = 1,
    WATER = 2,
    EARTH = 3,
    AIR = 4
};

// Non-sequential
enum Status {
    IDLE = 0,
    MOVING = 5,
    ATTACKING = 10,
    DEAD = 99
};

int main() {
    Difficulty gameDifficulty = HARD;
    
    if (gameDifficulty == HARD) {
        std::cout << "Prepare for challenge!" << std::endl;
    }
    
    // Enums are integers internally
    std::cout << "HARD value: " << HARD << std::endl;
    std::cout << "WATER value: " << WATER << std::endl;
    
    // Switch with enum
    switch (gameDifficulty) {
        case EASY:
            std::cout << "Casual mode" << std::endl;
            break;
        case NORMAL:
            std::cout << "Standard experience" << std::endl;
            break;
        case HARD:
            std::cout << "For veterans only" << std::endl;
            break;
        case NIGHTMARE:
            std::cout << "You must be mad!" << std::endl;
            break;
    }
    
    return 0;
}
```

---

## Part 7: Enum Classes (Type-Safe Enums)

Traditional enums have problems — they pollute the global namespace and can be accidentally compared to integers.

```cpp
// ❌ Problems with traditional enums
enum Color { RED, GREEN, BLUE };
enum TrafficLight { RED, YELLOW, GREEN };  // ERROR! RED and GREEN already defined

int x = RED;  // Allowed — can convert to int
if (RED == 0) { }  // Compares enum to int
```

**Enum classes** (C++11) solve these problems:

```cpp
#include <iostream>

// ✅ Enum class — type-safe, scoped
enum class Color {
    RED,
    GREEN,
    BLUE
};

enum class TrafficLight {
    RED,
    YELLOW,
    GREEN
};

int main() {
    Color c = Color::RED;           // Must scope
    TrafficLight t = TrafficLight::GREEN;
    
    // int x = Color::RED;          // ❌ ERROR! Can't convert to int
    // if (c == t) { }              // ❌ ERROR! Different types
    
    if (c == Color::RED) {          // ✅ Must compare same type
        std::cout << "It's red!" << std::endl;
    }
    
    // Convert to integer if needed
    int redValue = static_cast<int>(Color::RED);
    std::cout << "Red value: " << redValue << std::endl;
    
    return 0;
}
```

### Game Example: Character States

```cpp
#include <iostream>
#include <string>

enum class CharacterState {
    IDLE,
    WALKING,
    RUNNING,
    JUMPING,
    ATTACKING,
    HURT,
    DEAD
};

enum class ElementalType {
    PHYSICAL,
    FIRE,
    ICE,
    LIGHTNING,
    POISON
};

struct GameCharacter {
    std::string name;
    int health;
    CharacterState state;
    ElementalType element;
};

std::string stateToString(CharacterState state) {
    switch (state) {
        case CharacterState::IDLE:      return "Idle";
        case CharacterState::WALKING:   return "Walking";
        case CharacterState::RUNNING:   return "Running";
        case CharacterState::JUMPING:   return "Jumping";
        case CharacterState::ATTACKING: return "Attacking";
        case CharacterState::HURT:      return "Hurt";
        case CharacterState::DEAD:      return "Dead";
        default:                        return "Unknown";
    }
}

int main() {
    GameCharacter hero = {"Kaelen", 100, CharacterState::IDLE, ElementalType::FIRE};
    
    std::cout << hero.name << " is " << stateToString(hero.state) << std::endl;
    
    // Change state
    hero.state = CharacterState::ATTACKING;
    std::cout << hero.name << " starts " << stateToString(hero.state) << "!" << std::endl;
    
    return 0;
}
```

---

## Complete Example: RPG Character System

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>

// Enums
enum class CharacterClass {
    WARRIOR,
    MAGE,
    ROGUE,
    CLERIC
};

enum class DamageType {
    PHYSICAL,
    MAGIC,
    FIRE,
    ICE,
    POISON
};

enum class ItemType {
    WEAPON,
    ARMOR,
    CONSUMABLE,
    QUEST
};

// Structs
struct Vector2 {
    float x;
    float y;
};

struct Stats {
    int strength;
    int dexterity;
    int intelligence;
    int vitality;
};

struct Item {
    std::string name;
    ItemType type;
    int value;
    int powerBonus;
    std::string description;
};

struct Character {
    std::string name;
    CharacterClass characterClass;
    int level;
    int health;
    int maxHealth;
    int mana;
    int maxMana;
    Stats stats;
    Vector2 position;
    std::vector<Item> inventory;
    int gold;
};

// Function declarations
Character createCharacter();
void displayCharacter(const Character& c);
void levelUp(Character& c);
void addItem(Character& c, const Item& item);
void displayInventory(const Character& c);
std::string classToString(CharacterClass cc);
std::string itemTypeToString(ItemType it);

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Create a hero
    Character hero = createCharacter();
    
    // Create some items
    Item sword = {"Iron Sword", ItemType::WEAPON, 100, 15, "A sturdy iron blade"};
    Item potion = {"Health Potion", ItemType::CONSUMABLE, 50, 20, "Restores 20 HP"};
    Item armor = {"Leather Armor", ItemType::ARMOR, 80, 5, "Light protection"};
    
    // Add items to inventory
    addItem(hero, sword);
    addItem(hero, potion);
    addItem(hero, armor);
    addItem(hero, {"Gold Ring", ItemType::QUEST, 200, 0, "A mysterious ring"});
    
    // Display character
    displayCharacter(hero);
    displayInventory(hero);
    
    // Simulate leveling up
    std::cout << "\n=== LEVEL UP! ===" << std::endl;
    hero.level = 2;
    levelUp(hero);
    displayCharacter(hero);
    
    return 0;
}

Character createCharacter() {
    Character c;
    
    std::cout << "=== CHARACTER CREATION ===" << std::endl;
    std::cout << "Enter name: ";
    std::getline(std::cin, c.name);
    
    std::cout << "\nChoose class:" << std::endl;
    std::cout << "1. Warrior (High HP, Strength)" << std::endl;
    std::cout << "2. Mage (High Mana, Intelligence)" << std::endl;
    std::cout << "3. Rogue (Balanced, Dexterity)" << std::endl;
    std::cout << "4. Cleric (Healing, Support)" << std::endl;
    std::cout << "Choice: ";
    
    int classChoice;
    std::cin >> classChoice;
    
    // Base stats (will be modified by class)
    c.level = 1;
    c.stats.strength = 10;
    c.stats.dexterity = 10;
    c.stats.intelligence = 10;
    c.stats.vitality = 10;
    c.gold = 100;
    c.position = {0.0f, 0.0f};
    
    switch (classChoice) {
        case 1:
            c.characterClass = CharacterClass::WARRIOR;
            c.stats.strength += 5;
            c.stats.vitality += 5;
            c.maxHealth = 120;
            c.maxMana = 50;
            break;
        case 2:
            c.characterClass = CharacterClass::MAGE;
            c.stats.intelligence += 8;
            c.stats.dexterity += 2;
            c.maxHealth = 80;
            c.maxMana = 120;
            break;
        case 3:
            c.characterClass = CharacterClass::ROGUE;
            c.stats.dexterity += 7;
            c.stats.strength += 3;
            c.maxHealth = 90;
            c.maxMana = 70;
            break;
        case 4:
            c.characterClass = CharacterClass::CLERIC;
            c.stats.intelligence += 4;
            c.stats.vitality += 4;
            c.stats.strength += 2;
            c.maxHealth = 100;
            c.maxMana = 100;
            break;
        default:
            c.characterClass = CharacterClass::WARRIOR;
            c.maxHealth = 100;
            c.maxMana = 50;
    }
    
    c.health = c.maxHealth;
    c.mana = c.maxMana;
    
    return c;
}

void displayCharacter(const Character& c) {
    std::cout << "\n=== CHARACTER SHEET ===" << std::endl;
    std::cout << "Name: " << c.name << std::endl;
    std::cout << "Class: " << classToString(c.characterClass) << std::endl;
    std::cout << "Level: " << c.level << std::endl;
    std::cout << "Health: " << c.health << "/" << c.maxHealth << std::endl;
    std::cout << "Mana: " << c.mana << "/" << c.maxMana << std::endl;
    std::cout << "Gold: " << c.gold << std::endl;
    std::cout << "\nStats:" << std::endl;
    std::cout << "  Strength: " << c.stats.strength << std::endl;
    std::cout << "  Dexterity: " << c.stats.dexterity << std::endl;
    std::cout << "  Intelligence: " << c.stats.intelligence << std::endl;
    std::cout << "  Vitality: " << c.stats.vitality << std::endl;
}

void levelUp(Character& c) {
    c.maxHealth += 20;
    c.maxMana += 10;
    c.health = c.maxHealth;
    c.mana = c.maxMana;
    
    // Increase stats based on class
    switch (c.characterClass) {
        case CharacterClass::WARRIOR:
            c.stats.strength += 3;
            c.stats.vitality += 2;
            break;
        case CharacterClass::MAGE:
            c.stats.intelligence += 3;
            c.stats.dexterity += 1;
            c.stats.vitality += 1;
            break;
        case CharacterClass::ROGUE:
            c.stats.dexterity += 3;
            c.stats.strength += 2;
            break;
        case CharacterClass::CLERIC:
            c.stats.intelligence += 2;
            c.stats.vitality += 2;
            c.stats.strength += 1;
            break;
    }
}

void addItem(Character& c, const Item& item) {
    c.inventory.push_back(item);
    std::cout << "Added " << item.name << " to inventory!" << std::endl;
}

void displayInventory(const Character& c) {
    std::cout << "\n=== INVENTORY ===" << std::endl;
    std::cout << "Gold: " << c.gold << std::endl;
    
    if (c.inventory.empty()) {
        std::cout << "Inventory is empty!" << std::endl;
        return;
    }
    
    for (size_t i = 0; i < c.inventory.size(); i++) {
        const Item& item = c.inventory[i];
        std::cout << i+1 << ". " << item.name << " [" << itemTypeToString(item.type) << "]";
        std::cout << " - Value: " << item.value;
        if (item.powerBonus > 0) {
            std::cout << " (+" << item.powerBonus << " power)";
        }
        std::cout << std::endl;
    }
}

std::string classToString(CharacterClass cc) {
    switch (cc) {
        case CharacterClass::WARRIOR: return "Warrior";
        case CharacterClass::MAGE:    return "Mage";
        case CharacterClass::ROGUE:   return "Rogue";
        case CharacterClass::CLERIC:  return "Cleric";
        default:                      return "Unknown";
    }
}

std::string itemTypeToString(ItemType it) {
    switch (it) {
        case ItemType::WEAPON:     return "Weapon";
        case ItemType::ARMOR:      return "Armor";
        case ItemType::CONSUMABLE: return "Consumable";
        case ItemType::QUEST:      return "Quest Item";
        default:                   return "Unknown";
    }
}
```

---

## Common Mistakes

### 1. Forgetting Semicolon After Struct

```cpp
// ❌ Missing semicolon
struct Player {
    int health;
    int mana;
}  // ERROR!

// ✅ Correct
struct Player {
    int health;
    int mana;
};  // Semicolon required!
```

### 2. Pass by Value for Large Structs

```cpp
// ❌ Copies entire struct (slow)
void processPlayer(Player p) { }

// ✅ Pass by const reference (fast, read-only)
void processPlayer(const Player& p) { }

// ✅ Pass by reference (fast, can modify)
void modifyPlayer(Player& p) { }
```

### 3. Using Raw Enums in Switch Without `default`

```cpp
enum class Color { RED, GREEN, BLUE };

void describe(Color c) {
    switch (c) {
        case Color::RED:   // ...
        case Color::GREEN: // ...
        // Missing BLUE and default!
    }
}
```

### 4. Comparing Different Enum Types

```cpp
enum class A { VALUE };
enum class B { VALUE };

if (A::VALUE == B::VALUE) {  // ❌ ERROR! Different types
```

---

## Quick Reference Card

```cpp
// Struct definition
struct StructName {
    Type member1;
    Type member2;
};

// Create instance
StructName variable;
variable.member1 = value;

// Initialize
StructName var = {value1, value2};           // Aggregate
StructName var = {.member1 = value1};        // Designated (C++20)

// Enum (traditional)
enum Name { VALUE1, VALUE2, VALUE3 };
enum Name { VALUE1 = 10, VALUE2 = 20 };

// Enum class (type-safe)
enum class Name {
    VALUE1,
    VALUE2,
    VALUE3
};
Name var = Name::VALUE1;

// Convert enum class to int
int value = static_cast<int>(Name::VALUE1);
```

---

## Practice Exercises

**Exercise 1 (Easy):** Define a `struct Point` with x and y coordinates. Create a function `float distance(Point a, Point b)` that calculates distance between two points.

**Exercise 2 (Easy):** Create an `enum class Season { SPRING, SUMMER, FALL, WINTER }`. Write a function that returns the average temperature for each season.

**Exercise 3 (Medium):** Create a `struct Card` for a card game with suit and rank (use enums). Create a `struct Deck` with a vector of Cards. Add functions to shuffle and draw a card.

**Exercise 4 (Medium):** Build a `struct Rectangle` with width, height, and position (x, y). Add functions: area, perimeter, containsPoint(x, y), intersects(other).

**Exercise 5 (Hard):** Create a "Quest System" with:
- `enum class QuestStatus { NOT_STARTED, ACTIVE, COMPLETED, FAILED }`
- `struct Quest` with name, description, reward, status, objectives list
- Functions to start, update progress, complete, and display quest log

**Exercise 6 (Challenge):** Build a "Turn-Based Battle System" using structs for Character, Skill, and Battle. Use enums for states and damage types. Include multiple characters, skills with cooldowns, and status effects.

---

## Summary

You now know:

✅ **Structs** — group related data into custom types  
✅ **Nested structs** — build complex data structures  
✅ **Enums** — create named constants for states and types  
✅ **Enum classes** — type-safe, scoped enums  
✅ Complete RPG character system example  
✅ When to use each tool  

## What's Next?

Next lesson: **File I/O** — save and load game data, write logs, and persist player progress!

---

## Resources

- [C++ Structs (cppreference)](https://en.cppreference.com/w/cpp/language/struct)
- [C++ Enums (cppreference)](https://en.cppreference.com/w/cpp/language/enum)

---

**Practice Task:** Create a "Save Game System" using structs. Define a `SaveData` struct containing player stats, inventory, quest progress, and world state. Write functions to save to a file and load from a file. This leads perfectly into the next lesson on File I/O!