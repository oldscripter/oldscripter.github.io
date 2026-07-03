---
title: "Функции — переиспользуемые блоки кода"
description: "Организуйте код, избегайте повторений и создавайте сложные системы с помощью функций"
pubDate: 2026-06-01
tags: ["C++", "beginner", "functions", "reusability", "modularity"]
lang: "ru"
lessonNumber: 8
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Урок 8: Функции — переиспользуемые блоки кода

Добро пожаловать обратно! До сих пор мы писали весь код в `main()`. Но по мере роста программ это становится неуправляемым. **Функции** позволяют нам разбивать код на переиспользуемые, тестируемые и читаемые части.

## Что вы изучите

- Что такое функции и зачем они нужны
- Объявление, определение и вызов функций
- Параметры и аргументы (передача по значению vs по ссылке)
- Возвращаемые значения
- Перегрузка функций
- Параметры по умолчанию
- Область видимости и время жизни переменных

---

## Часть 1: Зачем нужны функции?

Представьте, что вы рассчитываете урон в RPG. Без функций вам придётся копировать один и тот же код повсюду:

```cpp
// ❌ БЕЗ функций — ужасно!
int main() {
    // Первый бой
    int damage1 = 15 + rand() % 10;
    int final1 = damage1 * 2;  // Проверка крита
    enemyHealth -= final1;
    
    // Позже, другой бой — тот же код снова!
    int damage2 = 15 + rand() % 10;
    int final2 = damage2 * 2;
    anotherEnemyHealth -= final2;
    
    // И снова... и снова...
}
```

**С функциями:**

```cpp
// ✅ С функциями — чисто!
int calculateDamage(int baseDamage) {
    int damage = baseDamage + rand() % 10;
    bool isCritical = (rand() % 100) < 20;
    return isCritical ? damage * 2 : damage;
}

int main() {
    enemyHealth -= calculateDamage(15);
    anotherEnemyHealth -= calculateDamage(15);
    bossHealth -= calculateDamage(25);  // Другая база, та же логика!
}
```

---

## Часть 2: Анатомия функции

```cpp
// return_type function_name(parameter_list) {
//     body
//     return value;
// }

int add(int a, int b) {
    return a + b;
}
```

### Разбор по частям

| Часть | Пример | Назначение |
|------|---------|------------|
| Тип возврата | `int` | Тип возвращаемого значения (используйте `void`, если ничего не возвращается) |
| Имя функции | `add` | Как вы вызываете функцию |
| Параметры | `(int a, int b)` | Входные значения (может быть ноль или больше) |
| Тело | `{ return a + b; }` | Код, который выполняется при вызове |
| Возврат | `return` | Отправляет значение обратно вызывающему коду |

---

## Часть 3: Ваши первые функции

```cpp
#include <iostream>

// Простая функция — без параметров, без возврата
void sayHello() {
    std::cout << "Привет, искатель приключений!" << std::endl;
}

// Функция с параметром, без возврата
void greetPlayer(std::string name) {
    std::cout << "Добро пожаловать, " << name << "!" << std::endl;
}

// Функция с параметрами и возвратом
int add(int x, int y) {
    return x + y;
}

// Функция, возвращающая значение для использования
int calculateExperience(int level, int enemyDifficulty) {
    int baseXP = 50;
    int xp = baseXP + (level * 10) + (enemyDifficulty * 20);
    return xp;
}

int main() {
    sayHello();
    greetPlayer("Станислав");
    
    int result = add(5, 3);
    std::cout << "5 + 3 = " << result << std::endl;
    
    int xp = calculateExperience(5, 3);
    std::cout << "Вы получили " << xp << " XP!" << std::endl;
    
    // Можно использовать функцию напрямую
    std::cout << "10 + 20 = " << add(10, 20) << std::endl;
    
    return 0;
}
```

**Вывод:**
```
Привет, искатель приключений!
Добро пожаловать, Станислав!
5 + 3 = 8
Вы получили 160 XP!
10 + 20 = 30
```

---

## Часть 4: Передача по значению vs по ссылке

### Передача по значению (по умолчанию) — создаётся копия

```cpp
void modifyValue(int x) {
    x = 100;  // Изменяет КОПИЮ, не оригинал
}

int main() {
    int health = 50;
    modifyValue(health);
    std::cout << health;  // Всё ещё 50 — без изменений!
}
```

### Передача по ссылке (`&`) — изменение оригинала

```cpp
void heal(int& health, int amount) {
    health += amount;  // Изменяет ФАКТИЧЕСКУЮ переменную
}

int main() {
    int playerHealth = 50;
    heal(playerHealth, 30);
    std::cout << playerHealth;  // 80 — изменилось!
}
```

### Реальный игровой пример

