---
title: "Контейнеры STL — Vector, Map, Set и другие"
description: "Освойте контейнеры стандартной библиотеки C++ для эффективного управления данными"
pubDate: 2026-05-15
tags: ["C++", "intermediate", "STL", "containers", "data-structures"]
lang: "ru"
lessonNumber: 205
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 15: Контейнеры STL — Vector, Map, Set и другие

Добро пожаловать обратно! Вы уже использовали `std::vector`. Теперь пришло время освоить **всю библиотеку контейнеров STL** — правильный инструмент для каждой задачи.

## Что вы изучите

- Контейнеры последовательностей: `vector`, `deque`, `list`, `array`
- Ассоциативные контейнеры: `set`, `map`, `multiset`, `multimap`
- Неупорядоченные контейнеры: `unordered_set`, `unordered_map`
- Адаптеры контейнеров: `stack`, `queue`, `priority_queue`
- Когда использовать каждый контейнер
- Реальные игровые примеры: инвентарь, управление сущностями, кэши

---

## Часть 1: Зоопарк контейнеров STL

C++ предоставляет множество контейнеров с разными характеристиками производительности:

| Контейнер | Доступ | Вставка/Удаление | Память | Когда использовать |
|-----------|--------|---------------|--------|--------------|
| `vector` | O(1) произвольный | O(n) в середине, O(1) в конце | Непрерывная | Выбор по умолчанию |
| `deque` | O(1) произвольный | O(1) в начало/конец | Сегментированная | Нужен push_front |
| `list` | O(n) линейный | O(1) в любом месте | Связанная | Частые вставки в середину |
| `array` | O(1) произвольный | Фиксированный размер | Непрерывная | Фиксированный размер на этапе компиляции |
| `set` | O(log n) | O(log n) | Связанная | Уникальные упорядоченные ключи |
| `map` | O(log n) | O(log n) | Связанная | Пары ключ-значение, упорядоченные |
| `unordered_set` | O(1) средн. | O(1) средн. | Хеш-таблица | Быстрый поиск, порядок не важен |
| `unordered_map` | O(1) средн. | O(1) средн. | Хеш-таблица | Быстрый поиск по ключу-значению |

---

## Часть 2: Vector — ваш швейцарский нож

Вы уже знаете `vector`. Давайте рассмотрим продвинутые операции:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> scores = {95, 87, 100, 76, 92};
    
    // Управление ёмкостью
    std::cout << "Размер: " << scores.size() << std::endl;
    std::cout << "Ёмкость: " << scores.capacity() << std::endl;
    
    // Резервирование места для избежания перевыделений
    scores.reserve(100);
    std::cout << "После reserve(100): " << scores.capacity() << std::endl;
    
    // Сжатие до размера (C++11)
    scores.shrink_to_fit();
    
    // Emplace (конструирование на месте, эффективнее push_back)
    scores.emplace_back(88);  // То же, что push_back, но конструирует на месте
    
    // Вставка в позицию
    scores.insert(scores.begin() + 2, 99);
    
    // Удаление по позиции
    scores.erase(scores.begin() + 1);
    
    // Удаление по значению (удаление всех 99)
    scores.erase(std::remove(scores.begin(), scores.end(), 99), scores.end());
    
    // Проверка на пустоту
    if (!scores.empty()) {
        std::cout << "Первый результат: " << scores.front() << std::endl;
        std::cout << "Последний результат: " << scores.back() << std::endl;
    }
    
    // Очистка всех элементов
    scores.clear();
    
    return 0;
}
```

---

## Часть 3: Deque — двусторонняя очередь

`deque` позволяет быструю вставку с **обоих концов**.

```cpp
#include <iostream>
#include <deque>
#include <string>

int main() {
    std::deque<std::string> messageQueue;
    
    // Добавление в конец (как vector)
    messageQueue.push_back("Игрок присоединился");
    messageQueue.push_back("Игрок отправил сообщение");
    
    // Добавление в начало
    messageQueue.push_front("Система: Сервер подключён");
    
    // Доступ как у vector (произвольный)
    std::cout << "Первый: " << messageQueue[0] << std::endl;
    std::cout << "Последний: " << messageQueue.back() << std::endl;
    
    // Удаление из начала
    while (!messageQueue.empty()) {
        std::cout << "Обработка: " << messageQueue.front() << std::endl;
        messageQueue.pop_front();
    }
    
    return 0;
}
```

### Реальный пример: Система повторов

```cpp
#include <iostream>
#include <deque>
#include <chrono>
#include <string>

