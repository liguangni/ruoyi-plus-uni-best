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

### 1. 本项目基于狮子大佬的RuoYi-Cloud-Plus/RuoYi-Vue-Plus项目开发适配

| 本项目分支 | 分支说明                                        | Plus后台分支 |
| ---------- | ----------------------------------------------- | ------------ |
| 6.X        | 只包含基础功能(首页\登录页\个人中心\工作台框架) | 6.X          |


> - RuoYi-Cloud-Plus` /`RuoYi-Vue-Plus
>   开源地址：[RuoYi-Cloud-Plus](https://gitee.com/dromara/RuoYi-Cloud-Plus) | [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus)
>   项目文档：[Plus Doc](https://plus-doc.dromara.org/#/)

### 2. 本项目基于unibest二次修改构建，对部分代码及逻辑进行微调

> - unibest 简介
>
>   开源地址：[Gitee](https://gitee.com/feige996/unibest) | [Github](https://github.com/feige996/unibest)
>
>   项目文档：[unibest文档](https://unibest.tech/)

## UI 框架选型说明
### 1. 基础模块：原生实现，零依赖
项目的核心基础页面（如首页、登录页、个人中心、工作台等）在开发时未使用任何第三方 UI 库，均采用原生基础组件构建。

旨在保持代码的纯净与轻量，最大程度地降低耦合度，方便后续的快速迁移与定制化开发。

### 2. 默认集成：Wot UI (V2)
项目已默认集成 Wot UI V2 组件库，但当前处于未使用状态。

预留能力：该库作为底层能力储备，用于后续遇到复杂业务场景（如工作流?）。

### 3. 灵活扩展：支持自定义替换
开发者可根据实际业务需求或个人技术偏好，自由集成或更换其他 UI 框架。

操作指引：如需进行 UI 库替换，请参考 Unibest 官方文档：[UI库替换篇](https://unibest.tech/base/7-ui "UI库替换篇")。

---


## 平台兼容性

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

## 捐赠

<p align='center'>
<img alt="wechat" src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/wechat.jpg" height="330" style="display:inline-block; height:330px;">
<img alt="alipay" src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/alipay.jpg" height="330" style="display:inline-block; height:330px; margin-left:10px;">
</p>




## 项目运行截图

<table align="center">
  <tr>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/login.png" alt="登录页" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
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
  <tr>
    <td align="center" style="padding: 10px;">
      <img src="https://mp-cbb96997-5877-4954-8574-e31ffe51ad81.cdn.bspapp.com/site/ruoyi-plus-uni-best/screenshot/about.png" alt="关于" width="230" style="border: 1px solid #ddd; border-radius: 8px;" />
      <br />
      <b align="center">关于</b>
    </td>
  </tr>
</table>