```cpp
#include <iostream>
#include <string>

// Передача по значению — нам нужно только значение, изменять не нужно
void displayStats(std::string name, int health, int mana) {
    std::cout << name << " — HP: " << health << " | MP: " << mana << std::endl;
}

// Передача по ссылке — мы хотим ИЗМЕНИТЬ оригинал
void takeDamage(int& health, int damage) {
    health -= damage;
    if (health < 0) health = 0;
    std::cout << "Получено " << damage << " урона! Здоровье: " << health << std::endl;
}

// Передача по ссылке — избегаем копирования больших объектов (const для чтения)
void printInventory(const std::vector<std::string>& items) {
    for (const auto& item : items) {
        std::cout << "- " << item << std::endl;
    }
}

int main() {
    std::string playerName = "Каэлен";
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

**Вывод:**
```
Каэлен — HP: 100 | MP: 50
Получено 35 урона! Здоровье: 65
Каэлен — HP: 65 | MP: 50
Получено 80 урона! Здоровье: 0
Каэлен — HP: 0 | MP: 50
```

---

## Часть 5: Возвращаемые значения — несколько способов

### Один возврат (наиболее распространённый)

```cpp
int square(int x) {
    return x * x;
}
```

### Ранний возврат (охранные условия)

```cpp
int divide(int a, int b) {
    if (b == 0) {
        std::cerr << "Ошибка: Деление на ноль!" << std::endl;
        return 0;  // Ранний возврат при ошибке
    }
    return a / b;  // Нормальный возврат
}
```

### Возврат нескольких значений (через ссылки)

```cpp
// Вычисление суммы и произведения
void calculate(int a, int b, int& sum, int& product) {
    sum = a + b;
    product = a * b;
}

int main() {
    int s, p;
    calculate(5, 3, s, p);
    std::cout << "Сумма: " << s << ", Произведение: " << p << std::endl;
    return 0;
}
```

---

## Часть 6: Объявление vs определение функции

**Объявление** (прототип) — сообщает компилятору "эта функция существует"
**Определение** (реализация) — фактический код

```cpp
#include <iostream>

// Объявления (обычно в заголовочных файлах)
int add(int a, int b);
void printMessage(const std::string& msg);
float calculateDamage(float base, float multiplier);

// Определения (обычно в .cpp файлах)
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
    printMessage("Привет!");
    std::cout << calculateDamage(15.0f, 2.0f) << std::endl;
    return 0;
}
```

**Зачем объявлять отдельно?** Можно поместить объявления в начало, а определения куда угодно (даже в разные файлы). Так организованы большие проекты.

---

## Часть 7: Перегрузка функций

Несколько функций с **одинаковым именем**, но разными параметрами.

```cpp
#include <iostream>

// Разные типы параметров
int add(int a, int b) {
    return a + b;
}

float add(float a, float b) {
    return a + b;
}

// Разное количество параметров
int add(int a, int b, int c) {
    return a + b + c;
}

int main() {
    std::cout << add(5, 3) << std::endl;           // Вызов int версии
    std::cout << add(5.5f, 3.2f) << std::endl;     // Вызов float версии
    std::cout << add(1, 2, 3) << std::endl;        // Вызов 3-параметрической версии
    return 0;
}
```

**Игровой пример: Расчёт урона**

```cpp
// Стандартный урон
int calculateDamage(int baseDamage) {
    return baseDamage + rand() % 10;
}

// Урон с элементом
int calculateDamage(int baseDamage, float elementalBonus) {
    return static_cast<int>((baseDamage + rand() % 10) * elementalBonus);
}

// Урон с шансом крита
int calculateDamage(int baseDamage, int criticalChance, int criticalMultiplier) {
    int damage = baseDamage + rand() % 10;
    if ((rand() % 100) < criticalChance) {
        damage *= criticalMultiplier;
    }
    return damage;
}
```

---

## Часть 8: Параметры по умолчанию

Задайте параметрам значения по умолчанию.

```cpp
#include <iostream>

void heal(int& health, int amount = 20) {  // Лечение по умолчанию = 20
    health += amount;
}

void logMessage(const std::string& message, int importance = 1) {
    std::cout << "[Уровень " << importance << "] " << message << std::endl;
}

int main() {
    int hp = 50;
    
    heal(hp);           // Использует значение по умолчанию 20 → hp становится 70
    heal(hp, 50);       // Использует 50 → hp становится 120
    
    logMessage("Игрок присоединился");           // Уровень 1
    logMessage("Критическая ошибка!", 5);      // Уровень 5
    
    return 0;
}
```

**⚠️ Правила для параметров по умолчанию:**
1. Должны идти справа налево (нельзя пропускать)
2. ```cpp
   // ✅ Правильно
   void func(int a, int b = 10, int c = 20);
   
   // ❌ Неправильно
   void func(int a = 10, int b, int c = 20);  // Нельзя ставить параметр без умолчания после параметра с умолчанием
   ```

---

## Часть 9: Область видимости и время жизни

Где "живут" переменные — имеет значение!

```cpp
#include <iostream>

