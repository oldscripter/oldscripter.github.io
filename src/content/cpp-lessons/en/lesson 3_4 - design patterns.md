---
title: "Game Design Patterns — Building Scalable Game Architecture"
description: "Singleton, Factory, Observer, Component — proven patterns for game development"
pubDate: 2026-05-21
tags: ["C++", "advanced", "design-patterns", "architecture", "game-engine"]
lang: "en"
lessonNumber: 304
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Lesson 21: Game Design Patterns — Building Scalable Game Architecture

Welcome back! You've mastered C++ features. Now it's time to learn how to **structure large game projects**. Design patterns are reusable solutions to common problems.

## What You'll Learn

- **Singleton** — global access (use sparingly!)
- **Factory** — flexible object creation
- **Observer** — event systems and decoupling
- **Component** — flexible game objects (Unity-style)
- **State** — managing game states (menus, gameplay, pause)
- **Object Pool** — efficient reuse of objects

---

## Part 1: Singleton — The Controversial Pattern

Singleton ensures only ONE instance exists globally.

```cpp
#include <iostream>
#include <string>

class GameManager {
private:
    static GameManager* instance;
    int score;
    int level;
    bool isPaused;
    
    // Private constructor (nobody can create instances)
    GameManager() : score(0), level(1), isPaused(false) {
        std::cout << "GameManager created" << std::endl;
    }
    
    // Delete copy constructor and assignment
    GameManager(const GameManager&) = delete;
    GameManager& operator=(const GameManager&) = delete;
    
public:
    static GameManager* getInstance() {
        if (instance == nullptr) {
            instance = new GameManager();
        }
        return instance;
    }
    
    void addScore(int points) {
        score += points;
        std::cout << "Score: " << score << std::endl;
    }
    
    void nextLevel() {
        level++;
        std::cout << "Level: " << level << std::endl;
    }
    
    void togglePause() {
        isPaused = !isPaused;
        std::cout << (isPaused ? "Game Paused" : "Game Resumed") << std::endl;
    }
    
    int getScore() const { return score; }
};

// Initialize static member
GameManager* GameManager::instance = nullptr;

// Modern C++11 thread-safe singleton (better!)
class ModernGameManager {
private:
    ModernGameManager() = default;
    
public:
    static ModernGameManager& getInstance() {
        static ModernGameManager instance;  // Magic statics (thread-safe)
        return instance;
    }
    
    void doSomething() {
        std::cout << "Modern singleton at work!" << std::endl;
    }
    
    // Delete copy
    ModernGameManager(const ModernGameManager&) = delete;
    ModernGameManager& operator=(const ModernGameManager&) = delete;
};

int main() {
    // Old way
    GameManager::getInstance()->addScore(100);
    GameManager::getInstance()->nextLevel();
    
    // Modern way (preferred)
    ModernGameManager::getInstance().doSomething();
    
    return 0;
}
```

### When to Use Singleton (Rarely!)

```cpp
// ✅ Acceptable use cases:
// - Logging system
// - Configuration manager
// - Audio manager (single device)
// - Rendering device

// ❌ Bad use cases:
// - Player data (what about multiplayer?)
// - Enemy manager (multiple levels need different managers)
// - Any data that should be reset between levels

class AudioManager {
public:
    static AudioManager& get() {
        static AudioManager instance;
        return instance;
    }
    
    void playSound(const std::string& name) {
        std::cout << "Playing: " << name << std::endl;
    }
    
private:
    AudioManager() { /* Initialize audio device */ }
};
```

---

## Part 2: Factory Pattern — Creating Objects Without `new`

Factory pattern centralizes object creation.

