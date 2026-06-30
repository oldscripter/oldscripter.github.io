---
title: "Multithreading — Concurrent Programming in C++"
description: "Write faster games with multiple threads — async loading, parallel processing, and thread-safe data"
pubDate: 2026-05-19
tags: ["C++", "advanced", "multithreading", "concurrency", "thread-safety"]
lang: "en"
lessonNumber: 19
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Lesson 19: Multithreading — Concurrent Programming in C++

Welcome back! Modern games use multiple cores — loading assets in background, processing AI in parallel, updating physics on separate threads. **Multithreading** makes this possible.

## What You'll Learn

- Thread basics with `std::thread`
- Synchronization with `std::mutex` and `std::lock_guard`
- Data sharing and race conditions
- `std::async` and `std::future` for asynchronous tasks
- Thread-safe queues and producer-consumer patterns
- `std::atomic` for lock-free operations
- Common game multithreading patterns

---

## Part 1: The Need for Multithreading

```cpp
// ❌ Single-threaded — everything blocks
int main() {
    loadAssets();        // Takes 2 seconds — game freezes!
    updateGame();        // Can't start until assets load
    render();            // Blocks while loading
    
    // Player experiences lag
    return 0;
}

// ✅ Multithreaded — loading in background
int main() {
    std::future<void> loadTask = std::async(std::launch::async, loadAssets);
    
    // Game continues while assets load
    while (loadTask.wait_for(std::chrono::milliseconds(0)) != std::future_status::ready) {
        updateGame();  // Game still responsive!
        render();
    }
    
    return 0;
}
```

---

## Part 2: Basic Threads with `std::thread`

```cpp
#include <iostream>
#include <thread>
#include <chrono>

void simpleTask() {
    for (int i = 0; i < 5; i++) {
        std::cout << "Task running... " << i << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

void taskWithArgs(std::string name, int count) {
    for (int i = 0; i < count; i++) {
        std::cout << name << ": " << i << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
}

int main() {
    // Basic thread
    std::thread t1(simpleTask);
    
    // Thread with arguments
    std::thread t2(taskWithArgs, "WorkerA", 3);
    std::thread t3(taskWithArgs, "WorkerB", 3);
    
    // Wait for threads to finish (ALWAYS join or detach)
    t1.join();
    t2.join();
    t3.join();
    
    std::cout << "All threads finished!" << std::endl;
    
    return 0;
}
```

### Thread Lifecycle

```cpp
void backgroundTask() {
    // Simulate work
    std::this_thread::sleep_for(std::chrono::seconds(2));
}

int main() {
    std::thread worker(backgroundTask);
    
    // Check if joinable
    if (worker.joinable()) {
        worker.join();  // Wait for completion
        // or worker.detach();  // Run independently (careful!)
    }
    
    // After join/detach, thread is no longer joinable
    std::cout << "Joinable: " << worker.joinable() << std::endl;
    
    return 0;
}
```

---

## Part 3: Race Conditions and Mutexes

Without synchronization, multiple threads corrupt shared data.

```cpp
#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

// ❌ UNSAFE — race condition!
int sharedCounter = 0;

void unsafeIncrement() {
    for (int i = 0; i < 100000; i++) {
        sharedCounter++;  // Not atomic!
    }
}

// ✅ SAFE — with mutex
int safeCounter = 0;
std::mutex counterMutex;

void safeIncrement() {
    for (int i = 0; i < 100000; i++) {
        std::lock_guard<std::mutex> lock(counterMutex);
        safeCounter++;
    }
}

int main() {
    // Unsafe version — random result
    {
        std::thread t1(unsafeIncrement);
        std::thread t2(unsafeIncrement);
        t1.join();
        t2.join();
        std::cout << "Unsafe counter (expected 200000): " << sharedCounter << std::endl;
    }
    
    // Safe version — correct result
    {
        std::thread t1(safeIncrement);
        std::thread t2(safeIncrement);
        t1.join();
        t2.join();
        std::cout << "Safe counter: " << safeCounter << std::endl;
    }
    
    return 0;
}
```

### Mutex Types

