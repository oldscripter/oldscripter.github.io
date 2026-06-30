---
title: "Advanced Strings — Text Manipulation and Parsing"
description: "Master string operations for chat systems, dialogue trees, text parsing, and more"
pubDate: 2026-05-12
tags: ["C++", "intermediate", "strings", "text-processing", "parsing"]
lang: "ru"
lessonNumber: 12
subcategory: "intermediate"
author: "Stanislav Talanov"
---

# Lesson 12: Advanced Strings — Text Manipulation and Parsing

Welcome back! You've been using `std::string` for basic text. Now it's time to master it — searching, replacing, splitting, formatting, and building complex text systems for games.

## What You'll Learn

- String searching (`find`, `rfind`, `find_first_of`)
- Substrings (`substr`)
- Modifying strings (`replace`, `insert`, `erase`, `append`)
- String conversion (numbers ↔ text)
- String streams (`std::stringstream`)
- String views (`std::string_view` for performance)
- Building a dialogue system

---

## Part 1: String Searching

### Finding Substrings with `find()`

```cpp
#include <iostream>
#include <string>

int main() {
    std::string dialogue = "The dragon breathes fire! Run!";
    
    // Find first occurrence
    size_t pos = dialogue.find("dragon");
    if (pos != std::string::npos) {
        std::cout << "Found 'dragon' at position: " << pos << std::endl;
    }
    
    // Find character
    pos = dialogue.find('!');
    std::cout << "First '!' at position: " << pos << std::endl;
    
    // Find from specific position
    pos = dialogue.find('!', pos + 1);
    std::cout << "Second '!' at position: " << pos << std::endl;
    
    // Find last occurrence
    pos = dialogue.rfind("fire");
    std::cout << "Last 'fire' at position: " << pos << std::endl;
    
    // Check if string contains a word
    if (dialogue.find("dragon") != std::string::npos) {
        std::cout << "Dragon mentioned!" << std::endl;
    }
    
    return 0;
}
```

### Finding Any Character

```cpp
#include <iostream>
#include <string>

int main() {
    std::string input = "Hello, World! How are you?";
    
    // Find first vowel
    size_t pos = input.find_first_of("aeiouAEIOU");
    std::cout << "First vowel at: " << pos << " (" << input[pos] << ")" << std::endl;
    
    // Find first punctuation
    pos = input.find_first_of(".,!?;:");
    std::cout << "First punctuation: " << input[pos] << std::endl;
    
    // Find first non-letter
    pos = input.find_first_not_of("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    std::cout << "First non-letter: '" << input[pos] << "' at " << pos << std::endl;
    
    // Find last digit
    std::string code = "abc123def456";
    pos = code.find_last_of("0123456789");
    std::cout << "Last digit: " << code[pos] << std::endl;
    
    return 0;
}
```

---

## Part 2: Extracting Substrings

```cpp
#include <iostream>
#include <string>

int main() {
    std::string message = "Player Kaelen found a Sword!";
    
    // Extract from position 7, length 6
    std::string name = message.substr(7, 6);
    std::cout << "Name: " << name << std::endl;
    
    // Extract from position to end
    std::string action = message.substr(14);
    std::cout << "Action: " << action << std::endl;
    
    // Practical: parse "KEY:VALUE" format
    std::string data = "HEALTH:100";
    size_t colonPos = data.find(':');
    
    if (colonPos != std::string::npos) {
        std::string key = data.substr(0, colonPos);
        std::string value = data.substr(colonPos + 1);
        std::cout << "Key: " << key << ", Value: " << value << std::endl;
    }
    
    // Get file extension
    std::string filename = "savegame.sav";
    size_t dotPos = filename.find('.');
    if (dotPos != std::string::npos) {
        std::string ext = filename.substr(dotPos + 1);
        std::cout << "Extension: " << ext << std::endl;
    }
    
    return 0;
}
```

---

## Part 3: Modifying Strings

```cpp
#include <iostream>
#include <string>

int main() {
    std::string text = "Hello World";
    
    // Append
    text.append(" from C++");
    std::cout << text << std::endl;
    
    // Insert at position
    text.insert(5, ",");
    std::cout << text << std::endl;
    
    // Replace
    text.replace(7, 5, "Universe");
    std::cout << text << std::endl;
    
    // Erase
    text.erase(0, 6);  // Remove "Hello,"
    std::cout << text << std::endl;
    
    // Clear entire string
    text.clear();
    std::cout << "Empty? " << (text.empty() ? "Yes" : "No") << std::endl;
    
    return 0;
}
```

### Real Example: Chat Message Filter