```cpp
#include <iostream>
#include <memory>
#include <unordered_map>

// Base class
class Enemy {
protected:
    int health;
    int damage;
    
public:
    virtual ~Enemy() = default;
    virtual void attack() = 0;
    virtual void update(float dt) = 0;
    virtual std::string getType() const = 0;
};

// Concrete enemies
class Goblin : public Enemy {
public:
    Goblin() {
        health = 30;
        damage = 8;
        std::cout << "Goblin spawned!" << std::endl;
    }
    
    void attack() override {
        std::cout << "Goblin slashes for " << damage << " damage!" << std::endl;
    }
    
    void update(float dt) override {
        // Goblin AI
    }
    
    std::string getType() const override { return "Goblin"; }
};

class Orc : public Enemy {
public:
    Orc() {
        health = 60;
        damage = 15;
        std::cout << "Orc spawned!" << std::endl;
    }
    
    void attack() override {
        std::cout << "Orc smashes for " << damage << " damage!" << std::endl;
    }
    
    void update(float dt) override {
        // Orc AI
    }
    
    std::string getType() const override { return "Orc"; }
};

class Dragon : public Enemy {
public:
    Dragon() {
        health = 200;
        damage = 35;
        std::cout << "DRAGON spawned! Run!" << std::endl;
    }
    
    void attack() override {
        std::cout << "Dragon breathes fire for " << damage << " damage!" << std::endl;
    }
    
    void update(float dt) override {
        // Dragon AI
    }
    
    std::string getType() const override { return "Dragon"; }
};

// Simple Factory
class EnemyFactory {
public:
    static std::unique_ptr<Enemy> createEnemy(const std::string& type) {
        if (type == "Goblin") {
            return std::make_unique<Goblin>();
        } else if (type == "Orc") {
            return std::make_unique<Orc>();
        } else if (type == "Dragon") {
            return std::make_unique<Dragon>();
        }
        return nullptr;
    }
};

// Abstract Factory with registration (extensible)
class AbstractEnemyFactory {
private:
    using Creator = std::function<std::unique_ptr<Enemy>()>;
    std::unordered_map<std::string, Creator> creators;
    
public:
    void registerEnemy(const std::string& type, Creator creator) {
        creators[type] = creator;
    }
    
    std::unique_ptr<Enemy> create(const std::string& type) {
        auto it = creators.find(type);
        if (it != creators.end()) {
            return it->second();
        }
        return nullptr;
    }
};

int main() {
    // Simple factory
    auto goblin = EnemyFactory::createEnemy("Goblin");
    auto orc = EnemyFactory::createEnemy("Orc");
    goblin->attack();
    orc->attack();
    
    // Extensible factory
    AbstractEnemyFactory factory;
    factory.registerEnemy("Goblin", []() { return std::make_unique<Goblin>(); });
    factory.registerEnemy("Orc", []() { return std::make_unique<Orc>(); });
    factory.registerEnemy("Dragon", []() { return std::make_unique<Dragon>(); });
    
    auto dragon = factory.create("Dragon");
    dragon->attack();
    
    return 0;
}
```

---

## Part 3: Observer Pattern — Event Systems

Observer decouples event senders from receivers.

