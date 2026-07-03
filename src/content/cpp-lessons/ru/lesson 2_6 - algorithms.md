---
title: "Алгоритмы STL — сортировка, поиск и преобразование данных"
description: "Освойте заголовок algorithm — пишите более быстрый и чистый код со стандартными алгоритмами"
pubDate: 2026-05-16
tags: ["C++", "intermediate", "STL", "algorithms", "functional-programming"]
lang: "ru"
lessonNumber: 206
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 16: Алгоритмы STL — сортировка, поиск и преобразование данных

Добро пожаловать обратно! Вы освоили контейнеры. Теперь пришло время освоить **алгоритмы** — функции, которые управляют контейнерами. С алгоритмами STL вы можете писать сложные операции в одну строку вместо десяти.

## Что вы изучите

- Немодифицирующие алгоритмы: `find`, `count`, `search`, `equal`
- Модифицирующие алгоритмы: `copy`, `transform`, `replace`, `fill`
- Сортировка и упорядочивание: `sort`, `stable_sort`, `partial_sort`, `nth_element`
- Алгоритмы множеств: `merge`, `set_union`, `set_intersection`
- Min/max и сравнения
- Лямбда-выражения (C++11) для пользовательской логики
- Параллельные алгоритмы (C++17)

---

## Часть 1: Зачем использовать алгоритмы STL?

### Без алгоритмов STL

```cpp
// ❌ Ручные циклы подвержены ошибкам и многословны
std::vector<int> scores = {95, 87, 100, 76, 92};

// Поиск первого результата > 90
int found = -1;
for (size_t i = 0; i < scores.size(); i++) {
    if (scores[i] > 90) {
        found = scores[i];
        break;
    }
}

// Копирование чётных результатов в новый вектор
std::vector<int> evens;
for (int s : scores) {
    if (s % 2 == 0) {
        evens.push_back(s);
    }
}

// Сумма всех результатов
int sum = 0;
for (int s : scores) {
    sum += s;
}
```

### С алгоритмами STL

```cpp
// ✅ Чисто, выразительно, менее подвержено ошибкам
#include <algorithm>
#include <numeric>  // для accumulate

std::vector<int> scores = {95, 87, 100, 76, 92};

// Поиск первого результата > 90
auto it = std::find_if(scores.begin(), scores.end(), [](int s) { return s > 90; });

// Копирование чётных результатов
std::vector<int> evens;
std::copy_if(scores.begin(), scores.end(), std::back_inserter(evens), 
             [](int s) { return s % 2 == 0; });

// Сумма всех результатов
int sum = std::accumulate(scores.begin(), scores.end(), 0);
```

---

## Часть 2: Немодифицирующие алгоритмы

