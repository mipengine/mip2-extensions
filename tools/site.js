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
glob.sync('components/mip-*/example/*.*', {realpath: true})
  .forEach(file => {
    let compName = file.match(/components\/(mip-.+)\/example/)[1]
    fs.copySync(file, path.join(dist, 'examples', compName, path.basename(file)))
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
  return `<li><b>${comp.name}</b><a href="${comp.sourcePath}" target="_blank">源码</a>${exampleLinksDom}</li>`
})

const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>MIP 2.0 组件列表</title>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0">
    <style>a{margin-left: 10px;}</style>
</head>
<body>
    <h1>MIP 组件列表</h1>
    <ul>
        ${componentListDom.join('')}
    </ul>
</body>
</html>
`

// generate html file
fs.writeFileSync(path.join(dist, 'index.html'), htmlTemplate)

console.log('Static page generated!')