```cpp
#include <iostream>
#include <string>
#include <vector>

std::string filterBadWords(const std::string& message, const std::vector<std::string>& badWords) {
    std::string filtered = message;
    
    for (const std::string& word : badWords) {
        size_t pos = 0;
        while ((pos = filtered.find(word, pos)) != std::string::npos) {
            // Replace with asterisks
            filtered.replace(pos, word.length(), std::string(word.length(), '*'));
            pos += word.length();
        }
    }
    
    return filtered;
}

int main() {
    std::vector<std::string> badWords = {"stupid", "dumb", "idiot"};
    
    std::string chat = "That's a stupid and dumb idea, you idiot!";
    std::string filtered = filterBadWords(chat, badWords);
    
    std::cout << "Original: " << chat << std::endl;
    std::cout << "Filtered: " << filtered << std::endl;
    
    return 0;
}
```

---

## Part 4: String to Number Conversion (and back)

```cpp
#include <iostream>
#include <string>

int main() {
    // String to int
    std::string intStr = "123";
    int value = std::stoi(intStr);
    std::cout << "Int: " << value << std::endl;
    
    // String to float
    std::string floatStr = "3.14159";
    float pi = std::stof(floatStr);
    std::cout << "Float: " << pi << std::endl;
    
    // String to double
    std::string doubleStr = "2.71828";
    double e = std::stod(doubleStr);
    std::cout << "Double: " << e << std::endl;
    
    // String to long
    std::string longStr = "1000000";
    long bigNum = std::stol(longStr);
    
    // Number to string
    int health = 100;
    std::string healthStr = std::to_string(health);
    std::cout << "String: " << healthStr << std::endl;
    
    // Hex conversion
    std::string hexStr = "FF";
    int hexValue = std::stoi(hexStr, nullptr, 16);
    std::cout << "Hex FF = " << hexValue << std::endl;
    
    return 0;
}
```

### Safe Conversion with Error Handling

```cpp
#include <iostream>
#include <string>

bool safeStringToInt(const std::string& str, int& result) {
    try {
        result = std::stoi(str);
        return true;
    } catch (const std::invalid_argument& e) {
        std::cerr << "Invalid number format: " << str << std::endl;
        return false;
    } catch (const std::out_of_range& e) {
        std::cerr << "Number out of range: " << str << std::endl;
        return false;
    }
}

int main() {
    int value;
    
    if (safeStringToInt("123", value)) {
        std::cout << "Converted: " << value << std::endl;
    }
    
    if (!safeStringToInt("abc", value)) {
        std::cout << "Failed to convert 'abc'" << std::endl;
    }
    
    return 0;
}
```

---

## Part 5: String Streams (`std::stringstream`)

Powerful tool for parsing complex text formats.

```cpp
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    // Parsing space-separated values
    std::string data = "Kaelen 100 50 15.5";
    std::stringstream ss(data);
    
    std::string name;
    int health;
    int mana;
    float experience;
    
    ss >> name >> health >> mana >> experience;
    
    std::cout << "Name: " << name << std::endl;
    std::cout << "Health: " << health << std::endl;
    std::cout << "Mana: " << mana << std::endl;
    std::cout << "XP: " << experience << std::endl;
    
    // Parsing comma-separated values (CSV)
    std::string csv = "Sword,100,5.5,Weapon";
    std::stringstream csvStream(csv);
    std::string token;
    
    std::vector<std::string> tokens;
    while (std::getline(csvStream, token, ',')) {
        tokens.push_back(token);
    }
    
    std::cout << "\nCSV Tokens:" << std::endl;
    for (const auto& t : tokens) {
        std::cout << "  " << t << std::endl;
    }
    
    // Building strings with stringstream (efficient)
    std::stringstream builder;
    builder << "Player " << name << " has " << health << " HP";
    std::string message = builder.str();
    std::cout << "\n" << message << std::endl;
    
    return 0;
}
```

### Parsing Game Save Files

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
        "player_name=Kaelen\n"
        "level=5\n"
        "health=100\n"
        "gold=500\n"
        "inventory=Sword,Shield,Health Potion\n";
    
    SaveData data = parseSaveFile(saveContent);
    
    std::cout << "=== PARSED SAVE DATA ===" << std::endl;
    std::cout << "Name: " << data.playerName << std::endl;
    std::cout << "Level: " << data.level << std::endl;
    std::cout << "Health: " << data.health << std::endl;
    std::cout << "Gold: " << data.gold << std::endl;
    std::cout << "Inventory: ";
    for (const auto& item : data.inventory) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

---

## Part 6: String View (`std::string_view`) — Performance

`std::string_view` is a lightweight, non-owning reference to a string. Use it to avoid copying.