### Поиск с `find`, `find_if`, `find_first_of`

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50, 30, 60};
    
    // Поиск первого вхождения значения
    auto it = std::find(numbers.begin(), numbers.end(), 30);
    if (it != numbers.end()) {
        std::cout << "Найдено 30 на позиции: " << (it - numbers.begin()) << std::endl;
    }
    
    // Поиск первого числа > 35
    it = std::find_if(numbers.begin(), numbers.end(), 
                      [](int n) { return n > 35; });
    std::cout << "Первое число > 35: " << *it << std::endl;
    
    // Поиск первого чётного числа
    it = std::find_if(numbers.begin(), numbers.end(), 
                      [](int n) { return n % 2 == 0; });
    
    // Поиск первого числа, НЕ делящегося на 3
    it = std::find_if_not(numbers.begin(), numbers.end(), 
                          [](int n) { return n % 3 == 0; });
    
    // Подсчёт вхождений
    int count = std::count(numbers.begin(), numbers.end(), 30);
    std::cout << "30 встречается " << count << " раз" << std::endl;
    
    // Подсчёт по условию
    count = std::count_if(numbers.begin(), numbers.end(), 
                          [](int n) { return n > 25; });
    std::cout << "Чисел > 25: " << count << std::endl;
    
    // Проверка всех, любых, ни одного
    bool allPositive = std::all_of(numbers.begin(), numbers.end(), 
                                    [](int n) { return n > 0; });
    bool anyEven = std::any_of(numbers.begin(), numbers.end(), 
                               [](int n) { return n % 2 == 0; });
    bool noneZero = std::none_of(numbers.begin(), numbers.end(), 
                                  [](int n) { return n == 0; });
    
    std::cout << "Все положительные: " << allPositive << std::endl;
    std::cout << "Есть чётные: " << anyEven << std::endl;
    std::cout << "Нет нулевых: " << noneZero << std::endl;
    
    // Поиск подпоследовательности
    std::vector<int> pattern = {40, 50};
    it = std::search(numbers.begin(), numbers.end(), 
                     pattern.begin(), pattern.end());
    if (it != numbers.end()) {
        std::cout << "Шаблон найден на индексе " << (it - numbers.begin()) << std::endl;
    }
    
    // Поиск соседних равных элементов
    it = std::adjacent_find(numbers.begin(), numbers.end());
    if (it != numbers.end()) {
        std::cout << "Соседние равные: " << *it << std::endl;
    }
    
    return 0;
}
```

### Сравнение диапазонов

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> a = {1, 2, 3, 4, 5};
    std::vector<int> b = {1, 2, 3, 4, 5};
    std::vector<int> c = {1, 2, 3, 4, 6};
    
    // Проверка на равенство
    bool equal = std::equal(a.begin(), a.end(), b.begin());
    std::cout << "a == b: " << equal << std::endl;
    
    equal = std::equal(a.begin(), a.end(), c.begin());
    std::cout << "a == c: " << equal << std::endl;
    
    // Лексикографическое сравнение (как в словаре)
    std::vector<int> first = {1, 2, 3};
    std::vector<int> second = {1, 2, 4};
    
    bool less = std::lexicographical_compare(
        first.begin(), first.end(),
        second.begin(), second.end()
    );
    std::cout << "first < second: " << less << std::endl;
    
    // Несовпадение — поиск первого различия
    auto mismatch = std::mismatch(a.begin(), a.end(), c.begin());
    if (mismatch.first != a.end()) {
        std::cout << "Первое различие: a=" << *mismatch.first 
                  << ", c=" << *mismatch.second << std::endl;
    }
    
    return 0;
}
```

---

## Часть 3: Модифицирующие алгоритмы

### Копирование и преобразование

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>

int main() {
    std::vector<int> source = {1, 2, 3, 4, 5};
    std::vector<int> dest(source.size());
    
    // Копирование всего диапазона
    std::copy(source.begin(), source.end(), dest.begin());
    
    // Копирование только первых 3 элементов
    std::copy_n(source.begin(), 3, dest.begin());
    
    // Копирование по условию
    std::vector<int> evens;
    std::copy_if(source.begin(), source.end(), 
                 std::back_inserter(evens),
                 [](int n) { return n % 2 == 0; });
    
    // Преобразование (применение функции к каждому элементу)
    std::vector<int> doubled(source.size());
    std::transform(source.begin(), source.end(), doubled.begin(),
                   [](int n) { return n * 2; });
    
    // Преобразование двух диапазонов в один
    std::vector<int> sums(source.size());
    std::transform(source.begin(), source.end(), doubled.begin(), sums.begin(),
                   [](int a, int b) { return a + b; });
    
    // Генерация значений
    std::vector<int> generated(5);
    int value = 0;
    std::generate(generated.begin(), generated.end(), 
                  [&value]() { return value += 10; });
    
    // Заполнение конкретным значением
    std::vector<int> filled(10);
    std::fill(filled.begin(), filled.end(), 42);
    
    // Замена значений
    std::vector<int> data = {1, 2, 3, 2, 4, 2, 5};
    std::replace(data.begin(), data.end(), 2, 99);
    
    // Замена по условию
    std::replace_if(data.begin(), data.end(),
                    [](int n) { return n > 50; }, 0);
    
    // Удаление элементов (идиома erase-remove)
    data.erase(std::remove(data.begin(), data.end(), 99), data.end());
    
    // Удаление по условию
    data.erase(std::remove_if(data.begin(), data.end(),
                              [](int n) { return n % 2 == 0; }),
               data.end());
    
    return 0;
}
```

### Обмен и реверсирование

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5};
    
    // Обмен двух элементов
    std::swap(vec[0], vec[4]);  // {5, 2, 3, 4, 1}
    
    // Обмен диапазонов
    std::vector<int> other = {10, 20, 30};
    std::swap_ranges(vec.begin(), vec.begin() + 3, other.begin());
    
    // Реверсирование
    std::reverse(vec.begin(), vec.end());
    
    // Вращение (перемещение элемента в начало)
    std::rotate(vec.begin(), vec.begin() + 2, vec.end());
    
    // Перемешивание (рандомизация)
    std::random_device rd;
    std::mt19937 g(rd());
    std::shuffle(vec.begin(), vec.end(), g);
    
    return 0;
}
```

