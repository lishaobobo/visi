import * as d3 from "d3";
import * as util from "../map/util";

function getSplitInfo(total, index) {
  const innerAngleTotal = 180 * (total - 2);
  const oneAngleTotal = innerAngleTotal / total;
  const angle =
    oneAngleTotal - (oneAngleTotal / 2 + (180 - oneAngleTotal) * index);

  return {
    angle,
    x: Math.sin((angle * Math.PI) / 180),
    y: Math.cos((angle * Math.PI) / 180),
  };
}

function textFormat(value) {
  return (value * 100).toFixed(2) + "%";
}
/**
 *
 * @class
 * @example
 * 默认配置
 *  options = {
 *    name: "Timeline", //实例名
 *    el: document.body, //容器
 *    options: {
 *      value: 0, // 进度 0 - 1
 *      reverse: false, // 是否逆时针
 *      borderWidth: 10, // 进度条宽度
 *      radius: 50, // 圆半径,默认为50,实际使用时多为容器宽高最小值的一半
 *      cx: 100, //圆心x点坐标
 *      cy: 100, // 圆心y点坐标
 *      circle: true, // 圆形进度条
 *      splitConut: 2, // 渐变分段数量
 *      color: d3.scaleSequential(d3.interpolate("#fff123", "red")), // 配色
 *      ease: d3.easeCubic, // 缓动函数
 *      duration: 1000, // 动画时间
 *      showCircle: true, // 是否显示圆角
 *      fullIsHideCircle: true, // 转满100%的时候不显示圆角
 *      showTrack: true, // 是否显示背景轨道
 *      trackColor: "#ffffff", // 背景轨道底色  rgba || 16进制
 *      showText: true, // 是否显示title
 *      text: null, // title内容
 *      textFormat: textFormat, // text内容格式化回调
 *      textStyle: {
 *        color: "#ffffff", // text颜色 rgba || 16进制
 *        fontSize: "16px", // text字体大小
 *      },
 *      changeEndCallback: null, // 动画结束回调
 *      padding: 14, // 内边距
 *      showDot: true, // Dot圆环是否显示
 *      dotRadius: 10, // 圆环半径
 *      dotThickness: 3, // 圆环边厚度
 *      dotFill: "#FFF", // 圆环填充颜色,默认为白色,为了盖住path,所以一般不更改
 *      dotStrokeColor: "#000", // 圆环边颜色
 *      showInnerCircle: true, // 是否含有内圆
 *      innerCircleFill: "rgba(0,0,0,1)", // 圆环填充颜色 rgba || 16进制 || hal || hsv || lab
 *      innerCircleScale: 0.9, // 内圆与外圆比, 默认为0.9, 值越大内圆越大
 *    }
 *   };
 *
 */
class Timeline {
  _options = {
    name: "Timeline",
    el: document.body,
    options: {
      // 进度 0 - 1
      value: 0,
      // 是否逆时针
      reverse: false,
      // 进度条宽度
      borderWidth: 10,
      // 圆形进度条
      circle: true,

      // 圆半径
      radius: 50,
      // 圆心位置
      cx: 100, //圆心x点坐标
      cy: 100, // 圆心y点坐标

      // 渐变分段数量
      splitConut: 2,
      // 配色
      color: d3.scaleSequential(d3.interpolate("#fff123", "red")),
      // 缓动函数
      ease: d3.easeCubic,
      // 动画时间
      duration: 1000,
      // 是否显示圆角
      showCircle: true,
      // 转满100%的时候不显示圆角
      fullIsHideCircle: true,
      // 是否显示背景轨道
      showTrack: true,
      // 背景轨道底色
      trackColor: "#ffffff",
      // 是否显示title
      showText: true,
      text: null,
      textFormat: textFormat,
      textStyle: {
        color: "#ffffff",
        fontSize: "16px",
      },
      // 动画结束
      changeEndCallback: null,
      // 内边距
      padding: 14,
      // Dot相关配置
      showDot: true,
      dotRadius: 10,
      dotThickness: 3,
      dotFill: "#FFF",
      dotStrokeColor: "#000",
      // 是否含有内圆
      showInnerCircle: true,
      innerCircleFill: "rgba(0,0,0,1)",
      innerCircleScale: 0.9,
    },
  };


  constructor(options) {
    // 合并参数
    util.extend(true, this._options, options);
    util.extend(true, this, this._options);

    // 加载容器
    if (this.el instanceof d3.selection) {
      this.container = this.el;
    } else {
      if (d3.select(this.el) instanceof d3.selection) {
        this.container = d3.select(this.el);
      } else {
        throw new Error("container unavailable !");
      }
    }

    // 加载svg
    this.svg = this.container.append("svg");

    // 加载uuid
    this.uuid = util.uuid();

    // 检测颜色
    if (typeof this.options.color === "string") {
      this.color = d3.scaleSequential(
        d3.interpolate(this.options.color, this.options.color)
      );
    } else {
      this.color = this.options.color;
    }

  }
}

export { Timeline as default };