```cpp
#include <mutex>
#include <shared_mutex>  // C++17

// Basic mutex (exclusive lock)
std::mutex mtx;

// Recursive mutex (same thread can lock multiple times)
std::recursive_mutex recMtx;

// Shared mutex (multiple readers, single writer)
std::shared_mutex sharedMtx;  // C++17

// Timed mutex (try to lock with timeout)
std::timed_mutex timedMtx;

// Use cases:
void recursiveFunction(int depth) {
    std::lock_guard<std::recursive_mutex> lock(recMtx);
    if (depth > 0) recursiveFunction(depth - 1);
}

class ThreadSafeCache {
    mutable std::shared_mutex mtx;
    std::map<std::string, int> cache;
    
public:
    int get(const std::string& key) const {
        std::shared_lock lock(mtx);  // Multiple readers allowed
        return cache.at(key);
    }
    
    void set(const std::string& key, int value) {
        std::unique_lock lock(mtx);  // Exclusive write
        cache[key] = value;
    }
};
```

---

## Part 4: Locking Best Practices

### `std::lock_guard` — Simple RAII Lock

```cpp
std::mutex mtx;

void safeFunction() {
    std::lock_guard<std::mutex> lock(mtx);  // Lock acquired
    // Critical section
    // Automatically released when lock goes out of scope
}
```

### `std::unique_lock` — More Flexible

```cpp
std::mutex mtx;

void flexibleFunction() {
    std::unique_lock<std::mutex> lock(mtx);
    
    // Can unlock early
    lock.unlock();
    
    // Can relock
    lock.lock();
    
    // Try to lock without blocking
    if (lock.try_lock()) {
        // Lock acquired
    }
    
    // Deferred lock
    std::unique_lock<std::mutex> deferred(mtx, std::defer_lock);
    // ... do something without lock
    deferred.lock();  // Now lock
}
```

### Avoiding Deadlocks

```cpp
// ❌ DEADLOCK! Threads lock in opposite order
std::mutex mutexA, mutexB;

void thread1() {
    std::lock_guard<std::mutex> lock1(mutexA);
    std::lock_guard<std::mutex> lock2(mutexB);
    // ...
}

void thread2() {
    std::lock_guard<std::mutex> lock1(mutexB);
    std::lock_guard<std::mutex> lock2(mutexA);
    // ...
}

// ✅ Solution: Lock both at once
void thread1() {
    std::scoped_lock lock(mutexA, mutexB);  // C++17 — locks both safely
}

void thread2() {
    std::scoped_lock lock(mutexB, mutexA);  // Same order, no deadlock
}
```

---

## Part 5: `std::async` and `std::future`

Higher-level async tasks with automatic thread management.

```cpp
#include <iostream>
#include <future>
#include <chrono>

// Function that takes time
int longComputation(int x) {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    return x * x;
}

int main() {
    // Launch async task
    std::future<int> result = std::async(std::launch::async, longComputation, 42);
    
    // Do other work while computation runs
    std::cout << "Doing other work..." << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    
    // Get result (blocks if not ready)
    int value = result.get();
    std::cout << "Result: " << value << std::endl;
    
    // Check if task is ready
    std::future<int> result2 = std::async(std::launch::async, longComputation, 10);
    
    if (result2.wait_for(std::chrono::milliseconds(0)) == std::future_status::ready) {
        std::cout << "Already ready!" << std::endl;
    } else {
        std::cout << "Still computing..." << std::endl;
        result2.wait();  // Wait for completion
    }
    
    return 0;
}
```

### Async Launch Policies

```cpp
// std::launch::async — run in separate thread (guaranteed)
auto task1 = std::async(std::launch::async, function);

// std::launch::deferred — run when .get() or .wait() is called
auto task2 = std::async(std::launch::deferred, function);
task2.get();  // Now runs in calling thread

// Auto (implementation decides) — default
auto task3 = std::async(function);  // May be async or deferred
```

---

## Part 6: Thread-Safe Queue (Producer-Consumer)

