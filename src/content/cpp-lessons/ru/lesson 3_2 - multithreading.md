---
title: "Многопоточность — конкурентное программирование в C++"
description: "Пишите более быстрые игры с несколькими потоками — асинхронная загрузка, параллельная обработка и потокобезопасные данные"
pubDate: 2026-05-19
tags: ["C++", "advanced", "multithreading", "concurrency", "thread-safety"]
lang: "ru"
lessonNumber: 302
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Урок 19: Многопоточность — конкурентное программирование в C++

Добро пожаловать обратно! Современные игры используют несколько ядер — загрузка ресурсов в фоне, обработка ИИ параллельно, обновление физики в отдельных потоках. **Многопоточность** делает это возможным.

## Что вы изучите

- Основы потоков с `std::thread`
- Синхронизация с `std::mutex` и `std::lock_guard`
- Разделение данных и состояния гонки
- `std::async` и `std::future` для асинхронных задач
- Потокобезопасные очереди и паттерны производитель-потребитель
- `std::atomic` для безблокировочных операций
- Распространённые паттерны многопоточности в играх

---

## Часть 1: Необходимость многопоточности

```cpp
// ❌ Однопоточный — всё блокируется
int main() {
    loadAssets();        // Занимает 2 секунды — игра зависает!
    updateGame();        // Не может начаться, пока загружаются ресурсы
    render();            // Блокируется во время загрузки
    
    // Игрок испытывает задержки
    return 0;
}

// ✅ Многопоточный — загрузка в фоне
int main() {
    std::future<void> loadTask = std::async(std::launch::async, loadAssets);
    
    // Игра продолжается, пока загружаются ресурсы
    while (loadTask.wait_for(std::chrono::milliseconds(0)) != std::future_status::ready) {
        updateGame();  // Игра всё ещё отзывчива!
        render();
    }
    
    return 0;
}
```

---

## Часть 2: Базовые потоки с `std::thread`

```cpp
#include <iostream>
#include <thread>
#include <chrono>

void simpleTask() {
    for (int i = 0; i < 5; i++) {
        std::cout << "Задача выполняется... " << i << std::endl;
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
    // Базовый поток
    std::thread t1(simpleTask);
    
    // Поток с аргументами
    std::thread t2(taskWithArgs, "WorkerA", 3);
    std::thread t3(taskWithArgs, "WorkerB", 3);
    
    // Ожидание завершения потоков (ВСЕГДА join или detach)
    t1.join();
    t2.join();
    t3.join();
    
    std::cout << "Все потоки завершены!" << std::endl;
    
    return 0;
}
```

### Жизненный цикл потока

```cpp
void backgroundTask() {
    // Симуляция работы
    std::this_thread::sleep_for(std::chrono::seconds(2));
}

int main() {
    std::thread worker(backgroundTask);
    
    // Проверка, можно ли присоединиться
    if (worker.joinable()) {
        worker.join();  // Ожидание завершения
        // или worker.detach();  // Запуск независимо (осторожно!)
    }
    
    // После join/detach поток больше не присоединяем
    std::cout << "Присоединяем: " << worker.joinable() << std::endl;
    
    return 0;
}
```

---

## Часть 3: Состояния гонки и мьютексы

Без синхронизации несколько потоков повреждают общие данные.

```cpp
#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

// ❌ НЕБЕЗОПАСНО — состояние гонки!
int sharedCounter = 0;

void unsafeIncrement() {
    for (int i = 0; i < 100000; i++) {
        sharedCounter++;  // Не атомарно!
    }
}

// ✅ БЕЗОПАСНО — с мьютексом
int safeCounter = 0;
std::mutex counterMutex;

void safeIncrement() {
    for (int i = 0; i < 100000; i++) {
        std::lock_guard<std::mutex> lock(counterMutex);
        safeCounter++;
    }
}

int main() {
    // Небезопасная версия — случайный результат
    {
        std::thread t1(unsafeIncrement);
        std::thread t2(unsafeIncrement);
        t1.join();
        t2.join();
        std::cout << "Небезопасный счётчик (ожидалось 200000): " << sharedCounter << std::endl;
    }
    
    // Безопасная версия — корректный результат
    {
        std::thread t1(safeIncrement);
        std::thread t2(safeIncrement);
        t1.join();
        t2.join();
        std::cout << "Безопасный счётчик: " << safeCounter << std::endl;
    }
    
    return 0;
}
```

