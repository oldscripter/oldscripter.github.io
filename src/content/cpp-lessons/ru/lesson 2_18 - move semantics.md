---
title: "Move Semantics — Efficient Transfers and Perfect Forwarding"
description: "Stop copying unnecessary data — master move constructors, move assignment, and perfect forwarding"
pubDate: 2026-05-18
tags: ["C++", "advanced", "move-semantics", "rvalue-references", "perfect-forwarding"]
lang: "ru"
lessonNumber: 18
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Lesson 18: Move Semantics — Efficient Transfers and Perfect Forwarding

Welcome back! You've been copying data throughout this course. But copying is expensive. **Move semantics** lets us transfer resources instead of copying them — making code dramatically faster.

## What You'll Learn

- Lvalues vs rvalues (what are they?)
- Rvalue references (`&&`)
- Move constructors and move assignment operators
- `std::move` — converting lvalues to rvalues
- Copy elision and RVO (Return Value Optimization)
- Rule of Five (instead of Rule of Three)
- Perfect forwarding with `std::forward`

---

## Part 1: The Problem — Unnecessary Copies

```cpp
#include <iostream>
#include <vector>
#include <string>

// Without move semantics — expensive copies everywhere
class OldString {
    char* data;
    size_t size;
    
public:
    // Copy constructor (expensive)
    OldString(const OldString& other) {
        size = other.size;
        data = new char[size];
        for (size_t i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "Copied " << size << " bytes" << std::endl;
    }
    
    // Destructor
    ~OldString() {
        delete[] data;
    }
};

int main() {
    std::vector<OldString> strings;
    
    // Each push_back COPIES the entire string — slow!
    for (int i = 0; i < 1000; i++) {
        OldString temp;
        strings.push_back(temp);  // Copy! Copy! Copy!
    }
    
    return 0;
}
```

**The Solution:** Move semantics transfers ownership instead of copying.

---

## Part 2: Lvalues vs Rvalues

Understanding move semantics starts with understanding value categories.

```cpp
#include <iostream>

int main() {
    int x = 42;      // 'x' is an lvalue (has a name, takes memory)
    int y = x + 5;   // 'x + 5' is an rvalue (temporary, no name)
    
    // lvalues: things that can appear on the LEFT of assignment
    x = 10;          // x is lvalue
    // 10 = x;       // Error! 10 is rvalue
    
    // rvalues: things that can appear on the RIGHT of assignment
    int z = 20;      // 20 is rvalue
    int w = x + y;   // x + y is rvalue
    
    // You can take address of lvalues
    int* ptr = &x;   // OK
    
    // Cannot take address of rvalues
    // int* ptr2 = &42;  // Error!
    
    return 0;
}
```

### Key Distinctions

| Category | Examples | Has Name? | Can Take Address? |
|----------|----------|-----------|-------------------|
| **lvalue** | variables, `*ptr`, array elements | Yes | Yes |
| **rvalue** | literals (42), temporaries (`x+y`), function returns | No | No |

```cpp
std::string getName() {
    return "Kaelen";  // Return value is rvalue
}

int main() {
    std::string s1 = "Hello";     // s1 is lvalue, "Hello" is rvalue
    std::string s2 = s1;          // s1 is lvalue → COPY
    std::string s3 = getName();    // getName() returns rvalue → MOVE (C++11)
    
    return 0;
}
```

---

## Part 3: Rvalue References (`&&`)

Rvalue references let us bind to temporary objects.

```cpp
#include <iostream>

void process(int& x) {
    std::cout << "Lvalue reference: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "Rvalue reference: " << x << std::endl;
}

int main() {
    int a = 42;
    
    process(a);     // Calls lvalue version (a is lvalue)
    process(100);   // Calls rvalue version (100 is rvalue)
    process(a + 5); // Calls rvalue version (a+5 is rvalue)
    
    // You can create rvalue references
    int&& rref = 100;      // OK: binding rvalue reference to rvalue
    // int&& rref2 = a;    // Error: cannot bind rvalue ref to lvalue
    
    // std::move converts lvalue to rvalue reference
    int&& rref3 = std::move(a);  // OK: now a can be moved from
    
    return 0;
}
```

---

