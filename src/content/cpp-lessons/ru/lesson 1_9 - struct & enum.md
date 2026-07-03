---
title: "Структуры и перечисления — создание собственных типов"
description: "Организуйте связанные данные и создавайте пользовательские типы"
pubDate: 2026-06-01
tags: ["C++", "beginner", "structs", "enums", "custom-types"]
lang: "ru"
lessonNumber: 9
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Урок 9: Структуры и перечисления — создание собственных типов

Добро пожаловать обратно! До сих пор мы использовали базовые типы, такие как `int`, `float` и `string`. Но настоящим играм нужно представлять сложные вещи — игроков, врагов, оружие, заклинания. **Структуры** группируют связанные данные, а **перечисления** создают именованные константы. Давайте создадим их!

## Что вы изучите

- **Структуры** — создание пользовательских типов данных, которые группируют несколько значений
- **Перечисления** — именованные константы для состояний, типов и опций
- **Классы перечислений** — типобезопасные перечисления (C++11 и новее)
- Собираем всё вместе — RPG система персонажей
- Лучшие практики и распространённые паттерны

---

## Часть 1: Зачем нужны структуры?

Без структур отслеживание игрока означает множество отдельных переменных:

```cpp
// ❌ Без структур — беспорядок!
std::string playerName = "Каэлен";
int playerHealth = 100;
int playerMana = 50;
float playerX = 10.0f;
float playerY = 20.0f;
int playerLevel = 5;
std::vector<std::string> playerInventory;

// При каждом вызове функции — множество параметров
void displayPlayer(std::string name, int health, int mana, float x, float y, int level) {
    // ...
}
```

**Со структурами — чисто!**

```cpp
// ✅ Со структурами — организованно!
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
player.name = "Каэлен";
player.health = 100;

void displayPlayer(const Player& p) {
    // Один параметр для всего!
}
```

---

## Часть 2: Базовые структуры

```cpp
#include <iostream>
#include <string>

// Определение структуры (обычно вне main, часто в заголовочном файле)
struct Enemy {
    std::string name;
    int health;
    int damage;
    float x;
    float y;
};

int main() {
    // Создание экземпляра Enemy
    Enemy goblin;
    goblin.name = "Гоблин-лучник";
    goblin.health = 30;
    goblin.damage = 8;
    goblin.x = 15.0f;
    goblin.y = 25.0f;
    
    // Доступ к членам с помощью оператора точки
    std::cout << "Враг: " << goblin.name << std::endl;
    std::cout << "Здоровье: " << goblin.health << std::endl;
    std::cout << "Урон: " << goblin.damage << std::endl;
    std::cout << "Позиция: (" << goblin.x << ", " << goblin.y << ")" << std::endl;
    
    // Изменение членов
    goblin.health -= 15;
    std::cout << "\nПосле удара! Здоровье: " << goblin.health << std::endl;
    
    return 0;
}
```

**Вывод:**
```
Враг: Гоблин-лучник
Здоровье: 30
Урон: 8
Позиция: (15, 25)

После удара! Здоровье: 15
```

---

## Часть 3: Инициализация структур

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
    // Метод 1: Поэлементно (наиболее распространённый)
    Weapon sword;
    sword.name = "Длинный меч";
    sword.damage = 25;
    sword.weight = 3.5f;
    sword.isMagic = false;
    
    // Метод 2: Агрегатная инициализация (C++11)
    Weapon bow = {"Эльфийский лук", 18, 2.0f, true};
    
    // Метод 3: Именованные инициализаторы (C++20, более читаемо)
    Weapon axe = {
        .name = "Дварфийский топор",
        .damage = 30,
        .weight = 6.0f,
        .isMagic = true
    };
    
    // Сложная структура
    Character hero = {
        .name = "Арагорн",
        .health = 120,
        .mana = 0,
        .equipped = sword,
        .inventory = {"Зелье здоровья", "Зелье маны", "Ключ"}
    };
    
    std::cout << hero.name << " владеет " << hero.equipped.name 
              << " (урон: " << hero.equipped.damage << ")" << std::endl;
    
    return 0;
}
```

---

## Часть 4: Структуры с функциями

```cpp
#include <iostream>
#include <string>

struct Player {
    std::string name;
    int health;
    int maxHealth;
    int strength;
};

// Передача по ссылке для изменения
void heal(Player& player, int amount) {
    player.health += amount;
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    std::cout << player.name << " вылечен до " << player.health << " HP!" << std::endl;
}

// Передача по значению (копия) — не изменяет оригинал
void displayPlayer(Player p) {
    std::cout << "Имя: " << p.name << std::endl;
    std::cout << "Здоровье: " << p.health << "/" << p.maxHealth << std::endl;
}

