

## chapter 1 깨끗한 코드

- 쓰레기 코드를 쳐다보며 나중에 손보겠다고 생각한 경험이 있다. 나중은 결코 오지 않는다.
- 나쁜 코드가 쌓일수록 팀 생산성은 떨어저 마침네 0에 근접한다.
- 간단한 코드는. 모든 테스트를 통과하고, 중복이 없으며, 설계 아이디어를 표현한다. 그리고 클래스/매서드/함수 등을 최대한 줄인다. - Ron Jeffires
- 중복 줄이기, 표현력 높이기, 초반부터 간단한 추상화 고려하기.
- 캠프장은 청므 왔을 때보다 더 깨끗하게 해놓고 떠나라. (...) 한꺼번에 많은 시간과 노력을 투자해 코드를 정리할 필요가 없다. 조금씩 개선하면 된다.
- 예술에 대한 책은 읽는다고 예술가가 된다는 보장은 없다.

## chapter 2 의미있는 이름

- 추상적인 개념 하나에 단어 하나를 선택해 이를 고수한다. 예를 들어, 똑같은 메서들르 클래스마다 fetch, retrieve, get으로 제각각 부르면 혼란스럽다.

- 의미가 분명하지 못한 경우 클래스/함수/네임스페이스에 넣어 매갉을 부여한다. 모든 방법이 실패하면 마지막 수단으로 접두하를 붙인다. (인자에 addrFirstName, addLastName, addState 등으로 접두어를 붙어 맥락을 추가할 수 있다. 물론 Address 라는 class 를 생성하면 더 좋다.)


## chapter 3 함수

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

## chapter 4 주석

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

## 생각

- 추상화 수준이 비슷한 layer 를 만드는 노력
- Exception 처리에 대하여.. 얼마나 추상적인 익셉션을 정의 해야하는가...