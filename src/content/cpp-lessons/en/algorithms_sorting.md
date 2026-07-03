---
title: "Sorting Algorithms"
description: "All sorting algorithms"
pubDate: 2026-06-25
tags: ["C++", "algorithms", "sorting"]
lang: "en"
lessonNumber: 1
subcategory: "algorithms"
author: "Stanislav Talanov"
---

Below I have grouped sorting algorithms for classification. The first group is for those who don't want to reinvent the wheel: sorting algorithms in the standard library (`<algorithm>`). All subsequent groups are for those who want to understand the internals of sorting algorithms or are preparing for interviews.

### 1. Standard STL Sorting Algorithms
This is what is used in 95% of cases. No need to reinvent the wheel when it's already there.

*   <span style="color: #089c00ff;">std::sort</span> — implements the <span style="color: #7da8e1ff;">introsort</span> algorithm (a hybrid of Quick Sort, Heap Sort, and Insertion Sort). The fastest for random data. Complexity `O(n log n)`.
*   <span style="color: #089c00ff;">std::stable_sort</span> — implements the <span style="color: #7da8e1ff;">Merge Sort</span> algorithm. Preserves the relative order of equal elements. Complexity `O(n log n)`.
*   <span style="color: #089c00ff;">std::partial_sort</span> — implements the <span style="color: #7da8e1ff;">Heap Sort</span> algorithm. Used when you need to find and sort only the first `k` elements (e.g., top-10). Complexity `O(n log k)`.
*   <span style="color: #089c00ff;">std::nth_element</span> — implements the <span style="color: #7da8e1ff;">Quick Select</span> algorithm. Does not sort completely, but places the *n-th* element in its final position, partitioning the array into "smaller" and "larg" elements. Complexity `O(n)` on average.

| Algorithm | Average Complexity | Worst-Case Complexity | Memory | Stable | When to Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| std::sort | `O(n log n)` | `O(n log n)` | `O(log n)` | 🔴 | `Default` For any data. Hybrid of quick + heap sort. |
| std::stable_sort | `O(n log n)` | `O(n log n)` | `O(n)` | 🟢 | When order of equal elements matters (sorting by 2 fields). |
| std::partial_sort | `O(n log k)` | `O(n log k)` | `O(1)` | 🔴 | Need to find `top-k` elements in correct order. |
| std::nth_element | `O(n)` | `O(n)` | `O(1)` | 🔴 | Need to find median or partition array into "smaller" and "larger" (without sorting within groups). |

---

### 2. Quadratic Sorting Algorithms
Simple to understand, but slow on large data. Used for small arrays (up to ~30 elements) as an optimization inside complex algorithms.

*   <span style="color: #089c00ff;">Bubble Sort</span> — classic, adjacent elements are swapped if they are in the wrong order.
*   <span style="color: #089c00ff;">Insertion Sort</span> — take an element and insert it into the already sorted part on the left. **Best** among quadratic sorts for nearly sorted data `O(n)` - in the best case.
*   <span style="color: #089c00ff;">Selection Sort</span> — find the minimum element and swap it with the current position. Unstable, but makes few swaps.

> Note that in the table below I included a "Best Complexity" column — it only makes sense for sorts in this group. For all other groups, 'best' does not differ from 'average'.

| Algorithm | Average Complexity | Worst-Case Complexity | Best Complexity | Memory | Stable | Features |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Insertion | `O(n^2)` | `O(n^2)` | `O(n)` | `O(1)` | 🟢 | **Ideal** for nearly sorted data. Used inside `std::sort` for chunks < 32 elements. |
| Bubble | `O(n^2)` | `O(n^2)` | `O(n)` | `O(1)` | 🟢 | Slow. Only interesting for optimization (if no swaps — stop). |
| Selection | `O(n^2)` | `O(n^2)` | `O(n^2)` | `O(1)` | 🔴 | Makes few swaps. Useless in general cases. |

<details>
    <summary>Insertion Sort Code</summary>

``` c++
    // Insertion sort implementation
    template<typename T>
    void insertionSort(vector<T>& arr) 
    {
        int n = arr.size();
        for (int i = 1; i < n; i++) 
        {
            T key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) 
            {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
```
</details>

<details>
    <summary>Bubble Sort Code</summary>

