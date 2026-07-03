---
title: "Performance Optimization — Making Games Run Fast"
description: "Profile, optimize, and squeeze every drop of performance from your C++ games"
pubDate: 2026-05-22
tags: ["C++", "advanced", "optimization", "profiling", "performance"]
lang: "en"
lessonNumber: 305
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Lesson 22: Performance Optimization — Making Games Run Fast

Welcome back! You've built games, but do they run at 60 FPS on all hardware? **Performance optimization** is the art of making code faster without changing what it does.

## What You'll Learn

- Profiling — finding the real bottlenecks
- Cache efficiency and data layout
- Avoiding unnecessary allocations
- Move semantics and copy elision
- Compiler optimizations
- SIMD and multithreading
- Common optimization pitfalls

---

## Part 1: The 80/20 Rule (Pareto Principle)

**80% of runtime is spent in 20% of the code.** Never optimize blindly — profile first!

```cpp
// ❌ Premature optimization (wasting time on wrong code)
void render() {
    // Optimizing this (1% of runtime) instead of physics (60%)
}

// ✅ Profile first, then optimize the real bottleneck
// Use profilers: Very Sleepy, perf, Intel VTune, Visual Studio Profiler
```

### Simple Profiling with Chrono

```cpp
#include <iostream>
#include <chrono>
#include <vector>

class Profiler {
private:
    std::chrono::steady_clock::time_point start;
    std::string name;
    
public:
    Profiler(const std::string& n) : name(n) {
        start = std::chrono::steady_clock::now();
    }
    
    ~Profiler() {
        auto end = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        std::cout << name << ": " << duration.count() << " μs" << std::endl;
    }
};

void slowFunction() {
    Profiler p("slowFunction");
    std::vector<int> v;
    for (int i = 0; i < 1000000; i++) {
        v.push_back(i);
    }
}

void fastFunction() {
    Profiler p("fastFunction");
    std::vector<int> v;
    v.reserve(1000000);  // Pre-allocate!
    for (int i = 0; i < 1000000; i++) {
        v.push_back(i);
    }
}

int main() {
    slowFunction();
    fastFunction();
    return 0;
}
```

---

## Part 2: Cache Efficiency

CPU caches are FAST but small. Data layout matters enormously.

### Cache-Friendly vs Cache-Unfriendly

```cpp
#include <iostream>
#include <chrono>

const int ROWS = 10000;
const int COLS = 10000;
int matrix[ROWS][COLS];

// ✅ Cache-friendly — accessing memory sequentially
void rowMajor() {
    Profiler p("Row-major (cache-friendly)");
    long long sum = 0;
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            sum += matrix[i][j];  // Sequential memory access
        }
    }
}

// ❌ Cache-unfriendly — jumping through memory
void columnMajor() {
    Profiler p("Column-major (cache-unfriendly)");
    long long sum = 0;
    for (int j = 0; j < COLS; j++) {
        for (int i = 0; i < ROWS; i++) {
            sum += matrix[i][j];  // Jumping across rows
        }
    }
}

// Result: Row-major can be 10-100x faster!
```

### Structure of Arrays (SoA) vs Array of Structures (AoS)

```cpp
// ❌ Array of Structures (AoS) — bad cache usage
struct ParticleAoS {
    float x, y, z;
    float vx, vy, vz;
    float life;
    bool active;
};
std::vector<ParticleAoS> particlesAoS;  // x,y,z,vx,vy,vz,life,active interleaved

// ✅ Structure of Arrays (SoA) — great cache usage
struct ParticleSoA {
    std::vector<float> x, y, z;
    std::vector<float> vx, vy, vz;
    std::vector<float> life;
    std::vector<bool> active;
};
// When updating positions, only x,y,z vectors loaded into cache

// Example: Updating only positions (common in games)
void updatePositionsAoS(std::vector<ParticleAoS>& particles, float dt) {
    // Loads entire particle even though only x,y,z needed
    for (auto& p : particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
    }
}

void updatePositionsSoA(ParticleSoA& particles, float dt) {
    // Only loads x,y,z vectors — much more cache efficient!
    for (size_t i = 0; i < particles.x.size(); i++) {
        particles.x[i] += particles.vx[i] * dt;
        particles.y[i] += particles.vy[i] * dt;
        particles.z[i] += particles.vz[i] * dt;
    }
}
```

