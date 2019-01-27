# mip-font 组件

mip-font: 管理自定义字体的加载，通过字体的加载状况为`documentElement`根节点增加不同的类名，可以通过以下四个属性来设置类名 `on-error-remove-class`/`on-error-add-class`/`on-load-remove-class`/`on-load-add-class` 

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本| https://c.mipcdn.com/static/v2/mip-font/mip-font.js

## 示例

```html
<mip-font
	layout="nodisplay"
	font-family="fonta"
	timeout="2000"
	on-error-remove-class="fonta-loading"
	on-error-add-class="fonta-missing"
	on-load-remove-class="fonta-loading"
	on-load-add-class="fonta-loaded">
</mip-font>

```


## 属性

### font-family

说明：自定义字体名称  
必选项：是  
类型：字符串  
取值范围：'XXX' , 自定义字体  

### timeout

说明：单位`ms`, 字体请求超时时间，0 时取用已缓存的字体，就是不请求  
必选项：否  
类型：字符串  
取值范围：默认 `3000`ms  

### on-error-remove-class

说明：字体加载报错时，根节点要移除的类名  
必选项：否  
类型：字符串  
取值范围：无  

### on-error-add-class

说明：字体加载报错时，根节点要增加的类名  
必选项：否  
类型：字符串   
取值范围：无  

### on-load-remove-class

说明：字体加载完时，根节点要移除的类名  
必选项：否  
类型：字符串  
取值范围：无  

### on-load-add-class

说明：字体加载完时，根节点要增加的类名  
必选项：否  
类型：字符串  
取值范围：无  

### font-weight, font-style, font-variant

说明：标准属性值  
必选项：否  

### layout

必须为 `nodisplay`  


