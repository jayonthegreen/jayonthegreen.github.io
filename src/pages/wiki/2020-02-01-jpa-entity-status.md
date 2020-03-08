---
templateKey: wiki
title: My JPA WIKI
image: /img/default.jpeg
date: 2020-02-01T00:35:48.194Z
---
## JPA status

- Transient: JPA가 모르는 상태
- Persistent: JPA가 관리중인 상태 (1차 캐시, Dirty Checking, Write Behind, ...)
- Detached: JPA가 더이상 관리하지 않는 상태.
- Removed: JPA가 관리하긴 하지만 삭제하기로 한 상태.

세션(트랜잭션) 밖에서 사용하면 detached 된다. detatch 되면 persistent 상태에서 해주던 것들을 더이상 해주지 않는다. 가령 객체를 수정하면 쿼리가 나간다거나, 객체에서 멤버를 가져올 때 lazy fetch 도 일어나지 않는다. 만약 서비스 로직에서 객체를 리턴하고, 컨트롤러에서의 그 객체는 persistent 상태가 아니다.

## Cascasde

- 상태를 업데이트 어떻게 시킬 것인가?

## Lock

- [https://reiphiel.tistory.com/entry/understanding-jpa-lock](https://reiphiel.tistory.com/entry/understanding-jpa-lock)
- [JPA 잠금(Lock) 이해하기](https://reiphiel.tistory.com/entry/understanding-jpa-lock)

### 낙관적 잠금(Optimistic Lock)

### 비관적 잠금(Pessimistic Lock)

### 암시적 잠금(Implicit Lock)

### 명시적 잠금(Explicit Lock)

일반적으로 주로 사용되는 데이터베이스는 주로 READ COMMITTED에 해당하는 격리수준을 가지는 경우가 많습니다. 하지만 JPA를 사용할 경우 한번 영속 컨텍스트에 적재된 엔터티를 다시 조회할 경우 데이터베이스를 조회하지 않고 영속 컨텍스트에서 엔터티를 가져오므로 REPEATABLE READ 격리수준과 동일하게 동작하게 됩니다.출처:

## Cache

- [[JPA] 하이버네이트 캐싱 시스템](https://12bme.tistory.com/491)
