---
title: "Templates — Generic Programming"
description: "Write code once, use with any type — generic containers, algorithms, and more"
pubDate: 2026-05-14
tags: ["C++", "intermediate", "templates", "generic-programming", "metaprogramming"]
lessonNumber: 14
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 14: Templates — Generic Programming

Welcome back! So far, we've written functions and classes for specific types — `int`, `float`, `string`. But what if you want the SAME logic for different types? **Templates** let you write code once and use it with any type.

## What You'll Learn

- Function templates (generic functions)
- Class templates (generic containers)
- Template parameters (types and values)
- Template specialization
- Variadic templates (C++11)
- Real-world examples: generic pools, factories

---

## Part 1: The Problem Templates Solve

Without templates, you'd need to duplicate code for each type:

```cpp
// ❌ Code duplication
int maxInt(int a, int b) {
    return (a > b) ? a : b;
}

float maxFloat(float a, float b) {
    return (a > b) ? a : b;
}

double maxDouble(double a, double b) {
    return (a > b) ? a : b;
}

// Painful to maintain and extend!
```

**With templates — one function works for all types:**

```cpp
// ✅ One template works for any type
template <typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}

// Usage
int x = max(10, 20);
float y = max(3.14f, 2.71f);
double z = max(3.14159, 2.71828);
std::string s = max(std::string("apple"), std::string("banana"));
```

---

## Part 2: Function Templates

### Basic Syntax

```cpp
#include <iostream>
#include <string>

// Template with typename parameter
template <typename T>
T add(T a, T b) {
    return a + b;
}

// Multiple template parameters
template <typename T1, typename T2>
auto multiply(T1 a, T2 b) -> decltype(a * b) {  // C++11 trailing return
    return a * b;
}

// C++14 and later: simpler
template <typename T1, typename T2>
auto multiply(T1 a, T2 b) {
    return a * b;
}

int main() {
    // Type deduction (compiler figures out T)
    int i1 = add(5, 3);           // T = int
    float f1 = add(5.5f, 2.3f);   // T = float
    std::string s1 = add(std::string("Hello "), std::string("World"));
    
    // Explicit type specification
    int i2 = add<int>(5, 3);
    
    // Mixed types (requires auto return)
    auto result = multiply(5, 3.14);  // result is double (15.7)
    
    std::cout << "Int add: " << i1 << std::endl;
    std::cout << "String add: " << s1 << std::endl;
    std::cout << "Mixed multiply: " << result << std::endl;
    
    return 0;
}
```

### Template for Arrays

```cpp
#include <iostream>

// Template with size parameter (non-type template parameter)
template <typename T, int N>
T arraySum(const T (&arr)[N]) {
    T sum = 0;
    for (int i = 0; i < N; i++) {
        sum += arr[i];
    }
    return sum;
}

int main() {
    int intArr[] = {1, 2, 3, 4, 5};
    float floatArr[] = {1.1f, 2.2f, 3.3f};
    
    std::cout << "Sum of ints: " << arraySum(intArr) << std::endl;     // 15
    std::cout << "Sum of floats: " << arraySum(floatArr) << std::endl; // 6.6
    
    return 0;
}
```

---

## Part 3: Class Templates

### Simple Generic Container

```cpp
#include <iostream>
#include <string>

template <typename T>
class Box {
private:
    T content;
    bool hasContent;
    
public:
    Box() : hasContent(false) {}
    
    void put(const T& item) {
        content = item;
        hasContent = true;
    }
    
    T get() {
        if (!hasContent) {
            throw std::runtime_error("Box is empty!");
        }
        hasContent = false;
        return content;
    }
    
    bool isEmpty() const {
        return !hasContent;
    }
};

int main() {
    // Box for integers
    Box<int> intBox;
    intBox.put(42);
    std::cout << "Int from box: " << intBox.get() << std::endl;
    
    // Box for strings
    Box<std::string> stringBox;
    stringBox.put("Hello, World!");
    std::cout << "String from box: " << stringBox.get() << std::endl;
    
    // Box for custom type
    struct Player { std::string name; int health; };
    Box<Player> playerBox;
    playerBox.put({"Kaelen", 100});
    Player p = playerBox.get();
    std::cout << "Player: " << p.name << " (HP: " << p.health << ")" << std::endl;
    
    return 0;
}
```

### Generic Pair (like std::pair)

```cpp
#include <iostream>
#include <string>

template <typename T1, typename T2>
class Pair {
private:
    T1 first;
    T2 second;
    
public:
    Pair(const T1& f, const T2& s) : first(f), second(s) {}
    
    T1 getFirst() const { return first; }
    T2 getSecond() const { return second; }
    
    void setFirst(const T1& f) { first = f; }
    void setSecond(const T2& s) { second = s; }
    
    void display() const {
        std::cout << "(" << first << ", " << second << ")" << std::endl;
    }
};

int main() {
    Pair<int, std::string> p1(5, "apple");
    Pair<double, bool> p2(3.14, true);
    Pair<std::string, int> p3("level", 10);
    
    p1.display();  // (5, apple)
    p2.display();  // (3.14, 1)
    p3.display();  // (level, 10)
    
    return 0;
}
```

