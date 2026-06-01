---
title: "Networking with Sockets — Building Multiplayer Games"
description: "Connect players across the world with TCP and UDP sockets — from chat rooms to real-time multiplayer"
pubDate: 2026-05-20
tags: ["C++", "advanced", "networking", "sockets", "multiplayer"]
lessonNumber: 20
subcategory: "advanced"
author: "Stanislav Talanov"
---

# Lesson 20: Networking with Sockets — Building Multiplayer Games

Welcome back! Single-player games are great, but **multiplayer** is where the real magic happens. This lesson teaches you how to connect players over the network.

## What You'll Learn

- TCP vs UDP — which protocol for which game type?
- Berkeley sockets API (cross-platform)
- Creating a simple chat server and client
- Game state synchronization
- Handling multiple clients with threads
- Basic packet serialization

---

## Part 1: TCP vs UDP — Choosing the Right Protocol

| Feature | TCP | UDP |
|---------|-----|-----|
| **Reliability** | Guaranteed delivery | Best effort only |
| **Ordering** | Preserves order | May reorder packets |
| **Connection** | Connection-oriented | Connectionless |
| **Speed** | Slower (overhead) | Faster (minimal overhead) |
| **Use cases** | Chat, login, file transfer | Real-time games, VoIP, streaming |

**Game examples:**
- **TCP** — Matchmaking, chat, account login, trading
- **UDP** — Player positions, shooting, real-time movement

```cpp
// TCP: Reliable but slower
// Wait for confirmation, retransmit lost packets
// Good for: "I picked up the sword" (must happen)

// UDP: Fast but may drop packets
// Fire and forget
// Good for: "Player at position (x, y)" (next packet will correct)
```

---

## Part 2: Socket Programming Basics (Cross-Platform)

Windows needs WSAStartup; Linux/macOS don't. Here's a cross-platform approach:

