---
title: "Умные указатели — автоматическое управление памятью"
description: "Освойте unique_ptr, shared_ptr, weak_ptr — больше никогда не допускайте утечек памяти"
pubDate: 2026-05-17
tags: ["C++", "intermediate", "smart-pointers", "RAII", "memory-management"]
lang: "ru"
lessonNumber: 207
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 17: Умные указатели — автоматическое управление памятью

Добро пожаловать обратно! Сырые указатели с `new` и `delete` подвержены ошибкам. **Умные указатели** автоматизируют управление памятью, делая утечки практически невозможными.

## Что вы изучите

- Проблемы с сырыми указателями (утечки памяти, висячие указатели)
- `std::unique_ptr` — исключительное владение
- `std::shared_ptr` — разделяемое владение со счётчиком ссылок
- `std::weak_ptr` — разрыв циклических ссылок
- `std::make_unique` и `std::make_shared`
- Пользовательские удалители
- Принцип RAII в деталях
- Полная система управления игровыми объектами

---

## Часть 1: Проблемы с сырыми указателями

```cpp
// ❌ Проблема 1: Утечка памяти
void leakMemory() {
    int* data = new int[1000];
    // Забыли delete[] — утечка памяти!
}

// ❌ Проблема 2: Двойное удаление
int* ptr = new int(42);
delete ptr;
delete ptr;  // Неопределённое поведение (скорее всего падение)

// ❌ Проблема 3: Висячий указатель
int* getDanglingPointer() {
    int x = 42;
    return &x;  // x уничтожается при возврате из функции!
}

// ❌ Проблема 4: Небезопасность исключений
void unsafeFunction() {
    int* data = new int[1000];
    if (someCondition) {
        throw std::runtime_error("Ошибка");
        // Delete никогда не вызывается — утечка памяти!
    }
    delete[] data;
}

// ✅ Решение: умные указатели обрабатывают всё это автоматически
```

---

## Часть 2: `std::unique_ptr` — исключительное владение

`unique_ptr` владеет объектом исключительно — его нельзя копировать, только перемещать.

```cpp
#include <iostream>
#include <memory>
#include <vector>

class GameObject {
public:
    std::string name;
    
    GameObject(const std::string& n) : name(n) {
        std::cout << "Создан: " << name << std::endl;
    }
    
    ~GameObject() {
        std::cout << "Уничтожен: " << name << std::endl;
    }
    
    void update() {
        std::cout << "Обновление: " << name << std::endl;
    }
};

int main() {
    // Создание unique_ptr (предпочтительно make_unique)
    auto player = std::make_unique<GameObject>("Player");
    
    // Использование как сырого указателя
    player->update();
    (*player).update();
    
    // Нельзя скопировать — ошибка компиляции!
    // auto player2 = player;  // ❌ Ошибка!
    
    // Можно переместить (передача владения)
    auto enemy = std::make_unique<GameObject>("Enemy");
    auto transferred = std::move(enemy);  // enemy становится null
    if (!enemy) {
        std::cout << "enemy теперь null" << std::endl;
    }
    
    // Вектор unique_ptr
    std::vector<std::unique_ptr<GameObject>> objects;
    objects.push_back(std::make_unique<GameObject>("Гоблин"));
    objects.push_back(std::make_unique<GameObject>("Орк"));
    objects.push_back(std::make_unique<GameObject>("Тролль"));
    
    // Итерация
    for (const auto& obj : objects) {
        obj->update();
    }
    
    // Автоматическая очистка при выходе из области видимости
    return 0;
}
```

### Unique_ptr в параметрах функций