```cpp
#include <iostream>
#include <vector>
#include <functional>
#include <algorithm>

// Observer interface
class IObserver {
public:
    virtual ~IObserver() = default;
    virtual void onNotify(const std::string& event, int value) = 0;
};

// Subject (Observable)
class EventManager {
private:
    std::vector<IObserver*> observers;
    
public:
    void addObserver(IObserver* observer) {
        observers.push_back(observer);
    }
    
    void removeObserver(IObserver* observer) {
        auto it = std::find(observers.begin(), observers.end(), observer);
        if (it != observers.end()) {
            observers.erase(it);
        }
    }
    
    void notify(const std::string& event, int value) {
        for (auto* observer : observers) {
            observer->onNotify(event, value);
        }
    }
};

// Concrete observers
class AchievementSystem : public IObserver {
public:
    void onNotify(const std::string& event, int value) override {
        if (event == "ENEMY_KILLED") {
            if (value >= 10) {
                std::cout << "🏆 Achievement: Monster Slayer! (10 kills) 🏆" << std::endl;
            }
        } else if (event == "SCORE_CHANGED") {
            if (value >= 1000) {
                std::cout << "🏆 Achievement: Thousand Points! 🏆" << std::endl;
            }
        }
    }
};

class UISystem : public IObserver {
public:
    void onNotify(const std::string& event, int value) override {
        if (event == "SCORE_CHANGED") {
            std::cout << "[UI] Score updated: " << value << std::endl;
        } else if (event == "PLAYER_DAMAGE") {
            std::cout << "[UI] Player took " << value << " damage!" << std::endl;
        } else if (event == "PLAYER_DEATH") {
            std::cout << "[UI] GAME OVER! Score: " << value << std::endl;
        }
    }
};

class SoundSystem : public IObserver {
public:
    void onNotify(const std::string& event, int value) override {
        if (event == "ENEMY_KILLED") {
            std::cout << "[Sound] Playing: kill_sound.wav" << std::endl;
        } else if (event == "PLAYER_DAMAGE") {
            std::cout << "[Sound] Playing: hurt_sound.wav" << std::endl;
        } else if (event == "SCORE_CHANGED" && value % 100 == 0) {
            std::cout << "[Sound] Playing: score_up.wav" << std::endl;
        }
    }
};

// Game class that generates events
class Game {
private:
    EventManager events;
    int score;
    int kills;
    
public:
    Game() : score(0), kills(0) {}
    
    void addSystem(IObserver* observer) {
        events.addObserver(observer);
    }
    
    void addScore(int points) {
        score += points;
        events.notify("SCORE_CHANGED", score);
        
        if (score >= 1000) {
            events.notify("SCORE_MILESTONE", score);
        }
    }
    
    void killEnemy() {
        kills++;
        events.notify("ENEMY_KILLED", kills);
        addScore(100);
    }
    
    void damagePlayer(int amount) {
        events.notify("PLAYER_DAMAGE", amount);
        if (amount >= 100) {
            events.notify("PLAYER_DEATH", score);
        }
    }
};

int main() {
    Game game;
    
    AchievementSystem achievements;
    UISystem ui;
    SoundSystem sound;
    
    game.addSystem(&achievements);
    game.addSystem(&ui);
    game.addSystem(&sound);
    
    std::cout << "=== GAME START ===" << std::endl;
    game.killEnemy();   // Kill 1
    game.killEnemy();   // Kill 2
    game.addScore(500); // Score 700
    game.killEnemy();   // Kill 3
    game.addScore(400); // Score 1100 (triggers achievement)
    game.damagePlayer(50);
    game.damagePlayer(60); // Death
    
    return 0;
}
```

### Modern Observer with `std::function` (No Interfaces)

```cpp
#include <iostream>
#include <vector>
#include <functional>

template<typename... Args>
class Event {
private:
    std::vector<std::function<void(Args...)>> listeners;
    
public:
    void addListener(std::function<void(Args...)> listener) {
        listeners.push_back(listener);
    }
    
    void invoke(Args... args) {
        for (auto& listener : listeners) {
            listener(args...);
        }
    }
};

int main() {
    // Type-safe events
    Event<int> onScoreChanged;
    Event<std::string> onPlayerDeath;
    
    onScoreChanged.addListener([](int score) {
        std::cout << "Score updated: " << score << std::endl;
    });
    
    onScoreChanged.addListener([](int score) {
        if (score >= 1000) {
            std::cout << "High score achieved!" << std::endl;
        }
    });
    
    onPlayerDeath.addListener([](const std::string& reason) {
        std::cout << "Player died: " << reason << std::endl;
    });
    
    onScoreChanged.invoke(500);
    onScoreChanged.invoke(1200);
    onPlayerDeath.invoke("Fell into lava");
    
    return 0;
}
```

---

## Part 4: Component Pattern — Flexible Game Objects

Unity-style Entity-Component architecture.

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <typeindex>
#include <unordered_map>

// Base Component
class Component {
protected:
    class GameObject* owner;
    
public:
    virtual ~Component() = default;
    void setOwner(class GameObject* go) { owner = go; }
    virtual void start() {}
    virtual void update(float dt) {}
    virtual void render() {}
};

