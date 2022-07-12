const { execSync } = require('child_process')
const colors = require('colors-console')
const packageJsonConfig = require('./package.json')

let status = true

console.error(colors('blue',`----------测试环境：准备发布${packageJsonConfig.version}----------`))
console.error(colors('blue',`----------开始编译----------`))
runCmd("npm run buildtest")
if(status){
    console.error(colors('blue',`----------开始打包镜像----------`))
    runCmd(`docker build  --platform=linux/x86_64 -f .cicd/Dockerfile -t 129.28.46.148:5000/nuclein-sampling-queue-phone:${packageJsonConfig.version} .`)
} else {
    console.error(colors('red',`----------项目编译失败，发布终止！----------`))
}
if(status){
    console.error(colors('blue',`----------开始上传镜像----------`))
    runCmd(`docker push 129.28.46.148:5000/nuclein-sampling-queue-phone:${packageJsonConfig.version}`)
    console.error(colors('blue',`----------测试环境：发布完成【129.28.46.148:5000/nuclein-sampling-queue-phone:${packageJsonConfig.version}】----------`))
} else {
    console.error(colors('red',`----------项目打包镜像失败，发布终止！----------`))
}

function runCmd(cmd){
    execSync(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error){
            status = false
            console.error(colors('red', `执行命令[${cmd}]发生异常`))
        } else {
            console.error(colors('yellow',`${stderr}`))
            console.error(colors('blue',`${stdout}`))
        }
    })
}