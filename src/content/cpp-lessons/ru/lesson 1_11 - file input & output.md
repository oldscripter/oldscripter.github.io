---
title: "Ввод/вывод в файлы — сохранение и загрузка игр"
description: "Сохраняйте данные, прогресс игрока, загружайте конфигурации и пишите логи"
pubDate: 2026-06-01
tags: ["C++", "beginner", "file-io", "fstream", "serialization"]
lang: "ru"
lessonNumber: 111
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Урок 10: Ввод/вывод в файлы — сохранение и загрузка игр

Добро пожаловать обратно! До сих пор все наши данные исчезали при завершении программы. **Ввод/вывод в файлы** позволяет сохранять данные постоянно — прогресс игрока, рекорды, настройки игры и файлы сохранений.

## Что вы изучите

- **`fstream`** — файловые потоки (чтение и запись)
- **`ifstream`** — входной файловый поток (чтение из файлов)
- **`ofstream`** — выходной файловый поток (запись в файлы)
- Чтение и запись различных типов данных
- Сохранение и загрузка состояний игры
- Бинарные vs текстовые файлы
- Обработка ошибок при работе с файлами

---

## Часть 1: Зачем нужен ввод/вывод в файлы?

Без ввода/вывода в файлы игроки теряют всё при закрытии игры. С вводом/выводом в файлы:

```cpp
// ❌ Без ввода/вывода в файлы — прогресс потерян навсегда
int main() {
    int level = 5;
    int gold = 1000;
    // Игра закрывается — level и gold исчезают!
}

// ✅ С вводом/выводом в файлы — прогресс сохранён!
int main() {
    // Загрузка предыдущего сохранения
    int level = loadLevel();
    int gold = loadGold();
    
    // Играем...
    
    // Сохранение прогресса
    saveGame(level, gold);
    // Игрок может продолжить позже!
}
```

---

## Часть 2: Запись в файлы (`ofstream`)

```cpp
#include <iostream>
#include <fstream>  // Требуется для ввода/вывода в файлы
#include <string>

int main() {
    // Создание выходного файлового потока
    std::ofstream outFile("savegame.txt");
    
    // Проверка успешного открытия файла
    if (!outFile) {
        std::cerr << "Ошибка: Не удалось создать файл!" << std::endl;
        return 1;
    }
    
    // Запись в файл (так же, как std::cout)
    outFile << "Игрок: Каэлен" << std::endl;
    outFile << "Уровень: 5" << std::endl;
    outFile << "Здоровье: 100" << std::endl;
    outFile << "Золото: 500" << std::endl;
    
    // Закрытие файла (автоматически закрывается при выходе outFile из области видимости)
    outFile.close();
    
    std::cout << "Игра успешно сохранена!" << std::endl;
    
    return 0;
}
```

**Файл `savegame.txt` после запуска:**
```
Игрок: Каэлен
Уровень: 5
Здоровье: 100
Золото: 500
```

### Добавление в файлы (не перезаписывая)

```cpp
#include <fstream>

int main() {
    // Открытие в режиме добавления
    std::ofstream logFile("game_log.txt", std::ios::app);
    
    if (logFile.is_open()) {
        logFile << "Игрок начал игру в " << time(nullptr) << std::endl;
        logFile << "Побеждён гоблин" << std::endl;
        logFile << "Найден сундук с сокровищами" << std::endl;
        logFile.close();
    }
    
    return 0;
}
```

---

## Часть 3: Чтение из файлов (`ifstream`)

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream inFile("savegame.txt");
    
    if (!inFile) {
        std::cerr << "Ошибка: Не удалось открыть файл сохранения!" << std::endl;
        return 1;
    }
    
    std::string line;
    int lineNumber = 0;
    
    // Чтение построчно
    while (std::getline(inFile, line)) {
        lineNumber++;
        std::cout << lineNumber << ": " << line << std::endl;
    }
    
    inFile.close();
    
    return 0;
}
```

### Чтение конкретных типов данных

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream inFile("savegame.txt");
    
    if (!inFile) {
        std::cerr << "Ошибка открытия файла!" << std::endl;
        return 1;
    }
    
    std::string label;
    std::string playerName;
    int level;
    int health;
    int gold;
    
    // Чтение форматированных данных
    inFile >> label >> playerName;  // Читает "Игрок:" и "Каэлен"
    inFile >> label >> level;        // Читает "Уровень:" и 5
    inFile >> label >> health;       // Читает "Здоровье:" и 100
    inFile >> label >> gold;         // Читает "Золото:" и 500
    
    std::cout << "Загружено: " << playerName << std::endl;
    std::cout << "Уровень: " << level << std::endl;
    std::cout << "Здоровье: " << health << std::endl;
    std::cout << "Золото: " << gold << std::endl;
    
    inFile.close();
    
    return 0;
}
```

