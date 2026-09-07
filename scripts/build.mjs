#!/usr/bin/env node
/**
 * Build the Agent Hub static site (docs/) from agents/<slug>/.
 *
 * Per agent:
 *   agents/<slug>/agent.yaml       flat key: value (name, tagline, accent, status, order)
 *   agents/<slug>/guide/index.md   user guide (markdown subset, images from ../assets/)
 *   agents/<slug>/updates/*.md     one release entry per file, frontmatter version/date/title
 *   agents/<slug>/updates/mocks/   optional HTML sidecars inlined beside the matching entry
 *   agents/<slug>/assets/          screenshots, copied to docs/<slug>/assets/
 *
 * Output: docs/index.html, docs/<slug>/index.html (guide),
 *         docs/<slug>/updates.html, docs/<slug>/updates.json, docs/<slug>/assets/*
 *
 * Usage: node scripts/build.mjs
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AGENTS_DIR = join(ROOT, "agents");
const OUT = join(ROOT, "docs");

/* ------------------------------- helpers --------------------------------- */

export const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const versionChip = (v) => (/^\d/.test(v) ? `v${v}` : v);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const formatDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${MONTHS[m - 1] ?? ""} ${y}`;
};
const shortDate = (ymd) => {
  const [, m, d] = ymd.split("-");
  const mons = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${Number(d)} ${mons[Number(m) - 1] ?? ""}`;
};

/** Inline markdown: images, links, bold, italic, code. House rule: no em-dashes. */
function inline(md) {
  return escapeHtml(md.replace(/\s*[—–]\s*/g, ", "))
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
      `<figure class="shot"><img src="${src}" alt="${alt}" loading="lazy">` +
      (alt ? `<figcaption>${alt}</figcaption>` : "") + `</figure>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** Block markdown subset: h1-h3, paragraphs, ul/ol, tables, blockquotes, images. */
function mdToHtml(md) {
  const out = [];
  // strip HTML comments (screenshot placeholders etc.)
  md = md.replace(/<!--[\s\S]*?-->/g, "");
  for (const block of md.split(/\n\s*\n/)) {
    const lines = block.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    const first = lines[0].trim();
    if (/^#{1,4}\s/.test(first)) {
      const level = first.match(/^#+/)[0].length;
      const text = first.replace(/^#+\s*/, "");
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      const rest = lines.slice(1);
      if (rest.length) out.push(...mdBlockLines(rest));
      continue;
    }
    out.push(...mdBlockLines(lines));
  }
  return out.join("\n");
}

function mdBlockLines(lines) {
  const out = [];
  const t = lines.map((l) => l.trim());
  if (t.every((l) => l.startsWith("|"))) {
    const rows = t.filter((l) => !/^\|[\s:-]+\|/.test(l.replace(/\|/g, "|")) || !/^[|\s:-]+$/.test(l));
    const cells = (row) => row.replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
    const [head, ...body] = rows;
    out.push(
      `<div class="tablewrap"><table><thead><tr>${cells(head).map((c) => `<th>${c}</th>`).join("")}</tr></thead>` +
      `<tbody>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
    );
  } else if (t.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
    out.push(`<ul>${t.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`);
  } else if (t.every((l) => /^\d+[.)]\s/.test(l))) {
    out.push(`<ol>${t.map((l) => `<li>${inline(l.replace(/^\d+[.)]\s*/, ""))}</li>`).join("")}</ol>`);
  } else if (t.every((l) => l.startsWith(">"))) {
    out.push(`<blockquote>${inline(t.map((l) => l.replace(/^>\s?/, "")).join(" "))}</blockquote>`);
  } else if (/^!\[[^\]]*\]\([^)]+\)$/.test(t.join(" ").trim()) && t.length === 1) {
    out.push(inline(t[0]));
  } else {
    out.push(`<p>${inline(t.join(" "))}</p>`);
  }
  return out;
}

/* --------------------------- data loading -------------------------------- */

function parseYaml(path) {
  const meta = {};
  if (!existsSync(path)) return meta;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const kv = /^(\w[\w-]*):\s*(.+)$/.exec(line.trim());
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return meta;
}

