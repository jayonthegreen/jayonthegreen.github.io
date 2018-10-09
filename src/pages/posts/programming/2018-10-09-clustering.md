---
category: 'programming'
date: '2018-10-09'
title: 'clustering'
description: 'Cluster analysis or clustering is the task of grouping a set of objects in such a way that objects in the same group '
image: '/img/programming/clustering/clustering.008.jpeg'
keywords: 'clustering,k-means,hierarchical agglomerative'
---

## Definition of clustering

Cluster analysis or clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar (in some sense) to each other than to those in other groups (clusters).

Let's look at two basic and widely used clustering algorithms. hierarchical and k-means clusterings.

## The hierarchical clustering

Initially, each point is a cluster. repeatedly combined the two nearest cluster into one.

![/img/programming/clustering/clustering.013.jpeg](/img/programming/clustering/clustering.013.jpeg "/img/programming/clustering/clustering.013.jpeg")

it's called Hierarchical agglomerative clustering.

The main output of Hierarchical Clustering is a dendrogram, which shows the hierarchical relationship between the clusters

![/img/programming/clustering/clustering.007.jpeg](/img/programming/clustering/clustering.007.jpeg "/img/programming/clustering/clustering.007.jpeg")

![/img/programming/clustering/clustering.008.jpeg](/img/programming/clustering/clustering.008.jpeg "/img/programming/clustering/clustering.008.jpeg")

## 3 essential questions of HAC(Hierarchical agglomerative clustering)

Q 1 ) how to represent cluster of more than one point?

- Euclidean space → centroid = average of its points.
- Non-Euclidean space → there is no "average". using clustroid(closet all other points in the cluster) not centroid.

Q 2 ) how to determine the 'nearness' of clusters?

- euclidean space → distances by distances of centroids.
- Non-Euclidean space →  distances by distances of clustroid.

Q 3 ) when to stop combining clusters?

- if pick a number k upfront. we want data to falls into k classes.
- before merging low cohesion clustering. don't make bad clusters.The way to measure cohesion
    - 1) diameters: maximum distance in points
    - 2) radius: maximum distances from centroid(or clustroid)
    - 3) density: points per volumes(derived from diameters/radius)

## HAC Complexity

Its too slow. The standard algorithm for hierarchical agglomerative clustering (HAC) has a time complexity of O(n^3) and requires O(n^2)memory, which makes it too slow for even medium data sets.

## K-means clustering

1. Assuming Euclidean space/distance, start by picking **k**(number of clusters) clusters.  
2. Assign points in the nearest cluster
3. After all points are assigned, update location of centroid of the **k** clusters**.**
4. Reassign all points to their closet centroid.  Sometimes moves points between clusters.
5. Repeat 3,4 util convergence. points and centroid don't move any further.

## How to select the right k clustering ?

- As the number of clustering increases. Average distance to centroid goes down.

![/img/programming/clustering/clustering.010.jpeg](/img/programming/clustering/clustering.010.jpeg "/img/programming/clustering/clustering.010.jpeg")

![/img/programming/clustering/clustering.011.jpeg](/img/programming/clustering/clustering.011.jpeg "/img/programming/clustering/clustering.011.jpeg")

![/img/programming/clustering/clustering.012.jpeg](/img/programming/clustering/clustering.012.jpeg "/img/programming/clustering/clustering.012.jpeg")

- Picking initial centroids of clusters.
    - Sampling and using hierarchical clustering to obtains k clusters.
    - pick "dispersed" set of points.pick randomly first. then pick the next point which is as far as possible.

## K-means Complexity

O(kn) for N points, k clusters. linear goods. But the number of rounds to convergence can be  very large.

## Wrap up

Two alogrithms are basic and essential. There are many optimization techniques in dealing with data in the real world.

## reference

- [https://en.wikipedia.org/wiki/Cluster_analysis](https://en.wikipedia.org/wiki/Cluster_analysis)
- [https://en.wikipedia.org/wiki/Hierarchical_clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering)
- [https://en.wikipedia.org/wiki/K-means_clustering](https://en.wikipedia.org/wiki/K-means_clustering)
- [https://www.displayr.com/what-is-hierarchical-clustering/](https://www.displayr.com/what-is-hierarchical-clustering/)
- [https://www.youtube.com/watch?v=rg2cjfMsCk4](https://www.youtube.com/watch?v=rg2cjfMsCk4)
- [https://www.youtube.com/watch?v=RD0nNK51Fp8](https://www.youtube.com/watch?v=RD0nNK51Fp8)