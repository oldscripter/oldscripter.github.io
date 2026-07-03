---
title: "Семантика перемещения — эффективная передача и идеальная пересылка"
description: "Перестаньте копировать ненужные данные — освойте конструкторы перемещения, перемещающее присваивание и идеальную пересылку"
pubDate: 2026-05-18
tags: ["C++", "advanced", "move-semantics", "rvalue-references", "perfect-forwarding"]
lang: "ru"
lessonNumber: 301
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Урок 18: Семантика перемещения — эффективная передача и идеальная пересылка

Добро пожаловать обратно! На протяжении всего курса вы копировали данные. Но копирование требует ресурсов. **Семантика перемещения** позволяет передавать ресурсы вместо их копирования — делая код значительно быстрее.

## Что вы изучите

- Lvalues vs rvalues (что это?)
- Rvalue-ссылки (`&&`)
- Конструкторы перемещения и операторы перемещающего присваивания
- `std::move` — преобразование lvalue в rvalue
- Исключение копирования и RVO (оптимизация возвращаемого значения)
- Правило пяти (вместо правила трёх)
- Идеальная пересылка с `std::forward`

---

## Часть 1: Проблема — ненужные копирования

```cpp
#include <iostream>
#include <vector>
#include <string>

// Без семантики перемещения — дорогие копирования повсюду
class OldString {
    char* data;
    size_t size;
    
public:
    // Конструктор копирования (дорогой)
    OldString(const OldString& other) {
        size = other.size;
        data = new char[size];
        for (size_t i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
        std::cout << "Скопировано " << size << " байт" << std::endl;
    }
    
    // Деструктор
    ~OldString() {
        delete[] data;
    }
};

int main() {
    std::vector<OldString> strings;
    
    // Каждый push_back КОПИРУЕТ всю строку — медленно!
    for (int i = 0; i < 1000; i++) {
        OldString temp;
        strings.push_back(temp);  // Копирование! Копирование! Копирование!
    }
    
    return 0;
}
```

**Решение:** Семантика перемещения передаёт владение вместо копирования.

---

## Часть 2: Lvalues vs Rvalues

Понимание семантики перемещения начинается с понимания категорий значений.

```cpp
#include <iostream>

int main() {
    int x = 42;      // 'x' — lvalue (имеет имя, занимает память)
    int y = x + 5;   // 'x + 5' — rvalue (временное, без имени)
    
    // lvalues: то, что может стоять СЛЕВА от присваивания
    x = 10;          // x — lvalue
    // 10 = x;       // Ошибка! 10 — rvalue
    
    // rvalues: то, что может стоять СПРАВА от присваивания
    int z = 20;      // 20 — rvalue
    int w = x + y;   // x + y — rvalue
    
    // Можно взять адрес lvalue
    int* ptr = &x;   // OK
    
    // Нельзя взять адрес rvalue
    // int* ptr2 = &42;  // Ошибка!
    
    return 0;
}
```

### Ключевые различия

| Категория | Примеры | Имеет имя? | Можно взять адрес? |
|----------|----------|-----------|-------------------|
| **lvalue** | переменные, `*ptr`, элементы массива | Да | Да |
| **rvalue** | литералы (42), временные (`x+y`), возвраты функций | Нет | Нет |

```cpp
std::string getName() {
    return "Каэлен";  // Возвращаемое значение — rvalue
}

int main() {
    std::string s1 = "Привет";     // s1 — lvalue, "Привет" — rvalue
    std::string s2 = s1;          // s1 — lvalue → КОПИРОВАНИЕ
    std::string s3 = getName();    // getName() возвращает rvalue → ПЕРЕМЕЩЕНИЕ (C++11)
    
    return 0;
}
```

---

## Часть 3: Rvalue-ссылки (`&&`)

Rvalue-ссылки позволяют связываться с временными объектами.

