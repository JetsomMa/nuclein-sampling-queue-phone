// npm run build map-view
// docker build  --platform=linux/x86_64 -f .cicd/Dockerfile -t 129.28.46.148:5000/prod-space-console-map-view:1.5.80 .
// docker push 129.28.46.148:5000/prod-space-console-map-view:1.5.80

const { execSync } = require('child_process')
const colors = require('colors-console')
const packageJsonConfig = require('./package.json')

let status = true

console.error(colors('blue',`----------生产环境：准备发布${packageJsonConfig.version}----------`))
console.error(colors('blue',`----------开始编译----------`))
runCmd("npm run build map-view")
console.error(colors('blue',`----------开始打包镜像----------`))
runCmd(`docker build  --platform=linux/x86_64 -f .cicd/Dockerfile -t 129.28.46.148:5000/prod-space-console-map-view:${packageJsonConfig.version} .`)
console.error(colors('blue',`----------开始上传镜像----------`))
runCmd(`docker push 129.28.46.148:5000/prod-space-console-map-view:${packageJsonConfig.version}`)
console.error(colors('blue',`----------生产环境：发布完成【129.28.46.148:5000/prod-space-console-map-view:${packageJsonConfig.version}】----------`))

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