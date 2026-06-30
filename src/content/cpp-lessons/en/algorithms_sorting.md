---
title: "Сортировки"
description: "Все алгоритмы сортировок"
pubDate: 2026-06-25
tags: ["C++", "algorithms", "sorting"]
lang: "en"
lessonNumber: 1
subcategory: "algorithms"
author: "Stanislav Talanov"
---

Ниже я привел группы, для классификации сортировок. Самая первая группа для тех, кто не хочет изобретать велосипед: сортировки в стандартной библиотеке (`<algorithm>`). Все последующие группы - для тех, кто хочет узнать внутреннее устройство сортировок или готовится к собесам. 

### 1. Стандартные сортировки в STL
Это то, что используется в 95% случаев. Не нужно писать велосипед, если он уже есть.

*   <span style="color: #089c00ff;">std::sort</span> — реализует алгоритм <span style="color: #7da8e1ff;">интроспективной сортировки</span> (гибрид быстрой `Quick sort`, пирамидальной `Heap sort` и вставками `Insertion Sort`). Самая быстрая для случайных данных. Сложность `O(n log n)`.
*   <span style="color: #089c00ff;">std::stable_sort</span> — реализует алгоритм <span style="color: #7da8e1ff;">сортировка слиянием</span> `Merge Sort`. Сохраняет относительный порядок равных элементов. Сложность `O(n log n)`.
*   <span style="color: #089c00ff;">std::partial_sort</span> — реализует алгоритм <span style="color: #7da8e1ff;">пирамидальной сортировки</span> `Heap Sort`. Используется, когда нужно найти и отсортировать только первые `k` элементов (например, топ-10). Сложность `O(n log k)`.
*   <span style="color: #089c00ff;">std::nth_element</span> — реализует алгоритм <span style="color: #7da8e1ff;">быстрого выбора</span> `Quick Select`. Не сортирует полностью, а лишь ставит *n-й* элемент на его окончательное место, разбивая массив на "меньшие" и "большие". Сложность `O(n)` в среднем.

| Алгоритм | Средняя сложность | Худшая сложность | Память | Стабильная | Когда использовать |
| :--- | :--- | :--- | :--- | :--- | :--- |
| std::sort | `O(n log n)` | `O(n log n)` | `O(log n)` | 🔴 | `По умолчанию` Для любых данных. Гибрид быстрой + пирамидальной. |
| std::stable_sort | `O(n log n)` | `O(n log n)` | `O(n)` | 🟢 | Когда важен порядок равных элементов (сортировка по 2 полям). |
| std::partial_sort | `O(n log k)` | `O(n log k)` | `O(1)` | 🔴 | Нужно найти `top-k` элементов в правильном порядке. |
| std::nth_element | `O(n)` | `O(n)` | `O(1)` | 🔴 | Нужно найти медиану или разделить массив на "меньшие" и "большие" (без сортировки внутри групп). |

---

### 2. Квадратичные
Простые для понимания, но медленные на больших данных. Используются для маленьких массивов (до ~30 элементов) как оптимизация внутри сложных алгоритмов.

*   <span style="color: #089c00ff;">Bubble Sort</span> | <span style="color: #7da8e1ff;">Пузырьком</span> — классика, соседние элементы меняются местами, если стоят не в том порядке.
*   <span style="color: #089c00ff;">Insertion Sort</span> | <span style="color: #7da8e1ff;">Вставками</span> — берем элемент и вставляем его в уже отсортированную часть слева. **Лучший** среди квадратичных для почти отсортированных данных `O(n)` - в лучшем случае.
*   <span style="color: #089c00ff;">Selection Sort</span> | <span style="color: #7da8e1ff;">Выбором</span> — ищем минимальный элемент и меняем его с текущей позицией. Нестабильная, но делает мало обменов.

> Обратите внимание, что в таблице ниже я привел колонку "Лушая сложность" - она имеет смысл только для сортировок в этой группе. А для всех остальынх групп 'лучшая' не отличается от 'средней'. 

| Алгоритм | Средняя сложность | Худшая сложность | Лучшая сложность | Память | Стабильная | Особенности |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Insertion | `O(n^2)` | `O(n^2)` | `O(n)` | `O(1)` | 🟢 | **Идеальна** для почти отсортированных данных. Используется внутри `std::sort` для кусков < 32 элементов. |
| Bubble | `O(n^2)` | `O(n^2)` | `O(n)` | `O(1)` | 🟢 | Медленная. Интересна только оптимизацией (если нет обменов — стоп). |
| Selection | `O(n^2)` | `O(n^2)` | `O(n^2)` | `O(1)` | 🔴 | Делает мало обменов. Бесполезна в общем случае. |