```c++
    // Bubble sort implementation
    template<typename T>
    void bubbleSort(vector<T>& arr) 
    {
        int n = arr.size();
        for (int i = 0; i < n - 1; i++) 
        {
            bool swapped = false;
            for (int j = 0; j < n - i - 1; j++) 
            {
                if (arr[j] > arr[j + 1]) 
                {
                    swap(arr[j], arr[j + 1]);
                    swapped = true;
                }
            }
            // If no swaps, the array is already sorted
            if (!swapped) break;
        }
    }
```
</details>

<details>
    <summary>Selection Sort Code</summary>

``` c++
    // Selection sort implementation
    template<typename T>
    void selectionSort(vector<T>& arr) 
    {
        int n = arr.size();
        for (int i = 0; i < n - 1; i++) 
        {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) 
            {
                if (arr[j] < arr[minIdx]) 
                {
                    minIdx = j;
                }
            }
            if (minIdx != i) 
            {
                swap(arr[i], arr[minIdx]);
            }
        }
    }
```
</details>

---

### 3. Efficient Sorting Algorithms
Used for large data volumes.

*   <span style="color: #089c00ff;">Quick Sort</span> — recursive partitioning around a pivot element. The fastest in practice, but there is a risk of `O(n^2)` on bad data (if randomization is not used).
*   <span style="color: #089c00ff;">Merge Sort</span> — recursively divide the array in half, sort the halves, and merge. Requires additional memory `O(n)`. Stable.
*   <span style="color: #089c00ff;">Heap Sort</span> — build a max-heap and sequentially extract the root. Runs in guaranteed `O(n log n)` without additional memory (in-place), but slower than Quick Sort in practice.

| Algorithm | Average Complexity | Worst-Case Complexity | Memory | Stable | Features |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Quick Sort | `O(n log n)` | `O(n^2)` | `O(log n)` | 🔴 | Fastest in practice. Poor on already sorted data (if bad pivot selection). |
| Merge Sort | `O(n log n)` | `O(n log n)` | `O(n)` | 🟢 | Reliable but memory-hungry. Good for linked lists. |
| Heap Sort | `O(n log n)` | `O(n log n)` | `O(1)` | 🔴 | Guaranteed speed, but slower than quicksort due to memory "jumps" (cache misses). |

<details>
    <summary>Quick Sort Code</summary>

``` c++
    // Quick sort implementation
    template<typename T>
    int partition(vector<T>& arr, int low, int high) 
    {
        // Choose middle element as pivot (avoids worst-case)
        int mid = low + (high - low) / 2;
        swap(arr[mid], arr[high]);
        
        T pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) 
        {
            if (arr[j] <= pivot) 
            {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        return i + 1;
    }

    template<typename T>
    void quickSortRec(vector<T>& arr, int low, int high) 
    {
        if (low < high) 
        {
            int pi = partition(arr, low, high);
            quickSortRec(arr, low, pi - 1);
            quickSortRec(arr, pi + 1, high);
        }
    }

    template<typename T>
    void quickSort(vector<T>& arr) 
    {
        if (arr.size() > 1) 
        {
            quickSortRec(arr, 0, arr.size() - 1);
        }
    }
```
</details>

<details>
    <summary>Merge Sort Code</summary>

``` c++
    // Merge sort implementation
    template<typename T>
    void merge(vector<T>& arr, int left, int mid, int right) 
    {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        
        // Create temporary arrays
        vector<T> L(n1), R(n2);
        
        for (int i = 0; i < n1; i++) L[i] = arr[left + i];
        for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
        
        int i = 0, j = 0, k = left;
        
        while (i < n1 && j < n2) 
        {
            if (L[i] <= R[j]) 
            {
                arr[k] = L[i];
                i++;
            }
            else
            {
                arr[k] = R[j];
                j++;
            }
            k++;
        }
        
        while (i < n1) 
        {
            arr[k] = L[i];
            i++;
            k++;
        }
        
        while (j < n2) 
        {
            arr[k] = R[j];
            j++;
            k++;
        }
    }

    template<typename T>
    void mergeSortRec(vector<T>& arr, int left, int right) 
    {
        if (left < right) 
        {
            int mid = left + (right - left) / 2;
            mergeSortRec(arr, left, mid);
            mergeSortRec(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }

    template<typename T>
    void mergeSort(vector<T>& arr) 
    {
        if (arr.size() > 1) 
        {
            mergeSortRec(arr, 0, arr.size() - 1);
        }
    }
```
</details>

<details>
    <summary>Heap Sort Code</summary>

