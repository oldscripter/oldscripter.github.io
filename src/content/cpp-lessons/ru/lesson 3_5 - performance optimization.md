---
title: "Оптимизация производительности — как заставить игры работать быстро"
description: "Профилируйте, оптимизируйте и выжимайте каждую каплю производительности из ваших игр на C++"
pubDate: 2026-05-22
tags: ["C++", "advanced", "optimization", "profiling", "performance"]
lang: "ru"
lessonNumber: 305
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Урок 22: Оптимизация производительности — как заставить игры работать быстро

Добро пожаловать обратно! Вы создали игры, но работают ли они на 60 FPS на любом железе? **Оптимизация производительности** — это искусство ускорять код без изменения его функциональности.

## Что вы изучите

- Профилирование — поиск реальных узких мест
- Эффективность кеша и расположение данных
- Избегание ненужных выделений памяти
- Семантика перемещения и исключение копирования
- Оптимизации компилятора
- SIMD и многопоточность
- Распространённые ошибки оптимизации

---

## Часть 1: Правило 80/20 (принцип Парето)

**80% времени выполнения тратится на 20% кода.** Никогда не оптимизируйте вслепую — сначала профилируйте!

```cpp
// ❌ Преждевременная оптимизация (трата времени на неправильный код)
void render() {
    // Оптимизация этого (1% времени выполнения) вместо физики (60%)
}

// ✅ Сначала профилируйте, затем оптимизируйте реальное узкое место
// Используйте профайлеры: Very Sleepy, perf, Intel VTune, Visual Studio Profiler
```

### Простое профилирование с Chrono

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
        std::cout << name << ": " << duration.count() << " мкс" << std::endl;
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
    v.reserve(1000000);  // Предварительное выделение!
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

## Часть 2: Эффективность кеша

Кеш процессора БЫСТРЫЙ, но маленький. Расположение данных имеет огромное значение.

### Кеш-дружественный vs Кеш-недружественный

```cpp
#include <iostream>
#include <chrono>

const int ROWS = 10000;
const int COLS = 10000;
int matrix[ROWS][COLS];

// ✅ Кеш-дружественный — последовательный доступ к памяти
void rowMajor() {
    Profiler p("По строкам (кеш-дружественный)");
    long long sum = 0;
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            sum += matrix[i][j];  // Последовательный доступ к памяти
        }
    }
}

// ❌ Кеш-недружественный — прыжки по памяти
void columnMajor() {
    Profiler p("По столбцам (кеш-недружественный)");
    long long sum = 0;
    for (int j = 0; j < COLS; j++) {
        for (int i = 0; i < ROWS; i++) {
            sum += matrix[i][j];  // Прыжки по строкам
        }
    }
}

// Результат: Доступ по строкам может быть в 10-100 раз быстрее!
```

### Структура массивов (SoA) vs Массив структур (AoS)

```cpp
// ❌ Массив структур (AoS) — плохое использование кеша
struct ParticleAoS {
    float x, y, z;
    float vx, vy, vz;
    float life;
    bool active;
};
std::vector<ParticleAoS> particlesAoS;  // x,y,z,vx,vy,vz,life,active перемешаны

// ✅ Структура массивов (SoA) — отличное использование кеша
struct ParticleSoA {
    std::vector<float> x, y, z;
    std::vector<float> vx, vy, vz;
    std::vector<float> life;
    std::vector<bool> active;
};
// При обновлении позиций в кеш загружаются только векторы x,y,z

// Пример: обновление только позиций (часто встречается в играх)
void updatePositionsAoS(std::vector<ParticleAoS>& particles, float dt) {
    // Загружается вся частица, хотя нужны только x,y,z
    for (auto& p : particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
    }
}

void updatePositionsSoA(ParticleSoA& particles, float dt) {
    // Загружаются только векторы x,y,z — гораздо эффективнее для кеша!
    for (size_t i = 0; i < particles.x.size(); i++) {
        particles.x[i] += particles.vx[i] * dt;
        particles.y[i] += particles.vy[i] * dt;
        particles.z[i] += particles.vz[i] * dt;
    }
}
```

### Пример локальности данных

```cpp
#include <vector>

struct Enemy {
    float x, y;
    int health;
    int type;
    bool active;
    std::string name;  // ❌ Строка в куче, разрушает локальность!
};

// ✅ Лучше: разделение горячих и холодных данных
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

std::vector<EnemyHotData> hotEnemies;   // Доступ каждый кадр
std::vector<EnemyColdData> coldEnemies; // Доступ редко
```

---

## Часть 3: Избегание ненужных выделений памяти

Выделения в куче МЕДЛЕННЫЕ (в 100-1000 раз медленнее стека).

