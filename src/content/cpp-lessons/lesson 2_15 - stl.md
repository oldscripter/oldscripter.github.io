---
title: "STL Containers — Vector, Map, Set, and More"
description: "Master C++ Standard Template Library containers for efficient data management"
pubDate: 2026-05-15
tags: ["C++", "intermediate", "STL", "containers", "data-structures"]
lessonNumber: 15
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 15: STL Containers — Vector, Map, Set, and More

Welcome back! You've already used `std::vector`. Now it's time to master the **entire STL container library** — the right tool for every job.

## What You'll Learn

- Sequence containers: `vector`, `deque`, `list`, `array`
- Associative containers: `set`, `map`, `multiset`, `multimap`
- Unordered containers: `unordered_set`, `unordered_map`
- Container adapters: `stack`, `queue`, `priority_queue`
- When to use each container
- Real game examples: inventory, entity management, caches

---

## Part 1: The STL Container Zoo

C++ provides many containers, each with different performance characteristics:

| Container | Access | Insert/Delete | Memory | When to Use |
|-----------|--------|---------------|--------|--------------|
| `vector` | O(1) random | O(n) middle, O(1) end | Contiguous | Default choice |
| `deque` | O(1) random | O(1) front/back | Segmented | Need push_front |
| `list` | O(n) linear | O(1) anywhere | Node-based | Frequent middle insert |
| `array` | O(1) random | Fixed size | Contiguous | Fixed size known at compile time |
| `set` | O(log n) | O(log n) | Node-based | Unique ordered keys |
| `map` | O(log n) | O(log n) | Node-based | Key-value pairs, ordered |
| `unordered_set` | O(1) avg | O(1) avg | Hash table | Fast lookup, no order |
| `unordered_map` | O(1) avg | O(1) avg | Hash table | Fast key-value lookup |

---

## Part 2: Vector — Your Swiss Army Knife

You know `vector` well. Let's review advanced operations:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> scores = {95, 87, 100, 76, 92};
    
    // Capacity management
    std::cout << "Size: " << scores.size() << std::endl;
    std::cout << "Capacity: " << scores.capacity() << std::endl;
    
    // Reserve space to avoid reallocations
    scores.reserve(100);
    std::cout << "After reserve(100): " << scores.capacity() << std::endl;
    
    // Shrink to fit (C++11)
    scores.shrink_to_fit();
    
    // Emplace (construct in place, more efficient than push_back)
    scores.emplace_back(88);  // Same as push_back but constructs in-place
    
    // Insert at position
    scores.insert(scores.begin() + 2, 99);
    
    // Erase by position
    scores.erase(scores.begin() + 1);
    
    // Erase by value (remove all 99s)
    scores.erase(std::remove(scores.begin(), scores.end(), 99), scores.end());
    
    // Check if empty
    if (!scores.empty()) {
        std::cout << "First score: " << scores.front() << std::endl;
        std::cout << "Last score: " << scores.back() << std::endl;
    }
    
    // Clear all elements
    scores.clear();
    
    return 0;
}
```

---

## Part 3: Deque — Double-Ended Queue

`deque` (pronounced "deck") allows fast insertion at **both ends**.

```cpp
#include <iostream>
#include <deque>
#include <string>

