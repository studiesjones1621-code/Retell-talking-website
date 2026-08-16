import { chromium } from 'playwright'
const S='/tmp/claude-0/-home-user-Retell-talking-website/54436fde-f564-5298-8a76-df138c5c7e0a/scratchpad'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [n,vp] of [['d',{width:1440,height:900}],['m',{width:390,height:844}]]) {
  const p = await (await b.newContext({viewport:vp})).newPage()
  const errs=[]; p.on('pageerror',e=>errs.push(e.message))
  await p.goto('http://localhost:3000',{waitUntil:'networkidle'})
  await p.waitForTimeout(1200)
  const ov = await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)
  console.log(n, '| title:', await p.title(), '| overflow:', ov, '| pageerrors:', errs.length)
  await p.screenshot({path:`${S}/hvac-${n}.png`, fullPage:n==='d'})
}
await b.close()