function parseEntry(dir, filename) {
  const raw = readFileSync(join(dir, filename), "utf8");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${filename}: missing frontmatter`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.+)$/.exec(line.trim());
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  for (const key of ["version", "date", "title"])
    if (!meta[key]) throw new Error(`${filename}: frontmatter needs "${key}"`);
  return { ...meta, body: m[2].trim(), filename };
}

function loadAgent(slug) {
  const dir = join(AGENTS_DIR, slug);
  const meta = parseYaml(join(dir, "agent.yaml"));
  const updatesDir = join(dir, "updates");
  const entries = existsSync(updatesDir)
    ? readdirSync(updatesDir)
        .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
        .map((f) => parseEntry(updatesDir, f))
        .sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? 1 : -1;
          return b.version.localeCompare(a.version, undefined, { numeric: true });
        })
    : [];
  const guidePath = join(dir, "guide", "index.md");
  const guide = existsSync(guidePath) ? readFileSync(guidePath, "utf8") : "";
  return {
    slug,
    name: meta.name ?? slug,
    tagline: meta.tagline ?? "",
    accent: meta.accent ?? "#2B4C8C",
    accentDark: meta.accent_dark ?? meta.accent ?? "#8CACE4",
    status: meta.status ?? "",
    order: Number(meta.order ?? 99),
    entries,
    guide,
    dir,
  };
}

/* ------------------------------ page shell ------------------------------- */

function css(accent, accentDark) {
  return `
:root {
  --paper:#FAFAF7; --panel:#F1F2EE; --ink:#1C2530; --ink-soft:#4C5866;
  --line:#D8DCD9; --accent:${accent}; --accent-ink:#FFFFFF; --code-bg:#ECEEE9;
  --surface:#FFFFFF; --sink:#EEF1EC; --ink55:#4C5866;
  --green:#01977C; --green-soft:#D6F2EA; --blue:#2289E8; --blue-soft:#E4F1FE;
  --alert:#F2554C; --shadow:0 10px 30px rgba(20,22,26,0.08);
}
@media (prefers-color-scheme: dark) { :root {
  --paper:#14181F; --panel:#1B212B; --ink:#D9DEE5; --ink-soft:#97A2B0;
  --line:#2C3441; --accent:${accentDark}; --accent-ink:#0F1420; --code-bg:#202734;
  --surface:#1B212B; --sink:#161B23; --ink55:#97A2B0;
  --green:#5FCDB4; --green-soft:#173029; --blue:#7FB8F0; --blue-soft:#182636;
  --alert:#E08A7A; --shadow:0 10px 30px rgba(0,0,0,0.35);
} }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:var(--paper); color:var(--ink);
  font-family:"Public Sans",-apple-system,"Segoe UI",sans-serif;
  font-size:16.5px; line-height:1.65; }
a { color:var(--accent); text-decoration-thickness:1px; text-underline-offset:2px; }
code, .mono { font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  font-size:0.86em; background:var(--code-bg); padding:1px 5px; border-radius:3px; }
.mono { background:none; padding:0; }
.nav { position:sticky; top:0; z-index:10; background:var(--paper);
  border-bottom:1px solid var(--line); display:flex; gap:4px; flex-wrap:wrap;
  align-items:center; padding:10px clamp(16px,6vw,64px); }
.nav a { font-family:"IBM Plex Mono",monospace; font-size:12.5px; letter-spacing:0.04em;
  color:var(--ink-soft); text-decoration:none; padding:4px 10px; border-radius:999px; }
.nav a:hover, .nav a.on { color:var(--accent); background:var(--panel); }
.wrap { max-width:760px; margin:0 auto; padding:0 clamp(16px,6vw,32px) 96px; }
header.masthead { padding-top:52px; }
.eyebrow { font-family:"IBM Plex Mono",monospace; font-size:12px; letter-spacing:0.14em;
  text-transform:uppercase; color:var(--accent); }
