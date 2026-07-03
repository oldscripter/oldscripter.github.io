---
title: "Указатели и динамическая память"
description: "Управляйте памятью напрямую, создавайте гибкие структуры данных и понимайте, как на самом деле работают игры"
pubDate: 2026-06-01
tags: ["C++", "intermediate", "pointers", "dynamic-memory", "memory-management"]
lang: "ru"
lessonNumber: 11
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 11: Указатели и динамическая память

Добро пожаловать обратно! До сих пор все наши переменные имели фиксированные размеры, известные во время компиляции. **Указатели** и **динамическая память** позволяют создавать данные, которые растут и сжимаются во время выполнения — это необходимо для игр с неизвестным количеством врагов, инвентарём игрока и процедурно генерируемыми мирами.

## Что вы изучите

- Что такое указатели и почему они важны
- Оператор взятия адреса (`&`) и оператор разыменования (`*`)
- Арифметика указателей
- Динамическая память с `new` и `delete`
- `nullptr` и безопасность нулевых указателей
- Указатели на структуры и массивы
- Умные указатели (современный C++)

---

## Часть 1: Что такое указатели?

Указатель — это переменная, которая **хранит адрес в памяти** вместо значения.

Представьте память как огромный многоквартирный дом:
- У каждой квартиры есть **адрес** (например, 0x1234)
- В каждой квартире хранится **значение** (например, 42)
- **Указатель** — это стикер с адресом

```cpp
#include <iostream>

int main() {
    int health = 100;  // Обычная переменная
    
    // Указатель, который может хранить адрес int
    int* ptr = &health;  // & = оператор "адрес"
    
    std::cout << "Значение health: " << health << std::endl;     // 100
    std::cout << "Адрес health: " << &health << std::endl;  // 0x16fdff3a8
    std::cout << "Значение ptr: " << ptr << std::endl;           // 0x16fdff3a8
    std::cout << "Значение по адресу ptr: " << *ptr << std::endl;  // 100 (разыменование)
    
    // Изменение через указатель
    *ptr = 75;
    std::cout << "После *ptr = 75, health: " << health << std::endl;  // 75
    
    return 0;
}
```

### Шпаргалка по синтаксису указателей

| Синтаксис | Значение |
|--------|---------|
| `int* ptr` | Указатель на целое число |
| `&переменная` | Адрес переменной |
| `*ptr` | Значение по адресу (разыменование) |
| `ptr = &x` | Сделать ptr указывающим на x |
| `*ptr = 42` | Изменить значение по адресу на 42 |

---

## Часть 2: Зачем использовать указатели?

### Проблема 1: Функции не могут изменять оригинальные переменные (без ссылок)

```cpp
// ❌ Без указателей или ссылок
void badHeal(int health) {
    health += 50;  // Изменяет только копию
}

// ✅ С указателями (в стиле C)
void healWithPointer(int* health) {
    *health += 50;  // Изменяет оригинал!
}

// ✅ Со ссылками (в стиле C++ — предпочтительно, когда возможно)
void healWithReference(int& health) {
    health += 50;
}

int main() {
    int hp = 30;
    badHeal(hp);           // hp всё ещё 30
    healWithPointer(&hp);  // hp становится 80
    healWithReference(hp); // hp становится 130
    return 0;
}
```

### Проблема 2: Динамические массивы (размер неизвестен во время компиляции)

```cpp
// ❌ Статический массив — фиксированный размер
int scores[100];  // Тратит память, если используется только 10, или слишком мал, если нужно 200

// ✅ Динамический массив — точный размер во время выполнения
int size;
std::cout << "Сколько врагов? ";
std::cin >> size;

int* enemyHealths = new int[size];  // Выделение ровно 'size' целых чисел

for (int i = 0; i < size; i++) {
    enemyHealths[i] = 100;
}

delete[] enemyHealths;  // Не забудьте освободить!
```

### Проблема 3: Большие структуры данных (избегайте копирования)

```cpp
struct GiantData {
    int data[1000000];  // 4 МБ!
};

// ❌ Копирует 4 МБ каждый раз!
void processByValue(GiantData d) { }

// ✅ Без копирования — передаётся только адрес (8 байт)
void processByPointer(GiantData* d) { }

// ✅ Тоже без копирования (способ C++)
void processByReference(GiantData& d) { }
```