```cpp
#include <iostream>

void process(int& x) {
    std::cout << "Lvalue-ссылка: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "Rvalue-ссылка: " << x << std::endl;
}

int main() {
    int a = 42;
    
    process(a);     // Вызов lvalue-версии (a — lvalue)
    process(100);   // Вызов rvalue-версии (100 — rvalue)
    process(a + 5); // Вызов rvalue-версии (a+5 — rvalue)
    
    // Можно создавать rvalue-ссылки
    int&& rref = 100;      // OK: привязка rvalue-ссылки к rvalue
    // int&& rref2 = a;    // Ошибка: нельзя привязать rvalue-ссылку к lvalue
    
    // std::move преобразует lvalue в rvalue-ссылку
    int&& rref3 = std::move(a);  // OK: теперь a можно перемещать
    
    return 0;
}
```

---

## Часть 4: Конструктор перемещения и перемещающее присваивание

Суть семантики перемещения — кража ресурсов вместо копирования.

```cpp
#include <iostream>
#include <cstring>

class DynamicArray {
private:
    int* data;
    size_t size;
    
public:
    // Конструктор
    DynamicArray(size_t n) : size(n), data(new int[n]) {
        std::cout << "Создан массив размера " << size << std::endl;
    }
    
    // Деструктор
    ~DynamicArray() {
        delete[] data;
        std::cout << "Массив уничтожен" << std::endl;
    }
    
    // Конструктор копирования (дорогой)
    DynamicArray(const DynamicArray& other) 
        : size(other.size), data(new int[other.size]) {
        std::cout << "КОПИРОВАНИЕ " << size << " элементов" << std::endl;
        for (size_t i = 0; i < size; i++) {
            data[i] = other.data[i];
        }
    }
    
    // Конструктор перемещения (дешёвый!) — кража ресурсов
    DynamicArray(DynamicArray&& other) noexcept
        : size(other.size), data(other.data) {
        std::cout << "ПЕРЕМЕЩЕНИЕ " << size << " элементов (просто обмен указателями)" << std::endl;
        other.data = nullptr;
        other.size = 0;
    }
    
    // Копирующее присваивание
    DynamicArray& operator=(const DynamicArray& other) {
        if (this != &other) {
            std::cout << "КОПИРУЮЩЕЕ ПРИСВАИВАНИЕ" << std::endl;
            delete[] data;
            size = other.size;
            data = new int[size];
            for (size_t i = 0; i < size; i++) {
                data[i] = other.data[i];
            }
        }
        return *this;
    }
    
    // Перемещающее присваивание
    DynamicArray& operator=(DynamicArray&& other) noexcept {
        if (this != &other) {
            std::cout << "ПЕРЕМЕЩАЮЩЕЕ ПРИСВАИВАНИЕ" << std::endl;
            delete[] data;           // Очистка наших старых данных
            data = other.data;       // Кража указателя
            size = other.size;       // Кража размера
            other.data = nullptr;    // Оставляем other в валидном состоянии
            other.size = 0;
        }
        return *this;
    }
};

int main() {
    std::cout << "=== Создание массивов ===" << std::endl;
    DynamicArray arr1(100);
    DynamicArray arr2(50);
    
    std::cout << "\n=== Копирование (дорогое) ===" << std::endl;
    DynamicArray arr3 = arr1;  // Конструктор копирования
    
    std::cout << "\n=== Перемещение (дешёвое) ===" << std::endl;
    DynamicArray arr4 = std::move(arr1);  // Конструктор перемещения
    
    std::cout << "\n=== arr1 теперь пуст ===" << std::endl;
    // arr1 находится в валидном, но неопределённом состоянии (nullptr)
    
    std::cout << "\n=== Перемещающее присваивание ===" << std::endl;
    arr2 = std::move(arr4);  // Перемещающее присваивание
    
    return 0;
}
```

---

## Часть 5: `std::move` — просто приведение типа

`std::move` на самом деле ничего не перемещает — это просто приведение к rvalue-ссылке.