// Game Object (Entity)
class GameObject {
private:
    std::unordered_map<std::type_index, std::unique_ptr<Component>> components;
    bool active;
    
public:
    GameObject() : active(true) {}
    
    template<typename T, typename... Args>
    T* addComponent(Args&&... args) {
        auto component = std::make_unique<T>(std::forward<Args>(args)...);
        T* ptr = component.get();
        component->setOwner(this);
        components[typeid(T)] = std::move(component);
        ptr->start();
        return ptr;
    }
    
    template<typename T>
    T* getComponent() {
        auto it = components.find(typeid(T));
        if (it != components.end()) {
            return static_cast<T*>(it->second.get());
        }
        return nullptr;
    }
    
    void update(float dt) {
        if (!active) return;
        for (auto& [_, comp] : components) {
            comp->update(dt);
        }
    }
    
    void render() {
        if (!active) return;
        for (auto& [_, comp] : components) {
            comp->render();
        }
    }
    
    void setActive(bool a) { active = a; }
    bool isActive() const { return active; }
};

// Example components
class TransformComponent : public Component {
public:
    float x, y, z;
    
    TransformComponent(float startX = 0, float startY = 0, float startZ = 0)
        : x(startX), y(startY), z(startZ) {}
    
    void move(float dx, float dy, float dz) {
        x += dx;
        y += dy;
        z += dz;
    }
    
    void render() override {
        std::cout << "  Position: (" << x << ", " << y << ", " << z << ")" << std::endl;
    }
};

class HealthComponent : public Component {
private:
    int health;
    int maxHealth;
    
public:
    HealthComponent(int hp) : health(hp), maxHealth(hp) {}
    
    void takeDamage(int amount) {
        health -= amount;
        std::cout << "  Health: " << health << "/" << maxHealth << std::endl;
        if (health <= 0) {
            std::cout << "  Entity died!" << std::endl;
        }
    }
    
    void heal(int amount) {
        health = std::min(maxHealth, health + amount);
    }
    
    void render() override {
        std::cout << "  Health: " << health << "/" << maxHealth << std::endl;
    }
};

class SpriteComponent : public Component {
private:
    std::string texturePath;
    
public:
    SpriteComponent(const std::string& path) : texturePath(path) {}
    
    void render() override {
        std::cout << "  Sprite: " << texturePath << std::endl;
    }
};

class MovementComponent : public Component {
private:
    float speed;
    float vx, vy;
    
public:
    MovementComponent(float s) : speed(s), vx(0), vy(0) {}
    
    void setVelocity(float x, float y) {
        vx = x * speed;
        vy = y * speed;
    }
    
    void update(float dt) override {
        auto transform = owner->getComponent<TransformComponent>();
        if (transform) {
            transform->move(vx * dt, vy * dt, 0);
        }
    }
};

// Usage
int main() {
    auto player = std::make_unique<GameObject>();
    player->addComponent<TransformComponent>(100, 200, 0);
    player->addComponent<HealthComponent>(100);
    player->addComponent<SpriteComponent>("player.png");
    auto movement = player->addComponent<MovementComponent>(200.0f);
    
    movement->setVelocity(1, 0);  // Move right
    
    // Game loop simulation
    for (int frame = 0; frame < 3; frame++) {
        std::cout << "\n--- Frame " << frame << " ---" << std::endl;
        player->update(0.016f);  // 60 FPS
        player->render();
    }
    
    auto health = player->getComponent<HealthComponent>();
    health->takeDamage(30);
    
    return 0;
}
```

---

## Part 5: State Pattern — Managing Game States

```cpp
#include <iostream>
#include <memory>

// Forward declaration
class GameContext;

// State interface
class GameState {
public:
    virtual ~GameState() = default;
    virtual void onEnter(GameContext* context) = 0;
    virtual void onUpdate(GameContext* context, float dt) = 0;
    virtual void onExit(GameContext* context) = 0;
    virtual std::string getName() const = 0;
};

