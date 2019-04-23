import './mip-tabs.less'

const {CustomElement, util: {rect}, viewer} = MIP

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
    const {firstElementChild, childNodes} = this.element

    if (firstElementChild && firstElementChild.classList.contains('mip-tabs')) {
      return
    }

    const {initialTab} = this.props
    const fragment = document.createDocumentFragment()

    childNodes.forEach(child => fragment.appendChild(child.cloneNode(true)))

    this.element.innerHTML = '<div class="mip-tabs">' +
      '<div class="mip-tabs-label-wrap">' +
      '<div class="mip-tabs-label-container"></div>' +
      '</div>' +
      '<div class="mip-tabs-content-wrap">' +
      '</div>' +
      '</div>'
    const content = this.element.querySelector('.mip-tabs-content-wrap')

    content.appendChild(fragment)

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
    line.style.transform = `translate3d(${offsetX}px, 0, 0)`

    // 容器宽度
    const translateX = -rect.getElementRect(this.element).width * index
    this.element.querySelector('.mip-tabs-content-wrap').style.transform = `translate3d(${translateX}px, 0, 0)`
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
