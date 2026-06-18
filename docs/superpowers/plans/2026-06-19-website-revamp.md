# 7dawn 官网改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把官网从「3Studio 单产品暗色单页」重构为「7dawn 工业自进化 AI 工程师」公司/平台叙事:9 节首页 + 5 项导航 + 双 CTA + docs/download 占位页,并清除融资 deck 残留的敏感/无来源内容。

**Architecture:** 沿用现有 Next.js 15 App Router + next-intl(zh/en)+ 暗色 design tokens。内容主要承载在 `messages/{zh,en}.json`,组件消费 i18n key;首页由 `app/[locale]/page.tsx` 串联各 section。改版 = 重写 i18n 内容 + 重排/改造组件 + 新增少量组件与 2 个占位路由。先做合规脱敏,再动版面。

**Tech Stack:** Next.js 15.5、React 19、next-intl 4.9、Tailwind v4(`@theme` in `app/globals.css`)、Vitest 4、TypeScript 5。

## Global Constraints

> 每个 task 都隐式包含本节。值为 spec 原文。

- 视觉:沿用现有暗色 tokens(`#1f2228`、白色透明分层、Geist/Noto),**不引入新强调色**。
- 内容保守公开:剔除融资额/估值/股权、客户管线名单与阶段、前公司经营数字(MAU/营收/满意度)、SOM/SAM/Layer 具体金额。
- 团队:只放公司/愿景 + 机构级背书,**不放具体成员**。
- docs/download = 占位页 + 留资 CTA。
- 维持 zh/en 双语;尽量复用现有组件;架构 A(单页 + 占位路由)。
- **合规违禁串(全站不得出现)**:`李承泽`、`104`(在轨星语境)、`XX-3`、`99.2`、`1200`、`ROI 37`、`年省`、`Epsilon3`、`Synera`、`8-15 亿`、`200-400`、`500-1200`、`2000-5000`、`总师签字`、`22.4`、`765 亿`、`33 月`、`$20B`、前公司经营百分比(`95%`/`92%`/`0.4`/`87%` 等作为"已达成业绩"的硬数字)。
- 唯二允许的硬数字(需限定):`GAIA 91.36`(配外链 + 抓取日期 + 翻译句)、`验证漏测率 ↓ 70%`(标"航天测试矩阵场景 · 内部基准")。
- mailto:`contact@7dawn.ai`;电话沿用现有 `contact.phone`。
- 提交信息结尾:`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

---

## File Structure(改动地图)

**新建组件**
- `components/TrustBar.tsx` — 可信度带(第 2 节)
- `components/Products.tsx` — 产品分流非对称双卡(第 4 节)
- `components/CapabilityMatrix.tsx` — 全流程×多物理场矩阵(第 6 节,取代 Architecture 在首页的位置)
- `components/Industries.tsx` — 行业 Land&Expand(第 8 节)
- `components/Company.tsx` — 公司/愿景收尾带(第 9 节上半)

**新建路由**
- `app/[locale]/docs/page.tsx` — docs 占位页
- `app/[locale]/download/page.tsx` — download 占位页
- `components/Placeholder.tsx` — 两占位页共用的暗色占位组件

**改造组件**
- `components/Nav.tsx` — 5 项导航 + 双 CTA + 绝对锚点
- `components/Hero.tsx` — 母品牌定位 + 双 CTA
- `components/Problem.tsx` — 吞 WhyNow 收尾句
- `components/PlatformDossier.tsx` — 脱敏(client demo)
- `components/Evolution.tsx` — 自进化机制 + GAIA + 未来时
- `components/Footer.tsx` — 扩展导航/docs/download 链接
- `components/LangSwitch.tsx` — 切语言携带 pathname
- `app/[locale]/page.tsx` — 重排 section、移除下线组件
- `app/[locale]/layout.tsx` — meta 已由 i18n 驱动(改 i18n 即可)
- `app/sitemap.ts` — 加 `/docs`、`/download`
- `app/globals.css` — 新增 `.btn-secondary`

**改造内容**
- `messages/zh.json`、`messages/en.json` — 全量重写

**移除/不再在首页引用**(组件文件保留备用,仅从 page.tsx 去引用):`WhyNow`、`Pitch`、`Spaces`、`Architecture`、`Harness`、`Scenarios`、`Market`、`CTAContact`(其内容并入 Company。)

**新建测试**
- `test/compliance.test.ts` — 违禁串守卫

---

## Task 1: 合规守卫测试(先红后绿的锚)

**Files:**
- Create: `test/compliance.test.ts`

**Interfaces:**
- Produces: 一个 vitest 用例,扫描 `messages/*.json` 与 `components/**/*.tsx`,断言不含 Global Constraints 的违禁串。此测试在脱敏完成前应 FAIL,完成后 PASS。

- [ ] **Step 1: 写失败测试**

```ts
// test/compliance.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Forbidden substrings that must never ship to the public site.
const BANNED = [
  '李承泽', '总师签字', '等待总师',
  'XX-3', '99.2', 'ROI 37', '年省', '1200w', '1200 w',
  'Epsilon3', 'Synera', '8-15 亿', '200-400', '500-1200', '2000-5000',
  '765 亿', '22.4', '33 月', '$20B',
  '104 颗', '104 satellites', '104 · 健康',
]