```cpp
#include <iostream>
#include <utility>  // для std::move

class Widget {
    std::string name;
    
public:
    Widget(const std::string& n) : name(n) {}
    
    // Конструктор перемещения
    Widget(Widget&& other) noexcept {
        name = std::move(other.name);  // На самом деле вызывает перемещение строки
        std::cout << "Widget перемещён: " << name << std::endl;
    }
    
    std::string getName() const { return name; }
};

int main() {
    Widget w1("Оригинал");
    
    // std::move приводит w1 к rvalue-ссылке
    Widget w2 = std::move(w1);  // Вызов конструктора перемещения
    
    std::cout << "w2: " << w2.getName() << std::endl;
    // w1 теперь в валидном, но неопределённом состоянии
    
    // НЕ ИСПОЛЬЗУЙТЕ перемещённые объекты, кроме как для переназначения
    w1 = Widget("Новое значение");  // OK: переназначение
    
    return 0;
}
```

### Предупреждение: Не используйте перемещённые объекты!

```cpp
std::vector<int> v1 = {1, 2, 3, 4, 5};
std::vector<int> v2 = std::move(v1);

// v1 теперь в состоянии "валидный, но неопределённый"
std::cout << v1.size() << std::endl;  // Вероятно 0, но не гарантируется
// Использование v1 для чего-либо, кроме уничтожения или переназначения, опасно!

v1 = {10, 20, 30};  // OK: переназначение перед использованием
```

---

## Часть 6: Правило пяти

Современный C++ следует **правилу пяти** — если вы определяете любой из этих методов, определите все пять:

```cpp
class Resource {
    // 1. Деструктор
    ~Resource();
    
    // 2. Конструктор копирования
    Resource(const Resource&);
    
    // 3. Копирующее присваивание
    Resource& operator=(const Resource&);
    
    // 4. Конструктор перемещения
    Resource(Resource&&) noexcept;
    
    // 5. Перемещающее присваивание
    Resource& operator=(Resource&&) noexcept;
};
```

**Правило нуля** (предпочтительно): Не определяйте ничего — используйте умные указатели!

```cpp
// ✅ Лучшее: Правило нуля — пусть компилятор генерирует всё
class ModernResource {
    std::unique_ptr<int[]> data;
    std::string name;
    std::vector<int> values;
    // Деструктор, копирование/перемещение автоматически корректны!
};
```

---

## Часть 7: Исключение копирования и RVO

Компилятор часто полностью исключает копирования — даже без семантики перемещения.

```cpp
#include <iostream>

class BigObject {
public:
    BigObject() { std::cout << "Создан" << std::endl; }
    BigObject(const BigObject&) { std::cout << "Скопирован" << std::endl; }
    BigObject(BigObject&&) { std::cout << "Перемещён" << std::endl; }
    ~BigObject() { std::cout << "Уничтожен" << std::endl; }
};

// RVO (Оптимизация возвращаемого значения) — гарантирована с C++17
BigObject createObject() {
    BigObject obj;
    return obj;  // Нет копирования, нет перемещения — создаётся напрямую у вызывающего
}

int main() {
    std::cout << "=== Создание объекта ===" << std::endl;
    BigObject obj = createObject();  // Нет вывода копирования/перемещения!
    
    // Без RVO вы бы увидели: Создан, Перемещён, Уничтожен и т.д.
    
    return 0;
}
```

**Именованное RVO (NRVO)** — работает в большинстве случаев, но не гарантируется.

```cpp
BigObject createObject(bool condition) {
    BigObject obj1;
    BigObject obj2;
    
    if (condition) {
        return obj1;  // NRVO может примениться
    } else {
        return obj2;  // NRVO может примениться
    }
}
```

---

## Часть 8: Идеальная пересылка с `std::forward`

`std::forward` сохраняет категорию значения — полезно в шаблонных функциях.

