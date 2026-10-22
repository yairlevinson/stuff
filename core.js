export function grade(questions,answers){
 const rows=questions.map(q=>({id:q.id,category:q.category,answered:Number.isInteger(answers[q.id]),correct:answers[q.id]===q.answer}));
 return {correct:rows.filter(r=>r.correct).length,total:rows.length,unanswered:rows.filter(r=>!r.answered).length,categories:Object.fromEntries([...new Set(rows.map(r=>r.category))].map(c=>[c,{correct:rows.filter(r=>r.category===c&&r.correct).length,total:rows.filter(r=>r.category===c).length}]))};
}
export function remainingSeconds(deadline,now=Date.now()){return Math.max(0,Math.ceil((deadline-now)/1000));}
export function validSession(s,lessons){
 const lesson=lessons.find(l=>l.id===s?.lessonId);
 return !!(lesson&&['practice','timed'].includes(s.mode)&&Number.isInteger(s.index)&&s.index>=0&&s.index<lesson.questions.length&&s.answers&&typeof s.answers==='object'&&Object.entries(s.answers).every(([id,v])=>lesson.questions.some(q=>q.id===id&&Number.isInteger(v)&&v>=0&&v<q.options.length))&&Number.isFinite(s.startedAt)&&(s.mode!=='timed'||Number.isFinite(s.deadline)));
}