---

## Часть 4: Сохранение и загрузка структур

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

// Сохранение игрока в файл
bool savePlayer(const Player& p, const std::string& filename) {
    std::ofstream outFile(filename);
    
    if (!outFile) {
        return false;
    }
    
    // Запись данных игрока
    outFile << p.name << std::endl;
    outFile << p.level << std::endl;
    outFile << p.health << std::endl;
    outFile << p.mana << std::endl;
    outFile << p.gold << std::endl;
    
    // Запись размера инвентаря и предметов
    outFile << p.inventory.size() << std::endl;
    for (const auto& item : p.inventory) {
        outFile << item << std::endl;
    }
    
    outFile.close();
    return true;
}

// Загрузка игрока из файла
bool loadPlayer(Player& p, const std::string& filename) {
    std::ifstream inFile(filename);
    
    if (!inFile) {
        return false;
    }
    
    // Чтение данных игрока
    std::getline(inFile, p.name);
    inFile >> p.level;
    inFile >> p.health;
    inFile >> p.mana;
    inFile >> p.gold;
    
    // Чтение инвентаря
    int inventorySize;
    inFile >> inventorySize;
    inFile.ignore();  // Пропуск перевода строки
    
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
    // Создание игрока
    Player hero;
    hero.name = "Каэлен";
    hero.level = 5;
    hero.health = 100;
    hero.mana = 50;
    hero.gold = 500;
    hero.inventory = {"Меч", "Щит", "Зелье здоровья"};
    
    // Сохранение игрока
    if (savePlayer(hero, "player.sav")) {
        std::cout << "Игра сохранена!" << std::endl;
    } else {
        std::cerr << "Ошибка сохранения!" << std::endl;
        return 1;
    }
    
    // Загрузка игрока в новую переменную
    Player loadedHero;
    if (loadPlayer(loadedHero, "player.sav")) {
        std::cout << "\n=== ЗАГРУЖЕННЫЙ ПЕРСОНАЖ ===" << std::endl;
        std::cout << "Имя: " << loadedHero.name << std::endl;
        std::cout << "Уровень: " << loadedHero.level << std::endl;
        std::cout << "Здоровье: " << loadedHero.health << std::endl;
        std::cout << "Мана: " << loadedHero.mana << std::endl;
        std::cout << "Золото: " << loadedHero.gold << std::endl;
        std::cout << "Инвентарь: ";
        for (const auto& item : loadedHero.inventory) {
            std::cout << item << " ";
        }
        std::cout << std::endl;
    } else {
        std::cerr << "Ошибка загрузки!" << std::endl;
    }
    
    return 0;
}
```

---

## Часть 5: Бинарные файлы (более эффективные)

Текстовые файлы удобочитаемы, но занимают больше места. Бинарные файлы меньше и быстрее, но неудобочитаемы.

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
    char name[50];  // Фиксированный размер для бинарного ввода/вывода
};

void saveBinary(const GameData& data, const std::string& filename) {
    std::ofstream outFile(filename, std::ios::binary);
    
    if (!outFile) {
        std::cerr << "Ошибка создания бинарного файла!" << std::endl;
        return;
    }
    
    // Запись сырой памяти в файл
    outFile.write(reinterpret_cast<const char*>(&data), sizeof(GameData));
    outFile.close();
    
    std::cout << "Бинарное сохранение завершено!" << std::endl;
}

bool loadBinary(GameData& data, const std::string& filename) {
    std::ifstream inFile(filename, std::ios::binary);
    
    if (!inFile) {
        return false;
    }
    
    // Чтение сырой памяти из файла
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
    std::strcpy(save.name, "Каэлен");
    
    saveBinary(save, "game.bin");
    
    GameData loaded;
    if (loadBinary(loaded, "game.bin")) {
        std::cout << "Бинарный файл загружен:" << std::endl;
        std::cout << "Имя: " << loaded.name << std::endl;
        std::cout << "Уровень: " << loaded.level << std::endl;
        std::cout << "Здоровье: " << loaded.health << std::endl;
        std::cout << "Золото: " << loaded.gold << std::endl;
        std::cout << "Позиция: (" << loaded.positionX << ", " << loaded.positionY << ")" << std::endl;
    }
    
    return 0;
}
```

### Текстовые vs Бинарные — что использовать?

