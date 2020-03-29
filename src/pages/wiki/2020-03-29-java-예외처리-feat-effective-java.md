---
templateKey: wiki
title: Java 예외처리 ( feat. Effective java )
image: /img/exception.png
date: 2020-03-29T12:18:52.667Z
---
## Checked vs Unchecked

* **Checked Exception** : checked at compile, RuntimeException 이외의 모든 에러
* **Unchecked Exception** : RuntimeException 에러

  ![](/img/exception.png)

## Effective java 예외

### item 69. 예외는 진짜 예외 상황에만 사용하라

1. 예외는 예외 상황에 쓸 용도로 설계되었다.
2. JVM 입장에서는 try catch 블록안에 넣으면 최적화 제한적이다.

```java
// Bad 
try { int i = 0; while(true) range\[i++].foo() } catch (ArrayIndexOUtBoundsException e) { // sth }

// God
for(T m : range) m.foo()
```

예외는 일상적인 제어 흐름용으로 쓰여선 안되며, 이를 프로그레머에게 강요하는 API 를 만들어서도 안된다.

잘 설계된 API 라면 클라이언트가 정상적인 제어 흐름에서 예외를 사용할 일이 없게 해야 한다.

특정 상태에서만 호출 할 수 있는 '상태 의존적' 메서드를 재공하는 클래스는 '상태 검사' 메서드도 함께 제공해야 한다. Iterator 의 next 와 hasNext 가 상태의존적 메서드와 검사 메서드에 해당된다. 상태를 검사할 수 있기 때문에 hasNext 와 같은 조건을 걸 수 있다.

### item 70 복구할 수 있는 상황에는 검사 예외를, 프로그래밍 오류에는 런타임 예외를 사용하라

문제 상황을 알리는 타입(throwable)으로 검사 예외, 런타임 예외, 에러 이렇게 3 가지를 제공한다.

호출쪽에서 복구하리라 여거지는 상황이라면 검사 예외(Checked Excetpion)를 사용하라. 이것이 검사/비검사 예외를 구분하는 기본 규칙이다.

### item 71 필요 없는 검사 예외(Checked Exception) 사용은 피하라

* 꼭 필요한 곳에만 사용한다면 검사 예외는 프로그램의 안정성을 높혀주지만, 남용하면 쓰기 고통스러운 API 를 낳는다. API 호출자가 예외 상황에서 복구할 방법이 없다면 비검사 예외를 던지자.
* 검사 예외를 회피하는 방법은 적절한 결과 타입을 담은 옵셔녈을 반환하는 것이다. 빈 옵셔널일 때 예외가 발생한 이유를 알 지 못한다.
* 검사 에외를 던지는 메소드를 2개로 쪼개 비검사 예외로 바꿀 수 있다. 이 방식에서 첫번째 메서드는 예외가 던져질지 여부를 불리안 값으로 반환한다.

### item 72 표준 예외를 사용해라

* 자바 라이브러리는 대부분 API 에서 쓰기 충분한 예외를 제공한다.
* `IllegalArgumentException` :허용하지 않는 값이 인수로 건네졌을 때(null은 따로 `NullPointerException`으로 처리)
* `IllegalStateException` :객체가 메서드를 수행하기에 적절하지 않은 상태일 때
* `NullPointerException` : null을 허용하지 않는 메서드에 null 건넸을 때
* `ConcurrentModificationException` :허용하지 않는 동시 수정이 발견됐을 때
* `UnsupportedOperationException` : 호출한 메서드를 지원하지 않을 때

### item 73 추상화 수준에 맞는 예외를 던져라

상위 계층에서는 저수준의 예외를 잡아 자신의 추상화 수준에 맞는 예외로 바꿔 던져야 한다.

예외번역

```java
try{
} catch(LowerLevelException e){ 
throw new HigherLevelException();
}
```

예외를 번역할 때, 저수준의 예외가 디버깅에 도움이 된다면 예외 연쇄를 사용하는 것이 좋다.

```java
try{
} catch(LowerLevelException e){ throw new HigherLevelException(e);
}
class HigherLevelException extends Exception { HigherLevelException(Throwable throwable){ super(throwable); }
}
```

### 끝맺음

* 커리어 전반에 있어 어플리케이션 전역에 GOTO 문으로 사용하는 RuntimeException 을 사용하는 패턴을 종종 본다. (물론 이런 패턴을 가져가는 개발자들의 마음은 이해를 못하는건 아니다. ) 이렇게 암묵적인 GOTO 문으로 사용되는 예외가, 저수준의 함수에 있다면 재사용성이 떨어진다. 나아가 스파게티 GOTO 문은 복잡도가 증가하면 당신은(=나..) 지옥을 맞보게 될 것이다.
