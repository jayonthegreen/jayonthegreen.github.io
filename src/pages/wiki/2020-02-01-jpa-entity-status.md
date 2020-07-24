---
templateKey: wiki
title: my JPA wiki
image: /img/default.jpeg
date: 2020-02-01T00:35:48.194Z
---
## JPA 소개

### SQL를 직접 다룰 때 발생하는 문제점

* CRUD에 대한 비슷한 SQL를 반복적으로 작성해야한다.
* SQL에 의존적인 개발을 한다. 만약 회원 정보에 전화번호 필드와 컬럼을 추가한다면 관련된 모든 SQL를 수정해야한다.
* 모델링 객체에서 SQL을 의존하지만 산뢰할 수 없어, 진정한 의미의 계층 분리가 아니다.

### 객체지향 프로그래밍과 데이터베이스의 패러다임 불일치

* 객체는 상속이라는 기능을 가지고 있지만, 테이블은 없다. 

  ```java
    abstract class Item {}
    class Album extends Item {}
    class Movie extends Item {}
    class Book extends Item {}
  ```

  만약 위와같은 상황에서 Item, Album, Movie, Book 테이블이 따로 존재한다고 하면, 실질적으로 하나의 객체를 다루는데 2개의 테이블에 대한 SQL 이 필요하다. 

  ```sql
  INSERT INTO ITEM ...
  INSERT INTO ALBUM ...
  ```
* 객체는 참조를 사용해서 다른 객체와의 연관관계를 가지고 접근한다. 반면 테이블은 외래 키를 사용해서 조인으로 다른 객체에 접근한다.

  ```
  class Member {
     String id;
     Team team; // 참조로 연관관계를 갖는다. 객체관점에서는 teamId가 필요한 것이 아니라 team 이 필요하다.
     String username;
  }
  ```
* 객체에서 참조를 사용해서, 연관된 객체를 탐색해보자. 이것을 객체 그래프 탐색이라 한다.

  * 객체관점에서는 이용한다고 해보자.

  ```java
  member.getOrder().getOrderItem()
  ```

  * 그런데 만약 SQL 로 한다면?

  ```sql
  SELECT M.*, T.*
   FROM MEMBER M
   JOIN TEAM T ON M.TEAM_ID = T.ID
  ```

  * 만약 위와같은 상황에서 member.getTeam()을 sql 로 위와같이 작성했다면, 다른 객체에 대한 데이터가 없어 member.getOrder() 가 없다.
  * SQL를 직접 다루면 처음 실행하는 SQL 에 따라 객체를 어디까지 탐색할 수 있는지 정해진다. 이것은 객체지향 개발자에게 너무 큰 제약이다. 비지니스 로직에 따라 객체 그래프가 언제 끊길지 모르고, 그래프를 함부로 탐색하는 것은 큰 비용이다.

### JPA 란 무엇인가?

* JPA(Java Persistence API)는 자바 진영의 ORM 기술 표준이다.
* ORM(Object-Relational Mapping)이란 이름 그대로 객체와 관계형 데이터베이스를 맵핑한다는 뜻이다. ORM 은 객체와 테이블의 페러다임 불일치를 개발자 대신 해소해준다.
* 하이버네이트를 기반으로 자바 ORM 기술 표준이 만들어졌는데 이것이 바로 JPA 이다. JPA 는 자바 ORM 기술에 대한 표준 명세다.

### why ORM?

* 생산성
* 유지보수성
* 객체지향모델링과 디비테이블의 패러다임 불일치 해소
* 성능
* 데이터 접근 추상화
* 벤더 독립성

### 학습 곡선에 대하여

* JPA는 결국 ORM 과 데이터베이스라는 두 기둥위에 있다. 따라서 학습곡선이 있다.
* 단순히 예제를 복사해서 사용하면 금방 한계에 부딪힌다.

- - -

## JPA status

* Transient: JPA가 모르는 상태
* Persistent: JPA가 관리중인 상태 (1차 캐시, Dirty Checking, Write Behind, ...)
* Detached: JPA가 더이상 관리하지 않는 상태.
* Removed: JPA가 관리하긴 하지만 삭제하기로 한 상태.

세션(트랜잭션) 밖에서 사용하면 detached 된다. detatch 되면 persistent 상태에서 해주던 것들을 더이상 해주지 않는다. 가령 객체를 수정하면 쿼리가 나간다거나, 객체에서 멤버를 가져올 때 lazy fetch 도 일어나지 않는다. 만약 서비스 로직에서 객체를 리턴하고, 컨트롤러에서의 그 객체는 persistent 상태가 아니다.

## Lock

* <https://reiphiel.tistory.com/entry/understanding-jpa-lock>
* [JPA 잠금(Lock) 이해하기](https://reiphiel.tistory.com/entry/understanding-jpa-lock)

### 낙관적 잠금(Optimistic Lock)

### 비관적 잠금(Pessimistic Lock)

### 암시적 잠금(Implicit Lock)

### 명시적 잠금(Explicit Lock)

일반적으로 주로 사용되는 데이터베이스는 주로 READ COMMITTED에 해당하는 격리수준을 가지는 경우가 많습니다. 하지만 JPA를 사용할 경우 한번 영속 컨텍스트에 적재된 엔터티를 다시 조회할 경우 데이터베이스를 조회하지 않고 영속 컨텍스트에서 엔터티를 가져오므로 REPEATABLE READ 격리수준과 동일하게 동작하게 됩니다.출처:


## mapping & query

- ManyToOne 맵핑시 optional=false ㄹ나 JoinColumn 에 nullable=false 를 줘야 left outer 이 아니라 inner join 이 나가게 된다.


## Cache

* [\[JPA] 하이버네이트 캐싱 시스템](https://12bme.tistory.com/491)