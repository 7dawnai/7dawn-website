# 官网文档区(/docs)实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 3Studio 用户文档快照搬进官网,`/docs` 从 Placeholder 变为侧边栏 + 正文的真实文档区。

**Architecture:** 文档 Markdown 快照存放在 `content/docs/`(来源 `3studio-b@8d97a37ef42f` 的 `docs/user/`,不含 README);`lib/docs.ts` 负责读取 nav.json / 解析 frontmatter / 链接改写;`app/[locale]/docs/[...slug]/page.tsx` 用 react-markdown 全静态渲染,zh/en 两个 locale 渲染同一份中文内容。

**Tech Stack:** Next.js 15 App Router、next-intl、Tailwind 4、react-markdown + remark-gfm(本计划新增的唯一两个依赖)、vitest。

**Spec:** `docs/superpowers/specs/2026-07-10-docs-section-design.md`

## Global Constraints

- 交流与文档用中文,代码注释用英文。
- 新依赖仅限 `react-markdown` 与 `remark-gfm`,不引入 gray-matter / typography 插件。
- 不复制源目录的 `README.md`(写作约定,不上官网)。
- frontmatter 三字段(`title` / `description` / `last_verified_commit`)原样保留在快照中;页面不展示 `last_verified_commit`。
- 不做搜索、页内 TOC、上一页/下一页(最小版)。
- 不 reformat 既有文件;diff 控制在任务所需的最小范围。
- 包管理器用 `pnpm`;测试命令 `pnpm test`,构建 `pnpm build`。
- vitest 没有配置 `@/` alias:测试文件里用相对路径导入(如 `../lib/docs`)。

---

### Task 1: 内容快照 + compliance 扫描扩展

**Files:**
- Create: `content/docs/getting-started.md`、`content/docs/faq.md`、`content/docs/nav.json`、`content/docs/guides/*.md`(8 篇)
- Modify: `tests/compliance.test.ts:41-44`(files 数组)

**Interfaces:**
- Consumes: 无(首个任务)
- Produces: `content/docs/` 目录结构——根下 `getting-started.md`、`faq.md`、`nav.json`,子目录 `guides/` 下 8 篇 md。后续任务的 `lib/docs.ts` 以 `join(process.cwd(), "content/docs")` 为内容根目录。

- [ ] **Step 1: 复制快照文件**

```bash
mkdir -p content/docs/guides
cp /Users/tristan/projects/aeroship/3studio-b/docs/user/getting-started.md \
   /Users/tristan/projects/aeroship/3studio-b/docs/user/faq.md \
   /Users/tristan/projects/aeroship/3studio-b/docs/user/nav.json \
   content/docs/
cp /Users/tristan/projects/aeroship/3studio-b/docs/user/guides/*.md content/docs/guides/
```

注意:**不要**复制 `README.md`。复制后 `ls content/docs content/docs/guides` 应为:根下 3 个文件,guides 下 8 个 md(agents / chat / computer-panel / files / matlab-stk / mbse / replay / settings)。

- [ ] **Step 2: 把 content 目录纳入 compliance 扫描**

`tests/compliance.test.ts` 中 files 数组改为:

```ts
  const files = [
    ...collectFiles("messages", [".json"]),
    ...collectFiles("components", [".tsx"]),
    ...collectFiles("content", [".md", ".json"]),
  ];
```

- [ ] **Step 3: 运行测试确认快照内容干净**

Run: `pnpm test`
Expected: 全部 PASS(如有 banned string 命中,停下向用户报告,不要自行删改文档内容)。

- [ ] **Step 4: Commit**

```bash
git add content tests/compliance.test.ts
git commit -m "content: snapshot 3studio user docs (3studio-b@8d97a37ef42f)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: lib/docs.ts(导航 / frontmatter / 链接改写)

**Files:**
- Create: `lib/docs.ts`
- Test: `tests/docs.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `content/docs/` 目录。
- Produces(后续任务按这些签名调用):
  - `type DocMeta = { title: string; description: string }`
  - `type NavPage = { path: string; title: string }`、`type NavSection = { title: string; pages: NavPage[] }`
  - `loadNav(): NavSection[]` — 读 `content/docs/nav.json` 的 `sections`
  - `pathToSlug(path: string): string` — `"guides/chat.md"` → `"guides/chat"`
  - `allSlugs(): string[][]` — nav 中全部页面的 slug 段数组(供 `generateStaticParams`)
  - `loadDoc(slug: string[]): { meta: DocMeta; body: string } | null` — 找不到文件返回 null
  - `rewriteDocLink(href: string, currentDir: string, locale: string): string` — `currentDir` 为当前页所在目录(根页 `""`,指南页 `"guides"`)

