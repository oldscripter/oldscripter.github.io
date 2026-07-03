---
title: "Продвинутые строки — манипуляция текстом и парсинг"
description: "Освойте операции со строками для чат-систем, деревьев диалогов, парсинга текста и многого другого"
pubDate: 2026-05-12
tags: ["C++", "intermediate", "strings", "text-processing", "parsing"]
lang: "ru"
lessonNumber: 202
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Урок 12: Продвинутые строки — манипуляция текстом и парсинг

Добро пожаловать обратно! Вы уже использовали `std::string` для базового текста. Теперь пришло время освоить его — поиск, замена, разбиение, форматирование и создание сложных текстовых систем для игр.

## Что вы изучите

- Поиск в строках (`find`, `rfind`, `find_first_of`)
- Подстроки (`substr`)
- Модификация строк (`replace`, `insert`, `erase`, `append`)
- Преобразование строк (числа ↔ текст)
- Строковые потоки (`std::stringstream`)
- Строковые обёртки (`std::string_view` для производительности)
- Создание системы диалогов

---

## Часть 1: Поиск в строках

### Поиск подстрок с помощью `find()`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string dialogue = "Дракон дышит огнём! Беги!";
    
    // Поиск первого вхождения
    size_t pos = dialogue.find("дракон");
    if (pos != std::string::npos) {
        std::cout << "Найдено 'дракон' на позиции: " << pos << std::endl;
    }
    
    // Поиск символа
    pos = dialogue.find('!');
    std::cout << "Первый '!' на позиции: " << pos << std::endl;
    
    // Поиск с определённой позиции
    pos = dialogue.find('!', pos + 1);
    std::cout << "Второй '!' на позиции: " << pos << std::endl;
    
    // Поиск последнего вхождения
    pos = dialogue.rfind("огнём");
    std::cout << "Последний 'огнём' на позиции: " << pos << std::endl;
    
    // Проверка, содержит ли строка слово
    if (dialogue.find("дракон") != std::string::npos) {
        std::cout << "Упоминание дракона!" << std::endl;
    }
    
    return 0;
}
```

### Поиск любого символа

```cpp
#include <iostream>
#include <string>

int main() {
    std::string input = "Привет, Мир! Как дела?";
    
    // Поиск первой гласной
    size_t pos = input.find_first_of("аеёиоуыэюяАЕЁИОУЫЭЮЯ");
    std::cout << "Первая гласная на позиции: " << pos << " (" << input[pos] << ")" << std::endl;
    
    // Поиск первого знака препинания
    pos = input.find_first_of(".,!?;:");
    std::cout << "Первый знак препинания: " << input[pos] << std::endl;
    
    // Поиск первой не-буквы
    pos = input.find_first_not_of("абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ");
    std::cout << "Первый не-буквенный символ: '" << input[pos] << "' на позиции " << pos << std::endl;
    
    // Поиск последней цифры
    std::string code = "abc123def456";
    pos = code.find_last_of("0123456789");
    std::cout << "Последняя цифра: " << code[pos] << std::endl;
    
    return 0;
}
```

---

## Часть 2: Извлечение подстрок

```cpp
#include <iostream>
#include <string>

int main() {
    std::string message = "Игрок Каэлен нашёл Меч!";
    
    // Извлечение с позиции 7, длина 6
    std::string name = message.substr(7, 6);
    std::cout << "Имя: " << name << std::endl;
    
    // Извлечение с позиции до конца
    std::string action = message.substr(14);
    std::cout << "Действие: " << action << std::endl;
    
    // Практический пример: парсинг формата "КЛЮЧ:ЗНАЧЕНИЕ"
    std::string data = "ЗДОРОВЬЕ:100";
    size_t colonPos = data.find(':');
    
    if (colonPos != std::string::npos) {
        std::string key = data.substr(0, colonPos);
        std::string value = data.substr(colonPos + 1);
        std::cout << "Ключ: " << key << ", Значение: " << value << std::endl;
    }
    
    // Получение расширения файла
    std::string filename = "savegame.sav";
    size_t dotPos = filename.find('.');
    if (dotPos != std::string::npos) {
        std::string ext = filename.substr(dotPos + 1);
        std::cout << "Расширение: " << ext << std::endl;
    }
    
    return 0;
}
```

---

## Часть 3: Модификация строк

```cpp
#include <iostream>
#include <string>

