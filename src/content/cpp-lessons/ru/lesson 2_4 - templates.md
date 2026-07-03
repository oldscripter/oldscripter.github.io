---
title: "Шаблоны — обобщённое программирование"
description: "Пишите код один раз, используйте с любым типом — обобщённые контейнеры, алгоритмы и многое другое"
pubDate: 2026-05-14
tags: ["C++", "intermediate", "templates", "generic-programming", "metaprogramming"]
lang: "ru"
lessonNumber: 204
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 14: Шаблоны — обобщённое программирование

Добро пожаловать обратно! До сих пор мы писали функции и классы для конкретных типов — `int`, `float`, `string`. Но что, если вы хотите использовать ОДНУ И ТУ ЖЕ логику для разных типов? **Шаблоны** позволяют написать код один раз и использовать его с любым типом.

## Что вы изучите

- Шаблоны функций (обобщённые функции)
- Шаблоны классов (обобщённые контейнеры)
- Параметры шаблонов (типы и значения)
- Специализация шаблонов
- Вариативные шаблоны (C++11)
- Реальные примеры: обобщённые пулы, фабрики

---

## Часть 1: Проблема, которую решают шаблоны

Без шаблонов вам пришлось бы дублировать код для каждого типа:

```cpp
// ❌ Дублирование кода
int maxInt(int a, int b) {
    return (a > b) ? a : b;
}

float maxFloat(float a, float b) {
    return (a > b) ? a : b;
}

double maxDouble(double a, double b) {
    return (a > b) ? a : b;
}

// Сложно поддерживать и расширять!
```

**С шаблонами — одна функция работает для всех типов:**

```cpp
// ✅ Один шаблон работает для любого типа
template <typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}

// Использование
int x = max(10, 20);
float y = max(3.14f, 2.71f);
double z = max(3.14159, 2.71828);
std::string s = max(std::string("яблоко"), std::string("банан"));
```

---

## Часть 2: Шаблоны функций

### Базовый синтаксис

```cpp
#include <iostream>
#include <string>

// Шаблон с параметром typename
template <typename T>
T add(T a, T b) {
    return a + b;
}

// Несколько параметров шаблона
template <typename T1, typename T2>
auto multiply(T1 a, T2 b) -> decltype(a * b) {  // C++11 trailing return
    return a * b;
}

// C++14 и новее: проще
template <typename T1, typename T2>
auto multiply(T1 a, T2 b) {
    return a * b;
}

int main() {
    // Вывод типа (компилятор определяет T)
    int i1 = add(5, 3);           // T = int
    float f1 = add(5.5f, 2.3f);   // T = float
    std::string s1 = add(std::string("Привет "), std::string("Мир"));
    
    // Явное указание типа
    int i2 = add<int>(5, 3);
    
    // Смешанные типы (требуется auto return)
    auto result = multiply(5, 3.14);  // result — double (15.7)
    
    std::cout << "Int add: " << i1 << std::endl;
    std::cout << "String add: " << s1 << std::endl;
    std::cout << "Mixed multiply: " << result << std::endl;
    
    return 0;
}
```

### Шаблон для массивов

```cpp
#include <iostream>

// Шаблон с параметром размера (не-типовой параметр шаблона)
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
    
    std::cout << "Сумма int: " << arraySum(intArr) << std::endl;     // 15
    std::cout << "Сумма float: " << arraySum(floatArr) << std::endl; // 6.6
    
    return 0;
}
```

---

## Часть 3: Шаблоны классов

### Простой обобщённый контейнер

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
            throw std::runtime_error("Коробка пуста!");
        }
        hasContent = false;
        return content;
    }
    
    bool isEmpty() const {
        return !hasContent;
    }
};

int main() {
    // Коробка для целых чисел
    Box<int> intBox;
    intBox.put(42);
    std::cout << "Int из коробки: " << intBox.get() << std::endl;
    
    // Коробка для строк
    Box<std::string> stringBox;
    stringBox.put("Привет, Мир!");
    std::cout << "String из коробки: " << stringBox.get() << std::endl;
    
    // Коробка для пользовательского типа
    struct Player { std::string name; int health; };
    Box<Player> playerBox;
    playerBox.put({"Каэлен", 100});
    Player p = playerBox.get();
    std::cout << "Игрок: " << p.name << " (HP: " << p.health << ")" << std::endl;
    
    return 0;
}
```

### Обобщённая пара (аналог std::pair)

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
    Pair<int, std::string> p1(5, "яблоко");
    Pair<double, bool> p2(3.14, true);
    Pair<std::string, int> p3("уровень", 10);
    
    p1.display();  // (5, яблоко)
    p2.display();  // (3.14, 1)
    p3.display();  // (уровень, 10)
    
    return 0;
}
```

