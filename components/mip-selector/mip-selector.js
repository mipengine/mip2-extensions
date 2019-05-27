/**
 * @file selector 控件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-selector.less'

const { CustomElement, util, viewer } = MIP

export default class MIPSelector extends CustomElement {
  constructor (...element) {
    super(...element)

    /**
     * @type {boolean}
     *
     * 是否多选
     */
    this.isMultiple = false

    /**
     * @type {boolean}
     *
     * 是否不可选
     */
    this.isDisabled = false

    /**
     * @type {Array<HTMLElement>}
     *
     * 选中的选项对应的 DOM 元素
     */
    this.selectedElements = []

    /**
     * @type {Array<HTMLElement>}
     *
     * 所有的选项对应的 DOM 元素
     */
    this.elements = []

    /**
     * @type {Array<HTMLElement>}
     *
     * 已选的选项对应的存储相应值的 hidden input 元素列表
     */
    this.inputs = []
  }

  build () {
    let ele = this.element
    this.isMultiple = ele.hasAttribute('multiple')
    this.isDisabled = ele.hasAttribute('disabled')

    this.init()
    this.registerActions()
    this.element.addEventListener('click', this.clickHandler.bind(this))
  }

  /**
   * 初始化组件
   *
   * @param {Array<HTMLElement>} optionsElements  指定的选项 DOM 列表
   */
  init (optionsElements) {
    optionsElements = optionsElements || [...this.element.querySelectorAll('[option]')]
    this.selectedElements = []

    optionsElements.forEach(el => {
      if (!el.hasAttribute('role')) {
        el.setAttribute('role', 'option')
      }

      if (el.hasAttribute('disabled')) {
        el.setAttribute('aria-disabled', 'true')
      }

      el.hasAttribute('selected') ? this.setSelection(el) : this.clearSelection(el)
      el.tabIndex = 0
    })

    this.elements = optionsElements
    this.updateFocus()
    this.setInputs()
  }

  /**
   * 选择选项的点击事件处理
   *
   * @param {Object} event  事件源
   */
  clickHandler (event) {
    if (this.isDisabled) {
      return
    }

    let el = event.target

    while (el && el !== document && !el.hasAttribute('option')) {
      el = el.parentNode
    }

    el && el !== document && this.onOptionPicked(el)
  }

  /**
   * 选择了某一个选项之后的逻辑处理
   *
   * @param {HTMLElement} ele 选中的 option 的 DOM 元素
   */
  onOptionPicked (ele) {
    if (this.isDisabled || ele.hasAttribute('disabled')) {
      return
    }

    if (ele.hasAttribute('selected')) {
      if (this.isMultiple) {
        this.clearSelection(ele)
        this.setInputs()
      }
    } else {
      this.setSelection(ele)
      this.setInputs()
    }

    this.updateFocus(ele)
    this.fireSelectEvent(ele)
  }

  /**
   * 注册所有的 actions
   */
  registerActions () {
    this.addEventAction('clear', () => {
      this.clearAllSelections()
    })

    this.addEventAction('selectUp', (e, obj) => {
      obj = obj || '{step:1}'
      obj = util.jsonParse(obj)
      this.select(+obj.step)
    })

    this.addEventAction('selectDown', (e, obj) => {
      obj = obj || '{step:1}'
      obj = util.jsonParse(obj)
      this.select(0 - obj.step)
    })

    this.addEventAction('toggle', (e, obj) => {
      obj = obj || '{index: 0}'
      obj = util.jsonParse(obj)
      this.toggle(+obj.index, obj.status)
    })
  }

  /**
   * 选中选项之后设置 DOM 的属性和状态，涉及到样式的修改
   *
   * @param {HTMLElement} ele 选中的选项 DOM 元素
   */
  setSelection (ele) {
    if (this.selectedElements.includes(ele)) {
      return
    }

    if (!this.isMultiple) {
      this.clearAllSelections()
    }

    ele.setAttribute('selected', '')
    ele.setAttribute('aria-selected', 'true')
    this.selectedElements.push(ele)
  }

  /**
   * 清除所有的已选项
   */
  clearAllSelections () {
    while (this.selectedElements.length > 0) {
      this.clearSelection(this.selectedElements.pop())
    }
    this.setInputs()
  }

  /**
   * 将指定的选项的状态设置为未选中
   *
   * @param {HTMLElement} ele 选中的选项 DOM 元素
   */
  clearSelection (ele) {
    let selIndex = this.selectedElements.indexOf(ele)
    ele.removeAttribute('selected')
    ele.setAttribute('aria-selected', 'false')
    if (selIndex !== -1) {
      this.selectedElements.splice(selIndex, 1)
    }
  }

  /**
   * 选中之后调整选项的聚焦情况
   *
   * @param {HTMLElement} focusElement 需要聚焦的 DOM 元素
   */
  updateFocus (focusElement) {
    this.elements.forEach(optionElement => {
      optionElement.tabIndex = -1
    })

    focusElement = focusElement || (this.isMultiple ? this.elements[0] : this.selectedElements[0] || this.elements[0])

    if (focusElement) {
      this.focusedIndex = this.elements.indexOf(focusElement)
      focusElement.tabIndex = 0
    }
  }

  /**
   * 和 input 控件关联，用于 form 表单
   */
  setInputs () {
    let selectedValues = []
    let elementName = this.element.getAttribute('name')
    let fragment = document.createDocumentFragment()
    let formId = this.element.getAttribute('form')

    if (!elementName || this.isDisabled) {
      return selectedValues
    }

    (this.inputs || []).forEach(input => this.element.removeChild(input))
    this.inputs = []

    this.selectedElements.forEach(optionEle => {
      if (!optionEle.hasAttribute('disabled')) {
        let hidden = document.createElement('input')
        let value = optionEle.getAttribute('option')

        hidden.setAttribute('type', 'hidden')
        hidden.setAttribute('name', elementName)
        hidden.setAttribute('value', value)

        formId && hidden.setAttribute('form', formId)

        this.inputs.push(hidden)
        fragment.appendChild(hidden)
        selectedValues.push(value)
      }
    })

    this.element.appendChild(fragment)

    return selectedValues
  }

  /**
   * 选择一个选项
   *
   * @param {?number} step 指定的步长，默认为 1
   */
  select (step = 1) {
    let optionsEles = this.elements
    let previousIndex = optionsEles.indexOf(this.selectedElements[0])
    let previousEl = optionsEles[previousIndex]
    let len = optionsEles.length
    let currentIndex = (step < 0 && previousIndex === -1)
      ? step
      : (previousIndex + step)

    currentIndex = (currentIndex < 0 ? (len + currentIndex) : currentIndex) % len
    this.setSelection(optionsEles[currentIndex])
    previousEl && this.clearSelection(previousEl)
  }

  /**
   * 反向选择一个选项
   *
   * @param {?number} index 指定的下标，默认为 0
   * @param {?boolean} status 强行指定的状态，默认为当前选中状态的取反
   */
  toggle (index = 1, status) {
    let el = this.elements[index]
    let indexCurrentStatus = el.hasAttribute('selected')
    let indexFinalStatus = status !== undefined ? status : !indexCurrentStatus
    let selectedIndex = this.elements.indexOf(this.selectedElements[0])

    if (indexFinalStatus === indexCurrentStatus) {
      return
    }

    if (selectedIndex !== index) {
      this.setSelection(el)
      let selectedEl = this.elements[selectedIndex]
      if (selectedEl) {
        this.clearSelection(selectedEl)
      }
    } else {
      this.clearSelection(el)
    }

    this.fireSelectEvent(el)
  }

  /**
   * 获取全部的选中的值
   *
   * @returns {Array<string>} 全部选中的值的数组
   */
  selectedOptions () {
    return this.selectedElements.map(el => el.getAttribute('option'))
  }

  /**
   * 选中选项后触发 select 回调
   *
   * @param {HTMLElement} el 选中的 DOM 元素
   */
  fireSelectEvent (el) {
    viewer.eventAction.execute('select', this.element, {
      targetOption: el.getAttribute('option'),
      selectedOptions: this.selectedOptions()
    })
  }
}