int main() {
    std::string text = "Привет Мир";
    
    // Добавление в конец
    text.append(" из C++");
    std::cout << text << std::endl;
    
    // Вставка в позицию
    text.insert(6, ",");
    std::cout << text << std::endl;
    
    // Замена
    text.replace(8, 3, "Вселенная");
    std::cout << text << std::endl;
    
    // Удаление
    text.erase(0, 7);  // Удаление "Привет,"
    std::cout << text << std::endl;
    
    // Очистка всей строки
    text.clear();
    std::cout << "Пусто? " << (text.empty() ? "Да" : "Нет") << std::endl;
    
    return 0;
}
```

### Реальный пример: Фильтр сообщений чата

```cpp
#include <iostream>
#include <string>
#include <vector>

std::string filterBadWords(const std::string& message, const std::vector<std::string>& badWords) {
    std::string filtered = message;
    
    for (const std::string& word : badWords) {
        size_t pos = 0;
        while ((pos = filtered.find(word, pos)) != std::string::npos) {
            // Замена на звёздочки
            filtered.replace(pos, word.length(), std::string(word.length(), '*'));
            pos += word.length();
        }
    }
    
    return filtered;
}

int main() {
    std::vector<std::string> badWords = {"тупой", "глупый", "идиот"};
    
    std::string chat = "Это тупая и глупая идея, идиот!";
    std::string filtered = filterBadWords(chat, badWords);
    
    std::cout << "Оригинал: " << chat << std::endl;
    std::cout << "Отфильтровано: " << filtered << std::endl;
    
    return 0;
}
```

---

## Часть 4: Преобразование строк в числа (и обратно)

```cpp
#include <iostream>
#include <string>

int main() {
    // Строка в int
    std::string intStr = "123";
    int value = std::stoi(intStr);
    std::cout << "Int: " << value << std::endl;
    
    // Строка в float
    std::string floatStr = "3.14159";
    float pi = std::stof(floatStr);
    std::cout << "Float: " << pi << std::endl;
    
    // Строка в double
    std::string doubleStr = "2.71828";
    double e = std::stod(doubleStr);
    std::cout << "Double: " << e << std::endl;
    
    // Строка в long
    std::string longStr = "1000000";
    long bigNum = std::stol(longStr);
    
    // Число в строку
    int health = 100;
    std::string healthStr = std::to_string(health);
    std::cout << "Строка: " << healthStr << std::endl;
    
    // Шестнадцатеричное преобразование
    std::string hexStr = "FF";
    int hexValue = std::stoi(hexStr, nullptr, 16);
    std::cout << "Hex FF = " << hexValue << std::endl;
    
    return 0;
}
```

### Безопасное преобразование с обработкой ошибок

```cpp
#include <iostream>
#include <string>

bool safeStringToInt(const std::string& str, int& result) {
    try {
        result = std::stoi(str);
        return true;
    } catch (const std::invalid_argument& e) {
        std::cerr << "Неверный формат числа: " << str << std::endl;
        return false;
    } catch (const std::out_of_range& e) {
        std::cerr << "Число вне диапазона: " << str << std::endl;
        return false;
    }
}

