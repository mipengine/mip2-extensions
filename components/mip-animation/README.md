# `mip-animation`

标题|内容
----|----
类型|通用
支持布局| nodisplay
所需脚本| [https://c.mipcdn.com/static/v2/mip-animation/mip-animation.js](https://c.mipcdn.com/static/v2/mip-animation/mip-animation.js)

## 说明

`mip-animation` 是 mip 用来定义和展示动画效果的组件，其功能依赖于 Web Animations API 。主要使用方法是定义一个 `mip-animation` 组件，并在其内部定义一段 `json` 作为对动画效果的描述。

## 示例

### 基本使用
```html
<div class="inner-0"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-0",
      "keyframes": [
        {
          "transform": "translateX(0px)"
        },
        {
          "transform": "translateX(300px)"
        }
      ],
      "duration": 1000
    }
  </script>
</mip-animation>
```

### 媒体查询
```html
<div class="inner-1"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-1",
      "keyframes": [
        {
          "transform": "translateX(0px)"
        },
        {
          "transform": "translateX(300px)"
        }
      ],
      "duration": 1000,
      "switch": [
        {
          "media": "(max-width: 375px)",
          "keyframes": [
            {
              "transform": "translateX(0px)"
            },
            {
              "transform": "translateX(200px)"
            }
          ]
        }
      ]
    }
  </script>
</mip-animation>
```

### CSS.supports
```html
<div class="inner-0"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-0",
      "keyframes": [
        {
          "transform": "translateX(0px)"
        },
        {
          "transform": "translateX(300px)"
        }
      ],
      "duration": 1000,
      "switch": [
        {
          "supports": "offset-distance: 0",
          "keyframes": [
            "offsetDistance": [0, '200px']
          ]
        }
      ]
    }
  </script>
</mip-animation>
```

### subtargets 和 on 语法
```html
<div class="wrapper">
  <div class="inner inner-0"></div>
  <div class="inner inner-1"></div>
  <div class="inner inner-2"></div>
  <div class="inner inner-3"></div>
</div>
<mip-animation id="anim">
  <script type="application/json">
    {
      "selector": ".inner",
      "keyframes": [
        {
          "transform": "translateX(0px)"
        },
        {
          "transform": "translateX(300px)"
        }
      ],
      "switch": [
        {
          "media": "(max-width: 375px)",
          "subtargets": [
            {
              "index": 1,
              "duration": 800
            },
            {
              "selector": ".inner-3",
              "duration": 600
            }
          ]
        },
        {
          "media": "(min-width: 376px)",
          "subtargets": [
            {
              "index": 1,
              "duration": 10000
            },
            {
              "selector": ".inner-3",
              "duration": 12000
            }
          ]
        }
      ],
      "duration": 1000,
      "subtargets": [
        {
          "index": 1,
          "duration": 5000
        },
        {
          "selector": ".inner-3",
          "duration": 6000
        }
      ]
    }
  </script>
</mip-animation>
<button on="tap:anim.start">start</button>
<button on="tap:anim.pause">pause</button>
<button on="tap:anim.resume">resume</button>
<button on="tap:anim.restart">restart</button>
<button on="tap:anim.togglePause">toggle pause</button>
<button on="tap:anim.reverse">reverse</button>
<button on="tap:anim.seekTo(6000)">seekTo 6000</button>
```

## 属性

### duration
说明：动画耗时  
类型：数字或字符串  
取值：整数或字符串（如 2000 或 '2s'）  
单位：毫秒或秒  
默认值：0  

### delay  
说明：动画延迟  
类型：数字或字符串  
取值：整数或字符串（如 2000 或 '2s'）  
单位：毫秒或秒  
默认值：0  

### endDelay  
说明：动画结束之后的推迟时间    
类型：数字或字符串  
取值：整数或字符串（如 2000 或 '2s'）  
单位：毫秒或秒  
默认值：0  

### direction  
说明：动画播放顺序    
类型：字符串  
取值：'normal', 'reverse'    
单位：无  
默认值：'normal'  

### easing
说明：动画速度  
类型：字符串  
取值："linear", "ease", "ease-in", "ease-out",  "ease-in-out" 和 [其他](https://www.w3.org/TR/web-animations/)  
单位：无  
默认值：'linear'  

### fill
说明：决定动画播放前后的效果  
类型：字符串  
取值：'forwards', 'backwards', 'both', 'none'  
单位：无  
默认值：'none'  

### iterationStart 
说明：描述在动画的哪个时间点开始  
类型：数字  
取值：0-1  
单位：无  
默认值：0  

### iterations
说明：动画重复次数  
类型：数字或字符串  
取值：整数或 'Infinity'  
默认值：1  


> 后续支持：1、Keyframes from CSS；2、calc(), car(), width(), height(), num(), rand() and index()；3、Animation composition；