struct GameEvent {
    std::string type;
    float timestamp;
    std::string data;
};

class ReplayBuffer {
private:
    std::deque<GameEvent> events;
    int maxSize;
    
public:
    ReplayBuffer(int size = 100) : maxSize(size) {}
    
    void recordEvent(const std::string& type, const std::string& data) {
        GameEvent event;
        event.type = type;
        event.timestamp = getCurrentTime();
        event.data = data;
        
        events.push_back(event);
        
        // Хранение только последних N событий
        while (events.size() > maxSize) {
            events.pop_front();
        }
    }
    
    void replay() const {
        std::cout << "=== ПОВТОР ПОСЛЕДНИХ " << events.size() << " СОБЫТИЙ ===" << std::endl;
        for (const auto& event : events) {
            std::cout << "[" << event.timestamp << "] " 
                      << event.type << ": " << event.data << std::endl;
        }
    }
    
private:
    float getCurrentTime() const {
        auto now = std::chrono::steady_clock::now();
        auto duration = now.time_since_epoch();
        return std::chrono::duration<float>(duration).count();
    }
};

int main() {
    ReplayBuffer replay(5);  // Хранение последних 5 событий
    
    replay.recordEvent("INPUT", "Прыжок");
    replay.recordEvent("COLLISION", "Игрок ударил врага");
    replay.recordEvent("ITEM", "Подобран меч");
    replay.recordEvent("INPUT", "Атака");
    replay.recordEvent("DAMAGE", "Нанесено 25 урона");
    replay.recordEvent("LEVEL_UP", "Уровень 2!");  // Самое старое будет удалено
    
    replay.replay();
    
    return 0;
}
```

---

## Часть 4: List — связный список

`list` обеспечивает O(1) вставку в любом месте, но O(n) доступ.

```cpp
#include <iostream>
#include <list>
#include <string>