int globalScore = 1000;  // Глобальная — живёт всю программу

void myFunction() {
    int localVar = 42;    // Локальная — умирает, когда функция завершается
    static int staticVar = 0;  // Статическая — сохраняет значение между вызовами
    staticVar++;
    
    std::cout << "Статическая: " << staticVar << std::endl;
    std::cout << "Глобальная в функции: " << globalScore << std::endl;
}

int main() {
    int localMain = 10;   // Локальная для main
    
    myFunction();  // Статическая: 1
    myFunction();  // Статическая: 2
    myFunction();  // Статическая: 3
    
    // std::cout << localVar;  // ОШИБКА! localVar здесь не существует
    
    return 0;
}
```

### Сводка по области видимости переменных

| Тип | Область видимости | Время жизни | Когда использовать |
|------|-------|----------|-------------|
| Локальная | Внутри функции | Вызов функции | По умолчанию — большинство переменных |
| Статическая локальная | Внутри функции | Вся программа | Счётчик вызовов, сохранение состояния |
| Глобальная | Везде | Вся программа | Редко — конфигурация, константы |
| Параметр | Внутри функции | Вызов функции | Входные значения |

---

## Полный пример: RPG боевая система с функциями

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>

// Константы
const int MAX_HEALTH = 100;
const int CRITICAL_CHANCE = 20;  // 20%

// Объявления функций
int calculateDamage(int baseDamage, int strength);
int calculateDamage(int baseDamage, int strength, float elementalBonus);
void applyDamage(int& health, int damage);
bool isCriticalHit();
std::string getCombatMessage(int damage, bool isCritical);
void displayBattleStatus(const std::string& playerName, int playerHealth, 
                         const std::string& enemyName, int enemyHealth);

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Характеристики игрока
    std::string playerName = "Каэлен";
    int playerHealth = MAX_HEALTH;
    int playerStrength = 15;
    
    // Характеристики врага
    std::string enemyName = "Дракон";
    int enemyHealth = 150;
    int enemyStrength = 20;
    
    std::cout << "=== ЭПИЧЕСКИЙ БОЙ ===" << std::endl;
    std::cout << playerName << " против " << enemyName << "!\n" << std::endl;
    
    int turn = 0;
    while (playerHealth > 0 && enemyHealth > 0) {
        turn++;
        std::cout << "\n--- Ход " << turn << " ---" << std::endl;
        displayBattleStatus(playerName, playerHealth, enemyName, enemyHealth);
        
        // Ход игрока
        int playerDamage = calculateDamage(15, playerStrength);
        bool playerCrit = isCriticalHit();
        if (playerCrit) playerDamage *= 2;
        
        std::cout << getCombatMessage(playerDamage, playerCrit);
        applyDamage(enemyHealth, playerDamage);
        
        if (enemyHealth <= 0) {
            std::cout << "\n✦ ПОБЕДА! " << enemyName << " повержен! ✦" << std::endl;
            break;
        }
        
        // Ход врага
        int enemyDamage = calculateDamage(12, enemyStrength);
        bool enemyCrit = isCriticalHit();
        if (enemyCrit) enemyDamage *= 2;
        
        std::cout << enemyName << " атакует на " << enemyDamage << " урона";
        if (enemyCrit) std::cout << " (КРИТ!)";
        std::cout << "!" << std::endl;
        
        applyDamage(playerHealth, enemyDamage);
        
        if (playerHealth <= 0) {
            std::cout << "\n✗ ПОРАЖЕНИЕ! " << playerName << " пал... ✗" << std::endl;
            break;
        }
    }
    
    return 0;
}

// Определения функций
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
        return "⚡ КРИТИЧЕСКИЙ УДАР! ⚡ Вы наносите " + std::to_string(damage) + " урона! ";
    }
    return "Вы наносите " + std::to_string(damage) + " урона! ";
}

void displayBattleStatus(const std::string& playerName, int playerHealth, 
                         const std::string& enemyName, int enemyHealth) {
    std::cout << "\n" << playerName << " ❤️ " << playerHealth << "/" << MAX_HEALTH << std::endl;
    std::cout << enemyName << " ❤️ " << enemyHealth << "/150" << std::endl;
}
```

---

## Частые ошибки

### 1. Забытый возврат значения

```cpp
// ❌ Неопределённое поведение!
int add(int a, int b) {
    a + b;  // Пропущен return!
}

// ✅ Правильно
int add(int a, int b) {
    return a + b;
}
```

### 2. Возврат ссылки на локальную переменную

```cpp
// ❌ ОПАСНО! Локальная переменная умирает после завершения функции
int& getValue() {
    int x = 42;
    return x;  // x уничтожается!
}

// ✅ Возврат по значению
int getValue() {
    int x = 42;
    return x;
}
```

