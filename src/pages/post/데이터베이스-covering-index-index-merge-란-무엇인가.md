---
templateKey: post
title: 'covering index 와 index merge '
image: /static/nude.jpg
date: 2020-02-02T11:24:17.034Z
description: 데이터베이스 인덱스 테이블은 메인 데이터 공간과 분리되어 있다
---
## 인덱스 테이블 → 데이터 조회

인덱스 테이블은 테이블의 레코드 데이터 공간과 분리되어 있다. 따라서 인덱스를 바탕으로 원하는 데이터가 있는 물리 주소를 알아낸 뒤에, 데이터에 접근하는 2단계 접근이 필요하다. 그러나 주소를 바탕으로 데이터 물리 주소에 직접 접근하는 것은 비용이 크다. 이와 관련있는 두 개념 "covering index" 와 "index merge" 를 살펴보자.

## Covering index, Index only read

인덱스 조회만으로 데이터에 직접 접근하지 않고 실행이 가능하여 성능 이득을 볼 수 있다. 가령 `SELECT COUNT(*) FROM ... WHERE A < 100` 이라는 검색조건에 A 가 인덱스로 걸려있다고 하자. 이때 A 인덱스의 개수만 세어보아도 조회 쿼리를 수행 할 수 있다. 즉 레코드의 물리 데이터 접근은 일어나지 않는 경우가 있다. 또 다른 유형은 `SELECT X FROM ... WHERE X < 300` 으로 X 가 인덱스에 있다면 레코드의 물리 데이터 조회 없이도 쿼리를 수행할 수 있다. 이와 같은 작업 유형을 "Index only read', "covering index" 라고 한다.

복합키를 거는 경우 covering index 효과를 누릴 수 있다. 가령 A,B,C 컬럼 순서대로 복합키를 건 상태에서 `SELECT C FROM ... WHERE A='foo' and B='bar'` 같은 쿼리를 날리더라도 C 가 인덱스테이블에 있는 정보기 때문에 레코드의 물리 데이터 조회 없이도 인덱스만으로 쿼리가 수행 가능하다. GROUP BY 로 집계 쿼리가 많은 경우에도 복합키를 걸어 Covering index 효과를 누릴 수 있다.

## Index merge

만약 `SELECT * FROM ... WHERE A='a' or B='b'` 라는 조건이 있고 A,B 컬럼이 각각 인덱스로 관리되었다고 치자. A 를 검색한 뒤 데이터를 가져오고, B 를 검색한뒤 데이터를 가져와서 병합하는 작업이 필요할 것이다. 이때 데이터를 가져오기 전, 인엑스만으로 집합 연산을 먼저 수행하고 그 결과를 바탕으로 데이터를 가져온다면 효율적이다.

인덱스 머지는 MySQL 에서 알려진 제한이 있다. 풀텍스트 인덱스에서는 인덱스 머지가 적용될 수 없다. 더불어 AND/OR 이 복잡하게 섞여있는 경우가 있다면 아래와 같이 변형시켜줘야 실행계획이 잘 선택 될 수 있다. 

```
(x AND y) OR z => (x OR z) AND (y OR z)
(x OR y) AND z => (x AND z) OR (y AND z)
```

## Reference

* [](https://blog.toadworld.com/2017/04/06/speed-up-your-queries-using-the-covering-index-in-mysql)<https://blog.toadworld.com/2017/04/06/speed-up-your-queries-using-the-covering-index-in-mysql>
* [](https://www.postgresql.org/docs/12/indexes-index-only-scans.html)<https://www.postgresql.org/docs/11/indexes-index-only-scans.html>
* [](https://dev.mysql.com/doc/refman/8.0/en/index-merge-optimization.html)<https://dev.mysql.com/doc/refman/8.0/en/index-merge-optimization.html>
* [](http://www.unofficialmysqlguide.com/covering-indexes.html)<http://www.unofficialmysqlguide.com/covering-indexes.html>
* [데이터베이스를 지탱하는 기술](http://www.yes24.com/Product/goods/27893960)
