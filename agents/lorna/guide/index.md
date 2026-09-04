# What Lorna is

Two streams of paperwork land on this household: **private** (utilities, mutuelle, syndic, school, fines) and **TGLA srl** (supplier invoices, VAT, payroll, statutory documents). Lorna's job is that every one of those documents ends up findable in the right Dropbox folder, and every payable one gets paid once, on time, never twice.

Lorna never handles money herself. TGLA bills are paid through Odoo and Revolut as before; private bills are paid by Thomas or Lynn in their own banking app. Lorna prepares, reminds and tracks.

> Current status: Phase 0 to 1, shadow mode. Lorna reads, classifies and proposes. She does not yet move files, forward mail, or track payments live. Every step below marked *soon* or *phase 2/3* switches on at a later phase, each one gated by Thomas.

# Handing in a document

Anything administrative, from either of you, goes through one of two doors. No pre-sorting needed: Lorna works out whether it is private or TGLA.

## Door 1: the Dropbox Inbox (live)

1. Save or drop the file into **Dropbox / 0 Inbox**. Any device, any format.
2. Paper document? Photograph or scan it, then drop the image in. Lorna reads scans too.
3. Done. Do not file it yourself; that is the part Lorna does.

<!-- screenshot: the Dropbox 0 Inbox folder with a freshly dropped scan -->

## Door 2: the admin mailbox (soon)

A dedicated email address (being set up) where you forward any bill or letter that arrives by mail. Same result as the Inbox folder. Until it exists, use Door 1.

TGLA e-invoices over Peppol go straight into Odoo on their own. You never need to hand those in.

# What happens next

Each document is read, classified on two axes (private or TGLA; payable or just filing) and then:

- Filed into the agreed folder structure, immediately, with a searchable text layer *(phase 2)*
- TGLA payables forwarded to Odoo for the accountant; Lorna keeps the Dropbox copy *(phase 2)*
- Private payables put on the payment list with amount, due date and a scan-to-pay QR *(phase 3)*
- Unreadable or ambiguous documents parked in a quarantine queue and shown to Thomas, never guessed at *(live)*

## The Monday digest

Once weekly, Lorna sends one message with everything that needs a human. It always arrives, even when it says "nothing due": a silent week means something is broken, and silence is the one failure this system refuses to allow.

| Digest line | Meaning | What you do |
|---|---|---|
| Due | Payable within 7 days | Pay it (see below), tap mark paid |
| Overdue | Past due date, still open | Pay today; fines are pinned on top |
| Needs a look | Lorna is unsure what it is | Reply with what it is; Lorna learns from it |
| Quarantined | Unreadable scan or oddity | Re-scan, or key it in manually |
| Missing receipt | Card expense with no document | Forward the receipt through either door |

<!-- screenshot: a Monday digest message as it arrives -->

# Paying a private bill (phase 3)

Private payments stay in your hands, but with the typing removed:

1. Open the payment list on a laptop or tablet. Each open bill shows supplier, amount, due date and a QR code.
2. In KBC Mobile on your phone, choose scan and point it at the QR. Name, account, amount and the payment reference pre-fill.
3. Check the screen against the bill, sign, then tap mark paid on the list.

The QR is also a safety feature: the account number in it comes from Lorna's approved supplier registry, never from the document itself, so a tampered invoice cannot redirect a payment.

TGLA bills never appear here. They are validated and paid in Odoo and Revolut, as before.

# The rules that never relax

- **Never deletes.** Lorna only moves files, logs every move, and any batch can be undone with one command.
- **Never touches TGLA money.** No bank access, no payment creation, ever. Reading is the ceiling.
- **Never pays from a document.** Payment details come only from the registry of suppliers Thomas has approved. A new or changed account number freezes the document and alerts Thomas.
- **Never guesses an amount.** Unreadable means quarantined, not estimated.
- **Never goes quiet.** The digest always sends, and an independent watchdog off the Mac mini alarms if Lorna stops running.

When Lorna files or labels something wrongly, say so (reply to the digest is enough). Every correction is recorded and consulted on all future decisions; a repeated correction becomes a rule.
