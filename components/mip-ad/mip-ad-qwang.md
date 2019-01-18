# mip-ad:ad-qwang 百度搜索推广合作

mip 广告组件`<mip-ad>` 的一种类型：百度搜索推广合作。产品介绍见[具体文档](http://union.baidu.com/product/prod-search.html)。

标题|内容
----|----
类型|通用
支持布局|fixed-height, fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-ad/mip-ad.js

## 示例

### 基本使用

```html
<mip-ad
  type="ad-qwang"
  cpro-psid="u2619809"
  cpro-pswidth="auto"
  cpro-psheight="230">
</mip-ad>
```

### 组件 layout="fixed" 布局

[组件布局文档](https://www.mipengine.org/v2/docs/style-and-layout/layout.html)。`width` 和 `height` 请根据广告实际宽高填写。

```html
<mip-ad
  layout="fixed"
  width="414"
  height="80"
  type="ad-qwang"
  cpro-psid="u2619809"
  cpro-pswidth="auto"
  cpro-psheight="230">
</mip-ad>
```

## 属性

### type

说明：广告类型

必选项：是

类型：字符串

取值：`ad-qwang`

默认值：无

### cpro-psid

说明：广告投放 `id`

必选项：是

类型：字符串

默认值：无

### cpro-pswidth

说明：宽度

必选项：否

类型：数字

默认值：`auto`

### cpro-psheight

说明：宽度

必选项：否

类型：数字

默认值：230
