---
title: "Building RTS Formations with Unity ECS"
description: "Today I spent several hours implementing formation movement for my RTS project using Unity ECS."
pubDate: 2026-05-30
tags: ["Unity", "C#", "ECS", "RTS"]
author: "Stanislav Talanov"
image:
  url: "/images/blog/announcement.jpg"
  alt: "C++ code and game development concept"
---

# Building RTS Formations with Unity ECS: A Journey Through Physics, Math, and Persistence

Today I spent several hours implementing formation movement for my RTS project using Unity ECS. It turned out to be much more challenging than I expected, but the result is incredibly satisfying.

## The Goal

I wanted my units to do two things:
1. Move as a **cohesive group** when right-clicking
2. **Hold their formation** even when pushed or interrupted

Simple in theory. Not so simple in practice.

## The Problems We Faced

### 1. Physics Chaos
Units would spin, slide, and scatter when they collided. The physics engine treated each unit as an independent rigidbody — great for realism, terrible for formations.

**Solution:** Made units kinematic (`InverseMass = 0`). They still collide but no longer react to forces.

### 2. The Formation Shape
Units were filling rows from the back, leaving the **front row incomplete**. This looked terrible — the army's front line should be full, not the back!

**The fix was one line of code:**
```csharp
// Before: units filled from the back
float3 directionToTarget = targetCenter - center;

// After: units fill from the front
float3 directionToTarget = center - targetCenter;
```

### 3. Broken Formations During Movement
After units reached their destination, the formation stopped updating. When other units pushed them, they never returned to position.

**Solution:** Made formations **always active** — constantly updating ideal positions and correcting deviations.

### 4. Tuple Runtime Errors
Using C# tuples `(Entity, float3)` inside ECS systems caused `InvalidProgramException` — the IL code just broke.

**Fix:** Replaced tuples with arrays and index-based sorting:
```csharp
Entity[] sortedEntities = new Entity[units.Count];
int[] indices = new int[units.Count];
// Sort indices, then fill arrays
```

### 5. Rotation from Collisions
Units would spin wildly when bumped. Setting `InverseInertia = float3.zero` and making bodies kinematic finally solved it.

## The Final Solution

Here's what the working formation system looks like:

**Formation Components:**
```csharp
public struct FormationMember : IComponentData
{
    public int FormationID;
    public int RowIndex;
    public int ColIndex;
}

public struct FormationGroupData : IComponentData
{
    public int FormationID;
    public float3 TargetCenter;
    public float3 FormationForward;
    public int MaxUnitsPerRow;
    public float Spacing;
    public int TotalUnits;
}
```

**Key insights that made it work:**
- Sort units by X position, then Z
- Distribute in a grid using rows and columns
- **Invert the direction** so front rows fill completely
- Keep formations **always active** — never stop updating ideal positions
- Use kinematic bodies with locked rotation
- Avoid tuples — use arrays in ECS systems

## The Result

The army now moves as one. When I right-click, units arrange themselves in a perfect rectangle — **full rows in front, any incomplete row goes to the back**. If someone shoves them, they smoothly slide back into position. No spinning, no scattering, no chaos.

The formation stays intact from the moment they start moving until they reach their destination — and even after, they'll correct themselves if disturbed.

## Lessons Learned

1. **One line of math can change everything** — the `center - targetCenter` vs `targetCenter - center` completely fixed row ordering
2. **ECS doesn't like tuples** — use arrays and indices
3. **Kinematic bodies are your friend** for RTS movement
4. **Formations need constant correction**, not just one-time positioning
5. **Always sort units** before assigning formation positions

The code is now clean, stable, and ready for actual gameplay. Next step: pathfinding and obstacle avoidance — but that's a story for another day.

---

*Built with Unity ECS 1.0 + Physics package.* 

 - The complete code is available on GitHub: 
[https://github.com/oldscripter/unity_ECS_example](https://github.com/oldscripter/unity_ECS_example)