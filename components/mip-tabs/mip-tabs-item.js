import './mip-tabs-item.less'

const {CustomElement} = MIP

export default class MIPTabsItem extends CustomElement {
  static get observedAttributes () {
    return ['is-active']
  }

  build () {
    const {firstElementChild, childNodes} = this.element
    if (firstElementChild && firstElementChild.classList.contains('tabs-item')) {
      return
    }
    const fragment = document.createDocumentFragment()

    childNodes.forEach(child => fragment.appendChild(child.cloneNode(true)))

    this.element.innerHTML = '<div class="tabs-item"></div>'
    this.element.querySelector('.tabs-item').appendChild(fragment)

    this.updateItem()
  }

  attributeChangedCallback (name) {
    if (name === 'is-active') {
      const {isActive} = this.props

      if (isActive) {
        const nestedTabs = this.element.querySelectorAll('mip-tabs')

        nestedTabs.length && setTimeout(() => {
          nestedTabs.forEach(tabs => tabs.setAttribute('reset-tab', 'true'))
        }, 300)
      }
      this.updateItem()
    }
  }

  updateItem () {
    const {isActive} = this.props
    const item = this.element.querySelector('.tabs-item')

    if (isActive) {
      item.classList.add('active')
      item.style.display = null
    } else {
      item.classList.remove('active')
      item.style.display = 'none'
    }
  }
}

MIPTabsItem.props = {
  isActive: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
}