h1 { font-family:"Archivo",sans-serif; font-weight:700; font-size:clamp(32px,6vw,44px);
  line-height:1.05; letter-spacing:-0.015em; margin:10px 0 14px; text-wrap:balance; }
h2 { font-family:"Archivo",sans-serif; font-weight:650; font-size:24px;
  letter-spacing:-0.01em; line-height:1.25; margin:44px 0 10px; }
h3 { font-family:"Archivo",sans-serif; font-weight:600; font-size:18px; margin:28px 0 8px; }
.lede { font-size:18px; color:var(--ink-soft); max-width:58ch; margin:0; }
.badge { display:inline-flex; align-items:center; gap:6px; padding:3px 10px;
  border-radius:999px; font-family:"IBM Plex Mono",monospace; font-size:11.5px;
  font-weight:600; letter-spacing:0.04em; background:var(--panel); color:var(--ink-soft);
  border:1px solid var(--line); }
.badge.acc { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.strip { display:flex; flex-wrap:wrap; gap:8px 10px; align-items:center; margin-top:22px; }
section.rel { margin-top:56px; padding-top:8px; }
.sec-num { font-family:"IBM Plex Mono",monospace; font-size:12px; font-weight:600;
  letter-spacing:0.06em; color:var(--ink-soft); }
.sec-num b { color:var(--accent); font-weight:600; }
section.rel h2 { margin:6px 0 8px; }
.sec-sub { margin:0 0 18px; max-width:64ch; color:var(--ink-soft); font-size:15.5px; }
ul, ol { padding-left:22px; margin:0 0 16px; }
li { margin:6px 0; }
li strong { color:var(--ink); }
p { max-width:66ch; }
blockquote { margin:16px 0; padding:10px 16px; border-left:3px solid var(--accent);
  background:var(--panel); border-radius:0 8px 8px 0; color:var(--ink-soft); }
.tablewrap { overflow-x:auto; margin:16px 0; }
table { border-collapse:collapse; width:100%; font-size:14.5px; }
th { text-align:left; font-family:"IBM Plex Mono",monospace; font-size:11.5px;
  letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-soft);
  border-bottom:2px solid var(--line); padding:8px 12px 6px 0; }
td { border-bottom:1px solid var(--line); padding:9px 12px 9px 0; vertical-align:top; }
figure.shot { margin:22px 0; }
figure.shot img { max-width:100%; border:1px solid var(--line); border-radius:14px;
  box-shadow:var(--shadow); display:block; }
figure.shot figcaption { font-family:"IBM Plex Mono",monospace; font-size:12px;
  color:var(--ink-soft); margin-top:8px; }
.duo { display:grid; grid-template-columns:minmax(0,7fr) minmax(0,5fr); gap:26px; align-items:start; }
@media (max-width:780px) { .duo { grid-template-columns:1fr; } }
.notes { display:flex; flex-direction:column; gap:12px; }
.note { padding:13px 16px; background:var(--surface); border:1px solid var(--line);
  border-radius:14px; font-size:14.5px; }
.note b { display:block; margin-bottom:3px; }
.note span { color:var(--ink-soft); }
.try { font-family:"IBM Plex Mono",monospace; font-size:11px; font-weight:700;
  letter-spacing:0.1em; text-transform:uppercase; color:var(--ink-soft); margin:0 0 10px; }
.mock { background:var(--surface); border:1px solid var(--line); border-radius:16px;
  box-shadow:var(--shadow); overflow:hidden; margin-bottom:16px; }
.filter { margin-top:30px; }
.filter input { width:100%; max-width:420px; padding:10px 14px; font:inherit; font-size:15px;
  color:var(--ink); background:var(--surface); border:1px solid var(--line); border-radius:10px; }
.filter input:focus { outline:2px solid var(--accent); outline-offset:1px; }
table.skills td:first-child { white-space:nowrap; font-family:"IBM Plex Mono",monospace;
  font-size:13px; padding-right:18px; }
table.skills td:first-child a { text-decoration:none; }
table.skills .surf { display:inline-block; margin:1px 3px 1px 0; padding:1px 7px;
  border-radius:999px; background:var(--panel); border:1px solid var(--line);
  font-family:"IBM Plex Mono",monospace; font-size:10.5px; color:var(--ink-soft); }
