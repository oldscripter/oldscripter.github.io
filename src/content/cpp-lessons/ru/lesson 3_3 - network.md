---
title: "Сети с сокетами — создание многопользовательских игр"
description: "Соединяйте игроков по всему миру с помощью TCP и UDP сокетов — от чат-комнат до многопользовательских игр в реальном времени"
pubDate: 2026-05-20
tags: ["C++", "advanced", "networking", "sockets", "multiplayer"]
lang: "ru"
lessonNumber: 303
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Урок 20: Сети с сокетами — создание многопользовательских игр

Добро пожаловать обратно! Одиночные игры — это здорово, но **многопользовательские** — это то место, где происходит настоящая магия. Этот урок научит вас соединять игроков по сети.

## Что вы изучите

- TCP vs UDP — какой протокол для какого типа игры?
- API сокетов Беркли (кросс-платформенный)
- Создание простого сервера и клиента чата
- Синхронизация состояния игры
- Обработка нескольких клиентов с помощью потоков
- Базовая сериализация пакетов

---

## Часть 1: TCP vs UDP — выбор правильного протокола

| Характеристика | TCP | UDP |
|---------|-----|-----|
| **Надёжность** | Гарантированная доставка | Только "best effort" |
| **Упорядочивание** | Сохраняет порядок | Может переупорядочивать пакеты |
| **Соединение** | Ориентирован на соединение | Без соединения |
| **Скорость** | Медленнее (накладные расходы) | Быстрее (минимальные накладные расходы) |
| **Сценарии использования** | Чат, вход в систему, передача файлов | Игры в реальном времени, VoIP, стриминг |

**Игровые примеры:**
- **TCP** — Поиск матчей, чат, вход в аккаунт, торговля
- **UDP** — Позиции игроков, стрельба, движение в реальном времени

```cpp
// TCP: Надёжный, но медленнее
// Ожидание подтверждения, повторная передача потерянных пакетов
// Хорошо для: "Я подобрал меч" (должно произойти)

// UDP: Быстрый, но может терять пакеты
// Отправил и забыл
// Хорошо для: "Игрок в позиции (x, y)" (следующий пакет скорректирует)
```

---

## Часть 2: Основы программирования сокетов (Кросс-платформенный)

Для Windows требуется WSAStartup; для Linux/macOS — нет. Вот кросс-платформенный подход:

```cpp
// Определение платформы
#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #define SOCKET int
    #define INVALID_SOCKET -1
    #define SOCKET_ERROR -1
    #define closesocket close
#endif

#include <iostream>
#include <string>
#include <thread>
#include <vector>

// Обёртка для инициализации сокетов
class SocketInit {
public:
    SocketInit() {
#ifdef _WIN32
        WSADATA wsaData;
        WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif
    }
    
    ~SocketInit() {
#ifdef _WIN32
        WSACleanup();
#endif
    }
};
```

---

## Часть 3: Простой TCP-сервер чата