int main() {
    std::deque<std::string> messageQueue;
    
    // Add to back (like vector)
    messageQueue.push_back("Player joined");
    messageQueue.push_back("Player sent message");
    
    // Add to front
    messageQueue.push_front("System: Server connected");
    
    // Access like vector (random access)
    std::cout << "First: " << messageQueue[0] << std::endl;
    std::cout << "Last: " << messageQueue.back() << std::endl;
    
    // Remove from front
    while (!messageQueue.empty()) {
        std::cout << "Processing: " << messageQueue.front() << std::endl;
        messageQueue.pop_front();
    }
    
    return 0;
}
```

### Real Example: Replay System

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
        
        // Keep only last N events
        while (events.size() > maxSize) {
            events.pop_front();
        }
    }
    
    void replay() const {
        std::cout << "=== REPLAYING LAST " << events.size() << " EVENTS ===" << std::endl;
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
    ReplayBuffer replay(5);  // Keep last 5 events
    
    replay.recordEvent("INPUT", "Jump");
    replay.recordEvent("COLLISION", "Player hit enemy");
    replay.recordEvent("ITEM", "Picked up sword");
    replay.recordEvent("INPUT", "Attack");
    replay.recordEvent("DAMAGE", "Dealt 25 damage");
    replay.recordEvent("LEVEL_UP", "Level 2!");  // Oldest will be removed
    
    replay.replay();
    
    return 0;
}
```

---

## Part 4: List — Linked List

`list` provides O(1) insertion anywhere, but O(n) access.

```cpp
#include <iostream>
#include <list>
#include <string>

int main() {
    std::list<int> numbers = {1, 2, 3, 4, 5};
    
    // Insert at front (O(1))
    numbers.push_front(0);
    
    // Insert at back (O(1))
    numbers.push_back(6);
    
    // Find element (O(n))
    auto it = std::find(numbers.begin(), numbers.end(), 3);
    if (it != numbers.end()) {
        // Insert before found element
        numbers.insert(it, 99);
    }
    
    // Remove element by value
    numbers.remove(99);
    
    // Remove elements matching condition
    numbers.remove_if([](int n) { return n % 2 == 0; });  // Remove evens
    
    // Splice (move elements from another list)
    std::list<int> other = {100, 200, 300};
    numbers.splice(numbers.end(), other);  // Move all to end
    
    // Merge sorted lists
    std::list<int> sorted1 = {1, 3, 5, 7};
    std::list<int> sorted2 = {2, 4, 6, 8};
    sorted1.merge(sorted2);  // sorted2 becomes empty, sorted1 contains 1-8
    
    // Unique (remove consecutive duplicates)
    std::list<int> dupes = {1, 1, 2, 2, 3, 3, 3};
    dupes.unique();  // {1, 2, 3}
    
    // Sort (list has its own efficient sort)
    numbers.sort();
    
    // Reverse
    numbers.reverse();
    
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

### Real Example: Entity Manager with Frequent Creation/Deletion

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
            // Update entity logic
            entity->x += dt * 50;  // Move right
        }
    }
    
    void renderAll() const {
        std::cout << "=== ENTITIES (" << entities.size() << ") ===" << std::endl;
        for (const auto& entity : entities) {
            std::cout << "ID: " << entity->id 
                      << ", Name: " << entity->name
                      << ", Pos: (" << entity->x << ", " << entity->y << ")"
                      << std::endl;
        }
    }
};

int main() {
    EntityManager manager;
    
    // Spawn many entities
    for (int i = 0; i < 10; i++) {
        manager.createEntity("Enemy_" + std::to_string(i));
    }
    
    // Remove some
    manager.destroyEntity(3);
    manager.destroyEntity(5);
    manager.destroyEntity(7);
    
    // Update and render
    for (int frame = 0; frame < 5; frame++) {
        manager.updateAll(0.016f);
    }
    
    manager.renderAll();
    
    return 0;
}
```

---

## Part 5: Map — Key-Value Pairs

`map` stores key-value pairs, sorted by key (O(log n) operations).

