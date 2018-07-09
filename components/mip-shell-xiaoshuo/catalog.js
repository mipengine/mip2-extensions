class catalog {
  constructor (config) {
    this.$catalogSidebar = this._renderCatalog(config)
  }

  // 根据配置渲染目录侧边栏到 mip-sidebar组件中
  // 支持从页面直接获取目录，异步获取目录
  _renderCatalog (catalogs) {
    let $catalogSidebar // 保存目录DOM
    if (!catalogs) {
      // 目录配置为空
    } else if (typeof catalogs === 'string') {
      // 目录配置的是字符串，远程地址。需要异步获取

    } else {
      // 目录为数组，本地目录。直接读取渲染
      let renderCatalog = catalogs => catalogs.map(catalog => `
        <a class="mip-catalog-btn" mip-catalog-btn mip-link data-button-name="${catalog.name}" href="./${catalog.link}">${catalog.name}</a>`)
        .join('\n')

      // 将底部 bar 插入到页面中
      $catalogSidebar = document.createElement('mip-fixed')
      $catalogSidebar.setAttribute('type', 'left')
      $catalogSidebar.setAttribute('top', '0')
      $catalogSidebar.setAttribute('mip-shell', '')
      $catalogSidebar.classList.add('mip-shell-catalog-wrapper')

      let $catalog
      $catalog = document.createElement('div')
      $catalog.classList.add('mip-shell-catalog', 'mip-border', 'mip-border-right')
      $catalog.innerHTML = renderCatalog(catalogs)
      $catalogSidebar.appendChild($catalog)

      document.body.appendChild($catalogSidebar)
    }
    return $catalogSidebar
  }

  // 显示侧边目录
  show (shellElement) {
    let catalog = this
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    window.setTimeout(function () {
      catalog.$catalogSidebar.classList.add('show')
      shellElement.toggleDOM(shellElement.$buttonMask, true)
    }, 100)
  }
  // 隐藏侧边目录
  hide () {
    this.$catalogSidebar.classList.remove('show')
  }
}

export default catalog
