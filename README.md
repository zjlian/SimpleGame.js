# SimpleGame.js
一个基于 html5 canvas 的简单2d游戏框架
### 闲的蛋疼时或许会完善一些功能
* 修复fps计算出错；
* 更准确的碰撞检测；
* 更加合理的游戏部件储存方案，目前是可动的用Map+Array储存，不可动的障碍物用Array储存，碰撞检测只会在可动与不可动物体之间进行, 同类型物体想要进行碰撞检测需要自己在覆盖的 SimpleGame.update() 方法中调用 SimpleGame.collision 和全局的 collisionHanding() 函数进行处理；

## 一些小游戏demo
* [打砖块](https://zjlian.github.io/Break-The-Blocks/app.html) SimpleGame.js就是从就是从这个[练手程序](https://github.com/zjlian/Break-The-Blocks)中抽离出来的；
* [打飞机](https://zjlian.github.io/SimpleGame.js/examples/Pixel%20Fighter/app.html) 框架使用的例子，目录 examples 中有源码；
***
