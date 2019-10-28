# `mip-toast`

弹出框（只有文字 文字和图标 位置上 中 下）

| 标题     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 类型     |
| 支持布局 | responsive, fixed-height, fixed, container            |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-toast/mip-toast.js |

## 说明

提示框组件 自定义内容

## 示例

1、弹出框 只弹出文字（不传 info-icon-src）

```html
<button on="tap:demo.showToast">打开 toast</button>
<mip-toast
  id= "demo"
  info-text="默认提示框"
  station = "top"
>
</mip-toast>
```

2、弹出框 弹出带图和文字

```html
<button on="tap:demo.showToast">打开 toast</button>
<mip-toast
  id= "demo"
  info-icon-src="https://www.mipengine.org/static/img/sample_mip_logo.png"
  info-text="最多七个中文字"
  station = "top"
>
</mip-toast>
```

## 属性

属性说明

### id

说明：组件间通信用到

必选项：否

类型 ：`String`

默认值：""

### info-icon-src

说明：配置图片或gif的src，没有传或不写这个属性只显示文字

必选项：否

类型 ：`String`

默认值：""

### info-text

说明：提示框内容

必选项：是

类型 ：`String`

默认值：""

### station

说明：提示框所在位置，可选 top center bottom

必选项：否

类型 ：`String`

默认值："center"

### close-time

说明：关闭事件

必选项：否

类型 ：`Number`

默认值：3

## 暴露方法

### showToast/hidden

可以通过 showToast/hidden 方法来显示/隐藏 mip-toast，其中 showToast 的参数接受字段 `infoText`、`infoIconSrc`、`station`、`closeTime`，用来覆盖实际显示的 toast 属性，如果某字段缺失，则使用 mip-toast 的属性。使用示例如下：

```html
<button on="tap:demo.showToast({
    station: 'bottom',
    infoText: 'new info text',
    closeTime: 3,
    infoIconSrc: 'https://mip-doc.cdn.bcebos.com/mipengine-org/assets/mipengine/logo.jpeg'
})">打开 toast</button>
<mip-toast
    id="demo"
    info-icon-src="https://www.mipengine.org/static/img/sample_mip_logo.png"
    info-text="默认提示框文字Top+图片"
    station="top"
    close-time="1"
>
</mip-toast>
```

组件间通信请看文档 https://www.mipengine.org/v2/docs/interactive-mip/introduction.html