table.skills .surf.all { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.count { font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink-soft); }
.cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:18px; margin-top:36px; }
.card { display:block; text-decoration:none; color:var(--ink); background:var(--surface);
  border:1px solid var(--line); border-radius:16px; padding:22px 22px 18px;
  box-shadow:var(--shadow); border-top:3px solid var(--card-accent, var(--accent));
  transition:transform 0.12s ease; }
.card:hover { transform:translateY(-2px); }
.card h2 { margin:0 0 6px; font-size:22px; }
.card .tag { color:var(--ink-soft); font-size:14.5px; margin:0 0 14px; min-height:44px; }
.card .meta { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.card .links { margin-top:16px; display:flex; gap:14px;
  font-family:"IBM Plex Mono",monospace; font-size:12.5px; }
.card .links span { color:var(--card-accent, var(--accent)); }
footer { margin-top:80px; padding-top:20px; border-top:1px solid var(--line);
  font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink-soft); }
`;
}

function page({ title, accent, accentDark, nav, body, root = "." }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Public+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;700&display=swap">
<style>${css(accent, accentDark)}</style>
</head>
<body>
<nav class="nav">${nav}</nav>
<div class="wrap">
${body}
<footer>Agent Hub · built ${new Date().toISOString().slice(0, 10)} · <a href="${root}/index.html">all agents</a></footer>
</div>
</body>
</html>`;
}

/* --------------------------- updates rendering --------------------------- */

function renderEntryBody(e, agent) {
  const blocks = e.body.split(/\n\s*\n/);
  let sub = "";
  const paras = [];
  const notes = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.every((l) => l.startsWith("- "))) {
      for (const l of lines) {
        const item = l.slice(2);
        const lead = /^\*\*([^*]+)\*\*[:.]?\s*(.*)$/.exec(item);
        if (lead) notes.push(`<div class="note"><b>${inline(lead[1])}</b><span>${inline(lead[2])}</span></div>`);
        else notes.push(`<div class="note"><span>${inline(item)}</span></div>`);
      }
    } else {
      const html = `<p>${inline(lines.join(" "))}</p>`;
      if (!sub && !/^!\[/.test(lines[0])) sub = `<p class="sec-sub">${inline(lines.join(" "))}</p>`;
      else paras.push(html);
    }
  }
  const mockPath = join(agent.dir, "updates", "mocks", e.filename.replace(/\.md$/, ".html"));
  const mock = existsSync(mockPath) ? readFileSync(mockPath, "utf8") : "";
  const heroImg = e.image
    ? `<figure class="shot"><img src="${escapeHtml(e.image)}" alt="" loading="lazy"></figure>`
    : "";
  const noteCol = notes.length ? `<div class="notes">${notes.join("\n")}</div>` : "";
  const content = mock
    ? `<div class="duo"><div class="mockcol">${mock}</div>${noteCol || "<div></div>"}</div>`
    : noteCol;
  return { sub, paras: paras.join("\n"), content, hero: heroImg };
}