```cpp
#include <memory>

// Принятие владения (вызывающий передаёт владение)
void takeOwnership(std::unique_ptr<GameObject> obj) {
    obj->update();
    // obj удаляется при завершении функции
}

// Заимствование (не принимает владение)
void borrow(GameObject* obj) {
    if (obj) obj->update();
}

// Заимствование через ссылку (альтернатива)
void borrowRef(GameObject& obj) {
    obj.update();
}

int main() {
    auto player = std::make_unique<GameObject>("Player");
    
    // Передача владения (player становится null)
    takeOwnership(std::move(player));
    
    // Безопасное заимствование
    auto enemy = std::make_unique<GameObject>("Enemy");
    borrow(enemy.get());  // Передача сырого указателя
    borrowRef(*enemy);     // Передача ссылки
    
    return 0;
}
```

---

## Часть 3: `std::shared_ptr` — разделяемое владение

`shared_ptr` использует счётчик ссылок — объект уничтожается, когда последний владелец освобождает его.

```cpp
#include <iostream>
#include <memory>
#include <vector>

struct Texture {
    std::string path;
    int width, height;
    
    Texture(const std::string& p, int w, int h) 
        : path(p), width(w), height(h) {
        std::cout << "Загрузка текстуры: " << path << std::endl;
    }
    
    ~Texture() {
        std::cout << "Выгрузка текстуры: " << path << std::endl;
    }
};

int main() {
    // Создание shared_ptr
    auto tex1 = std::make_shared<Texture>("player.png", 64, 64);
    
    // Разделение владения (копирование)
    auto tex2 = tex1;  // Счётчик ссылок становится 2
    auto tex3 = tex1;  // Счётчик ссылок становится 3
    
    std::cout << "Счётчик ссылок: " << tex1.use_count() << std::endl;
    
    // Сброс одной ссылки
    tex2.reset();  // Счётчик ссылок становится 2
    
    // Проверка на уникальность
    if (tex1.unique()) {
        std::cout << "Только один владелец" << std::endl;
    } else {
        std::cout << "Разделяется " << tex1.use_count() << " владельцами" << std::endl;
    }
    
    // Использование в контейнерах
    std::vector<std::shared_ptr<Texture>> textures;
    textures.push_back(tex1);
    textures.push_back(std::make_shared<Texture>("enemy.png", 32, 32));
    textures.push_back(std::make_shared<Texture>("background.jpg", 1920, 1080));
    
    // Все текстуры автоматически выгружаются при уничтожении последнего shared_ptr
    
    return 0;
}
```

### Shared_ptr vs Unique_ptr — что использовать?

```cpp
// ✅ Используйте unique_ptr для исключительного владения
class Player {
    std::unique_ptr<Weapon> weapon;  // Только Player владеет оружием
};

// ✅ Используйте shared_ptr для разделяемых ресурсов
class Scene {
    std::shared_ptr<Texture> skybox;  // Несколько объектов могут использовать одну текстуру
};

// ✅ Используйте сырой указатель для невладеющего наблюдения
void render(Texture* texture) {  // Функция просто использует текстуру, не владеет ей
    if (texture) {
        // отрисовка...
    }
}
```

---

## Часть 4: `std::weak_ptr` — разрыв циклических ссылок

`weak_ptr` содержит невладеющую ссылку на объект `shared_ptr`.

### Проблема циклических ссылок

```cpp
// ❌ Циклическая ссылка — утечка памяти!
struct Node {
    std::shared_ptr<Node> next;
    ~Node() { std::cout << "Node уничтожен" << std::endl; }
};

int main() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->next = a;  // Цикл! Ни один не будет уничтожен
    // Утечка памяти!
}
```

### Решение с `weak_ptr`

```cpp
// ✅ Слабый указатель разрывает цикл
struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;  // Слабая ссылка
    ~Node() { std::cout << "Node уничтожен" << std::endl; }
};

int main() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->prev = a;  // Слабая ссылка — нет цикла!
    
    // Оба корректно уничтожаются при выходе из области видимости
    return 0;
}
```

### Использование weak_ptr

