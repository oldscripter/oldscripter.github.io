---
title: "Smart Pointers — Automatic Memory Management"
description: "Master unique_ptr, shared_ptr, weak_ptr — never leak memory again"
pubDate: 2026-05-17
tags: ["C++", "intermediate", "smart-pointers", "RAII", "memory-management"]
lang: "en"
lessonNumber: 207
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 17: Smart Pointers — Automatic Memory Management

Welcome back! Raw pointers with `new` and `delete` are error-prone. **Smart pointers** automate memory management, making leaks virtually impossible.

## What You'll Learn

- Problems with raw pointers (memory leaks, dangling pointers)
- `std::unique_ptr` — exclusive ownership
- `std::shared_ptr` — shared ownership with reference counting
- `std::weak_ptr` — breaking circular references
- `std::make_unique` and `std::make_shared`
- Custom deleters
- RAII principle in depth
- Complete game object management system

---

## Part 1: The Problem with Raw Pointers

```cpp
// ❌ Problem 1: Memory leak
void leakMemory() {
    int* data = new int[1000];
    // Forgot delete[] — memory leak!
}

// ❌ Problem 2: Double delete
int* ptr = new int(42);
delete ptr;
delete ptr;  // Undefined behavior (crash likely)

// ❌ Problem 3: Dangling pointer
int* getDanglingPointer() {
    int x = 42;
    return &x;  // x destroyed when function returns!
}

// ❌ Problem 4: Exception unsafe
void unsafeFunction() {
    int* data = new int[1000];
    if (someCondition) {
        throw std::runtime_error("Error");
        // Delete never called — memory leak!
    }
    delete[] data;
}

// ✅ Solution: Smart pointers handle all of this automatically
```

---

## Part 2: `std::unique_ptr` — Exclusive Ownership

`unique_ptr` owns the object exclusively — cannot be copied, only moved.

```cpp
#include <iostream>
#include <memory>
#include <vector>

class GameObject {
public:
    std::string name;
    
    GameObject(const std::string& n) : name(n) {
        std::cout << "Created: " << name << std::endl;
    }
    
    ~GameObject() {
        std::cout << "Destroyed: " << name << std::endl;
    }
    
    void update() {
        std::cout << "Updating: " << name << std::endl;
    }
};

int main() {
    // Create unique_ptr (prefer make_unique)
    auto player = std::make_unique<GameObject>("Player");
    
    // Use like raw pointer
    player->update();
    (*player).update();
    
    // Cannot copy — compile error!
    // auto player2 = player;  // ❌ Error!
    
    // Can move (transfer ownership)
    auto enemy = std::make_unique<GameObject>("Enemy");
    auto transferred = std::move(enemy);  // enemy becomes null
    if (!enemy) {
        std::cout << "enemy is now null" << std::endl;
    }
    
    // Vector of unique_ptrs
    std::vector<std::unique_ptr<GameObject>> objects;
    objects.push_back(std::make_unique<GameObject>("Goblin"));
    objects.push_back(std::make_unique<GameObject>("Orc"));
    objects.push_back(std::make_unique<GameObject>("Troll"));
    
    // Iterate
    for (const auto& obj : objects) {
        obj->update();
    }
    
    // Automatic cleanup when out of scope
    return 0;
}
```

### Unique_ptr in Function Parameters

```cpp
#include <memory>

// Take ownership (caller gives up ownership)
void takeOwnership(std::unique_ptr<GameObject> obj) {
    obj->update();
    // obj deleted when function ends
}

// Borrow (doesn't take ownership)
void borrow(GameObject* obj) {
    if (obj) obj->update();
}

// Borrow with reference (alternative)
void borrowRef(GameObject& obj) {
    obj.update();
}

int main() {
    auto player = std::make_unique<GameObject>("Player");
    
    // Pass ownership (player becomes null)
    takeOwnership(std::move(player));
    
    // Borrow safely
    auto enemy = std::make_unique<GameObject>("Enemy");
    borrow(enemy.get());  // Pass raw pointer
    borrowRef(*enemy);     // Pass reference
    
    return 0;
}
```

---

## Part 3: `std::shared_ptr` — Shared Ownership

`shared_ptr` uses reference counting — object destroyed when last owner releases it.