```cpp
#include <iostream>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>

template<typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue;
    mutable std::mutex mtx;
    std::condition_variable cv;
    
public:
    void push(T value) {
        std::lock_guard<std::mutex> lock(mtx);
        queue.push(std::move(value));
        cv.notify_one();  // Notify one waiting thread
    }
    
    bool tryPop(T& value) {
        std::lock_guard<std::mutex> lock(mtx);
        if (queue.empty()) {
            return false;
        }
        value = std::move(queue.front());
        queue.pop();
        return true;
    }
    
    void waitAndPop(T& value) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [this] { return !queue.empty(); });
        value = std::move(queue.front());
        queue.pop();
    }
    
    bool empty() const {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.empty();
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(mtx);
        return queue.size();
    }
};

// Example: Loading assets in background
struct LoadRequest {
    std::string path;
    int priority;
};

void producer(ThreadSafeQueue<LoadRequest>& queue) {
    for (int i = 0; i < 10; i++) {
        LoadRequest req{"texture_" + std::to_string(i) + ".png", i};
        queue.push(req);
        std::cout << "Queued: " << req.path << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

void consumer(ThreadSafeQueue<LoadRequest>& queue, int id) {
    while (true) {
        LoadRequest req;
        queue.waitAndPop(req);
        std::cout << "Worker " << id << " loading: " << req.path << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(200));  // Simulate load
        
        if (req.path == "texture_9.png") break;  // Last item
    }
}

int main() {
    ThreadSafeQueue<LoadRequest> queue;
    
    std::thread prod(producer, std::ref(queue));
    std::thread cons1(consumer, std::ref(queue), 1);
    std::thread cons2(consumer, std::ref(queue), 2);
    
    prod.join();
    cons1.join();
    cons2.join();
    
    return 0;
}
```

---

## Part 7: `std::atomic` for Lock-Free Programming

Atomic operations are hardware-level and extremely fast.

```cpp
#include <iostream>
#include <thread>
#include <atomic>
#include <vector>

// Atomic counter — no mutex needed!
std::atomic<int> atomicCounter(0);

void atomicIncrement() {
    for (int i = 0; i < 100000; i++) {
        atomicCounter++;  // Atomic operation
        // Equivalent: atomicCounter.fetch_add(1);
    }
}

int main() {
    std::vector<std::thread> threads;
    
    for (int i = 0; i < 10; i++) {
        threads.emplace_back(atomicIncrement);
    }
    
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Atomic counter: " << atomicCounter << std::endl;  // 1,000,000 exactly
    
    // Atomic operations
    int expected = 100;
    std::atomic<int> value(100);
    
    // Compare and swap
    value.compare_exchange_strong(expected, 200);
    // If value == expected, set to 200 and return true
    // Else set expected = value and return false
    
    // Load and store
    int x = value.load();      // Read
    value.store(42);            // Write
    
    // Exchange
    int old = value.exchange(99);  // Set to 99, return old value
    
    // Fetch and operate
    int old2 = value.fetch_add(10);  // Add 10, return old value
    
    return 0;
}
```

### Atomic vs Mutex Performance

```cpp
#include <iostream>
#include <thread>
#include <atomic>
#include <mutex>
#include <chrono>

std::atomic<int> atomicCounter(0);
int mutexCounter = 0;
std::mutex mtx;

void atomicWork() {
    for (int i = 0; i < 1000000; i++) {
        atomicCounter++;
    }
}

void mutexWork() {
    for (int i = 0; i < 1000000; i++) {
        std::lock_guard<std::mutex> lock(mtx);
        mutexCounter++;
    }
}

int main() {
    auto start = std::chrono::high_resolution_clock::now();
    std::thread t1(atomicWork), t2(atomicWork), t3(atomicWork), t4(atomicWork);
    t1.join(); t2.join(); t3.join(); t4.join();
    auto atomicTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    start = std::chrono::high_resolution_clock::now();
    std::thread t5(mutexWork), t6(mutexWork), t7(mutexWork), t8(mutexWork);
    t5.join(); t6.join(); t7.join(); t8.join();
    auto mutexTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "Atomic (lock-free): " << atomicTime.count() << "ms" << std::endl;
    std::cout << "Mutex: " << mutexTime.count() << "ms" << std::endl;
    std::cout << "Atomic is " << (float)mutexTime.count() / atomicTime.count() 
              << "x faster" << std::endl;
    
    return 0;
}
```

