import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,categories} from '../content.js';

const words=text=>text.match(/[א-ת][א-ת\u05b0-\u05bc\u05bf\u05c1\u05c2\u05c7׳״]*/g)||[];
test('every Hebrew word in learner-facing curriculum has vowel marks',()=>{
 const missing=[];
 function check(value,path){
  if(typeof value==='string'){
   for(const word of words(value))if(word.replace(/[^א-ת]/g,'').length>1&&!/[\u05b0-\u05bb\u05c7]|וּ/.test(word))missing.push(`${path}: ${word}`);
  }else if(Array.isArray(value))value.forEach((v,i)=>check(v,`${path}[${i}]`));
  else if(value&&typeof value==='object')for(const [key,v] of Object.entries(value))check(v,`${path}.${key}`);
 }
 check(lessons,'lessons');check(categories,'categories');
 assert.deepEqual(missing,[],'All questions, answers, explanations, passages and guides must remain vocalized.');
});
