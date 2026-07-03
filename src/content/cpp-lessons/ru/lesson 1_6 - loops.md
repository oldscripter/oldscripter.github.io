---
title: "Циклы: while, do-while и for"
description: "Эффективно повторяйте код — от игровых циклов до обработки тысяч врагов"
pubDate: 2026-06-01
tags: ["C++", "beginner", "loops", "iteration", "game-loop"]
lang: "ru"
lessonNumber: 6
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Урок 6: Циклы — while, do-while и for

Добро пожаловать обратно! До сих пор наши программы выполняли каждую строку один раз и завершались. Но игры требуют повторения — обновление 60 раз в секунду, обработка сотен врагов, отрисовка тысяч частиц. **Циклы** делают это возможным.

## Что вы изучите

- Циклы `while` (повторять, пока условие истинно)
- Циклы `do-while` (выполнить как минимум один раз)
- Циклы `for` (повторение с счётчиком)
- Бесконечные циклы и как их избежать
- `break` и `continue` (управление внутри циклов)
- Вложенные циклы
- Циклы `for` на основе диапазона (C++11 и новее)

---

## Часть 1: Цикл `while`

"Пока это условие истинно, продолжай делать это."

```cpp
#include <iostream>

int main() {
    int countdown = 5;
    
    while (countdown > 0) {
        std::cout << countdown << "... ";
        countdown--;  // ОЧЕНЬ ВАЖНО: изменить условие!
    }
    
    std::cout << "Пуск!" << std::endl;
    
    return 0;
}
```

**Вывод:**
```
5... 4... 3... 2... 1... Пуск!
```

### Анатомия цикла `while`

```cpp
// Инициализация (до цикла)
int i = 0;

// Условие (проверяется ПЕРЕД каждой итерацией)
while (i < 5) {
    // Тело (выполняется, пока условие истинно)
    std::cout << i << std::endl;
    
    // Обновление (изменяет условие для завершения цикла)
    i++;
}
// Продолжение здесь, когда условие становится ложным
```

### Реальный игровой пример: Спавнер врагов

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    int enemiesToSpawn = 10;
    int enemiesSpawned = 0;
    
    std::cout << "Волна 1: Спавн " << enemiesToSpawn << " врагов..." << std::endl;
    
    while (enemiesSpawned < enemiesToSpawn) {
        enemiesSpawned++;
        
        // Случайный тип врага
        int enemyType = std::rand() % 3;  // 0, 1 или 2
        
        if (enemyType == 0) {
            std::cout << "🐺 Гоблин заспавнен (" << enemiesSpawned << "/" << enemiesToSpawn << ")" << std::endl;
        } else if (enemyType == 1) {
            std::cout << "🧟 Скелет заспавнен (" << enemiesSpawned << "/" << enemiesToSpawn << ")" << std::endl;
        } else {
            std::cout << "🐉 Орк заспавнен (" << enemiesSpawned << "/" << enemiesToSpawn << ")" << std::endl;
        }
    }
    
    std::cout << "Волна завершена! Готовьтесь к бою!" << std::endl;
    
    return 0;
}
```

---

## Часть 2: Цикл `do-while`

"СДЕЛАЙ это, ЗАТЕМ проверь условие." — Гарантирует как минимум одно выполнение.

```cpp
#include <iostream>

int main() {
    int health = 0;  // Уже мёртв
    
    // Этот цикл ВСЕГДА выполняется как минимум один раз
    do {
        std::cout << "Здоровье: " << health << " — попытка воскрешения..." << std::endl;
        health += 10;  // Попытка лечения
    } while (health < 50);
    
    std::cout << "Успешно воскрешён с " << health << " здоровьем!" << std::endl;
    
    return 0;
}
```

**Вывод:**
```
Здоровье: 0 — попытка воскрешения...
Успешно воскрешён с 10 здоровьем!  (Но подождите, условие проверяется ПОСЛЕ)
```

На самом деле, давайте уточним:

```cpp
#include <iostream>

int main() {
    int health = 0;
    
    do {
        std::cout << "Текущее здоровье: " << health << std::endl;
        health += 25;
        std::cout << "Вылечено до: " << health << std::endl;
    } while (health < 50);
    
    return 0;
}
```

**Вывод:**
```
Текущее здоровье: 0
Вылечено до: 25
Текущее здоровье: 25
Вылечено до: 50
```

### Когда использовать `do-while`

Лучше всего для: **Меню, валидации ввода и ситуаций, где нужна как минимум одна итерация.**

```cpp
#include <iostream>

