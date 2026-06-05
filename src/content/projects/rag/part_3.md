---
title: "Part 3. Results, Lessons Learned"
description: "How We Got It Approved for Production"
pubDate: 2025-04-23
projectName: "RAG Assistant"
githubUrl: "https://github.com/oldscripter/unity_ECS_example"
demoUrl: "https://github.com/oldscripter/unity_ECS_example"
techStack: ["AI", "C++", "llama.cpp", "LLM", "RAG"]
tags: ["llama.cpp", "RAG", "Mistral", "C++", "Qt", "Vulkan", "ML", "AI"]
image:
  url: "/images/projects/rag/index.jpeg"
  alt: "Project cover"
---


# Part 3. Results, Lessons Learned, and How We Got It Approved for Production

## Numbers We Achieved

| Metric | Before RAG | After RAG |
|--------|------------|-----------|
| Average time to find info in docs | 15 minutes (manual Ctrl+F) | 45 seconds (with answer generation) |
| Questions resolved without escalation | 40% | 78% |
| Engineer satisfaction (survey) | 2.8/5 | 4.6/5 |
| Time to first token | - | 0.6–1.8 s (depending on GPU) |

**Most important outcome:** The assistant found a bug in a technical spec that had gone unnoticed for 3 years. Estimated savings: ~200 person‑hours per quarter.

## Benchmarking Speed: How We Tuned Batch Size and n_threads

CPU parameters (8 cores, AVX2):

- `n_threads = 8` (maximum utilization)
- `batch_size = 512` (empirically tuned - 256 and 1024 were worse)

For GPU (Metal/Vulkan): disable CPU threads, set `n_gpu_layers = 33`.

**The formula we derived:**  
`tokens_per_second = (flops_model * gpu_memory_bandwidth) / (params * quantization_size * 2)`

For Mistral 7B Q4_K_M (4.2 GB) on M1 Pro (200 GB/s) → ~22 tokens/sec - matched our measurements.

## Hidden Traps Not Documented in llama.cpp

### 1. Memory Leaks Under Long Runtime

`llama.cpp` didn't always free the KV‑cache after generation. We had to manually call `llama_kv_cache_free()` after every request (unless we intentionally wanted caching).

### 2. Metal Crashed on Large n_ctx

With `n_ctx = 8192` and Metal, it crashed with `MTLResource allocation failed`. Turns out Metal has a 2 GB per‑buffer limit. Fix: reduced `n_ctx` to 4096 and set `GGML_METAL_EMBED_LIBRARY=OFF`.

### 3. Russian/English Mixing

Mistral 7B is mainly English‑trained, but handles Russian at about 70% accuracy. The problem: rare Russian terms (e.g., "ESIA", "SMEV") would be transliterated. Solution: we extended the tokenizer, adding 100 domain‑specific words.

### 4. Sentence-Transformers in C++

The official library is Python‑only. We exported the model to ONNX and ran it via `onnxruntime`. This added +50 MB to the binary, but embeddings were 30% faster than calling a Python subprocess.

## How We Convinced Security and Got Approval

The security team's main fears:

1. **Data leak via the model** - we proved `llama.cpp` makes no network calls (blocked sockets with seccomp on Linux and sandbox on macOS)
2. **Malicious model** - we sign GGUF files with our own signature, verify checksums
3. **Vector database poisoning** - documents are added only after manual review, auto‑update disabled

**Result:** after 3 months of pilot operation (10 engineers) with zero incidents - the assistant was approved for deployment on all workstations (500+ users).
