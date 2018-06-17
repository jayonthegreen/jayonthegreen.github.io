---

category: programming
date:  2018-06-17
title: design pattern, strategy
description:  알고리즘군을 정의하고 각각 캡슐화하여 교환해서 사용할 수 있도록 만든다. 스트래티지를 활용하면 알고리즘과 알고리즘을 사용하는 클라언트를 분리하여 관리할 수 있다.

---

## 배경 그리고 패턴

- 상속을 남용하면 문제가 생긴다. 부모클래스의 메소드가 자식클래스에 영향을 미처 수정시 사이드이팩트가 발생 할 수 있고, 오버라이딩 이용하면 서브클래스에서 코드가 중복된다.
- 부모 클래스의 인터페이스를 사용한다면 결국 서브클래스에서 모두 구현하므로 코드 재사용 관점에서 비효율적이다.
- 클래스의 행위를 따로 클래스(인터페이스 or 추상클래스)로 정의하고,여러 상황의 행위를 구현한다. 이 행동이 정의된 클래스를, 행동을 할 클래스에서 이용한다.
- 특정 '행동'도 객체라고 사고 할 수 있다. 행위를 하고자하는 클래스와, 행위 클래스가 나눈다. 이는 행위의 주체 객체에 행위를 '구성' 할 수 있다.

## 패턴 정의

알고리즘군을 정의하고 각각 캡슐화하여 교환해서 사용할 수 있도록 만든다. 스트래티지를 활용하면 알고리즘과 알고리즘을 사용하는 클라언트를 분리하여 관리할 수 있다.

## 예시 코드

```java

// 행위 인터페이스
public interface FlyBehavior {
    public void fly() { }
}

// 행위 구현체
public class FlyWithWings implements FlyBehavior {
    public void fly() {
        System.out.println("I'm flying!!");
    }
}

// 행위를 할 객체의 클래스
public abstract class Duck {
    FlyBehavior flyBehavior;

    public Duck() { }

    public void setFlyBehavior(FlyBehavior fb) {
        flyBehavior = fb;
    }
    
    // 행위를 표현하는 객체 사용
    public void performFly() {
        flyBehavior.fly();
    }
    // 서브클래스에서 공통적으로 정의되어야할 메소드
    abstract void display();

    // 서브클래스 모두 공통적으로 같은 행위를 하는 메소드
    public void swim() {
        System.out.println("All ducks float, even decoys!");
    }
}

public class WingsDuck implements Duck {
    public WingDuck() {}
}

public class Runner() {
    public static void main(String[] args) {
        Duck wingDuck = new WingDuck();
        wingDuck.setFlyBehavior(new FlyWithWings());
    }
}
```