- [ ] **Step 1: 写失败的测试**

创建 `tests/docs.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  rewriteDocLink,
  loadNav,
  loadDoc,
  pathToSlug,
  allSlugs,
} from "../lib/docs";

describe("rewriteDocLink", () => {
  it("rewrites same-directory relative links", () => {
    expect(rewriteDocLink("./computer-panel.md", "guides", "zh")).toBe(
      "/zh/docs/guides/computer-panel",
    );
  });
  it("rewrites parent-directory links", () => {
    expect(rewriteDocLink("../faq.md", "guides", "en")).toBe("/en/docs/faq");
  });
  it("rewrites root-page links into subdirectories", () => {
    expect(rewriteDocLink("./guides/agents.md", "", "zh")).toBe(
      "/zh/docs/guides/agents",
    );
  });
  it("preserves anchors", () => {
    expect(rewriteDocLink("./chat.md#添加附件", "guides", "zh")).toBe(
      "/zh/docs/guides/chat#添加附件",
    );
  });
  it("leaves external links untouched", () => {
    expect(rewriteDocLink("https://example.com/a.md", "guides", "zh")).toBe(
      "https://example.com/a.md",
    );
  });
  it("leaves pure anchors and absolute paths untouched", () => {
    expect(rewriteDocLink("#总览", "guides", "zh")).toBe("#总览");
    expect(rewriteDocLink("/zh/docs/faq", "guides", "zh")).toBe("/zh/docs/faq");
  });
});

describe("content/docs consistency", () => {
  const nav = loadNav();

  it("nav.json has sections with pages", () => {
    expect(nav.length).toBeGreaterThanOrEqual(3);
    expect(allSlugs().length).toBeGreaterThanOrEqual(10);
  });

  for (const section of nav) {
    for (const page of section.pages) {
      it(`${page.path} exists with complete frontmatter`, () => {
        const doc = loadDoc(pathToSlug(page.path).split("/"));
        expect(doc).not.toBeNull();
        expect(doc!.meta.title).not.toBe("");
        expect(doc!.meta.description).not.toBe("");
      });
    }
  }

  it("redirect target getting-started exists", () => {
    expect(loadDoc(["getting-started"])).not.toBeNull();
  });

  it("unknown slug returns null", () => {
    expect(loadDoc(["no-such-page"])).toBeNull();
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `pnpm test tests/docs.test.ts`
Expected: FAIL,报错为找不到模块 `../lib/docs`。

- [ ] **Step 3: 实现 lib/docs.ts**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type DocMeta = { title: string; description: string };
export type NavPage = { path: string; title: string };
export type NavSection = { title: string; pages: NavPage[] };

const CONTENT_DIR = join(process.cwd(), "content/docs");

export function loadNav(): NavSection[] {
  const raw = readFileSync(join(CONTENT_DIR, "nav.json"), "utf8");
  return (JSON.parse(raw) as { sections: NavSection[] }).sections;
}

export function pathToSlug(path: string): string {
  return path.replace(/\.md$/, "");
}

export function allSlugs(): string[][] {
  return loadNav().flatMap((s) => s.pages.map((p) => pathToSlug(p.path).split("/")));
}

// Fixed three-field frontmatter (title/description/last_verified_commit);
// a hand-rolled parser avoids a YAML dependency.
function parseFrontmatter(raw: string): { meta: DocMeta; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { meta: { title: "", description: "" }, body: raw };
  const fields: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    meta: { title: fields.title ?? "", description: fields.description ?? "" },
    body: raw.slice(m[0].length),
  };
}

export function loadDoc(slug: string[]): { meta: DocMeta; body: string } | null {
  const rel = slug.join("/");
  // Reject anything outside plain page slugs (also blocks path traversal).
  if (!/^[a-z0-9/-]+$/.test(rel) || rel.includes("..")) return null;
  let raw: string;
  try {
    raw = readFileSync(join(CONTENT_DIR, `${rel}.md`), "utf8");
  } catch {
    return null;
  }
  return parseFrontmatter(raw);
}

export function rewriteDocLink(href: string, currentDir: string, locale: string): string {
  // External schemes, pure anchors, and absolute paths pass through.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#") || href.startsWith("/")) {
    return href;
  }
  const [path, anchor] = href.split("#");
  if (!path.endsWith(".md")) return href;
  const segs = currentDir ? currentDir.split("/") : [];
  for (const part of path.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") segs.pop();
    else segs.push(part);
  }
  const slug = segs.join("/").replace(/\.md$/, "");
  return `/${locale}/docs/${slug}${anchor ? `#${anchor}` : ""}`;
}
```

