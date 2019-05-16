# `mip-selector`

mip 的一个选择器控件类型组件

| 标题     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 类型     | 通用                                                    |
| 支持布局 | N/A                                                     |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-selector/mip-selector.js |

## 示例

支持单选模式，一次只能选择一个选项

```html
<mip-selector class="sample-selector" layout="container">
  <mip-img src="./imgs/img1.png" width="60" height="60" option="1"></mip-img>
  <mip-img src="./imgs/img2.png" width="60" height="60" option="2"></mip-img>
  <mip-img src="./imgs/img3.png" width="60" height="60" option="3"></mip-img>
  <mip-img src="./imgs/img4.png" width="60" height="60" option="4"></mip-img>
</mip-selector>
```

也支持多选模式，可以选择多个选项

```html
<mip-selector class="sample-selector" layout="container" multiple>
  <mip-img src="./imgs/img1.png" width="60" height="60" option="1"></mip-img>
  <mip-img src="./imgs/img2.png" width="60" height="60" option="2"></mip-img>
  <mip-img src="./imgs/img3.png" width="60" height="60" option="3"></mip-img>
  <mip-img src="./imgs/img4.png" width="60" height="60" option="4"></mip-img>
</mip-selector>
```

可以通过对 option 属性所在的标签添加 `disabled` 属性指定一些选项不可选。

```html
<mip-selector class="sample-selector" layout="container">
  <mip-img src="./imgs/img1.png" width="60" height="60" option="1"></mip-img>
  <mip-img src="./imgs/img2.png" width="60" height="60" option="2"></mip-img>
  <mip-img src="./imgs/img3.png" width="60" height="60" option="3" disabled></mip-img>
  <mip-img src="./imgs/img4.png" width="60" height="60" option="4"></mip-img>
</mip-selector>
```

可以通过直接在 `<mip-selector>` 标签上添加 `disabled` 属性指定所有选项不可选。

```html
<mip-selector class="sample-selector" layout="container" disabled>
  <mip-img src="./imgs/img1.png" width="60" height="60" option="1"></mip-img>
  <mip-img src="./imgs/img2.png" width="60" height="60" option="2"></mip-img>
  <mip-img src="./imgs/img3.png" width="60" height="60" option="3"></mip-img>
  <mip-img src="./imgs/img4.png" width="60" height="60" option="4"></mip-img>
</mip-selector>
```

除了默认的样式，可以通过 `radioStyle` 指定 radio 类型的样式

```html
<mip-selector multiple layout="container" radioStyle>
  <div option="a" selected>Option A</div>
  <div option="b">Option B</div>
  <div option="c">Option C</div>
  <div option="d">Option D</div>
</mip-selector>
```

`<mip-selector>` 提供了一系列的 action:

- clear: 清除所有的已选项
- selectUp({step: 1}): 选择前面 1 个选项， step 的值表示步长，默认为 1
- selectDown({step: 1})：选择后面的 1 个选项，step 的值表示步长，默认为 1
- toggle({index: 1, status: true})：指定某个选项进行反向操作，index 表示选项的下标，默认为 0， status 表示一直设置的状态 `true/false`，默认是当前状态的取反。

```html
<mip-selector class="sample-selector" layout="container" id="actionsSample">
  <mip-img src="./imgs/img1.png" width="60" height="60" option="1"></mip-img>
  <mip-img src="./imgs/img2.png" width="60" height="60" option="2"></mip-img>
  <mip-img src="./imgs/img3.png" width="60" height="60" option="3"></mip-img>
  <mip-img src="./imgs/img4.png" width="60" height="60" option="4"></mip-img>
  <mip-img src="./imgs/img1.png" width="60" height="60" option="5"></mip-img>
  <mip-img src="./imgs/img2.png" width="60" height="60" option="6"></mip-img>
</mip-selector>

<button on="tap:actionsSample.clear">清空选项 clear()</button>
<button on="tap:actionsSample.selectUp">选择前 1 个 selectUp()</button>
<button on="tap:actionsSample.selectUp({step: 2})">选择前 2 个 selectUp({step:2})</button>
<button on="tap:actionsSample.selectDown">选择后 1 个 selectDown()</button>
<button on="tap:actionsSample.selectDown({step: 2})">选择后 2 个 selectDown({step:2})</button>
<button on="tap:actionsSample.toggle({index:1})">反向选择第一个 toggle({index:1})</button>
<button on="tap:actionsSample.toggle({index: 2, status: true})">反向选择第一个 toggle({index:2, status: true})</button>
```

响应的 `<mip-selector>` 暴露的事件

- select：选中后的事件回调，event 中包含数据当前的数据，如：`{targetOption: 'aa', selectedOptions: ['aa', 'bb']}`

```html
<mip-selector multiple layout="container" radioStyle
  on="select: MIP.setData({
    selectedOption: event.targetOption,
    allSelectedOptions: event.selectedOptions
  })"
>
  <div option="a" selected>Option A</div>
  <div option="b">Option B</div>
  <div option="c">Option C</div>
  <div option="d">Option D</div>
</mip-selector>
<!-- 预先定义一下需要接受的参数 -->
<mip-data>
  <script type="application/json">
    {
      "selectedOption": "a",
      "allSelectedOptions": ["a"]
    }
  </script>
</mip-data>
<p>最后的选项: <code m-text="selectedOption">a</code></p>
<p>所有的选项: <code m-text="allSelectedOptions.join(', ')">a</code></p>
```

`<mip-selector>` 还可以和 `<mip-form>` 表单进行结合

```html
<mip-form action="#" method="get" target="_top">
  <mip-selector radioStyle layout="container" name="my-selector">
    <div option="a">Option A</div>
    <div option="b">Option B</div>
    <div option="c">Option C</div>
  </mip-selector>
  <button>提交</button>
</mip-form>
```

示例说明

## 属性

### multiple

说明：是否多选

必选项：否

类型：`boolean`

默认值：`false`

### disabled

说明：是否不可选择

必选项：否

类型：`boolean`

默认值：`false`

### radioStyle

说明：指定 mip-selector 为 radio 样式

必选项：否

类型：`boolean`

默认值：`false`
