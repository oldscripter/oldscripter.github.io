---
title: "Паттерны проектирования игр — создание масштабируемой архитектуры"
description: "Singleton, Factory, Observer, Component — проверенные паттерны для разработки игр"
pubDate: 2026-05-21
tags: ["C++", "advanced", "design-patterns", "architecture", "game-engine"]
lang: "ru"
lessonNumber: 21
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Урок 21: Паттерны проектирования игр — создание масштабируемой архитектуры

Добро пожаловать обратно! Вы освоили возможности C++. Теперь пришло время узнать, как **структурировать большие игровые проекты**. Паттерны проектирования — это многократно используемые решения для типичных проблем.

## Что вы изучите

- **Singleton** — глобальный доступ (используйте с осторожностью!)
- **Factory** — гибкое создание объектов
- **Observer** — системы событий и слабая связанность
- **Component** — гибкие игровые объекты (в стиле Unity)
- **State** — управление состояниями игры (меню, геймплей, пауза)
- **Object Pool** — эффективное переиспользование объектов

---

## Часть 1: Singleton — спорный паттерн

Singleton гарантирует, что существует только ОДИН экземпляр глобально.

```cpp
#include <iostream>
#include <string>

class GameManager {
private:
    static GameManager* instance;
    int score;
    int level;
    bool isPaused;
    
    // Приватный конструктор (никто не может создавать экземпляры)
    GameManager() : score(0), level(1), isPaused(false) {
        std::cout << "GameManager создан" << std::endl;
    }
    
    // Удаление конструктора копирования и присваивания
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
        std::cout << "Счёт: " << score << std::endl;
    }
    
    void nextLevel() {
        level++;
        std::cout << "Уровень: " << level << std::endl;
    }
    
    void togglePause() {
        isPaused = !isPaused;
        std::cout << (isPaused ? "Игра на паузе" : "Игра возобновлена") << std::endl;
    }
    
    int getScore() const { return score; }
};

// Инициализация статического члена
GameManager* GameManager::instance = nullptr;

// Современный потокобезопасный singleton на C++11 (лучше!)
class ModernGameManager {
private:
    ModernGameManager() = default;
    
public:
    static ModernGameManager& getInstance() {
        static ModernGameManager instance;  // Магические статики (потокобезопасны)
        return instance;
    }
    
    void doSomething() {
        std::cout << "Современный singleton работает!" << std::endl;
    }
    
    // Удаление копирования
    ModernGameManager(const ModernGameManager&) = delete;
    ModernGameManager& operator=(const ModernGameManager&) = delete;
};

int main() {
    // Старый способ
    GameManager::getInstance()->addScore(100);
    GameManager::getInstance()->nextLevel();
    
    // Современный способ (предпочтительный)
    ModernGameManager::getInstance().doSomething();
    
    return 0;
}
```

### Когда использовать Singleton (редко!)

```cpp
// ✅ Допустимые случаи использования:
// - Система логирования
// - Менеджер конфигурации
// - Аудиоменеджер (одно устройство)
// - Устройство рендеринга

// ❌ Плохие случаи использования:
// - Данные игрока (а как же мультиплеер?)
// - Менеджер врагов (разные уровни требуют разных менеджеров)
// - Любые данные, которые должны сбрасываться между уровнями

class AudioManager {
public:
    static AudioManager& get() {
        static AudioManager instance;
        return instance;
    }
    
    void playSound(const std::string& name) {
        std::cout << "Воспроизведение: " << name << std::endl;
    }
    
private:
    AudioManager() { /* Инициализация аудиоустройства */ }
};
```

---

## Часть 2: Паттерн Factory — создание объектов без `new`

Factory централизует создание объектов.

