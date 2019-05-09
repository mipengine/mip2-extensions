# mip-fullpage-scroll

标题|内容
----|----
类型|通用
支持布局|responsive
所需脚本| [https://c.mipcdn.com/static/v2/mip-fullpage-scroll/mip-fullpage-scroll.js](https://c.mipcdn.com/static/v2/mip-fullpage-scroll/mip-fullpage-scroll.js)

## 说明

全屏显示项目并将多余部分隐藏，滑动手势切换显示内容。
标签必须应用于页面body的子节点，否则会引起部分内容无法显示。


## 示例

基本使用方法

```html
<style mip-custom>
  /* 针对导航点的样式配置 */
  .navdots{
    position: absolute;
    bottom: 10%;
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  .navdot{
    height: 20px;
    width: 20px;
    border: 1px solid black;
    border-radius: 10px;
    float: left;
  }
</style>
<mip-fullpage-scroll changefun="lr" id="c-test">
    <div id="pagebox">
      <div class="section">页面1</div>
      <div class="section">页面2</div>
    </div>
</mip-fullpage-scroll>
```

暴露方法
ChangeTo(pageIndex)             快速切换页面到pageIndex（从0开始）
MoveTo({top:...,left:...})      整体显示区域移动到位置（position:relative）
BackToDefault()                 返回整体区域默认显示位置（0,0）


```html
<style mip-custom>
  /* 针对导航点的样式配置 */
  .navdots{
    position: absolute;
    bottom: 10%;
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  .navdot{
    height: 20px;
    width: 20px;
    border: 1px solid black;
    border-radius: 10px;
    float: left;
  }

  /* 页面整体导航样式 */
  .mainmenu{
    background: black;
    color: white;
    padding: 20px;
    border-radius: 10px;
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 100;
  }
  .backmenu{
    background: black;
    color: white;
    padding: 20px;
    border-radius: 10px;
    position: absolute;
    right: 10px;
    top: 100px;
    z-index: 100;
  }
</style>
<div class="mainmenu" on="tap:c-test.MoveTo({top:0,left:'-100px'})"> menu </div>
<div class="backmenu" on="tap:c-test.BackToDefault"> back(请点击menu后使用观察效果) </div>
<mip-fullpage-scroll id="c-test">
    <div id="pagebox">
      <div class="section">页面1</div>
      <div class="section">页面2</div>
    </div>
</mip-fullpage-scroll>
```

## 属性

### changefun

**说明**：
用于确定页面切换方式，左右或上下。
可选参数：
ud ： （up and down） 上下切换
lr ： （left and right） 左右切换

**必选项**：否

**单位**：无

**默认值**：ud

### id

**说明**：
用于确定组件标签，以提供方法使用。

**必选项**：是

**单位**：无

**默认值**：ud



## 包含标签

### #pagebox

**说明**：
用于包裹所有页面并进行切换

**必选项**：是

### .section

**说明**：
用于包裹单一页面内容，整体显示内容在其中，可存在多个

**必选项**：是



## 方法

### ChangeTo(pageIndex)

**说明**：
快速切换页面到pageIndex（从0开始）

**参数说明**：
pageIndex   必选    页面编号，从0开始

### MoveTo({top:...,left:...})

**说明**：
整体显示区域移动到位置（position:relative）

**参数说明**：
left        必选   页面移动目标点x轴方向位置
top         必选   页面移动目标点y轴方向位置

### BackToDefault()

**说明**：
返回整体区域默认显示位置（0,0）,需搭配MoveTo方法使用