| Характеристика | Текстовые файлы | Бинарные файлы |
|---------|-----------|--------------|
| Удобочитаемы | ✅ Да | ❌ Нет |
| Размер файла | Больше | Меньше |
| Скорость | Медленнее | Быстрее |
| Кроссплатформенность | ✅ Да | ⚠️ Осторожно с порядком байтов |
| Легко редактировать | ✅ Да | ❌ Нет |
| Использовать когда | Файлы сохранений, конфиги, логи | Рекорды, большие данные, сеть |

---

## Часть 6: Режимы и флаги файлов

```cpp
#include <fstream>

std::ofstream outFile;

// Режим по умолчанию (ios::out) — перезаписывает
outFile.open("file.txt");

// Режим добавления — добавляет в конец
outFile.open("log.txt", std::ios::app);

// Бинарный режим — без преобразования новых строк
outFile.open("data.bin", std::ios::binary);

// Очистка (удаление содержимого перед записью)
outFile.open("save.txt", std::ios::trunc);

// Комбинированные режимы
outFile.open("settings.cfg", std::ios::out | std::ios::app);
```

### Распространённые флаги режимов файлов

| Флаг | Значение |
|------|---------|
| `std::ios::in` | Открыть для чтения |
| `std::ios::out` | Открыть для записи |
| `std::ios::app` | Добавлять в конец |
| `std::ios::binary` | Бинарный режим |
| `std::ios::trunc` | Удалить содержимое |
| `std::ios::ate` | Начать с конца |

---

## Часть 7: Обработка ошибок при работе с файлами

```cpp
#include <iostream>
#include <fstream>

int main() {
    std::ifstream inFile("missing.txt");
    
    // Проверка открытия файла
    if (!inFile) {
        std::cerr << "Ошибка: Файл не существует или не может быть открыт!" << std::endl;
        return 1;
    }
    
    // Проверка состояния потока
    if (inFile.bad()) {
        std::cerr << "Критическая ошибка потока!" << std::endl;
        return 1;
    }
    
    // Проверка достижения конца файла
    int value;
    inFile >> value;
    if (inFile.eof()) {
        std::cout << "Достигнут конец файла" << std::endl;
    }
    
    // Очистка флагов ошибок при необходимости
    inFile.clear();
    
    return 0;
}
```

---

## Полный пример: RPG система сохранений

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cstdlib>
#include <ctime>

// Структуры
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

// Функции сохранения
bool saveGame(const Player& player, const std::string& slot) {
    std::string filename = "save_" + slot + ".sav";
    std::ofstream outFile(filename);
    
    if (!outFile) {
        return false;
    }
    
    // Базовая информация
    outFile << "=== СОХРАНЁННАЯ ИГРА ===" << std::endl;
    outFile << player.name << std::endl;
    outFile << player.level << std::endl;
    outFile << player.experience << std::endl;
    outFile << player.health << std::endl;
    outFile << player.maxHealth << std::endl;
    outFile << player.mana << std::endl;
    outFile << player.maxMana << std::endl;
    outFile << player.gold << std::endl;
    
    // Характеристики
    outFile << player.stats.strength << std::endl;
    outFile << player.stats.dexterity << std::endl;
    outFile << player.stats.intelligence << std::endl;
    
    // Инвентарь
    outFile << player.inventory.size() << std::endl;
    for (const auto& item : player.inventory) {
        outFile << item.name << std::endl;
        outFile << item.quantity << std::endl;
    }
    
    outFile << "=== КОНЕЦ ===" << std::endl;
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
    std::getline(inFile, line);  // Пропуск заголовка
    
    // Базовая информация
    std::getline(inFile, player.name);
    inFile >> player.level;
    inFile >> player.experience;
    inFile >> player.health;
    inFile >> player.maxHealth;
    inFile >> player.mana;
    inFile >> player.maxMana;
    inFile >> player.gold;
    
    // Характеристики
    inFile >> player.stats.strength;
    inFile >> player.stats.dexterity;
    inFile >> player.stats.intelligence;
    
    // Инвентарь
    int inventorySize;
    inFile >> inventorySize;
    inFile.ignore();  // Пропуск перевода строки
    
    player.inventory.clear();
    for (int i = 0; i < inventorySize; i++) {
        InventoryItem item;
        std::getline(inFile, item.name);
        inFile >> item.quantity;
        inFile.ignore();
        player.inventory.push_back(item);
    }
    
    std::getline(inFile, line);  // Пропуск футера
    inFile.close();
    
    return true;
}