function collectFiles(dir: string, exts: string[]): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...collectFiles(p, exts))
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p)
  }
  return out
}

describe('compliance: no fundraising-deck leakage on public site', () => {
  const files = [
    ...collectFiles('messages', ['.json']),
    ...collectFiles('components', ['.tsx']),
  ]
  for (const f of files) {
    it(`${f} has no banned strings`, () => {
      const text = readFileSync(f, 'utf8')
      const hits = BANNED.filter((b) => text.includes(b))
      expect(hits, `banned strings in ${f}: ${hits.join(', ')}`).toEqual([])
    })
  }
})
```

- [ ] **Step 2: 跑测试确认 FAIL**

Run: `npm run test -- test/compliance.test.ts`
Expected: FAIL(`messages/zh.json`、`messages/en.json`、`components/PlatformDossier.tsx` 等命中违禁串)。

- [ ] **Step 3: 提交(红测试入库,作为后续脱敏的验收)**

```bash
git add test/compliance.test.ts
git commit -m "test: add compliance guard against deck-leakage strings

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: 新增 btn-secondary 设计原子

**Files:**
- Modify: `app/globals.css`(在现有 `.btn-primary` / `.btn-ghost` 附近)

**Interfaces:**
- Produces: `.btn-secondary` 类 = 描边白 + hover 填充反馈,供 Nav/Hero/Products/Company 的次 CTA 统一使用。

- [ ] **Step 1: 加样式**(读现有 `.btn` 系列,复用同款排版尺寸;以下为新增)

```css
/* Secondary CTA: outline white + arrow, fills on hover. No new accent color. */
.btn-secondary {
  border: 1px solid var(--border-20, rgba(255, 255, 255, 0.2));
  color: #fff;
  background: transparent;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.45);
}
```

- [ ] **Step 2: 验证 build 不破**

Run: `npm run build`
Expected: 构建成功(Tailwind v4 解析通过)。

- [ ] **Step 3: 提交**

