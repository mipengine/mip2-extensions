# mip-video-demo MIP 视频扩展组件

目前项目存在如下需求： 视频播放前不展示视频控制控件，需要点击播放按钮播放视频，再展示视频播放控件，并且视频播放结束后，视频需要返回到播放前的位置。这个功能无法通过 mip-video 的现有机制实现，因此需要开发 mip-video-demo 来实现相关功能。

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本| [https://c.mipcdn.com/static/v2/mip-video-demo/mip-video-demo.js](https://c.mipcdn.com/static/v2/mip-video-demo/mip-video-demo.js)

## 示例


### 基本使用

它的基本使用方法如下所示：

```html
<style mip-custom> 
.open{width: 80px;height:30px; line-height:30px; border: 1px #000000 solid; text-align:center;}
</style>
<mip-video-demo id="video" back layout="responsive" width="640" height="360" src="https://gss0.bdstatic.com/-b1Caiqa0d9Bmcmop9aC2jh9h2w8e4_h7sED0YQ_t9iCPK/mda-gjkt21pkrsd8ae5y/mda-gjkt21pkrsd8ae5y.mp4" >
</mip-video-demo>
<div class="open">点击播放</div>
```

## 属性

### src

说明：视频地址
必选项：是
类型：字符串
取值范围：URL
默认值：无


### poster

说明：封面图地址，为了保证视频载入过程中仍然有很好的呈现效果，请设置该字段
必选项：否
类型：字符串
取值范围：URL
默认值：无


### controls

说明：是否显示视频控制控件，包括开始/暂停按钮、全屏按钮、音量按钮等
必选项：否
类型：字符串
取值范围：任何
默认值：无


### back

说明：视频播放结束后是否返回第一帧
必选项：否


