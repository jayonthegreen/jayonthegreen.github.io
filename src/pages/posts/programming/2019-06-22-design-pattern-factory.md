---

category: programming
date:  2018-06-22
title: design pattern, factory method
description:  객체의 생성하는 것을 캡슐화하는 패턴을 factory 라고 한다. 특히 서브클래스에서 어떤 클래스를 만들지 결정하게 만드는 것을 factory method 패턴이라고 한다.

---

객체의 생성하는 것을 캡슐화하는 패턴을 factory 라고 한다. 특히 서브클래스에서 어떤 객체를 만들지 강제하는 것을 factory method 패턴이라고 한다.

## background & pattern

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

- 팩토리보다는 팩토리메소드 패턴이 프레임워크처럼 구현을 강제하여 일관된 패턴을 가져갈 수 있다. (아래 예제 코드 참고)

- 팩토리에서 concrete class 를 의존하게 되면, 생성할 객체의 종류가 늘어남에 따라 팩토리에 의존성들이 늘어나게 된다. 이때 생성할 객체를 추상화하여 그것을 의존하면, 팩토리은 추상화된 것에 의존하게 된다. 이러한 것을 의존성 뒤집기라 한다.


## code with java

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

## misc

- concrete class: abstract class, interface가 아닌, 모든 오퍼레이션의 구현을 제공하는 class. 번역으로 '구상클래스'라고도 한다.

- 의존성 뒤집기:

    ![iod1](/img/programming/iod1.png "iod1")

    ![iod2](/img/programming/iod2.png "iod2")

## reference

- [https://www.oreilly.com/library/view/head-first-design/0596007124/ch04.html](https://www.oreilly.com/library/view/head-first-design/0596007124/ch04.html)