---

## Part 4: Template Specialization

Sometimes the generic version doesn't work for specific types. You can provide special implementations.

```cpp
#include <iostream>
#include <string>
#include <cstring>

// Generic version
template <typename T>
bool compare(const T& a, const T& b) {
    return a == b;
}

// Specialization for const char* (C-style strings)
template <>
bool compare<const char*>(const char* const& a, const char* const& b) {
    return strcmp(a, b) == 0;
}

// Specialization for char* (non-const)
template <>
bool compare<char*>(char* const& a, char* const& b) {
    return strcmp(a, b) == 0;
}

// Class template specialization
template <typename T>
class Printer {
public:
    static void print(const T& value) {
        std::cout << "Generic: " << value << std::endl;
    }
};

// Specialization for bool
template <>
class Printer<bool> {
public:
    static void print(bool value) {
        std::cout << "Boolean: " << (value ? "true" : "false") << std::endl;
    }
};

int main() {
    // Function template specialization
    int a = 5, b = 5;
    std::cout << "Int compare: " << compare(a, b) << std::endl;  // true
    
    const char* str1 = "hello";
    const char* str2 = "hello";
    std::cout << "String compare: " << compare(str1, str2) << std::endl;  // true (uses specialization)
    
    // Class template specialization
    Printer<int>::print(42);           // Generic: 42
    Printer<double>::print(3.14);      // Generic: 3.14
    Printer<bool>::print(true);        // Boolean: true (specialized)
    
    return 0;
}
```

---

## Part 5: Variadic Templates (C++11)

Templates that accept any number of arguments.

```cpp
#include <iostream>
#include <string>

// Base case: no arguments
void print() {
    std::cout << std::endl;
}

// Recursive variadic template
template <typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first;
    if (sizeof...(rest) > 0) {
        std::cout << ", ";
    }
    print(rest...);  // Recursive call with remaining arguments
}

// Sum of any number of arguments
template <typename T>
T sum(T value) {
    return value;
}

template <typename T, typename... Args>
T sum(T first, Args... rest) {
    return first + sum(rest...);
}

// Creating a tuple-like structure
template <typename... Types>
class Tuple {
    // Implementation would use recursion or std::tuple
};

int main() {
    print(1, 2, 3, "hello", 3.14, true);
    // Output: 1, 2, 3, hello, 3.14, 1
    
    int total = sum(1, 2, 3, 4, 5);
    std::cout << "Sum: " << total << std::endl;  // 15
    
    double mixed = sum(1, 2.5, 3.7f);
    std::cout << "Mixed sum: " << mixed << std::endl;  // 7.2
    
    return 0;
}
```

---

## Part 6: Non-Type Template Parameters

Templates can take values, not just types.

```cpp
#include <iostream>
#include <array>

// Fixed-size array template
template <typename T, int Size>
class FixedArray {
private:
    T data[Size];
    
public:
    T& operator[](int index) {
        if (index < 0 || index >= Size) {
            throw std::out_of_range("Index out of bounds");
        }
        return data[index];
    }
    
    const T& operator[](int index) const {
        if (index < 0 || index >= Size) {
            throw std::out_of_range("Index out of bounds");
        }
        return data[index];
    }
    
    int size() const { return Size; }
    
    void fill(const T& value) {
        for (int i = 0; i < Size; i++) {
            data[i] = value;
        }
    }
};

// Compile-time factorial
template <int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template <>
struct Factorial<0> {
    static constexpr int value = 1;
};

// Compile-time power
template <int Base, int Exp>
struct Power {
    static constexpr int value = Base * Power<Base, Exp - 1>::value;
};

template <int Base>
struct Power<Base, 0> {
    static constexpr int value = 1;
};

int main() {
    FixedArray<int, 5> arr;
    arr.fill(10);
    arr[2] = 42;
    
    for (int i = 0; i < arr.size(); i++) {
        std::cout << arr[i] << " ";
    }
    std::cout << std::endl;
    
    // Compile-time calculations (zero runtime cost!)
    std::cout << "5! = " << Factorial<5>::value << std::endl;      // 120
    std::cout << "2^10 = " << Power<2, 10>::value << std::endl;    // 1024
    
    return 0;
}
```

---

## Complete Example: Generic Object Pool

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <stack>
#include <string>

// Generic object pool for any type
template <typename T>
class ObjectPool {
private:
    std::stack<std::unique_ptr<T>> pool;
    int maxSize;
    int createdCount;
    
