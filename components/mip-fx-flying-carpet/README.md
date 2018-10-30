# `mip-fx-flying-carpet`

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, flex-item
所需脚本| [https://c.mipcdn.com/static/v2/mip-fx-flying-carpet/mip-fx-flying-carpet.js](https://c.mipcdn.com/static/v2/mip-fx-flying-carpet/mip-fx-flying-carpet.js)

## 说明

镂空滚动。

镂空滚动组件将其内容包括在一个高度固定的容器中，其表现为容器随着正文上下滚动，而在视觉上，其内容不会随着滚动，从而形成镂空滚动。

其内容可以为一张图片，也可以为广告组件。

> **注意：** 该组件只支持 `responsive` 和 `fixed-height` 两种布局方式，因此使用时必须写明高度

## 示例

### 基本使用

```html
<style>
  body {
    background: #ccc;
  }

  mip-fx-flying-carpet {
    width: 90%;
    margin: auto;
    background: #fff;
  }

  .example2 {
    width: 60%;
    height: 300px;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: #fff;
    margin-bottom: 10px;
  }
</style>
<div style="height: 500px;"></div>
<mip-fx-flying-carpet height="200">
  <mip-img src="https://www.mipengine.org/static/img/sample_01.jpg" height="275" width="414" layout="responsive" />
</mip-fx-flying-carpet>
<div style="height: 500px;"></div>
<mip-fx-flying-carpet height="200">
  <div class="example2">
    这是个广告 1
  </div>
  <div class="example2">
    这是个广告 2
  </div>
</mip-fx-flying-carpet>
<div style="height: 500px;"></div>
```
## 属性

无必须属性