```cpp
#include <iostream>
#include <memory>
#include <vector>

struct Texture {
    std::string path;
    int width, height;
    
    Texture(const std::string& p, int w, int h) 
        : path(p), width(w), height(h) {
        std::cout << "Loading texture: " << path << std::endl;
    }
    
    ~Texture() {
        std::cout << "Unloading texture: " << path << std::endl;
    }
};

int main() {
    // Create shared_ptr
    auto tex1 = std::make_shared<Texture>("player.png", 64, 64);
    
    // Share ownership (copy)
    auto tex2 = tex1;  // Reference count becomes 2
    auto tex3 = tex1;  // Reference count becomes 3
    
    std::cout << "Reference count: " << tex1.use_count() << std::endl;
    
    // Reset one reference
    tex2.reset();  // Reference count becomes 2
    
    // Check if unique
    if (tex1.unique()) {
        std::cout << "Only one owner" << std::endl;
    } else {
        std::cout << "Shared by " << tex1.use_count() << " owners" << std::endl;
    }
    
    // Use in containers
    std::vector<std::shared_ptr<Texture>> textures;
    textures.push_back(tex1);
    textures.push_back(std::make_shared<Texture>("enemy.png", 32, 32));
    textures.push_back(std::make_shared<Texture>("background.jpg", 1920, 1080));
    
    // All textures automatically cleaned up when last shared_ptr destroyed
    
    return 0;
}
```

### Shared_ptr vs Unique_ptr — Which to Use?

```cpp
// ✅ Use unique_ptr for exclusive ownership
class Player {
    std::unique_ptr<Weapon> weapon;  // Player alone owns weapon
};

// ✅ Use shared_ptr for shared resources
class Scene {
    std::shared_ptr<Texture> skybox;  // Multiple objects may use same texture
};

// ✅ Use raw pointer for non-owning observation
void render(Texture* texture) {  // Function just uses texture, doesn't own it
    if (texture) {
        // render...
    }
}
```

---

## Part 4: `std::weak_ptr` — Breaking Circular References

`weak_ptr` holds a non-owning reference to a `shared_ptr`'s object.

### The Circular Reference Problem

```cpp
// ❌ Circular reference — memory leak!
struct Node {
    std::shared_ptr<Node> next;
    ~Node() { std::cout << "Node destroyed" << std::endl; }
};

int main() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->next = a;  // Circular! Neither will ever be destroyed
    // Memory leak!
}
```

### Solution with `weak_ptr`

```cpp
// ✅ Weak pointer breaks the cycle
struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;  // Weak reference
    ~Node() { std::cout << "Node destroyed" << std::endl; }
};

int main() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->prev = a;  // Weak reference — no cycle!
    
    // Both destroyed correctly when out of scope
    return 0;
}
```

### Using weak_ptr

```cpp
#include <iostream>
#include <memory>

class GameObject {
public:
    std::string name;
    GameObject(const std::string& n) : name(n) {}
    void update() { std::cout << name << " updating" << std::endl; }
};

int main() {
    // Create shared_ptr
    auto obj = std::make_shared<GameObject>("Player");
    
    // Create weak_ptr from shared_ptr
    std::weak_ptr<GameObject> weak = obj;
    
    // Check if object still exists
    if (auto locked = weak.lock()) {  // Try to get shared_ptr
        locked->update();
        std::cout << "Object exists, ref count: " << locked.use_count() << std::endl;
    } else {
        std::cout << "Object has been destroyed" << std::endl;
    }
    
    // Reset the original shared_ptr
    obj.reset();
    
    // Now weak_ptr is expired
    if (weak.expired()) {
        std::cout << "Object is gone" << std::endl;
    }
    
    // lock() returns nullptr when expired
    if (auto locked = weak.lock()) {
        // Won't get here
    } else {
        std::cout << "Cannot lock expired weak_ptr" << std::endl;
    }
    
    return 0;
}
```

---

## Part 5: Custom Deleters

Sometimes you need special cleanup logic.

```cpp
#include <iostream>
#include <memory>
#include <cstdio>

// Custom deleter for FILE*
auto fileDeleter = [](FILE* f) {
    if (f) {
        std::cout << "Closing file" << std::endl;
        fclose(f);
    }
};

int main() {
    // Using custom deleter with unique_ptr
    std::unique_ptr<FILE, decltype(fileDeleter)> filePtr(
        fopen("test.txt", "w"),
        fileDeleter
    );
    
    if (filePtr) {
        fprintf(filePtr.get(), "Hello, World!");
    }
    // Automatically closed when filePtr goes out of scope
    
    // Custom deleter for array (though make_unique is better)
    auto arrayDeleter = [](int* p) {
        std::cout << "Deleting array" << std::endl;
        delete[] p;
    };
    std::unique_ptr<int, decltype(arrayDeleter)> arr(new int[100], arrayDeleter);
    
    // Shared_ptr with custom deleter
    auto sharedFile = std::shared_ptr<FILE>(
        fopen("log.txt", "w"),
        [](FILE* f) {
            std::cout << "Closing shared file" << std::endl;
            if (f) fclose(f);
        }
    );
    
    return 0;
}
```

