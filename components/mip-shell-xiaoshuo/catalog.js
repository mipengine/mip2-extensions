/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */
class Catalog {
  constructor (config) {
    // 渲染侧边栏目录元素
    this.$catalogSidebar = this._renderCatalog(config)
    // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
    this.propagationStopped = this._stopPropagation()
  }

  // 根据配置渲染目录侧边栏到 mip-sidebar组件中
  // 支持从页面直接获取目录，异步获取目录
  _renderCatalog (catalogs) {
    let renderCatalog
    if (!catalogs) {
      // 目录配置为空
    } else if (typeof catalogs === 'string') {
      // 目录配置的是字符串，远程地址。需要异步获取

    } else {
      // 目录为数组，本地目录。直接读取渲染
      renderCatalog = catalogs => catalogs.map(catalog => `
        <a class="mip-catalog-btn" mip-catalog-btn mip-link data-button-name="${catalog.name}" href="${catalog.link}">${catalog.name}</a>`)
        .join('\n')
    }
    // 将底部 bar 插入到页面中
    let $catalogSidebar = document.querySelector('.mip-shell-catalog-wrapper')
    let hadCatalog = !!$catalogSidebar
    if (!hadCatalog) {
      // 初次见面新建一个wrapper, 二次更新时直接复用
      $catalogSidebar = document.createElement('mip-fixed')
      $catalogSidebar.setAttribute('type', 'left')
      $catalogSidebar.setAttribute('top', '0')
      $catalogSidebar.setAttribute('mip-shell', '')
      $catalogSidebar.classList.add('mip-shell-catalog-wrapper')
    }

    let $catalog
    $catalog = document.createElement('div')
    $catalog.classList.add('mip-shell-catalog', 'mip-border', 'mip-border-right')
    $catalog.innerHTML = renderCatalog(catalogs)

    if (!hadCatalog) {
      $catalogSidebar.appendChild($catalog)
      document.body.appendChild($catalogSidebar)
    } else {
      // 将 catalog 内容替换为新内容
      $catalogSidebar.removeChild($catalogSidebar.querySelector('.mip-shell-catalog'))
      $catalogSidebar.appendChild($catalog)
    }
    return $catalogSidebar
  }

  // 显示侧边目录
  show (shellElement) {
    let me = this
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    // window.setTimeout(function () {
    me.$catalogSidebar.classList.add('show')
    shellElement.toggleDOM(shellElement.$buttonMask, true)
    // }, 400)
  }
  // 隐藏侧边目录
  hide () {
    this.$catalogSidebar.classList.remove('show')
  }
  // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
  _stopPropagation () {
    if (this.propagationStopped) {
      // 由于目录页只有一个，刷新页面时只绑定一次
      return
    }
    // sidebar 绑定一次停止冒泡事件, 防止滚到底部后外层小说内容继续滚动
    this.$catalogSidebar.addEventListener('scroll', (e) => {
      e && e.stopPropagation()
      e && e.preventDefault()
      return false
    })
    return true
  }
}

export default Catalog