```bash
git add app/globals.css
git commit -m "feat(ui): add btn-secondary for dual-CTA hierarchy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: 全量重写 i18n 内容(zh + en)

> 这是内容总源。后续组件任务只消费这里的 key。完成后 Task 1 的合规测试应转绿(messages 部分)。

**Files:**
- Modify: `messages/zh.json`(整体替换为下方结构)
- Modify: `messages/en.json`(同结构,英文文案)

**Interfaces:**
- Produces: i18n key 树:`meta / nav / hero / trust / problem / products / platform / capability / evolution / industries / company / cta / footer / docs / download`。组件按这些 key 渲染。
- 注意:`platform`(PlatformDossier 用)与 `contact` 保留但脱敏;移除 `why/pitch/spaces/architecture/harness/scenarios/market` 顶层块(其展示内容并入新 key 或下线)。

- [ ] **Step 1: 写 `messages/zh.json`(最终文案)**

关键节文案(逐字):

```jsonc
{
  "meta": {
    "title": "7dawn · 工业自进化 AI 工程师",
    "description": "7dawn 让 AI 在工业现场真做工程:从概念设计到多物理场验证再到制造,越用越聪明。3Studio 面向高端制造团队,vibe CAE 面向工程师个人。"
  },
  "nav": {
    "products": "产品", "platform": "能力", "industries": "行业",
    "docs": "文档", "company": "公司",
    "demo": "预约演示", "tryVibe": "试用 vibe CAE"
  },
  "contact": { "email": "contact@7dawn.ai", "phone": "PHONE" },
  "hero": {
    "label": "// 奇点初芒 · 7dawn",
    "title1": "让 AI 在工业现场",
    "title2": "真做工程",
    "subEm": "一个会自我进化的工业工程引擎",
    "sub": "从概念设计到多物理场验证再到制造,越用越聪明。",
    "ctaPrimary": "预约演示",
    "ctaSecondary": "试用 vibe CAE",
    "scroll": "SCROLL"
  },
  "trust": {
    "gaia": { "value": "GAIA 全球第一", "metric": "91.36",
      "note": "同一套自研 Agent 内核,在通用工程任务上全球登顶(截至 2026-02)",
      "linkLabel": "查看榜单", "href": "https://huggingface.co/spaces/gaia-benchmark/leaderboard" },
    "leak": { "value": "验证漏测率 ↓ 70%", "note": "航天测试矩阵场景 · 内部基准,非全局承诺" },
    "scope": { "value": "全流程", "note": "概念设计 → 制造" },
    "physics": { "value": "多物理场", "note": "结构 / 热 / 流体 / 电磁 / 电子 / 控制" },
    "badge": "可审计 · 可回滚 · 人在环"
  },
  "problem": {
    "titleLine1": "工业研发又慢又贵 —— ",
    "titleEm": "更贵的是错过本可做出的设计",
    "titleAfter": "。",
    "lead": "不是缺某个 AI 功能,而是缺一个能在工业现场真做工程、且可信赖的 AI。一个复杂构型要过 10+ 种工具,验证周期数周,返工吃掉大量设计时间。",
    "items": {
      "0": { "no": "01", "tag": "孤岛", "h4": "工具孤岛", "body": "CAD / CAE / EDA / 仿真 / 标准——工程师在十多个窗口间手动搬数据。", "quant": "占工作时间约 1/4" },
      "1": { "no": "02", "tag": "知识", "h4": "知识锁在脑里", "body": "“改这个参数会影响哪条边界”——只在资深总师脑子里,人走知识散。", "quant": "新人 ramp-up 数月" },
      "2": { "no": "03", "tag": "协作", "h4": "多学科协作断裂", "body": "结构、热、电磁互相牵连,跨学科影响靠开会传递,返工率居高不下。", "quant": "返工吃掉大量设计周期" },
      "3": { "no": "04", "tag": "验证", "h4": "验证大量手工", "body": "单个型号成百上千测试项,逐项配置、跑、对比、写报告——极大重复劳动。", "quant": "单轮验证以周计" },
      "4": { "no": "05", "tag": "探索", "h4": "没空间探索更优解", "body": "时间都耗在跑流程,真正能拉开差距的“更优构型”反而没人去试。", "quant": "错过的设计无法估量" },
      "5": { "no": "06", "tag": "信任", "h4": "黑箱 AI 不可用", "body": "航天 / 高端制造——错误代价极高,需要可审计、可解释、可回滚的 AI。", "quant": "通用 LLM 难直接合规" }
    },
    "whyNow": "为什么是现在:模型从问答走向执行、工业软件走向 AI 原生层、政策明确推进工业智能体——窗口正在打开。"
  },
  "products": {
    "titleBefore": "同一个自进化 Agent 平台,",
    "titleEm": "两种用法",
    "titleAfter": "。",
    "lead": "7dawn 是底座;面向不同的人,有两个入口。",
    "studio": {
      "name": "3Studio",
      "for": "面向高端制造团队 · 大 B",
      "desc": "航天级 AI 工程工作台——让工程团队带着 Agent 做设计、验证、流程、运维,全程治理可审计。",
      "cta": "预约演示"
    },
    "vibe": {
      "name": "vibe CAE",
      "for": "面向工程师个人 · 自助",
      "desc": "自然语言驱动多物理场仿真——上传 CAD / STEP 即跑。",
      "cta": "试用"
    }
  },
  "capability": {
    "titleBefore": "一套自进化 Agent 底座,",
    "titleEm": "打通工业设计全流程",
    "titleAfter": "。",
    "lead": "横轴是工程阶段,纵轴是多物理场专业线——每个子领域的工具与人才完全不同,我们用同一个底座跨域统一。这是相对单点工具(Ansys / MATLAB 等)的结构性差异。",
    "stages": ["概念方案", "详细设计", "仿真验证", "DfM", "制造"],
    "stageNote": "制造为后续阶段",
    "rows": [
      { "name": "结构", "cells": ["y", "y", "y", "y", "soon"] },
      { "name": "热控", "cells": ["y", "y", "y", "y", "soon"] },
      { "name": "流体", "cells": ["y", "y", "y", "y", "soon"] },
      { "name": "电磁", "cells": ["y", "y", "y", "y", "soon"] },
      { "name": "电子 PCB", "cells": ["y", "y", "y", "y", "soon"] },
      { "name": "控制", "cells": ["y", "y", "y", "y", "soon"] }
    ],
    "governance": "治理内建:工具白名单 · 全链路审计 · 一键回滚 · 分级审批(人在环)。"
  },
  "evolution": {
    "titleBefore": "越用越聪明 —— ",
    "titleEm": "会自我进化的工业工程引擎",
    "titleAfter": "。",
    "lead": "每一次人工审核、每一次 Agent 执行都在喂养知识引擎:M0 即时记忆 → M1 项目记忆 → M2 组织记忆,叠加端到端 RL,让 Agent 越用越懂你的工程。",
    "evidence": "能力底气来自公开榜单:自研 Agent 内核登顶 GAIA 全球第一(91.36)。",
    "future": "终局是工业现场的“越用越聪明”飞轮——用得越多,工程数据越厚,模型越强。(能力随部署演进)",
    "mechanism": {
      "0": { "k": "M0 · 即时记忆", "v": "单次会话内的上下文与技能即时沉淀。" },
      "1": { "k": "M1 · 项目记忆", "v": "一个型号 / 项目内的经验跨任务复用。" },
      "2": { "k": "M2 · 组织记忆", "v": "组织隐性知识结构化落库,跨项目迁移。" },
      "3": { "k": "RL · 端到端", "v": "以真实工程结果为奖励,闭环回流持续自迭代。" }
    },
    "curveLabel": "示意 · 越用越聪明"
  },
  "industries": {
    "titleBefore": "从星箭样板间,",
    "titleEm": "向高端制造全面复制",
    "titleAfter": "。",
    "lead": "先在最难、最同源的航空航天系跑通,再沿能力轴向更多行业复制。",
    "items": {
      "0": { "code": "01", "name": "商业航天 · 星箭", "pain": "气动 / 结构 / 热 / 多物理场仿真密集,迭代慢、成本高。", "land": "概念到验证全流程提速,多物理场协同求解。", "expand": "样板间 → 复制到更多商业航天客户。" },
      "1": { "code": "02", "name": "eVTOL · 低空经济", "pain": "新构型密集迭代,整机仿真需求旺盛,适航压力大。", "land": "构型快速迭代 + 整机多物理场验证。", "expand": "国家战略风口,需求正盛。" },
      "2": { "code": "03", "name": "国机系制造", "pain": "重型装备 / 精密制造,设计-制造链条长。", "land": "面向制造的设计(DfM)与设计-制造数据打通。", "expand": "经工业软件合作切入庞大制造体系。" }
    },
    "more": { "label": "后续扩展", "chips": ["航空", "汽车", "机器人", "半导体", "储能"] }
  },
  "company": {
    "titleBefore": "做中国高端制造的",
    "titleEm": "“自进化设计大脑”",
    "titleAfter": "。",
    "vision": "别人做工具,我们做会自己进化的工业引擎。从星箭样板间起步,打通设计→验证→制造的高端制造闭环。",
    "gene": "团队具备清华系 AI、航天工程与 EDA 产业化的复合背景。",
    "market": "从星箭样板间,到万亿级工业设计市场——能力轴纵深,行业轴横展。"
  },
  "cta": {
    "kicker": "— 把最难的工程交给会进化的 AI —",
    "titleBefore": "从最难的",
    "titleEm": "工业现场",
    "titleAfter": "开始。",
    "lead": "大 B 团队预约 3Studio 演示;工程师个人可直接试用 vibe CAE。",
    "primary": "预约演示",
    "secondary": "试用 vibe CAE",
    "subject": "预约 7dawn · 3Studio 演示"
  },
  "platform": { "...": "见 Task 8:沿用现有结构但脱敏(去 104/XX-3/99.2/1200/总师签字/95/0.4 等),并加 illustrative 标注" },
  "footer": {
    "copy": "© 2026 7DAWN · 奇点初芒",
    "city": "BEIJING · 北京",
    "nav": { "products": "产品", "platform": "能力", "industries": "行业", "docs": "文档", "download": "试用 vibe CAE", "company": "公司" }
  },
  "docs": {
    "label": "// DOCS",
    "title": "文档建设中",
    "body": "7dawn 产品文档正在建设中。留下邮箱,上线第一时间通知你。",
    "cta": "联系我们",
    "subject": "7dawn 文档上线通知",
    "back": "← 返回首页"
  },
  "download": {
    "label": "// vibe CAE",
    "title": "vibe CAE 即将开放",
    "body": "vibe CAE 正在开放早期访问——自然语言驱动多物理场仿真,上传 CAD / STEP 即跑。申请加入早期访问名单。",
    "cta": "申请早期访问",
    "subject": "申请 vibe CAE 早期访问",
    "back": "← 返回首页"
  }
}
```

> `platform` 块**保留现有 5 tab 结构**,只在 Task 8 做脱敏替换(因为 PlatformDossier 组件依赖其形状)。本步先把上面其余块写好,`platform` 块原样保留待 Task 8 改。

- [ ] **Step 2: 写 `messages/en.json`(同 key,英文)**

关键英文(逐字,其余按 zh 语义直译,保持 key 完全对齐):
- `meta.title`: `7dawn · The Self-Evolving Industrial AI Engineer`
- `meta.description`: `7dawn makes AI do real engineering on the factory floor — from concept design to multiphysics validation to manufacturing, getting smarter the more you use it. 3Studio for engineering teams, vibe CAE for individual engineers.`
- `nav`: Products / Platform / Industries / Docs / Company / `Book a demo` / `Try vibe CAE`
- `hero`: label `// 7DAWN · SINGULARITY DAWN`,title1 `AI that does real engineering`,title2 `— and evolves.`,subEm `A self-evolving industrial engineering engine`,sub `From concept design to multiphysics validation to manufacturing — gets smarter the more you use it.`,ctaPrimary `Book a demo`,ctaSecondary `Try vibe CAE`,scroll `SCROLL`
- `trust.gaia`: value `#1 on GAIA`,metric `91.36`,note `Our in-house agent core tops the global GAIA benchmark on general engineering tasks (as of 2026-02)`,linkLabel `View leaderboard`
- `trust.leak`: value `Verification miss-rate ↓70%`,note `Aerospace test-matrix scenario · internal baseline, not a global promise`
- `products`: titleEm `two ways to use it`,studio.for `For engineering teams`,vibe.for `For individual engineers`,vibe.desc `Natural-language multiphysics simulation — upload CAD/STEP and run.`
- `download.title`: `vibe CAE — early access`,`docs.title`: `Docs in progress`
- 其余块按 zh 文案对应英文,务必 key 与 zh 完全一致,值非空。