### Типы мьютексов

```cpp
#include <mutex>
#include <shared_mutex>  // C++17

// Базовый мьютекс (исключительная блокировка)
std::mutex mtx;

// Рекурсивный мьютекс (один поток может блокировать несколько раз)
std::recursive_mutex recMtx;

// Разделяемый мьютекс (несколько читателей, один писатель)
std::shared_mutex sharedMtx;  // C++17

// Мьютекс с таймаутом (попытка блокировки с таймаутом)
std::timed_mutex timedMtx;

// Сценарии использования:
void recursiveFunction(int depth) {
    std::lock_guard<std::recursive_mutex> lock(recMtx);
    if (depth > 0) recursiveFunction(depth - 1);
}

class ThreadSafeCache {
    mutable std::shared_mutex mtx;
    std::map<std::string, int> cache;
    
public:
    int get(const std::string& key) const {
        std::shared_lock lock(mtx);  // Множество читателей разрешено
        return cache.at(key);
    }
    
    void set(const std::string& key, int value) {
        std::unique_lock lock(mtx);  // Исключительная запись
        cache[key] = value;
    }
};
```

---

## Часть 4: Лучшие практики блокировок

### `std::lock_guard` — простая RAII-блокировка

```cpp
std::mutex mtx;

void safeFunction() {
    std::lock_guard<std::mutex> lock(mtx);  // Блокировка получена
    // Критическая секция
    // Автоматически освобождается при выходе lock из области видимости
}
```

### `std::unique_lock` — более гибкий

```cpp
std::mutex mtx;

void flexibleFunction() {
    std::unique_lock<std::mutex> lock(mtx);
    
    // Можно разблокировать раньше
    lock.unlock();
    
    // Можно повторно заблокировать
    lock.lock();
    
    // Попытка блокировки без ожидания
    if (lock.try_lock()) {
        // Блокировка получена
    }
    
    // Отложенная блокировка
    std::unique_lock<std::mutex> deferred(mtx, std::defer_lock);
    // ... сделать что-то без блокировки
    deferred.lock();  // Теперь блокировка
}
```

### Избегание взаимоблокировок

```cpp
// ❌ ВЗАИМОБЛОКИРОВКА! Потоки блокируют в противоположном порядке
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

// ✅ Решение: Блокировка обоих одновременно
void thread1() {
    std::scoped_lock lock(mutexA, mutexB);  // C++17 — безопасная блокировка обоих
}

void thread2() {
    std::scoped_lock lock(mutexB, mutexA);  // Тот же порядок, нет взаимоблокировки
}
```

---

## Часть 5: `std::async` и `std::future`

Асинхронные задачи высокого уровня с автоматическим управлением потоками.

```cpp
#include <iostream>
#include <future>
#include <chrono>

// Функция, требующая времени
int longComputation(int x) {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    return x * x;
}

int main() {
    // Запуск асинхронной задачи
    std::future<int> result = std::async(std::launch::async, longComputation, 42);
    
    // Выполнение другой работы, пока идёт вычисление
    std::cout << "Выполнение другой работы..." << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    
    // Получение результата (блокируется, если не готов)
    int value = result.get();
    std::cout << "Результат: " << value << std::endl;
    
    // Проверка готовности задачи
    std::future<int> result2 = std::async(std::launch::async, longComputation, 10);
    
    if (result2.wait_for(std::chrono::milliseconds(0)) == std::future_status::ready) {
        std::cout << "Уже готово!" << std::endl;
    } else {
        std::cout << "Всё ещё вычисляется..." << std::endl;
        result2.wait();  // Ожидание завершения
    }
    
    return 0;
}
```

### Политики запуска Async

```cpp
// std::launch::async — запуск в отдельном потоке (гарантировано)
auto task1 = std::async(std::launch::async, function);

// std::launch::deferred — запуск при вызове .get() или .wait()
auto task2 = std::async(std::launch::deferred, function);
task2.get();  // Теперь выполняется в вызывающем потоке

// Автоматический (решает реализация) — по умолчанию
auto task3 = std::async(function);  // Может быть async или deferred
```

