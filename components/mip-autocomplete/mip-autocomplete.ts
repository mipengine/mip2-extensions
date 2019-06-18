import './mip-autocomplete.less'
enum FILTER_TYPE {
  SUBSTRING = 'substring',
  PREFIX = 'prefix',
  NONE = 'none'
}

enum KEYS {
  ENTER = 'Enter',
  ESCAPE = 'Escape',
  UP_ARROW = 'ArrowUp',
  DOWN_ARROW = 'ArrowDown',
  TAB = 'Tab'
}

const {CustomElement, viewport, util, templates, viewer} = MIP
const {error, warn} = util.log('mip-autocomplete')
const {dom} = util
const FRAME_TIME: number = 16

export default class MIPAutocomplete extends CustomElement {
  public sourceData: Array<object|string> = []
  public filter: string|null = ''
  public minChars: number = 0
  public maxEntries: number|null = null
  public submitOnEnter: boolean = false
  public src: string|null = ''
  private inputElement: HTMLInputElement|null = null
  private userInput: string = ''
  private activeIndex_: number = -1
  private activeElement: Element|null = null
  // 提示信息容器元素
  private container: Element|undefined = undefined
  private templateElement: HTMLElement|null|void = null
  // 包含 <mip-autocomplete> 的 <form> 祖先上指定了 “autocomplete” 属性
  // 当 <mip-autocomplete> 下的 input 框聚焦时，关掉 <form> 上的 autocomplete 功能，交给组件处理
  // 当 <mip-autocomplete> 下的 input 框失焦时，还原 <form> 上的 autocomplete 功能，交给 <form> 自己处理
  private initialAutocompleteAttr: string|null = null
  private raf: Function = this.getRaf()
  private mipForm: HTMLElement|null = null

  public constructor(private element: HTMLElement) {
    super(element)
    this.render = this.render.bind(this)
  }

  public build () {
    this.parseAttribute()

    this.templateElement = this.findTemplate(this.element)
    if (this.templateElement) {
      templates.render(this.element, {}).then(this.render)
    }

    this.container = this.createContainer()
    if (!this.container) {
      return
    }
    this.element.appendChild(this.container)

    this.element.classList.add('autocomplete-container')
  }

  public layoutCallback() {
    this.addEventListeners()
    let remoteDataPromise
    if (this.element.hasAttribute('src')) {
      if (this.sourceData.length !== 0) {
        error('同时发现了 <script> 和 src 指定提示数据源，请选择其一')
      }
      remoteDataPromise = this.getRemoteData()
    } else {
      remoteDataPromise = Promise.resolve(undefined)
    }
    if (!remoteDataPromise) {
      return
    }
    // 如果指定了两种数据源，优先显示服务器端返回的数据
    return (remoteDataPromise as any).then((remoteData: string[]) => {
      this.sourceData = remoteData || this.sourceData
      this.filterDataAndRenderResults(this.sourceData)
    })
  }

  private parseAttribute (): void {
    const jsonScript: HTMLElement|null = this.element.querySelector('script[type="application/json"]')
    if (jsonScript) {
      this.sourceData = this.getInlineData(jsonScript)
      if (!this.sourceData.length){
        return
      }
    } else if (!this.element.hasAttribute('src')) {
      warn('提示数据源未指定，请指定  <script type="application/json"> 或在组件上指定 src 属性')
    }

    const inputElements = this.element.querySelectorAll('INPUT') 
    if (inputElements.length !== 1) {
      error(`组件应包含且仅包含一个 input 子元素`)
    }
    this.inputElement = inputElements[0] as HTMLInputElement
    this.inputElement.classList.add('mip-autocomplete-input')
    const inputType: string|null = this.inputElement.getAttribute('type')
    if (inputType && inputType !== 'text' && inputType !== 'search') {
      error('input 元素上的 type 属性必须为 text')
    }
    // 设置文本方向
    this.inputElement.setAttribute('dir', 'auto')
    this.mipForm = dom.closest(this.inputElement, 'mip-form')
    if (!this.mipForm) {
      error('组件必须嵌套在 mip-form 组件中')
      return
    }
    if (this.mipForm.hasAttribute('autocomplete')) {
      this.initialAutocompleteAttr = this.mipForm.getAttribute('autocomplete')
    }
    this.filter = this.element.getAttribute('filter')
    if (!this.filter) {
      error('组件必须有 filter 属性')
    }
    if (!this.isEnumValue(FILTER_TYPE, this.filter)) {
      error('filter 值设置不合法')
    }

    this.minChars = parseInt(this.element.getAttribute('min-characters') || '0', 10)
    this.submitOnEnter = this.element.hasAttribute('submit-on-enter')
    this.src = this.element.getAttribute('src')
    if (this.src) {
      this.assertHttpsUrl(this.src)
    }
    const maxEn = this.element.getAttribute('max-entries')
    if (!maxEn) {
      return
    }
    this.maxEntries = parseInt(maxEn, 10)
  }