---

## Part 6: RAII in Depth

**RAII** (Resource Acquisition Is Initialization) is the principle smart pointers embody.

```cpp
// RAII classes manage resources automatically
class SoundEffect {
    int* soundData;
    
public:
    SoundEffect(const std::string& file) {
        soundData = loadSound(file);
        std::cout << "Loaded sound" << std::endl;
    }
    
    ~SoundEffect() {
        unloadSound(soundData);
        std::cout << "Unloaded sound" << std::endl;
    }
    
    void play() {
        if (soundData) playSound(soundData);
    }
    
private:
    int* loadSound(const std::string& file) { return new int(42); }
    void unloadSound(int* data) { delete data; }
    void playSound(int* data) { std::cout << "Playing sound" << std::endl; }
};

// Manual resource management is error-prone
void manualManagement() {
    int* data = new int[1000];
    // ... many lines of code ...
    if (something) {
        delete[] data;  // Must remember to delete on every path
        return;
    }
    // ... more code ...
    delete[] data;  // Easy to forget!
}

// RAII is automatic and exception-safe
void raiiManagement() {
    auto data = std::make_unique<int[]>(1000);
    // ... many lines of code ...
    if (something) {
        return;  // data automatically cleaned up!
    }
    // ... more code ...
    // data automatically cleaned up
}

// Custom RAII class for game resources
class TextureHandle {
    std::unique_ptr<Texture> texture;
    
public:
    TextureHandle(const std::string& path) 
        : texture(std::make_unique<Texture>(path)) {}
    
    Texture* get() const { return texture.get(); }
    
    // Automatically cleaned up when out of scope
};
```

---

## Complete Example: Game Entity System with Smart Pointers

```cpp
#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

// Forward declarations
class Component;
class Entity;

// Base Component
class Component {
protected:
    Entity* owner;
    
public:
    virtual ~Component() = default;
    void setOwner(Entity* e) { owner = e; }
    virtual void update(float dt) = 0;
    virtual void render() = 0;
};

// Specific components
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
        std::cout << "  Position: (" << x << ", " << y << ")" << std::endl;
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
            std::cout << "  Entity died!" << std::endl;
        }
    }
    
    void heal(int amount) {
        health = std::min(maxHealth, health + amount);
    }
    
    void update(float dt) override {}
    void render() override {
        std::cout << "  Health: " << health << "/" << maxHealth << std::endl;
    }
};

class RenderComponent : public Component {
    std::string sprite;
    
public:
    RenderComponent(const std::string& s) : sprite(s) {}
    
    void render() override {
        std::cout << "  Sprite: " << sprite << std::endl;
    }
    
    void update(float dt) override {}
};

// Entity manages components
class Entity : public std::enable_shared_from_this<Entity> {
    std::string name;
    std::unordered_map<std::string, std::unique_ptr<Component>> components;
    bool active;
    
public:
    Entity(const std::string& n) : name(n), active(true) {
        std::cout << "Entity created: " << name << std::endl;
    }
    
    ~Entity() {
        std::cout << "Entity destroyed: " << name << std::endl;
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
        std::cout << "Entity: " << name << std::endl;
        for (auto& [_, comp] : components) {
            comp->render();
        }
    }
    
    void setActive(bool a) { active = a; }
    bool isActive() const { return active; }
    const std::string& getName() const { return name; }
};

// Entity manager using smart pointers
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
        std::cout << "\n=== RENDER ALL ENTITIES ===" << std::endl;
        for (auto& entity : entities) {
            entity->render();
        }
    }
    
    void findAlive() {
        std::cout << "\n=== ALIVE ENTITIES ===" << std::endl;
        for (auto& entity : entities) {
            if (entity->isActive()) {
                std::cout << "  " << entity->getName() << std::endl;
            }
        }
    }
};

// Game class using smart pointers throughout
class Game {
    EntityManager entityManager;
    bool running;
    
public:
    Game() : running(true) {
        std::cout << "Game initialized" << std::endl;
    }
    
    void setup() {
        // Create player entity
        auto player = entityManager.createEntity("Player");
        player->addComponent<TransformComponent>(100, 200);
        player->addComponent<HealthComponent>(100);
        player->addComponent<RenderComponent>("player.png");
        
        // Create enemy entity
        auto enemy = entityManager.createEntity("Goblin");
        enemy->addComponent<TransformComponent>(300, 150);
        enemy->addComponent<HealthComponent>(30);
        enemy->addComponent<RenderComponent>("goblin.png");
        
        // Create NPC entity
        auto npc = entityManager.createEntity("Merchant");
        npc->addComponent<TransformComponent>(500, 300);
        npc->addComponent<RenderComponent>("merchant.png");
        
        // Demonstrate shared ownership
        std::shared_ptr<Entity> sharedEntity = entityManager.createEntity("Shared");
        {
            auto anotherRef = sharedEntity;  // Reference count increases
            std::cout << "Shared entity has " << sharedEntity.use_count() 
                      << " references" << std::endl;
        }  // anotherRef destroyed, count decreases
        std::cout << "Shared entity now has " << sharedEntity.use_count() 
                  << " references" << std::endl;
    }
    
    void run() {
        float dt = 0.016f;  // ~60 FPS
        int frame = 0;
        
        while (running && frame < 60) {
            std::cout << "\n--- Frame " << frame << " ---" << std::endl;
            
            entityManager.updateAll(dt);
            entityManager.renderAll();
            
            frame++;
            if (frame == 30) {
                std::cout << "\n*** Player takes damage! ***" << std::endl;
                // Find player and damage them
                // (In real code, you'd store references)
            }
            
            if (frame >= 60) {
                running = false;
            }
        }
    }
    
    void shutdown() {
        std::cout << "Game shutting down..." << std::endl;
        // All entities automatically cleaned up!
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

## Performance Considerations

```cpp
// Each smart pointer has minimal overhead
// unique_ptr: zero overhead compared to raw pointer
// shared_ptr: two pointers (object + control block) + atomic operations

