import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../content.js';
import {grade,remainingSeconds,validSession} from '../core.js';
test('curriculum has six mini units and a full-length original practice',()=>{
 assert.equal(lessons.length,7);
 assert.deepEqual(lessons.map(l=>l.questions.length),[12,12,12,12,12,12,26]);
 const ids=new Set();
 for(const l of lessons){
  assert.ok(l.minutes>0);assert.ok(l.teacherGuide.goal&&l.teacherGuide.strategy);
  for(const q of l.questions){
   assert.ok(!ids.has(q.id));ids.add(q.id);
   assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
   assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
   assert.ok(q.explanation.length>10);assert.ok(q.prompt.length>5);
   assert.ok(['reading','arithmetic','word','visual'].includes(q.category));
   if(q.category==='reading')assert.ok(q.passage.length>30);
  }
 }
 const full=lessons.at(-1).questions;
 assert.equal(full.filter(q=>q.category==='reading').length,12);
 assert.equal(full.filter(q=>q.category!=='reading').length,14);
});
test('grading distinguishes wrong, skipped, and correct without penalizing skips',()=>{
 const q=[{id:'a',answer:0,category:'reading'},{id:'b',answer:1,category:'word'},{id:'c',answer:2,category:'word'}];
 assert.deepEqual(grade(q,{a:0,b:0}),{correct:1,total:3,unanswered:1,categories:{reading:{correct:1,total:1},word:{correct:0,total:2}}});
 assert.equal(grade(q,{a:0,b:1,c:2}).correct,3);
});
test('deadline survives reload and never goes below zero',()=>{
 assert.equal(remainingSeconds(10000,0),10);
 assert.equal(remainingSeconds(10000,9999),1);
 assert.equal(remainingSeconds(10000,10000),0);
 assert.equal(remainingSeconds(10000,50000),0);
});
test('invalid or stale local session cannot enter the workflow',()=>{
 const l=lessons[0],s={lessonId:l.id,mode:'timed',index:0,answers:{[l.questions[0].id]:0},startedAt:1,deadline:1000};
 assert.ok(validSession(s,lessons));
 for(const bad of [null,{}, {...s,index:-1},{...s,index:999},{...s,lessonId:'gone'},{...s,answers:{bad:0}},{...s,answers:{[l.questions[0].id]:8}},{...s,deadline:null}])assert.equal(validSession(bad,lessons),false);
});
