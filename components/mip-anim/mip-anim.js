const { CustomElement, util } = MIP

export default class MipAnim extends CustomElement {
  constructor (...args) {
    super(...args)
    this.src = this.element.getAttribute('src') || ''
    this.alt = this.element.getAttribute('alt') || ''
  }

  firstInviewCallback () {
    let el = this.element
    let placeholderImg = el.querySelector('mip-img')
    if (this.src) {
      // 加载gif图
      promiseIf({ src: this.src, alt: this.alt }).then(imageObj => {
        // 隐藏默认图
        if (placeholderImg) {
          util.css(placeholderImg, { display: 'none' })
        }
        el.appendChild(imageObj)
      })
    }

    // 判断图片是否加载成功
    function promiseIf (data) {
      return new Promise(resolve => {
        let image = document.createElement('img')
        image.src = data.src
        image.alt = data.alt
        image.onload = () => {
          resolve(image)
        }
      })
    }
  }
}
