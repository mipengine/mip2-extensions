# mip-modal 模态框

模态框可以在页面中央打开一个浮层，与用户进行交互。

标题|内容
----|----
类型|通用
支持布局|-
所需脚本|<https://c.mipcdn.com/static/v2/mip-fastclick/mip-fastclick.js></br><https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js></br><https://c.mipcdn.com/static/v2/mip-dialog/mip-dialog.js></br>
<https://c.mipcdn.com/static/v2/mip-modal/mip-modal.js>

## 示例

### 基本模态框

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
    基本模态框
  </button>
</mip-fastclick>
```

### 必选模态框

```html
<mip-data>
  <script type="application/json">
    {"visible": false}
  </script>
</mip-data>
<mip-modal
  title='"MIP" 想给您发送推送通知'
  m-bind:visible="visible"
  mask-closable="false"
  ok-text="好"
  cancel-text="不允许"
  on="ok:MIP.setData({visible: false}) cancel:MIP.setData({visible: false})"
>
  <template slot="body">
    <p>“通知”可能包括提醒、声音和图标。</p>
    <p>这些可在“设置”中配置。</p>
  </template>
</mip-modal>
<mip-fastclick>
  <button
    class="mip-button mip-button-primary"
    on="tap:MIP.setData({visible: true})"
  >
    必选模态框
  </button>
</mip-fastclick>
```

### 确认模态框

```html
<mip-data>
  <script type="application/json">
    {"visible": false}
  </script>
</mip-data>
<mip-modal
  title="打开推送通知"
  m-bind:visible="visible"
  ok-text="去开启"
  on="ok:MIP.setData({visible: false}) cancel:MIP.setData({visible: false})"
>
  <template slot="body">
    <p>有人回复你</p>
    <p>第一时间知晓</p>
  </template>
  <template type="mip-mustache" slot="footer">
    <div class="mip-modal-dialog-buttons">
      <button ref="okButton" type="button" class="mip-modal-dialog-button mip-modal-dialog-button-primary mip-modal-dialog-ok-button">
        <span class="mip-modal-dialog-ok-text">{{okText}}</span>
      </button>
    </div>
  </template>
</mip-modal>
<mip-fastclick>
  <button
    class="mip-button mip-button-primary"
    on="tap:MIP.setData({visible: true})"
  >
    确认模态框
  </button>
</mip-fastclick>
```

### 垂直页脚模态框

```html
<mip-data>
  <script type="application/json">
    {"visible": false}
  </script>
</mip-data>
<mip-modal
  title='想给 "MIP" 一个好评么？'
  m-bind:visible="visible"
  ok-text="前往好评"
  cancel-text="残忍拒绝"
  on="ok:MIP.setData({visible: false}) cancel:MIP.setData({visible: false})"
>
  <template type="mip-mustache" slot="footer">
    <div class="mip-modal-dialog-buttons mip-modal-dialog-buttons-vertical">
      <button ref="cancelButton" type="button" class="mip-modal-dialog-button mip-modal-dialog-cancel-button">
        <span class="mip-modal-dialog-cancel-text">{{cancelText}}</span>
      </button>
      <button ref="okButton" type="button" class="mip-modal-dialog-button mip-modal-dialog-button-primary mip-modal-dialog-ok-button">
        <span class="mip-modal-dialog-ok-text">{{okText}}</span>
      </button>
    </div>
  </template>
</mip-modal>
<mip-fastclick>
  <button
    class="mip-button mip-button-primary"
    on="tap:MIP.setData({visible: true})"
  >
    垂直页脚模态框
  </button>
</mip-fastclick>
```

### 表单模态框

```html
<mip-data>
  <script type="application/json">
    {"visible": false}
  </script>
</mip-data>
<mip-modal
  title="登录"
  m-bind:visible="visible"
  on="ok:form.submit cancel:MIP.setData({visible: false})"
>
  <template slot="body">
    <p class="mip-modal-form-hint">请输入登录信息</p>
    <mip-form
      id="form"
      method="get"
      fetch-url="./form.json"
      on="submitSuccess:MIP.setData({visible: false})"
    >
      <input type="text" name="name" placeholder="姓名" class="mip-input">
      <input type="password" name="password" placeholder="密码" class="mip-input">
    </mip-form>
  </template>
</mip-modal>
<mip-fastclick>
  <button
    class="mip-button mip-button-primary"
    on="tap:MIP.setData({visible: true})"
  >
    表单模态框
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

### mask-closable

说明：点击遮罩层后，是否触发 cancel 事件。

类型：`boolean`

默认值：`true`

### ok-text

说明：确认按钮文字。

类型：`string`

默认值：`确认`

### cancel-text

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