```cpp
#include <vector>
#include <string>

// ❌ Плохо: Выделение каждый кадр
void updateBad() {
    std::vector<int> temp;  // Выделение при каждом вызове
    for (int i = 0; i < 1000; i++) {
        temp.push_back(i);
    }
}

// ✅ Хорошо: Переиспользование памяти
class GameLoop {
    std::vector<int> temp;  // Выделение один раз
    
public:
    void update() {
        temp.clear();  // Переиспользование памяти, без выделения
        for (int i = 0; i < 1000; i++) {
            temp.push_back(i);
        }
    }
};

// ❌ Плохо: Возврат большого вектора
std::vector<int> getDataBad() {
    std::vector<int> data;
    // ... заполнение data
    return data;  // Копирование (но RVO помогает)
}

// ✅ Хорошо: Передача по ссылке
void getDataGood(std::vector<int>& outData) {
    outData.clear();
    // ... заполнение outData
}

// ❌ Плохо: Создание временных строк
std::string getNameBad(int id) {
    return "Player_" + std::to_string(id);  // Множественные выделения
}

// ✅ Хорошо: Переиспользование буфера
void getNameGood(int id, std::string& outName) {
    outName = "Player_";
    outName += std::to_string(id);
}
```

### Оптимизация строк

```cpp
// ❌ Дорого
std::string message = "Счёт: " + std::to_string(score) + " Уровень: " + std::to_string(level);

// ✅ Лучше
char buffer[256];
snprintf(buffer, sizeof(buffer), "Счёт: %d Уровень: %d", score, level);
std::string message(buffer);

// ✅ Лучше всего (если не нужен std::string)
std::array<char, 256> buffer;
snprintf(buffer.data(), buffer.size(), "Счёт: %d Уровень: %d", score, level);
```

---

## Часть 4: Семантика перемещения для производительности

```cpp
#include <vector>
#include <string>

class GameObject {
    std::string name;
    std::vector<int> data;
    
public:
    // Дорогое копирование
    void setNameCopy(const std::string& n) {
        name = n;  // Копирование, если n — lvalue
    }
    
    // Дешёвое перемещение (при передаче временного объекта)
    void setNameMove(std::string n) {
        name = std::move(n);  // Принятие владения
    }
    
    // Принимает оба варианта (лучше всего)
    void setName(const std::string& n) {
        name = n;  // Копирование из lvalue
    }
    
    void setName(std::string&& n) {
        name = std::move(n);  // Перемещение из rvalue
    }
};

// Использование
GameObject obj;
std::string longName = "ОченьДлинноеИмяКотороеБылоsБыДорогоКопировать";
obj.setName(longName);                    // Копирование (lvalue)
obj.setName("ВременноеИмя");              // Перемещение (rvalue)

// В контейнерах: используйте emplace_back вместо push_back
std::vector<GameObject> objects;
objects.emplace_back("Каэлен");  // Конструирование на месте, без копирования/перемещения
// objects.push_back(GameObject("Каэлен"));  // Создание временного, затем перемещение (хуже)
```

---

## Часть 5: Оптимизации компилятора

### Включение оптимизаций

```bash
# Отладка (без оптимизаций) — для отладки
g++ -O0 main.cpp

# Релиз (с оптимизациями) — для поставки
g++ -O2 main.cpp      # Хороший баланс
g++ -O3 main.cpp      # Более агрессивно
g++ -Ofast main.cpp   # Наиболее агрессивно (может нарушать стандарты)

# MSVC
cl /O2 main.cpp

# Clang
clang++ -O3 main.cpp
```

### Помощь компилятору: `const`, `constexpr`, `restrict`

```cpp
// const сообщает компилятору, что значение не изменится
int square(const int x) {  // Компилятор может оптимизировать лучше
    return x * x;
}

// constexpr — вычисляется на этапе компиляции!
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

int arr[factorial(5)];  // На этапе компиляции, без затрат во время выполнения!

// restrict (C99, расширения компилятора) — указатели не перекрываются
void addVectors(float* restrict a, float* restrict b, float* restrict c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];  // Компилятор может агрессивно векторизовать
    }
}
```

### Макросы Likely/Unlikely (C++20)

```cpp
#define LIKELY(x)   __builtin_expect(!!(x), 1)
#define UNLIKELY(x) __builtin_expect(!!(x), 0)

// Указываем компилятору, какая ветка более вероятна
if (LIKELY(player.isAlive())) {
    // Обычный геймплей (предсказывается)
} else if (UNLIKELY(player.isDead())) {
    // Редкий случай смерти (не предсказывается)
}
```

---

## Часть 6: SIMD — одна инструкция, множество данных

Обработка нескольких точек данных одной инструкцией.

```cpp
#include <xmmintrin.h>  // SSE
#include <immintrin.h>  // AVX

// Скалярная версия
void addScalar(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}

// SIMD версия (SSE — 4 float'а за раз)
void addSIMD(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i += 4) {
        __m128 va = _mm_loadu_ps(&a[i]);
        __m128 vb = _mm_loadu_ps(&b[i]);
        __m128 vc = _mm_add_ps(va, vb);
        _mm_storeu_ps(&c[i], vc);
    }
}

// Лучше: позвольте компилятору авто-векторизовать с флагами
// g++ -O3 -march=native -ftree-vectorize
```

### Авто-векторизация компилятором

