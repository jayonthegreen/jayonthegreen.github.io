---
templateKey: 'programming'
date: '2018-09-24'
title: 'Why should you know itertools in python'
description: 'But in the real world, more complexed list item with multiple for-loop make many developers tired.'
image: '/img/programming/loop.jpeg'
keywords: 'python,intertools,pythonic'
---

If you want the [dot product](https://en.wikipedia.org/wiki/Dot_product) with python, maybe or not, you implement the code like as follows.

```python
a = [1, 2, 3]
b = [4, 5, 6]
result = 0
for i, j in zip(a,b):
    result += i * j
```

but if you use [itertools](https://docs.python.org/3.7/library/itertools.html#module-itertools) of python, you can write code as follows

```python
import operator
a = [1, 2, 3]
b = [4, 5, 6]
result = sum(map(operator.mul, a, b))
```

Why do you  know itertools.

1. Code readability: As a simple example like dot product, the difference between two implementations is insignificant. But in the real world, more complexed list item with multiple for-loop make many developers tired.

2. Superior Memory performance: Iterators handle element of list one by one when necessary. It's more efficient rather than bringing the whole iterable into memory all at once. It's [lazy evaluation](https://en.wikipedia.org/wiki/Lazy_evaluation)

Let's read the official [document](https://docs.python.org/3.7/library/itertools.html#module-itertools). This post is also based on the document.

## reference

- [https://docs.python.org/3.7/library/itertools.html#module-itertools](https://docs.python.org/3.7/library/itertools.html#module-itertools)