    T* create() {
        createdCount++;
        return new T();
    }
    
public:
    ObjectPool(int max = 100) : maxSize(max), createdCount(0) {}
    
    ~ObjectPool() {
        // All objects automatically cleaned up by unique_ptr
        std::cout << "Pool destroyed. Created " << createdCount 
                  << " objects, " << pool.size() << " remain in pool." << std::endl;
    }
    
    // Acquire an object from the pool
    std::unique_ptr<T, std::function<void(T*)>> acquire() {
        if (!pool.empty()) {
            auto ptr = std::move(pool.top());
            pool.pop();
            
            // Wrap with custom deleter that returns to pool
            std::unique_ptr<T, std::function<void(T*)>> returned(ptr.release(), 
                [this](T* obj) {
                    if (obj) {
                        // Reset object state if needed
                        obj->reset();
                        this->release(obj);
                    }
                });
            return returned;
        }
        
        // Create new object
        if (createdCount < maxSize) {
            std::unique_ptr<T, std::function<void(T*)>> newObj(new T(),
                [this](T* obj) {
                    if (obj) {
                        obj->reset();
                        this->release(obj);
                    }
                });
            return newObj;
        }
        
        throw std::runtime_error("Object pool exhausted!");
    }
    
    // Release object back to pool
    void release(T* obj) {
        pool.push(std::unique_ptr<T>(obj));
    }
    
    int available() const { return pool.size(); }
    int created() const { return createdCount; }
};

// Example game object
class Particle {
private:
    float x, y, vx, vy;
    float lifetime;
    bool active;
    
public:
    Particle() : x(0), y(0), vx(0), vy(0), lifetime(0), active(false) {
        std::cout << "Particle created" << std::endl;
    }
    
    ~Particle() {
        if (active) {
            std::cout << "Particle destroyed while active!" << std::endl;
        }
    }
    
    void init(float px, float py, float vx, float vy, float life) {
        this->x = px;
        this->y = py;
        this->vx = vx;
        this->vy = vy;
        this->lifetime = life;
        this->active = true;
    }
    
    void update(float dt) {
        if (!active) return;
        
        x += vx * dt;
        y += vy * dt;
        lifetime -= dt;
        
        if (lifetime <= 0) {
            active = false;
        }
    }
    
    void reset() {
        active = false;
        lifetime = 0;
    }
    
    bool isActive() const { return active; }
    
    void draw() const {
        if (active) {
            std::cout << "  Drawing particle at (" << x << ", " << y << ")" << std::endl;
        }
    }
};

// Another game object type
class Bullet {
private:
    float x, y;
    int damage;
    bool active;
    
public:
    Bullet() : x(0), y(0), damage(0), active(false) {
        std::cout << "Bullet created" << std::endl;
    }
    
    void fire(float px, float py, int dmg) {
        x = px;
        y = py;
        damage = dmg;
        active = true;
    }
    
    void update(float dt) {
        if (!active) return;
        y += 500 * dt;  // Move up
        if (y > 600) active = false;
    }
    
    void reset() {
        active = false;
    }
    
    bool isActive() const { return active; }
};

int main() {
    std::cout << "=== PARTICLE SYSTEM WITH OBJECT POOL ===" << std::endl;
    
    ObjectPool<Particle> particlePool(50);
    
    std::vector<std::unique_ptr<Particle, std::function<void(Particle*)>>> activeParticles;
    
    // Simulate 100 frames
    for (int frame = 0; frame < 100; frame++) {
        // Spawn 1-3 new particles per frame
        int spawnCount = rand() % 3 + 1;
        for (int i = 0; i < spawnCount; i++) {
            try {
                auto particle = particlePool.acquire();
                float px = rand() % 800;
                float py = rand() % 600;
                float vx = (rand() % 200) - 100;
                float vy = (rand() % 200) - 100;
                float life = 1.0f + (rand() % 50) / 10.0f;
                
                particle->init(px, py, vx, vy, life);
                activeParticles.push_back(std::move(particle));
            }
            catch (const std::runtime_error& e) {
                std::cout << "Pool exhausted at frame " << frame << std::endl;
                break;
            }
        }
        
        // Update all particles
        for (auto& particle : activeParticles) {
            particle->update(0.016f);  // 60 FPS
        }
        
        // Remove inactive particles (they return to pool automatically via custom deleter)
        activeParticles.erase(
            std::remove_if(activeParticles.begin(), activeParticles.end(),
                [](const auto& p) { return !p->isActive(); }),
            activeParticles.end());
        
        // Print stats every 20 frames
        if (frame % 20 == 0) {
            std::cout << "Frame " << frame << ": "
                      << activeParticles.size() << " active, "
                      << particlePool.available() << " in pool, "
                      << particlePool.created() << " total created" << std::endl;
        }
    }
    
    std::cout << "\n=== BULLET SYSTEM ===" << std::endl;
    
    ObjectPool<Bullet> bulletPool(20);
    std::vector<std::unique_ptr<Bullet, std::function<void(Bullet*)>>> activeBullets;
    
    // Simulate shooting
    for (int i = 0; i < 30; i++) {
        auto bullet = bulletPool.acquire();
        bullet->fire(400, 550, 10);
        activeBullets.push_back(std::move(bullet));
        
        std::cout << "Shot " << i+1 << "! Total bullets: " << activeBullets.size() 
                  << ", Pool available: " << bulletPool.available() << std::endl;
    }
    
    // Bullets will be automatically returned to pool when they go out of scope
    // or when the custom deleter is called
    
    return 0;
}
```

---

## Common Mistakes

### 1. Defining Templates in .cpp Files

```cpp
// ❌ template.cpp — won't link
template <typename T>
T add(T a, T b) { return a + b; }

