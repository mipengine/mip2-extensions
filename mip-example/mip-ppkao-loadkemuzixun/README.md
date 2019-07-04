# mip-ppkao-loadkemuzixun

mip-ppkao-loadkemuzixun ppkao加载科目资讯

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://mipcache.bdstatic.com/static/v1/mip-ppkao-loadkemuzixun/mip-ppkao-loadkemuzixun.js

## 示例

### 基本用法
```html
<mip-ppkao-loadkemuzixun id="loadkemuzixun">
    自定义内容，可以嵌套其他组件
</mip-ppkao-loadkemuzixun>
```

## 注意事项
在按钮中增加on属性，注意on属性中需要填写对应 mip-ppkao-loadkemuzixun 的id。
比如本例中，mip-ppkao-loadkemuzixun id="loadkemuzixun"，on属性需要写成 on="tap:loadkemuzixun.loadkemuevent(str)" 