```cpp
#include <iostream>
#include <memory>

class GameObject {
public:
    std::string name;
    GameObject(const std::string& n) : name(n) {}
    void update() { std::cout << name << " обновляется" << std::endl; }
};

int main() {
    // Создание shared_ptr
    auto obj = std::make_shared<GameObject>("Player");
    
    // Создание weak_ptr из shared_ptr
    std::weak_ptr<GameObject> weak = obj;
    
    // Проверка, существует ли объект
    if (auto locked = weak.lock()) {  // Попытка получить shared_ptr
        locked->update();
        std::cout << "Объект существует, счётчик ссылок: " << locked.use_count() << std::endl;
    } else {
        std::cout << "Объект был уничтожен" << std::endl;
    }
    
    // Сброс исходного shared_ptr
    obj.reset();
    
    // Теперь weak_ptr истёк
    if (weak.expired()) {
        std::cout << "Объект исчез" << std::endl;
    }
    
    // lock() возвращает nullptr, когда срок истёк
    if (auto locked = weak.lock()) {
        // Сюда не попадём
    } else {
        std::cout << "Невозможно заблокировать истёкший weak_ptr" << std::endl;
    }
    
    return 0;
}
```

---

## Часть 5: Пользовательские удалители

Иногда требуется специальная логика очистки.

```cpp
#include <iostream>
#include <memory>
#include <cstdio>

// Пользовательский удалитель для FILE*
auto fileDeleter = [](FILE* f) {
    if (f) {
        std::cout << "Закрытие файла" << std::endl;
        fclose(f);
    }
};

int main() {
    // Использование пользовательского удалителя с unique_ptr
    std::unique_ptr<FILE, decltype(fileDeleter)> filePtr(
        fopen("test.txt", "w"),
        fileDeleter
    );
    
    if (filePtr) {
        fprintf(filePtr.get(), "Hello, World!");
    }
    // Автоматически закрывается при выходе filePtr из области видимости
    
    // Пользовательский удалитель для массива (хотя make_unique лучше)
    auto arrayDeleter = [](int* p) {
        std::cout << "Удаление массива" << std::endl;
        delete[] p;
    };
    std::unique_ptr<int, decltype(arrayDeleter)> arr(new int[100], arrayDeleter);
    
    // shared_ptr с пользовательским удалителем
    auto sharedFile = std::shared_ptr<FILE>(
        fopen("log.txt", "w"),
        [](FILE* f) {
            std::cout << "Закрытие разделяемого файла" << std::endl;
            if (f) fclose(f);
        }
    );
    
    return 0;
}
```

---

## Часть 6: RAII в деталях

**RAII** (Захват ресурса при инициализации) — принцип, воплощённый в умных указателях.

```cpp
// RAII-классы управляют ресурсами автоматически
class SoundEffect {
    int* soundData;
    
public:
    SoundEffect(const std::string& file) {
        soundData = loadSound(file);
        std::cout << "Загружен звук" << std::endl;
    }
    
    ~SoundEffect() {
        unloadSound(soundData);
        std::cout << "Выгружен звук" << std::endl;
    }
    
    void play() {
        if (soundData) playSound(soundData);
    }
    
private:
    int* loadSound(const std::string& file) { return new int(42); }
    void unloadSound(int* data) { delete data; }
    void playSound(int* data) { std::cout << "Воспроизведение звука" << std::endl; }
};

// Ручное управление ресурсами чревато ошибками
void manualManagement() {
    int* data = new int[1000];
    // ... много строк кода ...
    if (something) {
        delete[] data;  // Нужно не забыть удалить на каждом пути
        return;
    }
    // ... ещё код ...
    delete[] data;  // Легко забыть!
}

// RAII автоматично и безопасно при исключениях
void raiiManagement() {
    auto data = std::make_unique<int[]>(1000);
    // ... много строк кода ...
    if (something) {
        return;  // data очищается автоматически!
    }
    // ... ещё код ...
    // data очищается автоматически
}

// Пользовательский RAII-класс для игровых ресурсов
class TextureHandle {
    std::unique_ptr<Texture> texture;
    
public:
    TextureHandle(const std::string& path) 
        : texture(std::make_unique<Texture>(path)) {}
    
    Texture* get() const { return texture.get(); }
    
    // Автоматически очищается при выходе из области видимости
};
```