---

## Часть 4: Специализация шаблонов

Иногда обобщённая версия не работает для конкретных типов. Можно предоставить специальные реализации.

```cpp
#include <iostream>
#include <string>
#include <cstring>

// Обобщённая версия
template <typename T>
bool compare(const T& a, const T& b) {
    return a == b;
}

// Специализация для const char* (C-строки)
template <>
bool compare<const char*>(const char* const& a, const char* const& b) {
    return strcmp(a, b) == 0;
}

// Специализация для char* (неконстантные)
template <>
bool compare<char*>(char* const& a, char* const& b) {
    return strcmp(a, b) == 0;
}

// Специализация шаблона класса
template <typename T>
class Printer {
public:
    static void print(const T& value) {
        std::cout << "Обобщённый: " << value << std::endl;
    }
};

// Специализация для bool
template <>
class Printer<bool> {
public:
    static void print(bool value) {
        std::cout << "Логический: " << (value ? "true" : "false") << std::endl;
    }
};

int main() {
    // Специализация шаблона функции
    int a = 5, b = 5;
    std::cout << "Int compare: " << compare(a, b) << std::endl;  // true
    
    const char* str1 = "hello";
    const char* str2 = "hello";
    std::cout << "String compare: " << compare(str1, str2) << std::endl;  // true (использует специализацию)
    
    // Специализация шаблона класса
    Printer<int>::print(42);           // Обобщённый: 42
    Printer<double>::print(3.14);      // Обобщённый: 3.14
    Printer<bool>::print(true);        // Логический: true (специализированный)
    
    return 0;
}
```

---

## Часть 5: Вариативные шаблоны (C++11)

Шаблоны, которые принимают любое количество аргументов.

```cpp
#include <iostream>
#include <string>

// Базовый случай: нет аргументов
void print() {
    std::cout << std::endl;
}

// Рекурсивный вариативный шаблон
template <typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first;
    if (sizeof...(rest) > 0) {
        std::cout << ", ";
    }
    print(rest...);  // Рекурсивный вызов с оставшимися аргументами
}

// Сумма любого количества аргументов
template <typename T>
T sum(T value) {
    return value;
}

template <typename T, typename... Args>
T sum(T first, Args... rest) {
    return first + sum(rest...);
}

// Создание структуры, похожей на tuple
template <typename... Types>
class Tuple {
    // Реализация использовала бы рекурсию или std::tuple
};

int main() {
    print(1, 2, 3, "hello", 3.14, true);
    // Вывод: 1, 2, 3, hello, 3.14, 1
    
    int total = sum(1, 2, 3, 4, 5);
    std::cout << "Сумма: " << total << std::endl;  // 15
    
    double mixed = sum(1, 2.5, 3.7f);
    std::cout << "Смешанная сумма: " << mixed << std::endl;  // 7.2
    
    return 0;
}
```

---

## Часть 6: Не-типовые параметры шаблонов

Шаблоны могут принимать значения, а не только типы.

```cpp
#include <iostream>
#include <array>

// Шаблон массива фиксированного размера
template <typename T, int Size>
class FixedArray {
private:
    T data[Size];
    
public:
    T& operator[](int index) {
        if (index < 0 || index >= Size) {
            throw std::out_of_range("Индекс вне диапазона");
        }
        return data[index];
    }
    
    const T& operator[](int index) const {
        if (index < 0 || index >= Size) {
            throw std::out_of_range("Индекс вне диапазона");
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

// Факториал на этапе компиляции
template <int N>
struct Factorial {
    static constexpr int value = N * Factorial<N - 1>::value;
};

template <>
struct Factorial<0> {
    static constexpr int value = 1;
};

// Степень на этапе компиляции
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
    
    // Вычисления на этапе компиляции (нулевая стоимость во время выполнения!)
    std::cout << "5! = " << Factorial<5>::value << std::endl;      // 120
    std::cout << "2^10 = " << Power<2, 10>::value << std::endl;    // 1024
    
    return 0;
}
```

---

## Полный пример: Обобщённый пул объектов