  private addEventListeners () {
    if (!this.inputElement) {
      return
    }
    // 取消浏览器自带的 autocomplete
    this.inputElement.setAttribute('autocomplete', 'off')

    this.inputElement.addEventListener('input', () => {
      this.inputHandler()
    })
    this.inputElement.addEventListener('keydown', e => {
      this.keyDownHandler(e as KeyboardEvent)
    })
    this.inputElement.addEventListener('focus', () => {
      this.toggleResultsHandler(true)
    })
    this.inputElement.addEventListener('blur', () => {
      this.toggleResultsHandler(false)
    })
    if (!this.container) {
      return
    }
    this.container.addEventListener('mousedown', e => {
      this.selectHandler(e)
    })
  }

  /**
   * 按照 src 获取服务器端数据
   */
  private getRemoteData (): Promise<string[]|null> {
    if (!this.src) {
      return Promise.resolve(null)
    }
    const req = new Request(this.src, this.buildGetRequestHeaders())
    return fetch(req)
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          throw new Error(`加载失败：${res.statusText}`)
        }
      })
      .then(data => {
        const items = data['items']
        if (!items) {
          error('数据中没有 items 属性，无法渲染')
          return []
        }
        return items
      })
      .catch(err => error(err))
  }

  /**
   * 获取来自 <script> 标签的 items 的数据
   */
  private getInlineData (script: Element): Array<object|string> {
    if (!script.textContent) {
      return []
    }
    const json = JSON.parse(script.textContent)
    const items = json['items']
    if (!items) {
      warn('数据未包含 items 属性，无法渲染数据')
      return []
    }
    return items
  }

  private inputHandler(): void {
    if (!this.inputElement) {
      return
    }
    this.userInput = this.inputElement.value
    this.raf(() => {
      this.filterDataAndRenderResults(this.sourceData, this.userInput)
      if (!this.container) {
        return
      }
      this.toggle(this.container, true)
    })
  }

  private keyDownHandler(event: KeyboardEvent) {
    switch (event.key) {
      case KEYS.DOWN_ARROW:
        event.preventDefault()
        // 提示条目已显示：显示用户输入，允许用户在条目中进行选择
        if (this.resultsShowing()) {
          // 中断循环显示用户输入
          const enabledItems = this.getEnabledItems()
          if (!enabledItems) {
            return
          }
          if (this.activeIndex_ === (enabledItems.length) - 1) {
            this.displayUserInput()
            return
          }
          return this.updateActiveItem(1)
        }
        // 提示条目未显示：筛选数据显示提示条目
        return this.raf(() => {
          this.filterDataAndRenderResults(this.sourceData, this.userInput)
          if (!this.container) {
            return
          }
          this.toggle(this.container, true)
        })
      case KEYS.UP_ARROW:
        event.preventDefault()
        // 提示条目已显示：显示用户输入，允许用户在条目中进行选择
        if (this.resultsShowing()) {
          // 中断循环显示用户输入
          if (this.activeIndex_ === 0) {
            this.displayUserInput()
            return
          }
          return this.updateActiveItem(-1)
        }
        // 提示条目未显示：筛选数据显示提示条目
        return this.raf(() => {
          this.filterDataAndRenderResults(this.sourceData, this.userInput)
          if (!this.container) {
            return
          }
          this.toggle(this.container, true)
        })
      case KEYS.ENTER:
        if (this.resultsShowing() && !this.submitOnEnter) {
          event.preventDefault()
          // mip-form 监听了 enter 的 keydown
          event.stopPropagation()
        }
        if (this.activeElement) {
          return this.raf(() => {
            if (!this.activeElement) {
              return
            }
            this.selectItem(this.activeElement)
            this.resetActiveElement()
          })
        }
        return
      case KEYS.ESCAPE:
        // 在 input 框显示用户输入并隐藏下拉提示
        return this.raf(() => {
          this.displayUserInput()
          if (!this.container) {
            return
          }
          this.toggle(this.container, false)
        })
      case KEYS.TAB:
        if (this.activeElement) {
          if (!this.inputElement) {
            return
          }
          this.userInput = this.inputElement.value
          this.fireSelectEvent(this.userInput)
        }
        return
      default:
        return
    }
  }

  /**
   * disable 或者 re-enable <form> 原生的 autocomplete 功能
   * <mip-autocomplete> 组件下的 input 框失焦/聚焦的处理
   */
  private toggleResultsHandler(display: boolean):void {
    // Disables 或者 re-enables <mip-form> 原生的 autocomplete 功能
    if (display) {
      this.mipForm && this.mipForm.setAttribute('autocomplete', 'off')
    } else if (this.initialAutocompleteAttr) {
      this.mipForm && this.mipForm.setAttribute('autocomplete', this.initialAutocompleteAttr)
    } else {
      this.mipForm && this.mipForm.removeAttribute('autocomplete')
    }

    // input 框失焦/聚焦的处理
    let renderAbove = false
    renderAbove = this.shouldRenderAbove()
    if (!display) {
      if (!this.inputElement) {
        return
      }
      this.userInput = this.inputElement.value
      this.filterDataAndRenderResults(this.sourceData, this.userInput)
      this.resetActiveElement()
    }
    if (!this.container) {
      return
    }
    this.setResultDisplayDirection(renderAbove)
    this.toggle(this.container, display)
  }

  /**
   * 当用户用鼠标点下某条提示条目，处理选中事件
   */
  private selectHandler(event: Event): Promise<any> {
    return this.raf(() => {
      const element = event.target as HTMLElement
      const itemElement = this.getItemElement(element)
      if (!itemElement) {
        return
      }
      this.selectItem(itemElement)
    })
  }

  /**
   * 将选中条目的值写入 input 框
   */
  private selectItem(element: Element) {
    if (element === null || element.hasAttribute('data-disabled')) {
      return
    }
    const dataValue = element.getAttribute('data-value')
    if (!dataValue) {
      return
    }
    this.inputElement && (this.inputElement.value = this.userInput = dataValue)
    this.fireSelectEvent(this.userInput)
    this.clearAllItems()
  }

  /**
   * 返回提示条目
   */
  private getItemElement(element: HTMLElement|null): HTMLElement|null {
    if (element === null) {
      return null
    }
    if (element.classList.contains('i-miphtml-autocomplete-item')) {
      return element
    }
    return this.getItemElement(element.parentElement)
  }

  /**
   * 根据 input 框在视口中的位置，决定提示条目在 input 框的上面显示还是下面显示
   */
  private setResultDisplayDirection(renderAbove: boolean) {
    this.container && this.container.classList.toggle('i-miphtml-autocomplete-results-up', renderAbove)
  }

  /**
   * 根据用户输入筛选提示条目，显示在 container 中
   */
  private filterDataAndRenderResults(sourceData: Array<object|string>, optInput: string = ''): Promise<any> {
    this.clearAllItems()
    if (optInput.length < this.minChars || !sourceData || !sourceData.length) {
      return Promise.resolve()
    }

    const filteredData = this.filterData(sourceData, optInput)
    if (!this.container) {
      return Promise.reject()
    }
    return this.renderResults(filteredData, this.container)
  }

  /**
   * 把筛选后的提示条目渲染在 container 子元素中
   */
  private renderResults(filteredData: Array<object|string>, container: Element): Promise<any> {
    this.resetActiveElement()
    // 有 template 子元素的，用来支持 mustache 富文本
    if (this.templateElement) {
      return templates.render(this.element, filteredData).then((renderedChildren: any) => {
        renderedChildren.map((child: any) => {
          const parserEle = document.createElement('div')
          parserEle.innerHTML = child
          const childEle = parserEle.querySelector('section')
          if (!childEle) {
            return
          }
          if (childEle.hasAttribute('data-disabled')) {
            childEle.setAttribute('aria-disabled', 'true')
          }
          if (!childEle.hasAttribute('data-value') && !childEle.hasAttribute('data-disabled')) {
            error('"data-value" 或 "data-disabled" 需要设置其一')
          }
          childEle.classList.add('i-miphtml-autocomplete-item')
          container.appendChild(childEle)
        })
      })
    } else {
      filteredData.forEach(item => {
        const element = this.createElementFromItem(item)
        if (!element) {
          return
        }
        container.appendChild(element)
      })
    }
    return Promise.resolve()
  }


  private createElementFromItem(item: string|object): HTMLElement|null {
    if (!this.element.ownerDocument) {
      return null
    }
    const element = this.element.ownerDocument.createElement('section')
    element.classList.add('i-miphtml-autocomplete-item')
    element.setAttribute('dir', 'auto')
    if (typeof item === 'object') {
      item = this.getValueForExpr(item, this.element.getAttribute('filter-value') || 'value') as string
    }
    element.setAttribute('data-value', item)
    element.textContent = item
    return element
  }

  /**
   * 根据用户输入筛选提示条目
   */
  private filterData(data: Array<object|string>, input: string):  Array<object|string> {
    // 提示数据来自服务器端
    if (this.filter === FILTER_TYPE.NONE) {
      return this.truncateToMaxEntries(data)
    }
    // 提示数据来自浏览器端
    input = input.toLocaleLowerCase()
    const itemsExpr: string = this.element.getAttribute('filter-value') || 'value'
    const filteredData = data.filter(item => {
      if (typeof item === 'object') {
        const value = this.getValueForExpr(item, itemsExpr)
        if (value === undefined) {
          return
        }
        item = value
      }
      item = (item as string).toLocaleLowerCase()
      switch (this.filter) {
        case FILTER_TYPE.SUBSTRING:
          return item.indexOf(input) !== -1
        case FILTER_TYPE.PREFIX:
          return item.lastIndexOf(input) === 0
        default:
          throw new Error(`不支持的 filter 写法: ${this.filter}`)
      }
    })

    return this.truncateToMaxEntries(filteredData)
  }

  /**
   * 提示信息是否显示
   */
  private resultsShowing(): boolean {
    if (!this.container) {
      return false
    }
    return !this.container.hasAttribute('hidden') && this.container.children.length > 0
  }

  /**
   * 返回提示消息里非 disabled 的条目
   */
  private getEnabledItems(): NodeList|null {
    if (!this.container) {
      return null
    }
    return this.container.querySelectorAll('.i-miphtml-autocomplete-item:not([data-disabled])')
  }

  /**
   * 在输入框里显示用户的部分输入
   */
  private displayUserInput() {
    if (!this.inputElement) {
      return
    }
    this.inputElement.value = this.userInput
    this.resetActiveElement()
  }

  /**
   * 按照 dleta 设置下一个活动项
   */
  private updateActiveItem(delta: number) {
    if (delta === 0 || !this.resultsShowing()) {
      return
    }
    const keyUpWhenNoneActive: boolean = this.activeIndex_ === -1 && delta < 0
    const index = keyUpWhenNoneActive ? delta : this.activeIndex_ + delta
    const enabledElements = this.getEnabledItems()
    if (!enabledElements) {
      return
    }
    if (enabledElements.length === 0) {
      return
    }
    const activeIndex = this.mod(index, enabledElements.length)
    const newActiveElement = enabledElements && enabledElements[activeIndex]
    if (!this.inputElement) {
      return
    }
    const dataValue = (newActiveElement as Element).getAttribute('data-value')
    if (!dataValue) {
      return
    }
    this.inputElement.value = dataValue

    // 元素是否可见逻辑
    let shouldScroll: boolean
    let newTop: number

    return this.raf(() => {
      const {offsetTop: itemTop, offsetHeight: itemHeight} = newActiveElement as HTMLElement
      const {scrollTop: resultTop, offsetHeight: resultHeight} = this.container as HTMLElement
      shouldScroll = resultTop > itemTop || resultTop + resultHeight < itemTop + itemHeight
      newTop = delta > 0 ? itemTop + itemHeight - resultHeight : itemTop

      if (!this.container) {
        return
      }
      if (shouldScroll) {
        this.container.scrollTop = newTop
      }
      this.resetActiveElement()
      ;(newActiveElement as HTMLElement).classList.add('i-miphtml-autocomplete-item-active')
      this.activeIndex_ = activeIndex
      this.activeElement = (newActiveElement as HTMLElement)
    })
  }

  /**
   * 重置 active 的条目
   */
  private resetActiveElement() {
    if (!this.activeElement) {
      return
    }
    this.activeElement.classList.toggle('i-miphtml-autocomplete-item-active', false)
    this.activeElement = null
    this.activeIndex_ = -1
  }

  /**
   * 触发 select 事件，传递数据
   */
  private fireSelectEvent(value: string) {
    viewer.eventAction.execute('select', this.element, {value})
  }

  /**
   * 根据 max-entries 给定的值，截取提示的条目数
   */
  private truncateToMaxEntries(data: Array<object|string>): Array<object|string> {
    if (this.maxEntries && this.maxEntries < data.length) {
      data = data.slice(0, this.maxEntries)
    }
    return data
  }

  /**
   * 移除 this.container 的所有子元素
   */
  private clearAllItems() {
    if (!this.container) {
      return
    }
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild)
    }
  }
  
  /**
   * 根据 expr 返回对象该属性的值，expr 是以 . 分割的字符串
   * 如果 expr 上的任意属性不存在或者不是对象或数组，则返回 undefined
   */
  private getValueForExpr(obj: any, expr: string) {
    // `.` 代表对象本身
    if (expr == '.') {
      return obj
    }
    const parts = expr.split('.')
    let value = obj
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part && value && value[part] !== undefined && Object.prototype.hasOwnProperty.call(value, part)) {
        value = value[part]
        continue
      }
      value = undefined
      break
    }
    return value
  }

  /**
   * 检查参数 s 费否是枚举量 enumObj 的和法值
   */
  private isEnumValue<T>(enumObj: {[key: number]: T}, s: T): boolean {
    for (const k in enumObj) {
      if (enumObj[k] === s) {
        return true
      }
    }
    return false
  }

  /**
   * 创建包含提示条目的 div
   */
  private createContainer(): Element|undefined {
    if (!this.element.ownerDocument) {
      return
    }
    const container = this.element.ownerDocument.createElement('section')
    container.classList.add('i-miphtml-autocomplete-results')
    if (this.shouldRenderAbove()) {
      container.classList.add('i-miphtml-autocomplete-results-up')
    }
    this.toggle(container, false)
    return container
  }

  /**
   * 当 input 处在视口下半段，提示框应显示在 input 框的上面
   */
  private shouldRenderAbove(): boolean {
    const viewHeight = viewport.getHeight() || 0
    if (!this.inputElement) {
      return false
    }
    return this.inputElement.getBoundingClientRect().top > (viewHeight / 2)
  }

  /**
   * 显示或隐藏指定元素
   */
  private toggle(element:Element, opt_display: boolean = false) {
    opt_display ? element.removeAttribute('hidden') : element.setAttribute('hidden', '')
  }

  // 修正原生取模运算，这里使商尽可能小
  // 参考：https://stackoverflow.com/questions/25726760/javascript-modular-arithmetic/47354356#47354356
  // http://ceeji.net/blog/mod-in-real/
  private mod(a: number, b: number): number {
    return a > 0 && b > 0 ? a % b : ((a % b) + b) % b
  }

  /**
   * 返回 raf 或处理了 16ms 延时的 setTimeout
   */
  private getRaf (): Function {
    const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame
    if (raf) {
      return raf.bind(window)
    }
    let lastTime = 0
    return (fn: Function) => {
      const now = Date.now()
      // 默认帧渲染间隔是 16ms
      // 如果上一帧是 10ms 之前执行的，这一次执行只等 6ms，搭这次的帧渲染
      const timeToCall = Math.max(0, FRAME_TIME - (now - lastTime))
      lastTime = now + timeToCall
      setTimeout(fn, timeToCall)
    }
  }

  /**
   * 渲染 template 模板
   */
  render (htmls: string) {
    if (!this.container) {
      return
    }
    let node = document.createElement('section')
    node.innerHTML = htmls
    this.container.appendChild(node)
  }

  private findTemplate (element: HTMLElement) {
    if (!element || element.nodeType !== 1) {
      return console.error('Template parent element must be a node element')
    }
    if (element.tagName === 'TEMPLATE') {
      return element
    }
    let templateId = element.getAttribute('template')
    let template

    template = templateId ? document.getElementById(templateId) : element.querySelector('template')

    if (!template) {
      return null
    }

    return template
  }

  /**
   * 检查 url 是否合法
   */
  private assertHttpsUrl (urlString: string): string {
    if (urlString === null) {
      error('url 不存在')
    }
    if (!(this.isSecureUrlDeprecated(urlString) || /^(\/\/)/.test(urlString))) {
      error(`url 需为 https 协议，${urlString} 不合法`)
    }
    return urlString
  }

  /**
   * 检查 url 是否安全
   */
  private isSecureUrlDeprecated (url: string): boolean {
    let parsedURL
    if (typeof url === 'string') {
      parsedURL = this.parseUrlWithA(url)
    }
    if (!parsedURL) {
      return false
    }
    return (parsedURL.protocol === 'https:' ||
        parsedURL.hostname === 'localhost' ||
        parsedURL.hostname === '127.0.0.1' ||
        this.endsWith(parsedURL.hostname, '.localhost'))
  }

  private endsWith (string: string, suffix: string) {
    const index = string.length - suffix.length
    return index >= 0 && string.indexOf(suffix, index) === index
  }

  /**
   * 使用 a 标签解析 url
   */
  private parseUrlWithA (url: string) {
    let a: HTMLAnchorElement = document.createElement('a')
    a.href = url

    // IE11 没有解析相对 url 的组件
    if (!a.protocol) {
      a.href = a.href
    }

    const info = {
      href: a.href,
      protocol: a.protocol,
      host: a.host,
      hostname: a.hostname,
      port: a.port === '0' ? '' : a.port,
      pathname: a.pathname,
      search: a.search,
      hash: a.hash,
      origin: 'null' // Set below.
    }

    // 1) IE11 会去掉路径名中的 '/'
    if (info.pathname[0] !== '/') {
      info.pathname = '/' + info.pathname
    }

    // 2) 对于隐式端口的URL，IE11解析为默认端口，而其他浏览器将端口字段留空
    if ((info.protocol === 'http:' && info.port === '80') ||
    (info.protocol === 'https:' && info.port === '443')) {
      info.port = ''
      info.host = info.hostname
    }

    // 对于数据 uri，a.origin 等于字符串'null'，这里返回原 url
    if (a.origin !== 'null') {
      info.origin = a.origin
    } else if (info.protocol === 'data:' || !info.host) {
      info.origin = info.href
    } else {
      info.origin = info.protocol + '//' + info.host
    }
    const frozen = Object.freeze ? Object.freeze(info) : info

    return frozen
  }

  private buildGetRequestHeaders (): any {
    let header = new Headers()
    header.append('Accept', 'application/json')
    header.append('Content-Type', 'application/json')
    header.set('method', 'GET')
    return header
  }
}