- [ ] **Step 3: 跑合规测试(messages 部分应转绿)**

Run: `npm run test -- test/compliance.test.ts`
Expected: `messages/zh.json`、`messages/en.json` 两条 PASS;`components/PlatformDossier.tsx` 仍可能 FAIL(留给 Task 8)。

- [ ] **Step 4: 提交**

```bash
git add messages/zh.json messages/en.json
git commit -m "content: rewrite i18n to 7dawn platform narrative, sanitize deck data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Nav 改造(5 项 + 双 CTA + 绝对锚点)

**Files:**
- Modify: `components/Nav.tsx`
- Modify: `components/LangSwitch.tsx`(携带 pathname)

**Interfaces:**
- Consumes: `nav.*`(products/platform/industries/docs/company/demo/tryVibe)、`contact.email`、`cta.subject`、当前 `locale`。
- Produces: 顶栏 = Logo + 5 链接(`/{locale}#products` 等绝对锚点,`docs`→`/{locale}/docs`)+ 主 CTA(mailto)+ 次 CTA(`/{locale}/download`)+ LangSwitch。

- [ ] **Step 1: 读现有 `Nav.tsx` 与 `LangSwitch.tsx`**,保留毛玻璃/fixed/logo 结构,替换菜单项与右侧 CTA。
- [ ] **Step 2: 菜单项改为绝对锚点**:`href={`/${locale}#products`}` 等;Docs 用 `Link` 到 `/${locale}/docs`。
- [ ] **Step 3: 右侧**:主 CTA `预约演示` = `<a className="btn btn-primary" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>`;次 CTA `试用 vibe CAE` = `<Link className="btn btn-secondary" href={`/${locale}/download`}>` + ` →`。
- [ ] **Step 4: LangSwitch** 改为基于 `usePathname()` 切换 locale 前缀,保留 hash(读现有实现,改成替换路径首段 locale)。
- [ ] **Step 5: 验证**

