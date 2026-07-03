---
title: "Классы - ООП в C++"
description: "Create blueprints for game objects, encapsulate data, and build complex systems with classes"
pubDate: 2026-06-01
tags: ["C++", "beginner", "classes", "OOP", "encapsulation"]
lang: "ru"
lessonNumber: 110
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Урок 12: Классы — объектно-ориентированное программирование в C++

Добро пожаловать! Мы уже использовали структуры для группировки данных. Теперь пришло время **классов** — они позволяют группировать не только данные, но и **функции**, работающие с этими данными. Классы — это основа объектно-ориентированного программирования (ООП) в C++.

## Что вы изучите

- Что такое классы и зачем они нужны
- Члены класса (данные и методы)
- Уровни доступа: `public`, `private`, `protected`
- Конструкторы и деструкторы
- Геттеры и сеттеры (аксессоры и мутаторы)
- Статические члены класса
- Дружественные функции и классы
- Композиция и агрегация
- Классы в играх — полный пример

---

## Часть 1: От структур к классам

Структуры хороши для простых данных, но для сложных игровых объектов нужно больше:

```cpp
// ❌ Структура — только данные
struct Player {
    std::string name;
    int health;
    int level;
};

// Нам нужно проверять здоровье, лечить, наносить урон...
// С функциями вне структуры:
void takeDamage(Player& p, int damage) {
    p.health -= damage;
    if (p.health < 0) p.health = 0;
    if (p.health == 0) {
        std::cout << p.name << " died!" << std::endl;
    }
}
```

**С классами — данные и функции вместе:**

```cpp
// ✅ Класс — данные + функции
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

## Часть 2: Базовый класс

```cpp
#include <iostream>
#include <string>

class Enemy {
private:
    std::string name;
    int health;
    int damage;
    
public:
    // Методы
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

## Часть 3: Уровни доступа

C++ предлагает три уровня доступа:

| Уровень | Доступ | Использование |
|---------|--------|---------------|
| `public` | Откуда угодно | Интерфейс класса |
| `private` | Только внутри класса | Скрытые данные |
| `protected` | Внутри класса и наследников | Для наследования |

```cpp
class GameCharacter {
private:
    // ❌ Недоступны снаружи
    std::string name;
    int health;
    int secretPower;  // Никто не должен знать!
    
protected:
    // 🔒 Доступны в наследниках
    int baseArmor;
    
public:
    // ✅ Публичный интерфейс
    void setName(const std::string& n) { name = n; }
    std::string getName() const { return name; }
    
    void takeDamage(int damage) {
        // Используем protected член
        int effectiveDamage = damage - baseArmor;
        if (effectiveDamage < 0) effectiveDamage = 0;
        health -= effectiveDamage;
    }
};

int main() {
    GameCharacter hero;
    hero.setName("Kaelen");
    // hero.health = 100;  // ❌ Ошибка! health private
    // hero.baseArmor = 5; // ❌ Ошибка! baseArmor protected
    
    std::cout << hero.getName() << std::endl;  // ✅ public метод
    
    return 0;
}
```

---

## Часть 4: Конструкторы и деструкторы

### Конструкторы — Создание объектов

```cpp
#include <iostream>
#include <string>

class Weapon {
private:
    std::string name;
    int damage;
    float weight;
    
public:
    // Конструктор по умолчанию
    Weapon() {
        name = "Fists";
        damage = 2;
        weight = 0.0f;
        std::cout << "Default weapon created!" << std::endl;
    }
    
    // Конструктор с параметрами
    Weapon(const std::string& n, int d, float w) {
        name = n;
        damage = d;
        weight = w;
        std::cout << "Weapon " << name << " created!" << std::endl;
    }
    
    // Список инициализации (более эффективный)
    Weapon(const std::string& n, int d) 
        : name(n), damage(d), weight(1.0f) {
        std::cout << "Weapon " << name << " created with default weight!" << std::endl;
    }
    
    // Деструктор
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
    
    // Деструкторы вызываются автоматически при выходе из области видимости
    return 0;
}
```

**Вывод:**
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

### Правило трёх (Rule of Three)

Если у класса есть пользовательский деструктор, конструктор копирования или оператор присваивания, обычно нужны все три:

```cpp
class DynamicArray {
private:
    int* data;
    int size;
    
public:
    // Конструктор
    DynamicArray(int s) : size(s) {
        data = new int[size];
        std::cout << "Array of size " << size << " created" << std::endl;
    }
    
    // Деструктор
    ~DynamicArray() {
        delete[] data;
        std::cout << "Array destroyed" << std::endl;
    }
    
    // Конструктор копирования
    DynamicArray(const DynamicArray& other) : size(other.size) {
        data = new int[size];
        for (int i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "Array copied" << std::endl;
    }
    
    // Оператор присваивания
    DynamicArray& operator=(const DynamicArray& other) {
        if (this == &other) return *this;  // Проверка на самоприсваивание
        
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

## Часть 5: Геттеры и сеттеры

Геттеры и сеттеры контролируют доступ к приватным данным:

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
    // Конструктор
    Character(const std::string& n, int h, int l) 
        : name(n), health(h), maxHealth(h), level(l) {}
    
    // Геттеры (получение данных)
    std::string getName() const { return name; }
    int getHealth() const { return health; }
    int getMaxHealth() const { return maxHealth; }
    int getLevel() const { return level; }
    
    // Сеттеры (установка данных с проверкой)
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
    
    // Специальные методы
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
    
    hero.setHealth(150);  // Игнорируется (выходит за maxHealth)
    hero.setName("");     // Игнорируется (пустое имя)
    hero.setName("Aragorn");
    hero.display();
    
    return 0;
}
```

---

## Часть 6: Статические члены

Статические члены принадлежат классу, а не конкретным объектам.

```cpp
#include <iostream>
#include <string>

class Enemy {
private:
    std::string name;
    int health;
    static int totalEnemies;   // Общее количество врагов (статика)
    
public:
    Enemy(const std::string& n, int h) : name(n), health(h) {
        totalEnemies++;
        std::cout << "Spawned " << name << "! Total enemies: " << totalEnemies << std::endl;
    }
    
    ~Enemy() {
        totalEnemies--;
        std::cout << "Defeated " << name << "! Remaining enemies: " << totalEnemies << std::endl;
    }
    
    // Статический метод
    static int getTotalEnemies() {
        return totalEnemies;
    }
};

// Инициализация статической переменной (вне класса!)
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

## Часть 7: Дружественные функции и классы

Иногда нужно дать доступ к приватным членам внешним функциям или классам.

```cpp
#include <iostream>
#include <string>

class Player;

// Функция, объявленная дружественной
void displayFullInfo(const Player& p);

class Player {
private:
    std::string name;
    int health;
    int level;
    
