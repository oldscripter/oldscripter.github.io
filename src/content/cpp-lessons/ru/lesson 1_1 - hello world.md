---
title: "Установка окружения для C++ и Hello World"
description: "Install a compiler, set up your environment, and write your first C++ program"
pubDate: 2026-05-29
tags: ["C++", "beginner", "setup", "hello-world"]
lang: "ru"
lessonNumber: 1
subcategory: "beginner"
author: "Stanislav Talanov"
---

# Lesson 1: C++ Setup & Hello World

Welcome to your C++ journey! By the end of this lesson, you'll have a working C++ environment and will have written and run your first program.

## What You'll Learn

- What C++ is and why it matters for game development
- How to install a C++ compiler on Windows, macOS, or Linux
- How to write, compile, and run "Hello, World!"
- Basic program structure explained

---

## Why C++ for Game Development?

C++ is the industry standard for game development because it gives you:

- **Raw performance** — direct memory control with no garbage collector
- **Hardware access** — talk to GPUs, controllers, and audio devices
- **Portability** — run on consoles (PlayStation, Xbox, Switch), PC, and mobile
- **Ecosystem** — Unreal Engine, custom engines, and most AAA studios use C++

If you want to build games that push hardware to its limits, C++ is your language.

---

## Step 1: Install a Compiler

A compiler turns your human-readable C++ code into machine code the computer understands.

### Windows

**Option A: Visual Studio Community (Recommended for beginners)**

1. Download [Visual Studio Community](https://visualstudio.microsoft.com/downloads/) (free)
2. During installation, select **"Desktop development with C++"**
3. Click Install

**Option B: MinGW (Lightweight)**

1. Download [MSYS2](https://www.msys2.org/)
2. Follow the installation guide
3. Open MSYS2 terminal and run:
   ```bash
   pacman -S mingw-w64-ucrt-x86_64-gcc
   ```

### macOS

Install Xcode Command Line Tools:

```bash
xcode-select --install
```

Or use Homebrew:

```bash
brew install gcc
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install g++ build-essential
```

---

## Step 2: Verify Your Installation

Open a terminal (Command Prompt on Windows, Terminal on macOS/Linux) and run:

```bash
g++ --version
```

You should see something like:
```
g++ (Ubuntu 13.2.0-4ubuntu3) 13.2.0
```

If you see a version number, you're ready!

---

## Step 3: Choose a Code Editor

You can write C++ in any text editor, but these make your life easier:

| Editor | Best For | Free? |
|--------|----------|-------|
| **VS Code** | Lightweight + extensible | ✅ |
| **Visual Studio** | Windows + heavy debugging | ✅ (Community) |
| **CLion** | Advanced features | ❌ (Free trial) |
| **Code::Blocks** | Simple, all-in-one | ✅ |

**For this tutorial, I'll use VS Code with the C++ extension:**

1. Download [VS Code](https://code.visualstudio.com/)
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Search for "C++" and install Microsoft's C++ extension

---

## Step 4: Your First C++ Program

Create a new folder for your C++ projects:

```bash
mkdir cpp-projects
cd cpp-projects
```

Create a file called `hello.cpp` and open it in your editor.

### The Code

Type this exactly:

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

**Important:** C++ is case-sensitive. `main` is not the same as `Main`.

---

## Step 5: Understanding the Code

Let's break down every line:

| Line | Explanation |
|------|-------------|
| `#include <iostream>` | Includes the **Input/Output stream** library. This gives us `std::cout` |
| `int main() {` | Every C++ program starts here. `int` means the function returns an integer |
| `std::cout << "Hello, World!" << std::endl;` | Prints text to the console. `std::cout` = "character output", `<<` = "send to", `std::endl` = new line |
| `return 0;` | Tells the operating system "everything worked fine" |
| `}` | Closes the main function |

### What is `std::`?

`std::` is the **standard namespace**. It tells C++ "use the cout from the standard library." You'll see this everywhere. Later, you can add `using namespace std;` to avoid typing `std::` every time.

---

## Step 6: Compile and Run

In your terminal, navigate to where `hello.cpp` is saved:

```bash
cd /path/to/cpp-projects
```

### Compile

```bash
g++ hello.cpp -o hello
```

This tells g++ to:
- `hello.cpp` — compile this file
- `-o hello` — output an executable named `hello`

### Run

**Windows:**
```bash
hello.exe
```

**macOS / Linux:**
```bash
./hello
```

### Expected Output

```
Hello, World!
```

🎉 Congratulations! You just wrote and ran your first C++ program.

---

## Step 7: Common Errors & Fixes

### "g++ is not recognized"
- You didn't install a compiler, or it's not in your PATH
- Reinstall and check "Add to PATH" during installation

### "expected ';' before..."
- You forgot a semicolon at the end of a line
- C++ requires `;` after almost every statement

### "'cout' is not a member of 'std'"
- You forgot `#include <iostream>`

### "main must return int"
- C++ doesn't allow `void main()` — always use `int main()`

---

## Practice: Modify the Code

Try these small changes and see what happens:

1. **Print multiple lines:**
   ```cpp
   std::cout << "Hello" << std::endl;
   std::cout << "World!" << std::endl;
   ```

2. **Print without new line:**
   ```cpp
   std::cout << "Hello ";
   std::cout << "World!";
   ```

3. **Print a number:**
   ```cpp
   std::cout << 42 << std::endl;
   ```

---

## Summary

In this lesson, you learned:

✅ How to install a C++ compiler on your OS  
✅ Which editors work best for C++ development  
✅ The structure of a basic C++ program  
✅ How to compile and run code from the terminal  
✅ Common errors and how to fix them  

## What's Next?

Next lesson: **Variables and Data Types** — where we'll store numbers, text, and true/false values to build more interesting programs.

---

## Resources

- [Official C++ Reference](https://en.cppreference.com/)
- [LearnCpp.com](https://www.learncpp.com/) — excellent free tutorial
- [Compiler Explorer](https://godbolt.org/) — see how C++ becomes assembly

---

**Practice Task:** Modify Hello World to print your name, age, and favorite game. Compile and run it. Then change the `return 0;` to `return 1;` and see if anything different happens.

*Questions? Feel free to contact me.*