``` c++
    // Heap sort implementation
    template<typename T>
    void heapify(vector<T>& arr, int n, int i) 
    {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        
        if (largest != i) 
        {
            swap(arr[i], arr[largest]);
            heapify(arr, n, largest);
        }
    }

    template<typename T>
    void heapSort(vector<T>& arr) 
    {
        int n = arr.size();
        
        // Build heap (rearrange array)
        for (int i = n / 2 - 1; i >= 0; i--) 
        {
            heapify(arr, n, i);
        }
        
        // Extract elements from heap
        for (int i = n - 1; i > 0; i--) 
        {
            swap(arr[0], arr[i]);
            heapify(arr, i, 0);
        }
    }
```
</details>

---

### 4. Special-Purpose Sorting Algorithms
Used when the nature of the data is known (e.g., limited range of numbers).

*   <span style="color: #089c00ff;">Counting Sort</span> — count the occurrences of each value. Runs in `O(n+k)`, where `k` is the value range. Requires a lot of memory if numbers are large.
*   <span style="color: #089c00ff;">Radix Sort</span> — sorting by digits (using counting sort internally). Runs in `O(n*w)`, where `w` is the number of digits.
*   <span style="color: #089c00ff;">Bucket Sort</span> — distribute elements into buckets, sort each bucket with insertion sort or recursively.

> Note that in the table below there are no concepts like 'average' and 'worst-case' complexity — for sorts in this group they are equal.

| Algorithm | Complexity | Memory | Stable | Limitation |
| :--- | :--- | :--- | :--- | :--- |
| Counting | `O(n + k)` | `O(k)` | 🟢 | Only for **integers** in a narrow range `k`. If `k` is huge — memory will blow up. |
| Radix | `O(n * w)` | `O(n + b)` | 🟢 | Where `w` is the number of digits, `b` is the base. Does not compare elements. |
| Bucket | `O(n + k)` | `O(n * k)` | 🟢 | Requires uniform data distribution (so buckets are filled evenly). |

<details>
    <summary>Counting Sort Code</summary>

``` c++
    // Counting sort implementation
    void countingSort(vector<int>& arr) 
    {
        if (arr.empty()) return;
        
        int max_val = *max_element(arr.begin(), arr.end());
        int min_val = *min_element(arr.begin(), arr.end());
        int range = max_val - min_val + 1;
        
        vector<int> count(range, 0);
        vector<int> output(arr.size());
        
        // Count
        for (int val : arr) 
        {
            count[val - min_val]++;
        }
        
        // Transform count to positions
        for (int i = 1; i < range; i++) 
        {
            count[i] += count[i - 1];
        }
        
        // Build output array
        for (int i = arr.size() - 1; i >= 0; i--) 
        {
            output[count[arr[i] - min_val] - 1] = arr[i];
            count[arr[i] - min_val]--;
        }
        
        arr = output;
    }
```
</details>

<details>
    <summary>Radix Sort Code</summary>

``` c++
    // Radix sort implementation
    void countingSortForRadix(vector<int>& arr, int exp) 
    {
        int n = arr.size();
        vector<int> output(n);
        vector<int> count(10, 0);
        
        // Count digits
        for (int i = 0; i < n; i++) 
        {
            count[(arr[i] / exp) % 10]++;
        }
        
        // Transform to positions
        for (int i = 1; i < 10; i++) 
        {
            count[i] += count[i - 1];
        }
        
        // Build output array
        for (int i = n - 1; i >= 0; i--) 
        {
            output[count[(arr[i] / exp) % 10] - 1] = arr[i];
            count[(arr[i] / exp) % 10]--;
        }
        
        arr = output;
    }

    void radixSort(vector<int>& arr) 
    {
        if (arr.empty()) return;
        
        int max_val = *max_element(arr.begin(), arr.end());
        
        // Sort by each digit
        for (int exp = 1; max_val / exp > 0; exp *= 10) 
        {
            countingSortForRadix(arr, exp);
        }
    }
```
</details>

<details>
    <summary>Bucket Sort Code</summary>