    // Дружественная функция
    friend void displayFullInfo(const Player& p);
    
    // Дружественный класс
    friend class GameManager;
    
public:
    Player(const std::string& n, int h, int l) 
        : name(n), health(h), level(l) {}
};

// Дружественная функция имеет доступ к private
void displayFullInfo(const Player& p) {
    std::cout << "Name: " << p.name << std::endl;
    std::cout << "Health: " << p.health << std::endl;
    std::cout << "Level: " << p.level << std::endl;
}

class GameManager {
public:
    // Дружественный класс имеет доступ к private
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

## Часть 8: Композиция

Композиция — когда один класс содержит объекты другого класса.

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

## Полный пример: RPG Система с классами

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <memory>

// Перечисления
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

// Базовый класс Entity
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
    
    virtual void attack(Entity& target) = 0;  // Чисто виртуальный метод
};

// Класс оружия
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

// Класс персонажа
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

// Класс врага
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

// Класс для управления битвой
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
    
    // Создание оружия
    Weapon sword("Iron Sword", 25);
    Weapon staff("Magic Staff", 20, DamageType::MAGIC);
    Weapon dagger("Shadow Dagger", 18);
    
    // Создание персонажа
    auto hero = std::make_shared<Character>("Kaelen", CharacterClass::WARRIOR, sword);
    hero->addWeapon(dagger);
    
    // Создание битвы
    BattleSystem battle(hero);
    
    // Добавление врагов
    battle.addEnemy(std::make_shared<Enemy>("Goblin", 30, 8, 50));
    battle.addEnemy(std::make_shared<Enemy>("Orc", 50, 12, 75));
    battle.addEnemy(std::make_shared<Enemy>("Troll", 80, 15, 100));
    
    // Начало битвы
    battle.startBattle();
    
    return 0;
}
```

---

## Частые ошибки

### 1. Забытая точка с запятой после класса

```cpp
// ❌ Ошибка
class Player {
    // ...
}  // Пропущена ;

