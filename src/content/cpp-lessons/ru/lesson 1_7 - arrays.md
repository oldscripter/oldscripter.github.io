---
title: "Массивы и векторы"
description: "Храните коллекции данных — инвентари, рекорды, волны врагов и многое другое"
pubDate: 2026-06-01
tags: ["C++", "beginner", "arrays", "vectors", "collections"]
lang: "ru"
lessonNumber: 7
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Урок 7: Массивы и векторы

Добро пожаловать обратно! До сих пор каждая переменная хранила ОДНО значение. Но играм нужны **коллекции** — 100 врагов, 50 слотов инвентаря, 10 000 частиц. Массивы и векторы решают эту проблему.

## Что вы изучите

- **Статические массивы** (фиксированный размер, быстрые, простые)
- **Многомерные массивы** (сетки, тайловые карты)
- **Векторы** (динамический размер, гибкие, современный C++)
- Когда использовать массивы vs векторы
- Типовые операции: добавление, удаление, поиск
- Паттерны итерации

---

## Часть 1: Статические массивы (в стиле C)

Представьте массив как **ряд шкафчиков** — каждый шкафчик хранит одно значение, все шкафчики одного типа.

```cpp
#include <iostream>

int main() {
    // Объявление массива из 5 целых чисел
    int playerScores[5];
    
    // Присваивание значений по индексу (индексация с 0!)
    playerScores[0] = 95;
    playerScores[1] = 87;
    playerScores[2] = 100;
    playerScores[3] = 76;
    playerScores[4] = 82;
    
    // Доступ к элементам
    std::cout << "Первый результат: " << playerScores[0] << std::endl;
    std::cout << "Третий результат: " << playerScores[2] << std::endl;
    
    // Инициализация при объявлении
    int enemyHealths[] = {30, 45, 25, 60, 100};  // Размер определяется автоматически
    int itemPrices[4] = {10, 25, 50, 100};       // Явный размер
    
    return 0;
}
```

### Расположение в памяти

```
Массив: [95][87][100][76][82]
Индекс:  0   1   2   3   4
```

### Важно: Нет проверки границ!

```cpp
int arr[5] = {1, 2, 3, 4, 5};

arr[5] = 99;   // ❌ ОШИБКА! Индекс 5 вне диапазона (0-4)
arr[-1] = 42;  // ❌ ОШИБКА! Отрицательный индекс

// Это может привести к падению, повреждению данных или незаметному сбою
```

**Вы отвечаете за соблюдение границ!**

### Типовые операции с массивами

```cpp
#include <iostream>

int main() {
    // Объявление массива фиксированного размера
    const int MAX_ENEMIES = 10;
    int enemyHealth[MAX_ENEMIES];
    
    // Инициализация всех элементов значением 0
    for (int i = 0; i < MAX_ENEMIES; i++) {
        enemyHealth[i] = 100;
    }
    
    // Нанесение урона третьему врагу
    enemyHealth[2] -= 35;
    
    // Подсчёт общего здоровья всех врагов
    int totalHealth = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        totalHealth += enemyHealth[i];
    }
    std::cout << "Общее здоровье врагов: " << totalHealth << std::endl;
    
    // Поиск сильнейшего врага
    int maxHealth = enemyHealth[0];
    for (int i = 1; i < MAX_ENEMIES; i++) {
        if (enemyHealth[i] > maxHealth) {
            maxHealth = enemyHealth[i];
        }
    }
    std::cout << "Здоровье сильнейшего врага: " << maxHealth << std::endl;
    
    return 0;
}
```

---

## Часть 2: Размер массива и `sizeof`

```cpp
#include <iostream>

int main() {
    int scores[] = {10, 20, 30, 40, 50};
    
    // sizeof возвращает байты, а не количество элементов
    std::cout << "Размер массива в байтах: " << sizeof(scores) << std::endl;      // 20 (5 * 4 байта)
    std::cout << "Размер одного элемента: " << sizeof(scores[0]) << std::endl;      // 4
    
    // Вычисление количества элементов
    int count = sizeof(scores) / sizeof(scores[0]);
    std::cout << "Количество элементов: " << count << std::endl;  // 5
    
    return 0;
}
```

**⚠️ Предупреждение:** Этот трюк работает только с исходным массивом, не с указателями (мы рассмотрим это позже).

---

## Часть 3: Многомерные массивы

Идеально подходят для сеток, тайловых карт или игровых досок.