```cpp
#include <iostream>
#include <utility>

void process(int& x) {
    std::cout << "Lvalue: " << x << std::endl;
}

void process(int&& x) {
    std::cout << "Rvalue: " << x << std::endl;
}

// Функция-обёртка для идеальной пересылки
template<typename T>
void wrapper(T&& arg) {  // Универсальная ссылка (T&& с выведенным T)
    process(std::forward<T>(arg));  // Пересылает как исходный тип
}

int main() {
    int a = 42;
    
    wrapper(a);    // Пересылает как lvalue → вызов process(int&)
    wrapper(100);  // Пересылает как rvalue → вызов process(int&&)
    wrapper(std::move(a));  // Пересылает как rvalue
    
    // Без идеальной пересылки rvalue становятся lvalue внутри функции
    return 0;
}
```

### Реальный пример: Фабричная функция

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
    // Конструктор с несколькими параметрами
    Player(const std::string& n, int h, int l) 
        : name(n), health(h), level(l) {
        std::cout << "Игрок создан: " << name << std::endl;
    }
    
    void display() const {
        std::cout << name << " (Ур." << level << ", HP: " << health << ")" << std::endl;
    }
};

// Фабричная функция с идеальной пересылкой
template<typename T, typename... Args>
std::unique_ptr<T> create(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

int main() {
    // Аргументы идеально пересылаются в конструктор Player
    auto player1 = create<Player>("Каэлен", 100, 5);
    auto player2 = create<Player>("Ария", 80, 7);
    
    player1->display();
    player2->display();
    
    // Без идеальной пересылки строковые литералы вызывали бы лишние копирования
    
    return 0;
}
```

---

## Полный пример: Оптимизированная система игровых объектов

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <utility>

class GameObject {
private:
    std::string name;
    std::vector<float> transformData;  // Большие данные, которые мы хотим перемещать
    int health;
    
public:
    // Конструктор
    GameObject(const std::string& n, int h) 
        : name(n), health(h) {
        // Симуляция тяжёлой инициализации
        transformData.resize(1000, 0.0f);
        std::cout << "Создан: " << name << std::endl;
    }
    
    // Конструктор копирования (дорогой — мы не хотим его)
    GameObject(const GameObject& other) 
        : name(other.name), 
          transformData(other.transformData),  // Копирует 1000 float'ов!
          health(other.health) {
        std::cout << "КОПИРОВАНИЕ " << name << " (дорогое!)" << std::endl;
    }
    
    // Конструктор перемещения (дешёвый)
    GameObject(GameObject&& other) noexcept
        : name(std::move(other.name)),
          transformData(std::move(other.transformData)),  // Просто кража указателя!
          health(other.health) {
        std::cout << "ПЕРЕМЕЩЕНИЕ " << name << std::endl;
        other.health = 0;
    }
    
    // Копирующее присваивание
    GameObject& operator=(const GameObject& other) {
        if (this != &other) {
            name = other.name;
            transformData = other.transformData;  // Дорогое копирование
            health = other.health;
            std::cout << "КОПИРУЮЩЕЕ ПРИСВАИВАНИЕ: " << name << std::endl;
        }
        return *this;
    }
    
    // Перемещающее присваивание
    GameObject& operator=(GameObject&& other) noexcept {
        if (this != &other) {
            name = std::move(other.name);
            transformData = std::move(other.transformData);  // Дешёвое перемещение
            health = other.health;
            other.health = 0;
            std::cout << "ПЕРЕМЕЩАЮЩЕЕ ПРИСВАИВАНИЕ: " << name << std::endl;
        }
        return *this;
    }
    
    void display() const {
        std::cout << "Объект: " << name << " (HP: " << health << ")" << std::endl;
    }
};

// Фабрика, возвращающая по значению (использует перемещение, если нет RVO)
GameObject createEnemy(const std::string& type) {
    GameObject enemy(type + "_Гоблин", 50);
    return enemy;  // NRVO применяется (нет копирования/перемещения)
}

class ObjectManager {
    std::vector<GameObject> objects;
    
public:
    // Идеальная пересылка для emplace
    template<typename... Args>
    void addObject(Args&&... args) {
        objects.emplace_back(std::forward<Args>(args)...);  // Конструирование на месте
    }
    
    // Перемещение объектов в менеджер
    void addObject(GameObject&& obj) {
        objects.push_back(std::move(obj));  // Перемещение в вектор
    }
    
    void displayAll() const {
        for (const auto& obj : objects) {
            obj.display();
        }
    }
};

int main() {
    std::cout << "=== ДЕМО СЕМАНТИКИ ПЕРЕМЕЩЕНИЯ ===" << std::endl;
    
    ObjectManager manager;
    
    // Emplace конструирует напрямую (без копирований, без перемещений)
    std::cout << "\n--- Emplace (лучший) ---" << std::endl;
    manager.addObject("Каэлен", 100);
    manager.addObject("Ария", 80);
    
    // Создание временного объекта и перемещение
    std::cout << "\n--- Перемещение из временного объекта ---" << std::endl;
    manager.addObject(createEnemy("Огненный"));  // RVO, затем перемещение
    
    // Явное перемещение
    std::cout << "\n--- Явное перемещение ---" << std::endl;
    GameObject boss("Дракон", 500);
    manager.addObject(std::move(boss));  // boss теперь в перемещённом состоянии
    
    std::cout << "\n=== ИТОГОВЫЕ ОБЪЕКТЫ ===" << std::endl;
    manager.displayAll();
    
    std::cout << "\nboss теперь в перемещённом состоянии (безопасно для уничтожения)" << std::endl;
    
    return 0;
}
```

---

## Сравнение производительности: Копирование vs Перемещение

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
    
    // Копирование/перемещение по умолчанию
};