```cpp
// Пишите простые циклы — компилятор векторизует
void addArrays(float* a, float* b, float* c, int n) {
    #pragma GCC ivdep  // Указываем, что векторизация безопасна
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}
```

---

## Часть 7: Многопоточность для производительности

```cpp
#include <thread>
#include <vector>
#include <numeric>

// Параллельная сумма массива
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

### Паттерн пула потоков

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

## Часть 8: Частые ошибки оптимизации

### 1. Оптимизация до профилирования

```cpp
// ❌ Трата времени на неправильное место
void renderUI() { /* Оптимизация этого (2% времени выполнения) */ }
void updatePhysics() { /* На самом деле 70% времени выполнения, игнорируется */ }
```

### 2. Использование `std::endl` вместо `\n`

```cpp
// ❌ Медленно: сбрасывает буфер каждый раз
for (int i = 0; i < 1000000; i++) {
    std::cout << i << std::endl;
}

// ✅ Быстро: без сброса
for (int i = 0; i < 1000000; i++) {
    std::cout << i << '\n';
}
```

### 3. Передача по значению, когда подошла бы константная ссылка

```cpp
// ❌ Копирование строки при каждом вызове
void logMessage(std::string msg) { }

// ✅ Без копирования
void logMessage(const std::string& msg) { }
```

### 4. Использование виртуальных функций в горячих циклах

```cpp
// ❌ Накладные расходы на виртуальный вызов
for (auto& enemy : enemies) {
    enemy->update();  // Виртуальный вызов
}

// ✅ Если враги одного типа, используйте статическую диспетчеризацию
for (auto& enemy : enemies) {
    enemy.update();  // Прямой вызов
}
```

### 5. Динамическое выделение на горячих путях

```cpp
// ❌ Выделение каждый кадр
void update() {
    std::vector<int> temp(1000);  // Выделение!
}

// ✅ Переиспользование
std::vector<int> temp;
void update() {
    temp.clear();
    temp.resize(1000);
}
```

---

## Краткий контрольный список оптимизации

| Проверка | Что искать |
|-------|------------------|
| **Сначала профилируйте** | Найдите реальные узкие места (не гадайте!) |
| **Эффективность кеша** | Последовательный доступ, SoA вместо AoS |
| **Избегайте выделений** | Переиспользуйте векторы, резервируйте ёмкость |
| **Семантика перемещения** | Используйте `std::move` для больших объектов |
| **Оптимизации компилятора** | `-O2` или `-O3` для релиза |
| **Встраивание** | Маленькие функции в заголовках, ключевое слово `inline` |
| **Инварианты циклов** | Выносите вычисления за пределы циклов |
| **Многопоточность** | Используйте пулы потоков для параллельной работы |
| **SIMD** | Позвольте компилятору авто-векторизовать простые циклы |
| **Ввод/вывод** | Пакетная запись, избегайте `std::endl` |

---

## Фреймворк для измерения производительности

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
        
        std::cout << name << ": " << duration.count() << "мс ("
                  << iterations << " итераций, "
                  << duration.count() / iterations << "мс на операцию)" << std::endl;
    }
};

// Пример использования
int main() {
    Benchmark b("Вектор с reserve", 1000);
    b.run([]() {
        std::vector<int> v;
        v.reserve(10000);
        for (int i = 0; i < 10000; i++) {
            v.push_back(i);
        }
    });
    
    Benchmark b2("Вектор без reserve", 1000);
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

## Практические упражнения

**Упражнение 1 (Лёгкое):** Профилируйте две версии функции умножения матриц: наивную и кеш-оптимизированную. Измерьте разницу в производительности.

**Упражнение 2 (Среднее):** Преобразуйте систему частиц с AoS на SoA. Измерьте сокращение кеш-промахов.

**Упражнение 3 (Среднее):** Реализуйте пул потоков и распараллельте вычислительно сложную задачу (например, множество Мандельброта).

**Упражнение 4 (Сложное):** Профилируйте игровой цикл. Определите топ-3 узких места. Оптимизируйте их.

**Упражнение 5 (Сложное):** Реализуйте пользовательский пул памяти для маленьких объектов. Сравните скорость выделения с `new`/`delete`.

**Упражнение 6 (Вызов):** Используйте SIMD-интринсики для вычисления скалярных произведений 1000 векторов. Сравните производительность со скалярной версией.

---

## Резюме

Теперь вы знаете:

✅ Профилируйте перед оптимизацией (правило 80/20)  
✅ Эффективность кеша и расположение данных  
✅ Избегание ненужных выделений памяти  
✅ Семантика перемещения для производительности  
✅ Оптимизации компилятора и флаги  
✅ SIMD и авто-векторизация  
✅ Многопоточность и пулы потоков  
✅ Распространённые ошибки оптимизации  

## Что дальше?

Следующий урок: **Кросс-платформенная разработка** — пишите один раз, запускайте на Windows, Linux, macOS, консолях!

---

## Ресурсы

- [Руководства по оптимизации Агнера Фога](https://www.agner.org/optimize/)
- [Руководство по интринсикам Intel](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/)
- [Бенчмарки производительности C++](https://quick-bench.com/)