```cpp
#include <iostream>

int main() {
    // Доска 3x3 для крестиков-ноликов
    char board[3][3] = {
        {'X', 'O', 'X'},
        {'O', 'X', ' '},
        {' ', ' ', 'O'}
    };
    
    // Доступ к элементу
    std::cout << "Центр: " << board[1][1] << std::endl;  // 'X'
    
    // Печать доски
    for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
            std::cout << board[row][col];
            if (col < 2) std::cout << " | ";
        }
        std::cout << std::endl;
        if (row < 2) std::cout << "---------" << std::endl;
    }
    
    return 0;
}
```

### Реальный игровой пример: Простая тайловая карта

```cpp
#include <iostream>
#include <cstdlib>
#include <ctime>

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    const int WIDTH = 10;
    const int HEIGHT = 7;
    
    // 0 = пусто, 1 = стена, 2 = сокровище, 3 = враг
    int tilemap[HEIGHT][WIDTH] = {0};
    
    // Генерация случайного подземелья
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (x == 0 || x == WIDTH-1 || y == 0 || y == HEIGHT-1) {
                tilemap[y][x] = 1;  // Стены по краям
            } else if (std::rand() % 10 < 2) {  // 20% вероятности
                tilemap[y][x] = std::rand() % 3 + 2;  // 2=сокровище, 3=враг
            }
        }
    }
    
    // Отрисовка карты
    std::cout << "=== КАРТА ПОДЗЕМЕЛЬЯ ===" << std::endl;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            switch (tilemap[y][x]) {
                case 0: std::cout << "· "; break;  // Пусто
                case 1: std::cout << "█ "; break;  // Стена
                case 2: std::cout << "$ "; break;  // Сокровище
                case 3: std::cout << "E "; break;  // Враг
                default: std::cout << "? ";
            }
        }
        std::cout << std::endl;
    }
    
    // Подсчёт сокровищ
    int treasures = 0;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (tilemap[y][x] == 2) treasures++;
        }
    }
    std::cout << "\nНайдено сокровищ: " << treasures << std::endl;
    
    return 0;
}
```

---

## Часть 4: Введение в векторы

У статических массивов есть проблема: **фиксированный размер**. Что если вы не знаете, сколько элементов будет?

**Векторы** растут и сжимаются автоматически.

```cpp
#include <iostream>
#include <vector>  // Обязательно!

int main() {
    // Создание пустого вектора
    std::vector<int> playerScores;
    
    // Добавление элементов
    playerScores.push_back(95);   // [95]
    playerScores.push_back(87);   // [95, 87]
    playerScores.push_back(100);  // [95, 87, 100]
    
    // Доступ к элементам (как в массивах)
    std::cout << "Первый результат: " << playerScores[0] << std::endl;
    
    // Получение размера
    std::cout << "Количество результатов: " << playerScores.size() << std::endl;
    
    // Удаление последнего элемента
    playerScores.pop_back();  // [95, 87]
    
    // Итерация с индексом
    for (int i = 0; i < playerScores.size(); i++) {
        std::cout << playerScores[i] << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Инициализация векторов

```cpp
#include <iostream>
#include <vector>

int main() {
    // Пустой вектор
    std::vector<int> empty;
    
    // Размер 5, все элементы 0
    std::vector<int> zeros(5);
    
    // Размер 10, все элементы 100
    std::vector<int> defaults(10, 100);
    
    // Инициализация значениями
    std::vector<int> enemyHealths = {30, 45, 60, 25, 100};
    
    // Копирование из другого вектора
    std::vector<int> copy = enemyHealths;
    
    std::cout << "Размер enemyHealths: " << enemyHealths.size() << std::endl;
    std::cout << "Первый враг: " << enemyHealths[0] << std::endl;
    std::cout << "Последний враг: " << enemyHealths.back() << std::endl;
    std::cout << "Первый враг (альтернатива): " << enemyHealths.front() << std::endl;
    
    return 0;
}
```

---

## Часть 5: Операции с векторами

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> inventory;
    
    // Добавление предметов
    inventory.push_back("Меч");
    inventory.push_back("Щит");
    inventory.push_back("Зелье здоровья");
    inventory.push_back("Зелье маны");
    
    std::cout << "Инвентарь: ";
    for (const std::string& item : inventory) {
        std::cout << item << " | ";
    }
    std::cout << std::endl;
    
    // Вставка в позицию (индекс 1, после первого предмета)
    inventory.insert(inventory.begin() + 1, "Кожаная броня");
    
    std::cout << "После вставки брони: ";
    for (const std::string& item : inventory) {
        std::cout << item << " | ";
    }
    std::cout << std::endl;
    
    // Удаление элемента в позиции 2 (Щит)
    inventory.erase(inventory.begin() + 2);
    
    std::cout << "После удаления щита: ";
    for (const std::string& item : inventory) {
        std::cout << item << " | ";
    }
    std::cout << std::endl;
    
    // Проверка, пуст ли вектор
    if (!inventory.empty()) {
        std::cout << "В инвентаре " << inventory.size() << " предметов" << std::endl;
    }
    
    // Очистка всех предметов
    inventory.clear();
    std::cout << "После очистки: " << inventory.size() << " предметов" << std::endl;
    
    return 0;
}
```

