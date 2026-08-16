# Adding the voice agent to a website you already have

You do not need this project's website to use the voice agent. The agent lives on
your Retell account; a website just connects to it. This page covers putting it on
a site you already like.

---

## Step 1 — the agent has to exist first

Nothing can embed an agent that has not been created. Pick whichever is easiest:

- **Retell dashboard, by hand** — `docs/agent-prompt.md` in this repo has the exact
  system prompt, model, voice and Cal.com settings to enter. ~10 minutes of clicking.
- **This project's `/setup` page** — deploy this repo to Vercel once and press the
  button. You never have to point your domain at it or show it to anyone; it is
  just a tool for creating the agent. Then throw it away or leave it unlisted.
- **Terminal** — `npm run provision:retell`.

All three produce the same agent. Afterwards, note the **Agent ID** from the
Retell dashboard (it is in the URL when you open the agent).

---

## Step 2 — pick your embed method

### Option A: Retell's drop-in widget (works on any website)

One `<script>` tag. Works on WordPress, Squarespace, Wix, Webflow, Shopify,
GoHighLevel, plain HTML — anything where you can paste code. **No backend
required**, because it authenticates with your *public* key.

**Get the snippet from Retell, not from here.** Open your agent in the Retell
dashboard and look for the widget / embed section — it generates a snippet with
your keys already filled in. Copy that. It looks roughly like this:

```html
<script
  src="https://dashboard.retellai.com/retell-widget.js"
  data-public-key="public_key_xxxxxxxx"
  data-voice-agent-id="agent_xxxxxxxx"
  data-title="Talk to us"
  data-color="#5ee0d6">
</script>
```

> The exact URL and attribute names come from your dashboard. Copy Retell's
> current snippet rather than retyping the one above, which is only a shape
> reference.

**⚠️ The one thing that trips everyone up:** in the Retell dashboard under
**Public Keys**, add your real domain (`ondutyagent.com`, `www.ondutyagent.com`)
**and `localhost`** to the allowed-domains list. If you skip this, the widget
loads nothing and gives no visible error.

#### Where to paste it

| Platform | Where |
|---|---|
| WordPress | Appearance → Theme File Editor → `footer.php`, before `</body>`. Or a "header/footer scripts" plugin. |
| Squarespace | Settings → Developer Tools → Code Injection → **Footer** |
| Wix | Settings → Custom Code → Add Code → Body end, all pages |
| Webflow | Project Settings → Custom Code → Footer Code |
| Shopify | Online Store → Themes → Edit code → `theme.liquid`, before `</body>` |
| GoHighLevel | Sites → Settings → Tracking Code → Body |
| Plain HTML | Before `</body>` on each page |
| Next.js / React | See Option B, or use `next/script` with `strategy="afterInteractive"` |

That is the whole job. It is genuinely a copy-paste.

---

### Option B: the custom branded launcher from this project

This is what this repo builds: your own button in your brand colours, the CTA
bubble that appears after 5 seconds and rotates, and friendly microphone-error
messages instead of a runtime crash.

**It requires a website with a backend.** The custom launcher mints a per-call
token using your *private* Retell key, which must stay on a server. That means:

| Your site is… | Option B possible? |
|---|---|
| Next.js, Remix, Nuxt, SvelteKit (on Vercel/Netlify/Node) | Yes |
| Rails, Django, Laravel, Express | Yes, porting the token endpoint to your language |
| WordPress with PHP | Yes, with a small PHP endpoint |
| Squarespace, Wix, Webflow, Shopify (no server code) | **No — use Option A** |

If your site qualifies, the pieces to copy from this repo are:

```
app/api/retell/web-call/route.ts          the token endpoint (~90 lines)
components/voice-agent/voice-agent-provider.tsx   call state + mic handling
components/voice-agent/voice-agent-widget.tsx     launcher, bubble, call panel
lib/business.ts                            phone number + CTA text it reads
```

plus `npm install retell-client-js-sdk` and `RETELL_API_KEY` in your environment.

The widget reads brand colours from CSS variables (`--brand-accent`,
`--brand-800`, `--brand-950`), so it restyles by pointing those at your palette.

---

## Which should you choose?

**Start with Option A.** It is one line, works everywhere, and you can have it
live in five minutes. If you later decide you want the branded launcher and your
site can support it, Option B is a drop-in upgrade — the agent does not change,
only the button in front of it.