Run: `npm run build`
Expected: 成功。
Manual:`npm run dev` 后顶栏 5 项 + 双 CTA 显示,点 Docs 进 `/zh/docs`,语言切换保持路径。

- [ ] **Step 6: 提交** `feat(nav): 5-item nav + dual CTA + absolute anchors`

---

## Task 5: Hero 改造

**Files:** Modify `components/Hero.tsx`

**Interfaces:**
- Consumes: `hero.*`(label/title1/title2/subEm/sub/ctaPrimary/ctaSecondary/scroll)、`contact.email`、`cta.subject`、`locale`。
- Produces: 母品牌 Hero;**不出现产品名**;双 CTA(主 mailto / 次 `/download`)。

- [ ] **Step 1: 读现有 `Hero.tsx`**,保留 FogCanvas 背景与 hero-title 排版。
- [ ] **Step 2: 文案**:两行主标 `title1`/`title2`;其下弱色行 `subEm`(用 `text-50`)+ 正常副标 `sub`。
- [ ] **Step 3: CTA**:主 `btn btn-primary`(mailto)、次 `btn btn-secondary`(`/{locale}/download`)+ `→`。移除旧单 CTA `联系我们`。
- [ ] **Step 4: 验证** `npm run build` 成功;dev 下 Hero 文案/双 CTA 正确,无产品名。
- [ ] **Step 5: 提交** `feat(hero): platform-level positioning + dual CTA`

