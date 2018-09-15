---

category: programming
date: 2018-06-19
title: design pattern, decorator
description: 객체에 추가적인 요건을 동적으로 첨가한다. 데코레이터는 서브클래스를 만드는 것을 통해서 기능을 유연하게 확장할 수 있는 방법을 제공한다.

---

객체에 추가적인 요건을 동적으로 첨가한다. 데코레이터는 서브클래스를 만드는 것을 통해서 기능을 유연하게 확장할 수 있는 방법을 제공한다.

## background & pattern

- 추상 메소드를 정의하면 서브클레스에서 그 메소드를 새로 정의해야 한다. 음료 추상클래스가 있고, 추상 클래스의 여러 커피 종류가 있는 상황을 생각 할 수 있다. 이러한 상황은 컴파일타임에서 서브클래스의 메소드들이 결정되게 된다.

- 특정 구상 구성요소인지를 확인한 다음 어떤 작업을 처리한느 경우에는 데코레이터 코드가 제대로 작동하지 않을 수 있다. 아래 예제의 HouseBlend 만 Mocha를 추가 했을 때 cost 할인해준다는 식의 접근은 불가하다. 따라서 추상 구성요소 형식을 바탕으로 돌아가는 코드에 대해서 더욱 적합하다.

- 데코레이터의 형식이 그 데코리에터로 감싸는 객체의 형식과 같게 하여, 기존의 클래스를 확장하면서 코드 변화에는 닫혀있는 OCP(open closed principle)를 만족 할 수 있다.

- 데코레이터 패턴을 과하게 이용하다보면, 즉 감싸는 클래스가 많아지면,  코드를 유지보수하는데 어려움을 줄 수 있다.

## code with java

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

## misc

- OPC(open closed principle) : 확장에 대해서는 열려 있어야 하지만 코드 변경에 대해서는 닫혀 있어야 한다. 그러나 무조건 OCP 를 적용하는 것은 불필요하게 복잡하고 유지보수하기 힘든 코드를 만들 수 있으므로 주의해야 한다.