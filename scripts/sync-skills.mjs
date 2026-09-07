#!/usr/bin/env node
/**
 * Sync the skills reference data from the personal-agent-skills catalog repo.
 *
 * Reads skills/<name>/SKILL.md frontmatter (description) and manifests/*.yaml
 * (which agent surfaces deploy each skill), merges the curated plain-English
 * purpose lines from fleet/purposes.json, and writes fleet/skills.json, which
 * build.mjs renders into docs/skills.html.
 *
 * Run by scripts/publish.sh when the catalog checkout exists; fleet/skills.json
 * is committed, so the site still builds without the checkout.
 *
 * Usage: node scripts/sync-skills.mjs [catalog-path]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = process.argv[2] ?? join(homedir(), "Developer", "personal-agent-skills");

if (!existsSync(join(CATALOG, "skills"))) {
  console.error(`No catalog at ${CATALOG}; fleet/skills.json left as is.`);
  process.exit(0);
}

const purposes = JSON.parse(readFileSync(join(ROOT, "fleet", "purposes.json"), "utf8"));

/* frontmatter description of one SKILL.md */
function description(skillDir) {
  const p = join(skillDir, "SKILL.md");
  if (!existsSync(p)) return "";
  const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(p, "utf8"));
  if (!m) return "";
  const dm = /^description:\s*([\s\S]*?)(?=\n\w[\w-]*:|$)/m.exec(m[1]);
  return dm ? dm[1].replace(/^>-?\s*/, "").replace(/^["']|["']\s*$/g, "").split(/\s+/).join(" ").trim() : "";
}

/* surfaces per skill from manifests */
const SURFACE_LABELS = {
  "claude-code": "Claude Code", grok: "Grok", hermes: "Hermes", codex: "Codex",
  openclaw: "OpenClaw", openglow: "OpenGlow", brian: "Brian", oracle: "Oracle",
};
const surfacesOf = {};
const manifestsDir = join(CATALOG, "manifests");
for (const f of readdirSync(manifestsDir).filter((f) => f.endsWith(".yaml"))) {
  const target = /^target:\s*(\S+)/m.exec(readFileSync(join(manifestsDir, f), "utf8"))?.[1];
  if (!target || !SURFACE_LABELS[target]) continue;
  const text = readFileSync(join(manifestsDir, f), "utf8");
  const block = /^skills:\n((?:(?:  - .*|\s*#.*)\n?)*)/m.exec(text)?.[1] ?? "";
  for (const line of block.split("\n")) {
    const m = /^  - (\S+)/.exec(line);
    if (m) (surfacesOf[m[1]] ??= []).push(target);
  }
}

// Grok CLI natively reads ~/.claude/skills (Claude Code compatibility), so it
// mirrors the claude-code surface; there is no separate grok manifest.
for (const list of Object.values(surfacesOf))
  if (list.includes("claude-code")) list.push("grok");

const skillsDir = join(CATALOG, "skills");
const skills = readdirSync(skillsDir)
  .filter((d) => statSync(join(skillsDir, d)).isDirectory())
  .sort()
  .map((name) => {
    const desc = description(join(skillsDir, name));
    const fallback = desc.split(/(?<=[.!?])\s/)[0] ?? "";
    return {
      name,
      purpose: purposes[name] ?? fallback,
      curated: Boolean(purposes[name]),
      surfaces: (surfacesOf[name] ?? []).sort(),
    };
  });

const missing = skills.filter((s) => !s.curated).map((s) => s.name);
if (missing.length)
  console.error(`NOTE: no curated purpose for: ${missing.join(", ")} (using description's first sentence; add them to fleet/purposes.json)`);

writeFileSync(
  join(ROOT, "fleet", "skills.json"),
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      catalog: "github.com/thomasgoubau1980/personal-agent-skills",
      surfaceLabels: SURFACE_LABELS,
      skills,
    },
    null,
    2
  )
);
console.log(`fleet/skills.json: ${skills.length} skills, ${Object.keys(SURFACE_LABELS).length} surfaces.`);
