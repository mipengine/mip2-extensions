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

示例说明

```html
<mip-fullpage-scroll changefun="lr">
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




## 包含标签

### #pagebox

**说明**：
用于包裹所有页面并进行切换

**必选项**：是

### .section

**说明**：
用于包裹单一页面内容，整体显示内容在其中，可存在多个

**必选项**：是