---

## Часть 6: Циклы for на основе диапазона с векторами

Самый чистый способ итерации.

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> damageDealt = {15, 22, 8, 35, 12};
    
    // Только чтение
    int totalDamage = 0;
    for (int damage : damageDealt) {
        totalDamage += damage;
    }
    std::cout << "Общий урон: " << totalDamage << std::endl;
    
    // Изменение элементов (используйте ссылку)
    for (int& damage : damageDealt) {
        damage *= 2;  // Удвоение каждого значения урона
    }
    
    std::cout << "Удвоенный урон: ";
    for (int damage : damageDealt) {
        std::cout << damage << " ";
    }
    std::cout << std::endl;
    
    // С константной ссылкой (избегаем копирования)
    std::vector<std::string> names = {"Воин", "Маг", "Разбойник"};
    for (const std::string& name : names) {
        std::cout << name << std::endl;
    }
    
    return 0;
}
```

---

## Часть 7: Массивы vs Векторы — что использовать?

| Характеристика | Статический массив | Вектор |
|----------------|---------------------|--------|
| Размер | Фиксированный во время компиляции | Динамический, растёт/сжимается |
| Память | Стек (быстро) | Куча (чуть медленнее) |
| Проверка границ | Нет | Метод `.at()` проверяет |
| Удобство | Минимальное | Богатые методы |
| Производительность | Чуть быстрее | Очень близко |
| Использовать когда | Размер известен, маленький, критична производительность | Размер неизвестен, меняется, нужно удобство |

```cpp
#include <iostream>
#include <vector>

int main() {
    // ✅ Хорошо для массивов: игровая доска фиксированного размера
    char gameBoard[8][8];  // Шахматная доска, всегда 8x8
    
    // ✅ Хорошо для векторов: инвентарь игрока
    std::vector<std::string> inventory;  // Игрок может иметь любое количество предметов
    
    // ✅ Хорошо для массивов: рекорды для 10 игроков
    int highScores[10];
    
    // ✅ Хорошо для векторов: враги на уровне
    std::vector<Enemy> enemies;  // Количество врагов варьируется
    
    return 0;
}
```

---

## Часть 8: Типовые паттерны с векторами

### Поиск

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> quests = {
        "Убить дракона",
        "Найти амулет",
        "Спасти принцессу",
        "Собрать 10 трав"
    };
    
    std::string searchFor = "Амулет";
    bool found = false;
    int index = -1;
    
    // Линейный поиск
    for (int i = 0; i < quests.size(); i++) {
        if (quests[i].find(searchFor) != std::string::npos) {
            found = true;
            index = i;
            break;
        }
    }
    
    if (found) {
        std::cout << "Найдено '" << searchFor << "' в индексе " << index << std::endl;
    } else {
        std::cout << "Не найдено" << std::endl;
    }
    
    return 0;
}
```