---

## Часть 4: Алгоритмы сортировки

### Базовая сортировка

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    // Сортировка по возрастанию (по умолчанию)
    std::sort(numbers.begin(), numbers.end());
    // {1, 2, 3, 4, 5, 6, 7, 8, 9}
    
    // Сортировка по убыванию
    std::sort(numbers.begin(), numbers.end(), 
              [](int a, int b) { return a > b; });
    
    // Сортировка с пользовательским компаратором
    std::vector<std::string> words = {"apple", "banana", "kiwi", "grape"};
    std::sort(words.begin(), words.end(),
              [](const std::string& a, const std::string& b) {
                  return a.length() < b.length();
              });
    // {"kiwi", "apple", "grape", "banana"}
    
    // Стабильная сортировка (сохраняет относительный порядок равных элементов)
    std::stable_sort(numbers.begin(), numbers.end());
    
    // Частичная сортировка (сортировка только первых N элементов)
    std::partial_sort(numbers.begin(), numbers.begin() + 3, numbers.end());
    // Первые 3 — наименьшие, остальные не отсортированы
    
    // Nth element (помещает N-й наименьший элемент в правильную позицию)
    std::nth_element(numbers.begin(), numbers.begin() + 4, numbers.end());
    // Элемент на индексе 4 является 5-м наименьшим
    
    // Проверка на отсортированность
    bool sorted = std::is_sorted(numbers.begin(), numbers.end());
    
    // Поиск первого элемента, нарушающего порядок
    auto it = std::is_sorted_until(numbers.begin(), numbers.end());
    
    return 0;
}
```

### Реальный пример: Рейтинг результатов

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct PlayerScore {
    std::string name;
    int score;
    std::chrono::system_clock::time_point timestamp;
};

int main() {
    std::vector<PlayerScore> scores = {
        {"Каэлен", 2500},
        {"Ария", 3100},
        {"Торн", 1800},
        {"Луна", 2900},
        {"Зейн", 2200},
        {"Каэлен", 2700},  // Новый рекорд
        {"Мира", 1950}
    };
    
    // Сортировка по убыванию очков
    std::sort(scores.begin(), scores.end(),
              [](const PlayerScore& a, const PlayerScore& b) {
                  return a.score > b.score;
              });
    
    std::cout << "=== ТАБЛИЦА РЕКОРДОВ ===" << std::endl;
    for (size_t i = 0; i < std::min(scores.size(), size_t(5)); i++) {
        std::cout << i+1 << ". " << scores[i].name 
                  << " - " << scores[i].score << std::endl;
    }
    
    // Получение топ-3 результатов
    std::vector<PlayerScore> top3(3);
    std::partial_sort_copy(scores.begin(), scores.end(),
                           top3.begin(), top3.end(),
                           [](const PlayerScore& a, const PlayerScore& b) {
                               return a.score > b.score;
                           });
    
    // Поиск лучшего результата игрока
    auto best = std::max_element(scores.begin(), scores.end(),
        [](const PlayerScore& a, const PlayerScore& b) {
            return a.score < b.score;
        });
    
    if (best != scores.end()) {
        std::cout << "\nЛучший результат: " << best->name 
                  << " с " << best->score << std::endl;
    }
    
    return 0;
}
```

---

