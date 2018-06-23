---

category: programming
date:  2018-06-23
title: Head First Design Pattern
description: 2018년이 된 지금, 다시 책을 펼쳤고 이번에는 조금 달랐다. 신기하게도 낯선 개념들은 없었지만 내용을 살펴보는 것을 넘어 공감과 생각을 많이 할 수 있는 시간이 되었다.

---

## 3번째 이 책을 읽다.

개발을 막 시작한 2014년, 나에게 개발을 알려준 형이 [Head First Design Pattern](http://www.hanbit.co.kr/store/books/look.php?p_code=B9860513241)를 추천해줬고 얼마 지나지 않아 책도 줬다. 처음 책을 접했을 때에는 대부분의 내용들이 잘 와 닿지는 않았다. 그 당시 나는 class 문법은 알지만 그것을 능숙하게 활용하며 코드를 짜지는 못했기 때문이다. 2016년 처음으로 회사를 다니게 되었고 파이팅 넘치게 다시 책을 펼쳤지만 당시에도 크게 공감하지는 못했다. 그리고 2018년이 된 지금, 다시 책을 펼쳤고 이번에는 조금 달랐다. 신기하게도 낯선 개념들은 없었지만 내용을 살펴보는 것을 넘어 공감과 생각을 많이 할 수 있는 시간이 되었다. 그래서 그런지 읽고 정리하는데도 큰 부담이 없었던 것 같다.

## Table of Contents

---

- [Observer](#observer)
- [Strategy](#strategy)
- [Decorator](#decorator)
- [Factory Method](#factory-method)
- [Singleton](#singleton)

## <a name="observer"></a>Observer

---

옵저버 패턴에서는 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들한테 상태변화를 알리고, 내용을 갱신해주는 일대다(one to many)의존성을 정의한다.

### background & pattern

- 한 객체의 상태가 변화할 때, 즉각적으로 다른 객체에게 알려야 할 때 옵저버 패턴을 고려할 수 있다. 상태 변화를 느슨한 결합으로 전파가능하다.
- 전파할 데이터 상태를 가지고 있고, 알리는 객체를 subject라고 하고 변화를 구독하는 객체를 observer 라고한다.

### code with python

```python
class Subject:
    def __init__(self):
        self.__observers = []

    def register_observer(self, observer):
        self.__observers.append(observer)

    def unregister_observer(self, observer):
        if observer in self.__observers
            self.__observer.remove(observer)

    def notify_observers(self, *args, **kwargs):
        for observer in self.__observers:
            observer.notify(self, *args, **kwargs)

class Observer:
    def __init__(self, subject):
        subject.register_observer(self)

    def notify(self, subject, *args, **kwargs):
        print('Got', args, kwargs, 'From', subject)


subject = Observable()
observer = Observer(subject)
subject.notify_observers('test')
```

### misc

- 느슨한 결합 : 상호작용은 하지만 서로에 대해 잘 모른다.

## <a name="strategy"></a> Strategy

---

알고리즘군을 정의하고 각각 캡슐화하여 교환해서 사용할 수 있도록 만든다. 스트래티지를 활용하면 알고리즘과 알고리즘을 사용하는 클라언트를 분리하여 관리할 수 있다.

### background & pattern

- 상속을 남용하면 문제가 생긴다. 부모클래스의 메소드가 자식클래스에 영향을 미처 수정시 사이드이팩트가 발생 할 수 있고, 오버라이딩 이용하면 서브클래스에서 코드가 중복된다.
- 부모 클래스의 인터페이스를 사용한다면 결국 서브클래스에서 모두 구현하므로 코드 재사용 관점에서 비효율적이다.
- 클래스의 행위를 따로 클래스(인터페이스 or 추상클래스)로 정의하고,여러 상황의 행위를 구현한다. 이 행동이 정의된 클래스를, 행동을 할 클래스에서 이용한다.
- 특정 '행동'도 객체라고 사고 할 수 있다. 행위를 하고자하는 클래스와, 행위 클래스가 나눈다. 이는 행위의 주체 객체에 행위를 '구성' 할 수 있다.

### code with java

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

## <a name="decorator"></a> Decorator

---

객체에 추가적인 요건을 동적으로 첨가한다. 데코레이터는 서브클래스를 만드는 것을 통해서 기능을 유연하게 확장할 수 있는 방법을 제공한다.

### background & pattern

- 추상 메소드를 정의하면 서브클레스에서 그 메소드를 새로 정의해야 한다. 음료 추상클래스가 있고, 추상 클래스의 여러 커피 종류가 있는 상황을 생각 할 수 있다. 이러한 상황은 컴파일타임에서 서브클래스의 메소드들이 결정되게 된다.

- 특정 구상 구성요소인지를 확인한 다음 어떤 작업을 처리한느 경우에는 데코레이터 코드가 제대로 작동하지 않을 수 있다. 아래 예제의 HouseBlend 만 Mocha를 추가 했을 때 cost 할인해준다는 식의 접근은 불가하다. 따라서 추상 구성요소 형식을 바탕으로 돌아가는 코드에 대해서 더욱 적합하다.

- 데코레이터의 형식이 그 데코리에터로 감싸는 객체의 형식과 같게 하여, 기존의 클래스를 확장하면서 코드 변화에는 닫혀있는 OCP(open closed principle)를 만족 할 수 있다.

- 데코레이터 패턴을 과하게 이용하다보면, 즉 감싸는 클래스가 많아지면,  코드를 유지보수하는데 어려움을 줄 수 있다.

### code with java

```java
public abstract class Beverage {
    public abstract double cost();
}

// 첨가물을 나타내는 추상클래스(데코레이터)
public abstract class CodimentDecorator extends Beverage {}

public class Esopresso extends Beverage {
    public double cost() {
        return 1.99;
    }
}

public class HouseBlend extends Beverage {
    public double code() {
        return .89;
    }
}

public class Mocha extends CodimentDecorator {
    Beverage beverage;

    public Mocha (Beverage beverage) {
        this.beverage = beverage;
    }

    public double cost() {
        // 첨가물의 가격을 더해준다.
        return 0.2 + this.beverage.cost();
    }
}

public static void main(String args[]) {
    Beverage beverage = Esopresso();
    // 모카 두번 추가!
    beverage = new Mocha(beverage);
    beverage = new Mocha(beverage);
    Systme.out.println("에소프레소에 모카 두번!" + beverage.cost());
}
```

### misc

- OPC(open closed principle) : 확장에 대해서는 열려 있어야 하지만 코드 변경에 대해서는 닫혀 있어야 한다. 그러나 무조건 OCP 를 적용하는 것은 불필요하게 복잡하고 유지보수하기 힘든 코드를 만들 수 있으므로 주의해야 한다.

## <a name="factory-method"></a>Factory Method

---

객체의 생성하는 것을 캡슐화하는 패턴을 factory 라고 한다. 특히 서브클래스에서 어떤 객체를 만들지 강제하는 것을 factory method 패턴이라고 한다.

### background & pattern

- concrete class를 많이 사용하면 새로운 concrete class 를 추가 할 때마다 코드를 고쳐야 하는 경우가 있다. 즉 변화에 닫혀있는 코드가 된다.
    ```java
    Duck duck
    if(sth) {
        duck = new MallardDuck();
    } else {
        duck = new RubberDuck();
    }
    ```

- 위와 같이 객체를 생성하는 부분을 캡슐한 class를 factory 라고 한다. 단순히 factory 클래스로 코드를 옮겼을 뿐이지만, 충분히 가치가 있다. OOP 에서 객체생성은 피할 수 없으므로 이를 잘 관리하는 것은 중요하다.

- 팩토리보다는 팩토리메소드 패턴이 언터페이스를 정의하고 서브클래스의 구현을 강제하여 일관된 패턴을 가져갈 수 있다. (아래 예제 코드 참고)

- 팩토리에서 concrete class 를 의존하게 되면, 생성할 객체의 종류가 늘어남에 따라 팩토리에 의존성들이 늘어나게 된다. 이때 생성할 객체를 추상화하여 그것을 의존하면, 팩토리는 추상화된 것에 의존하게 된다. 이러한 것을 의존성 뒤집기라 한다.


### code with java

```java
// factoray method pattern
public abstract class PizzaStore {

    public Pizza orderPizza(String type){
        Pizza pizza;
        pizza = createPizza(type);

        pizza.prepare();

        return pizza;
    }

    // 서브클래스에서 객체 생성하는 작업을 캡슐화 한다.
    protected abstarctPizza createPizza(String type); 
}
```

### misc

- concrete class: abstract class, interface가 아닌, 모든 오퍼레이션의 구현을 제공하는 class. 번역으로 '구상클래스'라고도 한다.

- 의존성 뒤집기:

    ![iod1](/img/programming/iod1.png "iod1")

    ![iod2](/img/programming/iod2.png "iod2")

### reference

- [https://www.oreilly.com/library/view/head-first-design/0596007124/ch04.html](https://www.oreilly.com/library/view/head-first-design/0596007124/ch04.html)

## <a name="singleton"></a>Singleton

---

해당 클래스의 인스턴스가 하나만 만들어지고, 어디서든지 그 인스턴스에 접근할 수 있도록 하기 위한 패턴.

### background & pattern

- 사실상 객체중에 하나만 있으면 되는것이 많다. 쓰레드풀이라던지, 사용자 설정등이 그러하다. 컴퓨팅 자원관점에서도 그러하고 개념적인 설계 관점에서도 그러하다.

- 전역 변수로 관리하면 저녁 네임스페이스가 관리되지 않고, 어플리케이션이 시작하자 마자 자원을 차지하기 때문에 오버헤드가 있을 수 있다. 싱글턴 패턴이 전역 네임스페이스의 문제는 완벽히 해결하지 못해도, 인스턴스를 lazy load 해준다는 관점에서는 그 효용이 명백하다. 객체 생성비용이 많을 때에는 lazy load 를 고려해볼 수 있다.

### code with java

```java

// simple singleton
public class Singleton {
    private static Singleton uniqueInstance;

    // 외부에서 생성자 호출를 막는다.
    private Singleton() {};

    // 'synchronized' 를 사용하여 thread safe 한 코드를 만든다. uniqueInstance가 없을 때 멀티 쓰레드가 동시에 getInstance 를 호출하면 객체가 여러개 생길 수 있다.
    public static synchronized Singleton getInstance(){
        if (uniqueInstance == null) {
            uniqueInstance = new Singleton();
        }
        return uniqueInstance;
    }
}

// synchronized를 이용한 method 동기화의 오버헤드를 부담이 되는 경우라면, 처음 class가 load 될 때 생성 할 수 있다.
public class SingletonWithoutSyncronizedMethod {
    // JVM 에서는 class loader 마다 서로다른 네임스페이스를 정의 하기 때문에, 클래스가 여러번 로드되어 싱글턴이 여러개 만들어질 수 있으니 클래스 로더를 조심히 살피자.
    private static SingletonWithoutSyncronizedMethod uniqueInstance = new SingletonWithoutSyncronizedMethod();

    // 외부에서 생성자 호출를 막는다.
    private SingletonWithoutSyncronizedMethod() {};.
    public static synchronized SingletonWithoutSyncronizedMethod getInstance(){
        return uniqueInstance;
    }
}
```