int main() {
    int choice;
    
    // Цикл меню — всегда показывать меню как минимум один раз
    do {
        std::cout << "\n=== ГЛАВНОЕ МЕНЮ ===" << std::endl;
        std::cout << "1. Начать игру" << std::endl;
        std::cout << "2. Настройки" << std::endl;
        std::cout << "3. Выйти" << std::endl;
        std::cout << "Выбор: ";
        std::cin >> choice;
        
        switch (choice) {
            case 1:
                std::cout << "Запуск игры..." << std::endl;
                break;
            case 2:
                std::cout << "Открытие настроек..." << std::endl;
                break;
            case 3:
                std::cout << "До свидания!" << std::endl;
                break;
            default:
                std::cout << "Неверный выбор. Попробуйте снова." << std::endl;
        }
    } while (choice != 3);
    
    return 0;
}
```

---

## Часть 3: Цикл `for`

Самый распространённый цикл для счёта. "Для этой переменной от начала до конца, сделай это."

```cpp
#include <iostream>

int main() {
    // for (инициализация; условие; обновление)
    for (int i = 0; i < 5; i++) {
        std::cout << "Итерация " << i << std::endl;
    }
    
    return 0;
}
```

**Вывод:**
```
Итерация 0
Итерация 1
Итерация 2
Итерация 3
Итерация 4
```

### Разбор цикла `for`

```cpp
for (int i = 0;    // 1. Инициализация (выполняется один раз в начале)
     i < 5;        // 2. Условие (проверяется ПЕРЕД каждой итерацией)
     i++) {        // 3. Обновление (выполняется ПОСЛЕ каждой итерации)
    
    // 4. Тело (выполняется каждый раз, когда условие истинно)
}
```

**Порядок выполнения:**
1. Инициализация (`int i = 0`)
2. Проверка условия (`i < 5`?) — если ложно, выход из цикла
3. Тело (код внутри `{}`)
4. Обновление (`i++`)
5. Возврат к шагу 2

### Распространённые паттерны цикла `for`

```cpp
// Счёт вверх
for (int i = 0; i < 10; i++) {
    std::cout << i << " ";
}
// Вывод: 0 1 2 3 4 5 6 7 8 9

// Счёт вниз
for (int i = 10; i > 0; i--) {
    std::cout << i << " ";
}
// Вывод: 10 9 8 7 6 5 4 3 2 1

// Шаг 2
for (int i = 0; i <= 10; i += 2) {
    std::cout << i << " ";
}
// Вывод: 0 2 4 6 8 10

// Несколько переменных
for (int i = 0, j = 10; i < j; i++, j--) {
    std::cout << "i=" << i << ", j=" << j << std::endl;
}
```

### Реальный игровой пример: Система уровней

```cpp
#include <iostream>

int main() {
    int currentLevel = 1;
    int currentXP = 0;
    const int MAX_LEVEL = 10;
    
    std::cout << "=== СИСТЕМА УРОВНЕЙ ===" << std::endl;
    
    for (int level = 1; level <= MAX_LEVEL; level++) {
        int xpNeeded = level * 100;
        currentXP += xpNeeded;
        
        std::cout << "Достигнут уровень " << level << "! ";
        std::cout << "Всего XP: " << currentXP << std::endl;
    }
    
    std::cout << "\nМаксимальный уровень достигнут!" << std::endl;
    
    return 0;
}
```

---

## Часть 4: Бесконечные циклы (и как их избежать)

```cpp
// ❌ БЕСКОНЕЧНЫЙ ЦИКЛ — условие никогда не становится ложным
int i = 0;
while (i < 10) {
    std::cout << i << std::endl;
    // Пропущен i++!
}

// ❌ Ещё один бесконечный цикл
for (int i = 0; i < 10; i--) {  // Счёт вниз, никогда не достигнет 10
    std::cout << i << std::endl;
}

// ❌ Условие всегда истинно
while (true) {
    // Это будет выполняться вечно, если нет break
}
```

### Преднамеренные бесконечные циклы (Игровые циклы)

В играх используются намеренные бесконечные циклы:

```cpp
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    bool isRunning = true;
    int frame = 0;
    
    // Игровой цикл — выполняется, пока игрок не выйдет
    while (isRunning) {
        // Обработка ввода
        // Обновление игровой логики
        // Отрисовка графики
        
        frame++;
        std::cout << "Кадр: " << frame << std::endl;
        
        // Симуляция 60 FPS (в реальном коде используется правильный тайминг)
        std::this_thread::sleep_for(std::chrono::milliseconds(16));
        
        // Проверка условия выхода (упрощённо)
        if (frame >= 60) {
            isRunning = false;  // Выход из цикла
        }
    }
    
    std::cout << "Игра завершена." << std::endl;
    
    return 0;
}
```

---

## Часть 5: `break` и `continue`

### `break` — Немедленный выход из цикла

```cpp
#include <iostream>