---

## Complete Example: Parallel Particle System

```cpp
#include <iostream>
#include <vector>
#include <thread>
#include <atomic>
#include <chrono>
#include <random>

struct Particle {
    float x, y, z;
    float vx, vy, vz;
    float life;
    bool active;
};

class ParticleSystem {
private:
    std::vector<Particle> particles;
    std::atomic<int> activeCount{0};
    int numThreads;
    
public:
    ParticleSystem(int count, int threads = 4) : numThreads(threads) {
        particles.resize(count);
        
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_real_distribution<float> posDis(-10, 10);
        std::uniform_real_distribution<float> velDis(-5, 5);
        std::uniform_real_distribution<float> lifeDis(0.5f, 3.0f);
        
        for (auto& p : particles) {
            p.x = posDis(gen);
            p.y = posDis(gen);
            p.z = posDis(gen);
            p.vx = velDis(gen);
            p.vy = velDis(gen);
            p.vz = velDis(gen);
            p.life = lifeDis(gen);
            p.active = true;
            activeCount++;
        }
    }
    
    void updateParallel(float dt) {
        int particlesPerThread = particles.size() / numThreads;
        std::vector<std::thread> threads;
        
        for (int t = 0; t < numThreads; t++) {
            int start = t * particlesPerThread;
            int end = (t == numThreads - 1) ? particles.size() : (t + 1) * particlesPerThread;
            
            threads.emplace_back([this, start, end, dt]() {
                int localActive = 0;
                for (int i = start; i < end; i++) {
                    auto& p = particles[i];
                    if (!p.active) continue;
                    
                    // Euler integration
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.z += p.vz * dt;
                    
                    // Simple friction
                    p.vx *= 0.99f;
                    p.vy *= 0.99f;
                    p.vz *= 0.99f;
                    
                    // Age
                    p.life -= dt;
                    
                    if (p.life <= 0.0f) {
                        p.active = false;
                    } else {
                        localActive++;
                    }
                }
                activeCount.fetch_add(localActive - (end - start));
            });
        }
        
        for (auto& t : threads) {
            t.join();
        }
    }
    
    void addExplosion(float cx, float cy, float cz, int count) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_real_distribution<float> velDis(-10, 10);
        std::uniform_real_distribution<float> lifeDis(0.5f, 2.0f);
        
        int added = 0;
        for (auto& p : particles) {
            if (!p.active && added < count) {
                p.x = cx;
                p.y = cy;
                p.z = cz;
                p.vx = velDis(gen);
                p.vy = velDis(gen);
                p.vz = velDis(gen);
                p.life = lifeDis(gen);
                p.active = true;
                added++;
                activeCount++;
            }
            if (added >= count) break;
        }
    }
    
    int getActiveCount() const { return activeCount; }
    
    void render() const {
        std::cout << "Active particles: " << activeCount << std::endl;
    }
};

int main() {
    std::cout << "=== PARALLEL PARTICLE SYSTEM ===" << std::endl;
    
    ParticleSystem particles(100000, 8);  // 100k particles, 8 threads
    
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int frame = 0; frame < 60; frame++) {
        particles.updateParallel(1.0f / 60.0f);
        
        // Add explosions occasionally
        if (frame % 30 == 0) {
            particles.addExplosion(0, 0, 0, 500);
        }
        
        if (frame % 10 == 0) {
            particles.render();
        }
    }
    
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "60 frames in " << duration.count() << "ms ("
              << duration.count() / 60.0f << "ms per frame)" << std::endl;
    
    return 0;
}
```

---

## Common Mistakes

### 1. Forgetting to Join or Detach

```cpp
// ❌ Thread destroyed while still running
void dangerous() {
    std::thread t(backgroundTask);
    // t goes out of scope — std::terminate called!
}

// ✅ Always join or detach
void safe() {
    std::thread t(backgroundTask);
    t.join();
}
```