```cpp
// server.cpp
#include <iostream>
#include <thread>
#include <vector>
#include <cstring>
#include <algorithm>

#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #define SOCKET int
    #define INVALID_SOCKET -1
    #define SOCKET_ERROR -1
    #define closesocket close
#endif

class ChatServer {
private:
    SOCKET serverSocket;
    std::vector<SOCKET> clients;
    std::vector<std::thread> clientThreads;
    bool running;
    
public:
    ChatServer(int port) : running(true) {
        // Создание сокета
        serverSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocket == INVALID_SOCKET) {
            throw std::runtime_error("Не удалось создать сокет");
        }
        
        // Привязка к порту
        sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(port);
        
        if (bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            throw std::runtime_error("Не удалось привязать сокет");
        }
        
        // Ожидание подключений
        if (listen(serverSocket, 5) == SOCKET_ERROR) {
            throw std::runtime_error("Не удалось начать прослушивание");
        }
        
        std::cout << "Сервер чата запущен на порту " << port << std::endl;
    }
    
    void start() {
        while (running) {
            sockaddr_in clientAddr;
            socklen_t clientSize = sizeof(clientAddr);
            SOCKET clientSocket = accept(serverSocket, (sockaddr*)&clientAddr, &clientSize);
            
            if (clientSocket != INVALID_SOCKET) {
                std::cout << "Новый клиент подключён!" << std::endl;
                clients.push_back(clientSocket);
                
                // Запуск потока для этого клиента
                clientThreads.emplace_back(&ChatServer::handleClient, this, clientSocket);
            }
        }
    }
    
    void handleClient(SOCKET clientSocket) {
        char buffer[1024];
        
        while (running) {
            int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
            
            if (bytesReceived <= 0) {
                // Клиент отключился
                removeClient(clientSocket);
                break;
            }
            
            buffer[bytesReceived] = '\0';
            std::string message(buffer);
            
            std::cout << "Получено: " << message << std::endl;
            
            // Рассылка всем остальным клиентам
            broadcastMessage(message, clientSocket);
        }
    }
    
    void broadcastMessage(const std::string& message, SOCKET sender) {
        for (SOCKET client : clients) {
            if (client != sender) {
                send(client, message.c_str(), message.length(), 0);
            }
        }
    }
    
    void removeClient(SOCKET clientSocket) {
        auto it = std::find(clients.begin(), clients.end(), clientSocket);
        if (it != clients.end()) {
            closesocket(clientSocket);
            clients.erase(it);
            std::cout << "Клиент отключился. Всего клиентов: " << clients.size() << std::endl;
        }
    }
    
    ~ChatServer() {
        running = false;
        for (SOCKET client : clients) {
            closesocket(client);
        }
        closesocket(serverSocket);
        for (auto& t : clientThreads) {
            if (t.joinable()) t.join();
        }
    }
};

int main() {
    SocketInit init;
    
    try {
        ChatServer server(5555);
        server.start();
    } catch (const std::exception& e) {
        std::cerr << "Ошибка: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Часть 4: Простой TCP-клиент чата

```cpp
// client.cpp
#include <iostream>
#include <thread>
#include <string>

#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #define SOCKET int
    #define INVALID_SOCKET -1
    #define SOCKET_ERROR -1
    #define closesocket close
#endif

class ChatClient {
private:
    SOCKET sock;
    bool connected;
    std::string username;
    
public:
    ChatClient(const std::string& serverIP, int port, const std::string& name) 
        : connected(false), username(name) {
        
        // Создание сокета
        sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock == INVALID_SOCKET) {
            throw std::runtime_error("Не удалось создать сокет");
        }
        
        // Подключение к серверу
        sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        inet_pton(AF_INET, serverIP.c_str(), &serverAddr.sin_addr);
        
        if (connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            throw std::runtime_error("Не удалось подключиться к серверу");
        }
        
        connected = true;
        std::cout << "Подключено к серверу как " << username << std::endl;
        
        // Отправка сообщения о входе
        sendMessage(username + " присоединился к чату!");
    }
    
    void sendMessage(const std::string& msg) {
        if (!connected) return;
        std::string fullMsg = username + ": " + msg;
        send(sock, fullMsg.c_str(), fullMsg.length(), 0);
    }
    
    void receiveLoop() {
        char buffer[1024];
        
        while (connected) {
            int bytesReceived = recv(sock, buffer, sizeof(buffer) - 1, 0);
            
            if (bytesReceived <= 0) {
                std::cout << "Отключено от сервера" << std::endl;
                connected = false;
                break;
            }
            
            buffer[bytesReceived] = '\0';
            std::cout << buffer << std::endl;
        }
    }
    
    ~ChatClient() {
        if (connected) {
            sendMessage(username + " покинул чат");
        }
        closesocket(sock);
    }
};