function buildAgentPages(agent, allAgents) {
  const outDir = join(OUT, agent.slug);
  mkdirSync(outDir, { recursive: true });

  const nav = (active) =>
    [
      `<a href="../index.html">AGENT HUB</a>`,
      `<a href="index.html" class="${active === "guide" ? "on" : ""}">GUIDE</a>`,
      `<a href="updates.html" class="${active === "updates" ? "on" : ""}">RELEASE NOTES</a>`,
    ].join("");

  const statusBadge = agent.status ? `<span class="badge acc">${escapeHtml(agent.status)}</span>` : "";
  const latest = agent.entries[0];

  /* guide */
  const guideBody = `
<header class="masthead">
  <span class="eyebrow">${escapeHtml(agent.name)} · User guide</span>
  <h1>${escapeHtml(agent.name)}</h1>
  <p class="lede">${inline(agent.tagline)}</p>
  <div class="strip">${statusBadge}${latest ? `<span class="badge">latest: ${escapeHtml(versionChip(latest.version))}</span>` : ""}<a class="badge" href="updates.html" style="text-decoration:none">release notes →</a></div>
</header>
${mdToHtml(agent.guide || "*Guide coming soon.*")}`;
  writeFileSync(
    join(outDir, "index.html"),
    page({ title: `${agent.name} · User guide`, accent: agent.accent, accentDark: agent.accentDark, nav: nav("guide"), body: guideBody, root: ".." })
  );

  /* updates */
  const items = agent.entries
    .map((e) => {
      const { sub, paras, content, hero } = renderEntryBody(e, agent);
      const anchor = versionChip(e.version).replace(/[^a-z0-9.]+/gi, "-").toLowerCase();
      return `
<section class="rel" id="${anchor}">
  <div class="sec-num"><b>${escapeHtml(versionChip(e.version).toUpperCase())}</b> · ${escapeHtml(shortDate(e.date))} ${e.date.slice(0, 4)}</div>
  <h2>${inline(e.title)}</h2>
  ${sub}
  ${hero}
  ${paras}
  ${content}
</section>`;
    })
    .join("\n");
  const updatesBody = `
<header class="masthead">
  <span class="eyebrow">${escapeHtml(agent.name)} · Release notes</span>
  <h1>What shipped</h1>
  <p class="lede">${inline(agent.tagline)} Newest first.</p>
  <div class="strip">${statusBadge}${latest ? `<span class="badge">latest: ${escapeHtml(versionChip(latest.version))} · ${escapeHtml(formatDate(latest.date))}</span>` : ""}<a class="badge" href="index.html" style="text-decoration:none">user guide →</a></div>
</header>
${items || "<p class='sec-sub'>No releases yet.</p>"}`;
  writeFileSync(
    join(outDir, "updates.html"),
    page({ title: `${agent.name} · Release notes`, accent: agent.accent, accentDark: agent.accentDark, nav: nav("updates"), body: updatesBody, root: ".." })
  );

  /* feed */
  writeFileSync(
    join(outDir, "updates.json"),
    JSON.stringify(
      agent.entries.map((e) => ({
        agent: agent.slug,
        version: e.version,
        date: e.date,
        title: e.title,
        url: `./${agent.slug}/updates.html#${versionChip(e.version).replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`,
      })),
      null,
      2
    )
  );

  /* assets */
  const assets = join(agent.dir, "assets");
  if (existsSync(assets)) {
    const dest = join(outDir, "assets");
    mkdirSync(dest, { recursive: true });
    for (const f of readdirSync(assets)) {
      if (statSync(join(assets, f)).isFile()) copyFileSync(join(assets, f), join(dest, f));
    }
  }
}

/* ----------------------------- skills reference --------------------------- */