// Функции отображения
void displayStats(const Player& player) {
    std::cout << "\n=== " << player.name << " ===" << std::endl;
    std::cout << "Уровень: " << player.level << " (XP: " << player.experience << ")" << std::endl;
    std::cout << "Здоровье: " << player.health << "/" << player.maxHealth << std::endl;
    std::cout << "Мана: " << player.mana << "/" << player.maxMana << std::endl;
    std::cout << "Золото: " << player.gold << std::endl;
    std::cout << "Характеристики: СИЛ " << player.stats.strength 
              << " | ЛОВ " << player.stats.dexterity 
              << " | ИНТ " << player.stats.intelligence << std::endl;
    
    if (!player.inventory.empty()) {
        std::cout << "\nИнвентарь:" << std::endl;
        for (const auto& item : player.inventory) {
            std::cout << "  - " << item.name << " x" << item.quantity << std::endl;
        }
    }
}

// Демо-функции
void createNewGame(Player& player) {
    std::cin.ignore();
    std::cout << "Введите ваше имя: ";
    std::getline(std::cin, player.name);
    
    player.level = 1;
    player.experience = 0;
    player.health = 100;
    player.maxHealth = 100;
    player.mana = 50;
    player.maxMana = 50;
    player.gold = 100;
    player.stats = {10, 10, 10};
    player.inventory = {{"Зелье здоровья", 3}, {"Зелье маны", 2}};
    
    std::cout << "\nДобро пожаловать, " << player.name << "! Ваше приключение начинается!" << std::endl;
}

void playGame(Player& player) {
    std::cout << "\n=== ИГРА ===" << std::endl;
    std::cout << "Вы исследуете подземелье..." << std::endl;
    
    // Симуляция игрового процесса
    player.experience += 50;
    player.gold += 75;
    
    std::cout << "Получено 50 XP и 75 золота!" << std::endl;
    
    // Повышение уровня?
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
        
        std::cout << "*** ПОВЫШЕНИЕ УРОВНЯ! Теперь вы уровень " << player.level << "! ***" << std::endl;
    }
    
    // Находка предмета
    player.inventory.push_back({"Железный меч", 1});
    std::cout << "Найдено: Железный меч!" << std::endl;
}

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    Player player;
    bool running = true;
    
    while (running) {
        std::cout << "\n=== ДЕМО СИСТЕМЫ СОХРАНЕНИЙ ===" << std::endl;
        std::cout << "1. Новая игра" << std::endl;
        std::cout << "2. Загрузить игру (Слот 1)" << std::endl;
        std::cout << "3. Загрузить игру (Слот 2)" << std::endl;
        std::cout << "4. Играть" << std::endl;
        std::cout << "5. Сохранить игру (Слот 1)" << std::endl;
        std::cout << "6. Сохранить игру (Слот 2)" << std::endl;
        std::cout << "7. Показать текущую статистику" << std::endl;
        std::cout << "8. Выйти" << std::endl;
        std::cout << "Выбор: ";
        
        int choice;
        std::cin >> choice;
        
        switch (choice) {
            case 1:
                createNewGame(player);
                break;
            case 2:
                if (loadGame(player, "1")) {
                    std::cout << "Игра загружена из Слота 1!" << std::endl;
                    displayStats(player);
                } else {
                    std::cout << "Нет файла сохранения в Слоте 1!" << std::endl;
                }
                break;
            case 3:
                if (loadGame(player, "2")) {
                    std::cout << "Игра загружена из Слота 2!" << std::endl;
                    displayStats(player);
                } else {
                    std::cout << "Нет файла сохранения в Слоте 2!" << std::endl;
                }
                break;
            case 4:
                if (player.name.empty()) {
                    std::cout << "Сначала создайте или загрузите персонажа!" << std::endl;
                } else {
                    playGame(player);
                }
                break;
            case 5:
                if (saveGame(player, "1")) {
                    std::cout << "Игра сохранена в Слот 1!" << std::endl;
                } else {
                    std::cout << "Ошибка сохранения!" << std::endl;
                }
                break;
            case 6:
                if (saveGame(player, "2")) {
                    std::cout << "Игра сохранена в Слот 2!" << std::endl;
                } else {
                    std::cout << "Ошибка сохранения!" << std::endl;
                }
                break;
            case 7:
                if (player.name.empty()) {
                    std::cout << "Персонаж не создан!" << std::endl;
                } else {
                    displayStats(player);
                }
                break;
            case 8:
                running = false;
                std::cout << "До свидания!" << std::endl;
                break;
            default:
                std::cout << "Неверный выбор!" << std::endl;
        }
    }
    
    return 0;
}
```

---

## Частые ошибки

### 1. Забытое закрытие файлов

```cpp
// ❌ Файл может быть записан не полностью
std::ofstream outFile("data.txt");
outFile << "Привет";
// Программа завершается — буфер может не сброситься

