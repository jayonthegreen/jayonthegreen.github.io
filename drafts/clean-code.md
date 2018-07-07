

## chapter 1. 깨끗한 코드

- 쓰레기 코드를 쳐다보며 나중에 손보겠다고 생각한 경험이 있다. 나중은 결코 오지 않는다.
- 나쁜 코드가 쌓일수록 팀 생산성은 떨어저 마침네 0에 근접한다.
- 간단한 코드는. 모든 테스트를 통과하고, 중복이 없으며, 설계 아이디어를 표현한다. 그리고 클래스/매서드/함수 등을 최대한 줄인다. - Ron Jeffires
- 중복 줄이기, 표현력 높이기, 초반부터 간단한 추상화 고려하기.
- 캠프장은 처음 왔을 때보다 더 깨끗하게 해놓고 떠나라. (...) 한꺼번에 많은 시간과 노력을 투자해 코드를 정리할 필요가 없다. 조금씩 개선하면 된다.
- 예술에 대한 책은 읽는다고 예술가가 된다는 보장은 없다.

## chapter 2. 의미있는 이름

- 추상적인 개념 하나에 단어 하나를 선택해 이를 고수한다. 예를 들어, 똑같은 메서들르 클래스마다 fetch, retrieve, get으로 제각각 부르면 혼란스럽다.

- 의미가 분명하지 못한 경우 클래스/함수/네임스페이스에 넣어 맥락을 부여한다. 모든 방법이 실패하면 마지막 수단으로 접두하를 붙인다. (인자에 addrFirstName, addLastName, addState 등으로 접두어를 붙어 맥락을 추가할 수 있다. 물론 Address 라는 class 를 생성하면 더 좋다.)


## chapter 3. 함수

- 한 함수 내에 추상화 수준을 섞으면 코드를 읽는 사람이 헷갈린다. 특정 표현이 근본 개념인지 아니면 세부사항인지 구분하기 어려운 탓이다. 하지만 문제는 이 정도로 그치지 않는다. 근본 개념과 세부사항을 뒤섞기 시작하면, 깨어진 창문처럼 사람들이 함수에 세부사항을 점점 더 추가한다.

-함수 추상화 부분이 한번에 한단계씩 낮아지는 것이 가장 이상적이다.(내려가기 규칙)
- 서술적인 이름을 사용하면 개발자 머릿속에도 설계가 뚜렷해진다.
- 입력인수를 그대로 돌려주는 함수라 할지라도 변환 함수 형식을 따르는 편이 좋다. 적어도 변환 형태는 유지하기 떄문이다.
- 플래그 인수는 추하다.
- side effect 를 일으키 마라.
- 명령과 조회를 분리하라
    ```java
    // bad
    if(set("username", "unclebob")) {
        ...
    }

    // good
    if(attrivuteExists("usernam")){
        setAttrivute("username", "unclebob");
    }

    ```
- 오류 코드를 선언하고 사용하는 대신, 예외를 사용하라. try/catch 블록은 원래 추하다. 정상과 오류처리 동작을 뒤섞는다. 그러므로 try/catch 블록을 별도 함수로 뽑아내는 편이 좋다.
    ```java
    // bad
    if (deletePage(page) == E_OK) {
        if (registry.deleteReference(page.name) == E_OK) {
            if (configKeys.deleteKey(page.name.makeKey()) == E_OK) {
                logger.log("page deleted");
            } else {
                logger.log("configKey not deleted");
            }
        } else {
            logger.log("deleteReference from registry failed"); 
        }
    } else {
        logger.log("delete failed"); return E_ERROR;
    }
    ```

    ```java
    // good
    public void delete(Page page) {
        try {
            deletePageAndAllReferences(page);
        } catch (Exception e) {
            logError(e);
        }
    }

    private void deletePageAndAllReferences(Page page) throws Exception { 
        deletePage(page);
        registry.deleteReference(page.name); 
        configKeys.deleteKey(page.name.makeKey());
    }

    private void logError(Exception e) { 
        logger.log(e.getMessage());
    }
    ```

## chapter 4. 주석

- 코드로 의도를 표현하라
    ```java
        // bad
        // 직원에게 복지 혜택을 받을 자격이 있는지 검사한다. 
        if ((emplotee.flags & HOURLY_FLAG) && (employee.age > 65) {
            ...
        }

        // good
        if (employee.isEligibleForFullBenefits()) {
            ...
        }
    ```