### Data Locality Example

```cpp
#include <vector>

struct Enemy {
    float x, y;
    int health;
    int type;
    bool active;
    std::string name;  // ❌ String is on heap, destroys locality!
};

// ✅ Better: Separate hot/cold data
struct EnemyHotData {
    float x, y;
    int health;
    int type;
    bool active;
};

struct EnemyColdData {
    std::string name;
    std::string dialogue;
    std::vector<int> waypoints;
};

std::vector<EnemyHotData> hotEnemies;   // Accessed every frame
std::vector<EnemyColdData> coldEnemies; // Accessed rarely
```

---

## Part 3: Avoiding Unnecessary Allocations

Heap allocations are SLOW (100-1000x slower than stack).

```cpp
#include <vector>
#include <string>

// ❌ Bad: Allocation every frame
void updateBad() {
    std::vector<int> temp;  // Allocates each call
    for (int i = 0; i < 1000; i++) {
        temp.push_back(i);
    }
}

// ✅ Good: Reuse memory
class GameLoop {
    std::vector<int> temp;  // Allocated once
    
public:
    void update() {
        temp.clear();  // Reuses memory, no allocation
        for (int i = 0; i < 1000; i++) {
            temp.push_back(i);
        }
    }
};

// ❌ Bad: Returning large vector
std::vector<int> getDataBad() {
    std::vector<int> data;
    // ... fill data
    return data;  // Copies (but RVO helps)
}

// ✅ Good: Pass by reference
void getDataGood(std::vector<int>& outData) {
    outData.clear();
    // ... fill outData
}

// ❌ Bad: Creating temporary strings
std::string getNameBad(int id) {
    return "Player_" + std::to_string(id);  // Multiple allocations
}

// ✅ Good: Reuse buffer
void getNameGood(int id, std::string& outName) {
    outName = "Player_";
    outName += std::to_string(id);
}
```

### String Optimization

```cpp
// ❌ Expensive
std::string message = "Score: " + std::to_string(score) + " Level: " + std::to_string(level);

// ✅ Better
char buffer[256];
snprintf(buffer, sizeof(buffer), "Score: %d Level: %d", score, level);
std::string message(buffer);

// ✅ Best (if you don't need std::string)
std::array<char, 256> buffer;
snprintf(buffer.data(), buffer.size(), "Score: %d Level: %d", score, level);
```

---

## Part 4: Move Semantics for Performance

```cpp
#include <vector>
#include <string>

class GameObject {
    std::string name;
    std::vector<int> data;
    
public:
    // Expensive copy
    void setNameCopy(const std::string& n) {
        name = n;  // Copies if n is lvalue
    }
    
    // Cheap move (when passing temporary)
    void setNameMove(std::string n) {
        name = std::move(n);  // Takes ownership
    }
    
    // Accept both (best)
    void setName(const std::string& n) {
        name = n;  // Copy from lvalue
    }
    
    void setName(std::string&& n) {
        name = std::move(n);  // Move from rvalue
    }
};

// Usage
GameObject obj;
std::string longName = "VeryLongNameThatWouldBeExpensiveToCopy";
obj.setName(longName);                    // Copy (lvalue)
obj.setName("TemporaryName");             // Move (rvalue)

// In containers: use emplace_back instead of push_back
std::vector<GameObject> objects;
objects.emplace_back("Kaelen");  // Constructs in-place, no copy/move
// objects.push_back(GameObject("Kaelen"));  // Creates temporary, then moves (worse)
```

---

## Part 5: Compiler Optimizations

### Enable Optimizations

```bash
# Debug (no optimizations) — for debugging
g++ -O0 main.cpp

# Release (optimizations) — for shipping
g++ -O2 main.cpp      # Good balance
g++ -O3 main.cpp      # More aggressive
g++ -Ofast main.cpp   # Most aggressive (may break standards)

# MSVC
cl /O2 main.cpp

# Clang
clang++ -O3 main.cpp
```

### Help the Compiler: `const`, `constexpr`, `restrict`