## Часть 5: Алгоритмы множеств (для отсортированных диапазонов)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // Входные диапазоны ДОЛЖНЫ быть отсортированы
    std::vector<int> set1 = {1, 2, 3, 4, 5, 6};
    std::vector<int> set2 = {4, 5, 6, 7, 8, 9};
    
    std::vector<int> result;
    
    // Объединение (элементы в любом из множеств)
    std::set_union(set1.begin(), set1.end(),
                   set2.begin(), set2.end(),
                   std::back_inserter(result));
    // {1, 2, 3, 4, 5, 6, 7, 8, 9}
    
    result.clear();
    
    // Пересечение (элементы в обоих множествах)
    std::set_intersection(set1.begin(), set1.end(),
                          set2.begin(), set2.end(),
                          std::back_inserter(result));
    // {4, 5, 6}
    
    result.clear();
    
    // Разность (элементы в set1, но не в set2)
    std::set_difference(set1.begin(), set1.end(),
                        set2.begin(), set2.end(),
                        std::back_inserter(result));
    // {1, 2, 3}
    
    result.clear();
    
    // Симметрическая разность (элементы в любом, но не в обоих)
    std::set_symmetric_difference(set1.begin(), set1.end(),
                                  set2.begin(), set2.end(),
                                  std::back_inserter(result));
    // {1, 2, 3, 7, 8, 9}
    
    // Слияние двух отсортированных диапазонов
    std::vector<int> merged;
    std::merge(set1.begin(), set1.end(),
               set2.begin(), set2.end(),
               std::back_inserter(merged));
    
    // Проверка, включает ли один диапазон другой
    bool includes = std::includes(set1.begin(), set1.end(),
                                  result.begin(), result.end());
    
    return 0;
}
```

### Реальный пример: Объединение инвентаря игрока

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct Item {
    std::string name;
    int quantity;
    
    bool operator<(const Item& other) const {
        return name < other.name;
    }
};

int main() {
    std::vector<Item> inventory1 = {
        {"Зелье здоровья", 3},
        {"Железный меч", 1},
        {"Зелье маны", 2},
        {"Щит", 1}
    };
    
    std::vector<Item> inventory2 = {
        {"Зелье здоровья", 2},
        {"Кожаная броня", 1},
        {"Зелье маны", 1},
        {"Серебряный меч", 1}
    };
    
    // Сортировка обоих инвентарей
    std::sort(inventory1.begin(), inventory1.end());
    std::sort(inventory2.begin(), inventory2.end());
    
    // Слияние inventory2 в inventory1
    std::vector<Item> merged;
    std::merge(inventory1.begin(), inventory1.end(),
               inventory2.begin(), inventory2.end(),
               std::back_inserter(merged));
    
    // Объединение количества для дублирующихся предметов
    std::vector<Item> combined;
    for (size_t i = 0; i < merged.size(); i++) {
        if (i > 0 && merged[i].name == merged[i-1].name) {
            combined.back().quantity += merged[i].quantity;
        } else {
            combined.push_back(merged[i]);
        }
    }
    
    std::cout << "=== ОБЪЕДИНЁННЫЙ ИНВЕНТАРЬ ===" << std::endl;
    for (const auto& item : combined) {
        std::cout << item.name << ": " << item.quantity << std::endl;
    }
    
    // Поиск предметов в обоих инвентарях (пересечение)
    std::vector<Item> common;
    std::set_intersection(inventory1.begin(), inventory1.end(),
                          inventory2.begin(), inventory2.end(),
                          std::back_inserter(common));
    
    std::cout << "\n=== ПРЕДМЕТЫ В ОБОИХ ===" << std::endl;
    for (const auto& item : common) {
        std::cout << item.name << std::endl;
    }
    
    return 0;
}
```

---