```cpp
// Platform detection
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

// Socket initialization wrapper
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

## Part 3: Simple TCP Chat Server

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
        // Create socket
        serverSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocket == INVALID_SOCKET) {
            throw std::runtime_error("Failed to create socket");
        }
        
        // Bind to port
        sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(port);
        
        if (bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            throw std::runtime_error("Failed to bind socket");
        }
        
        // Listen for connections
        if (listen(serverSocket, 5) == SOCKET_ERROR) {
            throw std::runtime_error("Failed to listen");
        }
        
        std::cout << "Chat server started on port " << port << std::endl;
    }
    
    void start() {
        while (running) {
            sockaddr_in clientAddr;
            socklen_t clientSize = sizeof(clientAddr);
            SOCKET clientSocket = accept(serverSocket, (sockaddr*)&clientAddr, &clientSize);
            
            if (clientSocket != INVALID_SOCKET) {
                std::cout << "New client connected!" << std::endl;
                clients.push_back(clientSocket);
                
                // Start thread for this client
                clientThreads.emplace_back(&ChatServer::handleClient, this, clientSocket);
            }
        }
    }
    
    void handleClient(SOCKET clientSocket) {
        char buffer[1024];
        
        while (running) {
            int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
            
            if (bytesReceived <= 0) {
                // Client disconnected
                removeClient(clientSocket);
                break;
            }
            
            buffer[bytesReceived] = '\0';
            std::string message(buffer);
            
            std::cout << "Received: " << message << std::endl;
            
            // Broadcast to all other clients
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
            std::cout << "Client disconnected. Total clients: " << clients.size() << std::endl;
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
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Part 4: Simple TCP Chat Client

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
        
        // Create socket
        sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock == INVALID_SOCKET) {
            throw std::runtime_error("Failed to create socket");
        }
        
        // Connect to server
        sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        inet_pton(AF_INET, serverIP.c_str(), &serverAddr.sin_addr);
        
        if (connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            throw std::runtime_error("Failed to connect to server");
        }
        
        connected = true;
        std::cout << "Connected to server as " << username << std::endl;
        
        // Send join message
        sendMessage(username + " joined the chat!");
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
                std::cout << "Disconnected from server" << std::endl;
                connected = false;
                break;
            }
            
            buffer[bytesReceived] = '\0';
            std::cout << buffer << std::endl;
        }
    }
    
    ~ChatClient() {
        if (connected) {
            sendMessage(username + " left the chat");
        }
        closesocket(sock);
    }
};

int main() {
    SocketInit init;
    
    std::string username;
    std::cout << "Enter your username: ";
    std::getline(std::cin, username);
    
    try {
        ChatClient client("127.0.0.1", 5555, username);
        
        // Start receive thread
        std::thread receiver(&ChatClient::receiveLoop, &client);
        
        // Main thread handles sending
        std::string input;
        while (true) {
            std::getline(std::cin, input);
            if (input == "/quit") break;
            client.sendMessage(input);
        }
        
        receiver.detach();  // Let receiver thread exit naturally
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

---

## Part 5: UDP for Real-Time Game Data

UDP is perfect for player positions, shooting, and fast-paced game state.

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
            throw std::runtime_error("Failed to create UDP socket");
        }
        
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(port);
        
        if (bind(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            throw std::runtime_error("Failed to bind UDP socket");
        }
        
        std::cout << "UDP Game Server started on port " << port << std::endl;
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
                
                // Parse simple protocol: "UPDATE:player_id,x,y,health"
                if (data.substr(0, 7) == "UPDATE:") {
                    parsePlayerUpdate(data.substr(7), clientAddr);
                }
            }
        }
    }
    
    void parsePlayerUpdate(const std::string& data, sockaddr_in& clientAddr) {
        // Format: player_id,x,y,health
        size_t comma1 = data.find(',');
        size_t comma2 = data.find(',', comma1 + 1);
        size_t comma3 = data.find(',', comma2 + 1);
        
        if (comma1 != std::string::npos && comma2 != std::string::npos) {
            std::string playerId = data.substr(0, comma1);
            float x = std::stof(data.substr(comma1 + 1, comma2 - comma1 - 1));
            float y = std::stof(data.substr(comma2 + 1, comma3 - comma2 - 1));
            float health = std::stof(data.substr(comma3 + 1));
            
            // Update player state
            auto& player = players[playerId];
            player.x = x;
            player.y = y;
            player.health = health;
            player.lastUpdate = std::chrono::steady_clock::now();
            
            // Broadcast to all other players
            broadcastPlayerStates(playerId);
        }
    }
    
    void broadcastPlayerStates(const std::string& excludeId) {
        for (const auto& [id, state] : players) {
            if (id != excludeId) {
                // Send to each client (clients stored separately in real implementation)
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

## Part 6: Packet Serialization for Game Data

Send complex data structures over the network.

```cpp
#include <vector>
#include <cstring>

#pragma pack(push, 1)  // No padding between fields
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

// Example usage
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

## Part 7: Simple Multiplayer Game Example

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
        // Update player positions
        for (auto& [id, player] : players) {
            player.x += player.vx * dt;
            player.y += player.vy * dt;
            
            // Boundary checks
            player.x = std::clamp(player.x, 0.0f, 800.0f);
            player.y = std::clamp(player.y, 0.0f, 600.0f);
        }
        
        // Update projectiles
        for (auto& p : projectiles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
        
        // Remove expired projectiles
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
            
            // Cap dt to prevent physics explosions
            dt = std::min(dt, 0.033f);
            
            state.update(dt);
            
            // Broadcast state to all clients (simplified)
            broadcastGameState();
            
            // 60 FPS target
            std::this_thread::sleep_for(std::chrono::milliseconds(16));
        }
    }
    
    void broadcastGameState() {
        // Serialize and send game state to all connected clients
        // Implementation depends on network protocol (UDP recommended)
    }
    
    ~GameServer() {
        running = false;
        if (gameLoop.joinable()) gameLoop.join();
    }
};
```

---

## Common Networking Mistakes

### 1. Blocking on Recv

```cpp
// ❌ Blocks indefinitely
recv(sock, buffer, size, 0);