- 모든 함수에 Javadocs를 달거나 모든 변수에 주석을 달아야 한다는 규칙은 어리석기 그지없다. 이런 주석은 코드를 복잡하게 만들며, 거짓말을 퍼뜨리고, 혼동과 무질서를 초래한다. 아래와 같은 주석은 아무 가치도 없다.
    ```java
    /**
    *
    * @param title CD 제목
    * @param author CD 저자
    * @param tracks CD 트랙 숫자
    * @param durationInMinutes CD 길이(단위: 분)
    */
    public void addCD(String title, String author, int tracks, int durationInMinutes) {
        CD cd = new CD();
        cd.title = title;
        cd.author = author;
        cd.tracks = tracks;
        cd.duration = durationInMinutes;
        cdList.add(cd);
    }
    ```
-  함수나 변수로 표현할 수 있다면 주석을 달지 마라

    ```java
    // 전역 목록 <smodule>에 속하는 모듈이 우리가 속한 하위 시스템에 의존하는가?
    if (module.getDependSubsystems().contains(subSysMod.getSubSystem()))
    ```

    주석을 제거하고 다시 표현하면 다음과 같다.

    ```java
    ArrayList moduleDependencies = smodule.getDependSubSystems();
    String ourSubSystem = subSysMod.getSubSystem();
    if (moduleDependees.contains(ourSubSystem))
    ```

## chapter 5. 형식 맞추기

- 좋은 신문 기사는 최상단에 표제(기사를 몇마디로 요약하는 문구),
첫 문단에는 전체 기사 내용을 요약하며, 기사를 읽으며 내려갈 수록 세세한 사실이 조금씩 드러나며 세부사항이 나오게 된다.
소스파일 이름(표제)는 간단하면서도 설명이 가능하게 지어,
이름만 보고도 올바른 모듈을 살펴보고 있는지를 판단 할 수 있도록 한다.
소스파일의 첫 부분(요약 내용)은 고차원 개념과 알고리즘을 설명한다.
아래로 내려갈수록 의도를 세세하게 묘사하며, 마지막에는 가장 저차원 함수(아마 Getter/Setter?)와 세부 내역이 나온다.
신문이 사실, 날짜, 이름 등을 무작위로 뒤섞은 긴 기사 하나만 싣는다면 아무도 신문을 읽지 않을 것이다.

- 개념은 빈 행으로 분리하라. 코드의 각 줄은 수식이나 절을 나타내고, 여러 줄의 묶음은 완결된 생각 하나를 표현한다. 생각 사이에는 빈 행을 넣어 분리해야한다. 그렇지 않다면 단지 줄바꿈만 다를 뿐인데도 코드 가독성이 현저히 떨어진다.

- 개념적인 친화도가 높을 수록 코드를 서로 가까이 배치한다. 앞서 살펴보았듯이 한 함수가 다른 함수를 호출하는 종속성, 변수와 그 변수를 사용하는 함수가 그 예다. 그 외에도 비슷한 동작을 수행하는 함수 무리 또한 개념의 친화도가 높다.

## cphater 6. 객체와 자료구조

- 객체 지향 코드에서 어려운 변경은 절차적인 코드에서 쉬우며, 절차적인 코드에서 어려운 변경은 객체 지향 코드에서 쉽다. (...) 분별 있는 프로그래머는 모든 것이객체라는 생각이 미신임을 잘 안다. 때로는 단순한 자료구자와 절차적인 코드가 가장 적합한 상황도 있다.

- 디미터 법칙(law of demeter)은 잘 알려진 휴리스틱heuristic으로, 모듈은 자신이 조작하는 객체의 속사정을 몰라야 한다는 법칙이다.

## chapter 7. 오류 처리

- 오류 코드보다 예외를 사용하라
- 예외가 발생한 이유와 좀 더 구체적인 Exception 타입을 제공하라.
- 예외 코드를 래핑해 호출하는 곳에서 처리하기 수월하게 만들 수 있다.
```
  LocalPort port = new LocalPort(12);
  try {
    port.open();
  } catch (PortDeviceFailure e) {
    reportError(e);
    logger.log(e.getMessage(), e);
  } finally {
    ...
  }
  
  public class LocalPort {
    private ACMEPort innerPort;
    public LocalPort(int portNumber) {
      innerPort = new ACMEPort(portNumber);
    }
    
    // 사용하는 곳에서는 PortDeviceFailure 를 처리하면 됨! 
    public void open() {
      try {
        innerPort.open();
      } catch (DeviceResponseException e) {
        throw new PortDeviceFailure(e);
      } catch (ATM1212UnlockedException e) {
        throw new PortDeviceFailure(e);
      } catch (GMXError e) {
        throw new PortDeviceFailure(e);
      }
    }
    ...
  }
  ```
