---

category: dev
date:  2018-02-25
title: http cache 정리
description: '캐쉬가 프로그래머가 의도한대로 최신화 되지 않으면, 최신화된 데이터나 이미지등이 보이지 않게되어 치명적일 수 있다. 여러 방면에서 cache를 논할 수 있지만, 우선 http cache에 대해 정리를 해보고자 한다.'
keywords: http cache, cache

---

## 시작하며

--- 

캐쉬는 미래에 요청될 응답을 빠르게 전달하기 위해 응답을 저장하는 것으로 이해할 수 있다. 그러나 이런 time & space 의 trade off 보다 cache lifecycle이 문제일 것이다. 멋진 말이 있지 않은가. 
> There are only two hard things in Computer Science: cache invalidation and naming things. 
> -- Phil Karlton

캐쉬가 프로그래머가 의도한 대로 최신화되지 않으면, 최신화된 데이터나 이미지 등이 보이지 않게 된다. 여러 방면에서 cache를 논할 수 있지만, 우선 http cache에 대해 정리를 해보고자 한다.

## kinds of web cache

---

#### 1. Browser caches 
컴퓨터 하드디스크에 http 응답을 저장한다. 유저가 브라우저 백버튼을 누르거나, 한번 불러온 image를 저장한다거나 등의 캐슁을 수행한다. 

#### 2. Proxy caches 
네트워크 레이어의 캐시이다. 브라우저 클라이언트나, 요청을 담당하는 서버의 파트가 아니다. 일반적으로 ISP, 방화벽에 설치된다. 많은 유저가 공유하는 일종의 shared cache이다. 

#### 3. Gateway caches 
네트워크에 설치되지 않고, 실제 요청을 담당하는 서버에서 관리되는 캐시이다. reverse proxy caches 혹은 surrogate caches라고도 불린다. 로드벨 렌서에 의해 요청이 gateway caches로 route 되어 처리된다. CDNs(Content Delivery Networs) 서비스들은 결국 gateway caches를 제공하는 것이다.

## how web caches work 

--- 

기본적인 룰은 아래와 같다. 

- 응답 헤더에서 캐시 하지 말라고 하면, 캐시 되지 않는다. 
- https 이거나 http 인증을 사용한 경우 shared cache 에 의해 캐시 되지 않는다. 
- expiry time 이 유효하거나 다른 age-controlling hader set 이 유효하면, 최신 응답으로 간주하고 캐슁 하지 않는다. 
- 캐쉬가 최신 상태가 아니라면, 서버에 요청을 보내서 validate 하고 유효하지 않은 경우 재전송이 일어난다. 

html meta tags는 쓰기 쉽지만 효과적이지 않다. 모든 브라우저에 지원하지 않고, proxy cache가 아니다. 반면 http headers는 브라우저와 프록시를 제어하는 관점에서 더 많은 제어권을 준다. 따라서 http header를 통한 cache 지시자들을 알아보자.

#### 1. Pragma 

header 에 Prama: no-cache를 주면 캐싱이 될 것이라 생각하지만, 모든 브라우저에서 작동하지 않기에 다른 방법을 알아보아야 한다. 

#### 2. Expires 

`Expires: Fri, 30 Oct 1998 14:19:41 GMT`처럼 사용되고 매일 오전 6시마다 이미지가 변하는 상황 등 규칙적으로 페이지가 변할 때 유용하다. 그러나 웹서버의 시간의 싱크를 맞춰야 하므로 오작동의 여지가 있다. 더불어 요청하는 입장에서 expires를 적시에 업데이트하지 않으면, 이 값에 따라 캐시가 계속해서 무효화되므로 의도하지 않은 서버 부하가 있을 수 있다. 

#### 3. Cache-Control 

Expires를 보완하고자 1.1부터 Cache-Control이라는 헤더 명세가 추가되었다. `Cache-Control: max-age=3600, must-revalidate`처럼 사용되는데, 이를 해석하면 3600초까지는 케쉬를 사용하고, 이후에는 유효성 검사를 진행해야만 한다는 뜻이다. 자세한 값의 스펙은 [여기](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)를 참고하도록 하자.

#### 캐쉬 유효성 검사

현재 가지고 있는 캐시 된 데이터가 최신인지 서버에 확인하는 것을 cache validation 즉 캐시 유효성 검사라고 한다. 만약 캐시가 유효한 경우에는 서버에서 콘텐츠에 대한 모든 응답을 내려줄 필요가 없어 네트워크 비용을 아낄 수 있다. http 1.1 에서는 ETag라는 validator 가 도입되었다. ETags 서버에서 생성된 unique indetifiers로 리소스 혹은 리소스의 업데이트 timestamp 기반으로 해슁 된 값을 갖는다. [If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match) 요청일 때 Etag 값이 같다면 서버는 캐시를 보장할 수 있어 유효성 검사를 할 수 있다. 대부분의 유효성 검사방식은 Last-Modifies를 이용하지만 Etag방식도 점점 퍼지고 있다고 한다.( 호기심에 여러 사이트를 브라우저로 확인해봤는데 If-None-Match 헤더는 볼 수 없었다. [Why browser does not send “If-None-Match” header? 
Ask Question](https://stackoverflow.com/questions/15900548/why-browser-does-not-send-if-none-match-header))

## 끝맺음 

---

페이지 로드에서는 정적 콘텐츠 로드가 bottleneck이 될 확률이 크기 때문에 이러한 http cache에 대해 한번은 정리해서 생각해볼 필요가 있다고 생각한다. 과거에 s3 이미지를 수동으로 업로드하고 사용할 일이 있었는데, http cache 고려하지 않았다가 모바일 웹뷰에서 이미지가 안 바뀌는 현상을 겪어 당황했던 적이 있었다. 이렇게 http cache를 어떻게 컨트롤되는지 한번 정리하고 나니, 조금이나마 찝찝했던 부분들이 어느 정도 해소되었다.


## reference

---

- [https://www.mnot.net/cache_docs/](https://www.mnot.net/cache_docs/)
- [https://www.letmecompile.com/http-cache-%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC/](https://www.letmecompile.com/http-cache-%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC/)