---

## Часть 3: Объявление указателей

```cpp
int main() {
    // Базовые объявления указателей
    int* ptr1;      // Указатель на int
    float* ptr2;    // Указатель на float
    char* ptr3;     // Указатель на char
    bool* ptr4;     // Указатель на bool
    
    // Несколько указателей в одной строке
    int *a, *b, *c;  // Три указателя
    int* a, b, c;    // НЕПРАВИЛЬНО! Только 'a' — указатель, b и c — int
    
    // Лучшая практика: привязывать '*' к имени переменной
    int *playerPtr;
    
    // Инициализация нулём (ни на что не указывает)
    int* nullPtr = nullptr;
    
    return 0;
}
```

---

## Часть 4: Динамическое выделение памяти (`new` и `delete`)

### Одиночные переменные

```cpp
#include <iostream>

int main() {
    // Выделение одного целого числа в куче
    int* healthPtr = new int;
    *healthPtr = 100;
    
    std::cout << "Здоровье: " << *healthPtr << std::endl;
    
    // Выделение и инициализация
    int* manaPtr = new int(50);  // Создаёт int со значением 50
    
    // Не забудьте освободить!
    delete healthPtr;
    delete manaPtr;
    healthPtr = nullptr;  // Хорошая практика: установить в null после удаления
    manaPtr = nullptr;
    
    return 0;
}
```

### Массивы

```cpp
#include <iostream>

int main() {
    int size = 10;
    
    // Выделение массива из 10 int
    int* arr = new int[size];
    
    // Заполнение значениями
    for (int i = 0; i < size; i++) {
        arr[i] = i * 10;  // Используется как обычный массив
    }
    
    // Вывод
    for (int i = 0; i < size; i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
    
    // Освобождение памяти массива
    delete[] arr;
    arr = nullptr;
    
    return 0;
}
```

### Объекты и структуры

```cpp
#include <iostream>
#include <string>

struct Player {
    std::string name;
    int health;
    int level;
};

int main() {
    // Выделение одной структуры
    Player* player1 = new Player;
    player1->name = "Каэлен";   // Оператор стрелка (->) для указателей
    player1->health = 100;
    player1->level = 5;
    
    // Выделение и инициализация
    Player* player2 = new Player{"Ария", 80, 3};
    
    // Доступ к членам
    std::cout << player1->name << " (Уровень " << player1->level << ")" << std::endl;
    std::cout << player2->name << " (Здоровье: " << player2->health << ")" << std::endl;
    
    // Не забудьте удалить!
    delete player1;
    delete player2;
    
    return 0;
}
```

### Оператор стрелка (`->`)

```cpp
struct Point { float x, y; };

int main() {
    Point p = {10, 20};      // Обычная структура
    Point* ptr = &p;          // Указатель на структуру
    
    // Эти выражения эквивалентны:
    (*ptr).x = 30;   // Сначала разыменование, затем доступ к члену
    ptr->x = 30;     // Оператор стрелка (чище!)
    
    return 0;
}
```

---

## Часть 5: `nullptr` и нулевые указатели

Всегда инициализируйте указатели значением `nullptr`, когда они не указывают на корректную память.

```cpp
#include <iostream>

int main() {
    int* ptr = nullptr;  // Ни на что не указывает
    
    // Всегда проверяйте перед использованием!
    if (ptr != nullptr) {
        *ptr = 100;  // Безопасно
    } else {
        std::cout << "Указатель нулевой! Нельзя использовать." << std::endl;
    }
    
    // После удаления установите в nullptr
    int* data = new int(42);
    delete data;
    data = nullptr;  // Предотвращает случайное использование после удаления
    
    return 0;
}
```

---

## Часть 6: Арифметика указателей

Указатели можно инкрементировать/декрементировать для перемещения по памяти.

