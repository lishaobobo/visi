## 波浪进度球 (Wave)

### 用法：
一般单独使用，表示一个`进度`、`具体数值`或`百分比值`。

#### 参数：
|参数名|默认值|类型|是否必填|说明|
|---|---|---|---|---|
|el|document.body|domObject \| d3.selection |false|图形的主容器|
|value||Number|false|进度条进度|
|width|''|String \| Number|false|图形宽度|
|height|''|String \| Number |false|图形高度|
|padding|10|Number|false|整个进度球距离主容器的边距|
|titleFormat|${value}%| Function |false|一个formatter函数，控制中间文字显示的内容|
|density|50|Number|false|波浪顺滑度|
|waveCount|5|Number|false|同时显示的波浪数量|
|waveHeight|5|Number|false|波浪的高度|
|borderStyle||Object|false|外边框样式|
|borderStyle.stroke|'#000000'|Color|false|外边框颜色|
|borderStyle.strokeWidth|3|Number|false|外边框粗细|
|centerStyle||Object|false|中心波浪填充物样式|
|centerStyle.stroke|'#d06969'|Color|false|填充物颜色|
|centerStyle.padding|5|Number|false|填充物距离外边框的值|
|textStyle||Object|false|文字样式|
|textStyle.color|'#000000'|Color|false|文字颜色|
|textStyle.clipColor|'#ffffff'|Color|false|被波浪淹没的文字颜色|
|textStyle.fontSize|'40px'|String|false|文字大小|
|animationConfig||Object|false|中心波浪填充物样式|
|animationConfig.duration|3000|Number|false|波浪速度|
|animationConfig.ease|d3.easeLinear|d3.ease|false|波浪缓动方式|

##### 例子：
```js
let option = {
  name: "wave",
  el: this.$refs.wave,
  value: 0.5,
};
this.wave = new Wave(option);
```