### Удаление всех элементов, соответствующих условию

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {95, 42, 87, 42, 100, 42, 76};
    int valueToRemove = 42;
    
    // Метод 1: Традиционный цикл (двигаясь назад)
    for (int i = scores.size() - 1; i >= 0; i--) {
        if (scores[i] == valueToRemove) {
            scores.erase(scores.begin() + i);
        }
    }
    
    // Метод 2: Современный C++ (идиома erase-remove)
    // scores.erase(std::remove(scores.begin(), scores.end(), valueToRemove), scores.end());
    
    std::cout << "После удаления 42: ";
    for (int score : scores) {
        std::cout << score << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

---

## Полный пример: RPG система инвентаря

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>

struct Item {
    std::string name;
    int value;
    int weight;
};

int main() {
    std::vector<Item> inventory;
    int maxWeight = 50;
    int currentWeight = 0;
    
    // Добавление начальных предметов
    inventory.push_back({"Железный меч", 100, 8});
    inventory.push_back({"Кожаная броня", 75, 12});
    inventory.push_back({"Зелье здоровья", 50, 1});
    inventory.push_back({"Зелье здоровья", 50, 1});
    inventory.push_back({"Зелье маны", 50, 1});
    
    // Расчёт общего веса
    for (const Item& item : inventory) {
        currentWeight += item.weight;
    }
    
    bool running = true;
    
    while (running) {
        // Отображение инвентаря
        std::cout << "\n========================================" << std::endl;
        std::cout << "              ИНВЕНТАРЬ" << std::endl;
        std::cout << "========================================" << std::endl;
        std::cout << std::left << std::setw(20) << "Название предмета" 
                  << std::setw(10) << "Цена" 
                  << std::setw(10) << "Вес" << std::endl;
        std::cout << "----------------------------------------" << std::endl;
        
        for (size_t i = 0; i < inventory.size(); i++) {
            std::cout << std::left << std::setw(20) << inventory[i].name
                      << std::setw(10) << inventory[i].value
                      << std::setw(10) << inventory[i].weight << std::endl;
        }
        
        std::cout << "----------------------------------------" << std::endl;
        std::cout << "Общий вес: " << currentWeight << "/" << maxWeight << std::endl;
        std::cout << "Количество предметов: " << inventory.size() << std::endl;
        
        // Меню
        std::cout << "\nОпции:" << std::endl;
        std::cout << "1. Взять предмет" << std::endl;
        std::cout << "2. Выбросить предмет" << std::endl;
        std::cout << "3. Выйти" << std::endl;
        std::cout << "Выбор: ";
        
        int choice;
        std::cin >> choice;
        
        if (choice == 1) {
            // Добавление предмета
            Item newItem;
            std::cin.ignore();
            std::cout << "Название предмета: ";
            std::getline(std::cin, newItem.name);
            std::cout << "Цена предмета: ";
            std::cin >> newItem.value;
            std::cout << "Вес предмета: ";
            std::cin >> newItem.weight;
            
            // Проверка лимита веса
            if (currentWeight + newItem.weight <= maxWeight) {
                inventory.push_back(newItem);
                currentWeight += newItem.weight;
                std::cout << "Добавлен " << newItem.name << " в инвентарь!" << std::endl;
            } else {
                std::cout << "Нельзя нести " << newItem.name << " — слишком тяжело!" << std::endl;
            }
            
        } else if (choice == 2) {
            // Выброс предмета
            if (inventory.empty()) {
                std::cout << "Инвентарь пуст!" << std::endl;
                continue;
            }
            
            std::cout << "Введите номер предмета (1-" << inventory.size() << "): ";
            int index;
            std::cin >> index;
            index--;  // Преобразование в 0-индексацию
            
            if (index >= 0 && index < static_cast<int>(inventory.size())) {
                currentWeight -= inventory[index].weight;
                std::cout << "Выброшен " << inventory[index].name << std::endl;
                inventory.erase(inventory.begin() + index);
            } else {
                std::cout << "Неверный номер предмета!" << std::endl;
            }
            
        } else if (choice == 3) {
            running = false;
            std::cout << "До свидания!" << std::endl;
        }
    }
    
    // Итоговая ценность инвентаря
    int totalValue = 0;
    for (const Item& item : inventory) {
        totalValue += item.value;
    }
    std::cout << "Итоговая ценность инвентаря: " << totalValue << " золота" << std::endl;
    
    return 0;
}
```

---

## Частые ошибки

### 1. Ошибка на единицу (Off-by-One)

```cpp
int arr[5] = {1, 2, 3, 4, 5};

// ❌ Неправильно — индекс 5 не существует
for (int i = 0; i <= 5; i++) {
    std::cout << arr[i] << std::endl;
}

// ✅ Правильно
for (int i = 0; i < 5; i++) {
    std::cout << arr[i] << std::endl;
}
```

### 2. Использование неинициализированных массивов

```cpp
int scores[5];
// scores содержит случайные мусорные значения!
scores[0] = 100;  // Инициализирован только первый

// ✅ Всегда инициализируйте
int scores[5] = {0};  // Все нули
```

### 3. Забытый `#include <vector>`

```cpp
std::vector<int> myVector;  // ОШИБКА без #include <vector>
```

### 4. Смешивание знаковых/беззнаковых сравнений

```cpp
std::vector<int> vec = {1, 2, 3};

// ❌ Предупреждение: сравнение знакового и беззнакового
for (int i = 0; i < vec.size(); i++) { }

// ✅ Используйте size_t
for (size_t i = 0; i < vec.size(); i++) { }

// ✅ Или цикл на основе диапазона
for (int val : vec) { }
```

### 5. Недействительные итераторы после модификации

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5};
auto it = vec.begin() + 2;  // Указывает на 3
vec.erase(it);               // Теперь итератор недействителен!
// it++;  // ❌ НЕ используйте it после erase
```

---

## Шпаргалка

```cpp
// Статический массив
int arr[size];                           // Объявление
int arr[] = {1, 2, 3};                   // Инициализация
arr[0] = 5;                              // Присваивание
int x = arr[2];                          // Доступ

