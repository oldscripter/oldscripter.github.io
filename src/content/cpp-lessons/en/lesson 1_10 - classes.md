---
title: "Classes — Object-Oriented Programming in C++"
description: "Create blueprints for game objects, encapsulate data, and build complex systems with classes"
pubDate: 2026-06-01
tags: ["C++", "beginner", "classes", "OOP", "encapsulation"]
lang: "en"
lessonNumber: 110
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 12: Classes — Object-Oriented Programming in C++

Welcome! We've already used structs to group data. Now it's time for **classes** — they let you group not only data but also **functions** that operate on that data. Classes are the foundation of Object-Oriented Programming (OOP) in C++.

## What You'll Learn

- What classes are and why they matter
- Class members (data and methods)
- Access levels: `public`, `private`, `protected`
- Constructors and destructors
- Getters and setters (accessors and mutators)
- Static class members
- Friend functions and classes
- Composition and aggregation
- Classes in games — a complete example

---

## Part 1: From Structs to Classes

Structs are good for simple data, but complex game objects need more:

```cpp
// ❌ Struct — data only
struct Player {
    std::string name;
    int health;
    int level;
};

// We need to check health, heal, deal damage...
// Functions outside the struct:
void takeDamage(Player& p, int damage) {
    p.health -= damage;
    if (p.health < 0) p.health = 0;
    if (p.health == 0) {
        std::cout << p.name << " died!" << std::endl;
    }
}
```

**With classes — data and functions together:**

```cpp
// ✅ Class — data + functions
class Player {
private:
    std::string name;
    int health;
    int maxHealth;
    int level;
    
public:
    void takeDamage(int damage) {
        health -= damage;
        if (health < 0) health = 0;
        if (health == 0) {
            std::cout << name << " died!" << std::endl;
        }
    }
    
    void heal(int amount) {
        health += amount;
        if (health > maxHealth) health = maxHealth;
    }
    
    bool isAlive() const {
        return health > 0;
    }
};
```

---

## Part 2: Basic Class

```cpp
#include <iostream>
#include <string>

class Enemy {
private:
    std::string name;
    int health;
    int damage;
    
public:
    // Methods
    void attack() {
        std::cout << name << " attacks for " << damage << " damage!" << std::endl;
    }
    
    void takeDamage(int amount) {
        health -= amount;
        std::cout << name << " takes " << amount << " damage (HP: " << health << ")" << std::endl;
    }
    
    bool isAlive() const {
        return health > 0;
    }
    
    void setName(const std::string& n) {
        name = n;
    }
    
    void setHealth(int h) {
        health = h;
    }
    
    void setDamage(int d) {
        damage = d;
    }
};

int main() {
    Enemy goblin;
    goblin.setName("Goblin Archer");
    goblin.setHealth(30);
    goblin.setDamage(8);
    
    goblin.attack();
    goblin.takeDamage(15);
    
    if (goblin.isAlive()) {
        std::cout << "Goblin is still alive!" << std::endl;
    }
    
    return 0;
}
```

---

## Part 3: Access Levels

C++ offers three access levels:

| Level | Access | Use |
|---------|--------|-----|
| `public` | From anywhere | Class interface |
| `private` | Only inside the class | Hidden data |
| `protected` | Inside class and inheritors | For inheritance |

```cpp
class GameCharacter {
private:
    // ❌ Not accessible from outside
    std::string name;
    int health;
    int secretPower;  // No one should know!
    
protected:
    // 🔒 Accessible in inheritors
    int baseArmor;
    
public:
    // ✅ Public interface
    void setName(const std::string& n) { name = n; }
    std::string getName() const { return name; }
    
    void takeDamage(int damage) {
        // Using protected member
        int effectiveDamage = damage - baseArmor;
        if (effectiveDamage < 0) effectiveDamage = 0;
        health -= effectiveDamage;
    }
};

int main() {
    GameCharacter hero;
    hero.setName("Kaelen");
    // hero.health = 100;  // ❌ Error! health is private
    // hero.baseArmor = 5; // ❌ Error! baseArmor is protected
    
    std::cout << hero.getName() << std::endl;  // ✅ public method
    
    return 0;
}
```

