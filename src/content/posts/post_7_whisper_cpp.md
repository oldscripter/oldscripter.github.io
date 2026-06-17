---
title: "Building a Local Voice Assistant with llama.cpp and whisper.cpp"
pubDate: 2026-06-17
tags: ["whisper.cpp", "llama.cpp", "AI", "LLM"]
author: "Stanislav Talanov"
image:
  url: "/images/blog/announcement.jpg"
  alt: "Building a Local Voice Assistant with llama.cpp and whisper.cpp"
---

## 🎙️ Building a Local Voice Assistant with llama.cpp and whisper.cpp

I'm building my own engine. Here's what I've learned integrating `llama.cpp` with `whisper.cpp` for a local, private voice assistant.

### The Stack

The architecture is simple but powerful: `whisper.cpp` for speech-to-text (STT), `llama.cpp` for LLM inference with GGUF models, and optional TTS for voice output . Everything runs locally, with no API calls or internet access required after initial setup .

### The Pipeline

```
Mic → whisper.cpp (STT) → llama.cpp (LLM) → TTS → Speaker
```

**1. Recording & STT with whisper.cpp**

The flow starts with audio input. Record from the microphone, save as WAV, then pipe to `whisper-cli` for transcription .

```bash
./stt/bin/whisper-cli ../audio/speech.wav --model ../stt/models/ggml-tiny.bin
```

The transcribed text becomes the prompt for the LLM .

**2. LLM Inference with llama.cpp**

`llama.cpp` loads a quantized GGUF model. The TinyLlama-1.1B Q4_K_M is a solid starting point , but you can use any GGUF model:

```bash
# Run inference with llama.cpp
./llama-cli -m ./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
    -p "User: {transcribed_text}\nAssistant:" -n 50
```

For production, consider the `llama-server` approach—spawn it once, then send HTTP requests .

```bash
# Start server once
./llama-server -m models/tinyllama.gguf --port 8000

# Then query via HTTP
curl http://localhost:8000/completion -d '{"prompt": "User: Hello\nAssistant:"}'
```

**3. Text-to-Speech (Optional)**

For full voice output, Piper TTS offers fast, lightweight synthesis .

```bash
./tts/piper/piper --model tts/voice/libritts_r/en_US-libritts_r-medium.onnx \
    --output_file output.wav
```

### Key Integration Notes

**Build Dependencies:** Both `whisper.cpp` and `llama.cpp` are pure C++ and compile cleanly. I use CMake with submodules .

**Model Selection:** Quantization matters. `Q4_K_M` offers the best quality-size tradeoff for most use cases . On a Raspberry Pi 4 with 4GB RAM, TinyLlama-1.1B runs, but 7B+ models need a capable GPU .

**GPU Acceleration:** For NVIDIA, `-DLLAMA_CUBLAS=on` or `LLAMA_CUDA=1` enables GPU offloading . For Mac, Metal support is baked in . Vulkan works for cross-platform .

**Cross-platform:** This works on Windows, macOS, Linux, and even Android/iOS .

### Next Steps

Building the engine is the first step. True conversation requires context management—sliding windows and summaries. I'm also exploring RAG for document Q&A and batching audio chunks for lower latency .

The tools are mature. The hardware is ready. Let's build.