// Context that holds current state
class GameContext {
private:
    std::unique_ptr<GameState> currentState;
    
public:
    void changeState(std::unique_ptr<GameState> newState) {
        if (currentState) {
            currentState->onExit(this);
        }
        currentState = std::move(newState);
        currentState->onEnter(this);
    }
    
    void update(float dt) {
        if (currentState) {
            currentState->onUpdate(this, dt);
        }
    }
    
    std::string getCurrentStateName() const {
        return currentState ? currentState->getName() : "None";
    }
};

// Concrete states
class MainMenuState : public GameState {
public:
    void onEnter(GameContext* context) override {
        std::cout << "Entering MAIN MENU" << std::endl;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        std::cout << "Main menu - press 1 to start, 2 for settings, 3 to quit" << std::endl;
        
        int input;
        std::cin >> input;
        
        if (input == 1) {
            context->changeState(std::make_unique<GameplayState>());
        } else if (input == 2) {
            context->changeState(std::make_unique<SettingsState>());
        } else if (input == 3) {
            std::cout << "Quitting..." << std::endl;
            exit(0);
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Exiting MAIN MENU" << std::endl;
    }
    
    std::string getName() const override { return "MainMenu"; }
};

class GameplayState : public GameState {
private:
    float gameTime;
    
public:
    GameplayState() : gameTime(0) {}
    
