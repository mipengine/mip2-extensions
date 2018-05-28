/**
 * @file build all components
 * @author tracy(qiushidev@gmail.com)
 */

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');

const extensionsPath = path.resolve(__dirname, '../components');

if (!fs.pathExistsSync(extensionsPath)) {
    console.log('ERR: components dir does not exist! ');
    return;
}

const build = function () {
    const publicPath = 'https://bos.nj.bpc.baidu.com/assets/mip/projects/common';

    execa('mip2', ['build', '--asset', publicPath])
    .then(res => {
        console.log('All components has been build successfully!');
    });
};

console.log('Building... Please wait');

build();