// Передача по константной ссылке (только чтение, без копирования)
int calculateDamage(const Player& attacker, int baseDamage) {
    return baseDamage + (attacker.strength / 5);
}

int main() {
    Player hero = {"Каэлен", 75, 100, 18};
    
    displayPlayer(hero);
    std::cout << "Урон: " << calculateDamage(hero, 15) << std::endl;
    heal(hero, 30);
    
    return 0;
}
```

---

## Часть 5: Вложенные структуры

Структуры могут содержать другие структуры — идеально для сложных игровых объектов.

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
    hero.name = "Геральт";
    hero.health = 100;
    hero.position = {100.0f, 200.0f};
    hero.inventory.gold = 500;
    hero.inventory.maxWeight = 100;
    hero.inventory.items = {
        {"Серебряный меч", 1000, 5.0f},
        {"Зелье здоровья", 50, 0.5f},
        {"Кожаная броня", 200, 8.0f}
    };
    
    // Доступ к вложенным членам
    std::cout << "Игрок: " << hero.name << std::endl;
    std::cout << "Позиция: (" << hero.position.x << ", " << hero.position.y << ")" << std::endl;
    std::cout << "Золото: " << hero.inventory.gold << std::endl;
    std::cout << "Первый предмет: " << hero.inventory.items[0].name << std::endl;
    
    return 0;
}
```

---

## Часть 6: Перечисления — именованные константы

Перечисления дают имена связанным константам.

```cpp
#include <iostream>

// Базовое перечисление
enum Difficulty {
    EASY,     // 0
    NORMAL,   // 1
    HARD,     // 2
    NIGHTMARE // 3
};

// Указание значений
enum Element {
    FIRE = 1,
    WATER = 2,
    EARTH = 3,
    AIR = 4
};

// Непоследовательные значения
enum Status {
    IDLE = 0,
    MOVING = 5,
    ATTACKING = 10,
    DEAD = 99
};

int main() {
    Difficulty gameDifficulty = HARD;
    
    if (gameDifficulty == HARD) {
        std::cout << "Готовьтесь к испытанию!" << std::endl;
    }
    
    // Перечисления внутри являются целыми числами
    std::cout << "Значение HARD: " << HARD << std::endl;
    std::cout << "Значение WATER: " << WATER << std::endl;
    
    // Switch с перечислением
    switch (gameDifficulty) {
        case EASY:
            std::cout << "Режим для новичков" << std::endl;
            break;
        case NORMAL:
            std::cout << "Стандартный опыт" << std::endl;
            break;
        case HARD:
            std::cout << "Только для ветеранов" << std::endl;
            break;
        case NIGHTMARE:
            std::cout << "Вы, должно быть, безумны!" << std::endl;
            break;
    }
    
    return 0;
}
```

---

## Часть 7: Классы перечислений (типобезопасные перечисления)

У традиционных перечислений есть проблемы — они засоряют глобальное пространство имён и их можно случайно сравнивать с целыми числами.

```cpp
// ❌ Проблемы с традиционными перечислениями
enum Color { RED, GREEN, BLUE };
enum TrafficLight { RED, YELLOW, GREEN };  // ОШИБКА! RED и GREEN уже определены

int x = RED;  // Разрешено — можно преобразовать в int
if (RED == 0) { }  // Сравнение перечисления с int
```

**Классы перечислений** (C++11) решают эти проблемы:

```cpp
#include <iostream>

// ✅ Класс перечисления — типобезопасный, с областью видимости
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
    Color c = Color::RED;           // Обязательно с областью видимости
    TrafficLight t = TrafficLight::GREEN;
    
    // int x = Color::RED;          // ❌ ОШИБКА! Нельзя преобразовать в int
    // if (c == t) { }              // ❌ ОШИБКА! Разные типы
    
    if (c == Color::RED) {          // ✅ Сравнивать нужно только одинаковые типы
        std::cout << "Это красный!" << std::endl;
    }
    
    // Преобразование в целое число, если нужно
    int redValue = static_cast<int>(Color::RED);
    std::cout << "Значение RED: " << redValue << std::endl;
    
    return 0;
}
```

### Игровой пример: Состояния персонажа

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
        case CharacterState::IDLE:      return "Ожидание";
        case CharacterState::WALKING:   return "Ходьба";
        case CharacterState::RUNNING:   return "Бег";
        case CharacterState::JUMPING:   return "Прыжок";
        case CharacterState::ATTACKING: return "Атака";
        case CharacterState::HURT:      return "Ранен";
        case CharacterState::DEAD:      return "Мёртв";
        default:                        return "Неизвестно";
    }
}