```cpp
#include <iostream>
#include <string>
#include <string_view>

// ❌ Copies string every time
void processByValue(std::string s) {
    // Copies the entire string
}

// ✅ No copy, just views the string
void processByView(std::string_view sv) {
    // Read-only access, no copying
}

int main() {
    std::string longString = "This is a very long string that we don't want to copy";
    
    // Creating string_view
    std::string_view view = longString;
    
    // Substring without copying
    std::string_view firstWord = view.substr(0, 4);  // "This"
    
    // Finding without copying
    size_t pos = view.find("long");
    
    // Useful for parsing
    std::string_view data = "apple,banana,orange";
    size_t comma = data.find(',');
    std::string_view first = data.substr(0, comma);
    
    std::cout << "First fruit: " << first << std::endl;
    
    // Convert back to string if needed
    std::string copy = std::string(first);
    
    return 0;
}
```

### Performance Comparison

```cpp
#include <iostream>
#include <string>
#include <string_view>
#include <chrono>

// Function that copies the string
void takesString(std::string s) {
    volatile size_t len = s.length();  // Prevent optimization
}

// Function that views the string
void takesStringView(std::string_view sv) {
    volatile size_t len = sv.length();
}

int main() {
    std::string bigString(10000, 'X');  // 10,000 characters
    
    // Measure copying
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 100000; i++) {
        takesString(bigString);
    }
    auto end = std::chrono::high_resolution_clock::now();
    auto copyTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Measure viewing
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 100000; i++) {
        takesStringView(bigString);
    }
    end = std::chrono::high_resolution_clock::now();
    auto viewTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Pass by value (copy): " << copyTime.count() << "ms" << std::endl;
    std::cout << "Pass by string_view: " << viewTime.count() << "ms" << std::endl;
    std::cout << "string_view is " << (float)copyTime.count() / viewTime.count() << "x faster!" << std::endl;
    
    return 0;
}
```

---

## Complete Example: RPG Dialogue System

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <cctype>

// Dialogue node structure
struct DialogueNode {
    int id;
    std::string speaker;
    std::string text;
    std::map<int, std::string> options;  // choice -> next node ID
};

// Dialogue system class
class DialogueSystem {
private:
    std::map<int, DialogueNode> nodes;
    int currentNodeId;
    std::string playerName;
    
    // Helper: replace variables in text
    std::string replaceVariables(const std::string& text) {
        std::string result = text;
        
        // Replace {player} with player name
        size_t pos = result.find("{player}");
        while (pos != std::string::npos) {
            result.replace(pos, 7, playerName);
            pos = result.find("{player}", pos + playerName.length());
        }
        
        return result;
    }
    