function buildSkillsPage(data) {
  const total = Object.keys(data.surfaceLabels).length;
  const short = { "claude-code": "claude", grok: "grok", hermes: "hermes", codex: "codex",
    openclaw: "openclaw", openglow: "openglow", brian: "brian", oracle: "oracle" };
  const rows = data.skills
    .map((s) => {
      const badges =
        s.surfaces.length === total
          ? `<span class="surf all">all agents</span>`
          : s.surfaces.map((x) => `<span class="surf">${escapeHtml(short[x] ?? x)}</span>`).join("") ||
            `<span class="surf">catalog only</span>`;
      return `<tr data-k="${escapeHtml(`${s.name} ${s.purpose}`.toLowerCase())}">
<td><a href="https://github.com/thomasgoubau1980/personal-agent-skills/tree/main/skills/${s.name}">${escapeHtml(s.name)}</a></td>
<td>${escapeHtml(s.purpose)}</td>
<td>${badges}</td></tr>`;
    })
    .join("\n");
  const body = `
<header class="masthead">
  <span class="eyebrow">Fleet · Skills reference</span>
  <h1>Every skill, in plain English</h1>
  <p class="lede">All ${data.skills.length} skills in the <a href="https://github.com/thomasgoubau1980/personal-agent-skills">personal-agent-skills</a> catalog: what each one is for and which agents carry it. Regenerated on every hub publish, so this never goes stale.</p>
  <div class="filter"><input id="q" type="search" placeholder="Filter by name or purpose..." aria-label="Filter skills"> <span class="count" id="n">${data.skills.length} skills</span></div>
</header>
<div class="tablewrap"><table class="skills">
<thead><tr><th>Skill</th><th>What it is for</th><th>Deployed to</th></tr></thead>
<tbody id="rows">
${rows}
</tbody></table></div>
<script>
const q=document.getElementById("q"),n=document.getElementById("n"),rs=[...document.querySelectorAll("#rows tr")];
q.addEventListener("input",()=>{const v=q.value.toLowerCase().trim();let c=0;
for(const r of rs){const hit=!v||r.dataset.k.includes(v);r.style.display=hit?"":"none";if(hit)c++;}
n.textContent=c+" skill"+(c===1?"":"s");});
</script>`;
  writeFileSync(
    join(OUT, "skills.html"),
    page({
      title: "Skills reference",
      accent: "#2B4C8C",
      accentDark: "#8CACE4",
      nav: `<a href="index.html">AGENT HUB</a><a href="skills.html" class="on">SKILLS</a>`,
      body,
      root: ".",
    })
  );
}

/* ------------------------------- hub index -------------------------------- */

function buildIndex(agents, skillCount) {
  const cards = agents
    .map((a) => {
      const latest = a.entries[0];
      return `
<a class="card" href="${a.slug}/index.html" style="--card-accent:${a.accent}">
  <h2>${escapeHtml(a.name)}</h2>
  <p class="tag">${inline(a.tagline)}</p>
  <div class="meta">
    ${a.status ? `<span class="badge acc" style="background:var(--card-accent);border-color:var(--card-accent)">${escapeHtml(a.status)}</span>` : ""}
    ${latest ? `<span class="badge">${escapeHtml(versionChip(latest.version))} · ${escapeHtml(formatDate(latest.date))}</span>` : ""}
  </div>
  <div class="links"><span>user guide →</span><span>release notes →</span></div>
</a>`;
    })
    .join("\n");
  const body = `
<header class="masthead">
  <span class="eyebrow">Thomas Goubau · Agent fleet</span>
  <h1>Agent Hub</h1>
  <p class="lede">User guides and release notes for every agent in the fleet, in one place. Pick an agent to see what it does and what shipped.</p>
</header>
<div class="cards">${cards}</div>
${skillCount ? `<h2>Reference</h2>
<a class="card" href="skills.html" style="--card-accent:#2B4C8C">
  <h2>Skills reference</h2>
  <p class="tag">Every skill in the fleet catalog, what it is for in plain English, and which agents carry it.</p>
  <div class="meta"><span class="badge">${skillCount} skills</span></div>
  <div class="links"><span>browse the table →</span></div>
</a>` : ""}`;
  writeFileSync(
    join(OUT, "index.html"),
    page({ title: "Agent Hub", accent: "#2B4C8C", accentDark: "#8CACE4", nav: `<a href="index.html" class="on">AGENT HUB</a>${skillCount ? `<a href="skills.html">SKILLS</a>` : ""}`, body, root: "." })
  );
}

/* --------------------------------- main ----------------------------------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, ".nojekyll"), "");

const agents = readdirSync(AGENTS_DIR)
  .filter((d) => statSync(join(AGENTS_DIR, d)).isDirectory())
  .map(loadAgent)
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

if (!agents.length) throw new Error("No agents in agents/");
for (const a of agents) buildAgentPages(a, agents);

const skillsJson = join(ROOT, "fleet", "skills.json");
let skillCount = 0;
if (existsSync(skillsJson)) {
  const data = JSON.parse(readFileSync(skillsJson, "utf8"));
  buildSkillsPage(data);
  skillCount = data.skills.length;
}
buildIndex(agents, skillCount);
console.log(`Built ${agents.length} agents + ${skillCount} skills → docs/ (${agents.map((a) => a.slug).join(", ")})`);