---

## Часть 6: Потокобезопасная очередь (Производитель-Потребитель)

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
        cv.notify_one();  // Уведомление одного ожидающего потока
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

// Пример: загрузка ресурсов в фоне
struct LoadRequest {
    std::string path;
    int priority;
};

void producer(ThreadSafeQueue<LoadRequest>& queue) {
    for (int i = 0; i < 10; i++) {
        LoadRequest req{"texture_" + std::to_string(i) + ".png", i};
        queue.push(req);
        std::cout << "В очереди: " << req.path << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

void consumer(ThreadSafeQueue<LoadRequest>& queue, int id) {
    while (true) {
        LoadRequest req;
        queue.waitAndPop(req);
        std::cout << "Работник " << id << " загружает: " << req.path << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(200));  // Симуляция загрузки
        
        if (req.path == "texture_9.png") break;  // Последний элемент
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

## Часть 7: `std::atomic` для безблокировочного программирования

Атомарные операции работают на уровне аппаратного обеспечения и чрезвычайно быстры.

```cpp
#include <iostream>
#include <thread>
#include <atomic>
#include <vector>

// Атомарный счётчик — мьютекс не нужен!
std::atomic<int> atomicCounter(0);

void atomicIncrement() {
    for (int i = 0; i < 100000; i++) {
        atomicCounter++;  // Атомарная операция
        // Эквивалентно: atomicCounter.fetch_add(1);
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
    
    std::cout << "Атомарный счётчик: " << atomicCounter << std::endl;  // Ровно 1,000,000
    
    // Атомарные операции
    int expected = 100;
    std::atomic<int> value(100);
    
    // Сравнение и обмен
    value.compare_exchange_strong(expected, 200);
    // Если value == expected, установить 200 и вернуть true
    // Иначе установить expected = value и вернуть false
    
    // Загрузка и сохранение
    int x = value.load();      // Чтение
    value.store(42);            // Запись
    
    // Обмен
    int old = value.exchange(99);  // Установить 99, вернуть старое значение
    
    // Получение и операция
    int old2 = value.fetch_add(10);  // Добавить 10, вернуть старое значение
    
    return 0;
}
```

### Атомарные операции vs Мьютексы: производительность

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
    
    std::cout << "Атомарные (безблокировочные): " << atomicTime.count() << "мс" << std::endl;
    std::cout << "Мьютекс: " << mutexTime.count() << "мс" << std::endl;
    std::cout << "Атомарные в " << (float)mutexTime.count() / atomicTime.count() 
              << "x быстрее" << std::endl;
    
    return 0;
}
```

---

## Полный пример: Параллельная система частиц

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
                    
                    // Интегрирование Эйлера
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.z += p.vz * dt;
                    
                    // Простое трение
                    p.vx *= 0.99f;
                    p.vy *= 0.99f;
                    p.vz *= 0.99f;
                    
                    // Старение
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
        std::cout << "Активных частиц: " << activeCount << std::endl;
    }
};

int main() {
    std::cout << "=== ПАРАЛЛЕЛЬНАЯ СИСТЕМА ЧАСТИЦ ===" << std::endl;
    
    ParticleSystem particles(100000, 8);  // 100k частиц, 8 потоков
    
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int frame = 0; frame < 60; frame++) {
        particles.updateParallel(1.0f / 60.0f);
        
        // Иногда добавляем взрывы
        if (frame % 30 == 0) {
            particles.addExplosion(0, 0, 0, 500);
        }
        
        if (frame % 10 == 0) {
            particles.render();
        }
    }
    
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "60 кадров за " << duration.count() << "мс ("
              << duration.count() / 60.0f << "мс на кадр)" << std::endl;
    
    return 0;
}
```

---

## Частые ошибки

### 1. Забытое присоединение или отсоединение

```cpp
// ❌ Поток уничтожается во время выполнения
void dangerous() {
    std::thread t(backgroundTask);
    // t выходит из области видимости — вызывается std::terminate!
}

// ✅ Всегда присоединяйте или отсоединяйте
void safe() {
    std::thread t(backgroundTask);
    t.join();
}
```

### 2. Состояние гонки на разделяемой переменной

```cpp
// ❌ Состояние гонки
int shared = 0;
void increment() { shared++; }

// ✅ Используйте мьютекс или атомарную переменную
std::atomic<int> shared(0);
void increment() { shared++; }
```

### 3. Взаимоблокировка от вложенных блокировок

```cpp
// ❌ Потенциальная взаимоблокировка
std::mutex m1, m2;
void bad() {
    std::lock_guard<std::mutex> lock1(m1);
    std::lock_guard<std::mutex> lock2(m2);
}

// ✅ Используйте scoped_lock или блокируйте в одинаковом порядке
void good() {
    std::scoped_lock lock(m1, m2);  // C++17
}
```

### 4. Захват ссылок в Async

```cpp
// ❌ Опасно — ссылка на локальную переменную
int value = 42;
auto future = std::async([&]() { return value * 2; });
// value уничтожается до выполнения future!

// ✅ Захват по значению
auto future = std::async([=]() { return value * 2; });
```

---

## Шпаргалка

```cpp
#include <thread>
#include <mutex>
#include <future>
#include <atomic>

// Создание потока
std::thread t(function, args...);
t.join();      // Ожидание завершения
t.detach();    // Запуск независимо
if (t.joinable()) { }

// Мьютекс
std::mutex mtx;
{
    std::lock_guard<std::mutex> lock(mtx);   // RAII-блокировка
    std::unique_lock<std::mutex> ulock(mtx); // Гибкая блокировка
    std::scoped_lock lock(m1, m2, m3);       // Блокировка нескольких (C++17)
}

// Условная переменная
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

// Атомарные
std::atomic<int> counter(0);
counter++;                    // Атомарный инкремент
int old = counter.load();     // Чтение
counter.store(42);            // Запись
int prev = counter.exchange(10);
bool success = counter.compare_exchange_strong(expected, desired);
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Создайте программу, запускающую 10 потоков, каждый печатает "Поток X", где X — номер потока. Обеспечьте отсутствие перемешивания вывода с помощью мьютекса.

**Упражнение 2 (Среднее):** Реализуйте параллельную функцию `sum`, разбивающую массив между несколькими потоками и объединяющую результаты.

**Упражнение 3 (Среднее):** Создайте потокобезопасный класс `Logger`, записывающий сообщения в файл из нескольких потоков без повреждения данных.

**Упражнение 4 (Сложное):** Реализуйте класс `ThreadPool`, поддерживающий пул рабочих потоков и принимающий задачи через потокобезопасную очередь.

**Упражнение 5 (Сложное):** Создайте параллельную функцию `map`, применяющую преобразование к каждому элементу массива с использованием всех доступных ядер.

**Упражнение 6 (Вызов):** Создайте систему "Производитель-Потребитель" для аудиосистемы игры. Производители генерируют звуковые события, потребители обрабатывают их в отдельных потоках. Используйте ограниченную очередь для предотвращения переполнения памяти.

---

## Резюме

Теперь вы знаете:

✅ `std::thread` для базовой работы с потоками  
✅ `std::mutex`, `std::lock_guard`, `std::unique_lock` для синхронизации  
✅ Состояния гонки и как их предотвращать  
✅ `std::async` и `std::future` для асинхронных задач  
✅ Потокобезопасные очереди для паттерна производитель-потребитель  
✅ `std::atomic` для безблокировочного программирования  
✅ Пример параллельной системы частиц  
✅ Распространённые ошибки и лучшие практики  

## Что дальше?

Следующий урок: **Сети с сокетами** — создавайте многопользовательские игры с TCP/UDP!

---

## Ресурсы

- [Поддержка потоков (cppreference)](https://en.cppreference.com/w/cpp/thread)
- [std::thread](https://en.cppreference.com/w/cpp/thread/thread)
- [std::mutex](https://en.cppreference.com/w/cpp/thread/mutex)
- [std::async](https://en.cppreference.com/w/cpp/thread/async)
- [std::atomic](https://en.cppreference.com/w/cpp/atomic/atomic)

---

**Практическое задание:** Профилируйте игровой цикл с многопоточностью и без неё. Реализуйте параллельное обновление ИИ врагов. Используйте пул потоков для распределения работы по ядрам. Измерьте улучшение времени кадра!