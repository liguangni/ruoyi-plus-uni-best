<p align="center">
  <a href="https://gitee.com/ry-group/ruoyi-plus-uni-best">
    <img width="160" src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/logo.png">
  </a>
</p>
<h1 align="center">
  <a href="https://gitee.com/ry-group/ruoyi-plus-uni-best" target="_blank" style='color: red'>Ruoyi-Plus-Uni-Best</a>
</h1>

<div align="center">
基于 <a href="https://unibest.tech/" target="_blank">unibest</a> 构建，深度适配 <a href="https://gitee.com/dromara/RuoYi-Cloud-Plus" target="_blank">RuoYi-Cloud-Plus</a> / <a href="https://gitee.com/dromara/RuoYi-Vue-Plus" target="_blank">RuoYi-Vue-Plus</a> 的 UniApp 快速开发模板
</div>
<p align="center">支持工作流管理功能</p>
<p align="center">
  <strong>🚀 开箱即用 · 📱 多端兼容 · 🎨 灵活扩展 · ⚡ 高性能</strong>
</p>



## 📖 项目介绍

- **🎯 深度适配 RuoYi-Plus**
  
  完美对接 RuoYi-Cloud-Plus / RuoYi-Vue-Plus 后端架构，提供统一的前后端开发体验

- **⚡ 基于 unibest 最佳实践**

  继承 unibest 的优秀架构设计，集成 Vite + Vue3 + TypeScript + UnoCSS 等现代前端技术栈

- **📱 多端编译支持**

  一次开发，多端运行，支持 H5、App（iOS/Android/鸿蒙）及微信小程序等各大主流小程序平台
  


## 🌿 分支说明

本项目采用与 RuoYi-Plus 主版本对齐的分支管理策略：

| 本项目分支 | Plus 后台分支 | 分支说明                                           |
| :--------: | :-----------: | -------------------------------------------------- |
|   6.X    |     6.X    | 默认分支, 包含基础功能 + 工作流模块 |