---

## Task 6: TrustBar 新组件(可信度带)

**Files:** Create `components/TrustBar.tsx`

**Interfaces:**
- Consumes: `trust.*`。
- Produces: 紧贴 Hero 的一行四指标 + 信任徽章。GAIA 项可点击外链(`trust.gaia.href`,`target="_blank" rel="noopener"`)。

- [ ] **Step 1: 实现**:横向 4 列(gaia / leak / scope / physics),每列大字 value + 小字 note;末尾一颗 `trust.badge` chip。复用 `.stat-value`/`.tag` 风格,暗色无强调色。gaia 用 `<a>` 包裹 + `linkLabel`。
- [ ] **Step 2: 验证** `npm run build` 成功。
- [ ] **Step 3: 提交** `feat(section): add TrustBar credibility strip`

---

## Task 7: Problem 改造(吞 WhyNow)

**Files:** Modify `components/Problem.tsx`

**Interfaces:**
- Consumes: `problem.*`(含新 `problem.whyNow`,items 改为新 6 项,去掉旧 quant 中的不可证伪硬数字)。
- Produces: 痛点网格 + 末尾一句 `whyNow`。

- [ ] **Step 1: 读现有 `Problem.tsx`**,items 渲染不变(no/tag/h4/body/quant),仅在 section 末尾加 `whyNow` 一行(弱色,居中或左对齐统一)。
- [ ] **Step 2: 验证** build 成功,文案为新内容。
- [ ] **Step 3: 提交** `refactor(section): merge WhyNow into Problem, sanitize quants`

---

## Task 8: PlatformDossier 脱敏 + 归位 3Studio 演示

**Files:** Modify `components/PlatformDossier.tsx`、`messages/{zh,en}.json` 的 `platform` 块

**Interfaces:**
- Consumes: `platform.*`(脱敏后)。
- Produces: 五工作空间交互 demo,**无任何违禁串**,并加 `平台演示 · 示意数据 / illustrative` 标注。

- [ ] **Step 1: 脱敏 `platform` 块**(逐项替换):
  - `platform.stats.2`:`99% 可审计执行率` → num `M0–M2 + RL`,lbl `自进化记忆`(去掉 99%)。
  - `bodies.verify.stats` 覆盖率 `99.2` → `高覆盖`;漏测率保留 `↓70%`(已在白名单)。
  - `bodies.flow.steps` `等待总师签字` → `分级审批 · 等待人工复核`;`遗漏率 ↓80%` 的 80 改 `显著下降`。
  - `bodies.operate`:`104 satellites`/`104 颗在轨星`/`104 · 健康 98%` → `在轨星座`/`星座遥测`/`健康良好`;`年省成本 ¥1200w` → 删该 stat,换 `运维人力` 定性「显著下降」;`50 → 10 人` → `多星 / 单人`。
  - `bodies.command`:`XX-3 号卫星` → `重点型号卫星`;`Agent 自主率 95% / 干预 0.4 / 知识覆盖 87%` → 改定性(`自主率 持续上升` / `干预 持续下降` / `知识覆盖 持续扩大`)或删数字。
  - `switcher` 文案保留;新增 `platform.illustrative`: `平台演示 · 示意数据`(en: `Product demo · illustrative data`)。
- [ ] **Step 2: 组件**:在 demo 容器角落渲染 `platform.illustrative` 小标;`Spaces` 静态卡内容并入(可在 demo 上方加一行五空间简述,或直接以 tab 承载——读组件后择简)。`Spaces` 不再单独在 page 引用。
- [ ] **Step 3: 验证**

Run: `npm run test -- test/compliance.test.ts`
Expected: 全部 PASS(含 `components/PlatformDossier.tsx`)。
Run: `npm run build` 成功。

- [ ] **Step 4: 提交** `refactor(3studio): sanitize PlatformDossier demo data`

---

## Task 9: CapabilityMatrix 新组件(全流程×多物理场)

**Files:** Create `components/CapabilityMatrix.tsx`

**Interfaces:**
- Consumes: `capability.*`(stages/rows/cells: 'y'|'soon'、governance、stageNote)。
- Produces: `id="platform"` 的矩阵节:横轴 stages × 纵轴 rows,cell `y`=✓、`soon`=弱化「后续」;底部 governance 一行 + lead 的差异化句。

- [ ] **Step 1: 实现** 表格/grid(暗色、细描边 `border-white/10`),表头 stages,行首 row.name,cell 渲染勾/弱化。`stages` 最后一列(制造)整列弱化 + `stageNote`。
- [ ] **Step 2: 验证** build 成功;无横向溢出(移动端可横向滚动)。
- [ ] **Step 3: 提交** `feat(section): add full-process × multiphysics capability matrix`