### 3. Несоответствие типов параметров

```cpp
void setHealth(float health) { }

int main() {
    setHealth(100);  // int преобразуется в float — нормально, но будьте внимательны
    setHealth(100.5f);  // Правильно
}
```

### 4. Неиспользуемые параметры

```cpp
// ❌ Предупреждение: неиспользуемый параметр
void logMessage(std::string message, int level) {
    std::cout << message << std::endl;  // 'level' не используется
}

// ✅ Опустите имя параметра
void logMessage(std::string message, int /*level*/) {
    std::cout << message << std::endl;
}
```

### 5. Путаница между передачей по значению и по ссылке

```cpp
// Это не изменит оригинал
void addHealth(int health, int amount) {
    health += amount;
}

// Это изменит
void addHealth(int& health, int amount) {
    health += amount;
}
```

---

## Шпаргалка

```cpp
// Базовая функция
returnType functionName(parameters) {
    // код
    return value;
}

// Функция void (без возврата)
void functionName(parameters) {
    // код
    // return не нужен (или просто 'return;')
}

// Передача по значению (копия)
void func(Type param) { param = newValue; }

// Передача по ссылке (изменение оригинала)
void func(Type& param) { param = newValue; }

// Константная ссылка (только чтение, без копирования)
void func(const Type& param) { /* только чтение */ }

// Объявление функции (прототип)
returnType functionName(parameters);

// Параметры по умолчанию
void func(int a, int b = 10, int c = 20);

// Перегрузка функций — одинаковое имя, разные параметры
void display(int x);
void display(float x);
void display(int x, int y);

// Статическая локальная переменная (сохраняет значение)
void counter() {
    static int count = 0;
    count++;
}
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Напишите функцию `bool isEven(int n)`, которая возвращает `true`, если число чётное. Проверьте её в `main()` с несколькими значениями.

**Упражнение 2 (Лёгкое):** Напишите функции:
- `int max(int a, int b)` — возвращает большее число
- `int min(int a, int b)` — возвращает меньшее число
- `int clamp(int value, int low, int high)` — ограничивает значение диапазоном

**Упражнение 3 (Среднее):** Создайте "Конвертер температур" с функциями:
- `float celsiusToFahrenheit(float c)`
- `float fahrenheitToCelsius(float f)`
- `float celsiusToKelvin(float c)`
Система меню для выбора конвертации

**Упражнение 4 (Среднее):** Напишите "Калькулятор геометрии" с функциями:
- `float circleArea(float radius)`
- `float rectangleArea(float length, float width)`
- `float triangleArea(float base, float height)`
Меню для выбора фигуры и расчёта площади

**Упражнение 5 (Сложное):** Создайте систему "Банковский счёт" с функциями:
- `void deposit(float& balance, float amount)`
- `bool withdraw(float& balance, float amount)`
- `void displayBalance(float balance)`
- `void applyInterest(float& balance, float rate)` (rate в процентах, например 5.0 для 5%)
Главный цикл программы с меню

**Упражнение 6 (Вызов):** Постройте "Игру в кости" с функциями:
- `int rollDice(int sides)` — возвращает случайное число от 1 до sides
- `int rollMultiple(int count, int sides)` — сумма нескольких костей
- `bool checkSuccess(int roll, int target)` — возвращает true, если roll >= target
- `void displayRollHistory(const std::vector<int>& rolls)` — показывает все броски
Создайте простую игру, где игрок пытается превзойти целевой результат

---

## Резюме

Теперь вы знаете:

✅ Почему функции делают код переиспользуемым и читаемым  
✅ Объявление vs определение функций  
✅ Параметры — передача по значению vs по ссылке  
✅ Возвращаемые значения и ранние возвраты  
✅ Перегрузка функций (одинаковое имя, разные параметры)  
✅ Параметры по умолчанию  
✅ Область видимости и время жизни переменных  

## Что дальше?

Следующий урок: **Структуры и перечисления** — создавайте собственные типы данных для организации связанной информации (персонажи, предметы, состояния игры)!

---

## Ресурсы

- [Функции C++ (cppreference)](https://en.cppreference.com/w/cpp/language/functions)
- [Передача по значению vs по ссылке](https://www.learncpp.com/cpp-tutorial/pass-by-value-vs-pass-by-reference/)

---

**Практическое задание:** Создайте систему "Создание персонажа". Напишите функции для:
- `void createCharacter(std::string& name, int& health, int& strength)`
- `void displayCharacter(const std::string& name, int health, int strength)`
- `void levelUp(int& health, int& strength)`
- `bool saveCharacter(const std::string& name, int health, int strength)` — в файл
- `bool loadCharacter(std::string& name, int& health, int& strength)` — из файла