---

## Полный пример: Система игровых сущностей с умными указателями

```cpp
#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

// Предварительные объявления
class Component;
class Entity;

// Базовый компонент
class Component {
protected:
    Entity* owner;
    
public:
    virtual ~Component() = default;
    void setOwner(Entity* e) { owner = e; }
    virtual void update(float dt) = 0;
    virtual void render() = 0;
};

// Конкретные компоненты
class TransformComponent : public Component {
    float x, y;
    
public:
    TransformComponent(float startX, float startY) : x(startX), y(startY) {}
    
    void move(float dx, float dy) {
        x += dx;
        y += dy;
    }
    
    void update(float dt) override {}
    void render() override {
        std::cout << "  Позиция: (" << x << ", " << y << ")" << std::endl;
    }
};

class HealthComponent : public Component {
    int health;
    int maxHealth;
    
public:
    HealthComponent(int h) : health(h), maxHealth(h) {}
    
    void takeDamage(int amount) {
        health -= amount;
        if (health <= 0) {
            std::cout << "  Сущность погибла!" << std::endl;
        }
    }
    
    void heal(int amount) {
        health = std::min(maxHealth, health + amount);
    }
    
    void update(float dt) override {}
    void render() override {
        std::cout << "  Здоровье: " << health << "/" << maxHealth << std::endl;
    }
};

class RenderComponent : public Component {
    std::string sprite;
    
public:
    RenderComponent(const std::string& s) : sprite(s) {}
    
    void render() override {
        std::cout << "  Спрайт: " << sprite << std::endl;
    }
    
    void update(float dt) override {}
};

// Сущность управляет компонентами
class Entity : public std::enable_shared_from_this<Entity> {
    std::string name;
    std::unordered_map<std::string, std::unique_ptr<Component>> components;
    bool active;
    
public:
    Entity(const std::string& n) : name(n), active(true) {
        std::cout << "Сущность создана: " << name << std::endl;
    }
    
    ~Entity() {
        std::cout << "Сущность уничтожена: " << name << std::endl;
    }
    
    template<typename T, typename... Args>
    T* addComponent(Args&&... args) {
        auto component = std::make_unique<T>(std::forward<Args>(args)...);
        T* ptr = component.get();
        component->setOwner(this);
        components[typeid(T).name()] = std::move(component);
        return ptr;
    }
    
    template<typename T>
    T* getComponent() {
        auto it = components.find(typeid(T).name());
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
        std::cout << "Сущность: " << name << std::endl;
        for (auto& [_, comp] : components) {
            comp->render();
        }
    }
    
    void setActive(bool a) { active = a; }
    bool isActive() const { return active; }
    const std::string& getName() const { return name; }
};

// Менеджер сущностей с использованием умных указателей
class EntityManager {
    std::vector<std::shared_ptr<Entity>> entities;
    std::vector<std::weak_ptr<Entity>> weakReferences;
    
public:
    std::shared_ptr<Entity> createEntity(const std::string& name) {
        auto entity = std::make_shared<Entity>(name);
        entities.push_back(entity);
        return entity;
    }
    
    void destroyEntity(const std::string& name) {
        auto it = std::find_if(entities.begin(), entities.end(),
            [&name](const auto& e) { return e->getName() == name; });
        
        if (it != entities.end()) {
            entities.erase(it);
        }
    }
    
    void updateAll(float dt) {
        for (auto& entity : entities) {
            entity->update(dt);
        }
    }
    
    void renderAll() {
        std::cout << "\n=== ОТРИСОВКА ВСЕХ СУЩНОСТЕЙ ===" << std::endl;
        for (auto& entity : entities) {
            entity->render();
        }
    }
    
    void findAlive() {
        std::cout << "\n=== ЖИВЫЕ СУЩНОСТИ ===" << std::endl;
        for (auto& entity : entities) {
            if (entity->isActive()) {
                std::cout << "  " << entity->getName() << std::endl;
            }
        }
    }
};

// Игровой класс, использующий умные указатели повсеместно
class Game {
    EntityManager entityManager;
    bool running;
    
public:
    Game() : running(true) {
        std::cout << "Игра инициализирована" << std::endl;
    }
    
    void setup() {
        // Создание сущности игрока
        auto player = entityManager.createEntity("Игрок");
        player->addComponent<TransformComponent>(100, 200);
        player->addComponent<HealthComponent>(100);
        player->addComponent<RenderComponent>("player.png");
        
        // Создание сущности врага
        auto enemy = entityManager.createEntity("Гоблин");
        enemy->addComponent<TransformComponent>(300, 150);
        enemy->addComponent<HealthComponent>(30);
        enemy->addComponent<RenderComponent>("goblin.png");
        
        // Создание сущности NPC
        auto npc = entityManager.createEntity("Торговец");
        npc->addComponent<TransformComponent>(500, 300);
        npc->addComponent<RenderComponent>("merchant.png");
        
        // Демонстрация разделяемого владения
        std::shared_ptr<Entity> sharedEntity = entityManager.createEntity("Общая");
        {
            auto anotherRef = sharedEntity;  // Счётчик ссылок увеличивается
            std::cout << "Общая сущность имеет " << sharedEntity.use_count() 
                      << " ссылок" << std::endl;
        }  // anotherRef уничтожен, счётчик уменьшается
        std::cout << "Общая сущность теперь имеет " << sharedEntity.use_count() 
                  << " ссылок" << std::endl;
    }
    
    void run() {
        float dt = 0.016f;  // ~60 FPS
        int frame = 0;
        
        while (running && frame < 60) {
            std::cout << "\n--- Кадр " << frame << " ---" << std::endl;
            
            entityManager.updateAll(dt);
            entityManager.renderAll();
            
            frame++;
            if (frame == 30) {
                std::cout << "\n*** Игрок получает урон! ***" << std::endl;
                // Поиск игрока и нанесение ему урона
                // (в реальном коде вы бы хранили ссылки)
            }
            
            if (frame >= 60) {
                running = false;
            }
        }
    }
    
    void shutdown() {
        std::cout << "Игра завершается..." << std::endl;
        // Все сущности очищаются автоматически!
    }
};

int main() {
    Game game;
    game.setup();
    game.run();
    game.shutdown();
    
    return 0;
}
```