<details>
    <summary>Код Insertion Sort</summary>

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
    <summary>Код Bubble Sort</summary>

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
            // Если не было обменов, массив уже отсортирован
            if (!swapped) break;
        }
    }
```
</details>

<details>
    <summary>Код Selection Sort</summary>

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

### 3. Эффективные
Используются для больших объемов данных.

*   <span style="color: #089c00ff;">Quick Sort</span> | <span style="color: #7da8e1ff;">Быстрая</span> — рекурсивное разделение по опорному элементу `pivot`. Самая быстрая на практике, но есть риск `O(n^2)` на плохих данных (если не использовать рандомизацию).
*   <span style="color: #089c00ff;">Merge Sort</span> | <span style="color: #7da8e1ff;">Слиянием</span>  — рекурсивно делим массив пополам, сортируем половинки и сливаем. Требует дополнительной памяти `O(n)`. Стабильна.
*   <span style="color: #089c00ff;">Heap Sort</span> | <span style="color: #7da8e1ff;">Пирамидальная</span>  — строим кучу (`max-heap`) и последовательно извлекаем корень. Работает за гарантированное `O(n\log n)` без дополнительной памяти (in-place), но медленнее `Quick Sort` на практике.

| Алгоритм | Средняя сложность | Худшая сложность | Память | Стабильная | Особенности |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Quick Sort | `O(n log n)` | `O(n^2)` | `O(log n)` | 🔴 | Самый быстрый на практике. Плох на уже отсортированных данных (если неудачный выбор pivot). |
| Merge Sort | `O(n log n)` | `O(n log n)` | `O(n)` | 🟢 | Надежна, но жрет память. Хороша для связных списков. |
| Heap Sort | `O(n log n)` | `O(n log n)` | `O(1)` | 🔴 | Гарантированная скорость, но медленнее быстрой из-за "прыжков" по памяти (кэш промахи). |

<details>
    <summary>Код Quick Sort</summary>

``` c++
    // Quick sort implementation
    template<typename T>
    int partition(vector<T>& arr, int low, int high) 
    {
        // Выбираем средний элемент как опорный (избегаем худшего случая)
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
    <summary>Код Merge Sort</summary>

``` c++
    // Merge sort implementation
    template<typename T>
    void merge(vector<T>& arr, int left, int mid, int right) 
    {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        
        // Создаем временные массивы
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
    <summary>Код Heap Sort</summary>

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
        
        // Строим кучу (перестраиваем массив)
        for (int i = n / 2 - 1; i >= 0; i--) 
        {
            heapify(arr, n, i);
        }
        
        // Извлекаем элементы из кучи
        for (int i = n - 1; i > 0; i--) 
        {
            swap(arr[0], arr[i]);
            heapify(arr, i, 0);
        }
    }
```
</details>

---

### 4. Специальные
Используются, когда известна природа данных (например, ограниченный диапазон чисел).

*   <span style="color: #089c00ff;">Counting Sort</span> | <span style="color: #7da8e1ff;">Подсчетом</span> — считаем количество вхождений каждого значения. Работает за `O(n+k)`, где `k` — диапазон значений. Требует много памяти, если числа большие.
*   <span style="color: #089c00ff;">Radix Sort</span> | <span style="color: #7da8e1ff;">Поразрядная</span> — сортировка по разрядам чисел (используя подсчет внутри). Работает за `O(n*w)`, где `w` — количество разрядов.
*   <span style="color: #089c00ff;">Bucket Sort</span> | <span style="color: #7da8e1ff;">Блочная</span> — распределяем элементы по корзинам (ведрам), внутри каждой корзины сортируем вставками или рекурсивно.

> Обратите внимание, что в таблице ниже нет таких понятий как 'средняя' и 'худшая' сложность - для сортировок в этой группе они равны.

| Алгоритм | Сложность | Память | Стабильная | Ограничение |
| :--- | :--- | :--- | :--- | :--- |
| Counting | `O(n + k)` | `O(k)` | 🟢 | Только для **целых чисел** в узком диапазоне `k`. Если `k` огромно — память взорвется. |
| Radix | `O(n * w)` | `O(n + b)` | 🟢 | Где `w` — длина числа, `b` — основание системы. Не сравнивает элементы. |
| Bucket | `O(n + k)` | `O(n * k)` | 🟢 | Требует равномерного распределения данных (чтобы корзины были заполнены поровну). |

<details>
    <summary>Код Counting Sort</summary>

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
        
        // Подсчет
        for (int val : arr) 
        {
            count[val - min_val]++;
        }
        
        // Преобразуем count в позиции
        for (int i = 1; i < range; i++) 
        {
            count[i] += count[i - 1];
        }
        
        // Строим выходной массив
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
    <summary>Код Radix Sort</summary>

``` c++
    // Radix sort implementation
    void countingSortForRadix(vector<int>& arr, int exp) 
    {
        int n = arr.size();
        vector<int> output(n);
        vector<int> count(10, 0);
        
        // Подсчет цифр
        for (int i = 0; i < n; i++) 
        {
            count[(arr[i] / exp) % 10]++;
        }
        
        // Преобразуем в позиции
        for (int i = 1; i < 10; i++) 
        {
            count[i] += count[i - 1];
        }
        
        // Строим выходной массив
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
        
        // Сортируем по каждому разряду
        for (int exp = 1; max_val / exp > 0; exp *= 10) 
        {
            countingSortForRadix(arr, exp);
        }
    }
```
</details>

<details>
    <summary>Код Bucket Sort</summary>

``` c++
    // Bucket sort implementation

    // Версия 1: Для чисел с плавающей точкой [0, 1)
    template<typename T>
    void bucketSortFloat(vector<T>& arr) 
    {
        if (arr.empty()) return;
        
        int n = arr.size();
        
        // 1. Создаем n пустых корзин
        vector<vector<T>> buckets(n);
        
        // 2. Распределяем элементы по корзинам
        // Предполагаем, что числа в диапазоне [0, 1)
        for (int i = 0; i < n; i++) 
        {
            int bucketIndex = static_cast<int>(n * arr[i]);
            // Защита от выхода за границы (если число == 1.0)
            if (bucketIndex == n) bucketIndex = n - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // 3. Сортируем каждую корзину (используем вставками)
        for (int i = 0; i < n; i++) 
        {
            sort(buckets[i].begin(), buckets[i].end()); // или insertionSort
        }
        
        // 4. Собираем результат
        int index = 0;
        for (int i = 0; i < n; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }

    // Версия 2: Для целых чисел с произвольным диапазоном
    template<typename T>
    void bucketSortInt(vector<T>& arr) 
    {
        if (arr.empty()) return;
        
        int n = arr.size();
        
        // Находим min и max
        T min_val = *min_element(arr.begin(), arr.end());
        T max_val = *max_element(arr.begin(), arr.end());
        
        // Если все элементы равны
        if (min_val == max_val) return;
        
        // Количество корзин = n (можно настроить)
        int numBuckets = n;
        vector<vector<T>> buckets(numBuckets);
        
        // Распределяем по корзинам
        for (int i = 0; i < n; i++) 
        {
            // Нормализуем значение в диапазон [0, 1)
            double normalized = static_cast<double>(arr[i] - min_val) / (max_val - min_val + 1);
            int bucketIndex = static_cast<int>(numBuckets * normalized);
            // Защита от выхода
            if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // Сортируем каждую корзину
        for (int i = 0; i < numBuckets; i++) 
        {
            sort(buckets[i].begin(), buckets[i].end());
        }
        
        // Собираем результат
        int index = 0;
        for (int i = 0; i < numBuckets; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }

    // Версия 3: С использованием списков (std::list) для эффективной вставки
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
        
        // Распределяем по корзинам (используем списки для O(1) вставки)
        for (int i = 0; i < n; i++) 
        {
            double normalized = static_cast<double>(arr[i] - min_val) / (max_val - min_val + 1);
            int bucketIndex = static_cast<int>(numBuckets * normalized);
            if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // Сортируем каждую корзину
        for (int i = 0; i < numBuckets; i++) 
        {
            buckets[i].sort();
        }
        
        // Собираем результат
        int index = 0;
        for (int i = 0; i < numBuckets; i++) 
        {
            for (const T& val : buckets[i]) 
            {
                arr[index++] = val;
            }
        }
    }

    // Оптимизированная версия: используем insertionSort для маленьких корзин
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
        
        // Используем sqrt(n) корзин для баланса
        int numBuckets = static_cast<int>(sqrt(n)) + 1;
        vector<vector<T>> buckets(numBuckets);
        
        for (int i = 0; i < n; i++) 
        {
            double normalized = static_cast<double>(arr[i] - min_val) / (max_val - min_val + 1);
            int bucketIndex = static_cast<int>(numBuckets * normalized);
            if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
            buckets[bucketIndex].push_back(arr[i]);
        }
        
        // Сортируем каждую корзину (используем вставками для малых корзин)
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

### 5. Экзотические
Их чаще спрашивают на собеседованиях, чем пишут в коде.

*   <span style="color: #089c00ff;">Shell Sort</span> | <span style="color: #7da8e1ff;">Шелла</span> — улучшение сортировки вставками с шагом (`gap`). Сложность зависит от шага, обычно - `O(n^{1.5})`.
*   <span style="color: #089c00ff;">Gnome Sort</span> | <span style="color: #7da8e1ff;">Гномья</span> — вариация пузырька, движется вперед-назад.
*   <span style="color: #089c00ff;">Comb Sort</span> | <span style="color: #7da8e1ff;">Расческой</span> — улучшение пузырька с уменьшающимся шагом.

| Алгоритм | Лучшая сложность | Средняя сложность | Худшая сложность | Память | Стабильная | Особенности |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Shell Sort | `O(n log n)` |`O(n^{1.25})`... `O(n^{1.5})` | `O(n^2)` | `O(1)` | 🔴 | Сортирует элементы, стоящие на расстоянии `gap` друг от друга, постепенно уменьшая `gap` до 1. Выбор последовательности шагов (например, Кнута или Седжвика) критически влияет на скорость. |
| Gnome Sort | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | 🟢 | Похожа на пузырек, но движется как садовый гном: шаг вперед, если порядок верен, и шаг назад, если элементы надо поменять. Очень проста в реализации, но бесполезна на практике из-за огромного числа «прыжков». |
| Comb Sort | `O(n log n)` | `O(n^2 / 2^p)` (где `p` — число проходов) | `O(n^2)` | `O(1)` | 🔴 | Улучшение пузырька: сравнивает элементы на большом расстоянии (как Шелл), чтобы быстро удалить «черепах» (мелкие числа в конце). Коэффициент сжатия шага обычно равен `1.3`. |

<details>
    <summary>Код Shell Sort</summary>

``` c++
    // Shell sort implementation
    template<typename T>
    void shellSort(vector<T>& arr) 
    {
        int n = arr.size();
        
        // Используем последовательность Кнута: (3^k - 1) / 2
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
    <summary>Код Gnome Sort</summary>

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
    <summary>Код Comb Sort</summary>

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
            // Обновляем gap
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

- По поводу сложности Шелла (`O(n^{1.5})`):
Она зависит от шага - это единственный алгоритм в вашем списке, чья сложность — это открытая математическая проблема. 
  -   Если взять шаги `(n/2, n/4, ... 1)` — сложность будет `O(n^2)` (плохо).
  -   Если взять `последовательность Кнута` `(1, 4, 13, 40, ...)` — сложность около `O(n^{1.5})`.
  - Если взять `последовательность Седжвика` — сложность около `O(n^{4/3})` или даже `O(n log^2 n)`.

- Почему у Расческой в лучшем случае `O(n log n)`:
    - Это теоретическая оценка. На практике расческа очень быстрая (почти как быстрая сортировка), но из-за того, что в конце она вынуждена делать финальный проход пузырьком с шагом 1, математически ее сложность всё равно остается квадратичной в худшем случае. Однако константа настолько мала, что она обгоняет пирамидальную на мелких данных.

- Все три алгоритма сортируют массив **на месте** (in-place), не выделяя дополнительных массивов, как, например, сортировка слиянием.

---

### 💎 BEST PRACTICE:
- По дефолту используйте `std::sort` (интроспективная).
- Если массив совсем маленький (до 32 элементов) — компилятор сам вызовет сортировку вставками внутри `std::sort`, так что об этом можно не беспокоиться.
- Если вам нужно сохранить порядок равных элементов (например, сортировка таблицы по двум колонкам) — используйте `std::stable_sort`.
- Если нужна гарантия скорости, даже если кто-то пытается сломать алгоритм (вредоносные данные) → используйте <пирамидальную> `Heap`.
- **Числа от 0 до 255** или IP-адреса → используйте <поразрядную> `Radix` или <подсчетом> `Counting` — они отработают за линейное время `O(n)`, что быстрее логарифмических.
- **Нужна только медиана или квантиль** → `std::nth_element` (работает мгновенно, не сортируя всё).
- По экзотике:
  - **Сортировка Шелла** `Shell` — единственная из экзотической троицы, которая реально используется. Ее можно встретить во встраиваемых системах (микроконтроллерах), где память критична (нет места под рекурсию и стек быстрой сортировки), а данных не очень много (до нескольких тысяч элементов).
  -  **Сортировка расческой** `Comb` — исторический курьез. Она была популярна в начале 2000-х на медленных компьютерах, но сегодня `std::sort` делает её полностью ненужной.
  - **Гномья сортировка** `Gnome`— чисто образовательный пример. Её часто показывают студентам, чтобы продемонстрировать, как легко можно реализовать сортировку, но она абсолютно неконкурентоспособна.