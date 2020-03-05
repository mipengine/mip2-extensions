/**
 * @file mip-accordion
 * @author nxl(2779523120@qq.com)
 */
const {
  CustomElement
} = MIP

export default class MIPVideoDemo extends CustomElement {
  build () {
    let element = document.getElementsByClassName('open')[0]
    let element2 = document.getElementById('video')
    let src = element2.getAttribute('src')
    let t1 = element2.hasAttribute('poster')
    // let html = '<video src="' + src + '"></video>'
    let html = 'src="' + src + '"'
    if (t1 === true) {
      let poster = element2.getAttribute('poster')
      // html = '<video poster="' + poster + '" src="' + src + '"></video>'
      html = 'poster="' + poster + '" src="' + src + '"'
    }

    let t2 = element2.hasAttribute('controls')
    if (t2 === true) {
      // html = '<video poster="' + poster + '" src="' + src + '" controls></video>'
      html = html + 'controls'
    }
    // element2.innerHTML = html;
    element2.innerHTML = '<video ' + html + '></video>'
    element.addEventListener('click', function () {
      element.style.display = 'none'
      element2.getElementsByTagName('video')[0].play()
      element2.getElementsByTagName('video')[0].setAttribute('controls', 'controls')
    })
    let back = element2.hasAttribute('back')
    if (back === true) {
      element2.getElementsByTagName('video')[0].addEventListener('ended', function () {
        element.style.display = 'block'
        element2.getElementsByTagName('video')[0].removeAttribute('controls')
        let videoSrc = element2.getElementsByTagName('video')[0].currentSrc
        element2.getElementsByTagName('video')[0].src = ''
        element2.getElementsByTagName('video')[0].src = videoSrc
      })
    }
  }
}