```cpp
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> highScores;
    
    // Insert
    highScores["Kaelen"] = 2500;
    highScores["Aria"] = 3100;
    highScores["Thorne"] = 1800;
    
    // Insert with pair
    highScores.insert({"Luna", 2900});
    
    // Insert with emplace (C++11)
    highScores.emplace("Zane", 2200);
    
    // Access (creates if doesn't exist!)
    int score = highScores["Kaelen"];  // Exists -> 2500
    int newScore = highScores["NewPlayer"];  // Creates with 0!
    
    // Check existence (doesn't create)
    if (highScores.find("Aria") != highScores.end()) {
        std::cout << "Aria's score: " << highScores["Aria"] << std::endl;
    }
    
    // Iterate (sorted by key)
    for (const auto& [name, score] : highScores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    // Count elements with key (0 or 1 for map)
    std::cout << "Count of 'Kaelen': " << highScores.count("Kaelen") << std::endl;
    
    // Erase by key
    highScores.erase("NewPlayer");
    
    // Erase by iterator
    auto it = highScores.find("Zane");
    if (it != highScores.end()) {
        highScores.erase(it);
    }
    
    return 0;
}
```

### Real Example: Game Configuration System

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
        // Simulate loading
        config["screen_width"] = "1920";
        config["screen_height"] = "1080";
        config["fullscreen"] = "1";
        config["master_volume"] = "0.75";
        config["difficulty"] = "normal";
    }
    
    void printAll() const {
        std::cout << "=== CONFIGURATION ===" << std::endl;
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
    
    std::cout << "Screen: " << width << "x" << height 
              << " (Fullscreen: " << fullscreen << ")" << std::endl;
    std::cout << "Volume: " << volume << ", Difficulty: " << difficulty << std::endl;
    
    // Modify and save
    config.set("master_volume", 0.85f);
    config.printAll();
    
    return 0;
}
```

---

## Part 6: Set — Unique Ordered Values

`set` stores unique values, sorted (O(log n) operations).

```cpp
#include <iostream>
#include <set>
#include <string>