> 注意: 
> 1. 其他分支(如dev、master、feature等) 为开发测试分支,代码可能未完全测试, 不建议在生产环境中使用。
> 2. 如需精简工作流等模块,请参考 [项目 WIKI](https://gitee.com/ry-group/ruoyi-plus-uni-best/wikis/Home)



## 📚 项目文档

  本项目基于 [unibest](https://unibest.tech/) 构建，并运行在 [uni-app](https://uniapp.dcloud.net.cn/) 框架之上。
  开发过程中遇到脚手架、构建配置、路由等通用问题，**请优先查阅官方文档**，以获取最权威、最及时的说明

  - **unibest 官方文档**：<https://unibest.tech/>
  - **uni-app 官方文档**：<https://uniapp.dcloud.net.cn/>
  - **项目 WIKI**：<https://gitee.com/ry-group/ruoyi-plus-uni-best/wikis/Home>

  如有任何问题或建议，欢迎提交 Pull Request 或 提交 Issue。我会尽快回复并解决。


## 🎨 UI 框架选型说明
1. **基础模块：原生实现，零依赖**

   项目的核心基础页面（如首页、登录页、个人中心、工作台等）均采用原生基础组件构建, 未使用任何第三方 UI 库。

   旨在最大程度地降低UI耦合度，保持代码的纯净与轻量，方便后续的快速迁移与定制化开发。

2. **默认集成：Sard Uniapp**

   项目已默认集成 Sard Uniapp 组件库，但当前处于未使用状态。

   预留能力：该库作为底层能力储备，可用于后续的复杂业务场景（如~~工作流~~?系统管理?）。

   > update 2026-08-01: 工作流模块功能已基本搭建完成, 全部页面均采用原生组件实现, 未使用第三方组件库。

3. **灵活扩展：支持自定义替换**

   开发者可根据实际业务需求或个人技术偏好，自由集成或更换其他 UI 框架。

   操作指引：如需进行 UI 库替换，请参考 Unibest 官方文档：[UI库替换篇](https://unibest.tech/base/7-ui "UI库替换篇")。

4. **部分页面/代码的实现借鉴了优秀的开源作品**

   衷心感谢各位开发者的无私奉献。若有任何版权问题，敬请告知，我将立即处理。
   
   

## 🌐 平台兼容性

| H5   | IOS  | 安卓 | 微信小程序 | 字节小程序 | 快手小程序 | 支付宝小程序 | 钉钉小程序 | 百度小程序 |
| ---- | ---- | ---- | ---------- | ---------- | ---------- | ------------ | ---------- | ---------- |
| √    | √    | √    | √          | √          | √          | √            | √          | √          |

>  注意:
>
> 1. 每种UI框架 支持的平台有所不同，详情请看各UI框架 的官网，也可以看 unibest文档。
> 2. 这仅仅是unibest给出的说明，部分平台未进行测试，请开发者自行测试


## ⚙️ 环境

- node>=18
- pnpm>=7.30
- Vue Official>=2.1.10
- TypeScript>=5.0

## 🚀 快速开始

1️⃣ 克隆bash
```bash
# 克隆项目到本地
git clone https://gitee.com/ry-group/ruoyi-plus-uni-best.git

# 进入项目目录
cd ruoyi-plus-uni-best
```
2️⃣依赖安装
```bash
# 使用 pnpm 安装依赖（推荐使用镜像源加速）
pnpm install

# 或使用国内镜像源
pnpm install --registry=https://registry.npmmirror.com
```
3️⃣ 配置后端接口地址

修改项目中的接口配置文件（.env 相关文件），将后端地址修改为您的 RuoYi-Plus 服务地址。

4️⃣ 启动开发

```bash
# 启动 H5 开发环境
pnpm dev

# 或指定平台启动
pnpm dev:h5        # H5 平台
pnpm dev:mp-weixin # 微信小程序
pnpm dev:app       # App
```

## 📦 运行（支持热更新）

- web平台： `pnpm dev:h5`, 然后打开 [http://localhost:9000/](http://localhost:9000/)。
- weixin平台：`pnpm dev:mp` 然后打开微信开发者工具，导入本地文件夹，选择本项目的`dist/dev/mp-weixin` 文件。
- APP平台：`pnpm dev:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/dev/app` 文件夹，选择运行到模拟器(开发时优先使用)，或者运行的安卓/ios基座。(如果是 `安卓` 和 `鸿蒙` 平台，则不用这个方式，可以把整个unibest项目导入到hbx，通过hbx的菜单来运行到对应的平台。)

## 🔗 发布

- web平台： `pnpm build:h5`，打包后的文件在 `dist/build/h5`，可以放到web服务器，如nginx运行。如果最终不是放在根目录，可以在 `manifest.config.ts` 文件的 `h5.router.base` 属性进行修改。
- weixin平台：`pnpm build:mp`, 打包后的文件在 `dist/build/mp-weixin`，然后通过微信开发者工具导入，并点击右上角的“上传”按钮进行上传。
- APP平台：`pnpm build:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/build/app` 文件夹，选择发行 - APP云打包。(如果是 `安卓` 和 `鸿蒙` 平台，则不用这个方式，可以把整个unibest项目导入到hbx，通过hbx的菜单来发行到对应的平台。)

## ☕ 捐赠支持

如果这个项目对您有帮助，欢迎请作者喝杯咖啡 ☕

<p align="center">
  <strong>感谢您的支持与鼓励！🙏</strong>
</p>
<p align="center">
  <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/wechat.jpg" alt="WeChat Pay" width="250"  />
  <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/alipay.jpg" alt="Alipay" width="250"  />
</p>



## 项目运行截图

### 基础功能
<table>
  <tr>
    <td align="center" >
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/login.png" alt="登录页" width="200"   />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/index.png" alt="首页" width="200"  />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/work.png" alt="工作台" width="200"  />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/me.png" alt="我的" width="200"  />
    </td>
  </tr>
  <tr>
    <td align="center">登录页</td>
    <td align="center">首页</td>
    <td align="center">工作台</td>
    <td align="center">我的</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/profile.png" alt="个人信息" width="200" />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/setting.png" alt="应用设置" width="200"  />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/about.png" alt="关于" width="200" />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/help.png" alt="帮助中心" width="200" />
    </td>
  </tr>
  <tr>
    <td align="center">个人信息</td>
    <td align="center">应用设置</td>
    <td align="center">关于</td>
    <td align="center">帮助中心</td>
  </tr>
</table>

### 工作流功能
<table>
  <tr>
    <td align="center" >
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-list.png" alt="审批列表" width="200"   />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-detail-form.png" alt="审批详情-表单" width="200"  />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-detail-history.png" alt="审批详情-审批记录" width="200"  />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-detail-flowchart.png" alt="流程详情-流程图" width="200"  />
    </td>
  </tr>
  <tr>
    <td align="center">审批列表</td>
    <td align="center">审批详情-表单</td>
    <td align="center">审批详情-审批记录</td>
    <td align="center">流程详情-流程图</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-process.png" alt="流程办理-通过" width="200" />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-revoke.png" alt="流程办理-驳回" width="200"  />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-def-select.png" alt="选择流程定义" width="200" />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-user-select.png" alt="选择审批人" width="200" />
    </td>
  </tr>
  <tr>
    <td align="center">流程办理-通过</td>
    <td align="center">流程办理-驳回</td>
    <td align="center">选择流程定义</td>
    <td align="center">选择审批人</td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-start.png" alt="流程发起-弹窗" width="200" />
    </td>
    <td align="center">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/workflow-start-flow.png" alt="流程发起-请假" width="200"  />
    </td>
    <td align="center">
    </td>
    <td align="center">
    </td>
  </tr>
  <tr>
    <td align="center">流程发起-弹窗</td>
    <td align="center">流程发起-请假</td>
    <td align="center"></td>
    <td align="center"></td>
  </tr>
</table>


---

<p align="center">
  <strong>Made with ❤️ by <a href="https://gitee.com/liguangni">liguangni</a></strong>
</p>

<p align="center">
  <a href="https://gitee.com/ry-group/ruoyi-plus-uni-best/issues">报告 Bug</a>
  ·
  <a href="https://gitee.com/ry-group/ruoyi-plus-uni-best/issues">请求特性</a>
</p