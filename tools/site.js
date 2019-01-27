/**
 * @file generate staic page of built components
 * @author tracy (qiushidev@gmail.com)
 */

'use strict'

const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const dist = path.resolve(__dirname, '../dist')
const examplesPath = path.resolve(dist, 'examples')

// copy example files from /components dir to dist/examples
glob.sync('components/mip-*', {realpath: true})
  .forEach(cPath => {
    let compName = cPath.match(/components\/(mip-.+)/)[1]
    fs.copySync(path.join(cPath, 'example'), path.join(dist, 'examples', compName))
  })

const components = fs.readdirSync(examplesPath).map(comp => {
  // example dir may contains multiple pages
  let examplePaths = []
  glob.sync('*.html', {cwd: path.resolve(examplesPath, comp)})
    .forEach(file => {
      let htmlEgPath = path.join('examples', `${comp}/${file}`)
      examplePaths.push(htmlEgPath)
    })

  return {
    name: comp,
    sourcePath: path.join(comp, `${comp}.js`),
    examplePaths
  }
})

const componentListDom = components.map(comp => {
  const exampleLinksDom = comp.examplePaths.map(path => `<a href="${path}" target="_blank">示例</a>`).join('')

  const standAloneEg = `${exampleLinksDom}`
  const sfEg = `<span class="sf-links"><b>SF Links:</b>${exampleLinksDom}</span>`

  return `<li><h3>${comp.name}</h3><a href="${comp.sourcePath}" target="_blank">源码</a></br></br>${standAloneEg}${sfEg}`
})

const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>MIP 2.0 组件列表</title>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0">
    <style>a, b{margin-left: 10px;}h1{padding: 20px;}</style>
</head>
<body>
    <h1>MIP 组件列表</h1>
    <ul>
        ${componentListDom.join('')}
    </ul>
    <script>
      window.onload = function () {
        var sfLinks = document.querySelectorAll('.sf-links a');
        var sfLinksArray = Array.prototype.slice.call(sfLinks);

        sfLinksArray.forEach(function (linkDom) {
          if (linkDom.getAttribute('href')) {
            var prefix = 'https://www.mipengine.org/validator/preview/s?url=';
            var host = window.location.href;

            linkDom.href = prefix + host + linkDom.getAttribute('href');
          }
        });
      }
    </script>
</body>
</html>
`

// generate html file
fs.writeFileSync(path.join(dist, 'index.html'), htmlTemplate)

console.log('Static page generated!')
