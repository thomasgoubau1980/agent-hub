# Agent Hub

The permanent home for **user guides and release notes for every agent in the fleet**, published as one static site on GitHub Pages:

**https://thomasgoubau1980.github.io/agent-hub/**

One repo, per-agent split. Public-unlisted (noindex, unguessable enough, no sensitive content allowed; see rules below).

## Adding or updating an agent

```
agents/<slug>/
  agent.yaml        name, tagline, accent (hex), accent_dark, status, order
  guide/index.md    the user guide (markdown)
  updates/*.md      one file per release: YYYY-MM-DD-<version>.md
  updates/mocks/    optional: <entry>.html sidecars, inlined beside the entry
  assets/           screenshots (png/jpg), referenced as assets/<file> from
                    guide and updates markdown
```

Release entry format (same contract as kara-desktop's docs/updates):

```markdown
---
version: 0.3
date: 2026-09-10
title: One line, user-visible outcome first
image: assets/hero.png        # optional hero screenshot
---

First paragraph becomes the entry subtitle. Then bullets:

- **Bold lead.** One user-visible change per bullet, rendered as a card.

Screenshots inline anywhere: ![Caption text](assets/shot.png)
```

Markdown subset: `#`/`##`/`###` headings, paragraphs, `-` lists, `1.` lists,
tables, `> quotes`, `**bold**`, `*italic*`, `[links](url)`, `` `code` ``,
`![images](path)`. HTML comments are stripped (use them for screenshot
placeholders: `<!-- screenshot: description -->`).

## Publishing

```sh
bash scripts/publish.sh
```

Syncs Kara entries from `~/Developer/kara-desktop/docs/updates` (that repo
stays Kara's authoring home; release.sh depends on it), rebuilds `docs/` and
pushes. Pages serves `main:/docs`. Idempotent; editing old entries is safe.

## Rules

- Write for the user, not the diff: lead with what changed on screen or in behaviour.
- Never use em-dashes.
- No secrets, IBANs, amounts from real documents, tokens, or internal config paths. The site is public.
- Real screenshots beat mockups; a mockup sidecar beats nothing.
- The `agent-docs-hub` skill (personal-agent-skills repo) is the ritual for updating this site; agents should use it rather than improvising.