``` c++
    // Bucket sort implementation

    // Version 1: For floating-point numbers [0, 1)
    template<typename T>
    void bucketSortFloat(vector<T>& arr) 
    {
        if (arr.empty()) return;
        
        int n = arr.size();
        
        // 1. Create n empty buckets
        vector<vector<T>> buckets(n);
        
        // 2. Distribute elements into buckets
        // Assuming numbers are in range [0, 1)
        for (int i = 0; i < n; i++) 
        {
            int bucketIndex = static_cast<int>(n * arr[i]);
            // Protection against out of bounds (if number == 1.0)
            if (bucketIndex == n) bucketIndex = n - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // 3. Sort each bucket (using insertion sort)
        for (int i = 0; i < n; i++) 
        {
            sort(buckets[i].begin(), buckets[i].end()); // or insertionSort
        }
        
        // 4. Collect result
        int index = 0;
        for (int i = 0; i < n; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }

    // Version 2: For integers with arbitrary range
    template<typename T>
    void bucketSortInt(vector<T>& arr) 
    {
        if (arr.empty()) return;
        
        int n = arr.size();
        
        // Find min and max
        T min_val = *min_element(arr.begin(), arr.end());
        T max_val = *max_element(arr.begin(), arr.end());
        
        // If all elements are equal
        if (min_val == max_val) return;
        
        // Number of buckets = n (can be adjusted)
        int numBuckets = n;
        vector<vector<T>> buckets(numBuckets);
        
        // Distribute into buckets
        for (int i = 0; i < n; i++) 
        {
            // Normalize value to range [0, 1)
            double normalized = static_cast<double>(arr[i] - min_val) / (max_val - min_val + 1);
            int bucketIndex = static_cast<int>(numBuckets * normalized);
            // Protection against out of bounds
            if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // Sort each bucket
        for (int i = 0; i < numBuckets; i++) 
        {
            sort(buckets[i].begin(), buckets[i].end());
        }
        
        // Collect result
        int index = 0;
        for (int i = 0; i < numBuckets; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }

    // Version 3: Using lists (std::list) for efficient insertion
    template<typename T>
    void bucketSortList(vector<T>& arr) 
    {
        if (arr.empty()) return;
        
        int n = arr.size();
        T min_val = *min_element(arr.begin(), arr.end());
        T max_val = *max_element(arr.begin(), arr.end());
        
        if (min_val == max_val) return;
        
        int numBuckets = n;
        vector<list<T>> buckets(numBuckets);
        
        // Distribute into buckets (using lists for O(1) insertion)
        for (int i = 0; i < n; i++) 
        {
            double normalized = static_cast<double>(arr[i] - min_val) / (max_val - min_val + 1);
            int bucketIndex = static_cast<int>(numBuckets * normalized);
            if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // Sort each bucket
        for (int i = 0; i < numBuckets; i++) 
        {
            buckets[i].sort();
        }
        
        // Collect result
        int index = 0;
        for (int i = 0; i < numBuckets; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }

    // Optimized version: use insertionSort for small buckets
    template<typename T>
    void insertionSort(vector<T>& arr) 
    {
        int n = arr.size();
        for (int i = 1; i < n; i++) 
        {
            T key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) 
            {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    template<typename T>
    void bucketSortOptimized(vector<T>& arr) 
    {
        if (arr.empty()) return;
        
        int n = arr.size();
        T min_val = *min_element(arr.begin(), arr.end());
        T max_val = *max_element(arr.begin(), arr.end());
        
        if (min_val == max_val) return;
        
        // Use sqrt(n) buckets for balance
        int numBuckets = static_cast<int>(sqrt(n)) + 1;
        vector<vector<T>> buckets(numBuckets);
        
        for (int i = 0; i < n; i++) 
        {
            double normalized = static_cast<double>(arr[i] - min_val) / (max_val - min_val + 1);
            int bucketIndex = static_cast<int>(numBuckets * normalized);
            if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // Sort each bucket (using insertion sort for small buckets)
        for (int i = 0; i < numBuckets; i++) 
        {
            if (buckets[i].size() > 1) 
            {
                insertionSort(buckets[i]);
            }
        }
        
        int index = 0;
        for (int i = 0; i < numBuckets; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }
```
</details>

---

### 5. Exotic Sorting Algorithms
These are more often asked about in interviews than written in code.

*   <span style="color: #089c00ff;">Shell Sort</span> — an improvement over insertion sort with a step (`gap`). Complexity depends on the gap, usually `O(n^{1.5})`.
*   <span style="color: #089c00ff;">Gnome Sort</span> — a variation of bubble sort that moves back and forth.
*   <span style="color: #089c00ff;">Comb Sort</span> — an improvement over bubble sort with a decreasing step.