// ✅ Правильно
class Player {
    // ...
};  // Точка с запятой обязательна
```

### 2. Использование методов до инициализации

```cpp
// ❌ Неинициализированный объект
Player hero;  // Вызовет конструктор по умолчанию, если он есть
hero.setName("Kaelen");

// ✅ Правильно
Player hero("Kaelen", 100, 1);  // Инициализация в конструкторе
```

### 3. Виртуальные функции без виртуального деструктора

```cpp
// ❌ Опасно — деструктор базового класса не виртуальный
class Base { };
class Derived : public Base { };

Base* obj = new Derived();
delete obj;  // Вызовет только деструктор Base! Утечка памяти.

// ✅ Правильно
class Base {
public:
    virtual ~Base() {}
};
```

### 4. Копирование классов с динамической памятью

```cpp
// ❌ Поверхностное копирование — оба объекта указывают на одну память
class Array {
    int* data;
public:
    Array(int size) { data = new int[size]; }
    ~Array() { delete[] data; }
};

Array a(10);
Array b = a;  // Два объекта указывают на одну память → double delete!

// ✅ Используйте правило трёх или запретите копирование
```

---

## Шпаргалка

```cpp
// Класс
class ClassName {
private:
    // Скрытые члены
    
protected:
    // Доступны наследникам
    
public:
    // Публичный интерфейс
    
    // Конструкторы
    ClassName();                    // По умолчанию
    ClassName(параметры);           // С параметрами
    
    // Деструктор
    ~ClassName();
    
    // Методы
    void method();
    void constMethod() const;
    static void staticMethod();
};

// Создание объектов
ClassName obj;                      // Конструктор по умолчанию
ClassName obj(параметры);           // С параметрами
ClassName* ptr = new ClassName();   // Динамически

// Доступ к членам
obj.method();
obj.member = value;
ptr->method();
ptr->member = value;

// Наследование
class Derived : public Base {
    // ...
};

// Виртуальные функции
class Base {
    virtual void func();            // Может быть переопределён
    virtual void pureFunc() = 0;    // Чисто виртуальный
};
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Создайте класс `Circle` с приватным радиусом. Реализуйте методы для вычисления площади, длины окружности и диаметра.

**Упражнение 2 (Среднее):** Создайте класс `BankAccount` с приватными балансом и владельцем. Реализуйте методы для депозита, снятия (с проверкой), отображения баланса и истории транзакций.

**Упражнение 3 (Среднее):** Создайте иерархию классов для геометрических фигур. Базовый класс `Shape` с виртуальными методами `area()` и `perimeter()`. Наследники: `Rectangle`, `Circle`, `Triangle`.

**Упражнение 4 (Сложное):** Создайте класс `Deck` для колоды карт. Используйте композицию для хранения 52 карт. Реализуйте методы для перемешивания, раздачи карты, проверки размера.

**Упражнение 5 (Сложное):** Создайте класс `GameEngine` с игровым циклом. Используйте композицию для управления объектами игры (игрок, враги, предметы). Реализуйте обновление и отрисовку.

**Упражнение 6 (Вызов):** Создайте систему "Квестов" с классами `Quest`, `QuestManager` и `QuestReward`. Используйте наследование для разных типов квестов (убить врагов, собрать предметы, исследовать локации). Реализуйте отслеживание прогресса и награды.

---

## Резюме

Теперь вы знаете:

✅ Что такое классы и чем они отличаются от структур  
✅ Уровни доступа: `public`, `private`, `protected`  
✅ Конструкторы и деструкторы  
✅ Геттеры и сеттеры  
✅ Статические члены класса  
✅ Дружественные функции и классы  
✅ Композиция — классы внутри классов  
✅ Наследование и виртуальные функции  
✅ Полная RPG система с классами  

---

## Ресурсы

- [Классы C++ (cppreference)](https://en.cppreference.com/w/cpp/language/classes)
- [Объектно-ориентированное программирование (learncpp)](https://www.learncpp.com/cpp-tutorial/object-oriented-programming/)

---

**Практическое задание:** Создайте систему "Управление персонажами" для RPG. Используйте классы для персонажа, класса персонажа, инвентаря и способностей. Реализуйте наследование для разных классов (Воин, Маг, Разбойник). Добавьте систему прокачки и смены оружия. Это объединит всё, что вы узнали о классах!