```cpp
#include <iostream>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int* ptr = arr;  // Указывает на первый элемент
    
    std::cout << "Первый элемент: " << *ptr << std::endl;        // 10
    ptr++;  // Перемещение к следующему целому числу (4 байта вперёд)
    std::cout << "Второй элемент: " << *ptr << std::endl;       // 20
    ptr += 2;  // Перемещение на 2 элемента вперёд
    std::cout << "Четвёртый элемент: " << *ptr << std::endl;       // 40
    
    // Индексация массива — это арифметика указателей!
    // arr[2] эквивалентно *(arr + 2)
    std::cout << "arr[2] = " << arr[2] << std::endl;
    std::cout << "*(arr + 2) = " << *(arr + 2) << std::endl;  // То же самое!
    
    return 0;
}
```

---

## Часть 7: Указатели на указатели

Иногда нужен указатель на указатель (например, для 2D динамических массивов).

```cpp
#include <iostream>

int main() {
    // Создание 2D сетки динамически
    int rows = 5;
    int cols = 5;
    
    // Выделение массива указателей (строки)
    int** grid = new int*[rows];
    
    // Выделение каждой строки (столбцы)
    for (int i = 0; i < rows; i++) {
        grid[i] = new int[cols];
    }
    
    // Использование как обычного 2D массива
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            grid[i][j] = i * cols + j;
        }
    }
    
    // Вывод
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            std::cout << grid[i][j] << "\t";
        }
        std::cout << std::endl;
    }
    
    // Освобождение памяти (в обратном порядке!)
    for (int i = 0; i < rows; i++) {
        delete[] grid[i];
    }
    delete[] grid;
    
    return 0;
}
```

---

## Часть 8: Умные указатели (современный C++)

Сырые указатели с `new`/`delete` склонны к ошибкам. **Умные указатели** автоматически управляют памятью.

### `std::unique_ptr` — Исключительное владение

```cpp
#include <iostream>
#include <memory>  // Для умных указателей

struct Enemy {
    std::string name;
    int health;
    
    Enemy(const std::string& n, int h) : name(n), health(h) {
        std::cout << "Враг " << name << " создан" << std::endl;
    }
    ~Enemy() {
        std::cout << "Враг " << name << " уничтожен" << std::endl;
    }
};

int main() {
    // Ручное удаление не требуется!
    std::unique_ptr<Enemy> enemy1 = std::make_unique<Enemy>("Гоблин", 30);
    std::unique_ptr<Enemy> enemy2 = std::make_unique<Enemy>("Орк", 80);
    
    // Использование как обычного указателя
    std::cout << enemy1->name << " имеет " << enemy1->health << " HP" << std::endl;
    
    // Передача владения (enemy1 становится null)
    std::unique_ptr<Enemy> enemy3 = std::move(enemy1);
    
    if (enemy1 == nullptr) {
        std::cout << "enemy1 теперь null" << std::endl;
    }
    
    // Автоматически уничтожается при выходе из области видимости
    
    return 0;
}
```

### `std::shared_ptr` — Разделённое владение

```cpp
#include <iostream>
#include <memory>

int main() {
    std::shared_ptr<int> ptr1 = std::make_shared<int>(100);
    std::shared_ptr<int> ptr2 = ptr1;  // Оба указывают на одно целое число
    
    std::cout << "Значение: " << *ptr1 << std::endl;
    std::cout << "Счётчик ссылок: " << ptr1.use_count() << std::endl;  // 2
    
    ptr2.reset();  // Освобождает ссылку
    
    std::cout << "Счётчик ссылок после reset: " << ptr1.use_count() << std::endl;  // 1
    
    // Память освобождается, когда последний shared_ptr выходит из области видимости
    
    return 0;
}
```

### Сырые указатели vs Умные указатели

| Характеристика | Сырой указатель | `unique_ptr` | `shared_ptr` |
|---------|-------------|--------------|--------------|
| Ручной delete | ✅ Требуется | ❌ Автоматический | ❌ Автоматический |
| Владение | Неясно | Исключительное | Разделённое |
| Накладные расходы | Нет | Очень низкие | Низкие (счётчик ссылок) |
| Когда использовать | Наблюдение, невладеющий | В большинстве случаев | Разделяемые ресурсы |

---

