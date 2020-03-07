---
templateKey: wiki
title: JPA entity status
image: /img/default.jpeg
date: 2020-02-01T00:35:48.194Z
---
### Cascade

* 엔티티의 상태 변화를 어떻게 전파시킬 것인가?

### 상태란 무엇인가?

* Transient: JPA가 모르는 상태
* Persistent: JPA가 관리중인 상태 (1차 캐시, Dirty Checking, Write Behind, ...)
* Detached: JPA가 더이상 관리하지 않는 상태.
* Removed: JPA가 관리하긴 하지만 삭제하기로 한 상태.

세션(트랜잭션) 밖에서 사용하면 detached 된다. detatch 되면 persistent 상태에서 해주던 것들을 더이상 해주지 않는다. 가령 객체를 수정하면 쿼리가 나간다거나, 객체에서 멤버를 가져올 때 lazy fetch 도 일어나지 않는다. 만약 서비스 로직에서 객체를 리턴하고, 컨트롤러에서의 그 객체는 persistent 상태가 아니다.

![](/img/entity-status.png)