    void onEnter(GameContext* context) override {
        std::cout << "Entering GAMEPLAY" << std::endl;
        gameTime = 0;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        gameTime += dt;
        std::cout << "Playing... Time: " << gameTime << " seconds (press ESC to pause)" << std::endl;
        
        // Simulate input
        char c;
        std::cin >> c;
        if (c == 27) {  // ESC key
            context->changeState(std::make_unique<PauseState>());
        }
        
        if (gameTime >= 10.0f) {
            std::cout << "You won!" << std::endl;
            context->changeState(std::make_unique<MainMenuState>());
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Exiting GAMEPLAY" << std::endl;
    }
    
    std::string getName() const override { return "Gameplay"; }
};

class PauseState : public GameState {
public:
    void onEnter(GameContext* context) override {
        std::cout << "Game PAUSED" << std::endl;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        std::cout << "Paused - press R to resume, Q to quit to menu" << std::endl;
        
        char input;
        std::cin >> input;
        
        if (input == 'r' || input == 'R') {
            context->changeState(std::make_unique<GameplayState>());
        } else if (input == 'q' || input == 'Q') {
            context->changeState(std::make_unique<MainMenuState>());
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Resuming game..." << std::endl;
    }
    
    std::string getName() const override { return "Pause"; }
};

class SettingsState : public GameState {
public:
    void onEnter(GameContext* context) override {
        std::cout << "Entering SETTINGS" << std::endl;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        std::cout << "Settings - press B to go back" << std::endl;
        
        char input;
        std::cin >> input;
        
        if (input == 'b' || input == 'B') {
            context->changeState(std::make_unique<MainMenuState>());
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Exiting SETTINGS" << std::endl;
    }
    
    std::string getName() const override { return "Settings"; }
};

int main() {
    GameContext game;
    game.changeState(std::make_unique<MainMenuState>());
    
    // Game loop
    while (true) {
        game.update(0.016f);  // 60 FPS
    }
    
    return 0;
}
```

---

## Part 6: Object Pool Pattern — Reusing Objects Efficiently

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <memory>

class Particle {
private:
    float x, y;
    float vx, vy;
    float life;
    bool active;
    
public:
    Particle() : x(0), y(0), vx(0), vy(0), life(0), active(false) {}
    
    void init(float px, float py, float vx, float vy, float lifetime) {
        this->x = px;
        this->y = py;
        this->vx = vx;
        this->vy = vy;
        this->life = lifetime;
        this->active = true;
    }
    
    void update(float dt) {
        if (!active) return;
        
        x += vx * dt;
        y += vy * dt;
        life -= dt;
        
        if (life <= 0) {
            active = false;
        }
    }
    
    void render() const {
        if (active) {
            std::cout << "  Particle at (" << x << ", " << y << ")" << std::endl;
        }
    }
    
    bool isActive() const { return active; }
};

class ParticlePool {
private:
    std::vector<Particle> particles;
    std::queue<int> availableIndices;
    
public:
    ParticlePool(int size) {
        particles.resize(size);
        for (int i = 0; i < size; i++) {
            availableIndices.push(i);
        }
    }
    
    Particle* create(float x, float y, float vx, float vy, float life) {
        if (availableIndices.empty()) {
            std::cout << "Pool exhausted! Cannot create particle." << std::endl;
            return nullptr;
        }
        
        int index = availableIndices.front();
        availableIndices.pop();
        
        particles[index].init(x, y, vx, vy, life);
        return &particles[index];
    }
    
    void update(float dt) {
        for (auto& particle : particles) {
            if (particle.isActive()) {
                particle.update(dt);
            }
        }
        
        // Rebuild available indices
        while (!availableIndices.empty()) availableIndices.pop();
        
        for (int i = 0; i < particles.size(); i++) {
            if (!particles[i].isActive()) {
                availableIndices.push(i);
            }
        }
    }
    
    void render() const {
        for (const auto& particle : particles) {
            particle.render();
        }
    }
    
    int getActiveCount() const {
        return particles.size() - availableIndices.size();
    }
};

int main() {
    ParticlePool pool(50);  // Max 50 particles
    
    std::cout << "=== PARTICLE POOL DEMO ===" << std::endl;
    
    // Create explosions
    for (int i = 0; i < 60; i++) {
        float angle = i * 3.14159f * 2 / 60;
        float vx = cos(angle) * 100;
        float vy = sin(angle) * 100;
        pool.create(0, 0, vx, vy, 2.0f);
    }
    
    // Simulate frames
    for (int frame = 0; frame < 60; frame++) {
        pool.update(0.016f);
        
        if (frame % 10 == 0) {
            std::cout << "Frame " << frame << ": " 
                      << pool.getActiveCount() << " active particles" << std::endl;
        }
    }
    
    return 0;
}
```

---

## Pattern Selection Guide

| Pattern | Use When | Game Example |
|---------|----------|--------------|
| **Singleton** | Exactly one instance needed globally | Audio manager, config |
| **Factory** | Creating families of related objects | Enemy spawner, item generator |
| **Observer** | Decoupled event communication | Achievements, UI, sound |
| **Component** | Flexible, data-driven entities | Unity-style game objects |
| **State** | Object behavior changes with state | Game menus, AI states |
| **Object Pool** | Frequent creation/destruction | Particles, bullets, enemies |

---

## Practice Exercises

**Exercise 1 (Easy):** Implement a `LogManager` singleton with different log levels (INFO, WARNING, ERROR).

**Exercise 2 (Medium):** Create an `ItemFactory` that generates weapons, potions, and armor with random stats.

**Exercise 3 (Medium):** Build a quest system using Observer pattern. When player kills enemies or collects items, update quest progress.

**Exercise 4 (Hard):** Implement a complete ECS (Entity-Component-System) architecture for a small game.

**Exercise 5 (Hard):** Create an AI state machine with states: Idle, Patrol, Chase, Attack, Flee.

**Exercise 6 (Challenge):** Build a bullet hell shooter using Object Pool for bullets. Support thousands of simultaneous projectiles.

---

## Summary

You now know:

✅ Singleton — global access (use sparingly)  
✅ Factory — flexible object creation  
✅ Observer — decoupled event systems  
✅ Component — Unity-style game objects  
✅ State — managing game/AI states  
✅ Object Pool — efficient object reuse  

## What's Next?

Next lesson: **Performance Optimization** — profiling, cache efficiency, and making games run faster!

---

## Resources

- [Game Programming Patterns (book)](http://gameprogrammingpatterns.com/)
- [Design Patterns: Elements of Reusable OO Software](https://en.wikipedia.org/wiki/Design_Patterns)

---

**Practice Task:** Build a small game (like a top-down shooter) using Component pattern for entities, Observer for scoring/achievements, State for game flow, and Object Pool for bullets!