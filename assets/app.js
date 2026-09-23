(async()=>{const ps=['app.part1.js', 'app.part2.js', 'app.part3.js', 'app.part4.js'];const t=await Promise.all(ps.map(p=>fetch(p).then(r=>r.text())));(0,eval)(t.join(''))})().catch(console.error);