---

## Соображения производительности

```cpp
// Каждый умный указатель имеет минимальные накладные расходы
// unique_ptr: нулевые накладные расходы по сравнению с сырым указателем
// shared_ptr: два указателя (объект + блок управления) + атомарные операции

void performanceComparison() {
    const int COUNT = 1000000;
    
    // Сырой указатель
    auto start = std::chrono::high_resolution_clock::now();
    int** raw = new int*[COUNT];
    for (int i = 0; i < COUNT; i++) {
        raw[i] = new int(i);
    }
    for (int i = 0; i < COUNT; i++) {
        delete raw[i];
    }
    delete[] raw;
    auto rawTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    // unique_ptr (такая же производительность, как у сырого!)
    start = std::chrono::high_resolution_clock::now();
    auto unique = std::make_unique<std::unique_ptr<int>[]>(COUNT);
    for (int i = 0; i < COUNT; i++) {
        unique[i] = std::make_unique<int>(i);
    }
    // Автоматическая очистка
    auto uniqueTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    // shared_ptr (имеет накладные расходы на счётчик ссылок)
    start = std::chrono::high_resolution_clock::now();
    auto shared = std::make_shared<std::shared_ptr<int>[]>(COUNT);
    for (int i = 0; i < COUNT; i++) {
        shared[i] = std::make_shared<int>(i);
    }
    auto sharedTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "Сырой указатель: " << rawTime.count() << "мс" << std::endl;
    std::cout << "unique_ptr: " << uniqueTime.count() << "мс" << std::endl;
    std::cout << "shared_ptr: " << sharedTime.count() << "мс" << std::endl;
}
```