```cpp
#include <iostream>
#include <memory>
#include <unordered_map>

// Базовый класс
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

// Конкретные враги
class Goblin : public Enemy {
public:
    Goblin() {
        health = 30;
        damage = 8;
        std::cout << "Гоблин заспавнен!" << std::endl;
    }
    
    void attack() override {
        std::cout << "Гоблин наносит " << damage << " урона!" << std::endl;
    }
    
    void update(float dt) override {
        // ИИ гоблина
    }
    
    std::string getType() const override { return "Goblin"; }
};

class Orc : public Enemy {
public:
    Orc() {
        health = 60;
        damage = 15;
        std::cout << "Орк заспавнен!" << std::endl;
    }
    
    void attack() override {
        std::cout << "Орк наносит " << damage << " урона!" << std::endl;
    }
    
    void update(float dt) override {
        // ИИ орка
    }
    
    std::string getType() const override { return "Orc"; }
};

class Dragon : public Enemy {
public:
    Dragon() {
        health = 200;
        damage = 35;
        std::cout << "ДРАКОН заспавнен! Бегите!" << std::endl;
    }
    
    void attack() override {
        std::cout << "Дракон дышит огнём на " << damage << " урона!" << std::endl;
    }
    
    void update(float dt) override {
        // ИИ дракона
    }
    
    std::string getType() const override { return "Dragon"; }
};

// Простая фабрика
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

// Абстрактная фабрика с регистрацией (расширяемая)
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
    // Простая фабрика
    auto goblin = EnemyFactory::createEnemy("Goblin");
    auto orc = EnemyFactory::createEnemy("Orc");
    goblin->attack();
    orc->attack();
    
    // Расширяемая фабрика
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

## Часть 3: Паттерн Observer — системы событий

Observer разделяет отправителей и получателей событий.

```cpp
#include <iostream>
#include <vector>
#include <functional>
#include <algorithm>

// Интерфейс Observer
class IObserver {
public:
    virtual ~IObserver() = default;
    virtual void onNotify(const std::string& event, int value) = 0;
};

// Субъект (наблюдаемый)
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

// Конкретные наблюдатели
class AchievementSystem : public IObserver {
public:
    void onNotify(const std::string& event, int value) override {
        if (event == "ENEMY_KILLED") {
            if (value >= 10) {
                std::cout << "🏆 Достижение: Истребитель монстров! (10 убийств) 🏆" << std::endl;
            }
        } else if (event == "SCORE_CHANGED") {
            if (value >= 1000) {
                std::cout << "🏆 Достижение: Тысяча очков! 🏆" << std::endl;
            }
        }
    }
};

class UISystem : public IObserver {
public:
    void onNotify(const std::string& event, int value) override {
        if (event == "SCORE_CHANGED") {
            std::cout << "[UI] Счёт обновлён: " << value << std::endl;
        } else if (event == "PLAYER_DAMAGE") {
            std::cout << "[UI] Игрок получил " << value << " урона!" << std::endl;
        } else if (event == "PLAYER_DEATH") {
            std::cout << "[UI] КОНЕЦ ИГРЫ! Счёт: " << value << std::endl;
        }
    }
};

class SoundSystem : public IObserver {
public:
    void onNotify(const std::string& event, int value) override {
        if (event == "ENEMY_KILLED") {
            std::cout << "[Sound] Воспроизведение: kill_sound.wav" << std::endl;
        } else if (event == "PLAYER_DAMAGE") {
            std::cout << "[Sound] Воспроизведение: hurt_sound.wav" << std::endl;
        } else if (event == "SCORE_CHANGED" && value % 100 == 0) {
            std::cout << "[Sound] Воспроизведение: score_up.wav" << std::endl;
        }
    }
};

// Игровой класс, генерирующий события
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
    
    std::cout << "=== ИГРА НАЧИНАЕТСЯ ===" << std::endl;
    game.killEnemy();   // Убийство 1
    game.killEnemy();   // Убийство 2
    game.addScore(500); // Счёт 700
    game.killEnemy();   // Убийство 3
    game.addScore(400); // Счёт 1100 (вызывает достижение)
    game.damagePlayer(50);
    game.damagePlayer(60); // Смерть
    
    return 0;
}
```

### Современный Observer с `std::function` (без интерфейсов)

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
    // Типобезопасные события
    Event<int> onScoreChanged;
    Event<std::string> onPlayerDeath;
    
    onScoreChanged.addListener([](int score) {
        std::cout << "Счёт обновлён: " << score << std::endl;
    });
    
    onScoreChanged.addListener([](int score) {
        if (score >= 1000) {
            std::cout << "Достигнут высокий счёт!" << std::endl;
        }
    });
    
    onPlayerDeath.addListener([](const std::string& reason) {
        std::cout << "Игрок умер: " << reason << std::endl;
    });
    
    onScoreChanged.invoke(500);
    onScoreChanged.invoke(1200);
    onPlayerDeath.invoke("Упал в лаву");
    
    return 0;
}
```

---

## Часть 4: Паттерн Component — гибкие игровые объекты

Архитектура сущность-компонент в стиле Unity.

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <typeindex>
#include <unordered_map>

// Базовый компонент
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