## Part 4: Move Constructor and Move Assignment

The heart of move semantics — stealing resources instead of copying.

```cpp
#include <iostream>
#include <cstring>

class DynamicArray {
private:
    int* data;
    size_t size;
    
public:
    // Constructor
    DynamicArray(size_t n) : size(n), data(new int[n]) {
        std::cout << "Constructed array of size " << size << std::endl;
    }
    
    // Destructor
    ~DynamicArray() {
        delete[] data;
        std::cout << "Destroyed array" << std::endl;
    }
    
    // Copy constructor (expensive)
    DynamicArray(const DynamicArray& other) 
        : size(other.size), data(new int[other.size]) {
        std::cout << "COPYING " << size << " elements" << std::endl;
        for (size_t i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
    }
    
    // Move constructor (cheap!) — steals resources
    DynamicArray(DynamicArray&& other) noexcept
        : size(other.size), data(other.data) {
        std::cout << "MOVING " << size << " elements (just swapping pointers)" << std::endl;
        other.data = nullptr;
        other.size = 0;
    }
    
    // Copy assignment
    DynamicArray& operator=(const DynamicArray& other) {
        if (this != &other) {
            std::cout << "COPY ASSIGNMENT" << std::endl;
            delete[] data;
            size = other.size;
            data = new int[size];
            for (size_t i = 0; i < size; i++) {
                data[i] = other.data[i];
            }
        }
        return *this;
    }
    
    // Move assignment
    DynamicArray& operator=(DynamicArray&& other) noexcept {
        if (this != &other) {
            std::cout << "MOVE ASSIGNMENT" << std::endl;
            delete[] data;           // Clean up our old data
            data = other.data;       // Steal pointer
            size = other.size;       // Steal size
            other.data = nullptr;    // Leave other in valid state
            other.size = 0;
        }
        return *this;
    }
};

int main() {
    std::cout << "=== Creating arrays ===" << std::endl;
    DynamicArray arr1(100);
    DynamicArray arr2(50);
    
    std::cout << "\n=== Copy (expensive) ===" << std::endl;
    DynamicArray arr3 = arr1;  // Copy constructor
    
    std::cout << "\n=== Move (cheap) ===" << std::endl;
    DynamicArray arr4 = std::move(arr1);  // Move constructor
    
    std::cout << "\n=== arr1 is now empty ===" << std::endl;
    // arr1 is in a valid but unspecified state (nullptr)
    
    std::cout << "\n=== Move assignment ===" << std::endl;
    arr2 = std::move(arr4);  // Move assignment
    
    return 0;
}
```

---

## Part 5: `std::move` — Just a Cast

`std::move` doesn't actually move anything — it's just a cast to rvalue reference.

```cpp
#include <iostream>
#include <utility>  // for std::move

class Widget {
    std::string name;
    
public:
    Widget(const std::string& n) : name(n) {}
    
    // Move constructor
    Widget(Widget&& other) noexcept {
        name = std::move(other.name);  // Actually calls string's move
        std::cout << "Widget moved: " << name << std::endl;
    }
    
    std::string getName() const { return name; }
};

int main() {
    Widget w1("Original");
    
    // std::move casts w1 to rvalue reference
    Widget w2 = std::move(w1);  // Move constructor called
    
    std::cout << "w2: " << w2.getName() << std::endl;
    // w1 is now in valid but unspecified state
    
    // DON'T use moved-from objects except to reassign
    w1 = Widget("New Value");  // OK: reassign
    
    return 0;
}
```

### Warning: Don't Use Moved-From Objects!

```cpp
std::vector<int> v1 = {1, 2, 3, 4, 5};
std::vector<int> v2 = std::move(v1);

// v1 is now in "valid but unspecified" state
std::cout << v1.size() << std::endl;  // Probably 0, but not guaranteed
// Using v1 for anything except destruction or reassignment is dangerous!

v1 = {10, 20, 30};  // OK: reassign before using
```

---

## Part 6: Rule of Five

Modern C++ follows the **Rule of Five** — if you define any of these, define all five:

