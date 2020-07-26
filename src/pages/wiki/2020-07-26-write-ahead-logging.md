---
templateKey: wiki
title: Write-ahead logging
image: /img/default.jpeg
date: 2020-07-26T11:25:37.652Z
---
**write-ahead logging** (**WAL**) is a family of techniques for providing [atomicity](https://en.wikipedia.org/wiki/Atomicity_(database_systems) "Atomicity (database systems)") and [durability](https://en.wikipedia.org/wiki/Durability_(database_systems) "Durability (database systems)") (two of the [ACID](https://en.wikipedia.org/wiki/ACID "ACID") properties) in [database systems](https://en.wikipedia.org/wiki/Database_system "Database system"). The changes are first recorded in the log, which must be written to stable storage, before the changes are written to the database.\
\
write the log records associated with a particular modification before it writes the page to the disk.\
\
I think it has similar characteristic of event sourcing pattern where event can be store and result can be calculated by event evaluation sum.\
\
reference

\- <https://en.wikipedia.org/wiki/Write-ahead_logging>\
- <https://practice.geeksforgeeks.org/problems/what-is-write-ahead-logging-in-dbms>