int main() {
    GameCharacter hero = {"Каэлен", 100, CharacterState::IDLE, ElementalType::FIRE};
    
    std::cout << hero.name << " находится в состоянии " << stateToString(hero.state) << std::endl;
    
    // Изменение состояния
    hero.state = CharacterState::ATTACKING;
    std::cout << hero.name << " начинает " << stateToString(hero.state) << "!" << std::endl;
    
    return 0;
}
```

---

## Полный пример: RPG система персонажей

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>

// Перечисления
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

// Структуры
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

// Объявления функций
Character createCharacter();
void displayCharacter(const Character& c);
void levelUp(Character& c);
void addItem(Character& c, const Item& item);
void displayInventory(const Character& c);
std::string classToString(CharacterClass cc);
std::string itemTypeToString(ItemType it);

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Создание героя
    Character hero = createCharacter();
    
    // Создание предметов
    Item sword = {"Железный меч", ItemType::WEAPON, 100, 15, "Прочный железный клинок"};
    Item potion = {"Зелье здоровья", ItemType::CONSUMABLE, 50, 20, "Восстанавливает 20 HP"};
    Item armor = {"Кожаная броня", ItemType::ARMOR, 80, 5, "Лёгкая защита"};
    
    // Добавление предметов в инвентарь
    addItem(hero, sword);
    addItem(hero, potion);
    addItem(hero, armor);
    addItem(hero, {"Золотое кольцо", ItemType::QUEST, 200, 0, "Таинственное кольцо"});
    
    // Отображение персонажа
    displayCharacter(hero);
    displayInventory(hero);
    
    // Симуляция повышения уровня
    std::cout << "\n=== ПОВЫШЕНИЕ УРОВНЯ! ===" << std::endl;
    hero.level = 2;
    levelUp(hero);
    displayCharacter(hero);
    
    return 0;
}

Character createCharacter() {
    Character c;
    
    std::cout << "=== СОЗДАНИЕ ПЕРСОНАЖА ===" << std::endl;
    std::cout << "Введите имя: ";
    std::getline(std::cin, c.name);
    
    std::cout << "\nВыберите класс:" << std::endl;
    std::cout << "1. Воин (Высокий HP, Сила)" << std::endl;
    std::cout << "2. Маг (Высокая мана, Интеллект)" << std::endl;
    std::cout << "3. Разбойник (Сбалансированный, Ловкость)" << std::endl;
    std::cout << "4. Жрец (Лечение, Поддержка)" << std::endl;
    std::cout << "Выбор: ";
    
    int classChoice;
    std::cin >> classChoice;
    
    // Базовые характеристики (изменяются классом)
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
    std::cout << "\n=== ЛИСТ ПЕРСОНАЖА ===" << std::endl;
    std::cout << "Имя: " << c.name << std::endl;
    std::cout << "Класс: " << classToString(c.characterClass) << std::endl;
    std::cout << "Уровень: " << c.level << std::endl;
    std::cout << "Здоровье: " << c.health << "/" << c.maxHealth << std::endl;
    std::cout << "Мана: " << c.mana << "/" << c.maxMana << std::endl;
    std::cout << "Золото: " << c.gold << std::endl;
    std::cout << "\nХарактеристики:" << std::endl;
    std::cout << "  Сила: " << c.stats.strength << std::endl;
    std::cout << "  Ловкость: " << c.stats.dexterity << std::endl;
    std::cout << "  Интеллект: " << c.stats.intelligence << std::endl;
    std::cout << "  Живучесть: " << c.stats.vitality << std::endl;
}

void levelUp(Character& c) {
    c.maxHealth += 20;
    c.maxMana += 10;
    c.health = c.maxHealth;
    c.mana = c.maxMana;
    
    // Увеличение характеристик в зависимости от класса
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
    std::cout << "Добавлен " << item.name << " в инвентарь!" << std::endl;
}

void displayInventory(const Character& c) {
    std::cout << "\n=== ИНВЕНТАРЬ ===" << std::endl;
    std::cout << "Золото: " << c.gold << std::endl;
    
    if (c.inventory.empty()) {
        std::cout << "Инвентарь пуст!" << std::endl;
        return;
    }
    
    for (size_t i = 0; i < c.inventory.size(); i++) {
        const Item& item = c.inventory[i];
        std::cout << i+1 << ". " << item.name << " [" << itemTypeToString(item.type) << "]";
        std::cout << " - Цена: " << item.value;
        if (item.powerBonus > 0) {
            std::cout << " (+" << item.powerBonus << " силы)";
        }
        std::cout << std::endl;
    }
}

std::string classToString(CharacterClass cc) {
    switch (cc) {
        case CharacterClass::WARRIOR: return "Воин";
        case CharacterClass::MAGE:    return "Маг";
        case CharacterClass::ROGUE:   return "Разбойник";
        case CharacterClass::CLERIC:  return "Жрец";
        default:                      return "Неизвестно";
    }
}

std::string itemTypeToString(ItemType it) {
    switch (it) {
        case ItemType::WEAPON:     return "Оружие";
        case ItemType::ARMOR:      return "Броня";
        case ItemType::CONSUMABLE: return "Расходник";
        case ItemType::QUEST:      return "Квестовый предмет";
        default:                   return "Неизвестно";
    }
}
```

