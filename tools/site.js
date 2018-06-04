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
    path: path.join(comp, `${comp}.js`)
  }
})

const componentListDom = components.map(comp => `<li><a href="${comp.path}" target="_blank">${comp.name}</a></li>`)

const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>MIP 2.0 组件列表</title>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0">
</head>
<body>
    <h1>MIP 组件列表 <a href="examples/">查看示例</a></h1>
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