---

## Part 4: Constructors and Destructors

### Constructors — Creating Objects

```cpp
#include <iostream>
#include <string>

class Weapon {
private:
    std::string name;
    int damage;
    float weight;
    
public:
    // Default constructor
    Weapon() {
        name = "Fists";
        damage = 2;
        weight = 0.0f;
        std::cout << "Default weapon created!" << std::endl;
    }
    
    // Parameterized constructor
    Weapon(const std::string& n, int d, float w) {
        name = n;
        damage = d;
        weight = w;
        std::cout << "Weapon " << name << " created!" << std::endl;
    }
    
    // Initializer list (more efficient)
    Weapon(const std::string& n, int d) 
        : name(n), damage(d), weight(1.0f) {
        std::cout << "Weapon " << name << " created with default weight!" << std::endl;
    }
    
    // Destructor
    ~Weapon() {
        std::cout << "Weapon " << name << " destroyed!" << std::endl;
    }
    
    void display() const {
        std::cout << name << " (Damage: " << damage << ", Weight: " << weight << ")" << std::endl;
    }
};

int main() {
    Weapon defaultWeapon;                           // Default constructor
    Weapon sword("Iron Sword", 25, 3.5f);           // Parameterized
    Weapon bow("Elven Bow", 18);                    // Constructor with 2 params
    
    defaultWeapon.display();
    sword.display();
    bow.display();
    
    // Destructors are called automatically when going out of scope
    return 0;
}
```

**Output:**
```
Default weapon created!
Weapon Iron Sword created!
Weapon Elven Bow created with default weight!
Fists (Damage: 2, Weight: 0)
Iron Sword (Damage: 25, Weight: 3.5)
Elven Bow (Damage: 18, Weight: 1)
Weapon Elven Bow destroyed!
Weapon Iron Sword destroyed!
Weapon Fists destroyed!
```

### Rule of Three

If a class has a custom destructor, copy constructor, or copy assignment operator, it usually needs all three:

```cpp
class DynamicArray {
private:
    int* data;
    int size;
    
public:
    // Constructor
    DynamicArray(int s) : size(s) {
        data = new int[size];
        std::cout << "Array of size " << size << " created" << std::endl;
    }
    
    // Destructor
    ~DynamicArray() {
        delete[] data;
        std::cout << "Array destroyed" << std::endl;
    }
    
    // Copy constructor
    DynamicArray(const DynamicArray& other) : size(other.size) {
        data = new int[size];
        for (int i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "Array copied" << std::endl;
    }
    
    // Copy assignment operator
    DynamicArray& operator=(const DynamicArray& other) {
        if (this == &other) return *this;  // Self-assignment check
        
        delete[] data;
        size = other.size;
        data = new int[size];
        for (int i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "Array assigned" << std::endl;
        return *this;
    }
};
```

---

## Part 5: Getters and Setters

Getters and setters control access to private data:

