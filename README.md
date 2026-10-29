# CROWN OF FOOTBALL — Rise of a Club

**یک بازی مدیریتی فوتبال تحت وب با سازنده‌محوری حمید یارعلی** · **A browser-based football club management simulator** · **一款浏览器足球俱乐部经营模拟游戏**

**Repository name:** `crown-of-football`  
**Creator:** Hamid Yarali (حمید یارعلی)  
**GitHub:** [HamidYaraliOfficial](https://github.com/HamidYaraliOfficial)  
**Copyright:** © 2026 Hamid Yarali. All rights reserved. See [`LICENSE`](LICENSE).

> The repository is provided under a proprietary, all-rights-reserved notice. Public visibility on GitHub does not mean the source code, design, game content, or assets are open source. Written permission from the copyright holder is required for reuse beyond rights granted by applicable law.

---

## فارسی

### معرفی
**CROWN OF FOOTBALL** یک شبیه‌ساز مدیریت باشگاه فوتبال است. شما مسئول اداره یک باشگاه خیالی هستید و باید درباره نقل‌وانتقالات، ترکیب تیم، قراردادها، بودجه، استعدادیابی، تاکتیک و رقابت‌های چندفصلی تصمیم بگیرید.

### امکانات نسخه موجود
- رابط مدیریتی واکنش‌گرا با زبان‌های فارسی (راست‌چین)، انگلیسی و چینی ساده‌شده.
- داشبورد باشگاه، فهرست بازیکنان، جست‌وجو و نقل‌وانتقالات.
- بودجه نقل‌وانتقالاتی، دستمزد، درآمد و دفتر تراکنش‌ها.
- موتور شبیه‌سازی آماری مسابقه، رویدادهای مسابقه، نتیجه و جدول لیگ.
- نمایش گرافیکی مسابقه در فایل مستقل `PLAY_NOW.html`.
- نسخه توسعه React/TypeScript با صحنه سه‌بعدی Three.js.
- استعدادیابی، ارتقای امکانات، تمرین، صندوق پیام‌ها و ذخیره محلی.
- خروجی/ورود Career به JSON در رابط مستقل و توسعه‌پذیری برای قابلیت‌های آینده.

### اجرای سریع بدون نصب وابستگی‌ها
در ویندوز می‌توانی فایل `RUN-PLAY-NOW.bat` را اجرا کنی. در لینوکس/macOS یا برای راه‌اندازی دستی، در پوشه پروژه فرمان زیر را اجرا کن:

```bash
python -m http.server 8000
```

سپس در مرورگر این آدرس را باز کنید:

```text
http://localhost:8000/PLAY_NOW.html
```

این نسخه برای اجرای سریع طراحی شده و وابستگی npm ندارد. در نسخه مستقل، زمین مسابقه یک نمایش گرافیکی دوبعدی مایل/شبه‌سه‌بعدی است؛ نسخه React از Three.js برای صحنه سه‌بعدی استفاده می‌کند.

### تست مستقل بدون نصب npm

```bash
node scripts/verify-standalone.cjs
node scripts/smoke-offline.cjs
```

این تست‌ها نحو JavaScript، رندر قالب تمام صفحات و چند گردش کار اصلی Career را با DOM شبیه‌سازی‌شده بررسی می‌کنند؛ جایگزین تست واقعی مرورگر نیستند.

### اجرای نسخه توسعه React و API
پیش‌نیازها: Node.js سازگار با نسخه‌های وابستگی‌ها و npm.

```bash
npm install
npm run dev
```

برای اجرای وب و API به‌صورت هم‌زمان:

```bash
npm run dev:full
```

ساخت نسخه انتشار و تست:

```bash
npm run build
npm test
```

اگر نصب وابستگی‌ها به‌دلیل نبود اینترنت یا محدودیت DNS شکست خورد، از `PLAY_NOW.html` برای اجرای فوری استفاده کنید. دستورات build و تست به نصب موفق وابستگی‌ها نیاز دارند.

### وضعیت فنی و محدودیت‌های شناخته‌شده
- `PLAY_NOW.html` نسخه مستقل برای اجرای سریع در مرورگر است.
- برنامه React/Three.js و API، پایه توسعه و گسترش پروژه هستند؛ برای اعلام نسخه انتشار نهایی باید وابستگی‌ها نصب، build اجرا و تست‌های واقعی تأیید شوند.
- لایه API فعلی از adapter حافظه‌ای توسعه استفاده می‌کند. فایل `database/schema.sql` طرح پیشنهادی پایگاه داده است و اتصال پایدار PostgreSQL هنوز در جریان اصلی Career یکپارچه نشده است.
- چندنفره آنلاین، داده‌های واقعی دارای مجوز، مدل‌های بازیکنان فوتورئال و محتوای تجاری مجوزدار در محدوده این نسخه نیستند.
- نتایج، نام باشگاه‌ها و بازیکنان نمونه خیالی‌اند.

### مالکیت فکری
© 2026 حمید یارعلی (Hamid Yarali). کلیه حقوق محفوظ است. برای جزئیات و محدودیت استفاده به فایل [`LICENSE`](LICENSE) مراجعه کنید.

---

## English

### Overview
**CROWN OF FOOTBALL — Rise of a Club** is a browser-based football club management simulator. You run a fictional club and make decisions about transfers, squad selection, contracts, finances, scouting, tactics, and multi-season competitions.

### Included features
- Responsive management UI in Persian (RTL), English, and Simplified Chinese.
- Club dashboard, squad management, search, and transfer negotiations.
- Transfer and wage budgets, revenue tracking, and a transaction ledger.
- Statistical match simulation, event log, results, and league standings.
- Standalone playable entry point at `PLAY_NOW.html`.
- React/TypeScript development app with a Three.js match scene.
- Scouting, facility upgrades, training, inbox, and local career persistence.
- JSON career export/import in the standalone app and an extensible project layout.

### Quick start — no npm install required
On Windows, launch `RUN-PLAY-NOW.bat`. Alternatively, from the repository root run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/PLAY_NOW.html` in a browser.

The standalone file has no npm dependencies. Its match pitch uses an angled 2D/canvas presentation; the React project uses Three.js for a true 3D scene.

### Dependency-free smoke checks

```bash
node scripts/verify-standalone.cjs
node scripts/smoke-offline.cjs
```

These validate inline JavaScript syntax and exercise page-template rendering, language switching, transfers, match completion, and save import/export with a mocked DOM. They do not replace a real-browser test.

### Development app
Requirements: a compatible Node.js version and npm.

```bash
npm install
npm run dev
```

Run the web app and API together:

```bash
npm run dev:full
```

Build and test:

```bash
npm run build
npm test
```

If dependency installation is blocked by network/DNS restrictions, use `PLAY_NOW.html` for the standalone experience. The development build and test commands require successfully installed dependencies.

### Current implementation notes
- `PLAY_NOW.html` is the standalone browser-playable edition.
- The React/Three.js app and API are an extensible development foundation; a release claim requires successful dependency installation, build, and actual test runs.
- The API currently contains an in-memory development adapter. `database/schema.sql` is a proposed schema and is not yet integrated into persistent career operations.
- Online multiplayer, licensed real-world data, photorealistic player likenesses, and licensed commercial assets are outside the current scope.
- All included clubs and player profiles are fictional.

### Intellectual property
Copyright © 2026 Hamid Yarali. All rights reserved. The project is proprietary; see [`LICENSE`](LICENSE) for permitted use and restrictions.

---

## 简体中文

### 项目简介
**CROWN OF FOOTBALL — Rise of a Club** 是一款基于浏览器的足球俱乐部经营模拟游戏。玩家管理虚构俱乐部，负责转会、阵容、合同、财务、球探、战术以及多个赛季的赛事。

### 当前功能
- 支持波斯语（RTL）、英语和简体中文的响应式管理界面。
- 俱乐部仪表盘、球员名单、搜索和转会谈判。
- 转会预算、工资预算、收入和财务流水。
- 统计型比赛模拟、比赛事件、赛果和联赛积分榜。
- 可直接运行的独立入口文件 `PLAY_NOW.html`。
- 使用 React/TypeScript 构建的开发版，并通过 Three.js 展示三维比赛场景。
- 球探、设施升级、训练、收件箱和本地生涯存档。
- 独立版支持 JSON 生涯数据导入/导出，项目结构便于扩展。

### 快速运行（无需安装 npm 依赖）
在 Windows 上运行 `RUN-PLAY-NOW.bat`，或在项目根目录运行：

```bash
python -m http.server 8000
```

然后在浏览器中打开 `http://localhost:8000/PLAY_NOW.html`。

独立版不需要 npm 依赖。独立版的比赛场地采用倾斜二维画布/伪三维显示；React 开发版使用 Three.js 构建真正的三维场景。

### 无 npm 依赖的冒烟测试

```bash
node scripts/verify-standalone.cjs
node scripts/smoke-offline.cjs
```

这些测试会检查内联 JavaScript 语法，并通过模拟 DOM 测试页面模板、语言切换、转会、比赛完成及存档导入/导出；它们不能替代真实浏览器测试。

### 开发版运行方式
需要兼容的 Node.js 版本和 npm。

```bash
npm install
npm run dev
```

同时运行网页前端和 API：

```bash
npm run dev:full
```

构建和测试：

```bash
npm run build
npm test
```

如果网络或 DNS 限制导致依赖安装失败，请使用 `PLAY_NOW.html` 运行独立版。开发版的构建与测试命令需要先成功安装依赖。

### 当前实现说明
- `PLAY_NOW.html` 是可直接运行的独立浏览器版本。
- React/Three.js 应用和 API 是可扩展的开发基础；只有在依赖安装、构建和实际测试成功后，才能确认其发布状态。
- 当前 API 使用内存型开发适配器。`database/schema.sql` 是建议的数据结构，尚未接入持久化的生涯操作流程。
- 在线多人模式、获得授权的真实俱乐部数据、写实球员肖像和商业授权素材不在当前范围内。
- 当前俱乐部和球员资料均为虚构内容。

### 知识产权
版权所有 © 2026 Hamid Yarali（哈米德·亚拉利）。保留所有权利。本项目为专有项目，请参阅 [`LICENSE`](LICENSE) 了解授权与使用限制。

---

## Repository information
- Suggested repository: `crown-of-football`
- GitHub profile: https://github.com/HamidYaraliOfficial
- Copyright notice: `Copyright © 2026 Hamid Yarali. All rights reserved.`
