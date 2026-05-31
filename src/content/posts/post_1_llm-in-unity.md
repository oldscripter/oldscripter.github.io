---
title: "LLM in Unity"
description: "From LLMUnity to Deep C++ Integration"
pubDate: 2026-05-31
tags: ["Unity3D", "CLLM", "GameAI", Cpp, IL2CPP]
author: "Stanislav Talanov"
image:
    url: "/images/my-first-post.jpg"
    alt: "My first post"
---

# LLM in Unity: From LLMUnity to Deep C++ Integration

I've been spending time with the latest `LLMUnity` package (v3.0.3) — and it's impressive how far local **LLM integration** in Unity has come.

What works great out of the box:
- RAG with ANN search
- Mobile support (`Android IL2CPP` / `ARM64`, `iOS`)
- Grammar-based output control (JSON, function calling)
- Unity 6 compatibility

I tested the updated chunking methods (sentence/token/word splitting) and the group-based semantic search — solid for the most of use cases, especially character dialogue and knowledge-augmented NPCs.

But `LLMUnity` hides `llama.cpp` behind a C# abstraction. That's good for speed of development. But when you need:
- Custom threading & memory pooling
- Full control over GPU offloading (beyond numGPULayers)
- Low-latency inference on unconventional hardware
- Or a custom semantic cache not tied to usearch
…then the abstraction becomes a bottleneck.

I'm currently exploring hybrid approaches — `LLMUnity` for prototyping, then replacing the backend with a custom `llama.cpp` plugin for production.