```cpp
#include <iostream>
#include <string>

class Character {
private:
    std::string name;
    int health;
    int maxHealth;
    int level;
    
public:
    // Constructor
    Character(const std::string& n, int h, int l) 
        : name(n), health(h), maxHealth(h), level(l) {}
    
    // Getters (reading data)
    std::string getName() const { return name; }
    int getHealth() const { return health; }
    int getMaxHealth() const { return maxHealth; }
    int getLevel() const { return level; }
    
    // Setters (setting data with validation)
    void setName(const std::string& n) {
        if (!n.empty()) {
            name = n;
        }
    }
    
    void setHealth(int h) {
        if (h >= 0 && h <= maxHealth) {
            health = h;
        }
    }
    
    // Special methods
    void heal(int amount) {
        health += amount;
        if (health > maxHealth) health = maxHealth;
        std::cout << name << " healed to " << health << " HP" << std::endl;
    }
    
    void takeDamage(int amount) {
        health -= amount;
        if (health < 0) health = 0;
        std::cout << name << " took " << amount << " damage (HP: " << health << ")" << std::endl;
        
        if (health == 0) {
            std::cout << name << " has been defeated!" << std::endl;
        }
    }
    
    void levelUp() {
        level++;
        maxHealth += 20;
        health = maxHealth;
        std::cout << name << " is now level " << level << "!" << std::endl;
    }
    
    void display() const {
        std::cout << "\n=== " << name << " ===" << std::endl;
        std::cout << "Level: " << level << std::endl;
        std::cout << "Health: " << health << "/" << maxHealth << std::endl;
    }
};

int main() {
    Character hero("Kaelen", 100, 1);
    hero.display();
    
    hero.takeDamage(35);
    hero.heal(20);
    hero.levelUp();
    hero.display();
    
    hero.setHealth(150);  // Ignored (exceeds maxHealth)
    hero.setName("");     // Ignored (empty name)
    hero.setName("Aragorn");
    hero.display();
    
    return 0;
}
```

---

## Part 6: Static Members

Static members belong to the class, not individual objects.

```cpp
#include <iostream>
#include <string>

class Enemy {
private:
    std::string name;
    int health;
    static int totalEnemies;   // Total enemy count (static)
    
public:
    Enemy(const std::string& n, int h) : name(n), health(h) {
        totalEnemies++;
        std::cout << "Spawned " << name << "! Total enemies: " << totalEnemies << std::endl;
    }
    
    ~Enemy() {
        totalEnemies--;
        std::cout << "Defeated " << name << "! Remaining enemies: " << totalEnemies << std::endl;
    }
    
    // Static method
    static int getTotalEnemies() {
        return totalEnemies;
    }
};

// Initialize static variable (outside the class!)
int Enemy::totalEnemies = 0;

int main() {
    std::cout << "Starting with " << Enemy::getTotalEnemies() << " enemies" << std::endl;
    
    Enemy* goblin = new Enemy("Goblin", 30);
    Enemy* orc = new Enemy("Orc", 50);
    Enemy* troll = new Enemy("Troll", 80);
    
    std::cout << "Current total: " << Enemy::getTotalEnemies() << std::endl;
    
    delete goblin;
    delete orc;
    
    std::cout << "After two deaths: " << Enemy::getTotalEnemies() << std::endl;
    
    delete troll;
    
    return 0;
}
```

---

## Part 7: Friend Functions and Classes

Sometimes you need to give access to private members to external functions or classes.

```cpp
#include <iostream>
#include <string>

class Player;

// Function declared as a friend
void displayFullInfo(const Player& p);

class Player {
private:
    std::string name;
    int health;
    int level;
    
    // Friend function
    friend void displayFullInfo(const Player& p);
    
    // Friend class
    friend class GameManager;
    
public:
    Player(const std::string& n, int h, int l) 
        : name(n), health(h), level(l) {}
};

// Friend function has access to private
void displayFullInfo(const Player& p) {
    std::cout << "Name: " << p.name << std::endl;
    std::cout << "Health: " << p.health << std::endl;
    std::cout << "Level: " << p.level << std::endl;
}

class GameManager {
public:
    // Friend class has access to private
    void printSecretStats(const Player& p) {
        std::cout << "Secret: Player " << p.name << " has " << p.health << " HP" << std::endl;
    }
};

int main() {
    Player hero("Kaelen", 100, 5);
    displayFullInfo(hero);
    
    GameManager gm;
    gm.printSecretStats(hero);
    
    return 0;
}
```

---

## Part 8: Composition

Composition — when one class contains objects of another class.

