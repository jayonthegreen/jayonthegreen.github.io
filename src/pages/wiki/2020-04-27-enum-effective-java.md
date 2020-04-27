---
templateKey: wiki
title: "Enum, Effective Java "
image: /img/default.jpeg
date: 2020-04-27T22:57:48.244Z
---
## 상수 대신 enum 을 사용

열거 타입 자체는 클래스고, 상수 하나당 자신의 인스턴스를 하나씩 만들어 public static final 필드로 공개한다 

```java
public Enum Apple { FUJI, PIPPIN, GRANNY_SMITH }
```

클라이언트가 인스턴스를 직접 생성하거나 확장할 수 없다.  열거타입 선언으로 만들어진 인스턴스는 딱 하나만 존재함을 보장한다.

Strategy enum pattern Use it, if multiple enum constants share common behaviors.

```java
enum PayrollDay{
		MONDAY(PayType.WEEKDAY),
		TUESDAY(PayType.WEEKDAY),
		...
		SATURDAY(PayType.WEEKEND),
		SUNDAY(PayType.WEEKEND);

		private final PayType payType;

		PayrollDay(PayType payType) {this.payType = payType;}

		double pay(double hoursWorked, double payRate){
			return payType.pay(hoursWorked, payRate);
		}
		//The strategy  enum type
		private enum PayType{
			WEEKDAY{
				double overtimePay(double hours, double payRate) { return ...}
			};
			WEEKEND{
				double overtimePay(double hours, double payRate) { return ...}
			};
			private static final int HOURS_PER_SHIFT = 8;

			abstract double overtimePay(double hours, double payRate);

			double pay(double hoursWorked, double payRate){
				double basePay = hoursWorked * payRate;
				return basePay + overtimePay(hoursWorked, payRate);
			}
		}
	}
```