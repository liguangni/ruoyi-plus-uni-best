<p align="center">
  <a href="https://gitee.com/liguangni/ruoyi-plus-uni-best">
    <img width="160" src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/logo.png">
  </a>
</p>
<h1 align="center">
  <a href="https://gitee.com/liguangni/ruoyi-plus-uni-best" target="_blank" style='color: red'>Ruoyi-Plus-Uni-Best</a>
</h1>
<div align="center">
<p>基于unibest构建，适配Ruoyi-Vue-Plus/Ruoyi-Cloud-Plus的uniapp快速开发模板</p>
</div>



## 项目介绍

- **后台适配**

本项目基于狮子大佬的`RuoYi-Cloud-Plus` /`RuoYi-Vue-Plus`项目开发适配。

> 分支关系

| 本项目 | Plus后台分支 |
| ------ | ------------ |
| 6.X    | 6.X          |

`RuoYi-Cloud-Plus` /`RuoYi-Vue-Plus` - 真正面向企业级的应用框架，组件化 模块化 轻耦合 高扩展 针对企业痛点 业界一流技术栈

开源地址：[RuoYi-Cloud-Plus](https://gitee.com/dromara/RuoYi-Cloud-Plus) | [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus)

项目文档：[Plus Doc](https://plus-doc.dromara.org/#/)

- **前端**

本项目基于unibest二次修改构建，对部分代码及逻辑进行微调

`unibest` —— 最好的 `uniapp` 开发模板，由 `uniapp` + `Vue3` + `Ts` + `Vite5` + `UnoCss` + `wot-ui` + `z-paging` 构成，使用了最新的前端技术栈，无需依靠 `HBuilderX`，通过命令行方式运行 `web`、`小程序` 和 `App`（编辑器推荐 `VSCode`，可选 `webstorm`）。

`unibest` 内置了 `约定式路由`、`layout布局`、`请求封装`、`请求拦截`、`登录拦截`、`UnoCSS`、`i18n多语言` 等基础功能，提供了 `代码提示`、`自动格式化`、`统一配置`、`代码片段` 等辅助功能，让你编写 `uniapp` 拥有 `best` 体验 （ `unibest 的由来`）。

开源地址：[Gitee](https://gitee.com/feige996/unibest) | [Github](https://github.com/feige996/unibest)

项目文档：[unibest文档](https://unibest.tech/)

- **UI选型**

本项目UI默认集成`Sard-Uniapp`

开源地址：[Gitee](https://gitee.com/sutras/sard-uniapp) | [Github](https://github.com/sutras/sard-uniapp)

项目文档：[Sard Uniapp文档](https://sard.wzt.zone/)

项目基础模块页面(首页\登录页\个人中心\工作台)在代码编写时, 已尽量使用基础组件来实现，未依赖第三方UI框架, 尽可能的方便快速迁移
PS: 后续复杂功能,可能就要使用UI框架了

可根据自身及项目情况自行更换其他UI框架
(UI替换请参考Unibest文档: [UI库替换篇](https://unibest.tech/base/7-ui "UI库替换篇"))




---


## 平台兼容性

| H5   | IOS  | 安卓 | 微信小程序 | 字节小程序 | 快手小程序 | 支付宝小程序 | 钉钉小程序 | 百度小程序 |
| ---- | ---- | ---- | ---------- | ---------- | ---------- | ------------ | ---------- | ---------- |
| √    | √    | √    | √          | √          | √          | √            | √          | √          |

注意每种 `UI框架` 支持的平台有所不同，详情请看各 `UI框架` 的官网，也可以看 `unibest` 文档。


## ⚙️ 环境

- node>=18
- pnpm>=7.30
- Vue Official>=2.1.10
- TypeScript>=5.0

## 新版分支 

- main == base
- base --> base-i18n
- base-login --> base-login-i18n

## &#x1F4C2; 快速开始

执行 `pnpm i` 安装依赖
执行 `pnpm dev` 运行 `H5`
执行 `pnpm dev:mp` 运行 `微信小程序`

## 📦 运行（支持热更新）

- web平台： `pnpm dev:h5`, 然后打开 [http://localhost:9000/](http://localhost:9000/)。
- weixin平台：`pnpm dev:mp` 然后打开微信开发者工具，导入本地文件夹，选择本项目的`dist/dev/mp-weixin` 文件。
- APP平台：`pnpm dev:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/dev/app` 文件夹，选择运行到模拟器(开发时优先使用)，或者运行的安卓/ios基座。(如果是 `安卓` 和 `鸿蒙` 平台，则不用这个方式，可以把整个unibest项目导入到hbx，通过hbx的菜单来运行到对应的平台。)

## 🔗 发布

- web平台： `pnpm build:h5`，打包后的文件在 `dist/build/h5`，可以放到web服务器，如nginx运行。如果最终不是放在根目录，可以在 `manifest.config.ts` 文件的 `h5.router.base` 属性进行修改。
- weixin平台：`pnpm build:mp`, 打包后的文件在 `dist/build/mp-weixin`，然后通过微信开发者工具导入，并点击右上角的“上传”按钮进行上传。
- APP平台：`pnpm build:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/build/app` 文件夹，选择发行 - APP云打包。(如果是 `安卓` 和 `鸿蒙` 平台，则不用这个方式，可以把整个unibest项目导入到hbx，通过hbx的菜单来发行到对应的平台。)

## 📄 License

[MIT](https://opensource.org/license/mit/)

Copyright (c) 2026 李广妮

## 捐赠

<p align='center'>
<img alt="wechat" src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/wechat.jpg" height="330" style="display:inline-block; height:330px;">
<img alt="alipay" src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/alipay.jpg" height="330" style="display:inline-block; height:330px; margin-left:10px;">
</p>



## 项目运行截图

<table align="center">
  <tr>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/lgoin.png" alt="登录页" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">登录页</b>
    </td>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/index.png" alt="首页" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">首页</b>
    </td>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/work.png" alt="工作台" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">工作台</b>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/me.png" alt="我的" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">我的</b>
    </td>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/profile.png" alt="个人信息" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">个人信息</b>
    </td>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/setting.png" alt="应用设置" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">应用设置</b>
    </td>
  </tr>
</table>