---

## Частые ошибки

### 1. Забытая точка с запятой после структуры

```cpp
// ❌ Пропущена точка с запятой
struct Player {
    int health;
    int mana;
}  // ОШИБКА!

// ✅ Правильно
struct Player {
    int health;
    int mana;
};  // Точка с запятой обязательна!
```

### 2. Передача по значению для больших структур

```cpp
// ❌ Копирует всю структуру (медленно)
void processPlayer(Player p) { }

// ✅ Передача по константной ссылке (быстро, только чтение)
void processPlayer(const Player& p) { }

// ✅ Передача по ссылке (быстро, можно изменять)
void modifyPlayer(Player& p) { }
```

### 3. Использование обычных перечислений в switch без `default`

```cpp
enum class Color { RED, GREEN, BLUE };

void describe(Color c) {
    switch (c) {
        case Color::RED:   // ...
        case Color::GREEN: // ...
        // Пропущены BLUE и default!
    }
}
```

### 4. Сравнение разных типов перечислений

```cpp
enum class A { VALUE };
enum class B { VALUE };

if (A::VALUE == B::VALUE) {  // ❌ ОШИБКА! Разные типы
```

---

## Шпаргалка

```cpp
// Определение структуры
struct StructName {
    Type member1;
    Type member2;
};

// Создание экземпляра
StructName variable;
variable.member1 = значение;

// Инициализация
StructName var = {значение1, значение2};           // Агрегатная
StructName var = {.member1 = значение1};        // Именованная (C++20)

// Перечисление (традиционное)
enum Name { VALUE1, VALUE2, VALUE3 };
enum Name { VALUE1 = 10, VALUE2 = 20 };

// Класс перечисления (типобезопасное)
enum class Name {
    VALUE1,
    VALUE2,
    VALUE3
};
Name var = Name::VALUE1;

// Преобразование класса перечисления в int
int value = static_cast<int>(Name::VALUE1);
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Определите `struct Point` с координатами x и y. Создайте функцию `float distance(Point a, Point b)`, которая вычисляет расстояние между двумя точками.

**Упражнение 2 (Лёгкое):** Создайте `enum class Season { SPRING, SUMMER, FALL, WINTER }`. Напишите функцию, возвращающую среднюю температуру для каждого сезона.

**Упражнение 3 (Среднее):** Создайте `struct Card` для карточной игры с мастью и достоинством (используйте перечисления). Создайте `struct Deck` с вектором карт. Добавьте функции для перетасовки и выдачи карты.

**Упражнение 4 (Среднее):** Создайте `struct Rectangle` с шириной, высотой и позицией (x, y). Добавьте функции: площадь, периметр, containsPoint(x, y), intersects(other).

**Упражнение 5 (Сложное):** Создайте "Систему квестов" с:
- `enum class QuestStatus { NOT_STARTED, ACTIVE, COMPLETED, FAILED }`
- `struct Quest` с именем, описанием, наградой, статусом, списком целей
- Функции для начала, обновления прогресса, завершения и отображения журнала квестов

**Упражнение 6 (Вызов):** Создайте "Пошаговую боевую систему" с использованием структур для персонажа, способностей и битвы. Используйте перечисления для состояний и типов урона. Включите нескольких персонажей, способности с перезарядкой и статусные эффекты.

---

## Резюме

Теперь вы знаете:

✅ **Структуры** — группировка связанных данных в пользовательские типы  
✅ **Вложенные структуры** — построение сложных структур данных  
✅ **Перечисления** — создание именованных констант для состояний и типов  
✅ **Классы перечислений** — типобезопасные перечисления с областью видимости  
✅ Полный пример RPG системы персонажей  
✅ Когда использовать каждый инструмент  

## Что дальше?

Следующий урок: **Ввод/вывод в файлы** — сохранение и загрузка игровых данных, запись логов и сохранение прогресса игрока!

---

## Ресурсы

- [Структуры C++ (cppreference)](https://en.cppreference.com/w/cpp/language/struct)
- [Перечисления C++ (cppreference)](https://en.cppreference.com/w/cpp/language/enum)

---

**Практическое задание:** Создайте "Систему сохранения игры" с использованием структур. Определите структуру `SaveData`, содержащую статистику игрока, инвентарь, прогресс квестов и состояние мира. Напишите функции для сохранения в файл и загрузки из файла. Это идеально подводит к следующему уроку о вводе/выводе в файлы!