int main() {
    // Поиск сокровища
    for (int chest = 1; chest <= 100; chest++) {
        std::cout << "Открываем сундук " << chest << "... ";
        
        if (chest == 42) {
            std::cout << "НАЙДЕН ЛЕГЕНДАРНЫЙ МЕЧ! 🗡️" << std::endl;
            break;  // Немедленный выход из цикла
        }
        
        std::cout << "Ничего особенного." << std::endl;
    }
    
    std::cout << "Поиск сокровищ завершён!" << std::endl;
    
    return 0;
}
```

### `continue` — Пропуск этой итерации

```cpp
#include <iostream>

int main() {
    // Обработка только чётных чисел
    for (int i = 1; i <= 10; i++) {
        if (i % 2 != 0) {
            continue;  // Пропуск нечётных чисел
        }
        
        std::cout << "Обработка чётного числа: " << i << std::endl;
    }
    
    return 0;
}
```

**Вывод:**
```
Обработка чётного числа: 2
Обработка чётного числа: 4
Обработка чётного числа: 6
Обработка чётного числа: 8
Обработка чётного числа: 10
```

### Реальный игровой пример: Система боя с break

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    int playerHealth = 100;
    int playerDamage = 15;
    int enemyHealth = 80;
    int turn = 0;
    
    std::cout << "=== БОЙ НАЧИНАЕТСЯ ===" << std::endl;
    
    while (true) {  // Игровой цикл
        turn++;
        std::cout << "\n--- Ход " << turn << " ---" << std::endl;
        
        // Ход игрока
        int damage = playerDamage + (std::rand() % 10);
        enemyHealth -= damage;
        std::cout << "Вы наносите " << damage << " урона! Здоровье врага: " << enemyHealth << std::endl;
        
        if (enemyHealth <= 0) {
            std::cout << "Победа! Вы победили врага!" << std::endl;
            break;  // Выход из боевого цикла
        }
        
        // Ход врага
        int enemyDamage = 10 + (std::rand() % 15);
        playerHealth -= enemyDamage;
        std::cout << "Враг наносит " << enemyDamage << " урона! Ваше здоровье: " << playerHealth << std::endl;
        
        if (playerHealth <= 0) {
            std::cout << "Вы были побеждены... Игра окончена." << std::endl;
            break;  // Выход из боевого цикла
        }
        
        // Шанс побега каждые 3 хода
        if (turn % 3 == 0) {
            std::cout << "Хотите сбежать? (1=Да, 0=Нет): ";
            int flee;
            std::cin >> flee;
            
            if (flee == 1) {
                std::cout << "Вы сбежали из боя!" << std::endl;
                break;
            }
        }
    }
    
    std::cout << "Бой завершён после " << turn << " ходов." << std::endl;
    
    return 0;
}
```

---

## Часть 6: Вложенные циклы

Циклы внутри циклов — необходимы для сеток, тайловых карт и 2D-контента.

```cpp
#include <iostream>

int main() {
    // Простая сетка 3x3
    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            std::cout << "(" << row << "," << col << ") ";
        }
        std::cout << std::endl;  // Новая строка после каждого ряда
    }
    
    return 0;
}
```

**Вывод:**
```
(0,0) (0,1) (0,2) 
(1,0) (1,1) (1,2) 
(2,0) (2,1) (2,2) 
```

### Реальный игровой пример: Отрисовка тайловой карты

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    const int WIDTH = 10;
    const int HEIGHT = 5;
    
    // Генерация случайной тайловой карты
    char tilemap[HEIGHT][WIDTH];
    
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            int tileType = std::rand() % 4;
            
            switch (tileType) {
                case 0: tilemap[y][x] = '.'; break;  // Пол
                case 1: tilemap[y][x] = '#'; break;  // Стена
                case 2: tilemap[y][x] = 'E'; break;  // Враг
                case 3: tilemap[y][x] = 'T'; break;  // Сокровище
            }
        }
    }
    
    // Отрисовка тайловой карты
    std::cout << "=== КАРТА ПОДЗЕМЕЛЬЯ ===" << std::endl;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            std::cout << tilemap[y][x] << " ";
        }
        std::cout << std::endl;
    }
    
    // Поиск всех врагов
    int enemyCount = 0;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (tilemap[y][x] == 'E') {
                enemyCount++;
            }
        }
    }
    
    std::cout << "\nОбнаружено врагов: " << enemyCount << std::endl;
    
    return 0;
}
```

### Таблица умножения (Классический пример)

```cpp
#include <iostream>
#include <iomanip>

