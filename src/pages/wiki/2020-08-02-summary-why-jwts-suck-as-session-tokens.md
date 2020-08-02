---
templateKey: wiki
title: TL;DR "Why JWTs Suck as Session Tokens"
image: /img/default.jpeg
date: 2020-08-02T10:02:35.257Z
---
This is summary of <https://developer.okta.com/blog/2017/08/17/why-jwts-suck-as-session-tokens>

## TL;DR

* their contents (the JSON data inside of them) are usually not encrypted. This means that anyone can view the data inside the JWT, even without a key. JWTs don’t try to encrypt your data so nobody else can see it, they simply help you verify that it was created by someone you trust.
* The server can validate this token locally without making any network requests, talking to a database, etc. This can potentially make session management faster because instead of needing to load the user from a database (or cache) on every request, you just need to run a small bit of local code. This is probably the single biggest reason people like using JWTs: they are stateless.
* why JWTs suck. 

  * Size, For example Storing "abc123:" demands 51 times larger when using JWT compared to Session.
  * Advantage is not that big.  the stateless benefits of a JWT are not being taken advantage of. you’ll likely be talking to the cache server / database regardless of whether or not you’ve got a JWT
* Conclusion

  * Plain old sessions!