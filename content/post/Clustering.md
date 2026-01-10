---
date: '2018-10-09'
description: The basic of clustering algorithms
tags: [investment, Clustering, ClusterAnalysis, HierarchicalClustering, KMeans, DataScience]
title: Clustering
created_at: 2025-12-28
modified_at: 2025-12-28
---
## Definition of clustering

Cluster analysis or clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar to each other than to those in other clusters.

Let's look at two basic and widely used clustering algorithms: hierarchical and k-means clusterings.

## The hierarchical clustering

Initially, each point is a cluster. Repeatedly combine the two nearest clusters into one.

![/img/programming/clustering/clustering.013.jpeg](/img/programming/clustering/clustering.013.jpeg "/img/programming/clustering/clustering.013.jpeg")

It's called Hierarchical agglomerative clustering.

The main output of Hierarchical Clustering is a dendrogram, which shows the hierarchical relationship between the clusters.

![/img/programming/clustering/clustering.014.jpeg](/img/programming/clustering/clustering.014.jpeg "/img/programming/clustering/clustering.014.jpeg")

## 3 Essential questions of HAC(Hierarchical agglomerative clustering)

**Q1) How should we represent a cluster of more than one point?**

- Euclidean space → Centroid = The average of its points.
- Non-Euclidean space → There is no "average". Using clustroid (closest to all other points in the cluster) not centroid.

**Q2) How should we determine the 'nearness' of clusters?**

- Euclidean space → Distances by distances of centroids.
- Non-Euclidean space → Distances by distances of clustroid.

**Q3) When should we stop combining clusters?**

- If we pick a number k upfront, we want data to fall into k classes.
- Before merging low cohesion clusters. Don't make bad clusters. The way to measure cohesion:
    - Diameters: maximum distance in points
    - Radius: maximum distances from centroid (or clustroid)
    - Density: points per volume (derived from diameters, radius)

## HAC Complexity

It's too slow. The standard algorithm for hierarchical agglomerative clustering (HAC) has a time complexity of O(n^3) and requires O(n^2) memory, which makes it too slow for even medium data sets.

## K-means clustering

1. Assuming Euclidean space/distance, start by picking **k** (number of clusters) clusters.  
2. Assign points to the nearest cluster.
3. After all points are assigned, update the location of the centroid of the **k** clusters.
4. Reassign all points to their closest centroid. Sometimes moves points between clusters.
5. Repeat steps 3 and 4 until convergence. Points and centroid don't move any further.

## How to select the right k clustering

- As the number of clusters increases, the average distance to the centroid goes down.

![/img/programming/clustering/clustering.010.jpeg](/img/programming/clustering/clustering.010.jpeg "/img/programming/clustering/clustering.010.jpeg")

![/img/programming/clustering/clustering.011.jpeg](/img/programming/clustering/clustering.011.jpeg "/img/programming/clustering/clustering.011.jpeg")

![/img/programming/clustering/clustering.012.jpeg](/img/programming/clustering/clustering.012.jpeg "/img/programming/clustering/clustering.012.jpeg")

## How to pick initial centroids of clusters

1. Sampling then using hierarchical clustering to obtain k clusters.
2. Pick a "dispersed" set of points. Pick randomly first. Then pick the next point which is as far as possible.

## K-means Complexity

O(kn) for N points, k clusters. Linear time complexity. But the number of rounds to convergence can be very large.

## Closing

Two alogrithms are basic and essential. There are many optimization techniques in dealing with data in the real world. However, many optimization techniques have often drived from these two basic algorithms. Therefore, these two concepts can be important as a foundation.

## reference

- [https://en.wikipedia.org/wiki/Cluster_analysis](https://en.wikipedia.org/wiki/Cluster_analysis)
- [https://en.wikipedia.org/wiki/Hierarchical_clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering)
- [https://en.wikipedia.org/wiki/K-means_clustering](https://en.wikipedia.org/wiki/K-means_clustering)
- [https://www.displayr.com/what-is-hierarchical-clustering/](https://www.displayr.com/what-is-hierarchical-clustering/)
- [https://www.youtube.com/watch?v=rg2cjfMsCk4](https://www.youtube.com/watch?v=rg2cjfMsCk4)
- [https://www.youtube.com/watch?v=RD0nNK51Fp8](https://www.youtube.com/watch?v=RD0nNK51Fp8)