int main() {
    std::set<int> uniqueNumbers;
    
    // Insert (duplicates ignored)
    uniqueNumbers.insert(5);
    uniqueNumbers.insert(3);
    uniqueNumbers.insert(8);
    uniqueNumbers.insert(3);  // Ignored
    uniqueNumbers.insert(1);
    
    // Check if exists
    if (uniqueNumbers.contains(5)) {  // C++20
        std::cout << "5 is in the set" << std::endl;
    }
    
    // Find
    auto it = uniqueNumbers.find(3);
    if (it != uniqueNumbers.end()) {
        std::cout << "Found: " << *it << std::endl;
    }
    
    // Iterate (sorted)
    std::cout << "Set contents: ";
    for (int n : uniqueNumbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    // Lower bound / upper bound
    auto lower = uniqueNumbers.lower_bound(3);  // First >= 3
    auto upper = uniqueNumbers.upper_bound(6);  // First > 6
    
    return 0;
}
```

### Real Example: Achievement System

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
                std::cout << "🏆 Achievement Unlocked: " << achievement << "! 🏆" << std::endl;
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
        std::cout << "\n=== UNLOCKED ACHIEVEMENTS (" 
                  << unlockedAchievements.size() << "/" 
                  << allAchievements.size() << ") ===" << std::endl;
        for (const auto& ach : unlockedAchievements) {
            std::cout << "  ✓ " << ach << std::endl;
        }
    }
    
    void displayLocked() const {
        std::cout << "\n=== LOCKED ACHIEVEMENTS ===" << std::endl;
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
    achievements.unlockAchievement("FIRST_BLOOD");  // Duplicate ignored
    achievements.unlockAchievement("COLLECTOR");
    achievements.unlockAchievement("SPEEDRUNNER");
    
    achievements.displayUnlocked();
    achievements.displayLocked();
    
    std::cout << "\nCompletion: " << achievements.getProgress() << "%" << std::endl;
    
    return 0;
}
```

---

## Part 7: Unordered Containers — Hash Tables

`unordered_map` and `unordered_set` provide O(1) average operations (no ordering).

```cpp
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <string>

int main() {
    // Unordered map (hash table)
    std::unordered_map<std::string, int> playerLevels;
    
    playerLevels["Kaelen"] = 5;
    playerLevels["Aria"] = 7;
    playerLevels["Thorne"] = 3;
    
    // Fast lookup
    if (playerLevels.find("Aria") != playerLevels.end()) {
        std::cout << "Aria's level: " << playerLevels["Aria"] << std::endl;
    }
    
    // Iteration order is NOT guaranteed
    for (const auto& [name, level] : playerLevels) {
        std::cout << name << ": Level " << level << std::endl;
    }
    
    // Unordered set
    std::unordered_set<int> visitedRooms;
    visitedRooms.insert(101);
    visitedRooms.insert(102);
    visitedRooms.insert(103);
    
    // O(1) check
    if (visitedRooms.contains(102)) {
        std::cout << "Room 102 visited!" << std::endl;
    }
    
    // Reserve space for better performance
    visitedRooms.reserve(1000);
    
    return 0;
}
```

### Real Example: Network Packet Cache

```cpp
#include <iostream>
#include <unordered_map>
#include <chrono>
#include <string>

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
    PacketCache cache(5);  // 5 second timeout
    
    cache.store(1001, "Hello, server!");
    cache.store(1002, "Requesting player data");
    cache.store(1003, "Confirming receipt");
    
    std::string data;
    if (cache.retrieve(1002, data)) {
        std::cout << "Retrieved: " << data << std::endl;
    }
    
    std::cout << "Cache size: " << cache.size() << std::endl;
    
    // Simulate time passing
    std::this_thread::sleep_for(std::chrono::seconds(6));
    cache.cleanup();
    
    std::cout << "After cleanup: " << cache.size() << std::endl;
    
    if (!cache.retrieve(1002, data)) {
        std::cout << "Packet 1002 expired" << std::endl;
    }
    
    return 0;
}
```

---

## Part 8: Container Adapters — Stack, Queue, Priority Queue

These provide restricted interfaces to underlying containers.

```cpp
#include <iostream>
#include <stack>
#include <queue>
#include <string>

int main() {
    // Stack (LIFO)
    std::stack<int> undoStack;
    undoStack.push(10);
    undoStack.push(20);
    undoStack.push(30);
    
    while (!undoStack.empty()) {
        std::cout << "Undo: " << undoStack.top() << std::endl;
        undoStack.pop();
    }
    
    // Queue (FIFO)
    std::queue<std::string> taskQueue;
    taskQueue.push("Load assets");
    taskQueue.push("Initialize systems");
    taskQueue.push("Start game");
    
    while (!taskQueue.empty()) {
        std::cout << "Processing: " << taskQueue.front() << std::endl;
        taskQueue.pop();
    }
    
    // Priority Queue (largest first by default)
    std::priority_queue<int> damageNumbers;
    damageNumbers.push(5);
    damageNumbers.push(100);
    damageNumbers.push(25);
    damageNumbers.push(75);
    
    std::cout << "\nDamage dealt (largest first):" << std::endl;
    while (!damageNumbers.empty()) {
        std::cout << "  " << damageNumbers.top() << " damage!" << std::endl;
        damageNumbers.pop();
    }
    
    // Min-heap priority queue
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
    minHeap.push(100);
    minHeap.push(25);
    minHeap.push(75);
    minHeap.push(50);
    
    std::cout << "\nSmallest first:" << std::endl;
    while (!minHeap.empty()) {
        std::cout << "  " << minHeap.top() << std::endl;
        minHeap.pop();
    }
    
    return 0;
}
```

### Real Example: Event System with Priority

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
    
    // For priority_queue (higher priority first)
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
        std::cout << "Event queued: [" << getPriorityName(priority) 
                  << "] " << type << std::endl;
    }
    
    void processEvents() {
        std::cout << "\n=== PROCESSING EVENTS ===" << std::endl;
        while (!eventQueue.empty()) {
            const auto& event = eventQueue.top();
            std::cout << "Processing [" << getPriorityName(event.priority) 
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
    
    // Post events in random order
    events.postEvent(EventPriority::NORMAL, "PLAYER_MOVE", "x=100, y=200");
    events.postEvent(EventPriority::CRITICAL, "PLAYER_DEATH", "Killed by dragon");
    events.postEvent(EventPriority::LOW, "UI_UPDATE", "Update health bar");
    events.postEvent(EventPriority::HIGH, "COMBAT", "Dealt 50 damage");
    events.postEvent(EventPriority::NORMAL, "SOUND", "Play footstep");
    events.postEvent(EventPriority::CRITICAL, "SAVE_GAME", "Autosave triggered");
    
    // Events processed by priority (critical first)
    events.processEvents();
    
    return 0;
}
```

---

## Performance Comparison: When to Use What

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
    std::cout << name << " insert: " << duration.count() << "ms" << std::endl;
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
    std::cout << "set   insert: " << duration.count() << "ms" << std::endl;
    
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < COUNT; i++) unorderedSet.insert(i);
    end = std::chrono::high_resolution_clock::now();
    duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "unordered_set insert: " << duration.count() << "ms" << std::endl;
    
    return 0;
}
```

---

## Container Selection Guide

| Use Case | Container | Why |
|----------|-----------|-----|
| Most things | `vector` | Fast, cache-friendly |
| Add/remove at both ends | `deque` | O(1) front/back |
| Frequent middle insert/delete | `list` | O(1) anywhere |
| Fixed size known at compile time | `array` | No heap allocation |
| Unique ordered keys | `set` | O(log n) lookup |
| Key-value pairs, ordered | `map` | Sorted iteration |
| Fast unique keys, order doesn't matter | `unordered_set` | O(1) average |
| Fast key-value, order doesn't matter | `unordered_map` | O(1) average |
| Last-in-first-out | `stack` | Simple LIFO |
| First-in-first-out | `queue` | Simple FIFO |
| Always get highest priority | `priority_queue` | Automatic sorting |

---

## Practice Exercises

**Exercise 1 (Easy):** Use `map` to create a word frequency counter. Read a sentence, count how many times each word appears.

**Exercise 2 (Medium):** Implement a simple inventory system using `unordered_map<string, int>` where key is item name, value is quantity. Add functions: addItem, removeItem, getCount, listAll.

**Exercise 3 (Medium):** Create a `deque`-based "Recent Documents" list that keeps last 10 opened files. New files go to front, oldest removed when size exceeds 10.

**Exercise 4 (Hard):** Build a "Leaderboard" system using `set` or `map`. Store player scores, keep top 10, support adding new scores, and display ranked list.

**Exercise 5 (Hard):** Implement a "Trade System" where multiple players offer items. Use `queue` for pending trades, `map` for player inventories, `set` for active trade offers.

**Exercise 6 (Challenge):** Create a "Pathfinding Grid" using `unordered_map` with pair<int,int> as key and tile data as value. Implement A* pathfinding using `priority_queue` for open set.

---

## Summary

You now know:

✅ `vector` — default container, dynamic array  
✅ `deque` — double-ended queue  
✅ `list` — linked list  
✅ `map` / `set` — ordered associative containers  
✅ `unordered_map` / `unordered_set` — hash tables  
✅ `stack`, `queue`, `priority_queue` — container adapters  
✅ Real game examples for each container  
✅ Performance characteristics and when to use what  

## What's Next?

Next lesson: **STL Algorithms** — sort, find, transform, and more with `algorithm` header!

---

## Resources

- [STL Containers (cppreference)](https://en.cppreference.com/w/cpp/container)
- [Container choice guide](https://en.cppreference.com/w/cpp/container)
- [Complexity guarantees](https://en.cppreference.com/w/cpp/container#Container_operation_complexities)

---

**Practice Task:** Build a "Game Save Manager" that uses multiple containers:
- `map` for game settings
- `vector` for player inventory
- `deque` for message history
- `unordered_set` for unlocked achievements
- `stack` for undo/redo in character creator
Serialize all to file and load back.