```cpp
// const tells compiler value won't change
int square(const int x) {  // Compiler can optimize better
    return x * x;
}

// constexpr — evaluated at compile time!
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

int arr[factorial(5)];  // Compile-time, no runtime cost!

// restrict (C99, compiler extensions) — pointers don't alias
void addVectors(float* restrict a, float* restrict b, float* restrict c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];  // Compiler can vectorize aggressively
    }
}
```

### Likely/Unlikely Macros (C++20)

```cpp
#define LIKELY(x)   __builtin_expect(!!(x), 1)
#define UNLIKELY(x) __builtin_expect(!!(x), 0)

// Tell compiler which branch is more common
if (LIKELY(player.isAlive())) {
    // Normal gameplay (predicted)
} else if (UNLIKELY(player.isDead())) {
    // Rare death case (not predicted)
}
```

---

## Part 6: SIMD — Single Instruction, Multiple Data

Process multiple data points with one instruction.

```cpp
#include <xmmintrin.h>  // SSE
#include <immintrin.h>  // AVX

// Scalar version
void addScalar(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}

// SIMD version (SSE — 4 floats at once)
void addSIMD(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i += 4) {
        __m128 va = _mm_loadu_ps(&a[i]);
        __m128 vb = _mm_loadu_ps(&b[i]);
        __m128 vc = _mm_add_ps(va, vb);
        _mm_storeu_ps(&c[i], vc);
    }
}

// Better: Let compiler auto-vectorize with flags
// g++ -O3 -march=native -ftree-vectorize
```

### Compiler Auto-Vectorization

```cpp
// Write simple loops — compiler will vectorize
void addArrays(float* a, float* b, float* c, int n) {
    #pragma GCC ivdep  // Tell compiler it's safe to vectorize
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}
```

---

## Part 7: Multithreading for Performance

```cpp
#include <thread>
#include <vector>
#include <numeric>

// Parallel array sum
int parallelSum(const std::vector<int>& data) {
    unsigned int numThreads = std::thread::hardware_concurrency();
    std::vector<std::thread> threads;
    std::vector<int> partialSums(numThreads, 0);
    
    size_t chunkSize = data.size() / numThreads;
    
    for (unsigned int t = 0; t < numThreads; t++) {
        size_t start = t * chunkSize;
        size_t end = (t == numThreads - 1) ? data.size() : (t + 1) * chunkSize;
        
        threads.emplace_back([&data, &partialSums, t, start, end]() {
            int sum = 0;
            for (size_t i = start; i < end; i++) {
                sum += data[i];
            }
            partialSums[t] = sum;
        });
    }
    
    for (auto& thread : threads) {
        thread.join();
    }
    
    return std::accumulate(partialSums.begin(), partialSums.end(), 0);
}
```

### Thread Pool Pattern

```cpp
#include <queue>
#include <thread>
#include <functional>
#include <condition_variable>

class ThreadPool {
private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex queueMutex;
    std::condition_variable condition;
    bool stop;
    
public:
    ThreadPool(size_t threads) : stop(false) {
        for (size_t i = 0; i < threads; i++) {
            workers.emplace_back([this] {
                while (true) {
                    std::function<void()> task;
                    {
                        std::unique_lock<std::mutex> lock(queueMutex);
                        condition.wait(lock, [this] { return stop || !tasks.empty(); });
                        if (stop && tasks.empty()) return;
                        task = std::move(tasks.front());
                        tasks.pop();
                    }
                    task();
                }
            });
        }
    }
    
    template<typename F>
    void enqueue(F&& f) {
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            tasks.emplace(std::forward<F>(f));
        }
        condition.notify_one();
    }
    
    ~ThreadPool() {
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            stop = true;
        }
        condition.notify_all();
        for (auto& worker : workers) {
            worker.join();
        }
    }
};
```

---

## Part 8: Common Optimization Mistakes

### 1. Optimizing Before Profiling

```cpp
// ❌ Wasting time on the wrong thing
void renderUI() { /* Optimizing this (2% of runtime) */ }
void updatePhysics() { /* Actually 70% of runtime, ignored */ }
```

### 2. Using `std::endl` Instead of `\n`

