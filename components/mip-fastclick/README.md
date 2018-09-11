# mip-fastclick 组件

fastclick 组件

**注意** 点击延迟问题应该由页面引入 mip-fastclick 组件解决，**禁止** 组件内部单独引入 fastclick

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本| https://c.mipcdn.com/static/v2/mip-fastclick/mip-fastclick.js

## 示例

```html
<mip-fastclick>
  <mip-example></mip-example>
</mip-fastclick>

<mip-fastclick target="example"></mip-fastclick>
<mip-example id="example"></mip-example>

<!-- 无 fastclick 效果 -->
<mip-example></mip-example>
```

## 属性

### target

说明：需要绑定 fastclick 的元素id, 默认对当前 `mip-fastclick` 标签绑定 fastclick \
必选项：否 \
类型：字符串 \
取值范围：html ID

## fastclick 使用参考

[ftlabs/fastclick](https://github.com/ftlabs/fastclick)