// Многомерный
int grid[rows][cols];
grid[row][col] = value;

// Вектор (требуется #include <vector>)
std::vector<int> v;                      // Пустой
std::vector<int> v(10);                  // Размер 10, значение 0
std::vector<int> v(10, 5);               // Размер 10, все 5
std::vector<int> v = {1, 2, 3};          // Со значениями

v.push_back(4);                          // Добавить в конец
v.pop_back();                            // Удалить из конца
v.size();                                // Количество элементов
v.empty();                               // Истина, если пуст
v.clear();                               // Удалить все
v.front();                               // Первый элемент
v.back();                                // Последний элемент
v.insert(v.begin() + i, value);          // Вставка в позицию
v.erase(v.begin() + i);                  // Удаление в позиции

// Итерация
for (size_t i = 0; i < v.size(); i++) { }           // По индексу
for (int val : v) { }                               // На основе диапазона
for (int& val : v) { val *= 2; }                    // С изменением
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Создайте массив из 5 целых чисел, заполните пользовательским вводом, затем выведите их в обратном порядке.

**Упражнение 2 (Лёгкое):** Используйте вектор для хранения ежедневных температур за неделю. Спросите у пользователя температуру за каждый день, затем вычислите среднюю, минимальную и максимальную.

**Упражнение 3 (Среднее):** Создайте систему "Рекордов". Храните топ-10 результатов в векторе. Когда приходит новый результат, вставьте его в правильную позицию (сохраняя сортировку) и оставьте только топ-10.

**Упражнение 4 (Среднее):** Реализуйте "Простой текстовый редактор" с использованием вектора строк для строк. Поддерживайте: добавление строки, удаление строки, вывод всех строк, сохранение, загрузку.

**Упражнение 5 (Сложное):** Создайте "Карточную игру" с:
- Вектором карт (1-10, Валет, Дама, Король)
- Функцией перемешивания
- Раздачей 5 карт игроку и компьютеру
- Сравнением рук для определения победителя

**Упражнение 6 (Вызов):** Постройте "Редактор тайловой карты" с сеткой 20x15. Разрешите пользователю размещать разные тайлы (пол, стена, вода, лава). Сохраните карту в файл, загрузите карту из файла. Используйте 2D вектор.

---

## Резюме

Теперь вы знаете:

✅ Статические массивы для коллекций фиксированного размера  
✅ Многомерные массивы для сеток  
✅ Векторы для динамических, гибких коллекций  
✅ Добавление, удаление и доступ к элементам  
✅ Паттерны итерации (по индексу, на основе диапазона)  
✅ Когда использовать массивы vs векторы  
✅ Систему инвентаря как полный пример  

## Что дальше?

Следующий урок: **Функции** — организация кода в переиспользуемые блоки, избегание повторений и построение сложных систем!

---

## Ресурсы

- [Документация std::vector (cppreference)](https://en.cppreference.com/w/cpp/container/vector)
- [Массивы в C++ (learncpp)](https://www.learncpp.com/cpp-tutorial/arrays-part-i/)

---

**Практическое задание:** Создайте "Систему отряда" для RPG. Используйте вектор для хранения членов отряда (структура с именем, здоровьем, маной, классом). Добавьте функции для добавления/удаления членов, лечения отряда, отображения статуса отряда и сортировки по здоровью. Это объединяет структуры, векторы и циклы!