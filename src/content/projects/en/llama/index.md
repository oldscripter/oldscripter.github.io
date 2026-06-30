---
title: "LLM Inference Engine with llama.cpp"
description: "A deep dive into GGML, CUDA optimization, and cross-platform C++ inference"
pubDate: 2026-05-14
projectName: "LLM Inference Engine"
githubUrl: "https://github.com/oldscripter/llama-inference-harness"
demoUrl: "https://github.com/oldscripter/llama-inference-harness"
techStack: ["AI", "C++", "llama.cpp", "LLM", "GGML", "CUDA"]
tags: ["AI", "C++", "llama.cpp", "LLM", "GGML", "CUDA"]
image:
  url: "/images/projects/llama/index.jpg"
  alt: "Project cover"
---

### The Challenge

Can you build a **production-ready inference harness** for large language models in a single day + night? That was my goal — to create a C++ tool that demonstrates deep expertise with `llama.cpp` and GGML, capable of running on CPU, CUDA, or Metal with precise performance metrics.

The result is a clean, well-documented inference engine that:
- Loads any GGUF model
- Offloads transformer layers to GPU with fine-grained control
- Measures TTFT, tokens/second, and peak memory usage
- Runs on Windows, Linux, and macOS

---

### What I Built

A C++17 application that wraps `llama.cpp` with:

- **Runtime backend selection** (CPU/CUDA/Metal via `--backend`)
- **Precise GPU layer offloading control** (`--gpu-layers N`)
- **Production metrics** (TTFT, Prefill/Generation t/s, peak memory)
- **Automatic benchmark suite** comparing different configurations

The code is clean, follows modern CMake practices, and is ready for integration into production systems.

---

### Key Technical Deep Dives

#### 1. Navigating llama.cpp's Evolving API

Working with `llama.cpp` taught me that the library is under active development. I navigated recent breaking changes:

| API Change | Implementation |
|------------|----------------|
| `llama_sampling_context` → `llama_sampler_chain` | Adopted the new chain-of-samplers pattern |
| Vocabulary separation (`llama_vocab`) | Used `llama_model_vocab()` for tokenizer access |
| `llama_tokenize(ctx)` → `llama_tokenize(vocab)` | Switched to vocabulary-based tokenization |

#### 2. GPU Optimization: Layer Offloading

The most critical optimization is controlling how many transformer layers run on GPU:

```cpp
llama_model_params model_params = llama_model_default_params();
model_params.n_gpu_layers = config.n_gpu_layers;  // Key parameter!
```

Example benchmark on **NVIDIA RTX 5060 8GB** vs **AMD Ryzen 7 7800X3D 8-Core** with qwen2-0_5b-instruct-q8_0:

| Configuration | Gen Speed (t/s) | TTFT (ms) | Prefill (t/s) | Memory (MB) |
|---------------|-----------------|-----------|---------------|-------------|
| CPU (baseline) | 49.97 | 23 | 101.0 | 502 |
| CUDA (5 layers) | 80.35 | 18 | 101.2 | 42 |
| CUDA (20 layers) | 299.16 | 7 | 459.5 | 0 |
| **CUDA (99 = all layers)** | **382.50** | **6** | **918.4** | **0** |

![Benchmark](/images/projects/llama/benchmark.jpg)

#### 3. Precise Performance Measurement

For CUDA, I used `cudaEvent` for GPU-accurate timing:

```cpp
cudaEvent_t start, stop;
cudaEventRecord(start);
llama_decode(ctx_, batch);
cudaEventRecord(stop);
float elapsed_ms;
cudaEventElapsedTime(&elapsed_ms, start, stop);
```

This avoids CPU-GPU synchronization overhead and gives true hardware timing.

#### 4. Cross-Platform Memory Tracking

Implemented memory usage tracking for Windows (`GetProcessMemoryInfo`), Linux (`getrusage`), and macOS to measure peak consumption during inference.

---

### Challenges Overcome

| Challenge | Solution |
|-----------|----------|
| `llama_tokenize` returning -2 | Switched to one-pass tokenization with fixed buffer |
| Incomplete `llama_model` type error | Included `llama-model.h` or used public API |
| CUDA not finding Visual Studio | Used Developer Command Prompt |
| Missing DLLs on Windows | Copied `llama.dll`, `ggml-*.dll` to executable directory |

---

### Key Takeaways

Building this inference harness taught me:

1. **Follow upstream changes** — `llama.cpp` evolves rapidly; always check the latest API
2. **Understand GGML architecture** — backends, memory management, tensor operations
3. **Measure what matters** — TTFT matters more than raw throughput for interactive apps
4. **Write portable code** — CPU/CUDA/Metal with runtime selection

---

### The Code

The full project is available on GitHub:

🔗 **[github.com/oldscripter/llama-inference-harness](https://github.com/oldscripter/llama-inference-harness)**

```bash
git clone https://github.com/oldscripter/llama-inference-harness.git
cd llama-inference-harness
git submodule update --init --recursive

mkdir build && cd build
cmake .. -DGGML_CUDA=ON
cmake --build . --config Release -j4

./llama_harness --model model.gguf --backend cuda --gpu-layers 99
```

---

### What's Next?

This project is a foundation. Future improvements could include:

- **Continuous batching** — Higher throughput for multiple concurrent requests
- **Speculative decoding** — Faster generation with draft models
- **Quantization-aware inference** — Better accuracy at low bit depths
- **WebAssembly build** — Browser-based inference

---

### Conclusion

Building a production-ready inference engine for LLMs is challenging but achievable. The combination of `llama.cpp`'s excellent GGML library, modern C++, and careful performance engineering makes on-device AI a reality.

I'm excited to see what others build with this codebase and to continue exploring the frontier of efficient LLM inference.

---

*Questions? Comments? Feel free to open an issue on GitHub or reach out.*
