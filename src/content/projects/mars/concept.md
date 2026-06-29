---
title: "Концепция"
description: "Структура и классификация компонентов"
pubDate: 2026-06-28
projectName: "Mars Engine"
githubUrl: "https://github.com/oldscripter"
demoUrl: "https://github.com/oldscripter"
techStack: ["C++", "SDL3", "CMake"]
tags: ["engine", "mars"]
image:
  url: "/images/projects/mars/mars.png"
  alt: "Project cover"
---

## Пространства имен

<img src="/images/projects/mars/concept/namespaces.png" alt="Структура компонентов Mars" align="center" style="max-width: 600px;">

Mars имеет следующий пространства имен:
- `mrs`	- корневой namespace
- `mrs::core` - для компонентов типа <span style="color: #00FFFF">&nbsp;Core</span>
- `mrs::tool` - для компонентов типа <span style="color: #FFD800">&nbsp;Tool</span>
- `mrs::obj` - для компонентов типа <span style="color: #00FF21">&nbsp;&nbsp;Object</span>
- `mrs::res` - для компонентов типа <span style="color: #BC00FC">&nbsp;&nbsp;Resource</span>

Каждое пространство имен, соответствует типу сохраняемых в нем компонентов.

## Типы компонентов

Компоненты Mars имеют следующие типы:

 - <span style="color: #00FFFF">Core</span> | `namespace core`: компоненты и интерфейсы, обеспечивающие центральную логику Mars. Сюда входят:
	- Циклические функции `update` для потоковых рассчетов обновления состояния объектов
	- Менеджер объектов
	- Менеджер ресурсов
	- Рендер
	- Менеджер ввода
	- Менеджер аудио
	- Менеджер сигналов
	- Логгер
	- Профилировщик

 - <span style="color: #FFD800">Tool</span> | `namespace tool`: компоненты, применяемые для в качестве вспомогательных функций и структур для составления высокоуровневых игровых объектов. Сюда входят:
	- Вспомогательные структуры (`Vector2`, `Color`, `Sprite`, `Animation` и т.д.)
	- Конвертеры (`RGB <-> HEX`, `bitmap <-> texture`, `wav <-> sound`, и т.д.)
	- Инструменты рендера примитивов (`DrawRect`, `DrawLine`, `DrawCircle` и т.д.)
	- Инструменты рендера текста (`DrawText`, `DrawDebugText`)
	- Инструменты воспроизведения звука(`PlayFX`, `PlayMusic`, и т.д.)
	
 - <span style="color: #00FF21">Object</span> | `namespace obj`: высокоуровневые объекты, наследующие единый интерфейс. Используются как базовый класс для создания непосредственных игровых объектов. Жизненный цикл управляются менеджером объектов.
 
 - <span style="color: #BC00FC">Resource</span> | `namespace res`: объекты русурсов, используемые игровыми объектами (`MObject`) и управялемые менеджером ресурсов. К ним относятся:
	- Image
	- Sound
	- Font
  
## Визуализация структуры 
<img src="/images/projects/mars/concept/structure.png" alt="Структура компонентов Mars" align="center">