// ✅ Define in header (.h or .hpp) or use explicit instantiation
// In header:
template <typename T>
T add(T a, T b) { return a + b; }
```

### 2. Forgetting `typename` for Dependent Types

```cpp
template <typename T>
void process(const T& container) {
    // ❌ Compiler doesn't know Iterator is a type
    T::Iterator it = container.begin();
    
    // ✅ Tell compiler it's a type
    typename T::Iterator it = container.begin();
}
```

### 3. Mixing Template Parameters

```cpp
// ❌ Wrong: can't use different types implicitly
template <typename T>
T add(T a, T b) { return a + b; }

int i = 5;
float f = 3.14;
auto result = add(i, f);  // Error! Ambiguous T

// ✅ Either specify type explicitly
auto result = add<float>(i, f);  // T = float

// Or use auto return with two parameters
template <typename T1, typename T2>
auto add(T1 a, T2 b) { return a + b; }
```

### 4. Overcomplicating with Templates When Not Needed

```cpp
// ❌ Unnecessary template
template <typename T>
T addOne(T x) {
    return x + 1;
}

// ✅ Simpler for this case
int addOne(int x) { return x + 1; }
```

---

## Quick Reference Card

```cpp
// Function template
template <typename T>
T functionName(T param) { return param; }

// Multiple types
template <typename T1, typename T2>
auto functionName(T1 a, T2 b) { return a + b; }

// Class template
template <typename T>
class ClassName {
    T member;
    T method(T param) { return param; }
};

// Non-type template parameter
template <typename T, int Size>
class FixedArray { };

// Template specialization
template <>
class ClassName<SpecificType> { };

// Variadic template
template <typename... Args>
void function(Args... args) { }

// Template template parameter (advanced)
template <template <typename> class Container>
class Wrapper { };

// Alias template (C++11)
template <typename T>
using Vector = std::vector<T>;

// Template deduction guides (C++17)
template <typename T>
Box(T) -> Box<T>;  // Allows Box(42) to deduce Box<int>
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a template function `swap` that exchanges two values of any type.

**Exercise 2 (Medium):** Create a generic `Stack` class template with `push`, `pop`, `top`, `isEmpty` methods.

**Exercise 3 (Medium):** Implement `findMax` that works with any container that provides `begin()` and `end()`. Test with `vector<int>`, `list<float>`, `array<string, 5>`.

**Exercise 4 (Hard):** Create a `Matrix<T, Rows, Cols>` class template for compile-time sized matrices. Implement addition, multiplication, and a `print` method.

**Exercise 5 (Hard):** Build a generic `EventDispatcher` that allows registering callbacks for different event types using variadic templates.

**Exercise 6 (Challenge):** Implement a simplified `std::tuple` using variadic templates. Support `get<I>(tuple)` to access elements by index.

---

## Summary

You now know:

✅ Function templates for generic algorithms  
✅ Class templates for generic containers  
✅ Template specialization for type-specific logic  
✅ Variadic templates for variable arguments  
✅ Non-type parameters for compile-time values  
✅ Complete object pool system  
✅ When to use (and not use) templates  

## What's Next?

Next lesson: **Standard Template Library (STL)** — master `vector`, `map`, `set`, `algorithm`, and more!

---

## Resources

- [C++ Templates (cppreference)](https://en.cppreference.com/w/cpp/language/templates)
- [Template specialization](https://en.cppreference.com/w/cpp/language/template_specialization)
- [Variadic templates](https://en.cppreference.com/w/cpp/language/parameter_pack)

---

**Practice Task:** Create a generic `GameObjectManager<T>` that manages any type of game object. Support adding, removing, finding by ID, and updating all objects. Use templates to avoid duplicate code for different object types (Player, Enemy, Item, Projectile).