// Игровой объект (сущность)
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

// Примеры компонентов
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
        std::cout << "  Позиция: (" << x << ", " << y << ", " << z << ")" << std::endl;
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
        std::cout << "  Здоровье: " << health << "/" << maxHealth << std::endl;
        if (health <= 0) {
            std::cout << "  Сущность погибла!" << std::endl;
        }
    }
    
    void heal(int amount) {
        health = std::min(maxHealth, health + amount);
    }
    
    void render() override {
        std::cout << "  Здоровье: " << health << "/" << maxHealth << std::endl;
    }
};

class SpriteComponent : public Component {
private:
    std::string texturePath;
    
public:
    SpriteComponent(const std::string& path) : texturePath(path) {}
    
    void render() override {
        std::cout << "  Спрайт: " << texturePath << std::endl;
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

// Использование
int main() {
    auto player = std::make_unique<GameObject>();
    player->addComponent<TransformComponent>(100, 200, 0);
    player->addComponent<HealthComponent>(100);
    player->addComponent<SpriteComponent>("player.png");
    auto movement = player->addComponent<MovementComponent>(200.0f);
    
    movement->setVelocity(1, 0);  // Движение вправо
    
    // Симуляция игрового цикла
    for (int frame = 0; frame < 3; frame++) {
        std::cout << "\n--- Кадр " << frame << " ---" << std::endl;
        player->update(0.016f);  // 60 FPS
        player->render();
    }
    
    auto health = player->getComponent<HealthComponent>();
    health->takeDamage(30);
    
    return 0;
}
```

---

## Часть 5: Паттерн State — управление состояниями игры

```cpp
#include <iostream>
#include <memory>

// Предварительное объявление
class GameContext;

// Интерфейс состояния
class GameState {
public:
    virtual ~GameState() = default;
    virtual void onEnter(GameContext* context) = 0;
    virtual void onUpdate(GameContext* context, float dt) = 0;
    virtual void onExit(GameContext* context) = 0;
    virtual std::string getName() const = 0;
};

// Контекст, хранящий текущее состояние
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
        return currentState ? currentState->getName() : "Нет";
    }
};

// Конкретные состояния
class MainMenuState : public GameState {
public:
    void onEnter(GameContext* context) override {
        std::cout << "Вход в ГЛАВНОЕ МЕНЮ" << std::endl;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        std::cout << "Главное меню - нажмите 1 для старта, 2 для настроек, 3 для выхода" << std::endl;
        
        int input;
        std::cin >> input;
        
        if (input == 1) {
            context->changeState(std::make_unique<GameplayState>());
        } else if (input == 2) {
            context->changeState(std::make_unique<SettingsState>());
        } else if (input == 3) {
            std::cout << "Выход..." << std::endl;
            exit(0);
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Выход из ГЛАВНОГО МЕНЮ" << std::endl;
    }
    
    std::string getName() const override { return "ГлавноеМеню"; }
};

class GameplayState : public GameState {
private:
    float gameTime;
    
public:
    GameplayState() : gameTime(0) {}
    
    void onEnter(GameContext* context) override {
        std::cout << "Вход в ИГРОВОЙ процесс" << std::endl;
        gameTime = 0;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        gameTime += dt;
        std::cout << "Игра... Время: " << gameTime << " секунд (нажмите ESC для паузы)" << std::endl;
        
        // Симуляция ввода
        char c;
        std::cin >> c;
        if (c == 27) {  // ESC
            context->changeState(std::make_unique<PauseState>());
        }
        
        if (gameTime >= 10.0f) {
            std::cout << "Вы победили!" << std::endl;
            context->changeState(std::make_unique<MainMenuState>());
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Выход из ИГРОВОГО процесса" << std::endl;
    }
    
    std::string getName() const override { return "Геймплей"; }
};

class PauseState : public GameState {
public:
    void onEnter(GameContext* context) override {
        std::cout << "Игра на ПАУЗЕ" << std::endl;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        std::cout << "Пауза - нажмите R для продолжения, Q для выхода в меню" << std::endl;
        
        char input;
        std::cin >> input;
        
        if (input == 'r' || input == 'R') {
            context->changeState(std::make_unique<GameplayState>());
        } else if (input == 'q' || input == 'Q') {
            context->changeState(std::make_unique<MainMenuState>());
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Возобновление игры..." << std::endl;
    }
    
    std::string getName() const override { return "Пауза"; }
};

class SettingsState : public GameState {
public:
    void onEnter(GameContext* context) override {
        std::cout << "Вход в НАСТРОЙКИ" << std::endl;
    }
    