    // Helper: wrap text for display
    void displayText(const std::string& text, int lineWidth = 60) {
        std::string wrapped;
        size_t start = 0;
        
        while (start < text.length()) {
            if (start + lineWidth >= text.length()) {
                std::cout << text.substr(start) << std::endl;
                break;
            }
            
            // Find last space within lineWidth
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
        
        // Display speaker and text
        std::cout << "\n[" << current.speaker << "] ";
        std::string displayText = replaceVariables(current.text);
        displayText(displayText);
        
        // If no options, dialogue ends
        if (current.options.empty()) {
            std::cout << "\n[Press Enter to continue]";
            std::cin.ignore();
            std::cin.get();
            return false;
        }
        
        // Display options
        std::cout << "\nWhat do you say?" << std::endl;
        int optionNum = 1;
        std::map<int, int> choiceToNode;
        
        for (const auto& [nextId, optionText] : current.options) {
            std::cout << "  " << optionNum << ". " << optionText << std::endl;
            choiceToNode[optionNum] = nextId;
            optionNum++;
        }
        
        // Get player choice
        int choice;
        std::cout << "\nChoice: ";
        std::cin >> choice;
        
        while (choiceToNode.find(choice) == choiceToNode.end()) {
            std::cout << "Invalid choice. Try again: ";
            std::cin >> choice;
        }
        
        currentNodeId = choiceToNode[choice];
        return true;
    }
};

int main() {
    DialogueSystem dialogue("Kaelen");
    
    // Build dialogue tree
    // Node 0: Start
    dialogue.addNode(0, "Guard", "Halt! Who goes there? State your name, {player}!");
    
    dialogue.addOption(0, 1, "I'm a traveler seeking the king.");
    dialogue.addOption(0, 2, "None of your business, peasant!");
    dialogue.addOption(0, 3, "*Show royal seal silently*");
    
    // Node 1: Friendly path
    dialogue.addNode(1, "Guard", "Ah, a traveler! The king is expecting you. Head straight to the castle.");
    dialogue.addOption(1, 4, "Thank you, good sir.");
    
    // Node 2: Aggressive path
    dialogue.addNode(2, "Guard", "Insolent fool! Guards, arrest this vagrant!");
    dialogue.addOption(2, 5, "Wait! I surrender!");
    dialogue.addOption(2, 6, "You'll never take me alive!");
    
    // Node 3: Royal seal path
    dialogue.addNode(3, "Guard", "*Gasp* Forgive me, my lord! Please, enter the castle at once.");
    dialogue.addOption(3, 4, "You are forgiven. Carry on.");
    
    // Node 4: End (good)
    dialogue.addNode(4, "Narrator", "You enter the castle and meet the king. Your adventure begins!");
    
    // Node 5: Surrender ending
    dialogue.addNode(5, "Guard", "Take him to the dungeons! Your journey ends here.");
    
    // Node 6: Fight ending
    dialogue.addNode(6, "Narrator", "You draw your sword, but a dozen guards overwhelm you. Game Over.");
    
    // Run the dialogue
    std::cout << "=== ROLE-PLAYING DIALOGUE ===" << std::endl;
    dialogue.start(0);
    
    while (dialogue.update()) {
        // Continue
    }
    
    return 0;
}
```

---

## Common Mistakes

### 1. Using `find` Without Checking `npos`

```cpp
std::string s = "Hello";
int pos = s.find("xyz");

// ❌ Wrong — pos could be -1 (npos)
if (pos >= 0) { }

// ✅ Correct
if (pos != std::string::npos) { }
```

### 2. String_view Outliving Original String

```cpp
// ❌ DANGEROUS — string_view outlives the string
std::string_view getWord() {
    std::string temp = "hello";
    return std::string_view(temp);  // temp destroyed!
}

// ✅ Safe — return string, not view
std::string getWord() {
    std::string temp = "hello";
    return temp;
}
```

### 3. Using `substr` When `string_view` Would Do

```cpp
// ❌ Copies the substring
std::string token = fullString.substr(start, length);

// ✅ Views without copying (read-only)
std::string_view token = std::string_view(fullString).substr(start, length);
```

### 4. Forgetting `#include <sstream>`

```cpp
std::stringstream ss;  // ERROR without #include <sstream>
```

---

## Quick Reference Card

```cpp
#include <string>
#include <sstream>
#include <string_view>

// Searching
size_t pos = s.find(sub);           // First occurrence
size_t pos = s.rfind(sub);          // Last occurrence
size_t pos = s.find_first_of(chars); // First of any char
bool found = (pos != std::string::npos);

// Substrings
std::string sub = s.substr(pos);       // From pos to end
std::string sub = s.substr(pos, len);  // From pos, len chars

// Modifying
s += "text";                        // Append
s.append("text");                   // Append
s.insert(pos, "text");              // Insert
s.replace(pos, len, "new");         // Replace
s.erase(pos, len);                  // Erase
s.clear();                          // Clear all

// Conversion
int i = std::stoi("123");           // String to int
float f = std::stof("3.14");        // String to float
std::string s = std::to_string(123); // Number to string

// String stream
std::stringstream ss("a b c");
std::string token;
ss >> token;                        // Extract word
std::getline(ss, line);             // Get line
std::getline(ss, token, ',');       // CSV parsing

// String view (C++17)
std::string_view sv = str;          // Non-owning view
sv.remove_prefix(1);                // Remove first char
sv.remove_suffix(1);                // Remove last char
```

---

## Practice Exercises

**Exercise 1 (Easy):** Write a function that counts vowels, consonants, digits, and punctuation in a string.

**Exercise 2 (Medium):** Create a "Text Encryptor" that shifts each letter by a key (Caesar cipher). Handle both uppercase and lowercase, wrap around z→a.

**Exercise 3 (Medium):** Parse a log file format like `[2024-01-15 10:30:45] [INFO] Player joined` — extract timestamp, level, and message.

**Exercise 4 (Hard):** Build a "Command Parser" for a text adventure. Parse commands like "take sword", "go north", "use key on door". Extract verb, noun, and optional target.

**Exercise 5 (Hard):** Create a "String Calculator" that evaluates expressions like "5 + 3 * 2" respecting operator precedence.

**Exercise 6 (Challenge):** Implement a "Simple Template Engine" that replaces `{variable}` placeholders in text using a map of values.

---

## Summary

You now know:

✅ String searching (`find`, `rfind`, `find_first_of`)  
✅ Substring extraction (`substr`)  
✅ String modification (`replace`, `insert`, `erase`)  
✅ String ↔ Number conversion  
✅ String streams for parsing  
✅ String views for performance  
✅ Complete RPG dialogue system  

## What's Next?

Next lesson: **Exception Handling** — gracefully handle errors (file not found, invalid input, out of memory) without crashing!

---

## Resources

- [std::string (cppreference)](https://en.cppreference.com/w/cpp/string/basic_string)
- [std::stringstream (cppreference)](https://en.cppreference.com/w/cpp/io/basic_stringstream)
- [std::string_view (cppreference)](https://en.cppreference.com/w/cpp/string/basic_string_view)

---

**Practice Task:** Build a "Chat Command System" for a multiplayer game. Commands like `/heal`, `/give sword`, `/teleport 100 200`. Parse commands, validate arguments, execute actions, and provide helpful error messages for invalid commands.