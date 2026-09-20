# What the Follow-up Agent does

After a sales call, someone has to write the follow-up: what the prospect said, what we answered, what happens next, and a page they can forward internally. The Follow-up Agent prepares all of that so the rep only has to read and send.

It lives in Slack, in the channel **#follow-up_channel**, and works one call per thread. It reads the call recording, the email thread with the attendees and the HubSpot record, asks the questions only a human can answer, and then produces three things:

1. A **brief** in a Slack canvas, the single record of everything decided for that follow-up.
2. A **ready-to-paste prompt for Dante**, the AI inside Distribute, so the page gets built from the real transcript.
3. An **email draft** in Thomas's Superhuman, addressed to the prospect, never sent by the agent.

Two rules never bend. The agent never sends an email, and it never publishes a page unless someone writes **publish** in the thread. Everything it produces stays private until a person acts.

> Current status: pilot. The first real calls run through it in September 2026. If something looks wrong, say so in the thread; the agent answers there.

# Who does what

| Step | Who |
| --- | --- |
| Take the call, with recording on | The rep (Thomas) |
| Start the follow-up in Slack | Thomas or Douceline |
| Answer the agent's questions | Whoever knows the answer, usually Thomas |
| Say **go** when the brief is right | Thomas or Douceline |
| Paste the prompt into Distribute and let Dante build the page | Thomas or Douceline |
| Check the page, fix spellings, put the link in the email draft | The agent |
| Read the email and send it | The rep, from his own mailbox |
| Say **publish** | Thomas or Douceline |

# Step by step

## 1. Start a follow-up

In #follow-up_channel, as a new message, write something like:

> Follow-up Agent: follow up on the demo with Company X of 16 September.

If you do not remember the exact call, ask:

> Follow-up Agent: which external meetings did we have this week?

The agent lists them, numbered. Reply with the number.

## 2. Read the opening message

Within a minute or two the agent opens a thread with:

- the call: date, attendees and their roles, which recorder captured it
- the HubSpot deal, with a link
- what kind of call it was and what kind of message the follow-up should be
- a link to the **canvas**, where the full brief lives
- up to five numbered questions

Everything from here on happens **inside that thread**. Use "Reply in thread", not a new message in the channel.

## 3. Answer the questions

Answer in plain text or with a voice note, in any order. Typical questions: which price to quote and for what period, which reference customers may be named, what to answer on hosting, which dates to offer for the next call, whether a promised video exists yet.

After each answer the agent updates the canvas and tells you the new version number and what is still open. You can also correct it: "the company is spelled X", "drop the video", "add that they asked about integration".

When something is not known yet, tell the agent to keep it as a **placeholder**. It stays visible on the page as "to be added" until someone fills it.

## 4. Say go

When the brief reads right, write **go** on its own line. Thomas or Douceline can do this. The agent then:

- freezes the brief in the canvas
- posts the **Dante prompt**: one block of text you can copy
- creates the email draft in Thomas's Superhuman, with "page link follows" where the link will go

## 5. Build the page in Distribute

1. Open Distribute (app.distribute.so, or the desktop app), Home.
2. Click the Dante box: "Ask about your calls, accounts, and content, or ask me to create a page".
3. Paste the prompt from Slack. Send.
4. Wait for Dante to finish. The page appears as a **private draft** in the Prospects folder, titled "Q7Leader x Company".
5. Read it once. If a fact is wrong, tell the agent in the thread or fix it directly in the editor.

Do not publish yet.

## 6. The agent finishes

The agent notices the new page, checks names, numbers and quotes against the recording and HubSpot, adds the prospect's banner, puts the editor link into the email draft, and posts the **handover** in the thread:

- the email text
- the link to the page editor
- the HubSpot deal link
- what is still to add before sending, with an owner per item

## 7. Publish and send

When the page is final, write **publish** in the thread, or publish from the Distribute editor. The agent swaps the public link into the email draft. Thomas opens Superhuman, reads the draft, changes what he wants, and sends. That last step is always a person.

# Getting into Distribute

Douceline needs a Distribute account in the Q7Leader workspace.

1. **Invitation.** Thomas invites you: Distribute, Workspace settings, Members, Invite. You receive an email from Distribute.
2. **Sign in.** Open app.distribute.so and choose "Continue with Google" with your q7leader.com address. No separate password.
3. **Workspace.** Bottom left should say "Q7Leader Workspace". If it shows something else, click it and switch.
4. **Folders.** You should see Prospects, Customer Pages and the shared folders. If Prospects is missing, ask Thomas to share it.
5. **Desktop app, optional.** Download from app.distribute.so/download. It is the same application in a window, plus a call recorder. If macOS says the app cannot be opened, the file went through a chat app on the way; download it again directly in the browser.

What you never do in Distribute for this workflow: send an email from Dante's Gmail connection, or publish a page nobody asked to publish.

# Where things live

- **Slack thread:** the conversation, one per call.
- **Slack canvas:** the brief, the Dante prompt, the open questions, the placeholders, the outputs. Linked from the thread's first message.
- **Distribute:** the page, private until published.
- **Superhuman:** the email draft, in Thomas's account.
- **HubSpot:** the deal, unchanged by the agent unless someone ticks a proposal in the thread.

# FAQ

**Do I need Slack, Distribute and Superhuman?**
Slack always. Distribute only for step 5. Superhuman never; the draft sits in Thomas's account and he sends.

**The agent did not react to my message.**
Check that you wrote inside the thread, not in the channel. Then check that it is you writing: the agent answers Thomas and Douceline only. If it is still silent after two minutes, write "Follow-up Agent, are you there?" and tell Thomas if nothing comes back.

**Can I answer with a voice note?**
Yes. Record it in Slack, in the thread. The agent transcribes it and quotes the parts it used.

**The agent asked a question I cannot answer.**
Say so: "Thomas has to answer question 3". It stays open and the canvas shows who owns it.

**Who is allowed to say go and publish?**
Thomas and Douceline. Nobody else, and the agent ignores those words from anyone else.

**Can the page be changed after the handover?**
Yes, in the Distribute editor, by anyone with access. If the email has already gone out and you change a price or a date, tell Thomas, because the email and the page then say different things.

**The page has "to be added" blocks on it. Is that a mistake?**
No. It means no source supported that part and nobody filled it in. Fill it in the editor, or ask the agent to drop it.

**Dante wrote something that was not said on the call.**
Tell the agent in the thread. It checks every fact about the prospect against the recording, but Dante's own additions about Q7Leader are allowed. If a prospect fact is wrong, the agent fixes it or tells you what to change.

**The company name is misspelled.**
The agent takes spellings from HubSpot and from the prospect's email signature. Tell it the right spelling; the canvas, the prompt and the page get corrected.

**What if the call is not in Distribute?**
Dante needs the recording to be in Distribute's call library. Calls recorded by the Distribute recorder, Fathom or Granola appear there when those connections are on. If a call is missing, tell the agent; it can write the brief from the transcript it read itself and hand you a longer prompt.

**Will the agent ever email the prospect?**
No. It has no sending tool. It creates drafts only.

**Something went wrong and I want to undo.**
Pages: Distribute keeps an undo for a week for anything the agent created. Emails: nothing was sent, delete the draft. Canvas: earlier versions are listed in the canvas status line; ask the agent to restore one.

**Where do I report a problem?**
In the thread, or to Thomas directly. Say what you expected and what happened.