    void onUpdate(GameContext* context, float dt) override {
        std::cout << "Настройки - нажмите B для возврата" << std::endl;
        
        char input;
        std::cin >> input;
        
        if (input == 'b' || input == 'B') {
            context->changeState(std::make_unique<MainMenuState>());
        }
    }
    
    void onExit(GameContext* context) override {
        std::cout << "Выход из НАСТРОЕК" << std::endl;
    }
    
    std::string getName() const override { return "Настройки"; }
};

int main() {
    GameContext game;
    game.changeState(std::make_unique<MainMenuState>());
    
    // Игровой цикл
    while (true) {
        game.update(0.016f);  // 60 FPS
    }
    
    return 0;
}
```

---

## Часть 6: Паттерн Object Pool — эффективное переиспользование объектов

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
            std::cout << "  Частица в (" << x << ", " << y << ")" << std::endl;
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
            std::cout << "Пул исчерпан! Нельзя создать частицу." << std::endl;
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
        
        // Перестроение доступных индексов
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
    ParticlePool pool(50);  // Максимум 50 частиц
    
    std::cout << "=== ДЕМО ПУЛА ЧАСТИЦ ===" << std::endl;
    
    // Создание взрывов
    for (int i = 0; i < 60; i++) {
        float angle = i * 3.14159f * 2 / 60;
        float vx = cos(angle) * 100;
        float vy = sin(angle) * 100;
        pool.create(0, 0, vx, vy, 2.0f);
    }
    
    // Симуляция кадров
    for (int frame = 0; frame < 60; frame++) {
        pool.update(0.016f);
        
        if (frame % 10 == 0) {
            std::cout << "Кадр " << frame << ": " 
                      << pool.getActiveCount() << " активных частиц" << std::endl;
        }
    }
    
    return 0;
}
```

---

## Руководство по выбору паттерна

| Паттерн | Когда использовать | Игровой пример |
|---------|----------|--------------|
| **Singleton** | Требуется ровно один экземпляр глобально | Аудиоменеджер, конфигурация |
| **Factory** | Создание семейств связанных объектов | Спавнер врагов, генератор предметов |
| **Observer** | Слабо связанное событийное взаимодействие | Достижения, UI, звук |
| **Component** | Гибкие, управляемые данными сущности | Игровые объекты в стиле Unity |
| **State** | Поведение объекта меняется в зависимости от состояния | Меню игры, состояния ИИ |
| **Object Pool** | Частое создание/уничтожение объектов | Частицы, пули, враги |

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Реализуйте `LogManager`-singleton с разными уровнями логирования (INFO, WARNING, ERROR).

**Упражнение 2 (Среднее):** Создайте `ItemFactory`, генерирующую оружие, зелья и броню со случайными характеристиками.

**Упражнение 3 (Среднее):** Создайте систему квестов с использованием паттерна Observer. Когда игрок убивает врагов или собирает предметы, обновляйте прогресс квеста.

**Упражнение 4 (Сложное):** Реализуйте полноценную архитектуру ECS (Сущность-Компонент-Система) для небольшой игры.

**Упражнение 5 (Сложное):** Создайте конечный автомат ИИ с состояниями: Ожидание, Патруль, Преследование, Атака, Побег.

**Упражнение 6 (Вызов):** Создайте игру "Bullet Hell" с использованием пула объектов для пуль. Поддерживайте тысячи снарядов одновременно.

---

## Резюме

Теперь вы знаете:

✅ Singleton — глобальный доступ (используйте с осторожностью)  
✅ Factory — гибкое создание объектов  
✅ Observer — слабо связанные системы событий  
✅ Component — игровые объекты в стиле Unity  
✅ State — управление состояниями игры и ИИ  
✅ Object Pool — эффективное переиспользование объектов  

## Что дальше?

Следующий урок: **Оптимизация производительности** — профилирование, эффективность кеша и ускорение игр!

---

## Ресурсы

- [Game Programming Patterns (книга)](http://gameprogrammingpatterns.com/)
- [Design Patterns: Elements of Reusable OO Software](https://en.wikipedia.org/wiki/Design_Patterns)

---

**Практическое задание:** Создайте небольшую игру (например, шутер с видом сверху), используя паттерн Component для сущностей, Observer для очков/достижений, State для игрового потока и Object Pool для пуль!