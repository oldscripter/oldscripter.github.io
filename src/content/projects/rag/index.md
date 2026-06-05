---
title: "RAG Assistant"
description: "Local LLM + RAG search over 1,000+ pages of documentation"
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

# RAG Assistant

**Local LLM + RAG search over 1,000+ pages of documentation - fully offline, zero data leakage. Approved for deployment in a secure OS environment.**
---

## TL

| Metric | Value |
|--------|-------|
| **Models** | Mistral 7B (GGUF Q4_K_M) + sentence-transformers (ONNX) |
| **Framework** | `llama.cpp` with Vulkan backends |
| **Speed** | 22 tokens/sec on M1 Pro (2.7x faster than CPU) |
| **Latency reduction** | 40% via KV-cache |
| **Documentation** | 1,000+ pages → 500 MB of embeddings (Chroma in-memory) |
| **Status** | ✅ Approved for 500+ workstations |

---

## The Problem

At the customer-company side Engineers needed to search through thousands of pages of internal documentation (technical requirements, API specs, regulations) and get answers in natural language. But:

- ❌ **No cloud** - sensitive data can't leave the secure perimeter
- ❌ **No internet** - many workstations are air-gapped
- ❌ **Manual search sucks** - Ctrl+F across 1,000+ pages takes 15+ minutes

**We needed a fully offline RAG assistant.**