## Полный пример: Динамическая система врагов

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
        std::cout << "Заспавнен: " << type << std::endl;
    }
    
    ~Enemy() {
        std::cout << "Побеждён: " << type << std::endl;
    }
    
    void attack() {
        std::cout << type << " наносит " << damage << " урона!" << std::endl;
    }
    
    void takeDamage(int amount) {
        health -= amount;
        std::cout << type << " получает " << amount << " урона (HP: " << health << ")" << std::endl;
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
        std::cout << "\n=== ВОЛНА " << wave << " - " << enemyCount << " врагов ===" << std::endl;
        
        for (int i = 0; i < enemyCount; i++) {
            // Случайный тип врага
            int type = rand() % 3;
            std::string name;
            int health, damage;
            
            switch (type) {
                case 0:
                    name = "Гоблин";
                    health = 30 + wave * 5;
                    damage = 8 + wave;
                    break;
                case 1:
                    name = "Орк";
                    health = 50 + wave * 8;
                    damage = 12 + wave;
                    break;
                case 2:
                    name = "Тролль";
                    health = 80 + wave * 10;
                    damage = 15 + wave;
                    break;
                default:
                    name = "Скелет";
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
        // Удаление мёртвых врагов
        for (auto it = enemies.begin(); it != enemies.end(); ) {
            if (!(*it)->isAlive()) {
                it = enemies.erase(it);
            } else {
                ++it;
            }
        }
        
        if (enemies.empty()) {
            std::cout << "Волна очищена!" << std::endl;
            return;
        }
        
        // Первый враг атакует
        enemies[0]->attack();
    }
    
    int getRemainingCount() const {
        return enemies.size();
    }
};

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    std::cout << "=== ДИНАМИЧЕСКАЯ СИСТЕМА ВРАГОВ ===" << std::endl;
    
    int wave = 1;
    int playerHealth = 100;
    
    while (wave <= 3 && playerHealth > 0) {
        EnemyWave currentWave(wave);
        
        while (currentWave.hasEnemies() && playerHealth > 0) {
            std::cout << "\nВрагов осталось: " << currentWave.getRemainingCount() << std::endl;
            std::cout << "Здоровье игрока: " << playerHealth << std::endl;
            
            // Игрок атакует первого врага
            int damage = 15 + rand() % 20;
            std::cout << "Вы наносите " << damage << " урона!" << std::endl;
            currentWave.fightTurn();  // Враг атакует после
            
            // Симуляция урона от врага (упрощённо)
            playerHealth -= 5 + rand() % 10;
        }
        
        if (playerHealth > 0) {
            std::cout << "\n*** ВОЛНА " << wave << " ЗАВЕРШЕНА! ***" << std::endl;
            wave++;
        }
    }
    
    if (playerHealth > 0) {
        std::cout << "\n✦ ПОБЕДА! Вы прошли все волны! ✦" << std::endl;
    } else {
        std::cout << "\n✗ ИГРА ОКОНЧЕНА! Вы были побеждены. ✗" << std::endl;
    }
    
    // Все враги автоматически очищаются через unique_ptr
    return 0;
}
```

---

## Частые ошибки

### 1. Использование памяти после удаления

```cpp
int* ptr = new int(42);
delete ptr;
*ptr = 100;  // ❌ ПАДЕНИЕ! Использование удалённой памяти

// ✅ Установите в nullptr после удаления
delete ptr;
ptr = nullptr;
if (ptr != nullptr) {
    *ptr = 100;  // Безопасно
}
```

### 2. Забытое удаление (утечка памяти)

```cpp
// ❌ Утечка памяти — никогда не удаляется
void leakMemory() {
    int* data = new int[1000];
    // Функция завершается, data потерян — нельзя удалить!
}

// ✅ Всегда удаляйте
void noLeak() {
    int* data = new int[1000];
    delete[] data;
}
```

### 3. Несоответствие `new` и `delete`

```cpp
int* a = new int;      // Одиночный
delete[] a;            // ❌ Неправильно! Должно быть delete a

int* b = new int[10];  // Массив
delete b;              // ❌ Неправильно! Должно быть delete[] b
```

### 4. Разыменование нулевого указателя

```cpp
int* ptr = nullptr;
*ptr = 42;  // ❌ ПАДЕНИЕ!