```cpp
#include <iostream>
#include <vector>
#include <memory>
#include <stack>
#include <string>

// Обобщённый пул объектов для любого типа
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
        // Все объекты автоматически очищаются через unique_ptr
        std::cout << "Пул уничтожен. Создано " << createdCount 
                  << " объектов, " << pool.size() << " осталось в пуле." << std::endl;
    }
    
    // Получение объекта из пула
    std::unique_ptr<T, std::function<void(T*)>> acquire() {
        if (!pool.empty()) {
            auto ptr = std::move(pool.top());
            pool.pop();
            
            // Обёртка с пользовательским удалителем, возвращающим объект в пул
            std::unique_ptr<T, std::function<void(T*)>> returned(ptr.release(), 
                [this](T* obj) {
                    if (obj) {
                        // Сброс состояния объекта при необходимости
                        obj->reset();
                        this->release(obj);
                    }
                });
            return returned;
        }
        
        // Создание нового объекта
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
        
        throw std::runtime_error("Пул объектов исчерпан!");
    }
    
    // Возврат объекта в пул
    void release(T* obj) {
        pool.push(std::unique_ptr<T>(obj));
    }
    
    int available() const { return pool.size(); }
    int created() const { return createdCount; }
};

// Пример игрового объекта
class Particle {
private:
    float x, y, vx, vy;
    float lifetime;
    bool active;
    
public:
    Particle() : x(0), y(0), vx(0), vy(0), lifetime(0), active(false) {
        std::cout << "Частица создана" << std::endl;
    }
    
    ~Particle() {
        if (active) {
            std::cout << "Частица уничтожена во время активности!" << std::endl;
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
            std::cout << "  Отрисовка частицы в (" << x << ", " << y << ")" << std::endl;
        }
    }
};

// Другой тип игрового объекта
class Bullet {
private:
    float x, y;
    int damage;
    bool active;
    
public:
    Bullet() : x(0), y(0), damage(0), active(false) {
        std::cout << "Пуля создана" << std::endl;
    }
    
    void fire(float px, float py, int dmg) {
        x = px;
        y = py;
        damage = dmg;
        active = true;
    }
    
    void update(float dt) {
        if (!active) return;
        y += 500 * dt;  // Движение вверх
        if (y > 600) active = false;
    }
    
    void reset() {
        active = false;
    }
    
    bool isActive() const { return active; }
};

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    
    std::cout << "=== СИСТЕМА ЧАСТИЦ С ПУЛОМ ОБЪЕКТОВ ===" << std::endl;
    
    ObjectPool<Particle> particlePool(50);
    
    std::vector<std::unique_ptr<Particle, std::function<void(Particle*)>>> activeParticles;
    
    // Симуляция 100 кадров
    for (int frame = 0; frame < 100; frame++) {
        // Спавн 1-3 новых частиц за кадр
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
                std::cout << "Пул исчерпан на кадре " << frame << std::endl;
                break;
            }
        }
        
        // Обновление всех частиц
        for (auto& particle : activeParticles) {
            particle->update(0.016f);  // 60 FPS
        }
        
        // Удаление неактивных частиц (они возвращаются в пул автоматически через пользовательский удалитель)
        activeParticles.erase(
            std::remove_if(activeParticles.begin(), activeParticles.end(),
                [](const auto& p) { return !p->isActive(); }),
            activeParticles.end());
        
        // Вывод статистики каждые 20 кадров
        if (frame % 20 == 0) {
            std::cout << "Кадр " << frame << ": "
                      << activeParticles.size() << " активных, "
                      << particlePool.available() << " в пуле, "
                      << particlePool.created() << " всего создано" << std::endl;
        }
    }
    
    std::cout << "\n=== СИСТЕМА ПУЛЬ ===" << std::endl;
    
    ObjectPool<Bullet> bulletPool(20);
    std::vector<std::unique_ptr<Bullet, std::function<void(Bullet*)>>> activeBullets;
    
    // Симуляция стрельбы
    for (int i = 0; i < 30; i++) {
        auto bullet = bulletPool.acquire();
        bullet->fire(400, 550, 10);
        activeBullets.push_back(std::move(bullet));
        
        std::cout << "Выстрел " << i+1 << "! Всего пуль: " << activeBullets.size() 
                  << ", Доступно в пуле: " << bulletPool.available() << std::endl;
    }
    
    // Пули будут автоматически возвращены в пул при выходе из области видимости
    // или при вызове пользовательского удалителя
    
    return 0;
}
```

---

## Частые ошибки

### 1. Определение шаблонов в .cpp файлах

