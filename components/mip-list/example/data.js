/* eslint-disable */
// 这段逻辑仅供 MIP 官方组件测试使用，站长开发时禁止使用
(function () {
  let fn = ''
  let keys = Object.keys(window)
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].indexOf('jsonp_') === 0) {
      fn = keys[i]
      break
    }
  }
  window[fn]({
    status: 0,
    data: {
      items: [
        {
          name: 'mipengine',
          alias: 'mip'
        }
      ],
      isEnd: 1
    }
  })
})()