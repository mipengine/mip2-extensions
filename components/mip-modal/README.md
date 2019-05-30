# mip-modal 模态框

模态框可以在页面中央打开一个浮层，与用户进行交互。

标题|内容
----|----
类型|通用
支持布局|-
所需脚本|<https://c.mipcdn.com/static/v2/mip-fastclick/mip-fastclick.js></br><https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js></br><https://c.mipcdn.com/static/v2/mip-dialog/mip-dialog.js></br>
<https://c.mipcdn.com/static/v2/mip-modal/mip-modal.js>

## 示例

### 基本用法

```html
<mip-data>
  <script type="application/json">
    {"visible": false}
  </script>
</mip-data>
<mip-modal
  title="基本模态框"
  content="一些基本内容……"
  m-bind:visible="visible"
  on="ok:MIP.setData({visible: false}) cancel:MIP.setData({visible: false})"
>
</mip-modal>
<mip-fastclick>
  <button
    class="mip-button mip-button-primary"
    on="tap:MIP.setData({visible: true})"
  >
    打开基本模态框
  </button>
</mip-fastclick>
```

## 属性

### title

说明：模态框标题。

类型：`string`

### content

说明：模态框内容。

类型：`string`

### visible

说明：模态框是否可见。

类型：`boolean`

### mask

说明：模态框打开时，遮罩层是否可见。

类型：`boolean`

默认值：`true`

### maskClosable

说明：点击遮罩层后，是否触发 cancel 事件。

类型：`boolean`

默认值：`true`

### okText

说明：确认按钮文字。

类型：`string`

默认值：`确认`

### cancelText

说明：取消按钮文字。

类型：`string`

默认值：`取消`

### keyboard

说明：是否支持通过键盘 Esc 键触发 cancel 事件。

类型：`boolean`

默认值：`true`

## 插槽

### header

说明：模态框顶部。

### body

说明：模态框主体。

### footer

说明：模态框底部。

## 事件

### ok

说明：点击了确认按钮。

### cancel

说明：点击了取消按钮。如可能，点击遮罩层或按下了 Esc 键也会触发 `cancel` 事件。
