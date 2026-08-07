import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import enquirer from 'enquirer'
import pc from 'picocolors'

const envPath = path.resolve(process.cwd(), 'env', '.env')
// 获取是否只是测试运行
const dryRun = process.argv.includes('--dry-run')

/**
 * 将语义化版本号根据传递的类型进行递增
 * @param {string} version 当前版本号，如 '1.1.0'
 * @param {string} type 升级类型: 'patch' | 'minor' | 'major' | 'none'
 * @returns {string} 新的版本号
 */
function bumpVersionName(version, type) {
  if (type === 'none')
    return version

  const parts = version.split('.')
  let major = Number.parseInt(parts[0] || '0', 10)
  let minor = Number.parseInt(parts[1] || '0', 10)
  let patch = Number.parseInt(parts[2] || '0', 10)

  switch (type) {
    case 'major':
      major += 1
      minor = 0
      patch = 0
      break
    case 'minor':
      minor += 1
      patch = 0
      break
    case 'patch':
      patch += 1
      break
  }
  return `${major}.${minor}.${patch}`
}

async function run() {
  if (!fs.existsSync(envPath)) {
    console.error(pc.red(`✖ [bump-version] 未找到 env 文件: ${envPath}`))
    process.exit(1)
  }

  const source = fs.readFileSync(envPath, 'utf8')

  // 匹配 VITE_APP_VERSION_CODE 和 VITE_APP_VERSION 的正则表达式
  const versionCodeRegex = /^(VITE_APP_VERSION_CODE\s*=\s*['"]?)(\d+)(['"]?)/m
  const versionNameRegex = /^(VITE_APP_VERSION\s*=\s*['"]?)([\d.]+)(['"]?)/m

  const codeMatch = source.match(versionCodeRegex)
  const nameMatch = source.match(versionNameRegex)

  if (!codeMatch || !nameMatch) {
    console.error(pc.red('✖ [bump-version] 未在 env 文件中找到合法的 VITE_APP_VERSION_CODE 或 VITE_APP_VERSION'))
    process.exit(1)
  }

  const currentVersionCode = Number.parseInt(codeMatch[2], 10)
  const currentVersionName = nameMatch[2]
  const nextVersionCode = String(currentVersionCode + 1)

  // 1. 检查命令行参数是否有 --type
  const typeArgMatch = process.argv.find(arg => arg.startsWith('--type='))
  let bumpType = typeArgMatch ? typeArgMatch.split('=')[1] : null

  // 2. 环境判定：如果不在交互终端或者是CI环境，但是没有指定类型，则默认只升级 versionCode
  const isInteractive = process.stdout.isTTY && !process.env.CI

  if (!bumpType) {
    if (!isInteractive) {
      console.log(pc.yellow('⚠ [bump-version] 非交互环境且未指定参数，默认不修改 versionName'))
      bumpType = 'none'
    }
    else {
      // 3. 在终端交互式询问用户怎么处理 versionName
      console.log('')
      console.log(pc.cyan('📦 准备发布新版本'))
      console.log(`${pc.gray('当前版本:')} ${pc.bold(currentVersionName)} ${pc.gray(`(v${currentVersionCode})`)}`)
      console.log('')

      const response = await enquirer.prompt({
        type: 'select',
        name: 'selectedType',
        message: '请选择如何升级版本名称 (VITE_APP_VERSION)？',
        pointer: pc.cyan('❯'),
        choices: [
          {
            message: `${pc.bold('修复')} (Patch)  ${pc.gray(currentVersionName)} → ${pc.green(bumpVersionName(currentVersionName, 'patch'))}`,
            name: 'patch',
            hint: pc.gray('修复Bug、极小的代码安全变动'),
          },
          {
            message: `${pc.bold('特性')} (Minor)  ${pc.gray(currentVersionName)} → ${pc.cyan(bumpVersionName(currentVersionName, 'minor'))}`,
            name: 'minor',
            hint: pc.gray('新增功能、向下兼容的API更新'),
          },
          {
            message: `${pc.bold('重大')} (Major)  ${pc.gray(currentVersionName)} → ${pc.magenta(bumpVersionName(currentVersionName, 'major'))}`,
            name: 'major',
            hint: pc.gray('重大重构、不兼容的API修改'),
          },
          {
            message: `${pc.bold('仅Code')} (None)  ${pc.gray(`保持 ${currentVersionName}`)}`,
            name: 'none',
            hint: pc.gray('保持名称不变，仅升级构建号(VITE_APP_VERSION_CODE)'),
          },
          {
            message: `${pc.bold('取消')} (Cancel) ${pc.gray('完全不升级版本')}`,
            name: 'cancel',
            hint: pc.gray('跳过版本修改，直接进入后续打包流程'),
          },
        ],
        // 如果用户按 ctrl+c 退出
        onCancel: () => {
          console.log(pc.red('✖ 取消操作并退出编译'))
          process.exit(1)
        },
      })
      bumpType = response.selectedType

      // 用户选择了完全不升级
      if (bumpType === 'cancel') {
        console.log('')
        console.log(pc.green('✔ 已跳过版本升级操作'))
        console.log('')
        process.exit(0)
      }
    }
  }

  // 4. 根据类型计算下一代版本并进行替换计算
  const nextVersionName = bumpVersionName(currentVersionName, bumpType)

  let updated = source.replace(versionCodeRegex, `$1${nextVersionCode}$3`)
  updated = updated.replace(versionNameRegex, `$1${nextVersionName}$3`)

  // 5. 回填文件内容
  if (!dryRun) {
    fs.writeFileSync(envPath, updated, 'utf8')
  }

  // 美化成功提示输出
  console.log('')
  console.log(pc.green(`✔ ${dryRun ? '(模拟运行) ' : ''}版本更新成功！`))

  if (bumpType !== 'none') {
    console.log(`  ${pc.gray('VITE_APP_VERSION:')} ${pc.strikethrough(pc.gray(currentVersionName))} → ${pc.bold(pc.green(nextVersionName))}`)
  }
  else {
    console.log(`  ${pc.gray('VITE_APP_VERSION:')} ${pc.dim(currentVersionName)} (未更改)`)
  }

  console.log(`  ${pc.gray('VITE_APP_VERSION_CODE:')} ${pc.strikethrough(pc.gray(currentVersionCode))} → ${pc.bold(pc.green(nextVersionCode))}`)
  console.log('')
}

run().catch((err) => {
  console.error(pc.red('✖ [bump-version] 发生错误:'), err)
  process.exit(1)
})