void performanceComparison() {
    const int COUNT = 1000000;
    
    // Raw pointer
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
    
    // unique_ptr (same performance as raw!)
    start = std::chrono::high_resolution_clock::now();
    auto unique = std::make_unique<std::unique_ptr<int>[]>(COUNT);
    for (int i = 0; i < COUNT; i++) {
        unique[i] = std::make_unique<int>(i);
    }
    // Automatic cleanup
    auto uniqueTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    // shared_ptr (has overhead for reference counting)
    start = std::chrono::high_resolution_clock::now();
    auto shared = std::make_shared<std::shared_ptr<int>[]>(COUNT);
    for (int i = 0; i < COUNT; i++) {
        shared[i] = std::make_shared<int>(i);
    }
    auto sharedTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "Raw pointer: " << rawTime.count() << "ms" << std::endl;
    std::cout << "unique_ptr: " << uniqueTime.count() << "ms" << std::endl;
    std::cout << "shared_ptr: " << sharedTime.count() << "ms" << std::endl;
}
```

---

## Best Practices Summary

| Situation | Recommendation |
|-----------|----------------|
| Exclusive ownership | `std::unique_ptr` |
| Shared ownership | `std::shared_ptr` |
| Non-owning observation | Raw pointer or `std::weak_ptr` |
| Circular references | Use `weak_ptr` to break cycles |
| Large arrays | `std::unique_ptr<T[]>` or `std::vector` |
| Factory functions | Return `std::unique_ptr` |
| Observing without ownership | Pass raw pointer or reference |

```cpp
// ✅ DO: Use make_unique/make_shared
auto ptr = std::make_unique<MyClass>(args...);
auto sptr = std::make_shared<MyClass>(args...);

// ❌ DON'T: Use new directly (exception unsafe)
MyClass* ptr = new MyClass(args...);  // Avoid

// ✅ DO: Use unique_ptr for factory
std::unique_ptr<Enemy> createEnemy(const std::string& type) {
    return std::make_unique<Enemy>(type);
}

// ✅ DO: Pass raw pointer for non-owning functions
void render(const Texture* texture) {
    if (texture) texture->draw();
}

// ✅ DO: Use weak_ptr to break cycles
class Parent {
    std::vector<std::weak_ptr<Child>> children;  // Weak to children
};

// ❌ DON'T: Use shared_ptr when unique_ptr suffices
std::shared_ptr<Player> player = std::make_shared<Player>();  // Overkill
```

---

## Common Mistakes

### 1. Using `shared_ptr` When `unique_ptr` Would Do

```cpp
// ❌ Unnecessary reference counting overhead
std::shared_ptr<Texture> texture = std::make_shared<Texture>("player.png");

