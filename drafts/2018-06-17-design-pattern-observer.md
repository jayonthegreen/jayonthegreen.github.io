---

category: programming
date: 2018-06-17
title: design pattern, observer
description: 옵저버 패턴에서는 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들한테 상태변화를 알리고, 내용을 갱신해주는 일대다(one to many)의존성을 정의한다.
---

옵저버 패턴에서는 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들한테 상태변화를 알리고, 내용을 갱신해주는 일대다(one to many)의존성을 정의한다.

## background & pattern

- 한 객체의 상태가 변화할 때, 즉각적으로 다른 객체에게 알려야 할 때 옵저버 패턴을 고려할 수 있다. 상태 변화를 느슨한 결합으로 전파가능하다.
- 전파할 데이터 상태를 가지고 있고, 알리는 객체를 subject라고 하고 변화를 구독하는 객체를 observer 라고한다.

## code with python

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

## misc

- 느슨한 결합 : 상호작용은 하지만 서로에 대해 잘 모른다.