```cpp
#include <iostream>
#include <string>
#include <vector>

class Weapon {
private:
    std::string name;
    int damage;
    
public:
    Weapon(const std::string& n, int d) : name(n), damage(d) {}
    
    std::string getName() const { return name; }
    int getDamage() const { return damage; }
    
    void display() const {
        std::cout << name << " (Damage: " << damage << ")" << std::endl;
    }
};

class Armor {
private:
    std::string name;
    int defense;
    
public:
    Armor(const std::string& n, int d) : name(n), defense(d) {}
    
    std::string getName() const { return name; }
    int getDefense() const { return defense; }
    
    void display() const {
        std::cout << name << " (Defense: " << defense << ")" << std::endl;
    }
};

class Character {
private:
    std::string name;
    int health;
    Weapon weapon;
    Armor armor;
    std::vector<Weapon> inventory;
    
public:
    Character(const std::string& n, int h, const Weapon& w, const Armor& a)
        : name(n), health(h), weapon(w), armor(a) {}
    
    void addWeapon(const Weapon& w) {
        inventory.push_back(w);
        std::cout << w.getName() << " added to inventory!" << std::endl;
    }
    
    void attack() const {
        std::cout << name << " attacks with " << weapon.getName() 
                  << " for " << weapon.getDamage() << " damage!" << std::endl;
    }
    
    void defend() const {
        std::cout << name << " defends with " << armor.getName() 
                  << " (Defense: " << armor.getDefense() << ")" << std::endl;
    }
    
    void display() const {
        std::cout << "\n=== " << name << " ===" << std::endl;
        std::cout << "Health: " << health << std::endl;
        std::cout << "Weapon: ";
        weapon.display();
        std::cout << "Armor: ";
        armor.display();
        
        if (!inventory.empty()) {
            std::cout << "Inventory:" << std::endl;
            for (const auto& w : inventory) {
                std::cout << "  - ";
                w.display();
            }
        }
    }
};

int main() {
    Weapon sword("Iron Sword", 25);
    Weapon bow("Elven Bow", 18);
    Weapon axe("Battle Axe", 35);
    
    Armor helmet("Steel Helmet", 8);
    Armor plate("Plate Armor", 15);
    
    Character hero("Kaelen", 100, sword, helmet);
    
    hero.addWeapon(bow);
    hero.addWeapon(axe);
    
    hero.attack();
    hero.defend();
    hero.display();
    
    return 0;
}
```

---

## Complete Example: RPG System with Classes

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <memory>

// Enums
enum class DamageType {
    PHYSICAL,
    MAGIC,
    FIRE,
    ICE
};

enum class CharacterClass {
    WARRIOR,
    MAGE,
    ROGUE,
    CLERIC
};

// Base Entity class
class Entity {
protected:
    std::string name;
    int health;
    int maxHealth;
    bool isAlive;
    
public:
    Entity(const std::string& n, int h) 
        : name(n), health(h), maxHealth(h), isAlive(true) {}
    
    virtual ~Entity() {}
    
    virtual void takeDamage(int damage) {
        health -= damage;
        if (health <= 0) {
            health = 0;
            isAlive = false;
            std::cout << name << " has been defeated!" << std::endl;
        }
    }
    
    virtual void heal(int amount) {
        if (!isAlive) return;
        health += amount;
        if (health > maxHealth) health = maxHealth;
        std::cout << name << " healed to " << health << " HP" << std::endl;
    }
    
    virtual void display() const {
        std::cout << name << " (HP: " << health << "/" << maxHealth << ")" << std::endl;
    }
    
    std::string getName() const { return name; }
    int getHealth() const { return health; }
    bool getIsAlive() const { return isAlive; }
    
    virtual void attack(Entity& target) = 0;  // Pure virtual method
};

// Weapon class
class Weapon {
private:
    std::string name;
    int damage;
    DamageType type;
    
public:
    Weapon(const std::string& n, int d, DamageType t = DamageType::PHYSICAL)
        : name(n), damage(d), type(t) {}
    
