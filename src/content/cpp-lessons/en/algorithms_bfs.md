---
title: "BFS"
description: "Breadth-First Search"
pubDate: 2026-06-27
tags: ["C++", "algorithms", "bfs"]
lang: "en"
lessonNumber: 2
subcategory: "algorithms"
author: "Stanislav Talanov"
---
<span style="color: #089c00ff;">Breadth-First Search</span> — is a graph traversal algorithm that explores vertices in `layers`: first the starting vertex, then all its neighbors, then the neighbors' neighbors, and so on.

Imagine a wave on water from a thrown stone — that's how BFS spreads evenly in all directions.

<details>
    <summary>Typical BFS implementation code</summary>

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
        // Graph: 0-1, 0-2, 1-3, 2-3
        vector<vector<int>> graph = 
        {
            {1, 2},
            {0, 3},
            {0, 3},
            {1, 2}
        };
        bfs(0, graph); // Output: 0 1 2 3
        return 0;
    }
```

</details>

## Details

### Key properties
- Uses a queue (`FIFO`): first in — first out.
- Finds the shortest path in unweighted graphs (minimum number of edges).
- Complexity: `O(V + E)` (`V` — vertices, `E` — edges).

### How it works (step by step)
1. Place the starting vertex in the queue and mark it.
2. While the queue is not empty:
   - Extract vertex `v`.
   - Process `v`.
   - Add all unvisited neighbors of vertex `v` to the queue and mark them.

### Applications
- <span style="color: #7da8e1ff;">Social networks</span>: finding friends at N handshakes distance.
- <span style="color: #7da8e1ff;">Navigation</span>: shortest route in a maze or on a map (without traffic jams).
- <span style="color: #7da8e1ff;">Web crawlers</span>: traversing links on websites (page by page).
- <span style="color: #7da8e1ff;">Games</span>: pathfinding in strategies or calculating the minimum number of moves.

### Difference from DFS (Depth-First Search)
- <span style="color: #089c00ff;">BFS</span> uses a `queue` and searches `in breadth`, <span style="color: #089c00ff;">guarantees</span> the shortest path.
- <span style="color: #089c00ff;">DFS</span> uses a `stack`, goes `in depth` and <span style="color: #ff3f3fff;">does not guarantee</span> the shortest path.

<br>

## Example LeetCode Problems

Let's solve 3 classic LeetCode problems — from easy to medium. For each, I've provided the key idea, code, and a brief explanation.

### 1. LeetCode 733 — Flood Fill (Easy)

<span style="color: #1fb3f3ff;">[🔗 link to leetcode](https://leetcode.com/problems/flood-fill/description/)</span><br>
<span style="color: #f31fdaff;">Problem:</span><br>Given a matrix `image`, a starting cell `(sr, sc)`, and a new color `newColor`. Replace the color of the connected area (4-directional) with the new color.

<span style="color: #089c00ff;">Solution:</span><br>BFS from the start, change the color of all reachable pixels with the original color.

<details>
    <summary>Solution code</summary>

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

<span style="color: #ea6500ff;">Complexity: </span>`O(N×M)` in both average and worst case (queue).

---

### 2. LeetCode 994 — Rotting Oranges (Medium)

<span style="color: #1fb3f3ff;">[🔗 link to leetcode](https://leetcode.com/problems/rotting-oranges/description/)</span><br>

<span style="color: #f31fdaff;">Problem:</span><br>In a grid, `0` is empty, `1` is a fresh orange, `2` is a rotten orange. Every minute, rot spreads to adjacent (4-directional) fresh oranges. How many minutes until all oranges rot? If impossible — return `-1`.

<span style="color: #089c00ff;">Solution:</span><br>Multi-source BFS. Put `all rotten` oranges in the queue, count levels (minutes).

<details>
    <summary>Solution code</summary>

```cpp
int orangesRotting(vector<vector<int>>& grid) 
{
    int n = grid.size(), m = grid[0].size();
    queue<pair<int, int>> q;
    int fresh = 0;
    
    // Collect all rotten and count fresh
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

<span style="color: #ea6500ff;">Complexity: </span> `O(N×M)` in both average and worst case (queue).<br>
<span style="color: #04cef7ff;">Key trick: </span>Process the queue `frame by frame` — `int size = q.size()` in the loop counts minutes.

---

### 3. LeetCode 127 — Word Ladder (Hard in rating, but Medium in concept)

<span style="color: #1fb3f3ff;">[🔗 link to leetcode](https://leetcode.com/problems/word-ladder/description/)</span><br>

<span style="color: #f31fdaff;">Problem:</span><br>Given `beginWord`, `endWord`, and a dictionary `wordList`. In one operation, you can change **one letter** in a word. Find the length of the shortest transformation sequence (including beginWord).

<span style="color: #089c00ff;">Solution:</span><br>BFS on the graph of words (edges represent a difference of 1 letter). Instead of explicitly building all edges — generate all possible masks (replace each letter with `*`) and find neighbors through a hash table.

<details>
    <summary>Solution code</summary>

```cpp
int ladderLength(string beginWord, string endWord, vector<string>& wordList) 
{
    unordered_set<string> dict(wordList.begin(), wordList.end());
    if (!dict.count(endWord)) return 0;
    
    queue<string> q;
    q.push(beginWord);
    int level = 1;
    
    while (!q.empty()) 
    {
        int size = q.size();
        for (int k = 0; k < size; k++) 
        {
            string word = q.front();
            q.pop();
            
            if (word == endWord) return level;
            
            // Iterate over all positions
            for (int i = 0; i < word.size(); i++) 
            {
                char orig = word[i];
                for (char c = 'a'; c <= 'z'; c++) 
                {
                    if (c == orig) continue;
                    word[i] = c;
                    if (dict.count(word)) 
                    {
                        dict.erase(word);  // Remove to avoid returning
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

<span style="color: #ea6500ff;">Complexity: </span> `O(M² × N)`, where `M` is the word length, `N` is the number of words. Not the best result, but for short words (`≤10`) — excellent.

---

## Useful techniques for using BFS on LeetCode problems

- <span style="color: #0d8c2aff;">Visited</span> — often use `vector<vector<bool>>` for grids or `unordered_set` for strings.
- <span style="color: #0d8c2aff;">Levels</span> — if you need the number of steps/minutes, use the loop `for (int size = q.size(); size > 0; size--)`.
- <span style="color: #0d8c2aff;">Don't forget about multi-source BFS</span> — put all starting vertices at once (as in Rotting Oranges).
- <span style="color: #0d8c2aff;">Implicit graph</span> — don't explicitly build all edges, generate neighbors on the fly (Word Ladder, Open the Lock). This speeds up the result and allows for better time performance.