- [ ] **Step 4: 运行确认通过**

Run: `pnpm test`
Expected: 全部 PASS(含既有 compliance / i18n 测试)。

- [ ] **Step 5: Commit**

```bash
git add lib/docs.ts tests/docs.test.ts
git commit -m "feat(docs): add docs content loader and link rewriter

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Markdown 渲染组件 + 正文排版样式

**Files:**
- Modify: `package.json`(新增依赖)
- Create: `components/DocsMarkdown.tsx`
- Modify: `app/globals.css`(文件末尾追加 `.docs-prose` 块)

**Interfaces:**
- Consumes: `rewriteDocLink(href, currentDir, locale)`(Task 2)。
- Produces: `<DocsMarkdown body={string} currentDir={string} locale={string} />` — 服务端组件,渲染 `.docs-prose` 容器内的 Markdown 正文。

- [ ] **Step 1: 安装依赖**

```bash
pnpm add react-markdown remark-gfm
```

理由(记录在案):文档使用 GFM 表格(matlab-stk / mbse 两页),且需要用 React 组件覆写 `a` 渲染做站内链接改写;标准库无 Markdown 能力。

- [ ] **Step 2: 创建 components/DocsMarkdown.tsx**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { rewriteDocLink } from "@/lib/docs";

export default function DocsMarkdown({
  body,
  currentDir,
  locale,
}: {
  body: string;
  currentDir: string;
  locale: string;
}) {
  return (
    <div className="docs-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href = "", children }) => {
            const target = rewriteDocLink(href, currentDir, locale);
            if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
              return (
                <a href={target} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            }
            if (target.startsWith("/")) {
              return <Link href={target}>{children}</Link>;
            }
            return <a href={target}>{children}</a>;
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
```

说明:不加 `"use client"`,react-markdown 可在服务端组件中渲染;不启用 raw HTML(默认行为),文档中 `<时间>` 这类尖括号文本不是合法 HTML 标签名,会按字面输出。

- [ ] **Step 3: 在 app/globals.css 末尾追加排版样式**

在文件末尾(现有最后一个规则之后)追加:

```css
@layer base {
  /* ============ Docs prose ============ */
  .docs-prose { color: var(--text-70); font-size: 15px; line-height: 1.85; }
  .docs-prose h1 {
    margin: 0 0 24px;
    font-family: var(--font-mono);
    font-size: 32px;
    font-weight: 300;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }
  .docs-prose h2 {
    margin: 40px 0 16px;
    padding-top: 24px;
    border-top: 1px solid var(--border-10);
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 400;
    color: var(--color-text);
  }
  .docs-prose h3 { margin: 28px 0 12px; font-size: 17px; font-weight: 500; color: var(--color-text); }
  .docs-prose p { margin: 0 0 16px; }
  .docs-prose ul, .docs-prose ol { margin: 0 0 16px; padding-left: 24px; }
  .docs-prose li { margin-bottom: 8px; }
  .docs-prose li > ul, .docs-prose li > ol { margin: 8px 0 0; }
  .docs-prose a {
    color: var(--color-text);
    text-decoration: underline;
    text-decoration-color: var(--border-20);
    text-underline-offset: 3px;
  }
  .docs-prose a:hover { text-decoration-color: #ffffff; }
  .docs-prose strong { color: var(--color-text); font-weight: 500; }
  .docs-prose code {
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--surface-8);
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
  .docs-prose blockquote {
    margin: 0 0 16px;
    padding: 12px 16px;
    border-left: 2px solid var(--border-20);
    background: var(--surface-3);
  }
  .docs-prose blockquote p:last-child { margin-bottom: 0; }
  .docs-prose table {
    display: block;
    width: 100%;
    margin: 0 0 16px;
    border-collapse: collapse;
    font-size: 14px;
    overflow-x: auto;
  }
  .docs-prose th, .docs-prose td {
    padding: 8px 12px;
    border: 1px solid var(--border-10);
    text-align: left;
  }
  .docs-prose th { background: var(--surface-3); color: var(--color-text); font-weight: 500; }
  .docs-prose hr { margin: 32px 0; border: 0; border-top: 1px solid var(--border-10); }
}
```