    int getDamage() const { return damage; }
    std::string getName() const { return name; }
    DamageType getType() const { return type; }
    
    void display() const {
        std::cout << name << " (Damage: " << damage << ")";
    }
};

// Character class
class Character : public Entity {
private:
    CharacterClass charClass;
    int level;
    Weapon weapon;
    std::vector<Weapon> inventory;
    int experience;
    int strength;
    int dexterity;
    int intelligence;
    
public:
    Character(const std::string& n, CharacterClass cc, const Weapon& w)
        : Entity(n, 100), charClass(cc), level(1), weapon(w), 
          experience(0), strength(10), dexterity(10), intelligence(10) {
        
        switch (cc) {
            case CharacterClass::WARRIOR:
                maxHealth = 150;
                health = maxHealth;
                strength = 18;
                break;
            case CharacterClass::MAGE:
                maxHealth = 80;
                health = maxHealth;
                intelligence = 18;
                break;
            case CharacterClass::ROGUE:
                maxHealth = 100;
                health = maxHealth;
                dexterity = 18;
                break;
            default:
                maxHealth = 120;
                health = maxHealth;
                strength = 12;
                dexterity = 12;
                intelligence = 12;
        }
    }
    
    void attack(Entity& target) override {
        if (!isAlive) {
            std::cout << name << " is dead and cannot attack!" << std::endl;
            return;
        }
        
        int baseDamage = weapon.getDamage() + (strength / 5);
        int randomBonus = rand() % 15;
        int totalDamage = baseDamage + randomBonus;
        
        std::cout << name << " attacks with " << weapon.getName() 
                  << " for " << totalDamage << " damage!" << std::endl;
        
        target.takeDamage(totalDamage);
        
        // Gain experience
        if (!target.getIsAlive()) {
            experience += 50;
            checkLevelUp();
        }
    }
    
    void addWeapon(const Weapon& w) {
        inventory.push_back(w);
        std::cout << w.getName() << " added to inventory!" << std::endl;
    }
    
    void equipWeapon(const std::string& weaponName) {
        for (const auto& w : inventory) {
            if (w.getName() == weaponName) {
                weapon = w;
                std::cout << name << " equipped " << weaponName << "!" << std::endl;
                return;
            }
        }
        std::cout << "Weapon " << weaponName << " not found in inventory!" << std::endl;
    }
    
    void checkLevelUp() {
        if (experience >= level * 100) {
            level++;
            experience = 0;
            maxHealth += 20;
            health = maxHealth;
            strength += 2;
            dexterity += 2;
            intelligence += 2;
            
            std::cout << "*** " << name << " reached level " << level << "! ***" << std::endl;
        }
    }
    
    void display() const override {
        Entity::display();
        std::cout << "Level: " << level << std::endl;
        std::cout << "Weapon: " << weapon.getName() << " (Damage: " << weapon.getDamage() << ")" << std::endl;
        std::cout << "Stats - STR: " << strength << " | DEX: " << dexterity 
                  << " | INT: " << intelligence << std::endl;
        std::cout << "XP: " << experience << "/" << (level * 100) << std::endl;
        
        if (!inventory.empty()) {
            std::cout << "Inventory: ";
            for (const auto& w : inventory) {
                std::cout << w.getName() << " ";
            }
            std::cout << std::endl;
        }
    }
};

// Enemy class
class Enemy : public Entity {
private:
    int damage;
    int experienceReward;
    
public:
    Enemy(const std::string& n, int h, int d, int xp) 
        : Entity(n, h), damage(d), experienceReward(xp) {}
    
    void attack(Entity& target) override {
        if (!isAlive) {
            std::cout << name << " is dead and cannot attack!" << std::endl;
            return;
        }
        
        int randomBonus = rand() % 10;
        int totalDamage = damage + randomBonus;
        
        std::cout << name << " attacks for " << totalDamage << " damage!" << std::endl;
        target.takeDamage(totalDamage);
    }
    
