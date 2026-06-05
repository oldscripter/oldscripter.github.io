---
title: "Part 1. RAG Assistant Architecture"
description: "Why We Didn't Go to the Cloud"
pubDate: 2025-04-14
projectName: "RAG Assistant"
githubUrl: "https://github.com/oldscripter/unity_ECS_example"
demoUrl: "https://github.com/oldscripter/unity_ECS_example"
techStack: ["AI", "C++", "llama.cpp", "LLM", "RAG"]
tags: ["llama.cpp", "RAG", "Mistral", "C++", "Qt", "Vulkan", "ML", "AI"]
image:
  url: "/images/projects/rag/index.jpeg"
  alt: "Project cover"
---

# Part 1. RAG Assistant Architecture: Why We Didn't Go to the Cloud

## Introduction

At previous work we had a problem: enable developers and engineers to search through internal documentation (1,000+ pages of technical requirements, regulations, API specs) and get answers in natural language. Everything had to work **offline** — no external LLM APIs (OpenAI, YandexGPT, etc.) because the documentation contains sensitive data.

That's how we built a local RAG assistant using **llama.cpp + sentence-transformers + Mistral 7B GGUF**.

## Model Selection and Quantization

Why Mistral 7B?

- Great quality for its size (fits in 4–6 GB of RAM)
- GGUF quantization (Q4_K_M) gave us acceptable CPU speed without a GPU
- Model memory footprint: ~4.2 GB (down from 13 GB in FP16)

Alternatives (Llama 2 7B, Gemma 7B) performed worse on Russian-language prompts.

**How we chose:** ran 50 internal queries (in Russian) through 4 models, compared BLEU scores and subjective answer quality. Mistral won.

## Why llama.cpp, Not CoreML or TensorFlow Lite?

- Broad LLM architecture support (Mistral, Llama, Gemma, etc.)
- Built-in GGUF quantization (no quality loss)
- **Metal** (macOS) and **Vulkan** (Linux) backends — 2–3x speedup on GPUs
- Easy to integrate into C++/Qt/Qml (the company uses a Qt-based custom OS)

Alternatives fell short: CoreML locks you into Apple; TensorFlow Lite struggles with LLMs.

## Architecture: Components and Their Interaction

```
┌─────────────────────────────────────────────────────────────┐
                       Qt/Qml Frontend
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
                  C++ Wrapper (llama.cpp bridge)
├─────────────────────────────────────────────────────────────┤
  - Prompt caching
  - KV-cache
  - Context management (n_ctx, batch size)
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
    llama.cpp (Vulkan)       Sentence-Transformers (ONNX)
    Mistral 7B GGUF          Embeddings → Chroma (in-mem)
└──────────────────────────┘   └──────────────────────────────┘
```

**What we did:**

1. Built `llama.cpp` with `GGML_USE_METAL` and `GGML_USE_VULKAN` flags
2. Wrote a C++ wrapper to call inference from Qt
3. Ran a local embedding service with `sentence-transformers` (in a separate thread so it wouldn't block the UI)
4. Vector store — Chroma (in-memory), for simplicity and speed

**The challenge:** embeddings (384‑dimensional vectors) for 1,000+ pages of documentation required ~500 MB of RAM. We kept them in Chroma uncompressed to preserve search accuracy.

## Technical Details They Don't Blog About

### 1. Prompt Caching

Sending the full system prompt (instructions + retrieved document context) to the LLM every time is expensive. We built a cache based on the hash of the previous query. If the user asks a follow‑up ("how do I do the same thing on Windows?") — we reuse the cached KV‑cache.

### 2. KV‑Cache

The most expensive part of LLM inference is attention. We persisted the KV‑cache from previous prompts when the context didn't change much. This gave us **40% lower latency** on repeated queries.

### 3. Context Management

`llama.cpp` allows you to set `n_ctx` (context window size). We chose 4096 tokens (~8–10 pages of text). That covered 95% of questions. For rare long queries, we return a warning: "too much text, narrow your scope".