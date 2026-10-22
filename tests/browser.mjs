import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const unpoint=text=>text.replace(/[\u0591-\u05bd\u05bf-\u05c7]/g,'');
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function assertVocalized(){
 const missing=await page.evaluate(()=>{
  const missing=[],walker=document.createTreeWalker(document.querySelector('#app'),NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   if(!node.parentElement.getClientRects().length)continue;
   for(const word of node.textContent.match(/[א-ת][א-ת\u05b0-\u05bc\u05bf\u05c1\u05c2\u05c7׳״]*/g)||[]){
    const bare=word.replace(/[^א-ת]/g,'');
    if(bare.length>1&&!['תשפ','תשפה'].includes(bare)&&!/[\u05b0-\u05bb\u05c7]|וּ/.test(word))missing.push(word);
   }
  }
  return [...new Set(missing)];
 });
 assert.deepEqual(missing,[],'Every visible Hebrew word must be vocalized');
}

await page.goto('http://127.0.0.1:3000');
await page.locator('.lesson-card').first().waitFor();
await assertVocalized();
assert.equal(await page.locator('.lesson-card').count(),7);
await page.screenshot({path:'/tmp/amika-desktop.png',fullPage:true});
await page.locator('[data-action="lesson"]').first().click();
await assertVocalized();
await page.locator('[data-action="start"]').click();
await assertVocalized();
await page.locator('[data-action="answer"][data-value="1"]').click();
await page.locator('[data-action="next"]').click();
assert.equal(unpoint(await page.locator('.question-type').textContent()),'הבנת הנקרא · שאלה 2 מתוך 12');
await page.reload();
await page.locator('[data-action="resume"]').click();
assert.match(unpoint(await page.locator('.question-type').textContent()),/שאלה 2/);
await page.locator('[data-action="jump"][data-value="0"]').click();
assert.equal(await page.locator('.option.selected').count(),1);
await page.locator('[data-action="submit"]').first().click();
assert.match(unpoint(await page.locator('dialog').textContent()),/11 שאלות/);
await assertVocalized();
await page.locator('#confirm-no').click();
await page.locator('[data-action="submit"]').first().click();
await page.locator('#confirm-yes').click();
await page.locator('.score-number').waitFor();
await assertVocalized();
assert.equal(await page.locator('.review-item').count(),12);
await page.locator('[data-action="progress"]').click();
assert.equal(await page.locator('[data-action="history"]').count(),1);
await assertVocalized();
await page.locator('[data-action="history"]').click();
assert.equal(await page.locator('.review-item').count(),12);
await page.locator('[data-action="home"]').first().click();
await page.locator('[data-action="lesson"]').first().click();
await page.locator('[data-action="mode"][data-mode="timed"]').click();
await page.locator('[data-action="start"]').click();
assert.match(await page.locator('#timer').textContent(),/18:00|17:59/);
await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('amika-v1'));s.session.deadline=Date.now()-100;localStorage.setItem('amika-v1',JSON.stringify(s));});
await page.reload();await page.locator('[data-action="resume"]').click();
await page.locator('.score-number').waitFor();
await assertVocalized();
assert.match(unpoint(await page.locator('.score h1').textContent()),/הזמן הסתים/);
await page.locator('[data-action="home"]').first().click();
await page.locator('[data-action="lesson"]').last().click();
await page.locator('[data-action="worksheet"]').click();
assert.equal(await page.locator('.panel .review-item').count(),26);
await assertVocalized();
assert.equal(await page.locator('#print-answers').isVisible(),false);
await page.locator('[data-action="home"]').first().click();
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'/tmp/amika-mobile.png',fullPage:true});
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No horizontal overflow on mobile');
await page.locator('[data-action="lesson"]').first().click();await page.locator('[data-action="start"]').click();
await page.screenshot({path:'/tmp/amika-mobile-question.png',fullPage:true});
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Question fits mobile');
await page.locator('[data-action="leave"]').click();
await page.locator('[data-action="sources"]').click();
assert.equal(await page.locator('.research-list li').count(),7);
await assertVocalized();
await page.locator('[data-action="home"]').first().click();
await page.locator('[data-action="method"]').click();
await assertVocalized();
assert.deepEqual(errors,[]);
console.log('PASS: desktop/mobile, navigation, answer persistence, partial submission, history, timer expiry, print worksheet, sources, no browser errors');
await browser.close();
