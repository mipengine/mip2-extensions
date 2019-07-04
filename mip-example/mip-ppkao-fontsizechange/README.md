# mip-ppkao-fontsizechange

mip-ppkao-fontsizechange 改变字体大小

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://mipcache.bdstatic.com/static/v1/mip-ppkao-fontsizechange/mip-ppkao-fontsizechange.js

## 示例

### 基本用法
```html
<mip-ppkao-fontsizechange id="fontsizechange">
    自定义内容，可以嵌套其他组件
</mip-ppkao-fontsizechange>
```

## 属性

### 无

## 注意事项
在按钮中增加on属性，注意on属性中需要填写对应 mip-ppkao-fontsizechange 的id。
比如本例中，mip-ppkao-bottomnav id="bottomnav"，on属性需要写成 on="tap:fontsizechange.bigfont" 或 on="tap:fontsizechange.smallfont"