---

## Сводка лучших практик

| Ситуация | Рекомендация |
|-----------|----------------|
| Исключительное владение | `std::unique_ptr` |
| Разделяемое владение | `std::shared_ptr` |
| Невладеющее наблюдение | Сырой указатель или `std::weak_ptr` |
| Циклические ссылки | Используйте `weak_ptr` для разрыва циклов |
| Большие массивы | `std::unique_ptr<T[]>` или `std::vector` |
| Фабричные функции | Возвращайте `std::unique_ptr` |
| Наблюдение без владения | Передавайте сырой указатель или ссылку |

```cpp
// ✅ ДЕЛАЙТЕ: Используйте make_unique/make_shared
auto ptr = std::make_unique<MyClass>(args...);
auto sptr = std::make_shared<MyClass>(args...);

// ❌ НЕ ДЕЛАЙТЕ: Используйте new напрямую (небезопасно при исключениях)
MyClass* ptr = new MyClass(args...);  // Избегайте

// ✅ ДЕЛАЙТЕ: Используйте unique_ptr для фабрик
std::unique_ptr<Enemy> createEnemy(const std::string& type) {
    return std::make_unique<Enemy>(type);
}

// ✅ ДЕЛАЙТЕ: Передавайте сырой указатель для невладеющих функций
void render(const Texture* texture) {
    if (texture) texture->draw();
}

// ✅ ДЕЛАЙТЕ: Используйте weak_ptr для разрыва циклов
class Parent {
    std::vector<std::weak_ptr<Child>> children;  // Слабые ссылки на детей
};

// ❌ НЕ ДЕЛАЙТЕ: Используйте shared_ptr, когда достаточно unique_ptr
std::shared_ptr<Player> player = std::make_shared<Player>();  // Избыточно
```

---

## Частые ошибки

### 1. Использование `shared_ptr`, когда достаточно `unique_ptr`

```cpp
// ❌ Излишние накладные расходы на счётчик ссылок
std::shared_ptr<Texture> texture = std::make_shared<Texture>("player.png");

// ✅ Используйте unique_ptr для исключительного владения
std::unique_ptr<Texture> texture = std::make_unique<Texture>("player.png");
```

### 2. Создание циклических ссылок

```cpp
// ❌ Утечка памяти!
struct A {
    std::shared_ptr<B> b;
};
struct B {
    std::shared_ptr<A> a;
};
auto a = std::make_shared<A>();
auto b = std::make_shared<B>();
a->b = b;
b->a = a;  // Никогда не будут уничтожены!

// ✅ Используйте weak_ptr
struct B {
    std::weak_ptr<A> a;  // Разрыв цикла
};
```

### 3. Возврат сырого указателя из фабрики

```cpp
// ❌ Кто владеет? Кто удаляет?
Texture* loadTexture(const std::string& path) {
    return new Texture(path);
}

// ✅ Чёткое владение
std::unique_ptr<Texture> loadTexture(const std::string& path) {
    return std::make_unique<Texture>(path);
}
```

### 4. Слишком частое использование `get()`

```cpp
auto ptr = std::make_unique<MyClass>();
// ❌ Избегайте использования сырого указателя, если он не нужен
MyClass* raw = ptr.get();

// ✅ Используйте умный указатель напрямую, когда это возможно
ptr->doSomething();
```

---

## Шпаргалка

