# What Kara is

Kara is a working system, not a single app. It answers one question all day: what should I be doing right now? Four parts share the work, and each one does only what it is best at:

| Part | Job | You use it for |
|---|---|---|
| **Todoist** | Captures everything | Getting things out of your head, fast, from anywhere |
| **Akiflow** | Plans the week and the day | Picking priorities, time blocking, the planning rituals |
| **Kara app** (Mac, iPhone, iPad) | Runs the day | Meetings, the tasks they produce, today's plan in one view |
| **Kara agent** | Works in the background | Turning meetings and mail into tasks, enriching and tagging captures |

Underneath, tasks live in Todoist and time lives in Google Calendar. Akiflow and the Kara app are windows onto those two, so nothing you do in one place gets lost in another.

# Capture: everything goes to Todoist

Never keep a task in your head or park it in a notes app. Say it, type it, or forward it into Todoist, unsorted is fine. The Inbox is allowed to be messy because clean-up is not your job:

- The **sweep** runs three times a day and turns your meetings, mail, and Slack into suggested tasks, each with a note on where it came from and why.
- The **enrichment pass** runs hourly on the Inbox. Every capture gets: a summary of any link it contains (the agent reads the page for you), a nature tag, and a proposed project written into the description.

You never have to open a link to know whether a task deserves your time.

# The three tags

The agent tags every Inbox task. Two describe what kind of work it is, one nominates it for your attention:

| Tag | Meaning | Rule the agent applies |
|---|---|---|
| `focus` | Deep work | Needs 25 minutes or more of uninterrupted work by you: writing, analysis, preparation, review. Belongs inside a 90-minute Focus block. |
| `admin` | Small stuff | 15 minutes or less: pay, book, confirm, forward, chase. Several of these get batched into one Admin block. |
| `key` | Top-3 candidate | A nomination only, and rare: a hard deadline within 48 hours, direct revenue or customer impact, or it unblocks someone else. At most three per day. |

Every task is either focus or admin. `key` comes on top and is deliberately strict: if everything is key, nothing is. The agent only nominates; choosing the actual top 3 of the day is yours, every morning, in Akiflow.

# The daily routine

**Morning, in Akiflow (5 to 10 minutes).** Run the Daily Planning ritual:

1. Glance at yesterday: anything unfinished moves forward or gets dropped consciously.
2. Pick your 1 to 3 **Goals** for today (press H on a task). The agent's `key` nominations are your shortlist, but the choice is yours.
3. Clear the inbox: every task gets a when (today, a day this week, the weekly bucket, someday) or gets deleted. The agent's summary and proposed project in each description mean you rarely need to open anything.
4. Block the day: drag focus tasks into a 90-minute Focus block, let the small stuff collect in the Admin block.

**During the day, in the Kara app.** This is your landing page: today's meetings at real scale, the tasks inside each block, and new tasks appearing as meetings finish. Capture anything new straight into Todoist and keep going.

**Closing, in the Kara app.** Give every leftover a destination: done, tomorrow, a project, waiting-for, or consciously kept open. Two minutes, and tomorrow starts clean.

# The weekly routine

**Friday afternoon, in Akiflow.** Plan the coming week:

1. Review this week: what shipped, what slipped, what should stop.
2. Pull next week's work from the weekly bucket and your projects, and give the important items a day.
3. Lay in the recurring structure: Focus blocks on your best hours, the Admin block, and leave slack. A plan that fills every hour fails by Tuesday.

Projects and areas themselves are reviewed in Todoist, where they mirror your PARA filing. Akiflow deliberately keeps almost no projects of its own: it is about when, not where.

# Time blocks

- **Focus block:** 90 minutes, one to two `focus` tasks, no meetings, no inbox. Protect at least one per day.
- **Admin block:** 30 to 45 minutes, recurring, eats the `admin` tasks in batch. One good admin block beats admin scattered through the day.
- Blocks you create in Akiflow appear on your Google Calendar, so the Kara app and everyone who sees your availability respects them.

# Waiting on other people

Delegated and waiting-for items get a digest every Monday and Friday morning so nothing you handed off silently dies.

# Good to know

- **Tags stay in Todoist.** Akiflow shows each task's summary and proposed project (in the description) but not the labels. Your triage information is in the text.
- **Only new activity syncs.** Tasks created or edited after the Todoist-Akiflow connection flow across; old untouched tasks stay where they are until you touch them.
- **Deleting in Akiflow never deletes in Todoist.** Complete or reject instead of deleting when it matters.
- **One scheduler per space.** Akiflow owns work blocks. If another tool also auto-blocks your calendar, give it a separate lane (personal habits, for example) or the two will fight over the same free hours.