```cpp
class Resource {
    // 1. Destructor
    ~Resource();
    
    // 2. Copy constructor
    Resource(const Resource&);
    
    // 3. Copy assignment
    Resource& operator=(const Resource&);
    
    // 4. Move constructor
    Resource(Resource&&) noexcept;
    
    // 5. Move assignment
    Resource& operator=(Resource&&) noexcept;
};
```

**Rule of Zero** (preferred): Don't define any — use smart pointers!

```cpp
// ✅ Best: Rule of Zero — let compiler generate everything
class ModernResource {
    std::unique_ptr<int[]> data;
    std::string name;
    std::vector<int> values;
    // Destructor, copy/move automatically correct!
};
```

---

## Part 7: Copy Elision and RVO

The compiler often eliminates copies entirely — even without move semantics.

```cpp
#include <iostream>

class BigObject {
public:
    BigObject() { std::cout << "Constructed" << std::endl; }
    BigObject(const BigObject&) { std::cout << "Copied" << std::endl; }
    BigObject(BigObject&&) { std::cout << "Moved" << std::endl; }
    ~BigObject() { std::cout << "Destroyed" << std::endl; }
};

// RVO (Return Value Optimization) — guaranteed since C++17
BigObject createObject() {
    BigObject obj;
    return obj;  // No copy, no move — constructed directly in caller
}

int main() {
    std::cout << "=== Creating object ===" << std::endl;
    BigObject obj = createObject();  // No copy/move output!
    
    // Without RVO, you'd see: Constructed, Moved, Destroyed, etc.
    
    return 0;
}
```

**Named RVO (NRVO)** — works most of the time, but not guaranteed.

```cpp
BigObject createObject(bool condition) {
    BigObject obj1;
    BigObject obj2;
    
    if (condition) {
        return obj1;  // NRVO may apply
    } else {
        return obj2;  // NRVO may apply
    }
}
```

---

## Part 8: Perfect Forwarding with `std::forward`

`std::forward` preserves value category — useful in template functions.

```cpp
#include <iostream>
#include <utility>

void process(int& x) {
    std::cout << "Lvalue: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "Rvalue: " << x << std::endl;
}

// Wrapper function that forwards perfectly
template<typename T>
void wrapper(T&& arg) {  // Universal reference (T&& with deduced T)
    process(std::forward<T>(arg));  // Forwards as original type
}

int main() {
    int a = 42;
    
    wrapper(a);    // Forwards as lvalue → calls process(int&)
    wrapper(100);  // Forwards as rvalue → calls process(int&&)
    wrapper(std::move(a));  // Forwards as rvalue
    
    // Without perfect forwarding, rvalues become lvalues inside function
    return 0;
}
```

### Real Example: Factory Function

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Player {
    std::string name;
    int health;
    int level;
    
public:
    // Constructor with multiple parameters
    Player(const std::string& n, int h, int l) 
        : name(n), health(h), level(l) {
        std::cout << "Player created: " << name << std::endl;
    }
    
    void display() const {
        std::cout << name << " (Lv." << level << ", HP: " << health << ")" << std::endl;
    }
};