// ✅ Use non-blocking or timeout
setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
recv(sock, buffer, size, 0);
```

### 2. Assuming Data is Complete

```cpp
// ❌ May get partial message
int bytes = recv(sock, buffer, 1024, 0);

// ✅ Keep reading until full message received
int total = 0;
while (total < expectedSize) {
    int bytes = recv(sock, buffer + total, expectedSize - total, 0);
    if (bytes <= 0) break;
    total += bytes;
}
```

### 3. Endianness Issues

```cpp
// ❌ Different byte order on different platforms
int port = 5555;
send(sock, &port, sizeof(port), 0);  // May be big-endian or little-endian

// ✅ Use htons/htonl for network byte order
int portNetwork = htons(5555);
send(sock, &portNetwork, sizeof(portNetwork), 0);

// ✅ On receive:
int portNetwork;
recv(sock, &portNetwork, sizeof(portNetwork), 0);
int portHost = ntohs(portNetwork);
```

### 4. Not Handling Disconnects

```cpp
// ❌ Never check if client disconnected
while (true) {
    send(sock, data, size, 0);  // May send to dead connection
}

// ✅ Check return values
int result = send(sock, data, size, 0);
if (result == SOCKET_ERROR) {
    // Client disconnected
    removeClient(sock);
    break;
}
```

---

## Quick Reference Card

```cpp
// Socket creation
SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);  // TCP
SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);   // UDP

// TCP Server
bind(sock, (sockaddr*)&addr, sizeof(addr));
listen(sock, 5);
SOCKET client = accept(sock, (sockaddr*)&clientAddr, &clientLen);

// TCP Client
connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr));

// Send/Receive (TCP)
send(sock, data, size, 0);
recv(sock, buffer, size, 0);

// Send/Receive (UDP)
sendto(sock, data, size, 0, (sockaddr*)&addr, sizeof(addr));
recvfrom(sock, buffer, size, 0, (sockaddr*)&addr, &addrLen);

// Helper functions
inet_pton(AF_INET, "192.168.1.1", &addr.sin_addr);
inet_ntop(AF_INET, &addr.sin_addr, ipStr, sizeof(ipStr));
htons(port)      // Host to network short
ntohs(port)      // Network to host short
htonl(value)     // Host to network long
ntohl(value)     // Network to host long

// Cleanup
closesocket(sock);   // Windows
close(sock);         // Linux/macOS
```

---

## Practice Exercises

**Exercise 1 (Easy):** Modify the chat server to support private messages (/msg username text).

**Exercise 2 (Medium):** Create a UDP echo server that returns any received packet to the sender.

**Exercise 3 (Medium):** Build a simple "Who's Online" system. Clients send heartbeat packets every 5 seconds; server tracks active clients.

**Exercise 4 (Hard):** Implement a basic matchmaking server. Players send "looking for game" messages; server groups them into lobbies.

**Exercise 5 (Hard):** Create a file transfer program using TCP. Support sending large files with progress indicators.

**Exercise 6 (Challenge):** Build a complete multiplayer pong game. One server, two clients. Synchronize ball and paddle positions using UDP.

---

## Summary

You now know:

✅ TCP vs UDP differences and when to use each  
✅ Berkeley sockets API (cross-platform)  
✅ Simple chat server and client  
✅ UDP for real-time game data  
✅ Packet serialization for complex data  
✅ Basic multiplayer game architecture  

## What's Next?

Next lesson: **Game Design Patterns** — Singleton, Factory, Observer, and more patterns used in real game engines!

---

## Resources

- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/)
- [Winsock documentation (Microsoft)](https://docs.microsoft.com/en-us/windows/win32/winsock/)
- [POSIX sockets (Linux)](https://man7.org/linux/man-pages/man7/socket.7.html)

---

**Practice Task:** Build a small multiplayer game (like Snake or Pong) using UDP. Implement client-side prediction and server reconciliation to handle lag. Test with multiple clients!