int main() {
    int value;
    
    if (safeStringToInt("123", value)) {
        std::cout << "Преобразовано: " << value << std::endl;
    }
    
    if (!safeStringToInt("abc", value)) {
        std::cout << "Не удалось преобразовать 'abc'" << std::endl;
    }
    
    return 0;
}
```

---

## Часть 5: Строковые потоки (`std::stringstream`)

Мощный инструмент для парсинга сложных текстовых форматов.

```cpp
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    // Парсинг значений, разделённых пробелами
    std::string data = "Каэлен 100 50 15.5";
    std::stringstream ss(data);
    
    std::string name;
    int health;
    int mana;
    float experience;
    
    ss >> name >> health >> mana >> experience;
    
    std::cout << "Имя: " << name << std::endl;
    std::cout << "Здоровье: " << health << std::endl;
    std::cout << "Мана: " << mana << std::endl;
    std::cout << "Опыт: " << experience << std::endl;
    
    // Парсинг значений, разделённых запятыми (CSV)
    std::string csv = "Меч,100,5.5,Оружие";
    std::stringstream csvStream(csv);
    std::string token;
    
    std::vector<std::string> tokens;
    while (std::getline(csvStream, token, ',')) {
        tokens.push_back(token);
    }
    
    std::cout << "\nCSV Токены:" << std::endl;
    for (const auto& t : tokens) {
        std::cout << "  " << t << std::endl;
    }
    
    // Сборка строк с помощью stringstream (эффективно)
    std::stringstream builder;
    builder << "Игрок " << name << " имеет " << health << " HP";
    std::string message = builder.str();
    std::cout << "\n" << message << std::endl;
    
    return 0;
}
```

### Парсинг файлов сохранения игр

```cpp
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <map>

struct SaveData {
    std::string playerName;
    int level;
    int health;
    int gold;
    std::vector<std::string> inventory;
};

SaveData parseSaveFile(const std::string& content) {
    SaveData data;
    std::stringstream ss(content);
    std::string line;
    
    while (std::getline(ss, line)) {
        std::stringstream lineStream(line);
        std::string key;
        std::string value;
        
        if (std::getline(lineStream, key, '=') && std::getline(lineStream, value)) {
            if (key == "player_name") {
                data.playerName = value;
            } else if (key == "level") {
                data.level = std::stoi(value);
            } else if (key == "health") {
                data.health = std::stoi(value);
            } else if (key == "gold") {
                data.gold = std::stoi(value);
            } else if (key == "inventory") {
                std::stringstream items(value);
                std::string item;
                while (std::getline(items, item, ',')) {
                    data.inventory.push_back(item);
                }
            }
        }
    }
    
    return data;
}