## Часть 6: Бинарный поиск (на отсортированных диапазонах)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 3, 5, 7, 9, 11, 13, 15};
    
    // Бинарный поиск (O(log n))
    bool found = std::binary_search(numbers.begin(), numbers.end(), 7);
    std::cout << "Найдено 7: " << found << std::endl;
    
    // Нижняя граница (первая позиция, куда можно вставить значение без нарушения порядка)
    auto it = std::lower_bound(numbers.begin(), numbers.end(), 8);
    if (it != numbers.end()) {
        std::cout << "Первый элемент >= 8: " << *it << " на индексе " 
                  << (it - numbers.begin()) << std::endl;
    }
    
    // Верхняя граница (первая позиция > значения)
    it = std::upper_bound(numbers.begin(), numbers.end(), 7);
    std::cout << "Первый элемент > 7: " << *it << std::endl;
    
    // Равный диапазон (обе границы)
    auto range = std::equal_range(numbers.begin(), numbers.end(), 7);
    std::cout << "Диапазон для 7: [" << (range.first - numbers.begin())
              << ", " << (range.second - numbers.begin()) << ")" << std::endl;
    
    // С дубликатами
    std::vector<int> withDupes = {1, 2, 2, 2, 3, 4, 4, 5};
    auto bounds = std::equal_range(withDupes.begin(), withDupes.end(), 2);
    std::cout << "2 встречается " << (bounds.second - bounds.first) << " раз" << std::endl;
    
    return 0;
}
```

---

## Часть 7: Min/Max и сравнения

```cpp
#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    // Два значения
    int a = 10, b = 20;
    int minVal = std::min(a, b);
    int maxVal = std::max(a, b);
    auto [min, max] = std::minmax(a, b);
    
    // Несколько значений (initializer_list)
    int minList = std::min({5, 2, 8, 1, 9});
    int maxList = std::max({5, 2, 8, 1, 9});
    auto minMaxList = std::minmax({5, 2, 8, 1, 9});
    
    // Диапазоны
    std::vector<int> vec = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    
    auto minIt = std::min_element(vec.begin(), vec.end());
    auto maxIt = std::max_element(vec.begin(), vec.end());
    auto minMaxIt = std::minmax_element(vec.begin(), vec.end());
    
    std::cout << "Минимум: " << *minIt << " на индексе " 
              << (minIt - vec.begin()) << std::endl;
    std::cout << "Максимум: " << *maxIt << std::endl;
    
    // Ограничение значения диапазоном (C++17)
    int value = 15;
    int clamped = std::clamp(value, 0, 10);
    std::cout << "Ограничение 15 до [0,10]: " << clamped << std::endl;
    
    return 0;
}
```

---

## Часть 8: Операции разделения

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    
    // Разделение (переупорядочивание так, чтобы чётные шли первыми)
    auto it = std::partition(numbers.begin(), numbers.end(),
                             [](int n) { return n % 2 == 0; });
    
    std::cout << "После разделения (чётные первые): ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\nТочка разделения: " << (it - numbers.begin()) << std::endl;
    
    // Стабильное разделение (сохраняет относительный порядок)
    std::vector<int> stable = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    std::stable_partition(stable.begin(), stable.end(),
                          [](int n) { return n % 2 == 0; });
    
    // Проверка на разделённость
    bool isPartitioned = std::is_partitioned(numbers.begin(), numbers.end(),
                                             [](int n) { return n % 2 == 0; });
    
    // Копирование с разделением
    std::vector<int> evens, odds;
    std::partition_copy(numbers.begin(), numbers.end(),
                        std::back_inserter(evens),
                        std::back_inserter(odds),
                        [](int n) { return n % 2 == 0; });
    
    // Точка разделения (поиск места, где условие становится ложным)
    auto partitionPoint = std::partition_point(numbers.begin(), numbers.end(),
                                               [](int n) { return n % 2 == 0; });
    
    return 0;
}
```

---

## Полный пример: Система арены

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <random>
#include <chrono>

struct Combatant {
    std::string name;
    int health;
    int damage;
    int speed;
    bool isAlive;
    
    Combatant(const std::string& n, int h, int d, int s)
        : name(n), health(h), damage(d), speed(s), isAlive(true) {}
    
    void takeDamage(int amount) {
        health -= amount;
        if (health <= 0) {
            health = 0;
            isAlive = false;
        }
    }
    
    bool operator<(const Combatant& other) const {
        return speed > other.speed;  // Высшая скорость идёт первой
    }
};

class Arena {
private:
    std::vector<Combatant> combatants;
    std::mt19937 rng;
    
public:
    Arena() : rng(std::chrono::steady_clock::now().time_since_epoch().count()) {}
    
    void addCombatant(const Combatant& c) {
        combatants.push_back(c);
    }
    
    void fight() {
        // Сортировка по скорости (высшая первая)
        std::sort(combatants.begin(), combatants.end());
        
        std::cout << "=== БОЙ НАЧИНАЕТСЯ ===" << std::endl;
        printStatus();
        
        int turn = 0;
        while (std::count_if(combatants.begin(), combatants.end(),
                             [](const Combatant& c) { return c.isAlive; }) > 1) {
            turn++;
            std::cout << "\n--- Ход " << turn << " ---" << std::endl;
            
            // Обработка ходов в порядке скорости
            for (auto& attacker : combatants) {
                if (!attacker.isAlive) continue;
                
                // Поиск случайной живой цели
                std::vector<Combatant*> alive;
                for (auto& c : combatants) {
                    if (c.isAlive && &c != &attacker) {
                        alive.push_back(&c);
                    }
                }
                
                if (alive.empty()) break;
                
                std::uniform_int_distribution<int> dist(0, alive.size() - 1);
                Combatant* target = alive[dist(rng)];
                
                // Атака
                int damage = attacker.damage + (std::uniform_int_distribution<int>(1, 10)(rng));
                target->takeDamage(damage);
                
                std::cout << attacker.name << " наносит " << target->name 
                          << " урон " << damage << "! (HP: " 
                          << std::max(0, target->health) << ")" << std::endl;
                
                if (!target->isAlive) {
                    std::cout << "⚡ " << target->name << " был побеждён! ⚡" << std::endl;
                }
            }
            
            // Удаление мёртвых бойцов
            combatants.erase(std::remove_if(combatants.begin(), combatants.end(),
                                            [](const Combatant& c) { return !c.isAlive; }),
                             combatants.end());
        }
        
        // Победитель!
        if (!combatants.empty()) {
            std::cout << "\n🏆 ПОБЕДИТЕЛЬ: " << combatants[0].name << "! 🏆" << std::endl;
        }
    }
    
