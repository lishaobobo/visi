## Base 基类

### 简介
该组件是一个图形基类，在开发其他图形组件需要继承该类，例：

```js
import Base from '../Base';

class Wave extends Base {
  constructor(options){
    super(options)
  }
}
```

---

### 提供的方法
#### super(options, subOptions, config)
###### 参数：

- {Object}[options]: 用户提供的参数, 必填, 默认:

|参数|默认值|
|---|---|
|name|""|
|el|document.body|
|width|"100%"|
|height|"100%"|

- {Object}[subOptions]: 子类图形默认参数, 必填
- {Object}[config]: Base基类配置项, 非必填

|参数|默认值|说明|
|---|---|---|
|useDefs|false|传入则提供defs给子类使用|

###### 用法：
在子类构建时构建基类所用，用于合并参数，子类通过this._options使用

```js
constructor(options){
  super(options, this.options, {})
}
```


#### resetSvgSize()
###### 用法: 
根据options传入的`width`和`height`对整个svg的大小进行调整，若未传入某一项则该项根据父级大小调整。并更新`this.width`和`this.height`的数值。该函数在`基类构件时自动调用一次`。


#### resetViewBoxSize()
###### 用法：
更新svg的viewBox数值，调用该函数会触发子类提供的`this._onSetViewBoxSize`，若子类未提供则根据画布大小调整。该函数在`基类构件时自动调用一次`。


#### _onSetViewBoxSize(container)
###### 用法：
在触发`resetViewBoxSize`时会使用该函数返回的值对画布的viewBox进行调整，该函数需调用在`子类自身`。

```js
_onSetViewBoxSize(container) {
  return {
    width: parseInt(container.style("width")),
    height: parseInt(container.style("height"))
  };
}
```


#### destroy()
###### 用法：
子类销毁时调用，该方法会清除主容器下所有dom元素和由基类提供的对象引用。


#### resize()
###### 用法：
该函数开放给用户端，用户端调用后会以函数防抖的形式触发子类的`_resize`函数。


#### setOptions(options)
###### 参数：
- {Object}[options]: 用户提供的新的options

###### 用法：
该函数开放给用户端，用户端调用后会先将新的options合并到参数集，再触发子类的`_setOptions`函数。


#### registerAnimate(obj, onEndCallback)
###### 参数：
- {d3|d3.selection}[obj]: 需要触发d3动画的实体
- {Function}[onEndCallback]: 通话结束后的回调

###### 用法:
为图形组件注册一个动画函数，该函数会被分配一个uuid以保证独立性。注册后会返回真正的触发动画的函数。
#### return function(tickCallback, options)
###### 参数：
- {Function}[tickCallback]\(t): 动画运行到不同阶段的回调函数，t为tick值 0 - 1。
- {Object}[options]: { duration: 1000, ease: d3.easeLinear }

```js
// 以下是一个波浪持续运动的动画
// 注册动画并存储，this.clipPath是一个<clipPath />的d3.selection对象
this.animationWave = this.registerAnimate(this.clipPath, () => {
  // ...动画结束时的回调...
  // 还原<clipPath />的偏移
  this.clipPath.attr("transform", `translate(0, 0)`);
  // 并再次运行动画
  this.animationWave(this.waveTickFunc(), options.waveAnimationConfig);
});
```

---

### 提供的属性
#### uuid
每个组件独立的id

#### container
主容器

#### svg
svg容器

#### defs
defs容器

#### _options
参数集