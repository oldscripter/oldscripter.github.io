---
title: "Nanobot: Your Own AI Agent, No Browser Needed"
description: "Recently, I started exploring Nanobot. One idea really caught my attention: what if I wrote my own client for it?"
pubDate: 2026-06-03
tags: ["nanobot", "AI-assistant", "C++", "Qt", "Qml"]
author: "Stanislav Talanov"
image:
  url: "/images/blog/announcement.jpg"
  alt: ""
---

# 🎯 Nanobot: Your Own AI Agent, No Browser Needed

Recently, I started exploring **Nanobot** — a lightweight open-source AI agent from the HKUDS team. One idea really caught my attention: what if I wrote my own client for it? Not a browser-based WebUI, but a native Qt/QML application. Why? Because browsers are great for everything, but for chatting with an AI, I want something more personal: convenient, fast, and without extra tabs.

## 🤖 What is Nanobot?

Nanobot is an agent that works with LLMs either locally or via API. It supports tools, memory, multitasking, and — most importantly for me — a WebSocket gateway. It's written in Python, easy to configure, and doesn't require a powerful server.

## 🔌 WebSocket: The Entry Point for Custom Apps

Nanobot comes with a built-in WebSocket server. This means that not only the web interface can communicate with it, but any application that supports WebSocket.

So I thought: let's build a client with Qt.

## ⚙️ Technical Details

WebSocket in Qt 5.15 isn't exactly smooth sailing. The standard `QWebSocket` failed during the handshake, so I had to implement RFC 6455 manually: HTTP handshake, frame masking, ping/pong. But it was worth it.

The main workflow is:
1. Connect to `ws://127.0.0.1:8765`
2. Receive a `chat_id`
3. Send a message
4. The agent responds with a stream of `delta` events, which the client assembles into a complete message.

The QML interface turned out simple yet nice: dark theme, message bubbles, status indicator.

## 🚀 What I Got

I ended up with:
- A native application for chatting with AI
- Full control over the interface
- Easy debugging
- Enjoyment of the process

The code is on GitHub, with a README included.

## 💡 Conclusion

You don't always have to use what comes out of the box. Nanobot is a great example of a system that can be extended and integrated however you like. Building your own client for an AI agent isn't hard — but it's a lot of fun.