| Algorithm | Best Complexity | Average Complexity | Worst-Case Complexity | Memory | Stable | Features |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Shell Sort | `O(n log n)` |`O(n^{1.25})`... `O(n^{1.5})` | `O(n^2)` | `O(1)` | 🔴 | Sorts elements at a distance of `gap` from each other, gradually reducing `gap` to 1. The choice of gap sequence (e.g., Knuth's or Sedgewick's) critically affects speed. |
| Gnome Sort | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | 🟢 | Similar to bubble sort, but moves like a garden gnome: one step forward if order is correct, one step back if elements need to be swapped. Very simple to implement, but useless in practice due to huge number of "jumps". |
| Comb Sort | `O(n log n)` | `O(n^2 / 2^p)` (where `p` is the number of passes) | `O(n^2)` | `O(1)` | 🔴 | Improvement over bubble sort: compares elements at a large distance (like Shell sort) to quickly remove "turtles" (small numbers at the end). The shrink factor is typically `1.3`. |

<details>
    <summary>Shell Sort Code</summary>

``` c++
    // Shell sort implementation
    template<typename T>
    void shellSort(vector<T>& arr) 
    {
        int n = arr.size();
        
        // Use Knuth's sequence: (3^k - 1) / 2
        int gap = 1;
        while (gap < n / 3) 
        {
            gap = gap * 3 + 1;
        }
        
        while (gap >= 1) 
        {
            for (int i = gap; i < n; i++) 
            {
                T temp = arr[i];
                int j = i;
                while (j >= gap && arr[j - gap] > temp) 
                {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
            gap /= 3;
        }
    }
```
</details>

<details>
    <summary>Gnome Sort Code</summary>

``` c++
    // Gnome sort implementation
    template<typename T>
    void gnomeSort(vector<T>& arr) 
    {
        int n = arr.size();
        int pos = 0;
        
        while (pos < n) 
        {
            if (pos == 0 || arr[pos] >= arr[pos - 1]) 
            {
                pos++;
            } 
            else
            {
                swap(arr[pos], arr[pos - 1]);
                pos--;
            }
        }
    }
```
</details>

<details>
    <summary>Comb Sort Code</summary>

``` c++
    // Comb sort implementation
    template<typename T>
    void combSort(vector<T>& arr) 
    {
        int n = arr.size();
        int gap = n;
        bool swapped = true;
        const double SHRINK_FACTOR = 1.3;
        
        while (gap > 1 || swapped) 
        {
            // Update gap
            if (gap > 1) 
            {
                gap = static_cast<int>(gap / SHRINK_FACTOR);
            }
            
            swapped = false;
            
            for (int i = 0; i + gap < n; i++) 
            {
                if (arr[i] > arr[i + gap]) 
                {
                    swap(arr[i], arr[i + gap]);
                    swapped = true;
                }
            }
        }
    }
```
</details>

- About Shell Sort complexity (`O(n^{1.5})`):
It depends on the step — this is the only algorithm in your list whose complexity is an open mathematical problem.
  - If you take steps `(n/2, n/4, ... 1)` — complexity will be `O(n^2)` (bad).
  - If you take `Knuth's sequence` `(1, 4, 13, 40, ...)` — complexity is about `O(n^{1.5})`.
  - If you take `Sedgewick's sequence` — complexity is about `O(n^{4/3})` or even `O(n log^2 n)`.

- Why does Comb Sort have `O(n log n)` in the best case:
    - This is a theoretical estimate. In practice, comb sort is very fast (almost as fast as quicksort), but because at the end it is forced to do a final bubble sort pass with step 1, mathematically its complexity still remains quadratic in the worst case. However, the constant is so small that it outperforms heap sort on small data.

- All three algorithms sort the array **in place**, without allocating additional arrays like merge sort.

---

### 💎 BEST PRACTICE:
- By default, use `std::sort` (introsort).
- If the array is very small (up to 32 elements) — the compiler will call insertion sort inside `std::sort` itself, so you don't need to worry about it.
- If you need to preserve the order of equal elements (e.g., sorting a table by two columns) — use `std::stable_sort`.
- If you need guaranteed speed, even if someone tries to break the algorithm (malicious data) → use Heap Sort.
- **Numbers from 0 to 255** or IP addresses → use Radix Sort or Counting Sort — they will run in linear time `O(n)`, which is faster than logarithmic ones.
- **Only need median or quantile** → `std::nth_element` (works instantly, without sorting everything).
- On exotic sorts:
  - **Shell Sort** — the only one of the exotic trio that is actually used. It can be found in embedded systems (microcontrollers), where memory is critical (no room for recursion and quicksort stack), and there is not much data (up to a few thousand elements).
  - **Comb Sort** — a historical curiosity. It was popular in the early 2000s on slow computers, but today `std::sort` makes it completely unnecessary.
  - **Gnome Sort** — purely an educational example. It is often shown to students to demonstrate how easily a sort can be implemented, but it is absolutely uncompetitive.