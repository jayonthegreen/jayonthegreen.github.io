---
date: '2018-10-09'
description: The basic of clustering algorithms
image: /img/programming/clustering/clustering.008.jpeg
keywords: clustering,k-means,hierarchical agglomerative
tags:
- '#Clustering'
- '#ClusterAnalysis'
- '#HierarchicalClustering'
- '#KMeans'
- '#DataScience'
templateKey: post
title: Clustering
---

## Definition of clustering

Cluster analysis or clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar to each other than to those in other clusters.

Let's look at two basic and widely used clustering algorithms: hierarchical and k-means clustering.

## The hierarchical clustering

Initially, each point is a cluster. Repeatedly combine the two nearest clusters into one.

![/img/programming/clustering/clustering.013.jpeg](/img/programming/clustering/clustering.013.jpeg "/img/programming/clustering/clustering.013.jpeg")

This method is called Hierarchical Agglomerative Clustering.

The main output of Hierarchical Clustering is a dendrogram, which shows the hierarchical relationship between the clusters.

![/img/programming/clustering/clustering.014.jpeg](/img/programming/clustering/clustering.014.jpeg "/img/programming/clustering/clustering.014.jpeg")

## 3 Essential questions of HAC (Hierarchical Agglomerative Clustering)

Q 1) How should we represent a cluster of more than one point?

- Euclidean space → Centroid = The average of its points.
- Non-Euclidean space → There is no "average". Use clustroid (closest to all other points in the cluster) instead of centroid.

Q 2) How should we determine the 'nearness' of clusters?

- Euclidean space → Distances by distances between centroids.
- Non-Euclidean space → Distances by distances between clustroids.

Q 3) When should we stop combining clusters?

- If you pick a number k upfront, you want the data to fall into k classes.
- Before merging low cohesion clustering. Don't make bad clusters. Ways to measure cohesion:
    - Diameters: maximum distance between points
    - Radius: maximum distance from centroid (or clustroid)
    - Density: points per volume (derived from diameters, radius)

## HAC Complexity

It’s too slow. The standard algorithm for Hierarchical Agglomerative Clustering (HAC) has a time complexity of O(n^3) and requires O(n^2) memory, making it too slow for even medium-sized data sets.

## K-means clustering

1. Assuming Euclidean space/distance, start by picking **k** (number of clusters) clusters.
2. Assign points to the nearest cluster
3. After all points are assigned, update the location of the centroid of the **k** clusters.
4. Reassign all points to their closest centroid. Sometimes this moves points between clusters.
5. Repeat steps 3 and 4 until convergence, when points and centroids no longer move.

## How to select the right k for clustering

- As the number of clusters increases, the average distance to the centroid goes down.

![/img/programming/clustering/clustering.010.jpeg](/img/programming/clustering/clustering.010.jpeg "/img/programming/clustering/clustering.010.jpeg")

![/img/programming/clustering/clustering.011.jpeg](/img/programming/clustering/clustering.011.jpeg "/img/programming/clustering/clustering.011.jpeg")

![/img/programming/clustering/clustering.012.jpeg](/img/programming/clustering/clustering.012.jpeg "/img/programming/clustering/clustering.012.jpeg")

## How to pick initial centroids of clusters

1. Sample the data and use hierarchical clustering to obtain k clusters.
2. Pick a "dispersed" set of points. Pick the first randomly, then pick the next point that is as far as possible from the others.

## K-means Complexity

O(kn) for N points and k clusters, which is linearly good. However, the number of rounds to convergence can be very large.

## Closing

These two algorithms are basic and essential. Many optimization techniques used in dealing with data in the real world are often derived from these two basic algorithms. Therefore, these two concepts are important as a foundation.

## References

- [https://en.wikipedia.org/wiki/Cluster_analysis](https://en.wikipedia.org/wiki/Cluster_analysis)
- [https://en.wikipedia.org/wiki/Hierarchical_clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering)
- [https://en.wikipedia.org/wiki/K-means_clustering](https://en.wikipedia.org/wiki/K-means_clustering)
- [https://www.displayr.com/what-is-hierarchical-clustering/](https://www.displayr.com/what-is-hierarchical-clustering/)
- [https://www.youtube.com/watch?v=rg2cjfMsCk4](https://www.youtube.com/watch?v=rg2cjfMsCk4)
- [https://www.youtube.com/watch?v=RD0nNK51Fp8](https://www.youtube.com/watch?v=RD0nNK51Fp8)