```cpp
// ❌ template.cpp — не слинкуется
template <typename T>
T add(T a, T b) { return a + b; }

// ✅ Определение в заголовочном файле (.h или .hpp) или использование явной инстанциации
// В заголовочном файле:
template <typename T>
T add(T a, T b) { return a + b; }
```

### 2. Забытый `typename` для зависимых типов

```cpp
template <typename T>
void process(const T& container) {
    // ❌ Компилятор не знает, что Iterator — тип
    T::Iterator it = container.begin();
    
    // ✅ Сообщаем компилятору, что это тип
    typename T::Iterator it = container.begin();
}
```

### 3. Смешивание параметров шаблона

```cpp
// ❌ Неправильно: нельзя использовать разные типы неявно
template <typename T>
T add(T a, T b) { return a + b; }

int i = 5;
float f = 3.14;
auto result = add(i, f);  // Ошибка! Неоднозначный T

// ✅ Либо явное указание типа
auto result = add<float>(i, f);  // T = float

// Или использование auto return с двумя параметрами
template <typename T1, typename T2>
auto add(T1 a, T2 b) { return a + b; }
```

### 4. Излишнее усложнение с шаблонами, когда они не нужны

```cpp
// ❌ Излишний шаблон
template <typename T>
T addOne(T x) {
    return x + 1;
}

// ✅ Проще в этом случае
int addOne(int x) { return x + 1; }
```

---

## Шпаргалка

```cpp
// Шаблон функции
template <typename T>
T functionName(T param) { return param; }

// Несколько типов
template <typename T1, typename T2>
auto functionName(T1 a, T2 b) { return a + b; }

// Шаблон класса
template <typename T>
class ClassName {
    T member;
    T method(T param) { return param; }
};

// Не-типовой параметр шаблона
template <typename T, int Size>
class FixedArray { };

// Специализация шаблона
template <>
class ClassName<SpecificType> { };

// Вариативный шаблон
template <typename... Args>
void function(Args... args) { }

// Параметр-шаблон (продвинутый)
template <template <typename> class Container>
class Wrapper { };

// Псевдоним шаблона (C++11)
template <typename T>
using Vector = std::vector<T>;

// Направляющие вывода шаблона (C++17)
template <typename T>
Box(T) -> Box<T>;  // Позволяет Box(42) вывести Box<int>
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Напишите шаблонную функцию `swap`, которая обменивает два значения любого типа.

**Упражнение 2 (Среднее):** Создайте обобщённый шаблон класса `Stack` с методами `push`, `pop`, `top`, `isEmpty`.

**Упражнение 3 (Среднее):** Реализуйте `findMax`, который работает с любым контейнером, предоставляющим `begin()` и `end()`. Протестируйте с `vector<int>`, `list<float>`, `array<string, 5>`.

**Упражнение 4 (Сложное):** Создайте шаблон класса `Matrix<T, Rows, Cols>` для матриц с размерами на этапе компиляции. Реализуйте сложение, умножение и метод `print`.

**Упражнение 5 (Сложное):** Создайте обобщённый `EventDispatcher`, который позволяет регистрировать колбэки для разных типов событий с использованием вариативных шаблонов.

**Упражнение 6 (Вызов):** Реализуйте упрощённый `std::tuple` с использованием вариативных шаблонов. Поддерживайте `get<I>(tuple)` для доступа к элементам по индексу.

---

## Резюме

Теперь вы знаете:

✅ Шаблоны функций для обобщённых алгоритмов  
✅ Шаблоны классов для обобщённых контейнеров  
✅ Специализацию шаблонов для логики, специфичной для типа  
✅ Вариативные шаблоны для переменного числа аргументов  
✅ Не-типовые параметры для значений на этапе компиляции  
✅ Полную систему пула объектов  
✅ Когда использовать (и не использовать) шаблоны  

## Что дальше?

Следующий урок: **Стандартная библиотека шаблонов (STL)** — освойте `vector`, `map`, `set`, `algorithm` и многое другое!

---

## Ресурсы

- [Шаблоны C++ (cppreference)](https://en.cppreference.com/w/cpp/language/templates)
- [Специализация шаблонов](https://en.cppreference.com/w/cpp/language/template_specialization)
- [Вариативные шаблоны](https://en.cppreference.com/w/cpp/language/parameter_pack)

---

**Практическое задание:** Создайте обобщённый `GameObjectManager<T>`, который управляет объектами любого типа. Поддерживайте добавление, удаление, поиск по ID и обновление всех объектов. Используйте шаблоны, чтобы избежать дублирования кода для разных типов объектов (Игрок, Враг, Предмет, Снаряд).