// ✅ Use unique_ptr for exclusive ownership
std::unique_ptr<Texture> texture = std::make_unique<Texture>("player.png");
```

### 2. Creating Circular References

```cpp
// ❌ Memory leak!
struct A {
    std::shared_ptr<B> b;
};
struct B {
    std::shared_ptr<A> a;
};
auto a = std::make_shared<A>();
auto b = std::make_shared<B>();
a->b = b;
b->a = a;  // Never destroyed!

// ✅ Use weak_ptr
struct B {
    std::weak_ptr<A> a;  // Break the cycle
};
```

### 3. Returning Raw Pointer from Factory

```cpp
// ❌ Who owns this? Who deletes?
Texture* loadTexture(const std::string& path) {
    return new Texture(path);
}

// ✅ Clear ownership
std::unique_ptr<Texture> loadTexture(const std::string& path) {
    return std::make_unique<Texture>(path);
}
```

### 4. Using `get()` Too Often

```cpp
auto ptr = std::make_unique<MyClass>();
// ❌ Avoid using raw pointer if not needed
MyClass* raw = ptr.get();

// ✅ Use smart pointer directly when possible
ptr->doSomething();
```

---

## Quick Reference Card

```cpp
#include <memory>

// Creation
auto u = std::make_unique<T>(args...);     // C++14
auto s = std::make_shared<T>(args...);     // C++11
std::unique_ptr<T> u2(new T(args...));     // Pre-C++14

// unique_ptr operations
std::unique_ptr<T> u;
u.get();                    // Raw pointer
u.reset();                  // Delete and set to null
u.reset(new T);             // Delete old, take new
u.release();                // Release ownership (returns raw)
std::move(u);               // Transfer ownership

// shared_ptr operations
std::shared_ptr<T> s;
s.use_count();              // Number of shared owners
s.unique();                 // true if use_count == 1
s.reset();                  // Decrement ref count
std::move(s);               // Transfer ownership

// weak_ptr operations
std::weak_ptr<T> w;
w.lock();                   // Get shared_ptr (may be null)
w.expired();                // true if object deleted
w.reset();                  // Clear weak_ptr

// Casting smart pointers
std::static_pointer_cast<T>(s);
std::dynamic_pointer_cast<T>(s);
std::const_pointer_cast<T>(s);
```

---

## Practice Exercises

**Exercise 1 (Easy):** Convert a raw pointer implementation to use `unique_ptr`. Identify where to use `make_unique` and how to handle ownership transfer.

**Exercise 2 (Medium):** Implement a `ResourceCache` that uses `shared_ptr` to manage textures. Multiple game objects should share the same texture until all are destroyed.

**Exercise 3 (Medium):** Create a `TreeNode` structure using `weak_ptr` for parent pointers to avoid memory leaks. Implement a tree traversal that doesn't hold references longer than needed.

**Exercise 4 (Hard):** Build a `ComponentSystem` where components hold `weak_ptr` to their owner entity. Ensure entities can be destroyed safely while components still reference them.

**Exercise 5 (Hard):** Implement a `ObjectPool` that returns `shared_ptr` with a custom deleter that returns objects to the pool instead of deleting them.

**Exercise 6 (Challenge):** Create a `EventSystem` where event handlers are stored as `weak_ptr` to listener objects. Automatically remove handlers when the listener is destroyed.

---

## Summary

You now know:

✅ Problems with raw pointers (leaks, dangling, double delete)  
✅ `unique_ptr` for exclusive ownership  
✅ `shared_ptr` for shared ownership with reference counting  
✅ `weak_ptr` to break circular references  
✅ Custom deleters for special cleanup  
✅ RAII principle and exception safety  
✅ Complete game entity system using smart pointers  
✅ Performance considerations and best practices  

## What's Next?

Next lesson: **Move Semantics and Perfect Forwarding** — understand `std::move`, `std::forward`, and write efficient modern C++!

---

## Resources

- [Smart pointers (cppreference)](https://en.cppreference.com/w/cpp/memory)
- [std::unique_ptr](https://en.cppreference.com/w/cpp/memory/unique_ptr)
- [std::shared_ptr](https://en.cppreference.com/w/cpp/memory/shared_ptr)
- [std::weak_ptr](https://en.cppreference.com/w/cpp/memory/weak_ptr)
- [RAII principle](https://en.cppreference.com/w/cpp/language/raii)

---

**Practice Task:** Refactor a small game from raw pointers to smart pointers. Start with entity management, then add component system, then resource loading. Verify no memory leaks using tools like Valgrind or Visual Studio's memory checker.