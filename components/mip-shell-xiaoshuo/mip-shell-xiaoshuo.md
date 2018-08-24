# `mip-shell-xiaoshuo`

## 说明
为极速小说阅读器定制的 mip-shell, 详细使用方法见[wiki](https://github.com/mipengine/mip2-extensions-platform/wiki/%E4%B8%87%E5%8D%B7%E8%AE%A1%E5%88%92-%E6%9E%81%E9%80%9F%E9%98%85%E8%AF%BB%E5%99%A8%E6%8E%A5%E5%85%A5%E6%96%87%E6%A1%A3)。

## 简单示例
为极速小说阅读器定制的 mip-shell-xiaoshuo 目录页传入格式
```
<mip-shell-xiaoshuo mip-shell="" id="xiaoshuo-shell">
  <script type="application/json">
    {
      "routes": [{
        "pattern": "mipx-xiaoshuo-(\\d)+-(\\d)+.html",
        "meta": {
          "header": {
            "show": true,
            "title": "神武天帝"
          },
          "footer": {
            "actionGroup": [
              {"name": "catalog", "text": "目录"},
              {"name": "darkmode", "text": "夜间模式", "text2": "白天模式"},
              {"name": "settings", "text": "更多设置"}
            ],
            "hrefButton": {
              "previous": "上一页",
              "next": "下一页"
            }
          },
          "book": {
            "title": "将夜",
            "chapterNumber": "共1347章",
            "chapterStatus": "已完结"
          },
          "catalog": [
            {
              "name": "第1章 灵魂重生",
              "link": "mipx-xiaoshuo-1-1.html",
              "pages": [
                "mipx-xiaoshuo-1-1.html",
                "mipx-xiaoshuo-1-2.html",
                "mipx-xiaoshuo-1-3.html"
              ]
            }
          ]
        }
      }]
    }
  </script>
</mip-shell-xiaoshuo>
```

### routes 
[参考mip-shell用法](https://github.com/mipengine/mip2/blob/master/docs/page/shell.md)