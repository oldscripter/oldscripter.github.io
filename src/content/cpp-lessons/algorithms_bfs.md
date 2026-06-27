---
title: "BFS"
description: "Поиск в ширину"
pubDate: 2026-06-27
tags: ["C++", "algorithms", "bfs"]
lessonNumber: 2
subcategory: "algorithms"
author: "Stanislav Talanov"
---
<span style="color: #089c00ff;">Breadth-First Search</span> | <span style="color: #7da8e1ff;">Поиск в ширину</span> - это алгоритм обхода графов, который исследует вершины `слоями`: сначала стартовую, затем всех её соседей, потом соседей соседей и т.д.

Представьте волну на воде от брошенного камня — так BFS расходится равномерно во все стороны.

<details>
    <summary>Код типовой реализации BFS</summary>

``` c++
    // BFS implementation

    #include <iostream>
    #include <vector>
    #include <queue>

    using namespace std;

    void bfs(int start, vector<vector<int>>& graph) 
    {
        vector<bool> visited(graph.size(), false);
        queue<int> q;

        visited[start] = true;
        q.push(start);

        while (!q.empty()) 
        {
            int v = q.front();
            q.pop();
            cout << v << " ";

            for (int neighbor : graph[v]) 
            {
                if (!visited[neighbor]) 
                {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
    }

    int main() {
        // Граф: 0-1, 0-2, 1-3, 2-3
        vector<vector<int>> graph = 
        {
            {1, 2},
            {0, 3},
            {0, 3},
            {1, 2}
        };
        bfs(0, graph); // Вывод: 0 1 2 3
        return 0;
    }
```

</details>

## Детали

### Ключевые свойства
- Использует очередь (`FIFO`): первые вошли — первые вышли.
- Находит кратчайший путь в невзвешенных графах (минимальное число рёбер).
- Сложность: `O(V + E)` (`V` — вершины, `E` — рёбра).

### Как работает (по шагам)
1. Поместить стартовую вершину в очередь и отметить её.
2. Пока очередь не пуста:
   - Извлечь вершину `v`.
   - Обработать `v`.
   - Добавить в очередь всех непосещённых соседей вершины `v` и отметить их.

### Где применяется
- <span style="color: #7da8e1ff;">Социальные сети</span>: поиск друзей на расстоянии N рукопожатий.
- <span style="color: #7da8e1ff;">Навигация</span>: кратчайший маршрут в лабиринте или на карте (без учёта пробок).
- <span style="color: #7da8e1ff;">Web-краулеры</span>: обход ссылок на сайтах (страница за страницей).
- <span style="color: #7da8e1ff;">Игры</span>: поиск пути в стратегиях или вычисление минимального числа ходов.

### Отличие от DFS (поиск в глубину)
- <span style="color: #089c00ff;">BFS</span> использует `очередь` и ищет `вширь`, <span style="color: #089c00ff;">гарантирует</span> кратчайший путь.
- <span style="color: #089c00ff;">DFS</span> использует `стек`, уходит `вглубь` и <span style="color: #ff3f3fff;">не гарантирует</span> кратчайший путь.

<br>

## Пример задач с leetcode

Разберём 3 типовые задачи с LeetCode — от простой к средней. Для каждой я привел ключевую идею, код и краткое пояснение.

### 1. LeetCode 733 — Flood Fill (Easy)

