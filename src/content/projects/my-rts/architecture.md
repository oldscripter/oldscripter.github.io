---
title: "Project Last Argument: Architecture Deep Dive"
description: "DOTS & ECS"
pubDate: 2026-06-01
projectName: "Last Argument"
techStack: ["Unity", "DOTS", "ECS", "C#"]
tags: ["architecture", "ecs", "optimization", "unity"]
image:
  url: "/images/projects/my-rts/cover.jpg"
  alt: "Project cover"
---

# Architecture Deep Dive: Building with ECS

When I started Project Dragonheart, I knew I wanted massive battles with hundreds of enemies. That meant the standard GameObject approach wouldn't cut it. Enter Unity's **Data-Oriented Tech Stack (DOTS)**.

## Why ECS?

Traditional Unity development uses GameObjects and MonoBehaviours. It's great for prototyping, but cache misses become a problem when you have thousands of entities.

ECS solves this by:
- **Separating data from logic** (Components store data, Systems process it)
- **Cache-friendly memory layouts** (All Health components sit together in memory)
- **Automatic jobification** (Systems run in parallel by default)

## Lessons Learned

1. **Debugging is harder** — ECS removes the hierarchy, so you need custom tooling
2. **Not everything needs ECS** — UI, audio, and some logic are fine in MonoBehaviour
3. **Baking matters** — The authoring → baking → runtime flow requires careful planning