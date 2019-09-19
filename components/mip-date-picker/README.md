# mip-date-picker 日期选择组件

日期选择组件，提供简单日期选择和日期范围选择两种模式，需要结合 mip-form 使用。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本| https://c.mipcdn.com/static/v2/mip-date-picker/mip-date-picker.js<br>https://c.mipcdn.com/static/v2/mip-form/mip-form.js

## 示例

date-picker: 仅选择日期模式

```html
<p>date-pick: 下拉模式</p>
<mip-form>
  <mip-date-picker mode="date-picker"
    id="date-picker"
    input-selector="[name=date-picker-overlay]"
    on="activate:MIP.setData({activate: '触发 activate 事件'}) deactivate:MIP.setData({deactivate: '触发 deactivate 事件'}) select:MIP.setData({selectedDate: event.date})">
    <input type="text" name="date-picker-overlay">
  </mip-date-picker>
</mip-form>
<p>activate 事件:<span m-text="activate"></span></p>
<p>deactivate 事件:<span m-text="deactivate"></span></p>
<p>select 事件:<span m-text="selectedDate"></span></p>
<button on="tap:date-picker.clear">清空日期</button>
<button on="tap:date-picker.setDate({date: '2019-10-15'})">设置日期</button>
<button on="tap:date-picker.today">选择今天</button>
```

range-picker: 选择日期范围模式

```html
<p>range-pick: 下拉模式</p>
<mip-form>
  <mip-date-picker mode="range-picker"
    id="range-picker"
    start-input-selector="[name=range-picker-overlay-start]"
    end-input-selector="[name=range-picker-overlay-end]"
    on="activate:MIP.setData({activate: '触发 range-picker activate 事件'}) deactivate:MIP.setData({deactivate: '触发 range-picker deactivate 事件'}) select:MIP.setData({start: event.start, end: event.end})">
    <input type="text" name="range-picker-overlay-start">
    <input type="text" name="range-picker-overlay-end">
  </mip-date-picker>
</mip-form>
<p>activate 事件:<span m-text="activate"></span></p>
<p>deactivate 事件:<span m-text="deactivate"></span></p>
<p>select 事件:
  <p>起始日期：<span m-text="start"></span></p>
  <p>起始日期：<span m-text="end"></span></p>
</p>
<button on="tap:range-picker.clear">清空日期</button>
<p>设置日期: {start: '2019-10-15', end: '2019-10-23'}</p>
<button on="tap:range-picker.setDates({start: '2019-10-15', end: '2019-10-23'})">设置日期</button>
```

## 属性

### mode

说明：选择器模式。date-picker | range-picker: 日期选择或范围选择

必选项：是

类型 ：字符串

默认值：无

### display

说明：显示样式，overlay | static。 overlay：点击 input 之后显示，input 失焦后收起。static：始终显示

必选项：否

类型 ：字符串

默认值：overlay

## format

说明：指定日期格式化模式，用于 input 框中日期的格式化显示，以及用户在 input 框中输入日期时的校验，校验时只有符合 `format` 格式的才会在日历中自动高亮用户输入的日期。如：`yyyy-MM-dd` 或 `MM-dd-yyyy` 或 `dd-MM-yyyy`，其中分隔符可以选择 `-` 或 `/`。注意：`format` 只包含 `年月日`，不包含 `时分秒`，即 format 只能为 `yyyy-MM-dd` 、`MM-dd-yyyy`、 `dd-MM-yyyy`、`yyyy/MM/dd`、 `MM/dd/yyyy` 或 `dd/MM/yyyy` 6 种格式之一，其他格式不允许。

必选项：否

类型 ：字符串

默认值：`yyyy-MM-dd`

### minDate

说明：选择器提供日期可选范围设置，minDate 是日期可选范围的最小值，可以只提供最小值，此时最大值为当前年份减 100 年

必选项：否

类型 ：字符串，可以转化为 Date 对象的合法格式，比如：2019-08-30 或者 2019/08/30 等

默认值：无，即所有日期都可选

### maxDate

说明：选择器提供日期可选范围设置，maxDate 是日期可选范围的最大值，可以只提供最大值，此时最大值为当前年份加 100 年