// ✅ Всегда закрывайте или позволяйте деструктору сделать это
std::ofstream outFile("data.txt");
outFile << "Привет";
outFile.close();  // Или outFile выходит из области видимости
```

### 2. Отсутствие проверки открытия файла

```cpp
// ❌ Может упасть или прочитать мусор
std::ifstream inFile("missing.txt");
int value;
inFile >> value;  // Молча завершается ошибкой

// ✅ Всегда проверяйте
if (!inFile) {
    std::cerr << "Ошибка открытия файла!" << std::endl;
    return 1;
}
```

### 3. Использование `>>` затем `getline`

```cpp
// ❌ Работает не так, как ожидается
int level;
std::string name;
inFile >> level;
std::getline(inFile, name);  // Читает оставшийся перевод строки!

// ✅ Исправление с ignore
inFile >> level;
inFile.ignore();  // Отбрасывает перевод строки
std::getline(inFile, name);
```

### 4. Платформозависимые пути

```cpp
// ❌ Только для Windows
outFile.open("data\\save.txt");

// ❌ Только для Linux/Mac
outFile.open("data/save.txt");

// ✅ Переносимый подход
#include <filesystem>
std::filesystem::path path = "data" / std::filesystem::path("save.txt");
```

---

## Шпаргалка

```cpp
#include <fstream>

// Запись в файл
std::ofstream outFile("filename.txt");
outFile << "Текст" << std::endl;
outFile.close();

// Чтение из файла
std::ifstream inFile("filename.txt");
std::string line;
std::getline(inFile, line);
inFile >> variable;
inFile.close();

// Режим добавления
std::ofstream outFile("log.txt", std::ios::app);

// Бинарный режим
std::ofstream outFile("data.bin", std::ios::binary);
outFile.write(reinterpret_cast<char*>(&data), sizeof(data));

// Проверка открытия
if (inFile.is_open()) { }
if (!outFile) { }  // Тоже работает

// Состояние файла
inFile.good()  // Всё в порядке
inFile.eof()   // Достигнут конец файла
inFile.fail()  // Нефатальная ошибка
inFile.bad()   // Фатальная ошибка

// Очистка ошибок
inFile.clear();
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Напишите программу, которая сохраняет список рекордов в файл. Затем загружает и отображает их отсортированными.

**Упражнение 2 (Лёгкое):** Создайте "Менеджер конфигурации", который сохраняет/загружает настройки игры (громкость, разрешение, сложность) в/из файла конфигурации.

**Упражнение 3 (Среднее):** Создайте систему "Журнал/Дневник". Каждая запись имеет дату, заголовок и содержимое. Сохраняйте все записи в файл, загружайте их обратно и отображайте по дате.

**Упражнение 4 (Среднее):** Создайте "Экспортёр в CSV" для характеристик персонажа. Сохраняйте данные игрока в формате CSV, затем импортируйте в программу для работы с таблицами.

**Упражнение 5 (Сложное):** Реализуйте "Менеджер сохранений игры", который поддерживает:
- Несколько слотов сохранения (3-5)
- Автосохранение каждые X минут
- Метаданные сохранения (временная метка, время игры, локация)
- Экран загрузки с предпросмотром каждого сохранения

**Упражнение 6 (Вызов):** Создайте "Упаковщик бинарных ресурсов", который принимает несколько текстовых файлов (диалоги, характеристики, предметы) и упаковывает их в один бинарный файл для более быстрой загрузки в играх.

---

## Резюме

Теперь вы знаете:

✅ **`ofstream`** — запись в файлы  
✅ **`ifstream`** — чтение из файлов  
✅ Текстовые vs бинарные файлы (плюсы и минусы)  
✅ Режимы и флаги файлов  
✅ Обработка ошибок при работе с файлами  
✅ Полная система сохранения/загрузки RPG  
✅ Паттерны сериализации структур  

## Что дальше?

Следующий урок: **Указатели и динамическая память** — управляйте памятью напрямую, создавайте гибкие структуры данных и понимайте, как на самом деле работают игры!

---

## Ресурсы

- [Ввод/вывод в файлы C++ (cppreference)](https://en.cppreference.com/w/cpp/io/basic_fstream)
- [Документация std::fstream](https://en.cppreference.com/w/cpp/io/basic_fstream)

---

**Практическое задание:** Создайте "Редактор сохранений игры", который может загружать файлы сохранений, отображать все значения, позволять пользователю изменять их (здоровье, золото и т.д.) и сохранять обратно. Так работают многие игровые тренеры и редакторы сохранений!