---

## Task 10: Evolution 改造(机制 + GAIA + 未来时)

**Files:** Modify `components/Evolution.tsx`

**Interfaces:**
- Consumes: `evolution.*`(lead/evidence/future/mechanism[0..3]/curveLabel),**不再用** 旧 `evolution.chart.now`、`evolution.stats` 硬数字。
- Produces: 机制四卡(M0/M1/M2/RL)+ GAIA 证据句 + 一条标注 `curveLabel` 的定性上升曲线(SVG,可复用现有曲线但去掉数值刻度)+ `future` 未来时说明。

- [ ] **Step 1: 读现有 `Evolution.tsx`**,保留 SVG 曲线骨架但移除具体数值标注,加 `curveLabel`「示意」。删掉 4 个硬数字 stats,替换为 `mechanism` 四卡(k/v)。加 `evidence` 与 `future` 文案。
- [ ] **Step 2: 验证** build 成功;无前公司经营数字。
- [ ] **Step 3: 提交** `refactor(section): self-evolution as mechanism + GAIA, future-tense`

---

## Task 11: Industries 新组件

**Files:** Create `components/Industries.tsx`

**Interfaces:**
- Consumes: `industries.*`(items[0..2]: code/name/pain/land/expand、more.label、more.chips)。
- Produces: `id="industries"` 的三行业卡 + 「后续扩展」chip 行。

- [ ] **Step 1: 实现** 三卡(每卡:code、name、痛点/落地/复制三段标签式),下方 `more` chips 行。复用现有卡片/chip 样式。
- [ ] **Step 2: 验证** build 成功。
- [ ] **Step 3: 提交** `feat(section): add Industries land-and-expand`

---

## Task 12: Products 新组件(非对称双卡)

**Files:** Create `components/Products.tsx`

**Interfaces:**
- Consumes: `products.*`、`contact.email`、`cta.subject`、`locale`。
- Produces: `id="products"`;统一引言 + 非对称双卡:3Studio 大卡(⅔,主 CTA mailto)/ vibe CAE 小卡(⅓,次 CTA `/{locale}/download`)。

- [ ] **Step 1: 实现** grid(`md:grid-cols-3`,studio 占 `md:col-span-2`)。studio 卡:name/for/desc + `btn-primary` 预约演示(mailto);vibe 卡:name/for/desc + `btn-secondary` 试用(`/download`)。顶部 `products.titleBefore/Em/After` + `lead`。
- [ ] **Step 2: 验证** build 成功;主次卡比例与 CTA 层级正确。
- [ ] **Step 3: 提交** `feat(section): add Products split (3Studio + vibe CAE)`

---

## Task 13: Company 新组件 + CTA 改造(并 Market/CTAContact)

**Files:** Create `components/Company.tsx`;Modify `components/CTAContact.tsx`(改双 CTA)

**Interfaces:**
- Company consumes: `company.*`(vision/gene/market)。
- CTA consumes: `cta.*`(primary/secondary/subject/kicker/title*)、`contact.email`、`locale`。
- Produces: `id="company"` 收尾带(愿景 + 机构级 gene + 万亿级定性,**无金额/竞品表**)→ 紧接双 CTA 收口。

- [ ] **Step 1: Company.tsx**:`id="company"`,渲染 title + vision + gene + market 三句,排版克制。
- [ ] **Step 2: CTAContact.tsx**:改为双 CTA——主 `btn-primary` 预约演示(mailto + subject)、次 `btn-secondary` 试用 vibe CAE(`/{locale}/download`)。
- [ ] **Step 3: 验证** build 成功。
- [ ] **Step 4: 提交** `feat(section): add Company/vision + dual-CTA close`

---

## Task 14: Footer 扩展

**Files:** Modify `components/Footer.tsx`

**Interfaces:**
- Consumes: `footer.*`(copy/city/nav.*)、`locale`。
- Produces: 版权 + city + 一组链接(产品/能力/行业/文档/试用/公司,绝对锚点 + `/docs` `/download`)。

- [ ] **Step 1: 实现** 在现有两列 flex 上加链接组。
- [ ] **Step 2: 验证** build 成功。
- [ ] **Step 3: 提交** `feat(footer): add nav/docs/download links`

---

## Task 15: 占位页 /docs 与 /download

**Files:** Create `components/Placeholder.tsx`、`app/[locale]/docs/page.tsx`、`app/[locale]/download/page.tsx`

**Interfaces:**
- Placeholder props: `{ label, title, body, cta, mailtoSubject, back, locale }`。
- Pages consume: `docs.*` / `download.*`、`contact.email`。

