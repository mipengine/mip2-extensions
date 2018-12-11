# `mip-animation`

标题|内容
----|----
类型|通用
支持布局| nodisplay
所需脚本| [https://c.mipcdn.com/static/v2/mip-animation/mip-animation.js](https://c.mipcdn.com/static/v2/mip-animation/mip-animation.js)

## 说明

`mip-animation` 是 mip 用来定义和展示动画效果的组件，其功能依赖于 Web Animations API 。主要使用方法是定义一个 `mip-animation` 组件，并在其内部定义一段 `json` 作为对动画效果的描述。其中 `keyframes` 字段的值可以是定义了多个阶段动画的数组，也可以是一个动画效果的对象，最后还可以是字符串，如果是字符串，就表示 `keyframes` 的定义会从 `style` 节点中读取。

## 示例

### 基本使用
```html
<style mip-custom>
  .inner-00 {
    height: 20px;
    width: 40px;
    background: red;
  }
</style>
<div class="inner-00"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-00",
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
<style mip-custom>
  .inner-11 {
    height: 20px;
    width: 40px;
    background: red;
  }
</style>
<div class="inner-11"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-11",
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
<style mip-custom>
  .inner-01 {
    height: 20px;
    width: 40px;
    background: red;
  }
</style>
<div class="inner-01"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-01",
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

### CSS expression && CSS extension
```html
<style mip-custom>
  .inner-02 {
    height: 20px;
    width: 40px;
    background: red;
  }
</style>
<div class="inner-02"></div>
<mip-animation trigger="visibility" id="anim">
  <script type="application/json">
    {
      "selector": ".inner-02",
      "keyframes": [
        {
          "transform": "translateX(0px)"
        },
        {
          "transform": "translate(calc(index() * 10px + width()+ 100%), calc(height() *rand())) rotate(45deg)"
        }
      ],
      "duration": 1000
    }
  </script>
</mip-animation>
```

### subtargets 和 on 语法
```html
<style mip-custom>
  .wrapper {
    background: #dcdcdc;
    height: 500px;
  }

  .inner {
    width: 20px;
    height: 20px;
  }

  .inner-0 {
    background: red;
  }

  .inner-1 {
    background: yellow;
  }

  .inner-2 {
    background: green;
  }

  .inner-3 {
    background: black;
  }
</style>
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

### trigger
说明：动画触发时机，设置为 `visibility` 则首次进入视口的时候开始执行，否则一直都不执行。   
类型：字符串  
取值：'visibility'  
单位：无  
默认值：无  

## json 字段说明

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
> 注意：目前经过测试发现 `delay` 不能带单位，默认是毫秒，不知道是不是 bug，暂时是这样  

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

## CSS expression && CSS extension

### calc()

说明：计算一个 CSS 属性的值，其中的表达式需要符合 calc 规范，作为运算符的加减号需要被空格包围，而乘除不强求。其内部同样支持所有的 CSS expression && CSS extension  
参数：符合要求的表达式  

### var()

说明：用于 CSS 求值，可在 json 字段中定义 CSS 变量，然后在需要的时候利用 var 进行求值，变量必须以 '--' 开头  
参数：可以有一个或两个参数，第一个参数是 CSS 定义的变量，如果找不到定义，则直接使用第二个参数作为默认值  

### index()

说明：这个表达式表示当前元素在动画效果中的序号，也就是说在使用 `selector` 的时候，选中的元素不止一个。第一个匹配的结果为 0，之后为 1，以此类推  
参数：无

### rand()

说明：产生一个随机数。如果没有参数，这默认参数一个 0-1 之间的随机数，没有单位；如果是两个参数，那么将产生一个在两者之间的随机数，单位不是同种类型的话将报错，类似的，单位一个是秒，一个是毫秒，将会进行转化再求值  
参数：两个相同类型的参数或者无  

### num()

说明：取一个数字，类似 `parseFloat` 效果，通常作用是去掉单位。  
参数：一个字符串  

### width() height()

说明：选取特定元素的宽度值或高度值，如果没有参数，则是当前元素的宽高；如果是正常的样式选择器参数，则返回查找到的元素的宽高；如果是 `closest('.selector')` 的用法，就返回最近的祖先元素的宽高  
参数：字符串或无  

