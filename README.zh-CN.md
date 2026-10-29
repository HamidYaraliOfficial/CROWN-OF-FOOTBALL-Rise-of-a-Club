# CROWN OF FOOTBALL — Rise of a Club

**作者：** Hamid Yarali（哈米德·亚拉利）  
**建议仓库名：** `crown-of-football`  
**GitHub：** https://github.com/HamidYaraliOfficial  
**版权：** © 2026 Hamid Yarali。保留所有权利。

## 项目简介
一款基于浏览器的足球俱乐部经营模拟游戏，使用虚构俱乐部和球员。玩家可管理阵容、谈判转会、控制预算和合同、寻找新秀、设置战术、模拟比赛并推进联赛赛季。

## 快速运行
在 Windows 上运行 `RUN-PLAY-NOW.bat`。也可以在项目根目录执行：

```bash
python -m http.server 8000
```

然后打开 `http://localhost:8000/PLAY_NOW.html`。独立版无需安装 npm 依赖，支持波斯语、英语和简体中文界面、本地存档以及 JSON 导入/导出。

## 无 npm 依赖的冒烟测试
```bash
node scripts/verify-standalone.cjs
node scripts/smoke-offline.cjs
```
这些测试检查内联脚本语法，并使用模拟 DOM 测试主要页面和基本流程，但不能替代真实浏览器测试。

## 开发版
```bash
npm install
npm run dev
```
通过 `npm run dev:full` 同时运行前端和 API；通过 `npm run build` 和 `npm test` 构建及测试。

## 当前状态
`PLAY_NOW.html` 可用于立即体验。React/Three.js 应用与 API 属于可扩展的开发代码，构建前需要成功安装依赖。API 当前使用内存型开发适配器；`database/schema.sql` 尚未接入持久化生涯流程。

## 知识产权
版权所有 © 2026 Hamid Yarali。保留所有权利。除适用法律明确允许的情形外，转载、再分发、创建衍生作品或商业使用均需事先获得版权持有人的书面许可。详见 [`LICENSE`](LICENSE)。
