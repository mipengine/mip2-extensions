export default class MIPOtherAd extends MIP.CustomElement {
  // 不支持不是异步加载的广告
  build () {
    let el = this.element
    let type = el.getAttribute('type') || ''
    let src = el.getAttribute('src') || ''
    let sogouW = el.getAttribute('w') || ''
    let sogouH = el.getAttribute('h') || ''
    let script = el.getAttribute('script') || ''
    let innerScriptNode = document.createElement('script')
    let adScriptLoaderNode = document.createElement('script')
    let container = document.createElement('div')
    container.style.minHeight = '50px'
    let scriptHtml = ''
    if (type === 'default') {
      // 适合只有src属性的单条script
      adScriptLoaderNode.src = src
    } else if (type === 'smua') {
      // 适合 <script type="text/javascript" smua="d=m&s=b&u=u3687389&h=106" src="//www.smucdn.com/smu0/o.js"></script>
      adScriptLoaderNode.src = '//www.smucdn.com/smu0/o.js'
      adScriptLoaderNode.smua = 'd=m&s=b&u=u3594595&h=330'
    } else if (type === 'sogou') {
      // 适合异步的sogou广告
      container.id = `sogou_wap_${src}`
      scriptHtml = `var sogou_div = document.getElementById("sogou_wap_${src}"); window.sogou_un = window.sogou_un || []; window.sogou_un.push({id: ${src},ele:sogou_div});`
      adScriptLoaderNode.src = script || '//theta.sogoucdn.com/wap/js/aw.js'
    } else if (type === 'sogou_auto') {
      // 适合需要自定义配置w和h的搜狗广告
      container.id = `sogou_wap_${src}`
      scriptHtml = `var sogou_div = document.getElementById("sogou_wap_${src}"); window.sogou_un = window.sogou_un || []; window.sogou_un.push({id: ${src},ele:sogou_div,w:${sogouW},h:${sogouH}});`
      adScriptLoaderNode.src = script || '//theta.sogoucdn.com/wap/js/aw.js'
    }
    innerScriptNode.innerHTML = scriptHtml
    // adScriptLoaderNode.onload = () => el.customElement.applyFillContent(container, true)
    container.appendChild(innerScriptNode)
    container.appendChild(adScriptLoaderNode)
    el.appendChild(container)
  }
}