```cpp
// ❌ Slow: flushes buffer every time
for (int i = 0; i < 1000000; i++) {
    std::cout << i << std::endl;
}

// ✅ Fast: no flush
for (int i = 0; i < 1000000; i++) {
    std::cout << i << '\n';
}
```

### 3. Passing by Value When Const Reference Works

```cpp
// ❌ Copies string every call
void logMessage(std::string msg) { }

// ✅ No copy
void logMessage(const std::string& msg) { }
```

### 4. Using Virtual Functions in Hot Loops

```cpp
// ❌ Virtual call overhead
for (auto& enemy : enemies) {
    enemy->update();  // Virtual call
}

// ✅ If enemies are same type, use static dispatch
for (auto& enemy : enemies) {
    enemy.update();  // Direct call
}
```

### 5. Dynamic Allocation in Hot Paths

```cpp
// ❌ Allocation every frame
void update() {
    std::vector<int> temp(1000);  // Allocates!
}

// ✅ Reuse
std::vector<int> temp;
void update() {
    temp.clear();
    temp.resize(1000);
}
```

---

## Quick Optimization Checklist

| Check | What to Look For |
|-------|------------------|
| **Profile first** | Find real bottlenecks (don't guess!) |
| **Cache efficiency** | Sequential access, SoA over AoS |
| **Avoid allocations** | Reuse vectors, reserve capacity |
| **Move semantics** | Use `std::move` for large objects |
| **Compiler optimizations** | `-O2` or `-O3` for release |
| **Inlining** | Small functions in headers, `inline` keyword |
| **Loop invariants** | Move calculations outside loops |
| **Multithreading** | Use thread pools for parallel work |
| **SIMD** | Let compiler auto-vectorize simple loops |
| **IO** | Batch writes, avoid `std::endl` |

---

## Performance Measurement Framework

```cpp
#include <chrono>
#include <iostream>
#include <vector>

class Benchmark {
private:
    std::string name;
    int iterations;
    
public:
    Benchmark(const std::string& n, int iter) : name(n), iterations(iter) {}
    
    template<typename Func>
    void run(Func&& func) {
        auto start = std::chrono::high_resolution_clock::now();
        
        for (int i = 0; i < iterations; i++) {
            func();
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
        
        std::cout << name << ": " << duration.count() << "ms ("
                  << iterations << " iterations, "
                  << duration.count() / iterations << "ms per op)" << std::endl;
    }
};

// Example usage
int main() {
    Benchmark b("Vector reserve", 1000);
    b.run([]() {
        std::vector<int> v;
        v.reserve(10000);
        for (int i = 0; i < 10000; i++) {
            v.push_back(i);
        }
    });
    
    Benchmark b2("Vector no reserve", 1000);
    b2.run([]() {
        std::vector<int> v;
        for (int i = 0; i < 10000; i++) {
            v.push_back(i);
        }
    });
    
    return 0;
}
```

---

## Practice Exercises

**Exercise 1 (Easy):** Profile two versions of a matrix multiplication function: naive vs cache-optimized. Measure performance difference.

**Exercise 2 (Medium):** Convert an AoS particle system to SoA. Measure cache miss reduction.

**Exercise 3 (Medium):** Implement a thread pool and parallelize a compute-intensive task (e.g., mandelbrot set).

**Exercise 4 (Hard):** Profile a game loop. Identify the top 3 bottlenecks. Optimize them.

**Exercise 5 (Hard):** Implement a custom memory pool for small objects. Compare allocation speed with `new`/`delete`.

**Exercise 6 (Challenge):** Use SIMD intrinsics to compute dot products of 1000 vectors. Compare performance with scalar version.

---

## Summary

You now know:

✅ Profile before optimizing (80/20 rule)  
✅ Cache efficiency and data layout  
✅ Avoiding unnecessary allocations  
✅ Move semantics for performance  
✅ Compiler optimizations and flags  
✅ SIMD and auto-vectorization  
✅ Multithreading and thread pools  
✅ Common optimization mistakes  

## What's Next?

Next lesson: **Cross-Platform Development** — write once, run on Windows, Linux, macOS, consoles!

---

## Resources

- [Agner Fog's optimization manuals](https://www.agner.org/optimize/)
- [Intel Intrinsics Guide](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/)
- [C++ Performance Benchmarks](https://quick-bench.com/)