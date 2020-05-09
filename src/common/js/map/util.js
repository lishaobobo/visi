import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

//颜色格式化 '#999999','rgb','hsl',0x999999
function colorToHex(color) {
  if (typeof color === "string") {
    if (color.indexOf("#") !== -1) color = parseInt(color.replace("#", ""), 16);
    else color = new THREE.Color(color).getHex();
  }
  return color;
}

/**
 * 过渡动画
 * @param {Object|*} from - 修改的启始值
 * @param {Object|*} to - 修改的结束值
 * @param {number} [time] - 完成时间
 * @param {number} [delay=0] - 延迟时间
 * @param {Tween.Easing} [easing=TWEEN.Easing.Linear.None] -动画类型
 * @param {callback} [callback] - 完成回调
 * @example
 * $.transition(area.position, {x:0,y:0,z:10}, 1000, 500, TWEEN.Easing.Quartic.Out, callback)
 */
function transition(from, to, time, delay, easing, callback) {
  if (typeof time !== "number") {
    time = 1000;
  }
  if (!callback) callback = () => {};
  new TWEEN.Tween(from)
    .to(to, time)
    .delay(delay || 0)
    .easing(easing || TWEEN.Easing.Linear.None)
    .start()
    .onComplete(callback);
}

let extend = (function() {
  var copyIsArray,
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    class2type = {
      "[object Boolean]": "boolean",
      "[object Number]": "number",
      "[object String]": "string",
      "[object Function]": "function",
      "[object Array]": "array",
      "[object Date]": "date",
      "[object RegExp]": "regExp",
      "[object Object]": "object",
    },
    type = function(obj) {
      return obj == null
        ? String(obj)
        : class2type[toString.call(obj)] || "object";
    },
    isWindow = function(obj) {
      return obj && typeof obj === "object" && "setInterval" in obj;
    },
    isArray =
      Array.isArray ||
      function(obj) {
        return type(obj) === "array";
      },
    isPlainObject = function(obj) {
      if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
        return false;
      }

      if (
        obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")
      ) {
        return false;
      }

      var key;
      for (key in obj) {
      }

      return key === undefined || hasOwn.call(obj, key);
    },
    extend = function(deep, target, options) {
      for (var name in options) {
        var src = target[name];
        var copy = options[name];

        if (target === copy) {
          continue;
        }

        if (
          deep &&
          copy &&
          (isPlainObject(copy) || (copyIsArray = isArray(copy)))
        ) {
          if (copyIsArray) {
            copyIsArray = false;
            var clone = src && isArray(src) ? src : [];
          } else {
            var clone = src && isPlainObject(src) ? src : {};
          }

          target[name] = extend(deep, clone, copy);
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }

      return target;
    };

  return extend;
})();

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "_";

  var uuid = s.join("");
  return uuid;
}

/**
 * @desc 函数节流
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param type 是否保留最后一次
 * - `1` 停止后抛弃最后一次
 * - `2` 停止后执行最后一次
 */
function throttle(func, wait = 150, type = 2) {
  let previous = 0;
  let timeout;
  return function() {
    if (type === 1) {
      let now = Date.now();
      if (now - previous > wait) {
        func();
        previous = now;
      }
    } else if (type === 2) {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func();
        }, wait);
      }
    }
  };
}

/**
 * @desc 函数防抖
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param immediate 是否立即执行
 * - `true` 表立即执行
 * - `false` 表非立即执行
 */
function debounce(func, wait = 150, immediate = false) {
  let timeout;
  return function() {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) func();
    } else {
      timeout = setTimeout(function() {
        func();
      }, wait);
    }
  };
}

export { colorToHex, extend, transition, uuid, throttle, debounce };