int main() {
    std::list<int> numbers = {1, 2, 3, 4, 5};
    
    // Вставка в начало (O(1))
    numbers.push_front(0);
    
    // Вставка в конец (O(1))
    numbers.push_back(6);
    
    // Поиск элемента (O(n))
    auto it = std::find(numbers.begin(), numbers.end(), 3);
    if (it != numbers.end()) {
        // Вставка перед найденным элементом
        numbers.insert(it, 99);
    }
    
    // Удаление элемента по значению
    numbers.remove(99);
    
    // Удаление элементов, удовлетворяющих условию
    numbers.remove_if([](int n) { return n % 2 == 0; });  // Удаление чётных
    
    // Сращивание (перемещение элементов из другого списка)
    std::list<int> other = {100, 200, 300};
    numbers.splice(numbers.end(), other);  // Перемещение всех в конец
    
    // Слияние отсортированных списков
    std::list<int> sorted1 = {1, 3, 5, 7};
    std::list<int> sorted2 = {2, 4, 6, 8};
    sorted1.merge(sorted2);  // sorted2 становится пустым, sorted1 содержит 1-8
    
    // Уникальность (удаление последовательных дубликатов)
    std::list<int> dupes = {1, 1, 2, 2, 3, 3, 3};
    dupes.unique();  // {1, 2, 3}
    
    // Сортировка (у list есть собственная эффективная сортировка)
    numbers.sort();
    
    // Реверс
    numbers.reverse();
    
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Реальный пример: Менеджер сущностей с частым созданием/удалением

```cpp
#include <iostream>
#include <list>
#include <string>
#include <memory>
#include <algorithm>

struct Entity {
    int id;
    std::string name;
    float x, y;
    bool active;
    
    Entity(int i, const std::string& n) : id(i), name(n), x(0), y(0), active(true) {}
};

class EntityManager {
private:
    std::list<std::unique_ptr<Entity>> entities;
    int nextId;
    
public:
    EntityManager() : nextId(1) {}
    
    Entity* createEntity(const std::string& name) {
        auto entity = std::make_unique<Entity>(nextId++, name);
        Entity* ptr = entity.get();
        entities.push_back(std::move(entity));
        return ptr;
    }
    
    void destroyEntity(int id) {
        auto it = std::find_if(entities.begin(), entities.end(),
            [id](const auto& e) { return e->id == id; });
        
        if (it != entities.end()) {
            entities.erase(it);
        }
    }
    
    void updateAll(float dt) {
        for (auto& entity : entities) {
            // Логика обновления сущности
            entity->x += dt * 50;  // Движение вправо
        }
    }
    
    void renderAll() const {
        std::cout << "=== СУЩНОСТИ (" << entities.size() << ") ===" << std::endl;
        for (const auto& entity : entities) {
            std::cout << "ID: " << entity->id 
                      << ", Имя: " << entity->name
                      << ", Поз: (" << entity->x << ", " << entity->y << ")"
                      << std::endl;
        }
    }
};

int main() {
    EntityManager manager;
    
    // Создание множества сущностей
    for (int i = 0; i < 10; i++) {
        manager.createEntity("Враг_" + std::to_string(i));
    }
    
    // Удаление некоторых
    manager.destroyEntity(3);
    manager.destroyEntity(5);
    manager.destroyEntity(7);
    
    // Обновление и отрисовка
    for (int frame = 0; frame < 5; frame++) {
        manager.updateAll(0.016f);
    }
    
    manager.renderAll();
    
    return 0;
}
```

---

## Часть 5: Map — пары ключ-значение

`map` хранит пары ключ-значение, отсортированные по ключу (O(log n) операции).

```cpp
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> highScores;
    
    // Вставка
    highScores["Каэлен"] = 2500;
    highScores["Ария"] = 3100;
    highScores["Торн"] = 1800;
    
    // Вставка с pair
    highScores.insert({"Луна", 2900});
    
    // Вставка с emplace (C++11)
    highScores.emplace("Зейн", 2200);
    
    // Доступ (создаёт, если не существует!)
    int score = highScores["Каэлен"];  // Существует -> 2500
    int newScore = highScores["Новый игрок"];  // Создаёт с 0!
    
    // Проверка существования (не создаёт)
    if (highScores.find("Ария") != highScores.end()) {
        std::cout << "Счёт Арии: " << highScores["Ария"] << std::endl;
    }
    
    // Итерация (сортировка по ключу)
    for (const auto& [name, score] : highScores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    // Подсчёт элементов с ключом (0 или 1 для map)
    std::cout << "Количество 'Каэлен': " << highScores.count("Каэлен") << std::endl;
    
    // Удаление по ключу
    highScores.erase("Новый игрок");
    
    // Удаление по итератору
    auto it = highScores.find("Зейн");
    if (it != highScores.end()) {
        highScores.erase(it);
    }
    
    return 0;
}
```

### Реальный пример: Система конфигурации игры

```cpp
#include <iostream>
#include <map>
#include <string>
#include <any>
#include <sstream>

class ConfigManager {
private:
    std::map<std::string, std::string> config;
    
public:
    template <typename T>
    void set(const std::string& key, const T& value) {
        std::stringstream ss;
        ss << value;
        config[key] = ss.str();
    }
    
    template <typename T>
    T get(const std::string& key, const T& defaultValue = T{}) const {
        auto it = config.find(key);
        if (it != config.end()) {
            std::stringstream ss(it->second);
            T value;
            ss >> value;
            return value;
        }
        return defaultValue;
    }
    
    void loadFromFile(const std::string& filename) {
        // Симуляция загрузки
        config["screen_width"] = "1920";
        config["screen_height"] = "1080";
        config["fullscreen"] = "1";
        config["master_volume"] = "0.75";
        config["difficulty"] = "normal";
    }
    
    void printAll() const {
        std::cout << "=== КОНФИГУРАЦИЯ ===" << std::endl;
        for (const auto& [key, value] : config) {
            std::cout << key << " = " << value << std::endl;
        }
    }
};

int main() {
    ConfigManager config;
    config.loadFromFile("game.cfg");
    
    int width = config.get<int>("screen_width", 1280);
    int height = config.get<int>("screen_height", 720);
    bool fullscreen = config.get<bool>("fullscreen", false);
    float volume = config.get<float>("master_volume", 1.0f);
    std::string difficulty = config.get<std::string>("difficulty", "easy");
    
    std::cout << "Экран: " << width << "x" << height 
              << " (Полноэкранный: " << fullscreen << ")" << std::endl;
    std::cout << "Громкость: " << volume << ", Сложность: " << difficulty << std::endl;
    
    // Изменение и сохранение
    config.set("master_volume", 0.85f);
    config.printAll();
    
    return 0;
}
```

---

## Часть 6: Set — уникальные упорядоченные значения

`set` хранит уникальные значения, отсортированные (O(log n) операции).

```cpp
#include <iostream>
#include <set>
#include <string>

int main() {
    std::set<int> uniqueNumbers;
    
    // Вставка (дубликаты игнорируются)
    uniqueNumbers.insert(5);
    uniqueNumbers.insert(3);
    uniqueNumbers.insert(8);
    uniqueNumbers.insert(3);  // Игнорируется
    uniqueNumbers.insert(1);
    
    // Проверка существования
    if (uniqueNumbers.contains(5)) {  // C++20
        std::cout << "5 есть в наборе" << std::endl;
    }
    
    // Поиск
    auto it = uniqueNumbers.find(3);
    if (it != uniqueNumbers.end()) {
        std::cout << "Найдено: " << *it << std::endl;
    }
    
    // Итерация (сортировка)
    std::cout << "Содержимое набора: ";
    for (int n : uniqueNumbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    // Нижняя / верхняя граница
    auto lower = uniqueNumbers.lower_bound(3);  // Первый >= 3
    auto upper = uniqueNumbers.upper_bound(6);  // Первый > 6
    
    return 0;
}
```

### Реальный пример: Система достижений

```cpp
#include <iostream>
#include <set>
#include <string>
#include <vector>

class AchievementSystem {
private:
    std::set<std::string> unlockedAchievements;
    std::set<std::string> allAchievements;
    
public:
    AchievementSystem() {
        allAchievements = {
            "FIRST_BLOOD", "EXPLORER", "COLLECTOR", "VETERAN",
            "SPEEDRUNNER", "PERFECTIONIST", "SECRET_FINDER"
        };
    }
    
    void unlockAchievement(const std::string& achievement) {
        if (allAchievements.contains(achievement)) {
            if (unlockedAchievements.insert(achievement).second) {
                std::cout << "🏆 Достижение разблокировано: " << achievement << "! 🏆" << std::endl;
            }
        }
    }
    
    bool hasAchievement(const std::string& achievement) const {
        return unlockedAchievements.contains(achievement);
    }
    
    int getProgress() const {
        return (unlockedAchievements.size() * 100) / allAchievements.size();
    }
    
    void displayUnlocked() const {
        std::cout << "\n=== РАЗБЛОКИРОВАННЫЕ ДОСТИЖЕНИЯ (" 
                  << unlockedAchievements.size() << "/" 
                  << allAchievements.size() << ") ===" << std::endl;
        for (const auto& ach : unlockedAchievements) {
            std::cout << "  ✓ " << ach << std::endl;
        }
    }
    
    void displayLocked() const {
        std::cout << "\n=== ЗАБЛОКИРОВАННЫЕ ДОСТИЖЕНИЯ ===" << std::endl;
        for (const auto& ach : allAchievements) {
            if (!unlockedAchievements.contains(ach)) {
                std::cout << "  ❌ " << ach << std::endl;
            }
        }
    }
};

int main() {
    AchievementSystem achievements;
    
    achievements.unlockAchievement("FIRST_BLOOD");
    achievements.unlockAchievement("EXPLORER");
    achievements.unlockAchievement("FIRST_BLOOD");  // Дубликат игнорируется
    achievements.unlockAchievement("COLLECTOR");
    achievements.unlockAchievement("SPEEDRUNNER");
    
    achievements.displayUnlocked();
    achievements.displayLocked();
    
    std::cout << "\nВыполнение: " << achievements.getProgress() << "%" << std::endl;
    
    return 0;
}
```

---

## Часть 7: Неупорядоченные контейнеры — хеш-таблицы

`unordered_map` и `unordered_set` обеспечивают O(1) средние операции (без упорядочивания).

```cpp
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <string>

int main() {
    // Неупорядоченная карта (хеш-таблица)
    std::unordered_map<std::string, int> playerLevels;
    
    playerLevels["Каэлен"] = 5;
    playerLevels["Ария"] = 7;
    playerLevels["Торн"] = 3;
    
    // Быстрый поиск
    if (playerLevels.find("Ария") != playerLevels.end()) {
        std::cout << "Уровень Арии: " << playerLevels["Ария"] << std::endl;
    }
    
    // Порядок итерации НЕ гарантирован
    for (const auto& [name, level] : playerLevels) {
        std::cout << name << ": Уровень " << level << std::endl;
    }
    
    // Неупорядоченный набор
    std::unordered_set<int> visitedRooms;
    visitedRooms.insert(101);
    visitedRooms.insert(102);
    visitedRooms.insert(103);
    
    // O(1) проверка
    if (visitedRooms.contains(102)) {
        std::cout << "Комната 102 посещена!" << std::endl;
    }
    
    // Резервирование места для лучшей производительности
    visitedRooms.reserve(1000);
    
    return 0;
}
```

### Реальный пример: Кэш сетевых пакетов

```cpp
#include <iostream>
#include <unordered_map>
#include <chrono>
#include <string>
#include <thread>

struct Packet {
    int sequenceId;
    std::string data;
    std::chrono::steady_clock::time_point timestamp;
};

class PacketCache {
private:
    std::unordered_map<int, Packet> cache;
    std::chrono::seconds timeout;
    
public:
    PacketCache(int timeoutSec = 10) : timeout(timeoutSec) {}
    
    void store(int seqId, const std::string& data) {
        Packet p;
        p.sequenceId = seqId;
        p.data = data;
        p.timestamp = std::chrono::steady_clock::now();
        cache[seqId] = p;
    }
    
    bool retrieve(int seqId, std::string& outData) {
        auto it = cache.find(seqId);
        if (it == cache.end()) {
            return false;
        }
        
        auto now = std::chrono::steady_clock::now();
        auto age = std::chrono::duration_cast<std::chrono::seconds>(now - it->second.timestamp);
        
        if (age > timeout) {
            cache.erase(it);
            return false;
        }
        
        outData = it->second.data;
        return true;
    }
    
    void cleanup() {
        auto now = std::chrono::steady_clock::now();
        for (auto it = cache.begin(); it != cache.end(); ) {
            auto age = std::chrono::duration_cast<std::chrono::seconds>(now - it->second.timestamp);
            if (age > timeout) {
                it = cache.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    size_t size() const { return cache.size(); }
};

int main() {
    PacketCache cache(5);  // 5 секунд таймаута
    
    cache.store(1001, "Привет, сервер!");
    cache.store(1002, "Запрос данных игрока");
    cache.store(1003, "Подтверждение получения");
    
    std::string data;
    if (cache.retrieve(1002, data)) {
        std::cout << "Получено: " << data << std::endl;
    }
    
    std::cout << "Размер кэша: " << cache.size() << std::endl;
    
    // Симуляция прохождения времени
    std::this_thread::sleep_for(std::chrono::seconds(6));
    cache.cleanup();
    
    std::cout << "После очистки: " << cache.size() << std::endl;
    
    if (!cache.retrieve(1002, data)) {
        std::cout << "Пакет 1002 истёк" << std::endl;
    }
    
    return 0;
}
```

---

## Часть 8: Адаптеры контейнеров — Stack, Queue, Priority Queue

Они предоставляют ограниченные интерфейсы к базовым контейнерам.

```cpp
#include <iostream>
#include <stack>
#include <queue>
#include <string>

int main() {
    // Стек (LIFO)
    std::stack<int> undoStack;
    undoStack.push(10);
    undoStack.push(20);
    undoStack.push(30);
    
    while (!undoStack.empty()) {
        std::cout << "Отмена: " << undoStack.top() << std::endl;
        undoStack.pop();
    }
    
    // Очередь (FIFO)
    std::queue<std::string> taskQueue;
    taskQueue.push("Загрузка ресурсов");
    taskQueue.push("Инициализация систем");
    taskQueue.push("Запуск игры");
    
    while (!taskQueue.empty()) {
        std::cout << "Обработка: " << taskQueue.front() << std::endl;
        taskQueue.pop();
    }
    
    // Очередь с приоритетом (по умолчанию наибольший первый)
    std::priority_queue<int> damageNumbers;
    damageNumbers.push(5);
    damageNumbers.push(100);
    damageNumbers.push(25);
    damageNumbers.push(75);
    
    std::cout << "\nНанесённый урон (сначала наибольший):" << std::endl;
    while (!damageNumbers.empty()) {
        std::cout << "  " << damageNumbers.top() << " урона!" << std::endl;
        damageNumbers.pop();
    }
    
    // Очередь с приоритетом как min-heap
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    minHeap.push(100);
    minHeap.push(25);
    minHeap.push(75);
    minHeap.push(50);
    
    std::cout << "\nСначала наименьший:" << std::endl;
    while (!minHeap.empty()) {
        std::cout << "  " << minHeap.top() << std::endl;
        minHeap.pop();
    }
    
    return 0;
}
```

### Реальный пример: Система событий с приоритетом

```cpp
#include <iostream>
#include <queue>
#include <string>
#include <chrono>
#include <functional>

enum class EventPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3
};

struct GameEvent {
    EventPriority priority;
    std::string type;
    std::string data;
    std::chrono::steady_clock::time_point timestamp;
    
    // Для priority_queue (высший приоритет первый)
    bool operator<(const GameEvent& other) const {
        return static_cast<int>(priority) < static_cast<int>(other.priority);
    }
};

class EventSystem {
private:
    std::priority_queue<GameEvent> eventQueue;
    
public:
    void postEvent(EventPriority priority, const std::string& type, const std::string& data) {
        GameEvent event;
        event.priority = priority;
        event.type = type;
        event.data = data;
        event.timestamp = std::chrono::steady_clock::now();
        
        eventQueue.push(event);
        std::cout << "Событие в очереди: [" << getPriorityName(priority) 
                  << "] " << type << std::endl;
    }
    
    void processEvents() {
        std::cout << "\n=== ОБРАБОТКА СОБЫТИЙ ===" << std::endl;
        while (!eventQueue.empty()) {
            const auto& event = eventQueue.top();
            std::cout << "Обработка [" << getPriorityName(event.priority) 
                      << "] " << event.type << ": " << event.data << std::endl;
            eventQueue.pop();
        }
    }
    
private:
    std::string getPriorityName(EventPriority p) const {
        switch (p) {
            case EventPriority::LOW: return "LOW";
            case EventPriority::NORMAL: return "NORMAL";
            case EventPriority::HIGH: return "HIGH";
            case EventPriority::CRITICAL: return "CRITICAL";
            default: return "UNKNOWN";
        }
    }
};

int main() {
    EventSystem events;
    
    // Отправка событий в случайном порядке
    events.postEvent(EventPriority::NORMAL, "PLAYER_MOVE", "x=100, y=200");
    events.postEvent(EventPriority::CRITICAL, "PLAYER_DEATH", "Убит драконом");
    events.postEvent(EventPriority::LOW, "UI_UPDATE", "Обновление полосы здоровья");
    events.postEvent(EventPriority::HIGH, "COMBAT", "Нанесено 50 урона");
    events.postEvent(EventPriority::NORMAL, "SOUND", "Воспроизведение шагов");
    events.postEvent(EventPriority::CRITICAL, "SAVE_GAME", "Автосохранение");
    
    // События обрабатываются по приоритету (сначала критические)
    events.processEvents();
    
    return 0;
}
```

---

## Сравнение производительности: когда что использовать

```cpp
#include <iostream>
#include <vector>
#include <list>
#include <deque>
#include <set>
#include <unordered_set>
#include <chrono>

template<typename Container>
void benchmarkInsert(Container& container, int count, const std::string& name) {
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int i = 0; i < count; i++) {
        container.insert(container.end(), i);
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << name << " вставка: " << duration.count() << "мс" << std::endl;
}

int main() {
    const int COUNT = 100000;
    
    std::vector<int> vec;
    std::list<int> lst;
    std::deque<int> deq;
    
    benchmarkInsert(vec, COUNT, "vector");
    benchmarkInsert(lst, COUNT, "list  ");
    benchmarkInsert(deq, COUNT, "deque ");
    
    // Set vs Unordered Set
    std::set<int> orderedSet;
    std::unordered_set<int> unorderedSet;
    
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < COUNT; i++) orderedSet.insert(i);
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "set   вставка: " << duration.count() << "мс" << std::endl;
    
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < COUNT; i++) unorderedSet.insert(i);
    end = std::chrono::high_resolution_clock::now();
    duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "unordered_set вставка: " << duration.count() << "мс" << std::endl;
    
    return 0;
}
```

---

## Руководство по выбору контейнера

| Случай использования | Контейнер | Почему |
|----------|-----------|-----|
| Большинство случаев | `vector` | Быстрый, кэш-дружественный |
| Добавление/удаление с обоих концов | `deque` | O(1) начало/конец |
| Частые вставки/удаления в середине | `list` | O(1) в любом месте |
| Фиксированный размер, известный на этапе компиляции | `array` | Без выделения в куче |
| Уникальные упорядоченные ключи | `set` | O(log n) поиск |
| Пары ключ-значение, упорядоченные | `map` | Сортированная итерация |
| Быстрые уникальные ключи, порядок не важен | `unordered_set` | O(1) средн. |
| Быстрые ключ-значение, порядок не важен | `unordered_map` | O(1) средн. |
| Последним пришёл — первым ушёл | `stack` | Простой LIFO |
| Первым пришёл — первым ушёл | `queue` | Простой FIFO |
| Всегда получать наивысший приоритет | `priority_queue` | Автоматическая сортировка |

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Используйте `map` для создания счётчика частоты слов. Прочитайте предложение, подсчитайте, сколько раз встречается каждое слово.

**Упражнение 2 (Среднее):** Реализуйте простую систему инвентаря с использованием `unordered_map<string, int>`, где ключ — имя предмета, значение — количество. Добавьте функции: addItem, removeItem, getCount, listAll.

**Упражнение 3 (Среднее):** Создайте список "Недавние документы" на основе `deque`, который хранит последние 10 открытых файлов. Новые файлы добавляются в начало, старые удаляются, когда размер превышает 10.

**Упражнение 4 (Сложное):** Создайте систему "Таблица лидеров" с использованием `set` или `map`. Храните очки игроков, оставляйте топ-10, поддерживайте добавление новых очков и отображайте ранжированный список.

**Упражнение 5 (Сложное):** Реализуйте "Торговую систему", где несколько игроков предлагают предметы. Используйте `queue` для ожидающих сделок, `map` для инвентарей игроков, `set` для активных торговых предложений.

**Упражнение 6 (Вызов):** Создайте "Сетку для поиска пути" с использованием `unordered_map` с парой<int,int> в качестве ключа и данными тайла в качестве значения. Реализуйте поиск пути A* с использованием `priority_queue` для открытого множества.

---

## Резюме

Теперь вы знаете:

✅ `vector` — контейнер по умолчанию, динамический массив  
✅ `deque` — двусторонняя очередь  
✅ `list` — связный список  
✅ `map` / `set` — упорядоченные ассоциативные контейнеры  
✅ `unordered_map` / `unordered_set` — хеш-таблицы  
✅ `stack`, `queue`, `priority_queue` — адаптеры контейнеров  
✅ Реальные игровые примеры для каждого контейнера  
✅ Характеристики производительности и когда что использовать  

## Что дальше?

Следующий урок: **Алгоритмы STL** — сортировка, поиск, преобразование и многое другое с заголовком `algorithm`!

---

## Ресурсы

- [Контейнеры STL (cppreference)](https://en.cppreference.com/w/cpp/container)
- [Руководство по выбору контейнера](https://en.cppreference.com/w/cpp/container)
- [Гарантии сложности](https://en.cppreference.com/w/cpp/container#Container_operation_complexities)

---

**Практическое задание:** Создайте "Менеджер сохранений игры", который использует несколько контейнеров:
- `map` для настроек игры
- `vector` для инвентаря игрока
- `deque` для истории сообщений
- `unordered_set` для разблокированных достижений
- `stack` для отмены/повтора в редакторе персонажа
Сериализуйте всё в файл и загрузите обратно.