int main() {
    const int COUNT = 100000;
    
    // Тест копирования
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<HeavyObject> copyVec;
    for (int i = 0; i < COUNT; i++) {
        HeavyObject obj;
        copyVec.push_back(obj);  // Копирование!
    }
    auto copyTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    // Тест перемещения
    start = std::chrono::high_resolution_clock::now();
    std::vector<HeavyObject> moveVec;
    for (int i = 0; i < COUNT; i++) {
        HeavyObject obj;
        moveVec.push_back(std::move(obj));  // Перемещение! (или emplace_back)
    }
    auto moveTime = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start);
    
    std::cout << "Копирование: " << copyTime.count() << "мс" << std::endl;
    std::cout << "Перемещение: " << moveTime.count() << "мс" << std::endl;
    std::cout << "Перемещение в " << (float)copyTime.count() / moveTime.count() 
              << "x быстрее!" << std::endl;
    
    return 0;
}
```

---

## Частые ошибки

### 1. Использование `std::move`, когда он не нужен

```cpp
// ❌ Излишнее перемещение (компилятор и так перемещает)
std::string getName() {
    std::string name = "Каэлен";
    return std::move(name);  // Предотвращает RVO!
}

// ✅ Позвольте компилятору оптимизировать
std::string getName() {
    std::string name = "Каэлен";
    return name;  // RVO или перемещение автоматически
}
```

### 2. Использование перемещённого объекта

```cpp
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = std::move(v1);
// v1.size();  // ❌ Не используйте перемещённый объект (кроме переназначения)

v1 = {4, 5, 6};  // ✅ Переназначение перед использованием
```

### 3. Отсутствие `noexcept` для операций перемещения

```cpp
// ❌ Без noexcept вектор может использовать копирование вместо перемещения
class BadMove {
    BadMove(BadMove&& other) { }  // Не noexcept
};

// ✅ Всегда помечайте операции перемещения noexcept, когда это возможно
class GoodMove {
    GoodMove(GoodMove&& other) noexcept { }
};
```

### 4. Забытое приведение к валидному состоянию

```cpp
// ❌ Другой объект оставлен в невалидном состоянии
MoveClass(MoveClass&& other) {
    data = other.data;
    // other.data всё ещё указывает на память! (риск двойного удаления)
}

