import './mip-group-selection.less'

const {
  util,
  viewer,
  templates,
  Services,
  CustomElement
} = MIP

const log = util.log('mip-group-selection')
const {fixedElement} = viewer
const {dom, css, event} = util
const CustomStorage = util.customStorage
const storage = new CustomStorage(0)
const timer = Services.timer()
const TEXT = '_textContent'

export default class MIPGroupSelection extends CustomElement {
  build () {
    const el = this.element
    this.name = el.getAttribute('name') || 'select'
    this.placeholder = el.getAttribute('placeholder') || ''
    this.id = el.dataset.id || ''
    this.field = el.getAttribute('field') || ''
    this.multiple = el.hasAttribute('multiple')
    this.closable = this.multiple || el.hasAttribute('closable')
    this.inForm = !!dom.closest(el, 'mip-form')
    this.firstShow = true
    this.history = []
    this.selected = []
    this.maxHistory = 3

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
   * 渲染历史记录
   */
  renderHistoryList () {
    try {
      this.history = JSON.parse(storage.get(this.storageName)) || []
    } catch (e) {
      log.warn('history data is wrong!')
    }
    let html = ''
    if (this.history && this.history.length) {
      html = `<div class="mip-group-selection-content lasted-visited">
                <div class="mip-group-selection-title">最近选择</div>`
      this.history.forEach(item => {
        const datasetString = this.props.map(prop => `data-${prop}="${item[prop]}"`).join(' ')
        html += `<p class="mip-group-selection-item" ${datasetString}>${item[TEXT]}</p>`
      })
      html += '</div></div>'
    }
    this.historyWrapper.innerHTML = html
  }

  /**
   * 模版内容移到 mip-fixed 中
   *
   * @param {string} html 模版代码
   */
  moveToFixed (html) {
    this.fixedWrapper = dom.create(`<mip-fixed class="mip-group-selection-wrapper" type="top"></mip-fixed>`)
    css(this.fixedWrapper, 'display', 'none')
    this.contentWrapper = dom.create(`<div class="mip-group-selection-content-wrapper"></div>`)
    this.contentWrapper.innerHTML = html
    this.sidebarWrapper = this.contentWrapper.querySelector('.mip-group-selection-sidebar-wrapper')
    this.fixedWrapper.appendChild(this.sidebarWrapper)
    this.fixedWrapper.appendChild(this.contentWrapper)
  }

  /**
   * 渲染输入框、清空按钮
   */
  renderInputBox () {
    // 构造输入框
    this.inputBox = dom.create(
      `
        <input class="mip-group-selection-input" type="text"
          id="${this.id}" name="${this.name}" placeholder="${this.placeholder}" 
          autocomplete="off" readonly required>
      `
    )
    this.inputBox.onclick = this.show
    this.element.appendChild(this.inputBox)

    // 构造清空按钮
    const clearButton = dom.create('<div class="mip-group-selection-clear-button"></div>')
    css(clearButton, {
      top: this.inputBox.offsetTop + (this.inputBox.offsetHeight - 16) / 2 - 8 + 'px',
      left: this.inputBox.offsetWidth - 32 + 'px',
      display: 'none'
    })
    clearButton.onclick = () => {
      this.inputBox.value = ''
      css(clearButton, 'display', 'none')
    }
    this.clearButton = clearButton
    this.element.appendChild(clearButton)
  }

  /**
   * 生成 dom，构造 mask、输入框、关闭按钮等
   *
   * @param {string} html templates 解析出来的字符串
   */
  renderHtml (html) {
    this.moveToFixed(html)

    // 根据选项元素获取所有属性字段，并生成 localStorage 名
    const itemElement = this.contentWrapper.querySelector('.mip-group-selection-item')
    this.props = Object.keys(itemElement.dataset)
    this.storageName = 'groupSelection' + this.props.map(prop => prop.slice(0, 1).toUpperCase() + prop.slice(1)).join('')

    // 构造已选择列表
    if (this.multiple) {
      const selectedWrapper = dom.create(`<div class="mip-group-selected-selected-wrapper"></div>`)
      this.contentWrapper.insertBefore(selectedWrapper, this.contentWrapper.firstChild)
      this.selectedWrapper = selectedWrapper
    }

    // 构造历史记录列表
    this.historyWrapper = dom.create(`<div class="mip-group-selection-history-wrapper"></div>`)
    this.contentWrapper.insertBefore(this.historyWrapper, this.contentWrapper.firstChild)
    this.renderHistoryList()

    // 构造 mask
    this.mask = dom.create(`<mip-fixed still class="mip-group-selection-mask" type="top"></mip-fixed>`)
    css(this.mask, 'display', 'none')
    // this.mask.onclick = this.hide
    this.mask.addEventListener('touchend', this.hide)
    this.element.appendChild(this.mask)

    // 在 mip-form 中显示为输入框
    if (this.inForm) {
      this.renderInputBox()
    }

    // 构造关闭按钮
    if (this.closable) {
      const closeButton = document.createElement('button')
      closeButton.className = 'mip-group-selection-close-button'
      closeButton.onclick = this.hide
      this.fixedWrapper.appendChild(closeButton)
    }

    document.body.appendChild(this.fixedWrapper)
  }

  /**
   * 修改最下方分组的样式，增加 marginBottom, 保证滚动后分组标题可以在页面最上方
   */
  modifyMarginBottom () {
    const lastGroup = this.contentWrapper.querySelector('.mip-group-selection-content:not(.lasted-visited):not(.selected)').lastElementChild
    lastGroup.style.marginBottom = this.fixedWrapper.getBoundingClientRect().height - lastGroup.getBoundingClientRect().height - 10 + 'px'
  }

  /**
   * 绑定侧边栏快捷选择事件
   */
  bindSidebarClickEvent () {
    // ios sf 环境中
    if (!MIP.standalone && util.platform.isIOS() && fixedElement._fixedLayer) {
      // ios8 mip-fixed 还没移到 fixedLayer 中，需要延迟执行
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
    this.contentWrapper.scrollTo(0, anchorElement.offsetTop)
  }

  /**
   * 选项绑定点击事件，点击修改 MIP data 并触发 selected 事件
   *
   */
  bindItemClickEvent () {
    event.delegate(this.fixedWrapper, '.mip-group-selection-item', 'click', e => {
      let itemData = e.target && e.target.dataset
      e.data = Object.assign({[TEXT]: e.target.textContent}, itemData)
      MIP.setData(e.data)
      viewer.eventAction.execute('selected', this.element, e)
      this.updateHistory(e.data)

      // 是否已选
      let haveSelected = (data) => {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i][TEXT] === data[TEXT]) {
            return true
          }
        }
        return false
      }

      if (this.multiple) {
        if (!haveSelected(e.data)) {
          this.selected.push(e.data)
          this.addToSelectedList(e.data)
        }
        return
      }

      this.selected = [e.data]
      !this.closable && this.hide()
    })
  }

  /**
   * 更新历史记录
   *
   * @param {Object} data 选项数据
   */
  updateHistory (data) {
    let isExit = false
    for (let i = 0; i < this.history.length; i++) {
      if (this.history[i][TEXT] === data[TEXT]) {
        let newest = this.history[i]
        this.history.splice(i, 1)
        this.history.unshift(newest)
        isExit = true
      }
    }

    if (!isExit) {
      this.history.unshift(data)
      this.history = this.history.slice(0, this.maxHistory)
    }

    storage.set(this.storageName, JSON.stringify(this.history))
    this.renderHistoryList()
  }

  /**
   * 添加到已选列表
   *
   * @param {Object} data 选项数据
   */
  addToSelectedList (data) {
    if (!this.selectedList) {
      this.selectedList = dom.create(
        `<div class="mip-group-selection-content selected">
          <div class="mip-group-selection-title">已选择</div>`
      )
      this.selectedWrapper.appendChild(this.selectedList)
    }
    const datasetString = this.props.map(prop => `data-${prop}="${data[prop]}"`).join(' ')
    const item = dom.create(`<p class="mip-group-selection-item" ${datasetString}>${data[TEXT]}</p>`)
    this.selectedList.appendChild(item)
  }

  show () {
    css(this.fixedWrapper, 'display', '')
    css(this.mask, 'display', '')
    timer.delay(() => css(this.fixedWrapper, 'transform', 'translateY(0%)'))
    this.renderHistoryList()
    if (this.firstShow) {
      // 修改最下方分组的样式，增加 marginBottom, 保证滚动后分组标题可以在页面最上方
      this.modifyMarginBottom()
      this.firstShow = false
    }
  }

  hide () {
    css(this.fixedWrapper, {
      display: 'none',
      transform: 'translateY(100%)'
    })
    css(this.mask, 'display', 'none')

    if (this.inputBox) {
      // 更新输入框的值
      const value = this.selected.map(data => data[this.field]).join(', ')
      this.inputBox.value = value
      value && css(this.clearButton, 'display', 'block')
    }

    const e = new Event('close')
    e.data = this.selected
    viewer.eventAction.execute('close', this.element, e)

    // 清空已选择列表
    if (this.multiple) {
      this.selectedWrapper.innerHTML = ''
      this.selectedList = null
    }
    this.selected = []
  }
}