必选项：否

类型 ：字符串，可以转化为 Date 对象的合法格式，比如：2019-08-30 或者 2019/08/30 等

默认值：无，即所有日期都可选

### selectedDate

说明：默认选中的日期

必选项：否

类型 ：字符串，可以转化为 Date 对象的合法格式，比如：2019-08-30 或者 2019/08/30 等

默认值：无

### dayOffset

说明：日历默认最左侧为周日，即 `日 一 二 三 四 五 六`，可以通过 `dayOffset` 调整是从周几开始，0 为周日，1 为周一，以此类推

必选项：否

类型：数字

默认值：0

### openAfterSelect

说明：默认选择日期后关闭选择器，通过指定 open-after-select 可以实现选择日期后不关闭，该属性只要存在即有效，不需要指定值

必选项：否

类型：HTML 属性

默认值：无

### openAfterclear

说明：默认清空日期后关闭选择器，通过指定 open-after-clear 可以实现清空日期后不关闭，该属性只要存在即有效，不需要指定值。但是需要指定 open-after-select，否则选择日期后就会关闭，达不到想要的效果

必选项：否

类型：HTML 属性

默认值：无

## 事件

`mip-date-picker` 支持以下 event，通过 MIP 的 on 语法进行调用，MIP事件机制可参考[文档](https://www.mipengine.org/v2/docs/interactive-mip/event-and-action.html)

事件| 描述| 数据
----|:---|----
`activate`| 日期选择器被打开时触发||              
`deactivate`| 日期选择器关闭时触发||
`select`| 用户选择日期后触发，range 模式下会在开始日期和结束日期都选择完成后触发| 数据见下方描述

### mode = date-picker 模式下

```json
{
  "date": "selectedDate" // 类型为 Date 对象
}
```

可以结合 MIP 数据绑定机制进行数据的绑定和使用：

```html
<mip-data>
  <script type="application/json">
    {
      "selectedDate": null
    }
  </script>
</mip-data>

<mip-form>
  <mip-date-picker mode="date-picker"
    on="select:MIP.setData({selectedDate: event.date)"
    input-selector="[name=date-picker-overlay]">
    <input type="text" name="date-picker-overlay">
  </mip-date-picker>
</mip-form>

```
### mode = range-picker 模式下

>注意：日期范围选择器允许用户选择起始日期和结束日期为同一天

```json
{
  "selectedDate": "selectedDate", // 类型为 Date 对象
  "start": "startDate", // 类型为 Date 对象
  "end": "endDate" // 类型为 Date 对象
}
```

可以结合 MIP 数据绑定机制进行数据的绑定和使用：

```html
<mip-data>
  <script type="application/json">
    {
      "start": null,
      "end": null
    }
  </script>
</mip-data>

<mip-form>
  <mip-date-picker mode="date-picker"
    on="select:MIP.setData({start: event.start, end: event.end)"
    input-selector="[name=date-picker-overlay]">
    <input type="text" name="date-picker-overlay">
  </mip-date-picker>
</mip-form>
```

## 行为

### clear

清空 date-picker 或者 range-picker 中的数据，清空的 input 框以 id 标识，[参考文档](https://www.mipengine.org/v2/docs/interactive-mip/event-and-action.html)，使用如下：

```html
<button on="tap:date-picker.clear">清空日期</button>
```

### setDate

设置 date-picker 中的数据，数据格式为可以转化成 Date 对象的合法格式即可，input 框以 id 标识，使用如下：

```html
<button on="tap:date-picker.setDate({date: '2019-10-15'})">设置日期</button>
```

### setDates

设置 range-picker 中的数据，数据格式为可以转化成 Date 对象的合法格式即可，input 框以 id 标识，使用如下：

```html
<button on="tap:range-picker.setDates({start: '2019-10-15', end: '2019-10-23'})">设置日期</button>
```

### today

在 date-picker 中，选中今天，在 range-picker 中不可用。input 框以 id 标识，使用如下：

```html
<button on="tap:date-picker.today">选择今天</button>
``` 