    void printStatus() const {
        std::vector<Combatant> temp = combatants;
        std::sort(temp.begin(), temp.end(), 
                  [](const Combatant& a, const Combatant& b) { return a.name < b.name; });
        
        for (const auto& c : temp) {
            std::cout << c.name << ": ❤️ " << c.health 
                      << " | ⚔️ " << c.damage 
                      << " | ⚡ " << c.speed << std::endl;
        }
    }
    
    void printLeaderboard() const {
        std::vector<Combatant> temp = combatants;
        std::sort(temp.begin(), temp.end(),
                  [](const Combatant& a, const Combatant& b) {
                      return a.health > b.health;
                  });
        
        std::cout << "\n=== ТАБЛИЦА ЗДОРОВЬЯ ===" << std::endl;
        for (size_t i = 0; i < std::min(temp.size(), size_t(3)); i++) {
            std::cout << i+1 << ". " << temp[i].name 
                      << " - " << temp[i].health << " HP" << std::endl;
        }
    }
};

int main() {
    Arena arena;
    
    arena.addCombatant({"Каэлен", 120, 25, 15});
    arena.addCombatant({"Ария", 80, 35, 18});
    arena.addCombatant({"Торн", 150, 20, 10});
    arena.addCombatant({"Луна", 90, 30, 16});
    arena.addCombatant({"Зейн", 100, 28, 14});
    arena.addCombatant({"Мира", 110, 22, 12});
    
    arena.fight();
    arena.printLeaderboard();
    
    return 0;
}
```

---

## Часть 9: Лямбда-выражения — глубокое погружение

Лямбды необходимы для алгоритмов STL:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // Базовое лямбда-выражение
    auto print = [](int n) { std::cout << n << " "; };
    std::for_each(numbers.begin(), numbers.end(), print);
    
    // Захват по значению
    int multiplier = 2;
    auto multiply = [multiplier](int n) { return n * multiplier; };
    
    std::vector<int> doubled;
    std::transform(numbers.begin(), numbers.end(), 
                   std::back_inserter(doubled), multiply);
    
    // Захват по ссылке
    int sum = 0;
    std::for_each(numbers.begin(), numbers.end(), 
                  [&sum](int n) { sum += n; });
    
    // Изменяемое лямбда-выражение (может изменять захваченные значения)
    int count = 0;
    auto counter = [count]() mutable { return ++count; };
    
    // Обобщённое лямбда-выражение (C++14)
    auto genericAdd = [](auto a, auto b) { return a + b; };
    
    // Захват всего
    int x = 10, y = 20;
    auto byValue = [=]() { return x + y; };      // Копия всего
    auto byRef = [&]() { x++; y++; };             // Ссылка на всё
    
    // Вывод типа возврата
    auto divide = [](double a, double b) -> double {
        if (b == 0) return 0;
        return a / b;
    };
    
    return 0;
}
```

---

## Шпаргалка