int main() {
    SocketInit init;
    
    std::string username;
    std::cout << "Введите ваше имя: ";
    std::getline(std::cin, username);
    
    try {
        ChatClient client("127.0.0.1", 5555, username);
        
        // Запуск потока приёма
        std::thread receiver(&ChatClient::receiveLoop, &client);
        
        // Основной поток обрабатывает отправку
        std::string input;
        while (true) {
            std::getline(std::cin, input);
            if (input == "/quit") break;
            client.sendMessage(input);
        }
        
        receiver.detach();  // Разрешаем потоку приёма завершиться естественно
    } catch (const std::exception& e) {
        std::cerr << "Ошибка: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Часть 5: UDP для игровых данных в реальном времени

UDP идеален для позиций игроков, стрельбы и быстрого игрового состояния.

```cpp
// udp_game_server.cpp
#include <iostream>
#include <map>
#include <thread>
#include <chrono>

struct PlayerState {
    float x, y;
    float health;
    std::string name;
    std::chrono::steady_clock::time_point lastUpdate;
};

class UDPServer {
private:
    SOCKET sock;
    sockaddr_in serverAddr;
    std::map<std::string, PlayerState> players;
    bool running;
    
public:
    UDPServer(int port) : running(true) {
        sock = socket(AF_INET, SOCK_DGRAM, 0);
        if (sock == INVALID_SOCKET) {
            throw std::runtime_error("Не удалось создать UDP сокет");
        }
        
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(port);
        
        if (bind(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            throw std::runtime_error("Не удалось привязать UDP сокет");
        }
        
        std::cout << "UDP игровой сервер запущен на порту " << port << std::endl;
    }
    
    void run() {
        char buffer[1024];
        sockaddr_in clientAddr;
        socklen_t clientLen = sizeof(clientAddr);
        
        while (running) {
            int bytesReceived = recvfrom(sock, buffer, sizeof(buffer) - 1, 0,
                                         (sockaddr*)&clientAddr, &clientLen);
            
            if (bytesReceived > 0) {
                buffer[bytesReceived] = '\0';
                std::string data(buffer);
                
                // Простой протокол: "UPDATE:player_id,x,y,health"
                if (data.substr(0, 7) == "UPDATE:") {
                    parsePlayerUpdate(data.substr(7), clientAddr);
                }
            }
        }
    }
    
    void parsePlayerUpdate(const std::string& data, sockaddr_in& clientAddr) {
        // Формат: player_id,x,y,health
        size_t comma1 = data.find(',');
        size_t comma2 = data.find(',', comma1 + 1);
        size_t comma3 = data.find(',', comma2 + 1);
        
        if (comma1 != std::string::npos && comma2 != std::string::npos) {
            std::string playerId = data.substr(0, comma1);
            float x = std::stof(data.substr(comma1 + 1, comma2 - comma1 - 1));
            float y = std::stof(data.substr(comma2 + 1, comma3 - comma2 - 1));
            float health = std::stof(data.substr(comma3 + 1));
            
            // Обновление состояния игрока
            auto& player = players[playerId];
            player.x = x;
            player.y = y;
            player.health = health;
            player.lastUpdate = std::chrono::steady_clock::now();
            
            // Рассылка всем остальным игрокам
            broadcastPlayerStates(playerId);
        }
    }
    
    void broadcastPlayerStates(const std::string& excludeId) {
        for (const auto& [id, state] : players) {
            if (id != excludeId) {
                // Отправка каждому клиенту (клиенты хранятся отдельно в реальной реализации)
            }
        }
    }
    
    ~UDPServer() {
        running = false;
        closesocket(sock);
    }
};
```

---

## Часть 6: Сериализация пакетов для игровых данных

Отправка сложных структур данных по сети.

```cpp
#include <vector>
#include <cstring>

#pragma pack(push, 1)  // Без выравнивания между полями
struct PlayerPacket {
    uint32_t packetId;
    uint32_t playerId;
    float x, y, z;
    float health;
    uint8_t weaponType;
    uint8_t isSprinting;
};
#pragma pack(pop)

class PacketSerializer {
public:
    template<typename T>
    static std::vector<char> serialize(const T& data) {
        std::vector<char> buffer(sizeof(T));
        std::memcpy(buffer.data(), &data, sizeof(T));
        return buffer;
    }
    
    template<typename T>
    static T deserialize(const std::vector<char>& buffer) {
        T data;
        std::memcpy(&data, buffer.data(), sizeof(T));
        return data;
    }
};

// Пример использования
void sendPlayerUpdate(SOCKET sock, sockaddr_in& addr, uint32_t playerId, 
                      float x, float y, float z, float health) {
    PlayerPacket packet;
    packet.packetId = 1;
    packet.playerId = playerId;
    packet.x = x;
    packet.y = y;
    packet.z = z;
    packet.health = health;
    packet.weaponType = 2;
    packet.isSprinting = 0;
    
    auto buffer = PacketSerializer::serialize(packet);
    sendto(sock, buffer.data(), buffer.size(), 0, 
           (sockaddr*)&addr, sizeof(addr));
}
```

---

## Часть 7: Пример простой многопользовательской игры

```cpp
#include <iostream>
#include <thread>
#include <chrono>
#include <random>

struct GameState {
    std::map<int, Player> players;
    std::vector<Projectile> projectiles;
    int nextPlayerId;
    
    void update(float dt) {
        // Обновление позиций игроков
        for (auto& [id, player] : players) {
            player.x += player.vx * dt;
            player.y += player.vy * dt;
            
            // Проверка границ
            player.x = std::clamp(player.x, 0.0f, 800.0f);
            player.y = std::clamp(player.y, 0.0f, 600.0f);
        }
        
        // Обновление снарядов
        for (auto& p : projectiles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
        
        // Удаление снарядов за пределами
        projectiles.erase(
            std::remove_if(projectiles.begin(), projectiles.end(),
                [](const Projectile& p) {
                    return p.x < 0 || p.x > 800 || p.y < 0 || p.y > 600;
                }),
            projectiles.end());
    }
    
    void handleInput(int playerId, const Input& input) {
        auto it = players.find(playerId);
        if (it != players.end()) {
            const float SPEED = 200.0f;
            it->second.vx = 0;
            it->second.vy = 0;
            
            if (input.up) it->second.vy = -SPEED;
            if (input.down) it->second.vy = SPEED;
            if (input.left) it->second.vx = -SPEED;
            if (input.right) it->second.vx = SPEED;
            
            if (input.shoot) {
                Projectile p;
                p.x = it->second.x;
                p.y = it->second.y;
                p.vx = (input.mouseX - it->second.x) * 5.0f;
                p.vy = (input.mouseY - it->second.y) * 5.0f;
                projectiles.push_back(p);
            }
        }
    }
};

class GameServer {
private:
    GameState state;
    std::thread gameLoop;
    bool running;
    
public:
    GameServer() : running(true) {
        gameLoop = std::thread(&GameServer::runGameLoop, this);
    }
    
    void runGameLoop() {
        auto lastTime = std::chrono::steady_clock::now();
        
        while (running) {
            auto currentTime = std::chrono::steady_clock::now();
            float dt = std::chrono::duration<float>(currentTime - lastTime).count();
            lastTime = currentTime;
            
            // Ограничение dt для предотвращения взрывов физики
            dt = std::min(dt, 0.033f);
            
            state.update(dt);
            
            // Рассылка состояния всем клиентам (упрощённо)
            broadcastGameState();
            
            // Целевые 60 FPS
            std::this_thread::sleep_for(std::chrono::milliseconds(16));
        }
    }
    
    void broadcastGameState() {
        // Сериализация и отправка состояния игры всем подключённым клиентам
        // Реализация зависит от сетевого протокола (рекомендуется UDP)
    }
    
    ~GameServer() {
        running = false;
        if (gameLoop.joinable()) gameLoop.join();
    }
};
```

---

## Частые ошибки в сетевом программировании

### 1. Блокировка на Recv

```cpp
// ❌ Блокировка на неопределённое время
recv(sock, buffer, size, 0);

// ✅ Используйте неблокирующий режим или таймаут
setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
recv(sock, buffer, size, 0);
```

### 2. Предположение о полноте данных

```cpp
// ❌ Может получить часть сообщения
int bytes = recv(sock, buffer, 1024, 0);

// ✅ Продолжайте чтение, пока не получено полное сообщение
int total = 0;
while (total < expectedSize) {
    int bytes = recv(sock, buffer + total, expectedSize - total, 0);
    if (bytes <= 0) break;
    total += bytes;
}
```

### 3. Проблемы с порядком байтов

```cpp
// ❌ Разный порядок байтов на разных платформах
int port = 5555;
send(sock, &port, sizeof(port), 0);  // Может быть big-endian или little-endian

// ✅ Используйте htons/htonl для сетевого порядка байтов
int portNetwork = htons(5555);
send(sock, &portNetwork, sizeof(portNetwork), 0);

// ✅ При получении:
int portNetwork;
recv(sock, &portNetwork, sizeof(portNetwork), 0);
int portHost = ntohs(portNetwork);
```

### 4. Игнорирование отключений

```cpp
// ❌ Никогда не проверяет, отключился ли клиент
while (true) {
    send(sock, data, size, 0);  // Может отправлять мёртвому соединению
}

// ✅ Проверяйте возвращаемые значения
int result = send(sock, data, size, 0);
if (result == SOCKET_ERROR) {
    // Клиент отключился
    removeClient(sock);
    break;
}
```

---

## Шпаргалка

```cpp
// Создание сокета
SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);  // TCP
SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);   // UDP

// TCP сервер
bind(sock, (sockaddr*)&addr, sizeof(addr));
listen(sock, 5);
SOCKET client = accept(sock, (sockaddr*)&clientAddr, &clientLen);

// TCP клиент
connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr));

// Отправка/Получение (TCP)
send(sock, data, size, 0);
recv(sock, buffer, size, 0);

// Отправка/Получение (UDP)
sendto(sock, data, size, 0, (sockaddr*)&addr, sizeof(addr));
recvfrom(sock, buffer, size, 0, (sockaddr*)&addr, &addrLen);

// Вспомогательные функции
inet_pton(AF_INET, "192.168.1.1", &addr.sin_addr);
inet_ntop(AF_INET, &addr.sin_addr, ipStr, sizeof(ipStr));
htons(port)      // Host to network short
ntohs(port)      // Network to host short
htonl(value)     // Host to network long
ntohl(value)     // Network to host long

// Очистка
closesocket(sock);   // Windows
close(sock);         // Linux/macOS
```

---

## Практические упражнения

**Упражнение 1 (Лёгкое):** Модифицируйте сервер чата для поддержки личных сообщений (/msg имя текст).

**Упражнение 2 (Среднее):** Создайте UDP эхо-сервер, возвращающий любой полученный пакет отправителю.

**Упражнение 3 (Среднее):** Создайте простую систему "Кто онлайн". Клиенты отправляют heartbeat-пакеты каждые 5 секунд; сервер отслеживает активных клиентов.

**Упражнение 4 (Сложное):** Реализуйте базовый сервер подбора матчей. Игроки отправляют сообщения "ищу игру"; сервер объединяет их в группы.

**Упражнение 5 (Сложное):** Создайте программу для передачи файлов с использованием TCP. Поддерживайте отправку больших файлов с индикаторами прогресса.

**Упражнение 6 (Вызов):** Создайте полноценную многопользовательскую игру Pong. Один сервер, два клиента. Синхронизируйте позиции мяча и ракеток с помощью UDP.

---

## Резюме

Теперь вы знаете:

✅ Различия TCP и UDP и когда какой использовать  
✅ API сокетов Беркли (кросс-платформенный)  
✅ Простой сервер и клиент чата  
✅ UDP для игровых данных в реальном времени  
✅ Сериализацию пакетов для сложных данных  
✅ Базовую архитектуру многопользовательской игры  

## Что дальше?

Следующий урок: **Паттерны проектирования игр** — Singleton, Factory, Observer и другие паттерны, используемые в реальных игровых движках!

---

## Ресурсы

- [Руководство Бижа по сетевому программированию](https://beej.us/guide/bgnet/)
- [Документация Winsock (Microsoft)](https://docs.microsoft.com/en-us/windows/win32/winsock/)
- [POSIX сокеты (Linux)](https://man7.org/linux/man-pages/man7/socket.7.html)

---

**Практическое задание:** Создайте небольшую многопользовательскую игру (например, «Змейка» или «Понг») с использованием протокола UDP. Реализуйте прогнозирование на стороне клиента и согласование с сервером для обработки задержек. Протестируйте с несколькими клиентами!