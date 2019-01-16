import './mip-group-selection.less'

let {
  util,
  viewer,
  viewport,
  templates,
  CustomElement
} = MIP

const log = util.log('mip-group-selection')

export default class MIPGroupSelection extends CustomElement {
  /**
   * 获取数据
   *
   * @returns {Object} Promise
   */
  getData () {
    let groupData
    return new Promise((resolve, reject) => {
      if (this.dataUrl) {
        fetch(this.dataUrl, {
          credentials: 'include'
        }).then(res => {
          if (res.ok) {
            res.json().then(data => {
              resolve(data)
            })
          }
          reject(new Error('mip-city-selection 组件 Fetch 请求失败!'))
        }).catch(() => {
          reject(new Error('mip-city-selection 组件 Fetch 请求失败!'))
        })
      } else {
        groupData = this.element.querySelector('script[type="application/json"]')
        if (groupData) {
          try {
            groupData = JSON.parse(groupData.textContent)
          } catch (e) {
            reject(new Error('mip-city-selection 组件 json 配置错误, 请检查 json 格式。'))
          }
          resolve(groupData)
        }
      }
    })
  }

  /**
   * 获取分组配置信息，渲染备选项和右侧快速选择列表
   *
   * @param {Object} html 要被渲染的数据
   */
  renderHtml (html) {
    let wrapper = document.createElement('div')
    wrapper.classList.add('mip-city-selection-wrapper')
    wrapper.innerHTML = html
    this.element.appendChild(wrapper)
  }

  /**
   * 修改最下方分组的样式，增加marginBottom, 保证滚动后分组标题可以在页面最上方
   */
  modifyMarginBottom () {
    let lastGroup = this.element.querySelector('.mip-city-selection-wrapper .mip-group-selection-content').lastElementChild
    lastGroup.style.marginBottom = viewport.getHeight() - lastGroup.getBoundingClientRect().height - 10 + 'px'
  }

  /**
   * 绑定侧边栏快捷选择事件
   */
  bindSidebarClickEvent () {
    util.event.delegate(this.element, '.mip-group-selection-link', 'click', e => {
      let button = e.target
      let targetAnchor = button.dataset.targetAnchor
      // 滚动待选列表到指定分组
      this.scrollToAnchor(targetAnchor)
      // 显示提示词
      this.showAnchorTip(targetAnchor)
    })
  }

  /**
   * 滚动待选列表到指定分组
   *
   * @param {string} anchor 跳转目标
   */
  scrollToAnchor (anchor) {
    let anchorElement = this.element.querySelector('[data-anchor=' + anchor + ']')
    try {
      window.scrollBy({
        behavior: 'smooth',
        top: anchorElement.getBoundingClientRect().top - 10
      })
    } catch (e) {}
    // 兜底效果，再scroll一次
    window.scrollBy(0, anchorElement.getBoundingClientRect().top - 10)
  }

  showAnchorTip () {

  }

  /**
   * 选项绑定点击事件，点击修改 MIP data 并触发 selected 事件
   *
   */
  bindItemClickEvent () {
    util.event.delegate(this.element, '.mip-group-selection-item', 'click', e => {
      let itemData = e.target && e.target.dataset
      e.data = itemData
      /* globals MIP */
      MIP.setData(e.data)
      viewer.eventAction.execute('selected', this.element, e)
    })
  }

  firstInviewCallback () {
    let el = this.element
    this.dataUrl = el.dataset.src
    // 从本地和远程获取数据
    this.getData().then(data => {
      if (!data) {
        log.warn('需要配置分组选项。可以配置到组件中，也可以配置远程数据.')
      }
      return templates.render(el, data)
    }).then(html => {
      this.renderHtml(html)
      // 修改最下方分组的样式，增加marginBottom, 保证滚动后分组标题可以在页面最上方
      this.modifyMarginBottom()
      // 绑定侧边栏快捷选择事件
      this.bindSidebarClickEvent()
      // 绑定列表元素选择事件
      this.bindItemClickEvent()
    }, dat => {
      log.warn(dat)
    })
  }
}