- [ ] **Step 1: Placeholder.tsx**:暗色全屏占位——label、title(hero-title 风格)、body、CTA(mailto)、返回首页 `Link`(`/{locale}`)。`setRequestLocale` + `getTranslations`。
- [ ] **Step 2: docs/page.tsx、download/page.tsx**:`generateStaticParams`(若 layout 已有则免)、`setRequestLocale(locale)`、读对应 i18n、渲染 Placeholder。
- [ ] **Step 3: 验证** `npm run build` 成功;dev 下 `/zh/docs`、`/en/download` 等四个页面渲染正常,留资 CTA 与返回链接可用。
- [ ] **Step 4: 提交** `feat(pages): add docs/download placeholder pages`

---

## Task 16: page.tsx 重排 + 移除下线 section

**Files:** Modify `app/[locale]/page.tsx`

**Interfaces:**
- Produces: 9 节顺序:`Hero → TrustBar → Problem → Products → PlatformDossier → CapabilityMatrix → Evolution → Industries → Company → CTAContact → Footer`(Company + CTAContact 共同构成第 9 节;Footer 在外)。
- 移除 import/引用:`WhyNow`、`Pitch`、`Spaces`、`Architecture`、`Harness`、`Scenarios`、`Market`(组件文件保留)。

- [ ] **Step 1: 改 imports 与 JSX 顺序** 为上面 9 节 + Footer;Nav 在最前。
- [ ] **Step 2: 验证**

Run: `npm run build`
Expected: 成功,无未使用 import 报错(ESLint)。
Run: `npm run test`
Expected: 全绿(含 compliance)。

- [ ] **Step 3: 提交** `refactor(home): reorder to 9-section platform narrative`

---

## Task 17: meta / sitemap

**Files:** Modify `app/sitemap.ts`(加 `/docs`、`/download`);确认 `app/robots.ts` 无需改。

**Interfaces:**
- meta/OG 已由 `meta.*` i18n 驱动(Task 3 已改),`layout.tsx` 无需动逻辑。

- [ ] **Step 1: 读 `app/sitemap.ts`**,为每个 locale 加 `/docs`、`/download` 条目。
- [ ] **Step 2: 验证** `npm run build` 成功;`/sitemap.xml` 含新路径。
- [ ] **Step 3: 提交** `chore(seo): add docs/download to sitemap`

---

## Task 18: 终验(build + lint + test + 合规 grep + dev 截图)

**Files:** 无(仅验证)

- [ ] **Step 1: 全量校验**

```bash
npm run lint
npm run test
npm run build
```
Expected: 三者全过。

- [ ] **Step 2: 合规 grep 兜底**(测试之外再人工 grep)

```bash
grep -rn -E "李承泽|XX-3|99\.2|ROI 37|年省|1200w|Epsilon3|Synera|总师签字|22\.4|765 亿" messages components app || echo "CLEAN"
```
Expected: `CLEAN`。

- [ ] **Step 3: dev 跑起来,逐屏核对**:`npm run dev`,用 Playwright/浏览器看 `/zh` 与 `/en`:9 节顺序、Hero 无产品名、双 CTA 主次可辨、TrustBar GAIA 外链、矩阵无溢出、占位页可达、语言切换保持路径。截图存档。
- [ ] **Step 4: 资深前端自审**:组件职责单一、复用合理、无 hacky;i18n key zh/en 对齐(无缺 key 运行时报错)。
- [ ] **Step 5: 最终提交(若有零碎修正)** `chore: final polish for revamp`

---

## Self-Review(plan vs spec)

- **Spec §3 合规脱敏** → Task 1(守卫)+ Task 3(messages)+ Task 8(PlatformDossier)+ Task 18(grep)。✓
- **Spec §4 导航** → Task 4。✓
- **Spec §5 九节** → Hero T5 / TrustBar T6 / Problem+WhyNow T7 / Products T12 / 3Studio T8 / 能力矩阵 T9 / Evolution T10 / Industries T11 / Company+CTA T13;page 重排 T16;下线 Harness/Scenarios/Spaces/Architecture/WhyNow/Pitch/Market 在 T16。✓
- **Spec §6 Hero 文案** → Task 3(i18n)+ Task 5。✓
- **Spec §7 视觉/CTA/i18n/meta** → btn-secondary T2、i18n T3、meta T3、sitemap T17。✓
- **Spec §8 占位页** → Task 15。✓
- **类型/键名一致性**:组件消费的 key 均在 Task 3 的键树中定义(nav.*/hero.*/trust.*/problem.*/products.*/capability.*/evolution.*/industries.*/company.*/cta.*/footer.*/docs.*/download.*/platform.*)。✓
- 占位符扫描:无 TBD/TODO;`platform` 块在 Task 3 标注"沿用+Task 8 脱敏",Task 8 给出逐项替换,非占位。✓