- [ ] **Step 4: 验证类型与 lint**

Run: `pnpm lint && npx tsc --noEmit`
Expected: 无错误。

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml components/DocsMarkdown.tsx app/globals.css
git commit -m "feat(docs): add markdown renderer and prose styles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 文档路由(侧边栏 + 动态页 + 首页重定向)

**Files:**
- Create: `components/DocsNav.tsx`
- Create: `app/[locale]/docs/[...slug]/page.tsx`
- Modify: `app/[locale]/docs/page.tsx`(整体替换为 redirect)

**Interfaces:**
- Consumes: `loadNav` / `allSlugs` / `loadDoc` / `pathToSlug`(Task 2),`<DocsMarkdown />`(Task 3),既有 `<Nav />` / `<Footer />`。
- Produces: 路由 `/{locale}/docs/{slug}`(10 页)与 `/{locale}/docs` → `/{locale}/docs/getting-started` 重定向;`<DocsNav nav={NavSection[]} activeSlug={string} locale={string} />`。

- [ ] **Step 1: 创建 components/DocsNav.tsx**

```tsx
import Link from "next/link";
import { pathToSlug, type NavSection } from "@/lib/docs";

export default function DocsNav({
  nav,
  activeSlug,
  locale,
}: {
  nav: NavSection[];
  activeSlug: string;
  locale: string;
}) {
  return (
    <nav>
      {nav.map((section) => (
        <div key={section.title} className="mb-6">
          <div className="mb-2 font-mono text-xs uppercase tracking-[2px] text-white/30">
            {section.title}
          </div>
          <ul className="list-none space-y-1">
            {section.pages.map((page) => {
              const slug = pathToSlug(page.path);
              const active = slug === activeSlug;
              return (
                <li key={page.path}>
                  <Link
                    href={`/${locale}/docs/${slug}`}
                    className={`block border-l py-1 pl-3 text-sm transition-colors ${
                      active
                        ? "border-white text-white"
                        : "border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: 创建 app/[locale]/docs/[...slug]/page.tsx**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DocsNav from "@/components/DocsNav";
import DocsMarkdown from "@/components/DocsMarkdown";
import { allSlugs, loadDoc, loadNav } from "@/lib/docs";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) return {};
  return { title: `${doc.meta.title} | 7dawn`, description: doc.meta.description };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const doc = loadDoc(slug);
  if (!doc) notFound();

  const nav = loadNav();
  const activeSlug = slug.join("/");
  const currentDir = slug.slice(0, -1).join("/");

  return (
    <>
      <Nav />
      <main className="mx-auto flex max-w-[1100px] items-start gap-12 px-6 pt-28 pb-24 md:px-12">
        <aside className="sticky top-28 hidden w-56 shrink-0 lg:block">
          <DocsNav nav={nav} activeSlug={activeSlug} locale={locale} />
        </aside>
        <div className="min-w-0 max-w-[720px] flex-1">
          <details className="mb-8 border border-white/10 lg:hidden">
            <summary className="cursor-pointer px-4 py-3 font-mono text-xs uppercase tracking-[2px] text-white/50">
              目录
            </summary>
            <div className="px-4 pb-4">
              <DocsNav nav={nav} activeSlug={activeSlug} locale={locale} />
            </div>
          </details>
          <DocsMarkdown body={doc.body} currentDir={currentDir} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
```

说明:正文 H1 直接来自 Markdown 首行 `# 标题`,不用 frontmatter 另行渲染标题;移动端目录的 summary 文案与文档内容一致用中文(两个 locale 都显示中文文档,见 spec 决策)。

- [ ] **Step 3: 替换 app/[locale]/docs/page.tsx 为重定向**

整个文件替换为:

```tsx
import { redirect } from "next/navigation";

export default async function DocsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/docs/getting-started`);
}
```

- [ ] **Step 4: 本地验证**

Run: `pnpm build`
Expected: 构建成功,输出的路由清单包含 `/[locale]/docs/[...slug]`(SSG,20 个静态页:zh/en × 10)。

再启动 `pnpm dev`(后台),手动核对(curl 或浏览器):
- `curl -s http://localhost:3000/zh/docs -o /dev/null -w "%{http_code} %{redirect_url}\n"` → 307 跳 `/zh/docs/getting-started`
- `curl -s http://localhost:3000/zh/docs/getting-started | grep -o "快速上手" | head -1` → 有输出
- `curl -s http://localhost:3000/en/docs/guides/mbse -o /dev/null -w "%{http_code}\n"` → 200
- `curl -s http://localhost:3000/zh/docs/no-such -o /dev/null -w "%{http_code}\n"` → 404

