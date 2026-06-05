---
title: "Part 2. The Engineering Kitchen"
description: "How We Made llama.cpp and Qt Friends (and Got 22 Tokens/Sec)"
pubDate: 2025-04-15
projectName: "RAG Assistant"
githubUrl: "https://github.com/oldscripter/unity_ECS_example"
demoUrl: "https://github.com/oldscripter/unity_ECS_example"
techStack: ["AI", "C++", "llama.cpp", "LLM", "RAG"]
tags: ["llama.cpp", "RAG", "Mistral", "C++", "Qt", "Vulkan", "ML", "AI"]
image:
  url: "/images/projects/rag/index.jpeg"
  alt: "Project cover"
---

# Part 2. The Engineering Kitchen: How We Made llama.cpp and Qt Friends (and Got 22 Tokens/Sec)

## Building llama.cpp for Qt Environment

Our OS runs on Qt: Qml frontend, C++ backend, custom package managers (not standard `apt` or `brew`). So we had to build `llama.cpp` from source.

**Build steps:**

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
mkdir build && cd build

# Metal build (macOS)
cmake .. -DGGML_METAL=ON -DGGML_METAL_EMBED_LIBRARY=ON
make -j8

# Or Vulkan build (Linux)
cmake .. -DGGML_VULKAN=ON
make -j8
```

**Hidden trap:** static linking of Metal libraries required manual copying of the `.metallib` file. We lost a day digging through `ggml-metal.m` scripts.

## C++ Wrapper: Minimal Inference API

`llama_client.hpp` (simplified):

```cpp
class LlamaClient {
public:
    LlamaClient(const std::string& modelPath, int n_ctx = 4096);
    std::string generate(const std::string& prompt,
                         int max_tokens = 512,
                         float temperature = 0.7f);
    void updateKVcache(const std::string& lastPrompt);
private:
    llama_model* model;
    llama_context* ctx;
    std::vector<llama_token> cachedTokens;
};
```

Implementation highlights (from real code):

- Initialization: `llama_model_params_default()`, `llama_context_params_default()`
- Tokenization: `llama_tokenize()` → token array
- Inference: `llama_decode()` in a loop
- Result extraction: `llama_token_to_piece()`

**Important:** All calls from Qt/Qml must be in a separate thread, otherwise the UI freezes for 2–5 seconds.

## Integrating with Qml: Signals and Slots

```cpp
class LlamaWorker : public QObject {
    Q_OBJECT
public:
    Q_INVOKABLE void askQuestion(const QString& question);
signals:
    void answerReady(const QString& answer);
    void errorOccurred(const QString& error);
private:
    LlamaClient client;
};
```

In Qml:

```qml
Button {
    text: "Ask"
    onClicked: llamaWorker.askQuestion(questionField.text)
}

Connections {
    target: llamaWorker
    function onAnswerReady(answer) {
        resultText.text = answer
    }
}
```

## Inference Speedup: Metal vs Vulkan vs CPU

**Test:** 200 token prompt, 150 token generation, Mistral 7B Q4_K_M.

| Backend | Time to first token | Generation time | Tokens/sec |
|---------|---------------------|-----------------|------------|
| CPU (8 threads) | 1.8 s | 15.2 s | 8 |
| Metal (M1 Pro) | 0.6 s | 6.8 s | 22 |
| Vulkan (RTX 3060) | 0.5 s | 6.2 s | 24 |

**Conclusion:** GPU gives 2.7–3x acceleration. In production, we ship engineers a GPU auto-detection script — if Metal/Vulkan are available, use them; otherwise fall back to CPU.

## RAG Integration: How Embeddings End Up in the Prompt

**Algorithm:**

1. User asks question Q
2. Convert Q to vector via sentence-transformers
3. Find top‑5 most similar documentation chunks (cosine distance)
4. Build prompt:  
   `"Answer the question using the following documents: [doc 1] ... [doc 5]. Question: Q"`
5. Feed prompt into `llama.cpp`

**The challenge:** Some documents are long (5+ pages). We split them into chunks of 512 tokens with 64‑token overlap (to avoid losing context at boundaries).

**Chunking:** used `RecursiveCharacterTextSplitter` from LangChain (ported to C++).

## Deployment in a Secure Environment

Security requirements:

- No external network calls (we blocked all `socket()` calls from `llama.cpp`)
- All models and libraries must be scanned (binaries signed)
- Access logging (who searched for what)

**What we did:**

- Stripped HTTP requests from `llama.cpp` (there was code for downloading models)
- Packaged everything into a container (Docker-like) with a read‑only filesystem for the model
- Built audit logging — all queries written to a protected log (separate from system logs)