// Factory function with perfect forwarding
template<typename T, typename... Args>
std::unique_ptr<T> create(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

int main() {
    // Arguments are forwarded perfectly to Player constructor
    auto player1 = create<Player>("Kaelen", 100, 5);
    auto player2 = create<Player>("Aria", 80, 7);
    
    player1->display();
    player2->display();
    
    // Without perfect forwarding, string literals would cause extra copies
    
    return 0;
}
```

---

## Complete Example: Optimized Game Object System

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <utility>

class GameObject {
private:
    std::string name;
    std::vector<float> transformData;  // Large data that we want to move
    int health;
    
public:
    // Constructor
    GameObject(const std::string& n, int h) 
        : name(n), health(h) {
        // Simulate heavy initialization
        transformData.resize(1000, 0.0f);
        std::cout << "Constructed: " << name << std::endl;
    }
    
    // Copy constructor (expensive — we don't want this)
    GameObject(const GameObject& other) 
        : name(other.name), 
          transformData(other.transformData),  // Copies 1000 floats!
          health(other.health) {
        std::cout << "COPYING " << name << " (expensive!)" << std::endl;
    }
    
    // Move constructor (cheap)
    GameObject(GameObject&& other) noexcept
        : name(std::move(other.name)),
          transformData(std::move(other.transformData)),  // Just steals pointer!
          health(other.health) {
        std::cout << "MOVING " << name << std::endl;
        other.health = 0;
    }
    
    // Copy assignment
    GameObject& operator=(const GameObject& other) {
        if (this != &other) {
            name = other.name;
            transformData = other.transformData;  // Expensive copy
            health = other.health;
            std::cout << "COPY ASSIGN: " << name << std::endl;
        }
        return *this;
    }
    
    // Move assignment
    GameObject& operator=(GameObject&& other) noexcept {
        if (this != &other) {
            name = std::move(other.name);
            transformData = std::move(other.transformData);  // Cheap move
            health = other.health;
            other.health = 0;
            std::cout << "MOVE ASSIGN: " << name << std::endl;
        }
        return *this;
    }
    
    void display() const {
        std::cout << "Object: " << name << " (HP: " << health << ")" << std::endl;
    }
};

// Factory that returns by value (uses move if no RVO)
GameObject createEnemy(const std::string& type) {
    GameObject enemy(type + "_Goblin", 50);
    return enemy;  // NRVO applies (no copy/move)
}

class ObjectManager {
    std::vector<GameObject> objects;
    
public:
    // Perfect forwarding emplace
    template<typename... Args>
    void addObject(Args&&... args) {
        objects.emplace_back(std::forward<Args>(args)...);  // Constructs in-place
    }
    
    // Move objects into manager
    void addObject(GameObject&& obj) {
        objects.push_back(std::move(obj));  // Move into vector
    }
    
    void displayAll() const {
        for (const auto& obj : objects) {
            obj.display();
        }
    }
};

int main() {
    std::cout << "=== MOVE SEMANTICS DEMO ===" << std::endl;
    
    ObjectManager manager;
    
    // Emplace constructs directly (no copies, no moves)
    std::cout << "\n--- Emplace (best) ---" << std::endl;
    manager.addObject("Kaelen", 100);
    manager.addObject("Aria", 80);
    
    // Create temporary and move
    std::cout << "\n--- Move from temporary ---" << std::endl;
    manager.addObject(createEnemy("Fire"));  // RVO then move
    
    // Explicit move
    std::cout << "\n--- Explicit move ---" << std::endl;
    GameObject boss("Dragon", 500);
    manager.addObject(std::move(boss));  // boss is now moved-from
    
    std::cout << "\n=== FINAL OBJECTS ===" << std::endl;
    manager.displayAll();
    
    std::cout << "\nboss is now in moved-from state (safe to destroy)" << std::endl;
    
    return 0;
}
```

---

## Performance Comparison: Copy vs Move

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <chrono>

class HeavyObject {
    std::string data;
    std::vector<int> numbers;
    
public:
    HeavyObject() {
        numbers.resize(10000, 42);
        data = std::string(1000, 'X');
    }
    
    // Default copy/move
};

int main() {
    const int COUNT = 100000;
    
    // Test copying
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<HeavyObject> copyVec;
    for (int i = 0; i < COUNT; i++) {
        HeavyObject obj;
        copyVec.push_back(obj);  // Copy!
    }
    auto copyTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    // Test moving
    start = std::chrono::high_resolution_clock::now();
    std::vector<HeavyObject> moveVec;
    for (int i = 0; i < COUNT; i++) {
        HeavyObject obj;
        moveVec.push_back(std::move(obj));  // Move! (or emplace_back)
    }
    auto moveTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "Copy: " << copyTime.count() << "ms" << std::endl;
    std::cout << "Move: " << moveTime.count() << "ms" << std::endl;
    std::cout << "Move is " << (float)copyTime.count() / moveTime.count() 
              << "x faster!" << std::endl;
    
    return 0;
}
```

---

## Common Mistakes

### 1. Using `std::move` When Not Needed

```cpp
// ❌ Unnecessary move (compiler already moves)
std::string getName() {
    std::string name = "Kaelen";
    return std::move(name);  // Prevents RVO!
}

// ✅ Let compiler optimize
std::string getName() {
    std::string name = "Kaelen";
    return name;  // RVO or move automatically
}
```

### 2. Using Moved-From Object

```cpp
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = std::move(v1);
// v1.size();  // ❌ Don't use moved-from object (except reassign)

v1 = {4, 5, 6};  // ✅ Reassign before using
```

### 3. Not Marking Move Operations `noexcept`

```cpp
// ❌ Without noexcept, vector may use copy instead of move
class BadMove {
    BadMove(BadMove&& other) { }  // Not noexcept
};

// ✅ Always mark move operations noexcept when possible
class GoodMove {
    GoodMove(GoodMove&& other) noexcept { }
};
```

### 4. Forgetting to Leave Valid State

```cpp
// ❌ Other object left in invalid state
MoveClass(MoveClass&& other) {
    data = other.data;
    // other.data still points to memory! (double delete risk)
}

// ✅ Set other to valid state
MoveClass(MoveClass&& other) noexcept {
    data = other.data;
    other.data = nullptr;  // Other now safe to destroy
}
```

---

## Quick Reference Card

```cpp
// Value categories
int x = 5;        // x is lvalue, 5 is rvalue
int&& rref = 10;  // rvalue reference

// Move operations
class MyClass {
    // Move constructor
    MyClass(MyClass&& other) noexcept;
    
    // Move assignment
    MyClass& operator=(MyClass&& other) noexcept;
};

// std::move (cast to rvalue)
MyClass a;
MyClass b = std::move(a);  // Move constructor
a = std::move(b);           // Move assignment

// std::forward (perfect forwarding)
template<typename T>
void wrapper(T&& arg) {
    func(std::forward<T>(arg));
}

// Rule of Five (if you define any, define all)
~MyClass();                           // Destructor
MyClass(const MyClass&);              // Copy constructor
MyClass& operator=(const MyClass&);   // Copy assignment
MyClass(MyClass&&) noexcept;          // Move constructor
MyClass& operator=(MyClass&&) noexcept; // Move assignment

// Rule of Zero (preferred)
class Modern {
    std::vector<int> data;   // All members RAII
    std::unique_ptr<Widget> ptr;
    // Compiler-generated destructor and moves work perfectly
};
```

---

## Practice Exercises

**Exercise 1 (Easy):** Identify which of these are lvalues and which are rvalues:
- `int x = 10;`
- `x + 20`
- `&x`
- `std::move(x)`
- `"Hello"`
- `std::string("World")`

**Exercise 2 (Medium):** Write a `Buffer` class that manages a dynamic char array. Implement move constructor and move assignment. Test with vector.

**Exercise 3 (Medium):** Create a `unique_ptr`-like class (simplified) that implements move semantics but forbids copy.

**Exercise 4 (Hard):** Implement a `Message` class that holds a large string. Add move operations and compare performance of copying vs moving in a queue system.

**Exercise 5 (Hard):** Create a generic `ScopeGuard` using perfect forwarding. It should call a function when destroyed.

**Exercise 6 (Challenge):** Build a `TaskSystem` where tasks are moved into a thread pool. Use perfect forwarding for task arguments. Show that copies are eliminated.

---

## Summary

You now know:

✅ Lvalues vs rvalues (fundamental distinction)  
✅ Rvalue references (`&&`)  
✅ Move constructors and move assignment  
✅ `std::move` (cast to rvalue reference)  
✅ Rule of Five vs Rule of Zero  
✅ Copy elision and RVO (guaranteed since C++17)  
✅ Perfect forwarding with `std::forward`  
✅ Performance benefits of move semantics  

## What's Next?

Next lesson: **Multithreading** — write concurrent code with `std::thread`, `std::async`, mutexes, and more!

---

## Resources

- [Move semantics (cppreference)](https://en.cppreference.com/w/cpp/language/move_constructor)
- [Rvalue references](https://en.cppreference.com/w/cpp/language/reference#Rvalue_references)
- [std::move](https://en.cppreference.com/w/cpp/utility/move)
- [std::forward](https://en.cppreference.com/w/cpp/utility/forward)
- [Rule of three/five/zero](https://en.cppreference.com/w/cpp/language/rule_of_three)

---

**Practice Task:** Take a class you've written earlier (like the Inventory or Player struct) and add proper move semantics. Profile the performance difference when used in vectors or as return values. Use `noexcept` correctly!