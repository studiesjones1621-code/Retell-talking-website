import fs from 'node:fs'
const KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash-image'
const jobs = [
  ['hero.jpg', 'Wide cinematic photograph of a spacious, spotlessly clean modern American laundromat interior at blue hour. Two long rows of large stainless-steel front-load washing machines receding into the distance, warm overhead lighting, polished light-grey floor with a soft reflection, a few folding tables with neatly stacked folded laundry. Deep royal blue accent wall. Empty of people. Shot on a 24mm lens, deep depth of field, editorial commercial photography, calm and premium, no text, no logos, no signage.'],
  ['delivery.jpg', 'Photograph of a clean white cloth laundry bag full of neatly folded clothes sitting on the front step of a New York City brownstone apartment building, early morning soft light, shallow depth of field, warm and inviting, editorial commercial photography, no people, no text, no logos.'],
]
for (const [name, prompt] of jobs) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  const j = await r.json()
  const part = j?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
  if (!part) { console.log(name, 'FAILED', JSON.stringify(j).slice(0, 300)); continue }
  fs.writeFileSync(`site/public/crc/${name}`, Buffer.from(part.inlineData.data, 'base64'))
  console.log(name, 'ok', (fs.statSync(`site/public/crc/${name}`).size / 1024 | 0) + 'kb')
}