    void display() const override {
        Entity::display();
        std::cout << "Damage: " << damage << std::endl;
    }
    
    int getExperienceReward() const { return experienceReward; }
};

// Battle system class
class BattleSystem {
private:
    std::shared_ptr<Character> player;
    std::vector<std::shared_ptr<Enemy>> enemies;
    int turnCount;
    
public:
    BattleSystem(std::shared_ptr<Character> p) : player(p), turnCount(0) {}
    
    void addEnemy(std::shared_ptr<Enemy> enemy) {
        enemies.push_back(enemy);
        std::cout << enemy->getName() << " appears!" << std::endl;
    }
    
    void startBattle() {
        std::cout << "\n=== BATTLE START ===" << std::endl;
        std::cout << player->getName() << " vs " << enemies.size() << " enemies!" << std::endl;
        
        while (player->getIsAlive() && hasEnemiesAlive()) {
            turnCount++;
            std::cout << "\n--- Turn " << turnCount << " ---" << std::endl;
            
            displayStatus();
            
            // Player turn
            std::cout << "\n1. Attack first enemy" << std::endl;
            std::cout << "2. Heal" << std::endl;
            std::cout << "3. Display status" << std::endl;
            std::cout << "Choice: ";
            
            int choice;
            std::cin >> choice;
            
            if (choice == 1) {
                attackEnemy();
            } else if (choice == 2) {
                player->heal(30);
            } else {
                displayStatus();
            }
            
            // Enemy turn
            if (player->getIsAlive() && hasEnemiesAlive()) {
                enemyAttack();
            }
        }
        
        if (player->getIsAlive()) {
            std::cout << "\n✦ VICTORY! All enemies defeated! ✦" << std::endl;
        } else {
            std::cout << "\n✗ DEFEAT! " << player->getName() << " has fallen. ✗" << std::endl;
        }
    }
    
private:
    bool hasEnemiesAlive() const {
        for (const auto& enemy : enemies) {
            if (enemy->getIsAlive()) return true;
        }
        return false;
    }
    
    void displayStatus() const {
        std::cout << "\n--- Status ---" << std::endl;
        player->display();
        std::cout << std::endl;
        
        for (const auto& enemy : enemies) {
            if (enemy->getIsAlive()) {
                std::cout << "  ";
                enemy->display();
            }
        }
    }
    
    void attackEnemy() {
        for (auto& enemy : enemies) {
            if (enemy->getIsAlive()) {
                player->attack(*enemy);
                if (!enemy->getIsAlive()) {
                    int xp = enemy->getExperienceReward();
                    std::cout << "Gained " << xp << " experience!" << std::endl;
                }
                return;
            }
        }
        std::cout << "No alive enemies to attack!" << std::endl;
    }
    
    void enemyAttack() {
        for (auto& enemy : enemies) {
            if (enemy->getIsAlive()) {
                enemy->attack(*player);
                return;
            }
        }
    }
};

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Create weapons
    Weapon sword("Iron Sword", 25);
    Weapon staff("Magic Staff", 20, DamageType::MAGIC);
    Weapon dagger("Shadow Dagger", 18);
    
    // Create character
    auto hero = std::make_shared<Character>("Kaelen", CharacterClass::WARRIOR, sword);
    hero->addWeapon(dagger);
    
    // Create battle
    BattleSystem battle(hero);
    
    // Add enemies
    battle.addEnemy(std::make_shared<Enemy>("Goblin", 30, 8, 50));
    battle.addEnemy(std::make_shared<Enemy>("Orc", 50, 12, 75));
    battle.addEnemy(std::make_shared<Enemy>("Troll", 80, 15, 100));
    
    // Start battle
    battle.startBattle();
    
    return 0;
}
```

---

## Common Mistakes

### 1. Missing Semicolon After Class

```cpp
// ❌ Error
class Player {
    // ...
}  // Missing ;

