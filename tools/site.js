/**
 * @file generate staic page of built components
 * @author tracy (qiushidev@gmail.com)
 */

'use strict'

const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const dist = path.resolve(__dirname, '../dist')

const components = fs.readdirSync(dist).map(comp => {
  return {
    name: comp,
    sourcePath: path.join(comp, `${comp}.js`),
    examplePath: path.join('examples', `${comp}.html`)
  }
})

const componentListDom = components.map(comp =>
  `<li><b>${comp.name}</b><a href="${comp.sourcePath}" target="_blank">源码</a><a href="${comp.examplePath}" target="_blank">示例</a></li>`
)

const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>MIP 2.0 组件列表</title>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0">
    <style>a{margin-left:10px;}</style>
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

// copy example pages
glob.sync('components/**/example/*.html', {realpath: true})
  .forEach(file => {
    fs.copySync(file, path.join(dist, 'examples', path.basename(file)))
  })

console.log('Static page generated!')