int main() {
    std::cout << "Таблица умножения (1-10)" << std::endl;
    std::cout << "    ";
    
    // Заголовок
    for (int i = 1; i <= 10; i++) {
        std::cout << std::setw(4) << i;
    }
    std::cout << std::endl;
    
    std::cout << "    " << std::string(40, '-') << std::endl;
    
    // Тело таблицы
    for (int row = 1; row <= 10; row++) {
        std::cout << std::setw(2) << row << " |";
        
        for (int col = 1; col <= 10; col++) {
            std::cout << std::setw(4) << (row * col);
        }
        std::cout << std::endl;
    }
    
    return 0;
}
```

---

## Часть 7: Цикл `for` на основе диапазона (C++11)

Современная возможность C++ для итерации по коллекциям.

```cpp
#include <iostream>
#include <vector>

int main() {
    // Массивы
    int scores[] = {95, 87, 76, 100, 82};
    
    std::cout << "Очки: ";
    for (int score : scores) {
        std::cout << score << " ";
    }
    std::cout << std::endl;
    
    // Векторы
    std::vector<std::string> inventory = {"Меч", "Щит", "Зелье"};
    
    std::cout << "Инвентарь: ";
    for (const std::string& item : inventory) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
    
    // Изменение значений (используйте ссылку)
    int numbers[] = {1, 2, 3, 4, 5};
    for (int& num : numbers) {
        num *= 2;  // Удвоить каждое число
    }
    
    std::cout << "Удвоено: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

---

## Часть 8: Советы по производительности циклов

### Префиксный vs постфиксный инкремент

```cpp
// Для простых типов (int, char) разницы нет
for (int i = 0; i < 1000000; i++) { }   // Нормально
for (int i = 0; i < 1000000; ++i) { }   // Тоже нормально

// Для итераторов (в реальном коде) ++i немного быстрее
for (auto it = vec.begin(); it != vec.end(); ++it) { }  // Предпочтительно
```

### Выносите инварианты за пределы цикла

```cpp
// ❌ Медленно — проверяет условие 1000 раз
for (int i = 0; i < 1000; i++) {
    if (someConstantCondition) {
        // сделать что-то
    }
}

// ✅ Быстрее — проверить один раз
if (someConstantCondition) {
    for (int i = 0; i < 1000; i++) {
        // сделать что-то
    }
}
```

### Кэш-дружественные циклы

```cpp
// ✅ Лучше — последовательный доступ к памяти
int matrix[1000][1000];
for (int row = 0; row < 1000; row++) {
    for (int col = 0; col < 1000; col++) {
        sum += matrix[row][col];  // Порядок по строкам
    }
}

// ❌ Хуже — прыгает по памяти
for (int col = 0; col < 1000; col++) {
    for (int row = 0; row < 1000; row++) {
        sum += matrix[row][col];  // Порядок по столбцам
    }
}
```

---

## Полный пример: RPG боевая система со всеми типами циклов

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <string>
#include <vector>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    // Характеристики игрока
    std::string playerName;
    int playerHealth = 100;
    int playerMaxHealth = 100;
    int playerMana = 50;
    int playerLevel = 1;
    
    // Список врагов
    std::vector<std::string> enemyTypes = {"Гоблин", "Орк", "Тролль", "Тёмный рыцарь"};
    std::vector<int> enemyHealths = {30, 50, 80, 120};
    std::vector<int> enemyDamages = {8, 15, 20, 25};
    
    std::cout << "=== EPIC RPG БОЕВАЯ СИСТЕМА ===" << std::endl;
    std::cout << "Введите ваше имя: ";
    std::getline(std::cin, playerName);
    
    bool gameRunning = true;
    
    // Основной игровой цикл
    while (gameRunning) {
        std::cout << "\n--- Новая встреча ---" << std::endl;
        
        // Выбор случайного врага
        int enemyIndex = std::rand() % enemyTypes.size();
        std::string enemyName = enemyTypes[enemyIndex];
        int enemyHealth = enemyHealths[enemyIndex];
        int enemyMaxHealth = enemyHealths[enemyIndex];
        int enemyDamage = enemyDamages[enemyIndex];
        
        std::cout << "Появляется " << enemyName << " уровня " << playerLevel << "!" << std::endl;
        std::cout << "Здоровье врага: " << enemyHealth << "/" << enemyMaxHealth << std::endl;
        
        bool battleRunning = true;
        int turnCount = 0;
        
        // Боевой цикл
        while (battleRunning) {
            turnCount++;
            std::cout << "\n=== Ход " << turnCount << " ===" << std::endl;
            std::cout << playerName << " Здоровье: " << playerHealth << "/" << playerMaxHealth << std::endl;
            std::cout << enemyName << " Здоровье: " << enemyHealth << "/" << enemyMaxHealth << std::endl;
            
            // Ход игрока
            std::cout << "\nВыберите действие:" << std::endl;
            std::cout << "1. Атаковать" << std::endl;
            std::cout << "2. Применить заклинание (Мана: " << playerMana << ")" << std::endl;
            std::cout << "3. Сбежать" << std::endl;
            std::cout << "Выбор: ";
            
            int choice;
            std::cin >> choice;
            
            int damage = 0;
            bool fled = false;
            
            switch (choice) {
                case 1:  // Атака
                    damage = 15 + (std::rand() % 15) + (playerLevel * 2);
                    std::cout << "Вы атакуете и наносите " << damage << " урона!" << std::endl;
                    enemyHealth -= damage;
                    break;
                    
                case 2:  // Заклинание
                    if (playerMana >= 10) {
                        damage = 25 + (std::rand() % 20) + (playerLevel * 3);
                        playerMana -= 10;
                        std::cout << "Вы применяете Огненный шар и наносите " << damage << " урона!" << std::endl;
                        enemyHealth -= damage;
                    } else {
                        std::cout << "Недостаточно маны! Вы спотыкаетесь..." << std::endl;
                        damage = 5;
                        enemyHealth -= damage;
                    }
                    break;
                    
                case 3:  // Побег
                    if (std::rand() % 100 < 50 + (playerLevel * 5)) {
                        std::cout << "Вы успешно сбежали!" << std::endl;
                        fled = true;
                    } else {
                        std::cout << "Не удалось сбежать!" << std::endl;
                    }
                    break;
                    
                default:
                    std::cout << "Неверный выбор! Вы колеблетесь..." << std::endl;
            }
            
            if (fled) {
                battleRunning = false;
                continue;
            }
            
            // Проверка победы
            if (enemyHealth <= 0) {
                std::cout << "\n✦ ПОБЕДА! ✦" << std::endl;
                int xpGain = 50 + (enemyIndex * 20);
                std::cout << "Получено " << xpGain << " XP!" << std::endl;
                
                // Проверка повышения уровня (упрощённо)
                if (xpGain > 100 && playerLevel < 5) {
                    playerLevel++;
                    playerMaxHealth += 20;
                    playerHealth = playerMaxHealth;
                    playerMana += 10;
                    std::cout << "ПОВЫШЕНИЕ УРОВНЯ! Теперь вы уровень " << playerLevel << "!" << std::endl;
                }
                
                battleRunning = false;
                continue;
            }
            
            // Ход врага
            std::cout << "\n" << enemyName << " атакует!" << std::endl;
            int enemyHit = enemyDamage + (std::rand() % 10);
            playerHealth -= enemyHit;
            std::cout << enemyName << " наносит " << enemyHit << " урона!" << std::endl;
            
            // Проверка поражения
            if (playerHealth <= 0) {
                std::cout << "\n✗ Вы были побеждены! ✗" << std::endl;
                battleRunning = false;
                gameRunning = false;
            }
        }
        
        // После боя, предложение лечения, если игрок выжил
        if (playerHealth > 0) {
            std::cout << "\nПродолжить исследование? (1=Да, 0=Нет): ";
            int continueChoice;
            std::cin >> continueChoice;
            
            if (continueChoice == 0) {
                gameRunning = false;
                std::cout << "Спасибо за игру, " << playerName << "!" << std::endl;
            } else {
                // Лечение между боями
                playerHealth = playerMaxHealth;
                playerMana = 50;
                std::cout << "Вы отдыхаете и восстанавливаете здоровье и ману." << std::endl;
            }
        }
    }
    
    return 0;
}
```

---

## Частые ошибки

### 1. Ошибка на единицу (Off-by-One)

```cpp
// ❌ Неправильно — выводит 0-4 (5 элементов)
for (int i = 0; i <= 5; i++) {  // Должно быть i < 5

// ✅ Правильно
for (int i = 0; i < 5; i++) {  // Выводит 0-4

// Для счёта с 1
for (int i = 1; i <= 5; i++) {  // Выводит 1-5
```

### 2. Забытое обновление переменной цикла

```cpp
// ❌ Бесконечный цикл
int i = 0;
while (i < 10) {
    std::cout << i << std::endl;
    // Пропущен i++
}

// ✅ Правильно
while (i < 10) {
    std::cout << i << std::endl;
    i++;
}
```

### 3. Точка с запятой после цикла

```cpp
// ❌ Пустое тело цикла
for (int i = 0; i < 10; i++);
{
    std::cout << "Это выполняется один раз, а не 10!" << std::endl;
}

// ✅ Правильно
for (int i = 0; i < 10; i++) {
    std::cout << "Выполняется 10 раз" << std::endl;
}
```

### 4. Изменение контейнера во время итерации

```cpp
// ❌ Опасно — инвалидирует итератор
std::vector<int> vec = {1, 2, 3, 4, 5};
for (int val : vec) {
    if (val == 3) {
        vec.push_back(6);  // ПЛОХО! Вектор меняется во время итерации
    }
}

// ✅ Безопасный подход — собирать индексы для удаления позже
```

---

## Шпаргалка

```cpp
// Цикл while
while (условие) {
    // выполняется, пока условие истинно
}

// Цикл do-while
do {
    // выполняется как минимум один раз
} while (условие);

// Цикл for
for (инициализация; условие; обновление) {
    // выполняется, пока условие истинно
}

// break — немедленный выход из цикла
// continue — переход к следующей итерации

// Цикл for на основе диапазона (C++11)
for (тип переменная : контейнер) {
    // итерация по всему контейнеру
}

// Вложенные циклы
for (int i = 0; i < 10; i++) {
    for (int j = 0; j < 10; j++) {
        // внутренний цикл выполняется 10 раз для каждой итерации внешнего
    }
}
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Выведите числа от 1 до 100. Для чисел, кратных 3, выведите "Fizz", для кратных 5 — "Buzz", для кратных обоим — "FizzBuzz".

**Упражнение 2 (Лёгкое):** Вычислите сумму всех чисел от 1 до N (пользовательский ввод) с помощью цикла `for`.

**Упражнение 3 (Среднее):** Создайте игру "Угадай число". Сгенерируйте случайное число 1-100, дайте пользователю угадывать, сообщайте "слишком много" или "слишком мало". Считайте попытки. Используйте цикл `while`.

**Упражнение 4 (Среднее):** Выведите треугольный паттерн:
```
*
**
***
****
*****
```
Используйте вложенные циклы.

**Упражнение 5 (Сложное):** Создайте "Калькулятор банковского процента", где пользователь вносит сумму, и проценты начисляются ежегодно. Покажите баланс за 10 лет с помощью цикла `for`.

**Упражнение 6 (Вызов):** Создайте текстовую игру "Подземелье" с:
- Сеткой 5x5 (вложенные циклы для отображения)
- Игрок начинает в (0,0), цель в (4,4)
- Случайные враги на сетке
- Движение игрока с помощью W/A/S/D
- Бой использует предыдущую боевую систему
- Победа при достижении цели

---

## Резюме

Теперь вы знаете:

✅ Циклы `while` для повторения по условию  
✅ Циклы `do-while` для гарантированного первого выполнения  
✅ Циклы `for` для счёта и итерации  
✅ Как избегать бесконечных циклов  
✅ `break` и `continue` для управления потоком  
✅ Вложенные циклы для 2D-контента  
✅ Циклы `for` на основе диапазона (современный C++)  

## Что дальше?

Следующий урок: **Массивы и векторы** — хранение коллекций данных (инвентари, рекорды, списки врагов)!

---

## Ресурсы

- [Циклы C++ (cppreference)](https://en.cppreference.com/w/cpp/language/for)
- [Цикл for на основе диапазона](https://en.cppreference.com/w/cpp/language/range-for)

---

**Практическое задание:** Создайте "Симулятор броска кубиков", который бросает два кубика 1000 раз и отслеживает, сколько раз выпала каждая сумма (2-12). Используйте цикл for для бросков и ещё один цикл for для отображения результатов. Это отличная практика для циклов и пригодится, когда мы перейдём к массивам!