int main() {
    std::string saveContent = 
        "player_name=Каэлен\n"
        "level=5\n"
        "health=100\n"
        "gold=500\n"
        "inventory=Меч,Щит,Зелье здоровья\n";
    
    SaveData data = parseSaveFile(saveContent);
    
    std::cout << "=== РАЗОБРАННЫЕ ДАННЫЕ СОХРАНЕНИЯ ===" << std::endl;
    std::cout << "Имя: " << data.playerName << std::endl;
    std::cout << "Уровень: " << data.level << std::endl;
    std::cout << "Здоровье: " << data.health << std::endl;
    std::cout << "Золото: " << data.gold << std::endl;
    std::cout << "Инвентарь: ";
    for (const auto& item : data.inventory) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

---

## Часть 6: Строковые обёртки (`std::string_view`) — Производительность

`std::string_view` — это лёгкая, невладеющая ссылка на строку. Используйте её, чтобы избежать копирования.

```cpp
#include <iostream>
#include <string>
#include <string_view>

// ❌ Копирует строку каждый раз
void processByValue(std::string s) {
    // Копирует всю строку
}

// ✅ Без копирования, просто просматривает строку
void processByView(std::string_view sv) {
    // Только чтение, без копирования
}

int main() {
    std::string longString = "Это очень длинная строка, которую мы не хотим копировать";
    
    // Создание string_view
    std::string_view view = longString;
    
    // Подстрока без копирования
    std::string_view firstWord = view.substr(0, 4);  // "Это"
    
    // Поиск без копирования
    size_t pos = view.find("длинная");
    
    // Полезно для парсинга
    std::string_view data = "яблоко,банан,апельсин";
    size_t comma = data.find(',');
    std::string_view first = data.substr(0, comma);
    
    std::cout << "Первый фрукт: " << first << std::endl;
    
    // Преобразование обратно в строку при необходимости
    std::string copy = std::string(first);
    
    return 0;
}
```

### Сравнение производительности

```cpp
#include <iostream>
#include <string>
#include <string_view>
#include <chrono>

// Функция, которая копирует строку
void takesString(std::string s) {
    volatile size_t len = s.length();  // Предотвращение оптимизации
}

// Функция, которая просматривает строку
void takesStringView(std::string_view sv) {
    volatile size_t len = sv.length();
}

int main() {
    std::string bigString(10000, 'X');  // 10 000 символов
    
    // Измерение копирования
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 100000; i++) {
        takesString(bigString);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto copyTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Измерение просмотра
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 100000; i++) {
        takesStringView(bigString);
    }
    end = std::chrono::high_resolution_clock::now();
    auto viewTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Передача по значению (копия): " << copyTime.count() << "мс" << std::endl;
    std::cout << "Передача по string_view: " << viewTime.count() << "мс" << std::endl;
    std::cout << "string_view в " << (float)copyTime.count() / viewTime.count() << "x быстрее!" << std::endl;
    
    return 0;
}
```

---

## Полный пример: RPG система диалогов

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <cctype>

// Структура узла диалога
struct DialogueNode {
    int id;
    std::string speaker;
    std::string text;
    std::map<int, std::string> options;  // выбор -> ID следующего узла
};

// Класс системы диалогов
class DialogueSystem {
private:
    std::map<int, DialogueNode> nodes;
    int currentNodeId;
    std::string playerName;
    
    // Вспомогательная функция: замена переменных в тексте
    std::string replaceVariables(const std::string& text) {
        std::string result = text;
        
        // Замена {player} на имя игрока
        size_t pos = result.find("{player}");
        while (pos != std::string::npos) {
            result.replace(pos, 7, playerName);
            pos = result.find("{player}", pos + playerName.length());
        }
        
        return result;
    }
    
    // Вспомогательная функция: перенос текста для отображения
    void displayText(const std::string& text, int lineWidth = 60) {
        std::string wrapped;
        size_t start = 0;
        
        while (start < text.length()) {
            if (start + lineWidth >= text.length()) {
                std::cout << text.substr(start) << std::endl;
                break;
            }
            
            // Поиск последнего пробела в пределах lineWidth
            size_t end = text.rfind(' ', start + lineWidth);
            if (end == std::string::npos || end <= start) {
                end = start + lineWidth;
            }
            
            std::cout << text.substr(start, end - start) << std::endl;
            start = end + 1;
        }
    }
    
public:
    DialogueSystem(const std::string& player) : playerName(player), currentNodeId(0) {}
    
    void addNode(int id, const std::string& speaker, const std::string& text) {
        nodes[id] = {id, speaker, text, {}};
    }
    
    void addOption(int nodeId, int nextId, const std::string& optionText) {
        if (nodes.find(nodeId) != nodes.end()) {
            nodes[nodeId].options[nextId] = optionText;
        }
    }
    
    void start(int startNodeId) {
        currentNodeId = startNodeId;
    }
    
    bool update() {
        if (nodes.find(currentNodeId) == nodes.end()) {
            return false;
        }
        
        DialogueNode& current = nodes[currentNodeId];
        
        // Отображение говорящего и текста
        std::cout << "\n[" << current.speaker << "] ";
        std::string displayText = replaceVariables(current.text);
        displayText(displayText);
        
        // Если нет вариантов, диалог заканчивается
        if (current.options.empty()) {
            std::cout << "\n[Нажмите Enter для продолжения]";
            std::cin.ignore();
            std::cin.get();
            return false;
        }
        
        // Отображение вариантов
        std::cout << "\nЧто вы скажете?" << std::endl;
        int optionNum = 1;
        std::map<int, int> choiceToNode;
        
        for (const auto& [nextId, optionText] : current.options) {
            std::cout << "  " << optionNum << ". " << optionText << std::endl;
            choiceToNode[optionNum] = nextId;
            optionNum++;
        }
        
        // Получение выбора игрока
        int choice;
        std::cout << "\nВыбор: ";
        std::cin >> choice;
        
        while (choiceToNode.find(choice) == choiceToNode.end()) {
            std::cout << "Неверный выбор. Попробуйте снова: ";
            std::cin >> choice;
        }
        
        currentNodeId = choiceToNode[choice];
        return true;
    }
};

int main() {
    DialogueSystem dialogue("Каэлен");
    
    // Построение дерева диалогов
    // Узел 0: Начало
    dialogue.addNode(0, "Стражник", "Стой! Кто идёт? Назови себя, {player}!");
    
    dialogue.addOption(0, 1, "Я путешественник, ищу короля.");
    dialogue.addOption(0, 2, "Не твоё дело, крестьянин!");
    dialogue.addOption(0, 3, "*Молча показывает королевскую печать*");
    
    // Узел 1: Дружественный путь
    dialogue.addNode(1, "Стражник", "А, путешественник! Король ждёт вас. Направляйтесь прямо в замок.");
    dialogue.addOption(1, 4, "Благодарю, добрый господин.");
    
    // Узел 2: Агрессивный путь
    dialogue.addNode(2, "Стражник", "Наглый глупец! Стража, арестовать этого бродягу!");
    dialogue.addOption(2, 5, "Подождите! Я сдаюсь!");
    dialogue.addOption(2, 6, "Живым я не сдамся!");
    
    // Узел 3: Путь с королевской печатью
    dialogue.addNode(3, "Стражник", "*Вздыхает* Простите, мой господин! Проходите в замок немедленно.");
    dialogue.addOption(3, 4, "Ты прощён. Продолжай службу.");
    
    // Узел 4: Конец (хороший)
    dialogue.addNode(4, "Рассказчик", "Вы входите в замок и встречаете короля. Ваше приключение начинается!");
    
    // Узел 5: Конец с пленением
    dialogue.addNode(5, "Стражник", "Отведите его в подземелье! Ваше путешествие заканчивается здесь.");
    
    // Узел 6: Конец с боем
    dialogue.addNode(6, "Рассказчик", "Вы обнажаете меч, но дюжина стражников одолевает вас. Игра окончена.");
    
    // Запуск диалога
    std::cout << "=== ДИАЛОГ В РОЛЕВОЙ ИГРЕ ===" << std::endl;
    dialogue.start(0);
    
    while (dialogue.update()) {
        // Продолжение
    }
    
    return 0;
}
```

---

## Частые ошибки

### 1. Использование `find` без проверки `npos`

```cpp
std::string s = "Привет";
int pos = s.find("xyz");

// ❌ Неправильно — pos может быть -1 (npos)
if (pos >= 0) { }

// ✅ Правильно
if (pos != std::string::npos) { }
```

### 2. `string_view` переживает исходную строку

```cpp
// ❌ ОПАСНО — string_view переживает строку
std::string_view getWord() {
    std::string temp = "привет";
    return std::string_view(temp);  // temp уничтожается!
}

// ✅ Безопасно — возвращаем строку, не обёртку
std::string getWord() {
    std::string temp = "привет";
    return temp;
}
```

### 3. Использование `substr` когда подошёл бы `string_view`

```cpp
// ❌ Копирует подстроку
std::string token = fullString.substr(start, length);

// ✅ Просматривает без копирования (только чтение)
std::string_view token = std::string_view(fullString).substr(start, length);
```

### 4. Забытый `#include <sstream>`

```cpp
std::stringstream ss;  // ОШИБКА без #include <sstream>
```

---

## Шпаргалка

```cpp
#include <string>
#include <sstream>
#include <string_view>

// Поиск
size_t pos = s.find(sub);           // Первое вхождение
size_t pos = s.rfind(sub);          // Последнее вхождение
size_t pos = s.find_first_of(chars); // Первый из указанных символов
bool found = (pos != std::string::npos);

// Подстроки
std::string sub = s.substr(pos);       // С позиции до конца
std::string sub = s.substr(pos, len);  // С позиции, len символов

// Модификация
s += "текст";                        // Добавление в конец
s.append("текст");                   // Добавление в конец
s.insert(pos, "текст");              // Вставка
s.replace(pos, len, "новый");         // Замена
s.erase(pos, len);                   // Удаление
s.clear();                           // Очистка всего

// Преобразование
int i = std::stoi("123");           // Строка в int
float f = std::stof("3.14");        // Строка в float
std::string s = std::to_string(123); // Число в строку

// Строковый поток
std::stringstream ss("a b c");
std::string token;
ss >> token;                        // Извлечение слова
std::getline(ss, line);             // Получение строки
std::getline(ss, token, ',');       // Парсинг CSV

// Строковая обёртка (C++17)
std::string_view sv = str;          // Невладеющий просмотр
sv.remove_prefix(1);                // Удаление первого символа
sv.remove_suffix(1);                // Удаление последнего символа
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Напишите функцию, которая подсчитывает гласные, согласные, цифры и знаки препинания в строке.

**Упражнение 2 (Среднее):** Создайте "Текстовый шифратор", который сдвигает каждую букву на ключ (шифр Цезаря). Обрабатывайте как заглавные, так и строчные буквы, с переходом z→a.

**Упражнение 3 (Среднее):** Разберите формат лог-файла, например `[2024-01-15 10:30:45] [INFO] Игрок присоединился` — извлеките временную метку, уровень и сообщение.

**Упражнение 4 (Сложное):** Создайте "Парсер команд" для текстового квеста. Разбирайте команды типа "взять меч", "идти на север", "использовать ключ на двери". Извлекайте глагол, существительное и опциональный объект.

**Упражнение 5 (Сложное):** Создайте "Строковый калькулятор", который вычисляет выражения типа "5 + 3 * 2" с учётом приоритета операторов.

**Упражнение 6 (Вызов):** Реализуйте "Простой шаблонный движок", который заменяет плейсхолдеры `{переменная}` в тексте, используя словарь значений.

---

## Резюме

Теперь вы знаете:

✅ Поиск в строках (`find`, `rfind`, `find_first_of`)  
✅ Извлечение подстрок (`substr`)  
✅ Модификация строк (`replace`, `insert`, `erase`)  
✅ Преобразование строк ↔ числа  
✅ Строковые потоки для парсинга  
✅ Строковые обёртки для производительности  
✅ Полную систему RPG диалогов  

## Что дальше?

Следующий урок: **Обработка исключений** — корректная обработка ошибок (файл не найден, неверный ввод, нехватка памяти) без падений!

---

## Ресурсы

- [std::string (cppreference)](https://en.cppreference.com/w/cpp/string/basic_string)
- [std::stringstream (cppreference)](https://en.cppreference.com/w/cpp/io/basic_stringstream)
- [std::string_view (cppreference)](https://en.cppreference.com/w/cpp/string/basic_string_view)

---

**Практическое задание:** Создайте "Систему команд чата" для многопользовательской игры. Команды типа `/heal`, `/give sword`, `/teleport 100 200`. Разбирайте команды, проверяйте аргументы, выполняйте действия и выдавайте полезные сообщения об ошибках для неверных команд.