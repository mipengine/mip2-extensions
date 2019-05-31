import './mip-group-selection.less'

const {
  util,
  viewer,
  templates,
  CustomElement
} = MIP

const log = util.log('mip-group-selection')
const { fixedElement } = viewer
const { dom, css, event } = util

export default class MIPGroupSelection extends CustomElement {
  build () {
    const el = this.element
    this.name = el.getAttribute('name') || 'select'
    this.placeholder = el.getAttribute('placeholder') || ''
    this.id = el.dataset.id || ''
    this.closable = el.hasAttribute('closable')
    this.field = el.getAttribute('field') || ''
    this.multiple = el.hasAttribute('multiple')
    this.inForm = !!dom.closest(el, 'mip-form')
    this.firstShow = true

    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)

    this.dataUrl = el.dataset.src
    // 从本地和远程获取数据
    this.getData().then(data => {
      if (!data) {
        log.warn('需要配置分组选项。可以配置到组件中，也可以配置远程数据.')
      }
      return templates.render(el, data)
    }).then(html => {
      this.renderHtml(html)
      // 绑定侧边栏快捷选择事件
      this.bindSidebarClickEvent()
      // 绑定列表元素选择事件
      this.bindItemClickEvent()
      // build 完成
      viewer.eventAction.execute('ready', el, false)
      // 对外暴露 show、hide 方法
      this.addEventAction('show', this.show)
      this.addEventAction('hide', this.hide)
    }).catch(log.warn)
  }

  /**
   * 获取数据
   *
   * @returns {Object} Promise
   */
  async getData () {
    if (this.dataUrl) {
      try {
        let res = await fetch(this.dataUrl, { credentials: 'include' })
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(new Error('mip-group-selection 组件 Fetch 请求失败!'))
      } catch (e) {
        return Promise.reject(new Error('mip-group-selection 组件 Fetch 请求失败!'))
      }
    }
    let groupData = this.element.querySelector('script[type="application/json"]')
    if (groupData) {
      try {
        groupData = util.jsonParse(groupData.textContent)
      } catch (e) {
        return Promise.reject(new Error('mip-group-selection 组件 json 配置错误, 请检查 json 格式。'))
      }
      return groupData
    }
    return null
  }

  /**
   * 生成 dom，构造 mask、输入框、关闭按钮等
   *
   * @param {string} html templates 解析出来的字符串
   */
  renderHtml (html) {
    const el = this.element

    // 内容移到 mip-fixed 中
    const fixed = dom.create(`<mip-fixed class="mip-group-selection-wrapper" type="top"></mip-fixed>`)
    css(fixed, 'display', 'none')
    fixed.innerHTML = html
    this.fixedWrapper = fixed

    // 构造 mask
    const mask = dom.create(`<mip-fixed still class="mip-group-selection-mask" type="top"></mip-fixed>`)
    css(mask, 'display', 'none')
    mask.onclick = this.hide
    this.mask = mask
    el.appendChild(mask)

    // 在 mip-form 中
    if (this.inForm) {
      // 构造输入框
      const input = dom.create(`<input type="text" id="${this.id}" name="${this.name}" placeholder="${this.placeholder}" autocomplete="off" readonly required>`)
      input.onclick = this.show
      this.inputBox = input
      // this.form.appendChild(input)
      el.appendChild(input)

      // 构造清空按钮
      const clear = dom.create('<div class="mip-group-selection-clear-button"></div>')
      css(clear, {
        top: input.offsetTop + (input.offsetHeight - 16) / 2 - 8 + 'px',
        left: input.offsetWidth - 32 + 'px',
        display: 'none'
      })
      clear.onclick = () => {
        input.value = ''
        css(clear, 'display', 'none')
      }
      this.clearButton = clear
      el.appendChild(clear)
    }

    // 构造关闭按钮
    if (this.closable) {
      const closeButton = document.createElement('button')
      closeButton.className = 'mip-group-selection-close-button'
      closeButton.onclick = this.hide
      fixed.appendChild(closeButton)
    }

    document.body.appendChild(fixed)
  }

  /**
   * 修改最下方分组的样式，增加 marginBottom, 保证滚动后分组标题可以在页面最上方
   */
  modifyMarginBottom () {
    let lastGroup = this.fixedWrapper.querySelector('.mip-group-selection-content').lastElementChild
    // lastGroup.style.marginBottom = viewport.getHeight() - lastGroup.getBoundingClientRect().height - 10 + 'px'
    lastGroup.style.marginBottom = this.fixedWrapper.getBoundingClientRect().height - lastGroup.getBoundingClientRect().height - 10 + 'px'
  }

  /**
   * 绑定侧边栏快捷选择事件
   */
  bindSidebarClickEvent () {
    // ios sf 环境中
    if (!MIP.standalone && util.platform.isIOS() && fixedElement._fixedLayer) {
      // ios8 bug: mip-fixed 还没移到 fixedLayer 中，需要延迟执行
      setTimeout(() => {
        let wrapper = fixedElement._fixedLayer.querySelector('.mip-group-selection-sidebar-wrapper')
        util.event.delegate(wrapper, '.mip-group-selection-link', 'click', e => {
          let button = e.target
          let targetAnchor = button.dataset.targetAnchor
          // 滚动待选列表到指定分组
          this.scrollToAnchor(targetAnchor)
        })
      })
    } else {
      util.event.delegate(this.fixedWrapper, '.mip-group-selection-link', 'click', e => {
        let button = e.target
        let targetAnchor = button.dataset.targetAnchor
        this.scrollToAnchor(targetAnchor)
      })
    }
  }

  /**
   * 滚动待选列表到指定分组
   *
   * @param {string} anchor 跳转目标
   */
  scrollToAnchor (anchor) {
    const anchorElement = this.fixedWrapper.querySelector('[data-anchor=' + anchor + ']')
    const content = this.fixedWrapper.querySelector('.mip-group-selection-content')
    try {
      // viewport.setScrollTop(anchorElement.offsetTop + 10)
      content.scrollTo(0, anchorElement.offsetTop)
    } catch (e) {}
    // 兜底效果，再 scroll 一次
    // viewport.setScrollTop(anchorElement.offsetTop + 10)
    content.scrollTo(0, anchorElement.offsetTop)
  }

  /**
   * 选项绑定点击事件，点击修改 MIP data 并触发 selected 事件
   *
   */
  bindItemClickEvent () {
    event.delegate(this.fixedWrapper, '.mip-group-selection-item', 'click', e => {
      let itemData = e.target && e.target.dataset
      e.data = itemData
      MIP.setData(e.data)
      viewer.eventAction.execute('selected', this.element, e)

      if (!this.inputBox) {
        return
      }

      const value = this.field ? e.data[this.field] : e.data
      if (this.multiple) {
        this.inputBox.value += (this.inputBox.value ? ', ' : '') + value
      } else {
        this.inputBox.value = value
      }
      css(this.clearButton, 'display', 'block')
    })
  }

  show () {
    css(this.mask, 'display', '')
    css(this.fixedWrapper, 'display', '')
    if (this.firstShow) {
      // 修改最下方分组的样式，增加 marginBottom, 保证滚动后分组标题可以在页面最上方
      this.modifyMarginBottom()
      this.firstShow = false
    }
  }

  hide () {
    css(this.fixedWrapper, 'display', 'none')
    css(this.mask, 'display', 'none')
  }
}