// ✅ Всегда проверяйте
if (ptr != nullptr) {
    *ptr = 42;
}
```

### 5. Возврат указателя на локальную переменную

```cpp
// ❌ ОПАСНО! Локальная переменная уничтожается при завершении функции
int* badFunction() {
    int x = 42;
    return &x;  // Возвращает адрес уничтоженной переменной!
}

// ✅ Возврат динамической памяти или использование параметра
int* goodFunction() {
    return new int(42);  // Вызывающий должен удалить
}
```

---

## Шпаргалка

```cpp
// Объявление указателя
int* ptr;                    // Указатель на int
int *ptr;                    // То же самое, другой стиль
int* ptr1, ptr2;             // ptr1 — указатель, ptr2 — int

// Адрес и разыменование
int x = 10;
int* p = &x;                 // p хранит адрес x
int y = *p;                  // y = 10
*p = 20;                     // x становится 20

// Динамическая память
int* p = new int;            // Одиночный int
int* p = new int(42);        // Инициализация значением 42
int* arr = new int[100];     // Массив из 100 int

// Удаление
delete p;                    // Одиночный
delete[] arr;                // Массив

// nullptr
int* p = nullptr;            // Ни на что не указывает
if (p != nullptr) { }        // Проверка перед использованием

// Оператор стрелка (->)
struct Point { int x, y; };
Point* p = new Point{10, 20};
p->x = 30;                   // То же, что (*p).x = 30

// Умные указатели (C++11)
#include <memory>
std::unique_ptr<int> u = std::make_unique<int>(42);
std::shared_ptr<int> s = std::make_shared<int>(42);
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Напишите функцию, которая меняет местами два целых числа с использованием указателей (не ссылок).

**Упражнение 2 (Среднее):** Создайте динамический массив, который может расти. Начните с размера 5, удваивайте размер, когда он заполнен. Реализуйте функции `add`, `get`, `size`.

**Упражнение 3 (Среднее):** Реализуйте простой узел связного списка:
```cpp
struct Node {
    int data;
    Node* next;
};
```
Напишите функции для добавления в начало, печати списка и удаления всего списка.

**Упражнение 4 (Сложное):** Создайте систему "Динамический инвентарь", где предметы хранятся в динамически выделяемом массиве. Поддерживайте добавление предметов (увеличение массива), удаление (уменьшение или отметка как пустого) и отображение инвентаря.

**Упражнение 5 (Сложное):** Создайте аллокатор "Пул памяти". Предварительно выделите большой блок памяти и реализуйте свои функции `allocate()` и `deallocate()` для управления этим пулом.

**Упражнение 6 (Вызов):** Создайте "Умный указатель" с нуля (упрощённый). Реализуйте шаблон класса, который управляет динамической памятью со счётчиком ссылок (как `shared_ptr`).

---

## Резюме

Теперь вы знаете:

✅ Что такое указатели и как их использовать  
✅ Операторы взятия адреса (`&`) и разыменования (`*`)  
✅ Динамическая память с `new` и `delete`  
✅ `nullptr` и безопасность нулевых указателей  
✅ Арифметика указателей для массивов  
✅ Умные указатели (`unique_ptr`, `shared_ptr`)  
✅ Полная система волн врагов с использованием динамической памяти  

## Что дальше?

Следующий урок: **Строки (продвинутый уровень)** — манипуляции со строками, поиск, замена, парсинг и создание текстовых систем для игр!

---

## Ресурсы

- [Указатели C++ (cppreference)](https://en.cppreference.com/w/cpp/language/pointer)
- [Умные указатели (learncpp)](https://www.learncpp.com/cpp-tutorial/introduction-to-smart-pointers-move-semantics/)

---

**Практическое задание:** Создайте "Менеджер сохранений игры", который хранит сохранения в динамическом массиве (вектор был бы проще, но используйте сырые указатели!). Каждое сохранение содержит имя игрока, уровень, золото, временную метку. Реализуйте функции загрузки, сохранения, удаления и списка с правильным управлением памятью.