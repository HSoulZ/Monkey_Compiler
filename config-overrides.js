module.exports = function override(config, env){
    config.module.rules.push({
        test: /\.worker\.js$/,
        use: {loader: 'worker-loader'}
    })
    return config
}
/*
* 本文件作用是：让webpack在整合代码时，把文件名后缀为.worker.js的文件也
* 进行整合， 整合的方式是调用worker-loader（需要安装）来进行的，使用
* worker-loader才能在reactjs框架下使用web worker
*/