- null을 반환하는 코드는 일거리를 늘릴 뿐만 아니라 호출자에게 문제를 떠넘긴다.
- null을 넘기지 마라. 일반적으로 대다수의 프로그래밍 언어들은 파라미터로 들어온 null에 대해 적절한 방법을 제공하지 못한다.


## 생각

=> "한 함수 내에 추상화 수준을 섞으면 코드를 읽는 사람이 헷갈린다. 특정 표현이 근본 개념인지 아니면 세부사항인지 구분하기 어려운 탓이다." 그렇다. 어렵다.

=> 예술가에 대한 책을 읽는다고 예술가가 되는 것은 아니다. 코드를 공부한다고해서 코드를 잘 짜는 것은 아닐터이다. 많이 짜보자. 너무 생각없이 쓰지도, 너무 생각만 하지도 말자.

=> 가치 없는 주석, 오히려 해가 되는 주석을 달지 않는가. 오히려 '해'가 될 수도 있다는 사실자체를 섬뜩하게 여기는 사람이 되었으면 한다.

### 5 형식 맞추기 

- 프로그래밍과 글쓰기의 유사성을 이야기하는 사람이 많다. 책에서도 '신문 기사처럼 작성하라'라는 이야기를 한다. 
- 좋은 글이란 결국 사고에서 나온다고 생각한다. 명료하지 못한 생각은 읽기 어려운 글을 만든다. 프로그래밍도 비슷한 부분이 있다. 컴퓨터와 상호작용 한다는 측면에서 프로그래밍 기법도 중요하겠지만, 당연하게도 생각하는 것이 중요하다. 망치를 들면 모든 게 못으로 보일 것이니, 기법을 익히는 것보다 생각을 명료하게 하고 있는지 생각해봐야 한다. 
- 글쓰기에 관련하여 '생각한 만큼만 쓰라'라는 말이 있다. 코드를 쓰는 만큼 생각하는가, 혹은 생각만큼 코드를 쓰는가 고민해볼 필요가 있겠다. 

### 7 오류 처리 

- null을 긍정해본 적은 없는가? 나는 rest api payload 에 null을 넘기는 건 꽤나 명확할 때가 있다고 생각한다. 가령 글 목록을 반환하는 rest api 가 있다. method POST로 호출되는데, 검색 키워드가 있거나 없을 수 있다고 하면 어떻게 설계하는 게 조금 더 바람직할까? 
1. { “keyword”: null } 
2. {} 

나는 ‘키워드가 없다.’ 명시하기 위해 1번 방안이 더욱 좋다고 생각한다. Null도 잘 쓰면 명시적인 소통이 가능하다고 생각한다. 물론 처리하는 건 귀찮지만. 

물론 위와 같은 상황에서는 search api endpoint를 나누는 게 가장 합리적이라고 생각한다. 검색은 단순 목록 반환과는 또 다른 이야기니까.. 

- `try:... catch: pass` 따위 의 코드를 쓸 바에는 차라리 예외처리를 안 하는 게 낫다. 정말 어마어마한 블랙홀을 만들 수 있다고 생각한다. 

### 8 경계 

- 나는 써드파티를 사용할 때 기계적으로 wrapper를 짠다. 경계를 나누는 이유는 기능을 더하거나 제거할 때 혹은 그 라이브러리의 의존하지 않도록 만들기 위함이라고 생각해 왔다. 이러한 생각은 대부분에 경우에 유효하다. 근데 언제 한번 wrapper를 사용하지 않는 게 나을 수도 있다는 생각을 한 적이 있다. angular1의 $http였나.. 기억은 잘 안 나지만 튜닝의 끝은 순정이라는 생각을 코드에도 한 적이 있다. wrapping을 해서 과도하게 자신이 원하는 기능을 넣고 있다면 해당 써드파티의 철학을 오해하거나 잘못 사용하고 있을 수도 있다.

- 학습 테스트에 대해서 처음 들었다. 써드파티 동작을 이해하는 학습 테스트는 값어치를 한다고 한다. 가상계좌 시스템에 API를 호출하고 응답을 확인하는 테스트 코드를 짰다. 별다른 문서가 없고 코드만 존재하여 정말 api를 학습, 확인하기 위해 짰는데, 기분이 이상했다. 보통 타 시스템의 호출부를 스펙에 맞게 mocking 한 적은 있어도, 진짜로 타 시스템에 호출을 날리는 경우는 없었던 것 같다. 근데 이 책에서 '학습 테스트'에 대해서 긍정하는 것을 보고 꺼림칙한 기분이 없어졌다. MSA에서는 타 시스템의 학습 테스트를 어느 정도 할 수도 있겠다는 생각을 했다.