### 2. Data Race on Shared Variable

```cpp
// ❌ Race condition
int shared = 0;
void increment() { shared++; }

// ✅ Use mutex or atomic
std::atomic<int> shared(0);
void increment() { shared++; }
```

### 3. Deadlock from Nested Locks

```cpp
// ❌ Potential deadlock
std::mutex m1, m2;
void bad() {
    std::lock_guard<std::mutex> lock1(m1);
    std::lock_guard<std::mutex> lock2(m2);
}

// ✅ Use scoped_lock or lock in same order
void good() {
    std::scoped_lock lock(m1, m2);  // C++17
}
```

### 4. Capturing References in Async

```cpp
// ❌ Dangerous — reference to local variable
int value = 42;
auto future = std::async([&]() { return value * 2; });
// value destroyed before future runs!

// ✅ Capture by value
auto future = std::async([=]() { return value * 2; });
```

---

## Quick Reference Card

```cpp
#include <thread>
#include <mutex>
#include <future>
#include <atomic>

// Thread creation
std::thread t(function, args...);
t.join();      // Wait for completion
t.detach();    // Run independently
if (t.joinable()) { }

// Mutex
std::mutex mtx;
{
    std::lock_guard<std::mutex> lock(mtx);   // RAII lock
    std::unique_lock<std::mutex> ulock(mtx); // Flexible lock
    std::scoped_lock lock(m1, m2, m3);       // Lock multiple (C++17)
}

// Condition variable
std::condition_variable cv;
cv.wait(lock, predicate);
cv.notify_one();
cv.notify_all();

// Async
auto future = std::async(std::launch::async, function, args...);
auto status = future.wait_for(std::chrono::seconds(1));
if (status == std::future_status::ready) {
    auto result = future.get();
}

// Atomic
std::atomic<int> counter(0);
counter++;                    // Atomic increment
int old = counter.load();     // Read
counter.store(42);            // Write
int prev = counter.exchange(10);
bool success = counter.compare_exchange_strong(expected, desired);
```

---

## Practice Exercises

**Exercise 1 (Easy):** Create a program that launches 10 threads, each printing "Thread X" where X is the thread number. Ensure output is not interleaved using a mutex.

**Exercise 2 (Medium):** Implement a parallel `sum` function that splits an array across multiple threads and combines results.

**Exercise 3 (Medium):** Create a thread-safe `Logger` class that writes messages to a file from multiple threads without data corruption.

**Exercise 4 (Hard):** Implement a `ThreadPool` class that maintains a pool of worker threads and accepts tasks via a thread-safe queue.

**Exercise 5 (Hard):** Build a parallel `map` function that applies a transformation to each element of an array using all available cores.

**Exercise 6 (Challenge):** Create a "Producer-Consumer" system for a game's audio system. Producers generate sound events, consumers process them on separate threads. Use a bounded queue to prevent memory overload.

---

## Summary

You now know:

✅ `std::thread` for basic threading  
✅ `std::mutex`, `std::lock_guard`, `std::unique_lock` for synchronization  
✅ Race conditions and how to prevent them  
✅ `std::async` and `std::future` for async tasks  
✅ Thread-safe queues for producer-consumer patterns  
✅ `std::atomic` for lock-free programming  
✅ Parallel particle system example  
✅ Common pitfalls and best practices  

## What's Next?

Next lesson: **Networking with Sockets** — build multiplayer games with TCP/UDP!

---

## Resources

- [Thread support (cppreference)](https://en.cppreference.com/w/cpp/thread)
- [std::thread](https://en.cppreference.com/w/cpp/thread/thread)
- [std::mutex](https://en.cppreference.com/w/cpp/thread/mutex)
- [std::async](https://en.cppreference.com/w/cpp/thread/async)
- [std::atomic](https://en.cppreference.com/w/cpp/atomic/atomic)

---

**Practice Task:** Profile a game loop with and without multithreading. Implement parallel enemy AI updates. Use a thread pool to distribute work across cores. Measure frame time improvements!