// ✅ Correct
class Player {
    // ...
};  // Semicolon required!
```

### 2. Using Methods Before Initialization

```cpp
// ❌ Uninitialized object
Player hero;  // Only works if there's a default constructor
hero.setName("Kaelen");

// ✅ Correct
Player hero("Kaelen", 100, 1);  // Initialization via constructor
```

### 3. Virtual Functions Without Virtual Destructor

```cpp
// ❌ Dangerous — base class destructor not virtual
class Base { };
class Derived : public Base { };

Base* obj = new Derived();
delete obj;  // Only calls Base destructor! Memory leak.

// ✅ Correct
class Base {
public:
    virtual ~Base() {}
};
```

### 4. Copying Classes with Dynamic Memory

```cpp
// ❌ Shallow copy — both objects point to same memory
class Array {
    int* data;
public:
    Array(int size) { data = new int[size]; }
    ~Array() { delete[] data; }
};

Array a(10);
Array b = a;  // Both point to same memory → double delete!

// ✅ Use the Rule of Three or disable copying
```

---

## Quick Reference Card

```cpp
// Class
class ClassName {
private:
    // Hidden members
    
protected:
    // Accessible to inheritors
    
public:
    // Public interface
    
    // Constructors
    ClassName();                    // Default
    ClassName(parameters);          // Parameterized
    
    // Destructor
    ~ClassName();
    
    // Methods
    void method();
    void constMethod() const;
    static void staticMethod();
};

// Creating objects
ClassName obj;                      // Default constructor
ClassName obj(parameters);           // Parameterized
ClassName* ptr = new ClassName();   // Dynamic

// Accessing members
obj.method();
obj.member = value;
ptr->method();
ptr->member = value;

// Inheritance
class Derived : public Base {
    // ...
};

// Virtual functions
class Base {
    virtual void func();            // Can be overridden
    virtual void pureFunc() = 0;    // Pure virtual
};
```

---

## Practice Exercises

**Exercise 1 (Easy):** Create a `Circle` class with a private radius. Implement methods for area, circumference, and diameter calculation.

**Exercise 2 (Medium):** Create a `BankAccount` class with private balance and owner. Implement methods for deposit, withdrawal (with validation), balance display, and transaction history.

**Exercise 3 (Medium):** Create a hierarchy of geometric shapes. Base class `Shape` with virtual `area()` and `perimeter()` methods. Inheritors: `Rectangle`, `Circle`, `Triangle`.

**Exercise 4 (Hard):** Create a `Deck` class for a deck of cards. Use composition to store 52 cards. Implement shuffle, draw card, and size check methods.

**Exercise 5 (Hard):** Create a `GameEngine` class with a game loop. Use composition to manage game objects (player, enemies, items). Implement update and render logic.

**Exercise 6 (Challenge):** Create a "Quest System" with `Quest`, `QuestManager`, and `QuestReward` classes. Use inheritance for different quest types (kill enemies, collect items, explore locations). Implement progress tracking and rewards.

---

## Summary

You now know:

✅ What classes are and how they differ from structs  
✅ Access levels: `public`, `private`, `protected`  
✅ Constructors and destructors  
✅ Getters and setters  
✅ Static class members  
✅ Friend functions and classes  
✅ Composition — classes inside classes  
✅ Inheritance and virtual functions  
✅ A complete RPG system with classes  


---

## Resources

- [C++ Classes (cppreference)](https://en.cppreference.com/w/cpp/language/classes)
- [Object-Oriented Programming (learncpp)](https://www.learncpp.com/cpp-tutorial/object-oriented-programming/)

---

**Practice Task:** Create a "Character Management System" for an RPG. Use classes for character, character class, inventory, and abilities. Implement inheritance for different classes (Warrior, Mage, Rogue). Add a leveling system and weapon switching. This combines everything you've learned about classes!