// ✅ Установите other в валидное состояние
MoveClass(MoveClass&& other) noexcept {
    data = other.data;
    other.data = nullptr;  // Теперь other безопасно уничтожать
}
```

---

## Шпаргалка

```cpp
// Категории значений
int x = 5;        // x — lvalue, 5 — rvalue
int&& rref = 10;  // rvalue-ссылка

// Операции перемещения
class MyClass {
    // Конструктор перемещения
    MyClass(MyClass&& other) noexcept;
    
    // Перемещающее присваивание
    MyClass& operator=(MyClass&& other) noexcept;
};

// std::move (приведение к rvalue)
MyClass a;
MyClass b = std::move(a);  // Конструктор перемещения
a = std::move(b);           // Перемещающее присваивание

// std::forward (идеальная пересылка)
template<typename T>
void wrapper(T&& arg) {
    func(std::forward<T>(arg));
}

// Правило пяти (если определяете любой, определите все)
~MyClass();                           // Деструктор
MyClass(const MyClass&);              // Конструктор копирования
MyClass& operator=(const MyClass&);   // Копирующее присваивание
MyClass(MyClass&&) noexcept;          // Конструктор перемещения
MyClass& operator=(MyClass&&) noexcept; // Перемещающее присваивание

// Правило нуля (предпочтительно)
class Modern {
    std::vector<int> data;   // Все члены используют RAII
    std::unique_ptr<Widget> ptr;
    // Деструктор и операции перемещения, сгенерированные компилятором, работают идеально
};
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Определите, что из этого является lvalue, а что rvalue:
- `int x = 10;`
- `x + 20`
- `&x`
- `std::move(x)`
- `"Привет"`
- `std::string("Мир")`

**Упражнение 2 (Среднее):** Напишите класс `Buffer`, управляющий динамическим массивом char. Реализуйте конструктор перемещения и перемещающее присваивание. Протестируйте с вектором.

**Упражнение 3 (Среднее):** Создайте класс, похожий на `unique_ptr` (упрощённый), который реализует семантику перемещения, но запрещает копирование.

**Упражнение 4 (Сложное):** Реализуйте класс `Message`, содержащий большую строку. Добавьте операции перемещения и сравните производительность копирования vs перемещения в системе очередей.

**Упражнение 5 (Сложное):** Создайте обобщённый `ScopeGuard` с использованием идеальной пересылки. Он должен вызывать функцию при уничтожении.

**Упражнение 6 (Вызов):** Создайте `TaskSystem`, где задачи перемещаются в пул потоков. Используйте идеальную пересылку для аргументов задач. Покажите, что копирования исключены.

---

## Резюме

Теперь вы знаете:

✅ Lvalues vs rvalues (фундаментальное различие)  
✅ Rvalue-ссылки (`&&`)  
✅ Конструкторы перемещения и перемещающее присваивание  
✅ `std::move` (приведение к rvalue-ссылке)  
✅ Правило пяти vs Правило нуля  
✅ Исключение копирования и RVO (гарантировано с C++17)  
✅ Идеальная пересылка с `std::forward`  
✅ Преимущества производительности семантики перемещения  

## Что дальше?

Следующий урок: **Многопоточность** — пишите конкурентный код с `std::thread`, `std::async`, мьютексами и многим другим!

---

## Ресурсы

- [Семантика перемещения (cppreference)](https://en.cppreference.com/w/cpp/language/move_constructor)
- [Rvalue-ссылки](https://en.cppreference.com/w/cpp/language/reference#Rvalue_references)
- [std::move](https://en.cppreference.com/w/cpp/utility/move)
- [std::forward](https://en.cppreference.com/w/cpp/utility/forward)
- [Правило трёх/пяти/нуля](https://en.cppreference.com/w/cpp/language/rule_of_three)

---

**Практическое задание:** Возьмите класс, который вы написали ранее (например, инвентарь или структуру игрока) и добавьте правильную семантику перемещения. Сравните производительность при использовании в векторах или как возвращаемых значений. Используйте `noexcept` правильно!