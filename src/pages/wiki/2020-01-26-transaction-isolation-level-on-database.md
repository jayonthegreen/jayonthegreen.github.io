---
templateKey: wiki
title: 'Transaction, isolation level on database'
date: 2020-01-26T14:26:26.394Z
description: >-
  A transaction is a logical unit of work. A minimum unit is defined by work
  process, not a system or a technical thing.
---

### Transaction, Isolation, Lock, Concurrency

A transaction is a logical unit of work. A minimum unit is defined by work process, not a system or a technical thing. These transactions have an [ACID](%20https://en.wikipedia.org/wiki/ACID) \(Atomicity, Consistency, Isolation, Durability\) characteristic. Isolation is to prevent other transactions from approaching while data are being processed by some transactions. DBMS provides a "Lock" function to preserve data that can be distorted by parallel transactions as a concurrency issue. Lock simply means that only one user or session can be modified for a particular operator. You have to strike the balance between consistency and performance.

### Types of Lock

Below are the contents about '[Shared & Exclusive Lock](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-shared-exclusive-locks)' on mysql manual

> `InnoDB` implements standard row-level locking where there are two types of locks, [shared \(`S`\) locks](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_shared_lock) and [exclusive \(`X`\) locks](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_exclusive_lock).
>
> * A [shared \(`S`\) lock](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_shared_lock) permits the transaction that holds the lock to read a row.
> * An [exclusive \(`X`\) lock](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_exclusive_lock) permits the transaction that holds the lock to update or delete a row.
>
> If transaction `T1` holds a shared \(`S`\) lock on row `r`, then requests from some distinct transaction `T2` for a lock on row `r` are handled as follows:
>
> * A request by `T2` for an `S` lock can be granted immediately. As a result, both `T1` and `T2` hold an `S` lock on `r`.
> * A request by `T2` for an `X` lock cannot be granted immediately.
>
> If a transaction `T1` holds an exclusive \(`X`\) lock on row `r`, a request from some distinct transaction `T2` for a lock of either type on `r` cannot be granted immediately. Instead, transaction `T2` has to wait for transaction `T1` to release its lock on row `r`.

In summary, An exclusive lock does not permit other two types of transactions lock  And it even waits for other shared transaction lock before acquiring locks.  And shared lock can be permitted among the shared lock.

There are various types of lock, [record Locks on index](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-record-locks), [gap lock for index table management](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-gap-locks) and so on.

### Isolation levels

Below are the contents about '[Isolation level](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)' on mysql manual

> You can enforce a high degree of consistency with the default [`REPEATABLE READ`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_repeatable-read) level, for operations on crucial data where [ACID](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_acid) compliance is important. Or you can relax the consistency rules with [`READ COMMITTED`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_read-committed) or even [`READ UNCOMMITTED`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_read-uncommitted), in situations such as bulk reporting where precise consistency and repeatable results are less important than minimizing the amount of overhead for locking. [`SERIALIZABLE`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_serializable) enforces even stricter rules than [`REPEATABLE READ`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_repeatable-read), and is used mainly in specialized situations, such as with [XA](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_xa) transactions and for troubleshooting issues with concurrency and [deadlocks](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_deadlock).



> The following list describes how MySQL supports the different transaction levels. The list goes from the most commonly used level to the least used.
>
> * `REPEATABLE READ`
>
>   This is the default isolation level for `InnoDB`. [Consistent reads](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_consistent_read) within the same transaction read the [snapshot](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_snapshot) established by the first read. This means that if you issue several plain \(nonlocking\) [`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) statements within the same transaction, these [`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) statements are consistent also with respect to each other. See [Section 15.7.2.3, “Consistent Nonlocking Reads”](https://dev.mysql.com/doc/refman/8.0/en/innodb-consistent-read.html).
>
>   For [locking reads](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_locking_read) \([`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) with `FOR UPDATE` or `FOR SHARE`\), [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html), and [`DELETE`](https://dev.mysql.com/doc/refman/8.0/en/delete.html) statements, locking depends on whether the statement uses a unique index with a unique search condition, or a range-type search condition.
>
>   * For a unique index with a unique search condition, `InnoDB` locks only the index record found, not the [gap](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_gap) before it.
>   * For other search conditions, `InnoDB` locks the index range scanned, using [gap locks](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_gap_lock) or [next-key locks](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_next_key_lock) to block insertions by other sessions into the gaps covered by the range. For information about gap locks and next-key locks, see [Section 15.7.1, “InnoDB Locking”](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html).
>
> * `READ COMMITTED`
>
>   Each consistent read, even within the same transaction, sets and reads its own fresh snapshot. For information about consistent reads, see [Section 15.7.2.3, “Consistent Nonlocking Reads”](https://dev.mysql.com/doc/refman/8.0/en/innodb-consistent-read.html).
>
>   For locking reads \([`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) with `FOR UPDATE` or `FOR SHARE`\), [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) statements, and [`DELETE`](https://dev.mysql.com/doc/refman/8.0/en/delete.html) statements, `InnoDB` locks only index records, not the gaps before them, and thus permits the free insertion of new records next to locked records. Gap locking is only used for foreign-key constraint checking and duplicate-key checking.
>
>   Because gap locking is disabled, phantom problems may occur, as other sessions can insert new rows into the gaps. For information about phantoms, see [Section 15.7.4, “Phantom Rows”](https://dev.mysql.com/doc/refman/8.0/en/innodb-next-key-locking.html).
>
>   Only row-based binary logging is supported with the `READ COMMITTED` isolation level. If you use `READ COMMITTED` with [`binlog_format=MIXED`](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_format), the server automatically uses row-based logging.
>
>   Using `READ COMMITTED` has additional effects:
>
>   * For [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) or [`DELETE`](https://dev.mysql.com/doc/refman/8.0/en/delete.html) statements, `InnoDB` holds locks only for rows that it updates or deletes. Record locks for nonmatching rows are released after MySQL has evaluated the `WHERE` condition. This greatly reduces the probability of deadlocks, but they can still happen.
>   * For [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) statements, if a row is already locked, `InnoDB` performs a “semi-consistent” read, returning the latest committed version to MySQL so that MySQL can determine whether the row matches the `WHERE` condition of the [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html). If the row matches \(must be updated\), MySQL reads the row again and this time `InnoDB` either locks it or waits for a lock on it.
>
>   Consider the following example, beginning with this table:
>
>   ```text
>   CREATE TABLE t (a INT NOT NULL, b INT) ENGINE = InnoDB;
>   INSERT INTO t VALUES (1,2),(2,3),(3,2),(4,3),(5,2);
>   COMMIT;
>   ```
>
>   In this case, the table has no indexes, so searches and index scans use the hidden clustered index for record locking \(see [Section 15.6.2.1, “Clustered and Secondary Indexes”](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html)\) rather than indexed columns.
>
>   Suppose that one session performs an [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) using these statements:
>
>   ```text
>   # Session A
>   START TRANSACTION;
>   UPDATE t SET b = 5 WHERE b = 3;
>   ```
>
>   Suppose also that a second session performs an [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) by executing these statements following those of the first session:
>
>   ```text
>   # Session B
>   UPDATE t SET b = 4 WHERE b = 2;
>   ```
>
>   As [`InnoDB`](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) executes each [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html), it first acquires an exclusive lock for each row, and then determines whether to modify it. If [`InnoDB`](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) does not modify the row, it releases the lock. Otherwise, [`InnoDB`](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) retains the lock until the end of the transaction. This affects transaction processing as follows.
>
>   When using the default `REPEATABLE READ` isolation level, the first [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) acquires an x-lock on each row that it reads and does not release any of them:
>
>   ```text
>   x-lock(1,2); retain x-lock
>   x-lock(2,3); update(2,3) to (2,5); retain x-lock
>   x-lock(3,2); retain x-lock
>   x-lock(4,3); update(4,3) to (4,5); retain x-lock
>   x-lock(5,2); retain x-lock
>   ```
>
>   The second [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) blocks as soon as it tries to acquire any locks \(because first update has retained locks on all rows\), and does not proceed until the first [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) commits or rolls back:
>
>   ```text
>   x-lock(1,2); block and wait for first UPDATE to commit or roll back
>   ```
>
>   If `READ COMMITTED` is used instead, the first [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) acquires an x-lock on each row that it reads and releases those for rows that it does not modify:
>
>   ```text
>   x-lock(1,2); unlock(1,2)
>   x-lock(2,3); update(2,3) to (2,5); retain x-lock
>   x-lock(3,2); unlock(3,2)
>   x-lock(4,3); update(4,3) to (4,5); retain x-lock
>   x-lock(5,2); unlock(5,2)
>   ```
>
>   For the second `UPDATE`, `InnoDB` does a “semi-consistent” read, returning the latest committed version of each row that it reads to MySQL so that MySQL can determine whether the row matches the `WHERE` condition of the [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html):
>
>   ```text
>   x-lock(1,2); update(1,2) to (1,4); retain x-lock
>   x-lock(2,3); unlock(2,3)
>   x-lock(3,2); update(3,2) to (3,4); retain x-lock
>   x-lock(4,3); unlock(4,3)
>   x-lock(5,2); update(5,2) to (5,4); retain x-lock
>   ```
>
>   However, if the `WHERE` condition includes an indexed column, and `InnoDB` uses the index, only the indexed column is considered when taking and retaining record locks. In the following example, the first [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) takes and retains an x-lock on each row where b = 2. The second [`UPDATE`](https://dev.mysql.com/doc/refman/8.0/en/update.html) blocks when it tries to acquire x-locks on the same records, as it also uses the index defined on column b.
>
>   ```text
>   CREATE TABLE t (a INT NOT NULL, b INT, c INT, INDEX (b)) ENGINE = InnoDB;
>   INSERT INTO t VALUES (1,2,3),(2,2,4);
>   COMMIT;
>
>   # Session A
>   START TRANSACTION;
>   UPDATE t SET b = 3 WHERE b = 2 AND c = 3;
>
>   # Session B
>   UPDATE t SET b = 4 WHERE b = 2 AND c = 4;
>   ```
>
>   The effects of using the `READ COMMITTED` isolation level are the same as enabling the deprecated [`innodb_locks_unsafe_for_binlog`](https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_locks_unsafe_for_binlog) configuration option, with these exceptions:
>
>   * Enabling [`innodb_locks_unsafe_for_binlog`](https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_locks_unsafe_for_binlog) is a global setting and affects all sessions, whereas the isolation level can be set globally for all sessions, or individually per session.
>   * [`innodb_locks_unsafe_for_binlog`](https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_locks_unsafe_for_binlog) can be set only at server startup, whereas the isolation level can be set at startup or changed at runtime.
>
>   `READ COMMITTED` therefore offers finer and more flexible control than [`innodb_locks_unsafe_for_binlog`](https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_locks_unsafe_for_binlog).
>
> * `READ UNCOMMITTED`
>
>   [`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) statements are performed in a nonlocking fashion, but a possible earlier version of a row might be used. Thus, using this isolation level, such reads are not consistent. This is also called a [dirty read](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_dirty_read). Otherwise, this isolation level works like [`READ COMMITTED`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_read-committed).
>
> * `SERIALIZABLE`
>
>   This level is like [`REPEATABLE READ`](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html#isolevel_repeatable-read), but `InnoDB` implicitly converts all plain [`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) statements to [`SELECT ... FOR SHARE`](https://dev.mysql.com/doc/refman/8.0/en/select.html) if [`autocommit`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_autocommit) is disabled. If [`autocommit`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_autocommit) is enabled, the [`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) is its own transaction. It therefore is known to be read only and can be serialized if performed as a consistent \(nonlocking\) read and need not block for other transactions. \(To force a plain [`SELECT`](https://dev.mysql.com/doc/refman/8.0/en/select.html) to block if other transactions have modified the selected rows, disable [`autocommit`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_autocommit).\)

### reference

* [https://suhwan.dev/2019/06/09/transaction-isolation-level-and-lock/](https://suhwan.dev/2019/06/09/transaction-isolation-level-and-lock/)
* [https://blog.sapzil.org/2017/04/01/do-not-trust-sql-transaction/](https://blog.sapzil.org/2017/04/01/do-not-trust-sql-transaction/)
* [https://en.wikipedia.org/wiki/Record\_locking](https://en.wikipedia.org/wiki/Record_locking)
* [https://en.wikipedia.org/wiki/ACID](https://en.wikipedia.org/wiki/ACID)
* [https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-shared-exclusive-locks)
* [아는만큼 보이는 데이터베이스 설계와 구축](http://www.yes24.com/Product/Goods/3000991)





