# mip-img-rang

'mip-img-rang' 根据用户的需求处理图片的大小，这是CSS固定图片大小满足不了需求的时候利用js 预处理达到预期效果。

标题|内容
----|----
类型|
支持布局|
所需脚本| https://c.mipcdn.com/static/v2/mip-img-rang/mip-img-rang.js

## 说明

组件功能说明
通过预加载来控制图片的宽度和高度，来达到用户视觉满意效果

## 示例

示例说明
将需要控制的图片置于mip-img-rang 标签类，call 是需要改变的图片的宽高定义，rang 改变的值

// 代码示例
 <mip-img-rang call="height" rang="160">
		<ul>
		
		<li><mip-img src="XXX" popup></mip-img></li>
		<li><mip-img src="XXX" popup></mip-img></li>
		<li><mip-img src="XXX" popup></mip-img></li>
		
		</ul>
	  </mip-img-rang>	

## 属性 mip-img-rang

### call | rang

说明：call 是需要改变的图片的宽高定义，rang 改变的值。此处只比较当宽度大于高度的时候触发的条件。

必选项：是

单位：无

默认值：无