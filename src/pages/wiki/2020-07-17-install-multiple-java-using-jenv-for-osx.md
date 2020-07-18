---
templateKey: wiki
title: Install multiple java using jenv for osx
image: /img/default.jpeg
date: 2020-07-17T01:52:43.923Z
---
```
$ brew update
$ brew tap homebrew/cask-versions
$ brew search java
$ brew cask install java11

$ # java home 
$ /usr/libexec/java_home -v 11
/Library/Java/JavaVirtualMachines/openjdk-11.0.1.jdk/Contents/Home

$ # add jenv java11
$ jenv add $(/usr/libexec/java_home -v 11)


$ jenv versions 
$ jenv global 11.0.x (check your java version )


--------------- ~/.zshrc ----------
$ export JAVA_HOME=$(/usr/libexec/java_home -v 11)
--------------- .bashrc, .zhrc ----------
$ source ~/.zshrc

$ java -version
```