<span style="color: #1fb3f3ff;">[🔗 ссылка на leetcode](https://leetcode.com/problems/flood-fill/description/)</span><br>
<span style="color: #f31fdaff;">Условие:</span><br>Дана матрица `image`, стартовая клетка `(sr, sc)` и новый цвет `newColor`. Заменить цвет связной области (4-связность) на новый.

<span style="color: #089c00ff;">Решение:</span><br>BFS от старта, меняем цвет у всех достижимых пикселей с исходным цветом.

<details>
    <summary>Код решения</summary>

```cpp
vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int newColor) 
{
    int oldColor = image[sr][sc];
    if (oldColor == newColor) return image;
    
    int n = image.size(), m = image[0].size();
    queue<pair<int, int>> q;
    q.push({sr, sc});
    image[sr][sc] = newColor;
    
    int dx[] = {-1, 1, 0, 0};
    int dy[] = {0, 0, -1, 1};
    
    while (!q.empty()) 
    {
        auto [x, y] = q.front();
        q.pop();
        
        for (int i = 0; i < 4; i++) 
        {
            int nx = x + dx[i];
            int ny = y + dy[i];

            if (nx >= 0 && 
                nx < n && 
                ny >= 0 && 
                ny < m && 
                image[nx][ny] == oldColor) 
            {
                image[nx][ny] = newColor;
                q.push({nx, ny});
            }
        }
    }
    return image;
}
```
</details><br>

<span style="color: #ea6500ff;">Сложность: </span>`O(N×M)` в среднем и худшем случае (очередь).

---

### 2. LeetCode 994 — Rotting Oranges (Medium)

<span style="color: #1fb3f3ff;">[🔗 ссылка на leetcode](https://leetcode.com/problems/rotting-oranges/description/)</span><br>

<span style="color: #f31fdaff;">Условие:</span><br>В сетке `0` — пусто, `1` — свежий апельсин, `2` — гнилой. Каждую минуту гниль заражает соседние (4 стороны) свежие. За сколько минут все сгниют? Если невозможно — вернуть `-1`.

<span style="color: #089c00ff;">Решение:</span><br>Многоисточниковый BFS. Кладём `все гнилые` в очередь, считаем уровни (минуты).

<details>
    <summary>Код решения</summary>

```cpp
int orangesRotting(vector<vector<int>>& grid) 
{
    int n = grid.size(), m = grid[0].size();
    queue<pair<int, int>> q;
    int fresh = 0;
    
    // Собираем все гнилые и считаем свежие
    for (int i = 0; i < n; i++) 
    {
        for (int j = 0; j < m; j++) 
        {
            if (grid[i][j] == 2) q.push({i, j});
            else if (grid[i][j] == 1) fresh++;
        }
    }
    
    if (fresh == 0) return 0;
    
    int dx[] = {-1, 1, 0, 0};
    int dy[] = {0, 0, -1, 1};
    int minutes = 0;
    
    while (!q.empty()) {
        int size = q.size();
        bool rotted = false;
        
        for (int k = 0; k < size; k++) 
        {
            auto [x, y] = q.front();
            q.pop();
            
            for (int i = 0; i < 4; i++) 
            {
                int nx = x + dx[i];
                int ny = y + dy[i];
                if (nx >= 0 && 
                    nx < n && 
                    ny >= 0 && 
                    ny < m && 
                    grid[nx][ny] == 1) 
                {
                    grid[nx][ny] = 2;
                    fresh--;
                    q.push({nx, ny});
                    rotted = true;
                }
            }
        }
        if (rotted) minutes++;
    }
    
    return fresh == 0 ? minutes : -1;
}
```
</details><br>

<span style="color: #ea6500ff;">Сложность: </span> `O(N×M)` в среднем и худшем случае (очередь).<br>
<span style="color: #04cef7ff;">Ключевая фишка: </span>Обрабатываем очередь `покадрово` — `int size = q.size()` в цикле считает минуты.

---

### 3. LeetCode 127 — Word Ladder (Hard в рейтинге, но Medium по идее)

<span style="color: #1fb3f3ff;">[🔗 ссылка на leetcode](https://leetcode.com/problems/word-ladder/description/)</span><br>

<span style="color: #f31fdaff;">Условие:</span><br>Даны `beginWord`, `endWord` и словарь `wordList`. За одну операцию можно менять **одну букву** в слове. Найти длину кратчайшей трансформации (включая beginWord).

<span style="color: #089c00ff;">Решение:</span><br>BFS по графу слов (рёбра — различие в 1 букву). Вместо построения всех рёбер явно — генерируем все возможные маски (заменяем каждую букву на `*`) и ищем соседей через хеш-таблицу.

<details>
    <summary>Код решения</summary>

```cpp
int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    unordered_set<string> dict(wordList.begin(), wordList.end());
    if (!dict.count(endWord)) return 0;
    
    queue<string> q;
    q.push(beginWord);
    int level = 1;
    
    while (!q.empty()) {
        int size = q.size();
        for (int k = 0; k < size; k++) {
            string word = q.front();
            q.pop();
            
            if (word == endWord) return level;
            
            // Перебираем все позиции
            for (int i = 0; i < word.size(); i++) {
                char orig = word[i];
                for (char c = 'a'; c <= 'z'; c++) {
                    if (c == orig) continue;
                    word[i] = c;
                    if (dict.count(word)) {
                        dict.erase(word);  // Удаляем, чтобы не возвращаться
                        q.push(word);
                    }
                }
                word[i] = orig;
            }
        }
        level++;
    }
    return 0;
}
```
</details><br>

<span style="color: #ea6500ff;">Сложность: </span> `O(M² × N)`, где `M` - длина слова, `N` - количество слов. Не очень хороший результат, но для коротких слов (`≤10`) - отлично.

---

## Полезные приёмы для использования BFS на задачах Leetcode

- <span style="color: #0d8c2aff;">Посещённые</span> - часто используют `vector<vector<bool>>` для сеток или `unordered_set` для строк.
- <span style="color: #0d8c2aff;">Уровни</span> - если нужно количество шагов/минут, используйте цикл `for (int size = q.size(); size > 0; size--)`.
- <span style="color: #0d8c2aff;">Не забывайте про многоисточниковый BFS</span> - кладите все стартовые вершины сразу (как в Rotting Oranges).
- <span style="color: #0d8c2aff;">Неявный граф</span> - не стройте все рёбра явно, генерируйте соседей на лету (Word Ladder, Open the Lock). Это ускоряет результат и позволяет получить лучшие результаты по времени.

