
(function(){
"use strict";
const DATA=window.LWH_ANIMAL_FARM_CH3;
const KEY="lwh:animal-farm:chapter-3:v1";
const names=DATA.activityNames;
const counts=[12,10,10,4,10,2,6];
const app=document.getElementById("app");
const fresh=()=>({activities:counts.map(()=>({done:{},skipped:{},answers:{},hints:{},attempts:{},drafts:{},words:{}})),last:null,chosen:["toiled",""],history:[],rate:.85,voiceURI:"",updated:null});
let saved;
try{saved=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){saved=null}
if(!saved||!Array.isArray(saved.activities)||saved.activities.length!==7)saved=fresh();
let view="menu",activity=0,index=0,tab="progress",selectedWord=null,feedback="",wrongTarget=null,wrongWord=null,showHint=false,showStarter=false,showPractice=true,showStory=false,showCheck=false,showGallery=false,characterIndex=null,showParent=false,justFinished=false;
const get=()=>saved.activities[activity],at=i=>saved.activities[i];
function persist(){saved.updated=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){console.warn("Saving progress failed:",e)}}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function markDone(i,j){at(i).done[j]=true;delete at(i).skipped[j];persist()}
function markSkipped(i,j){if(!at(i).done[j])at(i).skipped[j]=true;persist()}
function doneCount(i){return Object.keys(at(i).done).length}
function skippedCount(i){return Object.keys(at(i).skipped).filter(k=>!at(i).done[k]).length}
function status(i){return doneCount(i)===counts[i]?"complete":skippedCount(i)>0?"skipped":doneCount(i)>0||Object.keys(at(i).answers).length>0||Object.values(at(i).drafts).some(Boolean)?"inprogress":"new"}
function statLabel(s){return ({complete:"Completed",skipped:"Has Skipped Items",inprogress:"In Progress",new:"Not Started"})[s]}
function statClass(s){return s==="complete"?"good":s==="skipped"?"skip":s==="inprogress"?"live":""}
function percent(i){return Math.round(100*doneCount(i)/counts[i])}
function color(i){return status(i)==="complete"?"var(--success)":status(i)==="skipped"?"var(--warning)":"#76a9d5"}
function bar(i){return '<div class="progress"><div style="width:'+percent(i)+'%;background:'+color(i)+'"></div></div>'}
function btn(label,action,extra="",attr=""){return '<button class="btn '+extra+'" type="button" data-action="'+action+'" '+attr+'>'+label+"</button>"}
function speak(s){if(!("speechSynthesis" in window)){alert("Read-aloud is not available in this browser.");return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(s);u.lang="en-US";u.rate=Number(saved.rate)||.85;const voice=(speechSynthesis.getVoices?.()||[]).find(v=>v.voiceURI===saved.voiceURI);if(voice)u.voice=voice; speechSynthesis.speak(u)}
function scene(symbol,description){return '<div class="scene" role="img" aria-label="'+escapeHTML(description)+'"><div class="illustration" aria-hidden="true">'+symbol+'</div><p>'+escapeHTML(description)+'</p><p class="scene-note">Artwork placeholder — original approved illustrations will be added</p></div>'}
function header(){return '<div class="row spread"><div><div class="eyebrow">English / Animal Farm / Chapter 3</div><h1>'+escapeHTML(names[activity])+'</h1></div><span class="badge">Activity '+(activity+1)+' of 8</span></div>'}
function progressHead(total,label){return '<div class="statusline"><span class="muted">'+escapeHTML(label)+' '+(index+1)+' of '+total+'</span><span class="muted">'+Math.round((index+1)*100/total)+'%</span></div><div class="progress" style="margin:10px 0 20px"><div style="width:'+(index+1)*100/total+'%;background:#77a6c0"></div></div>'}
function normalActions(total){return '<div class="actions">'+btn("← Back","back","",index===0?"disabled":"")+btn("Skip →","skip")+btn(index===total-1?"Finish / Review →":"Next →","next","primary")+'</div>'}
function commonFoot(){return '<div class="row spread" style="border-top:1px solid var(--line);margin-top:22px;padding-top:16px">'+btn("☷ Lesson Menu","menu","ghost")+btn("↩ Return to Last Location","resume","ghost",saved.last?"":"disabled")+btn("↺ Start Again","restart","ghost")+'</div>'}
function resetExtras(){selectedWord=null;feedback="";wrongTarget=null;wrongWord=null;showHint=false;showStarter=false;showStory=false;showCheck=false;showPractice=true;characterIndex=null;showGallery=false}
function openActivity(i,pos=0){activity=i;index=Math.min(Math.max(0,pos),counts[i]||0);view="activity";resetExtras();saveLocation();render()}
function saveLocation(){if(activity<=6){saved.last={activity,index};persist()}}
function advance(isSkip=false){if(isSkip)markSkipped(activity,index);else if(activity===0||activity===2)markDone(activity,index);else if(activity===1&&get().answers[index]===DATA.sections[index].correct)markDone(activity,index);
if(index<(counts[activity]-1)){index++;resetExtras();saveLocation();render()}else{justFinished=true;view="review";tab="progress";render()}}
function restart(){if(activity>6)return;if(!confirm("Start this activity again? Your earlier results will remain available in Parent Mode."))return;if(!Array.isArray(saved.history))saved.history=[];saved.history.push({activity,at:new Date().toISOString(),results:JSON.parse(JSON.stringify(get()))});saved.activities[activity]={done:{},skipped:{},answers:{},hints:{},attempts:{},drafts:{},words:{}};index=0;resetExtras();saveLocation();render()}
function back(){if(index>0){index--;resetExtras();saveLocation();render()}else{view="menu";render()}}
function resume(){if(!saved.last){view="menu";render();return}openActivity(saved.last.activity,saved.last.index)}
function menu(){
let c=counts.reduce((v,n,i)=>v+(doneCount(i)===n?1:0),0);
let resumeCard=saved.last?'<div class="softbox bluebox"><div class="eyebrow">Continue Learning</div><h2>'+escapeHTML(names[saved.last.activity])+'</h2><p>Return to '+(saved.last.activity===3?"round":"item")+' '+(saved.last.index+1)+' exactly where you stopped.</p>'+btn("Resume Where I Left Off →","resume","primary")+'</div>':"";
return '<section class="panel hero"><div class="eyebrow">Learn with H · English</div><h1>Animal Farm — Chapter 3</h1><p class="reading">Life on the Farm</p><p>Read the story, learn new words, and practice at your own pace. All activities are unlocked.</p><p class="muted">'+c+' of 7 learning activities fully completed. Review is always available.</p>'+resumeCard+'</section><section class="panel"><h2>Choose an Activity</h2><div class="cardgrid">'+names.map((n,i)=>{
let s=i===7?"new":status(i);let description=["Nine main characters, two mother dogs, and nine puppies","Ten short illustrated reading sections","Ten words with meanings and story context","Four rounds of word matching","Ten sentences from the teacher's worksheet","Write two original sentences","Six teacher comprehension questions","Progress, skipped items, and saved writing"][i];
let badge=i===7?'<span class="badge">Open Anytime</span>':'<span class="badge '+statClass(s)+'">'+statLabel(s)+'</span>';
return '<button class="tile" data-action="open" data-activity="'+i+'"><div class="statusline"><strong>'+(i+1)+'. '+escapeHTML(n)+'</strong>'+badge+'</div><p class="muted">'+description+'</p>'+(i<7?'<div style="margin-top:12px">'+bar(i)+'</div>':"")+'</button>'
}).join("")+'</div></section>'
}
function characterArt(c,small=false){
 const file={snowball:"snowball.webp",napoleon:"napoleon.webp",squealer:"squealer.webp",boxer:"boxer.webp",benjamin:"benjamin.webp",jones:"mr_jones.webp",clover:"clover.webp",mollie:"mollie.webp",muriel:"muriel.webp"}[c.key];
 const media=file?'<img src="./assets/characters/'+file+'" alt="'+escapeHTML(c.name)+' portrait" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><span class="portrait-fallback" style="display:none" aria-hidden="true">'+c.symbol+'</span>':'<span class="portrait-fallback" aria-hidden="true">'+c.symbol+'</span>';
 return '<span class="portrait-box '+(small?'portrait-small':'')+'">'+media+'</span>'
}
function characterCard(c,i,small=false){return '<button class="'+(small?"person":"tile")+'" data-action="character" data-character="'+i+'">'+characterArt(c,small)+'<h3>'+escapeHTML(c.name)+'</h3>'+(small?"":'<p>'+escapeHTML(c.description)+'</p>')+'</button>'}
function characterScreen(){
if(showGallery){return header()+'<p>Choose any character. You can come back to the one-at-a-time lesson whenever you like.</p><h2>Main Characters</h2><div class="charactergrid">'+DATA.characters.map((c,i)=>!c.group?characterCard(c,i,true):"").join("")+'</div><h2>Supporting Characters</h2><p>Jessie and Bluebell are the mother dogs. Their nine puppies are shown together.</p><div class="charactergrid">'+DATA.characters.map((c,i)=>c.group==="supporting"?characterCard(c,i,true):"").join("")+'</div><div class="actions">'+btn("← One at a Time","toggle-gallery")+btn("Go to Reading →","go-reading","primary")+'</div>'}
let c=DATA.characters[index];return header()+progressHead(DATA.characters.length,"Character")+'<div class="portrait-feature">'+characterArt(c)+'</div>'+'<div style="text-align:center"><h2>'+escapeHTML(c.name)+'</h2><p class="reading">'+escapeHTML(c.description)+'</p>'+btn("🔊 Listen","listen-character")+'</div><div class="row" style="margin-top:18px">'+btn("👥 View All Characters","toggle-gallery")+'</div>'+normalActions(DATA.characters.length)
}
function quickCheck(question,options,answer,stored,hintText){return '<div class="softbox creambox"><div class="row spread"><h2>Quick Check</h2>'+btn(showHint?"Hide Hint":"💡 Hint","hint")+'</div>'+(showHint?'<p class="muted">'+escapeHTML(hintText)+'</p>':"")+'<p><strong>'+escapeHTML(question)+'</strong></p><div class="choices">'+options.map((t,i)=>{
let cls=stored===i?(i===answer?"good":"bad"):"";return '<button class="choice '+cls+'" data-action="answer" data-choice="'+i+'">'+escapeHTML(t)+'</button>'
}).join("")+'</div>'+(stored!==undefined?'<div class="feedback '+(stored===answer?"good":"bad")+'" role="status">'+(stored===answer?"That’s right! Great reading!":"Not quite. Try another answer!")+'</div>':"")+'</div>'}
function readingScreen(){let s=DATA.sections[index], answer=get().answers[index];let symbols=["🐴 🌾","🐴 💪","🐖 🐗","🐖 📋","🐐 📚","🐑 📜","🐖 🐗","🐗 🐶","🥛 🍎","🐷 🍎"];
return header()+progressHead(10,"Reading Section")+'<div class="row spread"><h2>'+(index+1)+'. '+escapeHTML(s.title)+'</h2>'+btn("👥 Characters","characters")+'</div>'+scene(symbols[index],s.title)+'<div class="softbox greenbox"><p class="reading">'+escapeHTML(s.text)+'</p>'+btn("🔊 Listen to Story","listen-story")+'</div>'+quickCheck(s.question,s.options,s.correct,answer,"Think about what happened in the story above.")+normalActions(10)}
function vocabScreen(){let w=DATA.words[index];let symbol=["🐴 🌾","🐖 🐴","🐖 📚","🫏","🫏 ❓","🐖 📋","📖","🐶 🏠","🐑 📋","🐑 💬"][index];
return header()+progressHead(10,"Word")+scene(symbol,w.word)+'<div style="text-align:center"><h1>'+escapeHTML(w.word)+'</h1>'+btn("🔊 Listen","listen-word")+'</div><div class="softbox bluebox"><h3>Meaning</h3><p class="reading">'+escapeHTML(w.meaning)+'</p></div><div class="softbox greenbox"><h3>Example Sentence</h3><p>'+escapeHTML(w.example)+'</p></div><details '+(showStory?"open":"")+' id="story-detail"><summary>📖 Read It in the Story</summary><p class="muted">From the teacher’s Chapter 3 vocabulary worksheet</p><p><em>“'+escapeHTML(w.quote)+'”</em></p><p>'+escapeHTML(w.context)+'</p>'+btn("🔊 Listen to Sentence","listen-quote")+' '+btn(showCheck?"Hide Question":"Check My Understanding","check-toggle")+(showCheck?'<div class="softbox bluebox"><p><strong>Which meaning fits this word?</strong></p><div class="choices">'+[w.meaning,"Something that happens only at night","A kind of farm building"].map((t,i)=>'<button class="choice" data-action="check-word" data-choice="'+i+'">'+escapeHTML(t)+'</button>').join("")+'</div>'+feedback+'</div>':"")+'</details>'+normalActions(10)}
const orders=[[2,0,1],[1,2,0],[2,0,1],[0]];
function matched(round){return get().words[round]||{}}
function matchingScreen(){let r=index,start=r*3,items=DATA.words.slice(start,start+3),matches=matched(r),n=Object.keys(matches).length;
let words='<div class="choices">'+items.map((w,i)=>'<button class="choice '+(matches[i]?"matched":wrongWord===i?"bad":selectedWord===i?"selected":"")+'" data-action="match-word" data-choice="'+i+'" '+(matches[i]?"disabled":"")+'><strong>'+escapeHTML(w.word)+'</strong><span class="small">'+(matches[i]?"✓ Matched":"🔊 Tap to choose")+'</span></button>').join("")+'</div>';
let meanings='<div class="choices">'+orders[r].map(i=>'<button class="choice '+(matches[i]?"matched":wrongTarget===i?"bad":"")+'" data-action="match-meaning" data-choice="'+i+'" '+(matches[i]?"disabled":"")+'>'+escapeHTML(items[i].meaning)+(matches[i]?'<span class="small">✓ Matched</span>':"")+'</button>').join("")+'</div>';
return header()+progressHead(4,"Round")+'<p>Tap a word on the left, then tap its meaning on the right. Correct pairs turn green. You can try as many times as you need.</p><div class="matchgrid"><div><h3>Words</h3>'+words+'</div><div><h3>Meanings</h3>'+meanings+'</div></div><div class="feedback '+(wrongTarget!==null?"bad":n===items.length?"good":"info")+'" role="status">'+escapeHTML(feedback||n+" of "+items.length+" pairs matched")+'</div>'+btn("💡 "+(showHint?"Hide Hint":"Hint"),"hint")+(showHint?'<div class="softbox bluebox">'+(selectedWord===null?"Choose a word first, then remember where it appeared in the story.":"Think about how “"+escapeHTML(items[selectedWord].word)+"” was used in the story.")+'</div>':"")+'<div class="actions">'+btn("← Back","back","",index===0?"disabled":"")+btn("Skip →","skip")+btn(index===3?"Finish / Review →":"Continue →","next","primary",n!==items.length?"disabled":"")+'</div>'}
function fillScreen(){let f=DATA.fill[index],a=get().answers[index];return header()+progressHead(10,"Question")+scene(["🌾","🐖","📚","🫏","🫏","📋","📖","🐶","🐑","🐑"][index],f.text.replace("____","..."))+'<div class="softbox bluebox"><h2>Choose the missing word</h2><p class="reading">'+escapeHTML(f.text)+'</p><div class="row">'+btn("🔊 Listen","listen-fill")+btn("💡 "+(showHint?"Hide Hint":"Hint"),"hint")+'</div>'+(showHint?'<p class="muted">Think about the story and the meaning of each word. You can revisit the vocabulary activity.</p>':"")+'</div><div class="choices">'+f.options.map((t,i)=>'<button class="choice '+(a===t?(t===f.answer?"good":"bad"):"")+'" data-action="answer" data-choice="'+i+'">'+escapeHTML(t)+'</button>').join("")+'</div>'+(a?'<div class="feedback '+(a===f.answer?"good":"bad")+'" role="status">'+(a===f.answer?"That’s right! Great job!":"Not quite. Try another word!")+'</div>':"")+normalActions(10)}
function sentencesScreen(){
let chosen=saved.chosen[index]||"",w=DATA.words.find(w=>w.word===chosen)||DATA.words[0],draft=get().drafts[index]||"";
let options=DATA.words.filter(w=>w.word!==saved.chosen[1-index]).map(w=>'<option value="'+escapeHTML(w.word)+'" '+(chosen===w.word?"selected":"")+'>'+escapeHTML(w.word)+'</option>').join("");
return header()+progressHead(2,"Sentence")+'<label for="choose-word" class="sectiontitle">Choose a vocabulary word</label><select id="choose-word" data-field="word"><option value="">Select a word</option>'+options+'</select>'+(chosen?'<div class="softbox bluebox"><h2>'+escapeHTML(chosen)+'</h2><p><strong>Meaning:</strong> '+escapeHTML(w.meaning)+'</p>'+btn("🔊 Listen","listen-word")+'</div>':"")+'<label for="draft" class="sectiontitle">Write a sentence using “'+escapeHTML(chosen||"your word")+'”</label><textarea id="draft" data-field="draft" placeholder="Write your own sentence here...">'+escapeHTML(draft)+'</textarea><p class="muted">Your writing saves automatically. You can edit it later.</p><div class="row">'+btn("💡 Hint","hint")+btn("✏️ Sentence Starter","starter")+btn("🔊 Listen to My Sentence","listen-draft")+'</div>'+(showHint?'<div class="softbox bluebox">Think about what “'+escapeHTML(chosen)+'” means. Who or what might your sentence describe?</div>':"")+(showStarter?'<div class="softbox greenbox"><strong>Sentence Starter</strong><p>'+escapeHTML(starterFor(chosen))+'</p>'+btn("Use Starter","use-starter")+'</div>':"")+normalActions(2)
}
const starters={"toiled":"The animals toiled when...","supervised":"The teacher supervised...","superior":"The superior...","obstinate":"The obstinate...","cryptic":"The cryptic message...","indefatigable":"The indefatigable...","literate":"A literate person can...","seclusion":"The animal stayed in seclusion because...","resolutions":"The group made resolutions to...","maxim":"The maxim reminds us..."};
function starterFor(w){return starters[w]||"I used the word when..."}
function comprehensionScreen(){let q=DATA.comprehension[index],a=get().answers[index],draft=get().drafts[index]||"";
return header()+progressHead(6,"Question")
+'<div class="softbox bluebox"><h3>Teacher’s Question '+(index+1)+'</h3><p class="reading"><strong>'+escapeHTML(q.question)+'</strong></p>'+btn("🔊 Listen to Question","listen-question")+'</div>'
+'<details '+(showPractice?"open":"")+'><summary>Guided Practice (optional)</summary><p>'+escapeHTML(q.practice)+'</p><div class="choices">'+q.options.map((o,i)=>'<button class="choice '+(a===i?(i===q.correct?"good":"bad"):"")+'" data-action="answer" data-choice="'+i+'">'+escapeHTML(o)+'</button>').join("")+'</div>'+(a!==undefined?'<div class="feedback '+(a===q.correct?"good":"bad")+'" role="status">'+(a===q.correct?"Correct! You understood the story.":"Not quite. Try another answer!")+'</div>':"")+'</details>'
+'<label class="sectiontitle" for="draft">Write Your Own Answer (Optional)</label><p class="muted">Use your own words. Your answer is saved, and you can come back to edit it.</p><textarea id="draft" data-field="draft" placeholder="Write your answer here...">'+escapeHTML(draft)+'</textarea>'
+'<div class="row">'+btn("💡 Hint","hint")+btn("✏️ Sentence Starter","starter")+'</div>'
+(showHint?'<div class="softbox bluebox"><strong>Hint:</strong><p>'+escapeHTML(q.hint)+'</p></div>':"")
+(showStarter?'<div class="softbox greenbox"><strong>Sentence Starter:</strong><p>'+escapeHTML(q.starter)+'</p>'+btn("Use Starter","use-starter")+'</div>':"")
+btn("🔊 Listen to My Answer","listen-draft")
+'<p class="muted">Written answers are available in Parent Mode and are not automatically marked incorrect.</p>'+normalActions(6)}
function reviewScreen(){
let items=names.slice(0,7);
let total=counts.reduce((a,b)=>a+b,0),done=counts.reduce((sum,n,i)=>sum+doneCount(i),0);
let progressBody=items.map((n,i)=>'<div class="progressitem"><div class="statusline"><strong>'+escapeHTML(n)+'</strong><strong>'+percent(i)+'%</strong></div><p class="muted">'+doneCount(i)+' of '+counts[i]+' completed'+(skippedCount(i)?" · "+skippedCount(i)+" skipped":"")+'</p>'+bar(i)+'<div style="margin-top:10px">'+btn("Open Activity","open","", 'data-activity="'+i+'"')+'</div></div>').join("");
let retries=items.map((n,i)=>{let keys=Object.keys(at(i).skipped).filter(k=>!at(i).done[k]);return keys.map(k=>'<div class="progressitem"><strong>'+escapeHTML(n)+' — '+(i===3?"Round":"Item")+' '+(Number(k)+1)+'</strong><p class="muted">Skipped for now. You can return at any time.</p>'+btn("Go to Item →","goto","primary",'data-activity="'+i+'" data-index="'+k+'"')+'</div>').join("")}).join("");
let answers=[5,6].map(i=>Object.keys(at(i).drafts).filter(k=>at(i).drafts[k]?.trim()).map(k=>'<div class="progressitem"><div class="eyebrow">'+escapeHTML(names[i])+' · '+(Number(k)+1)+'</div><p>'+escapeHTML(at(i).drafts[k])+'</p>'+btn("Edit Answer","goto","",'data-activity="'+i+'" data-index="'+k+'"')+'</div>').join("")).join("");
return '<div class="eyebrow">English / Animal Farm / Chapter 3</div><h1>Review My Learning</h1><div class="softbox greenbox"><h2>⭐ Look What You’ve Learned!</h2><p>You can keep practicing whenever you are ready.</p><h2>'+done+' / '+total+' items completed</h2><div class="progress"><div style="background:var(--success);width:'+Math.round(done/total*100)+'%"></div></div></div><div class="tabbar">'+[["progress","My Progress"],["retry","Try Again"],["answers","My Answers"]].map(x=>btn(x[1],"tab",tab===x[0]?"active":"",'data-tab="'+x[0]+'"')).join("")+'</div>'+(tab==="progress"?progressBody:tab==="retry"?(retries||'<div class="softbox greenbox">No skipped items to revisit right now!</div>'):(answers||'<div class="softbox bluebox">Your written answers will appear here as you save them.</div>'))+btn("☷ Lesson Menu","menu","primary")
}
function parentScreen(){let total=counts.reduce((a,b)=>a+b,0),done=counts.reduce((v,n,i)=>v+doneCount(i),0);let voices=speechSynthesis.getVoices?.()||[];
return '<div class="eyebrow">Learn with H</div><h1>Parent Mode — Animal Farm</h1><p class="muted">Progress and written answers are stored locally in this browser on this device. They do not automatically sync. Parent Mode is not password protected in this first version.</p><div class="softbox bluebox"><h2>'+done+' of '+total+' learning items completed</h2><p>Activities completed: '+counts.filter((n,i)=>doneCount(i)===n).length+' of 7</p><p>Skipped items: '+counts.reduce((v,n,i)=>v+skippedCount(i),0)+'</p></div><label for="rate">Narration speed</label><select id="rate" data-field="rate">'+[["0.7","Slower"],["0.85","Comfortable"],["1","Normal"],["1.1","Faster"]].map(x=>'<option value="'+x[0]+'" '+(Number(saved.rate)===Number(x[0])?"selected":"")+'>'+x[1]+'</option>').join("")+'</select><label for="voice" style="display:block;margin-top:12px">Narration voice</label><select id="voice" data-field="voice"><option value="">System default voice</option>'+voices.map(v=>'<option value="'+escapeHTML(v.voiceURI)+'" '+(saved.voiceURI===v.voiceURI?'selected':'')+'>'+escapeHTML(v.name+' ('+v.lang+')')+'</option>').join('')+'</select><p class="muted">Available voices depend on this device and browser.</p><h2 style="margin-top:22px">Learning Progress</h2>'+names.slice(0,7).map((n,i)=>'<div class="progressitem"><strong>'+escapeHTML(n)+'</strong><p>'+doneCount(i)+' completed · '+skippedCount(i)+' skipped · '+percent(i)+'%</p>'+bar(i)+'</div>').join("")+'<h2>Saved Writing</h2>'+[5,6].map(i=>'<h3>'+escapeHTML(names[i])+'</h3>'+Object.keys(at(i).drafts).map(k=>'<p><strong>Item '+(Number(k)+1)+':</strong> '+escapeHTML(at(i).drafts[k]||"(not written)")+'</p>').join("")).join("")+'<h2>Previous Attempts</h2><p class="muted">Earlier results from Start Again are kept here and included in Export Progress.</p>'+((saved.history||[]).map((entry,j)=>'<div class="progressitem"><strong>'+escapeHTML(names[entry.activity])+'</strong><p class="muted">Saved '+new Date(entry.at).toLocaleString()+' · '+Object.keys(entry.results.done||{}).length+' completed items</p></div>').join('')||'<p>No earlier attempts yet.</p>')+'<div class="actions">'+btn("← Lesson Menu","menu","primary")+btn("Export Progress","export-progress")+'</div>'
}
function modal(){
let c=DATA.characters[characterIndex];
return '<div class="floatmodal" role="dialog" aria-modal="true" aria-label="Character Reference"><div class="modalbody"><div class="row spread"><h2>👥 Character Reference</h2>'+btn("✕ Back to Reading","close-characters")+'</div>'+(characterIndex===null?'<p>Choose a character to see a description.</p><h3>Main Characters</h3><div class="charactergrid">'+DATA.characters.map((c,i)=>!c.group?characterCard(c,i,true):"").join("")+'</div><h3>Supporting Characters</h3><div class="charactergrid">'+DATA.characters.map((c,i)=>c.group==="supporting"?characterCard(c,i,true):"").join("")+'</div>':'<div style="text-align:center">'+'<div class="portrait-feature">'+characterArt(c)+'</div><h2>'+escapeHTML(c.name)+'</h2><p class="reading">'+escapeHTML(c.description)+'</p>'+btn("🔊 Listen","listen-modal")+' '+btn("← All Characters","all-characters")+'</div>')+'</div></div>'
}
function render(){
let content=view==="menu"?menu():view==="review"?reviewScreen():view==="parent"?parentScreen():activity===0?characterScreen():activity===1?readingScreen():activity===2?vocabScreen():activity===3?matchingScreen():activity===4?fillScreen():activity===5?sentencesScreen():comprehensionScreen();
app.innerHTML='<div class="panel">'+content+(view==="activity"?commonFoot():"")+'</div>'+(showGallery&&view==="activity"&&activity===1?modal():"");
document.title="Learn with H — Animal Farm Chapter 3";
}
function exportProgress(){let blob=new Blob([JSON.stringify({lesson:"Animal Farm Chapter 3",exportedAt:new Date().toISOString(),progress:saved},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob);let a=document.createElement("a");a.href=url;a.download="learn-with-h-animal-farm-ch3-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),300)}
document.addEventListener("click",e=>{
let button=e.target.closest("[data-action]");if(!button)return;let a=button.dataset.action,c=Number(button.dataset.choice),n=Number(button.dataset.activity);
switch(a){
case "menu":view="menu";showGallery=false;render();break;
case "parent":view="parent";showGallery=false;render();break;
case "open":if(n===7){view="review";tab="progress";render()}else openActivity(n,0);break;
case "goto":openActivity(n,Number(button.dataset.index));break;
case "resume":resume();break;
case "restart":restart();break;
case "back":back();break;
case "skip":advance(true);break;
case "next":advance(false);break;
case "tab":tab=button.dataset.tab;render();break;
case "hint":showHint=!showHint;render();break;
case "starter":showStarter=!showStarter;render();break;
case "toggle-gallery":showGallery=!showGallery;render();break;
case "character":
  if(showGallery&&activity===1){characterIndex=Number(button.dataset.character);render()}
  else if(activity===0){index=Number(button.dataset.character);showGallery=false;saveLocation();render()}
  break;
case "go-reading":openActivity(1,0);break;
case "characters":showGallery=true;characterIndex=null;render();break;
case "all-characters":characterIndex=null;render();break;
case "close-characters":showGallery=false;characterIndex=null;render();break;
case "listen-character":speak(DATA.characters[index].name+". "+DATA.characters[index].description);break;
case "listen-modal":{let ch=DATA.characters[characterIndex];speak(ch.name+". "+ch.description);break}
case "listen-story":speak(DATA.sections[index].text);break;
case "listen-word":{let w=activity===5?DATA.words.find(w=>w.word===saved.chosen[index]):DATA.words[index];if(w)speak(w.word+". "+w.meaning);break}
case "listen-quote":speak(DATA.words[index].quote);break;
case "listen-fill":speak(DATA.fill[index].text.replace("____","blank"));break;
case "listen-question":speak(DATA.comprehension[index].question);break;
case "listen-draft":speak(get().drafts[index]||"Write your answer first.");break;
case "check-toggle":showCheck=!showCheck;feedback="";showStory=true;render();break;
case "check-word":feedback=c===0?"That’s right!":"Not quite. Try again!";showCheck=true;showStory=true;render();break;
case "answer":
  if(activity===1||activity===6){get().answers[index]=c;if(activity===1&&c===DATA.sections[index].correct)markDone(activity,index);if(activity===6&&c===DATA.comprehension[index].correct)markDone(activity,index)}
  else if(activity===4){let w=DATA.fill[index].options[c];get().answers[index]=w;if(w===DATA.fill[index].answer)markDone(activity,index)}
  persist();render();break;
case "match-word":
  if(matched(index)[c])return;
  if(selectedWord===c){selectedWord=null;wrongTarget=null;wrongWord=null;feedback="Word unselected. Choose a word when you are ready.";render();break;}
  selectedWord=c;wrongTarget=null;wrongWord=null;feedback="Now select the matching meaning for “"+DATA.words[index*3+c].word+"”.";speak(DATA.words[index*3+c].word);render();break;
case "match-meaning":
  if(selectedWord===null||matched(index)[c])return;
  if(c===selectedWord){let p=matched(index);p[c]=true;get().words[index]=p;feedback="Great match!";selectedWord=null;wrongTarget=null;wrongWord=null;if(Object.keys(p).length===DATA.words.slice(index*3,index*3+3).length)markDone(activity,index)}
  else {wrongTarget=c;wrongWord=selectedWord;selectedWord=null;feedback="Not quite. Try again!";get().attempts[index]=(get().attempts[index]||0)+1}
  persist();render();break;
case "use-starter":{
  let starter=activity===5?starterFor(saved.chosen[index]):DATA.comprehension[index].starter;
  // Ellipsis is guidance in the preview, not part of H’s answer.
  starter=starter.replace(/\s*\.{3}\s*$/," ").replace(/\s+$/," ");
  get().drafts[index]=starter;
  persist();render();
  const draft=document.querySelector('textarea[data-field="draft"]');
  if(draft){draft.focus();draft.setSelectionRange(draft.value.length,draft.value.length)}
  break;
}
case "export-progress":exportProgress();break;
}
});
document.addEventListener("input",e=>{if(e.target.dataset.field==="draft"){get().drafts[index]=e.target.value;if(e.target.value.trim())markDone(activity,index);else {delete get().done[index];persist()}}});
document.addEventListener("change",e=>{
if(e.target.dataset.field==="word"){saved.chosen[index]=e.target.value;persist();render()}
if(e.target.dataset.field==="rate"){saved.rate=Number(e.target.value);persist()}
if(e.target.dataset.field==="voice"){saved.voiceURI=e.target.value;persist()}
});
window.addEventListener("pagehide",persist);
window.speechSynthesis?.addEventListener?.("voiceschanged",()=>{if(view==="parent")render()});
render();
})();
