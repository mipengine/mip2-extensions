window.MIP.setData({
  test: 'test info by setting within this script'
})
console.log(window.MIP.getData('test'))
let div = document.createElement('div')
div.setAttribute('class', 'active')
document.body.appendChild(div)
