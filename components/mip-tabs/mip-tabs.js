import './mip-tabs.less'

const {CustomElement, util: {dom, rect}, viewer} = MIP

export default class MIPTabs extends CustomElement {
  static get observedAttributes () {
    return ['reset-tab']
  }

  attributeChangedCallback (name) {
    if (name === 'reset-tab') {
      const {initialTab, resetTab} = this.props

      if (resetTab) {
        this.moveTo(initialTab)
      }
    }
  }

  build () {
    const {firstElementChild} = this.element

    if (firstElementChild && firstElementChild.classList.contains('mip-tabs')) {
      return
    }

    const {initialTab} = this.props
    const childNodes = dom.create(this.element.innerHTML)

    this.element.innerHTML = '<div class="mip-tabs">' +
      '<div class="mip-tabs-label-wrap">' +
      '<div class="mip-tabs-label-container"></div>' +
      '</div>' +
      '<div class="mip-tabs-content-wrap">' +
      '</div>' +
      '</div>'
    const content = this.element.querySelector('.mip-tabs-content-wrap')

    childNodes && childNodes.length ? childNodes.forEach(child => content.appendChild(child)) : content.appendChild(childNodes)

    this.tabs = [...content.childNodes].filter(child => child.nodeName === 'MIP-TABS-ITEM')

    this.currentIndex = initialTab
    this.tabs[this.currentIndex].setAttribute('is-active', true)

    this.renderTabs()
    this.moveTo(initialTab)
    this.addEventAction('slideTab', (event, index) => this.moveTo(+index))
  }

  moveTo (index) {
    this.tabs[this.currentIndex].setAttribute('is-active', false)
    this.tabs[index].setAttribute('is-active', true)
    this.labels[this.currentIndex].classList.remove('optionColor')
    this.labels[index].classList.add('optionColor')
    this.currentIndex = index

    const currenLabel = this.labels[index].querySelector('span')

    const tabRect = rect.getElementRect(currenLabel)

    // label 滑动距离
    const firstLabel = this.labels[0]
    const firstLabelRect = rect.getElementRect(firstLabel)

    // tab line的偏移量
    const offsetX = tabRect.left - firstLabelRect.left
    const line = this.element.querySelector('.mip-tabs-line')
    line.style.width = `${tabRect.width}px`
    this.setTransform(line, `translate3d(${offsetX}px, 0, 0)`)

    // 容器宽度
    const translateX = -rect.getElementRect(this.element).width * index
    this.setTransform(this.element.querySelector('.mip-tabs-content-wrap'), `translate3d(${translateX}px, 0, 0)`)
  }

  setTransform (element, transformRule) {
    element.style.webkitTransform = transformRule
    element.style.transform = transformRule
  }

  handleTabChange (index) {
    this.moveTo(index)
    viewer.eventAction.execute('changeEnd', this.element, index)
  }

  renderTabs () {
    const labelsProps = this.tabs.map(tab => ({
      name: tab.getAttribute('label'),
      disabled: tab.getAttribute('disabled')
    }))
    const labelContainer = this.element.querySelector('.mip-tabs-label-container')

    labelContainer.innerHTML = labelsProps.map(({name}, index) =>
      `<div class="mip-tabs-label"><span>${name}</span></div>`
    ).join('') +
    '<div class="mip-tabs-line"></div>'

    this.labels = [...labelContainer.querySelectorAll('.mip-tabs-label')]
    this.labels[this.currentIndex].classList.add('optionColor')

    labelsProps.forEach(({disabled}, index) => disabled && this.labels[index].setAttribute('disabled', disabled))

    this.labels.forEach((label, index) =>
      label.addEventListener('click', () => {
        labelsProps[index].disabled || this.handleTabChange(index)
      }))
  }
}

MIPTabs.props = {
  initialTab: {
    type: Number,
    default: 0
  },
  resetTab: {
    type: Boolean,
    default: false
  }
}