```cpp
#include <memory>

// Создание
auto u = std::make_unique<T>(args...);     // C++14
auto s = std::make_shared<T>(args...);     // C++11
std::unique_ptr<T> u2(new T(args...));     // До C++14

// Операции с unique_ptr
std::unique_ptr<T> u;
u.get();                    // Сырой указатель
u.reset();                  // Удалить и установить в null
u.reset(new T);             // Удалить старый, взять новый
u.release();                // Освободить владение (возвращает сырой указатель)
std::move(u);               // Передача владения

// Операции с shared_ptr
std::shared_ptr<T> s;
s.use_count();              // Количество разделяющих владельцев
s.unique();                 // true, если use_count == 1
s.reset();                  // Уменьшить счётчик ссылок
std::move(s);               // Передача владения

// Операции с weak_ptr
std::weak_ptr<T> w;
w.lock();                   // Получить shared_ptr (может быть null)
w.expired();                // true, если объект удалён
w.reset();                  // Очистка weak_ptr

// Приведение умных указателей
std::static_pointer_cast<T>(s);
std::dynamic_pointer_cast<T>(s);
std::const_pointer_cast<T>(s);
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Преобразуйте реализацию с сырыми указателями для использования `unique_ptr`. Определите, где использовать `make_unique` и как обрабатывать передачу владения.

**Упражнение 2 (Среднее):** Реализуйте `ResourceCache`, который использует `shared_ptr` для управления текстурами. Несколько игровых объектов должны разделять одну и ту же текстуру, пока все они не будут уничтожены.

**Упражнение 3 (Среднее):** Создайте структуру `TreeNode` с использованием `weak_ptr` для указателей на родителя, чтобы избежать утечек памяти. Реализуйте обход дерева, который не удерживает ссылки дольше необходимого.

**Упражнение 4 (Сложное):** Создайте `ComponentSystem`, где компоненты хранят `weak_ptr` на владеющую сущность. Убедитесь, что сущности могут быть безопасно уничтожены, пока компоненты всё ещё ссылаются на них.

**Упражнение 5 (Сложное):** Реализуйте `ObjectPool`, который возвращает `shared_ptr` с пользовательским удалителем, возвращающим объекты в пул вместо их удаления.

**Упражнение 6 (Вызов):** Создайте `EventSystem`, где обработчики событий хранятся как `weak_ptr` на объекты-слушатели. Автоматически удаляйте обработчики, когда слушатель уничтожается.

---

## Резюме

Теперь вы знаете:

✅ Проблемы с сырыми указателями (утечки, висячие, двойное удаление)  
✅ `unique_ptr` для исключительного владения  
✅ `shared_ptr` для разделяемого владения со счётчиком ссылок  
✅ `weak_ptr` для разрыва циклических ссылок  
✅ Пользовательские удалители для специальной очистки  
✅ Принцип RAII и безопасность исключений  
✅ Полную систему игровых сущностей с умными указателями  
✅ Соображения производительности и лучшие практики  

## Что дальше?

Следующий урок: **Семантика перемещения и идеальная передача** — понимайте `std::move`, `std::forward` и пишите эффективный современный C++!

---

## Ресурсы

- [Умные указатели (cppreference)](https://en.cppreference.com/w/cpp/memory)
- [std::unique_ptr](https://en.cppreference.com/w/cpp/memory/unique_ptr)
- [std::shared_ptr](https://en.cppreference.com/w/cpp/memory/shared_ptr)
- [std::weak_ptr](https://en.cppreference.com/w/cpp/memory/weak_ptr)
- [Принцип RAII](https://en.cppreference.com/w/cpp/language/raii)

---

**Практическое задание:** Рефакторинг небольшой игры с сырых указателей на умные. Начните с управления сущностями, затем добавьте систему компонентов, затем загрузку ресурсов. Проверьте отсутствие утечек памяти с помощью инструментов вроде Valgrind или проверки памяти Visual Studio.