```cpp
// Немодифицирующие
find(beg, end, val)           // Поиск первого вхождения
find_if(beg, end, pred)       // Поиск по предикату
count(beg, end, val)          // Подсчёт вхождений
count_if(beg, end, pred)      // Подсчёт по предикату
all_of(beg, end, pred)        // Проверка, что все соответствуют
any_of(beg, end, pred)        // Проверка, что хотя бы один соответствует
none_of(beg, end, pred)       // Проверка, что ни один не соответствует
equal(beg1, end1, beg2)       // Проверка на равенство диапазонов
search(beg1, end1, beg2, end2) // Поиск поддиапазона

// Модифицирующие
copy(beg, end, dest)          // Копирование элементов
copy_if(beg, end, dest, pred) // Копирование по условию
transform(beg, end, dest, op) // Преобразование
fill(beg, end, val)           // Заполнение значением
replace(beg, end, old, new)   // Замена значения
replace_if(beg, end, pred, new) // Замена по условию
remove(beg, end, val)         // Удаление значения (требуется erase)
reverse(beg, end)             // Реверсирование порядка
rotate(beg, mid, end)         // Вращение элементов
swap(a, b)                    // Обмен двух значений

// Сортировка
sort(beg, end)                // Сортировка по возрастанию
sort(beg, end, comp)          // Сортировка с компаратором
stable_sort(beg, end)         // Стабильная сортировка
partial_sort(beg, mid, end)   // Частичная сортировка
nth_element(beg, nth, end)    // Разделение по n-му элементу
is_sorted(beg, end)           // Проверка на отсортированность

// Бинарный поиск (требует отсортированного диапазона)
binary_search(beg, end, val)  // Проверка существования
lower_bound(beg, end, val)    // Первая позиция >= val
upper_bound(beg, end, val)    // Первая позиция > val
equal_range(beg, end, val)    // Обе границы

// Операции с множествами (требуют отсортированных диапазонов)
set_union(beg1, end1, beg2, end2, dest)
set_intersection(beg1, end1, beg2, end2, dest)
set_difference(beg1, end1, beg2, end2, dest)

// Min/Max
min(a, b)                     // Меньшее значение
max(a, b)                     // Большее значение
minmax(a, b)                  // Пара (min, max)
min_element(beg, end)         // Итератор на минимум
max_element(beg, end)         // Итератор на максимум
clamp(val, low, high)         // Ограничение значения диапазоном (C++17)

// Числовые (требуется <numeric>)
accumulate(beg, end, init)    // Сумма или свёртка
inner_product(beg1, end1, beg2, init) // Скалярное произведение
partial_sum(beg, end, dest)   // Частичные суммы
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Используйте `std::sort` и `std::unique` для удаления дубликатов из вектора.

**Упражнение 2 (Среднее):** Создайте функцию, которая принимает два вектора и возвращает их пересечение с использованием `std::set_intersection`.

**Упражнение 3 (Среднее):** Используйте `std::transform` для преобразования вектора температур по Цельсию в Фаренгейты.

**Упражнение 4 (Сложное):** Реализуйте функцию "Поиск и подсветка" для текстового документа. Используйте `std::search` для поиска всех вхождений слова и `std::replace` для их обёртки в разметку.

**Упражнение 5 (Сложное):** Создайте "Калькулятор статистики" с использованием `std::accumulate`, `std::minmax_element`, `std::sort`, `std::nth_element` (для медианы). Вычисляйте среднее, медиану, моду, минимум, максимум.

**Упражнение 6 (Вызов):** Создайте "Нечёткий поиск" для инвентаря. Используйте `std::find_if` с лямбдой, которая проверяет, содержит ли имя предмета строку поиска (без учёта регистра с использованием `std::tolower` и `std::search`).

---

## Резюме

Теперь вы знаете:

✅ Немодифицирующие алгоритмы (find, count, search)  
✅ Модифицирующие алгоритмы (copy, transform, replace)  
✅ Сортировку и упорядочивание (sort, stable_sort, partial_sort)  
✅ Алгоритмы множеств (union, intersection, difference)  
✅ Бинарный поиск на отсортированных диапазонах  
✅ Операции разделения  
✅ Лямбда-выражения для пользовательской логики  
✅ Полную систему арены  

## Что дальше?

Следующий урок: **Умные указатели и RAII** — глубокое погружение в `unique_ptr`, `shared_ptr`, `weak_ptr` и управление ресурсами!

---

## Ресурсы

- [Алгоритмы STL (cppreference)](https://en.cppreference.com/w/cpp/algorithm)
- [Документация заголовка algorithm](https://en.cppreference.com/w/cpp/header/algorithm)
- [Лямбда-выражения](https://en.cppreference.com/w/cpp/language/lambda)

---

**Практическое задание:** Создайте "Анализатор повторов" для игры. Прочитайте лог-файл с событиями (убийство, смерть, подбор предмета, повышение уровня). Используйте алгоритмы STL для:
- Поиска самой длинной серии убийств игрока
- Подсчёта убийств по типам оружия
- Поиска самой частой причины смерти
- Расчёта среднего времени между событиями
- Создания сводного отчёта