---
title: "Обработка исключений — корректное управление ошибками"
description: "Обрабатывайте ошибки корректно без падений — файл не найден, неверный ввод, нехватка памяти"
pubDate: 2026-05-13
tags: ["C++", "intermediate", "exceptions", "error-handling", "robust-code"]
lang: "ru"
lessonNumber: 203
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 13: Обработка исключений — корректное управление ошибками

Добро пожаловать обратно! В реальных играх случаются ошибки — файлы отсутствуют, сеть падает, память заканчивается. **Исключения** позволяют нам обрабатывать эти ошибки корректно, без падений и без захламления кода проверками ошибок.

## Что вы изучите

- Что такое исключения и почему они лучше кодов ошибок
- Блоки `try`/`catch`
- Генерация исключений (`throw`)
- Стандартные типы исключений
- Пользовательские исключения для игровых ошибок
- Безопасность исключений и лучшие практики
- Когда НЕ использовать исключения

---

## Часть 1: Проблема с кодами ошибок

До появления исключений программисты на C использовали коды ошибок:

```cpp
// ❌ Подход с кодами ошибок — грязно!
int loadPlayer(const char* filename, Player* player) {
    FILE* file = fopen(filename, "r");
    if (!file) return -1;  // Файл не найден
    
    if (fscanf(file, "%s", player->name) != 1) {
        fclose(file);
        return -2;  // Ошибка чтения
    }
    
    if (fscanf(file, "%d", &player->health) != 1) {
        fclose(file);
        return -3;  // Неверное здоровье
    }
    
    fclose(file);
    return 0;  // Успех
}

// Каждый вызов требует проверки ошибок
int result = loadPlayer("save.txt", &player);
if (result == -1) {
    // Обработка ошибки файла
} else if (result == -2) {
    // Обработка ошибки чтения
} else if (result == -3) {
    // Обработка неверных данных
}
```

**Проблемы:**
- Проверки ошибок загромождают код
- Легко забыть проверить
- Ошибки могут быть проигнорированы
- Возвращаемое значение нельзя использовать для чего-то другого

---

## Часть 2: Базовая обработка исключений

Исключения предоставляют более чистый способ:

```cpp
#include <iostream>
#include <string>
#include <fstream>

// ✅ Подход с исключениями — чисто!
void loadPlayer(const std::string& filename, Player& player) {
    std::ifstream file(filename);
    if (!file) {
        throw std::runtime_error("Не удалось открыть файл: " + filename);
    }
    
    if (!(file >> player.name >> player.health)) {
        throw std::runtime_error("Неверный формат файла сохранения");
    }
    
    if (player.health < 0 || player.health > 100) {
        throw std::out_of_range("Здоровье должно быть от 0 до 100");
    }
}

int main() {
    Player player;
    
    try {
        loadPlayer("save.txt", player);
        std::cout << "Загружено: " << player.name << " (HP: " << player.health << ")" << std::endl;
    }
    catch (const std::runtime_error& e) {
        std::cerr << "Ошибка выполнения: " << e.what() << std::endl;
        // Здесь можно создать сохранение по умолчанию
    }
    catch (const std::out_of_range& e) {
        std::cerr << "Ошибка данных: " << e.what() << std::endl;
    }
    catch (const std::exception& e) {
        std::cerr << "Неизвестная ошибка: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Часть 3: Анатомия обработки исключений

### Оператор `throw`

```cpp
#include <iostream>
#include <string>

int divide(int a, int b) {
    if (b == 0) {
        throw std::runtime_error("Деление на ноль!");  // Генерация исключения
    }
    return a / b;
}