验证完停掉 dev server。

- [ ] **Step 5: Commit**

```bash
git add components/DocsNav.tsx "app/[locale]/docs"
git commit -m "feat(docs): render user docs with sidebar navigation

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Placeholder 清理 + sitemap + 最终验证

**Files:**
- Delete: `components/Placeholder.tsx`
- Modify: `messages/zh.json`、`messages/en.json`(删除顶层 `docs` 命名空间;保留 `nav.docs`)
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `allSlugs()`(Task 2);Task 4 已使 `Placeholder` 无引用。
- Produces: 最终可发布状态。

- [ ] **Step 1: 删除 Placeholder 组件与文案**

```bash
git rm components/Placeholder.tsx
```

`messages/zh.json` 与 `messages/en.json`:删除顶层 `"docs": { ... }` 对象(label/title/body/cta/subject/back 六个 key 的那块)。注意 `nav` 命名空间里的 `"docs": "文档"` / `"docs": "Docs"` 是导航标签,**保留**。

确认无残留引用:`grep -rn "Placeholder" app components` 应无结果。

- [ ] **Step 2: sitemap 用真实文档路由替换 /docs**

`app/sitemap.ts` 整体替换为:

```ts
import type { MetadataRoute } from "next";
import { allSlugs } from "@/lib/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://7dawn.ai";
  const paths = ["", ...allSlugs().map((s) => `/docs/${s.join("/")}`)];
  return ["zh", "en"].flatMap((locale) =>
    paths.map((p) => ({
      url: `${base}/${locale}${p}`,
      lastModified: new Date(),
      alternates: { languages: { en: `${base}/en${p}`, zh: `${base}/zh${p}` } },
    })),
  );
}
```

(`/docs` 本身是重定向,不再进 sitemap。)

- [ ] **Step 3: 全量验证**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: 测试全 PASS(i18n 测试会校验 zh/en key 对称,删除 docs 命名空间后应仍通过——若该测试报缺 key,说明只删了一边,补齐另一边);lint 无错误;build 成功。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(docs): replace docs placeholder, add doc pages to sitemap

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 验收清单(对照 spec 第 6 节)

- [ ] `/zh/docs/*` 与 `/en/docs/*` 共 20 个静态页可访问,`/docs` 重定向到快速上手
- [ ] 侧边栏按 nav.json 分组、当前页高亮
- [ ] 页间相对链接(如 `./computer-panel.md`、`../faq.md`)跳转为站内路由
- [ ] matlab-stk / mbse 的表格、getting-started 的 blockquote 渲染正常
- [ ] `pnpm test` / `pnpm lint` / `pnpm build` 全部通过
- [ ] 未复制 README.md;未新增计划外依赖