int main() {
    try {
        int result = divide(10, 0);
        std::cout << "Результат: " << result << std::endl;
    }
    catch (const std::runtime_error& e) {
        std::cout << "Перехвачено: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Поток управления с исключениями

```cpp
#include <iostream>
#include <string>

void functionC() {
    std::cout << "Функция C начинается" << std::endl;
    throw std::runtime_error("Ошибка в C!");
    std::cout << "Функция C заканчивается (никогда не достигнуто)" << std::endl;
}

void functionB() {
    std::cout << "Функция B начинается" << std::endl;
    functionC();
    std::cout << "Функция B заканчивается (никогда не достигнуто)" << std::endl;
}

void functionA() {
    std::cout << "Функция A начинается" << std::endl;
    try {
        functionB();
    }
    catch (const std::runtime_error& e) {
        std::cout << "Перехвачено в A: " << e.what() << std::endl;
    }
    std::cout << "Функция A продолжается после catch" << std::endl;
}

int main() {
    std::cout << "Main начинается" << std::endl;
    functionA();
    std::cout << "Main заканчивается" << std::endl;
    return 0;
}
```

**Вывод:**
```
Main начинается
Функция A начинается
Функция B начинается
Функция C начинается
Перехвачено в A: Ошибка в C!
Функция A продолжается после catch
Main заканчивается
```

---

## Часть 4: Стандартные типы исключений

C++ предоставляет иерархию типов исключений:

```cpp
#include <iostream>
#include <exception>
#include <stdexcept>
#include <new>
#include <typeinfo>

int main() {
    try {
        // std::runtime_error — общие проблемы времени выполнения
        throw std::runtime_error("Что-то пошло не так");
    }
    catch (const std::runtime_error& e) {
        std::cout << "Ошибка выполнения: " << e.what() << std::endl;
    }
    
    try {
        // std::out_of_range — индекс вне диапазона
        std::vector<int> vec;
        vec.at(100);  // Генерирует std::out_of_range
    }
    catch (const std::out_of_range& e) {
        std::cout << "Выход за диапазон: " << e.what() << std::endl;
    }
    
    try {
        // std::invalid_argument — неверный параметр
        int x = std::stoi("не число");  // Генерирует std::invalid_argument
    }
    catch (const std::invalid_argument& e) {
        std::cout << "Неверный аргумент: " << e.what() << std::endl;
    }
    
    try {
        // std::bad_alloc — нехватка памяти
        int* p = new int[1000000000000];  // Может сгенерировать std::bad_alloc
    }
    catch (const std::bad_alloc& e) {
        std::cout << "Нехватка памяти: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Иерархия исключений

```
std::exception
├── std::logic_error
│   ├── std::invalid_argument
│   ├── std::domain_error
│   ├── std::length_error
│   ├── std::out_of_range
│   └── std::future_error
└── std::runtime_error
    ├── std::range_error
    ├── std::overflow_error
    ├── std::underflow_error
    └── std::system_error
```

---

## Часть 5: Пользовательские исключения

Создайте свои типы исключений для игровых ошибок:

```cpp
#include <iostream>
#include <exception>
#include <string>

// Базовое игровое исключение
class GameException : public std::exception {
private:
    std::string message;
    
public:
    explicit GameException(const std::string& msg) : message(msg) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
};

// Специфические игровые исключения
class SaveFileCorruptedException : public GameException {
public:
    explicit SaveFileCorruptedException(const std::string& file)
        : GameException("Файл сохранения повреждён: " + file) {}
};

class InventoryFullException : public GameException {
public:
    InventoryFullException() : GameException("Инвентарь заполнен! Нельзя добавить предмет.") {}
};

class InvalidStatsException : public GameException {
public:
    InvalidStatsException(const std::string& stat, int value)
        : GameException("Неверное значение " + stat + ": " + std::to_string(value)) {}
};

// Использование пользовательских исключений
void addItemToInventory(Inventory& inv, const Item& item) {
    if (inv.isFull()) {
        throw InventoryFullException();
    }
    inv.add(item);
}

void loadSaveFile(const std::string& filename) {
    // Симуляция повреждённого сохранения
    if (filename == "bad.sav") {
        throw SaveFileCorruptedException(filename);
    }
}

void createCharacter(const std::string& name, int health) {
    if (health < 1 || health > 999) {
        throw InvalidStatsException("здоровье", health);
    }
    // Создание персонажа...
}

int main() {
    Inventory inventory(5);  // Максимум 5 предметов
    
    try {
        for (int i = 0; i < 10; i++) {
            addItemToInventory(inventory, Item{"Зелье", 50});
        }
    }
    catch (const InventoryFullException& e) {
        std::cerr << "Ошибка инвентаря: " << e.what() << std::endl;
    }
    
    try {
        loadSaveFile("bad.sav");
    }
    catch (const SaveFileCorruptedException& e) {
        std::cerr << "Ошибка сохранения: " << e.what() << std::endl;
        // Можно попробовать загрузить автосохранение или начать новую игру
    }
    
    try {
        createCharacter("Каэлен", 1000);
    }
    catch (const InvalidStatsException& e) {
        std::cerr << "Ошибка создания: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Часть 6: Повторная генерация и вложенные исключения

Иногда нужно перехватить, залогировать и сгенерировать исключение снова:

```cpp
#include <iostream>
#include <exception>
#include <fstream>

void criticalOperation() {
    throw std::runtime_error("Соединение с базой данных потеряно");
}

void gameLogic() {
    try {
        criticalOperation();
    }
    catch (const std::exception& e) {
        // Логирование ошибки
        std::cerr << "[LOG] Ошибка в gameLogic: " << e.what() << std::endl;
        
        // Добавление контекста и повторная генерация
        throw std::runtime_error(std::string("Сбой игровой логики: ") + e.what());
    }
}

int main() {
    try {
        gameLogic();
    }
    catch (const std::exception& e) {
        std::cerr << "Фатально: " << e.what() << std::endl;
        // Показать сообщение об ошибке игроку
        // Попытка безопасного завершения
    }
    
    return 0;
}
```

---

## Часть 7: Гарантии безопасности исключений

Функции должны обеспечивать один из трёх уровней безопасности:

### 1. Базовая гарантия — Нет утечек, корректное состояние

```cpp
class Player {
private:
    std::string name;
    int* achievements;
    int achievementCount;
    
public:
    // Базовая гарантия: если сгенерировано исключение, утечки памяти нет
    void addAchievement(const std::string& achievement) {
        int* newArray = new int[achievementCount + 1];
        
        try {
            // Копирование существующих (может сгенерировать исключение)
            for (int i = 0; i < achievementCount; i++) {
                newArray[i] = achievements[i];
            }
            // Добавление нового (может сгенерировать исключение)
            newArray[achievementCount] = encodeAchievement(achievement);
        }
        catch (...) {
            delete[] newArray;
            throw;  // Повторная генерация, но память очищена
        }
        
        // Только теперь изменение состояния
        delete[] achievements;
        achievements = newArray;
        achievementCount++;
    }
};
```

### 2. Сильная гарантия — Как транзакция (всё или ничего)

```cpp
class BankAccount {
    int balance;
    
public:
    // Сильная гарантия: либо успех полностью, либо ничего не меняется
    void transfer(BankAccount& target, int amount) {
        // Проверка возможности
        if (amount > balance) {
            throw std::runtime_error("Недостаточно средств");
        }
        
        // Создание временных копий для отката
        int tempBalance = balance - amount;
        int tempTargetBalance = target.balance + amount;
        
        // Фиксация (операции без генерации исключений)
        balance = tempBalance;
        target.balance = tempTargetBalance;
    }
};
```

### 3. Гарантия отсутствия исключений — Никогда не генерирует

```cpp
class SimpleVector {
    int* data;
    int size;
    
public:
    // Гарантия отсутствия исключений
    int getSize() const noexcept {
        return size;
    }
    
    // Гарантия отсутствия исключений
    void swap(SimpleVector& other) noexcept {
        std::swap(data, other.data);
        std::swap(size, other.size);
    }
};
```

---

## Полный пример: Надёжная система сохранения игр

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include <ctime>

// Пользовательские исключения
class SaveException : public std::exception {
protected:
    std::string message;
public:
    explicit SaveException(const std::string& msg) : message(msg) {}
    const char* what() const noexcept override { return message.c_str(); }
};

class FileOpenException : public SaveException {
public:
    explicit FileOpenException(const std::string& filename)
        : SaveException("Не удалось открыть файл: " + filename) {}
};

class CorruptSaveException : public SaveException {
public:
    explicit CorruptSaveException(const std::string& details)
        : SaveException("Файл сохранения повреждён: " + details) {}
};

class WriteProtectionException : public SaveException {
public:
    explicit WriteProtectionException(const std::string& filename)
        : SaveException("Не удалось записать в защищённый файл: " + filename) {}
};

// Структуры игровых данных
struct GameStats {
    int level;
    int health;
    int gold;
    float playTime;
    
    void save(std::ofstream& file) const {
        file << level << '\n' << health << '\n' << gold << '\n' << playTime << '\n';
    }
    
    void load(std::ifstream& file) {
        file >> level >> health >> gold >> playTime;
        if (file.fail()) {
            throw CorruptSaveException("Неверный формат статистики");
        }
    }
};

struct InventoryItem {
    std::string name;
    int quantity;
    
    void save(std::ofstream& file) const {
        file << name << '\n' << quantity << '\n';
    }
    
    void load(std::ifstream& file) {
        std::getline(file, name);
        file >> quantity;
        file.ignore();
        if (file.fail()) {
            throw CorruptSaveException("Неверный формат предмета");
        }
    }
};

struct SaveData {
    std::string playerName;
    std::time_t timestamp;
    GameStats stats;
    std::vector<InventoryItem> inventory;
    
    void save(const std::string& filename) const {
        std::ofstream file(filename);
        if (!file) {
            throw FileOpenException(filename);
        }
        
        try {
            // Запись заголовка
            file << "=== СОХРАНЁННАЯ ИГРА ===\n";
            file << playerName << '\n';
            file << timestamp << '\n';
            
            // Запись статистики
            stats.save(file);
            
            // Запись инвентаря
            file << inventory.size() << '\n';
            for (const auto& item : inventory) {
                item.save(file);
            }
            
            file << "=== КОНЕЦ ===\n";
            
            if (!file) {
                throw WriteProtectionException(filename);
            }
        }
        catch (const std::exception& e) {
            throw SaveException(std::string("Ошибка сохранения: ") + e.what());
        }
    }
    
    void load(const std::string& filename) {
        std::ifstream file(filename);
        if (!file) {
            throw FileOpenException(filename);
        }
        
        std::string line;
        
        try {
            // Чтение заголовка
            std::getline(file, line);
            if (line != "=== СОХРАНЁННАЯ ИГРА ===") {
                throw CorruptSaveException("Неверный заголовок файла");
            }
            
            // Чтение данных игрока
            std::getline(file, playerName);
            file >> timestamp;
            file.ignore();
            
            // Чтение статистики
            stats.load(file);
            
            // Чтение инвентаря
            int inventorySize;
            file >> inventorySize;
            file.ignore();
            
            inventory.clear();
            for (int i = 0; i < inventorySize; i++) {
                InventoryItem item;
                item.load(file);
                inventory.push_back(item);
            }
            
            // Чтение футера
            std::getline(file, line);
            if (line != "=== КОНЕЦ ===") {
                throw CorruptSaveException("Отсутствует маркер конца");
            }
        }
        catch (const CorruptSaveException&) {
            throw;
        }
        catch (const std::exception& e) {
            throw CorruptSaveException(std::string("Ошибка парсинга: ") + e.what());
        }
    }
    
    void display() const {
        std::cout << "\n=== СОХРАНЁННАЯ ИГРА ===" << std::endl;
        std::cout << "Игрок: " << playerName << std::endl;
        std::cout << "Сохранено: " << std::ctime(&timestamp);
        std::cout << "Уровень: " << stats.level << std::endl;
        std::cout << "Здоровье: " << stats.health << std::endl;
        std::cout << "Золото: " << stats.gold << std::endl;
        std::cout << "Время игры: " << stats.playTime << " часов" << std::endl;
        
        std::cout << "\nИнвентарь:" << std::endl;
        for (const auto& item : inventory) {
            std::cout << "  - " << item.name << " x" << item.quantity << std::endl;
        }
    }
};

// Менеджер сохранений с логикой повторных попыток
class SaveManager {
private:
    static constexpr int MAX_RETRIES = 3;
    
public:
    static void saveWithRetry(const SaveData& data, const std::string& filename) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                data.save(filename);
                std::cout << "✓ Игра успешно сохранена!" << std::endl;
                return;
            }
            catch (const FileOpenException& e) {
                std::cerr << "Попытка " << attempt << " не удалась: " << e.what() << std::endl;
                if (attempt == MAX_RETRIES) throw;
                // Можно попробовать другое имя файла или директорию
            }
            catch (const WriteProtectionException& e) {
                std::cerr << "Попытка " << attempt << " не удалась: " << e.what() << std::endl;
                if (attempt == MAX_RETRIES) throw;
            }
        }
    }
    
    static SaveData loadWithBackup(const std::string& filename) {
        std::string backupFile = filename + ".backup";
        
        try {
            SaveData data;
            data.load(filename);
            return data;
        }
        catch (const CorruptSaveException& e) {
            std::cerr << "Основное сохранение повреждено: " << e.what() << std::endl;
            
            // Попытка загрузить резервную копию
            try {
                SaveData backup;
                backup.load(backupFile);
                std::cout << "✓ Загружено из резервной копии!" << std::endl;
                return backup;
            }
            catch (const std::exception& e2) {
                throw SaveException("Основное сохранение и резервная копия повреждены");
            }
        }
    }
};

int main() {
    // Создание тестовых данных
    SaveData gameData;
    gameData.playerName = "Каэлен";
    gameData.timestamp = std::time(nullptr);
    gameData.stats = {5, 85, 1250, 12.5f};
    gameData.inventory = {
        {"Железный меч", 1},
        {"Зелье здоровья", 5},
        {"Зелье маны", 3},
        {"Кожаная броня", 1}
    };
    
    // Сохранение игры с повторными попытками
    std::cout << "=== СОХРАНЕНИЕ ИГРЫ ===" << std::endl;
    try {
        SaveManager::saveWithRetry(gameData, "savegame.dat");
        
        // Создание резервной копии
        SaveManager::saveWithRetry(gameData, "savegame.dat.backup");
    }
    catch (const SaveException& e) {
        std::cerr << "Фатальная ошибка сохранения: " << e.what() << std::endl;
        return 1;
    }
    
    // Загрузка игры с резервным вариантом
    std::cout << "\n=== ЗАГРУЗКА ИГРЫ ===" << std::endl;
    try {
        SaveData loaded = SaveManager::loadWithBackup("savegame.dat");
        loaded.display();
    }
    catch (const SaveException& e) {
        std::cerr << "Фатальная ошибка загрузки: " << e.what() << std::endl;
        std::cout << "Начинаем новую игру..." << std::endl;
    }
    
    return 0;
}
```

---

## Частые ошибки

### 1. Перехват по значению (срезка объекта)

```cpp
try {
    throw std::runtime_error("Ошибка");
}
catch (std::exception e) {  // ❌ Срезка исключения!
    // e — это просто std::exception, информация о runtime_error потеряна
}

// ✅ Перехват по константной ссылке
catch (const std::exception& e) {
    std::cout << e.what() << std::endl;
}
```

### 2. Генерация исключений в деструкторах

```cpp
class BadClass {
public:
    ~BadClass() {
        throw std::runtime_error("Ошибка");  // ❌ НИКОГДА не генерируйте в деструкторе!
    }
};

// Если исключение генерируется во время раскрутки стека (другое исключение активно),
// std::terminate вызывается немедленно — программа падает!
```

### 3. Игнорирование исключений

```cpp
try {
    dangerousOperation();
}
catch (...) {
    // ❌ Пустой catch молча проглатывает все ошибки
}

// ✅ Хотя бы логируйте
catch (const std::exception& e) {
    std::cerr << "Ошибка: " << e.what() << std::endl;
}
```

### 4. Использование исключений для обычного управления потоком

```cpp
// ❌ Плохо — исключения для исключительных случаев
try {
    int result = divide(a, b);
}
catch (const DivisionByZero& e) {
    // Обработка деления на ноль
}

// ✅ Лучше — проверка до операции
if (b != 0) {
    int result = divide(a, b);
} else {
    // Обработка случая с нулём
}
```

---

## Шпаргалка

```cpp
#include <exception>
#include <stdexcept>

// Генерация
throw std::runtime_error("Сообщение об ошибке");
throw std::invalid_argument("Неверное значение");
throw std::out_of_range("Индекс слишком велик");

// Перехват
try {
    // Опасный код
}
catch (const std::runtime_error& e) {
    std::cerr << e.what() << std::endl;
}
catch (const std::exception& e) {
    // Перехват любого std::exception
}
catch (...) {
    // Перехват чего угодно (используйте с осторожностью)
}

// Пользовательское исключение
class MyException : public std::exception {
    const char* what() const noexcept override {
        return "Моя ошибка";
    }
};

// Гарантия отсутствия исключений (функция никогда не генерирует)
void safeFunction() noexcept {
    // Только код, который не генерирует исключений
}

// Повторная генерация
try {
    // код
}
catch (...) {
    // Логирование или очистка
    throw;  // Повторная генерация исходного исключения
}
```

---

## Когда использовать исключения

### ✅ Хорошие случаи использования

```cpp
// Ошибка в конструкторе
Player::Player(const std::string& name) {
    if (name.empty()) {
        throw std::invalid_argument("Имя игрока не может быть пустым");
    }
}

// Операции с файлами
void loadFile(const std::string& path) {
    std::ifstream file(path);
    if (!file) {
        throw std::runtime_error("Не удалось открыть: " + path);
    }
}

// Выход за границы (контейнер)
T& at(size_t index) {
    if (index >= size) {
        throw std::out_of_range("Индекс вне диапазона");
    }
    return data[index];
}
```

### ❌ Плохие случаи использования

```cpp
// Не используйте для обычного управления потоком
if (player.hasItem("ключ")) {
    // Использовать дверь
}

// Не для ожидаемых случаев (конец файла)
while (true) {
    try {
        int value = readInt();
        // обработка
    }
    catch (EOFException&) {
        break;
    }
}

// Не для критичного к производительности кода (исключения медленные)
for (int i = 0; i < 1000000; i++) {
    try {
        process(i);
    }
    catch (...) { }
}
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Напишите функцию `int safeDivide(int a, int b)`, которая генерирует `std::runtime_error`, когда b равно нулю. Протестируйте с try/catch.

**Упражнение 2 (Среднее):** Создайте класс `BankAccount` с методом `withdraw`. Генерируйте `InsufficientFundsException` (пользовательское), если баланс недостаточен.

**Упражнение 3 (Среднее):** Напишите функцию, которая читает число из пользовательского ввода. Генерируйте `InvalidInputException`, если ввод не является числом. Продолжайте спрашивать до получения корректного значения.

**Упражнение 4 (Сложное):** Реализуйте класс `ResourceManager`, который загружает текстуры/звуки. Используйте RAII с исключениями — если один ресурс не загружается, очистите уже загруженные и сгенерируйте исключение снова.

**Упражнение 5 (Сложное):** Создайте функцию `parseConfig`, которая читает файл конфигурации. Обрабатывайте отсутствие файла, некорректные строки, неверные значения с помощью специфических исключений. Предоставляйте полезные сообщения об ошибках с номерами строк.

**Упражнение 6 (Вызов):** Создайте "Транзакционную систему" с поддержкой отката при исключении. Если какой-либо шаг многошаговой операции (покупка предмета, списание золота, добавление в инвентарь, обновление квеста) не удаётся, откатите все предыдущие изменения.

---

## Резюме

Теперь вы знаете:

✅ Что такое исключения и почему они лучше кодов ошибок  
✅ Синтаксис `try`/`catch`/`throw`  
✅ Стандартную иерархию исключений  
✅ Создание пользовательских исключений для игр  
✅ Уровни безопасности исключений (базовый, сильный, без исключений)  
✅ Полную надёжную систему сохранения с повторными попытками и резервными копиями  
✅ Когда использовать (и не использовать) исключения  

## Что дальше?

Следующий урок: **Шаблоны** — пишите код один раз, используйте с любым типом! Создавайте обобщённые контейнеры и алгоритмы.

---

## Ресурсы

- [Исключения C++ (cppreference)](https://en.cppreference.com/w/cpp/error/exception)
- [Стандартные типы исключений](https://en.cppreference.com/w/cpp/error/exception#Standard_exception_types)
- [Безопасность исключений](https://en.cppreference.com/w/cpp/language/exceptions)

---

**Практическое задание:** Создайте "Менеджер модов" для игры. Загружайте моды из DLL-файлов. Обрабатывайте исключения, когда моды не загружаются (отсутствие зависимостей, несовместимые версии). Гарантируйте, что если один мод не загружается, остальные всё равно загружаются и игра продолжается. Логируйте все ошибки в файл для отладки.