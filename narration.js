/* Shared, progress-safe narration for Learn with H. */
(function(){
"use strict";
let current=null,activeButton=null;
function status(text){let node=document.getElementById("lwh-audio-status");if(!node){node=document.createElement("div");node.id="lwh-audio-status";node.setAttribute("role","status");node.setAttribute("aria-live","polite");node.style.cssText="position:fixed;bottom:14px;right:14px;z-index:10000;background:#e8f1ff;color:#173557;border:1px solid #c7d9f1;border-radius:10px;padding:10px 14px;box-shadow:0 2px 10px #0002;font-size:14px;max-width:300px";document.body.appendChild(node)}node.textContent=text;node.hidden=!text;}
function restore(){if(activeButton?.isConnected){activeButton.textContent=activeButton.dataset.lwhOriginal||"🔊 Listen"}activeButton=null;current=null}
function stop(){if("speechSynthesis" in window){window.speechSynthesis.cancel()}restore();status("Narration stopped.")}
function play(text,button){
 if(!text)return;
 if(current&&button&&button===activeButton){stop();return}
 if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){status("Read-aloud is not supported by this browser.");return}
 const synth=window.speechSynthesis;
 synth.cancel();restore();
 const u=new SpeechSynthesisUtterance(String(text));
 u.lang="en-US";
 let settings={};try{settings=JSON.parse(localStorage.getItem("lwh:parent:settings:v1")||"{}")||{}}catch(_){}
 const rate=Number(settings.rate);u.rate=Number.isFinite(rate)&&rate>=.5&&rate<=2?rate:.85;
 const voices=synth.getVoices();const voice=voices.find(v=>v.voiceURI===settings.voiceURI);
 if(voice)u.voice=voice;
 current=u;
 if(button&&button.tagName==="BUTTON"){activeButton=button;if(!button.dataset.lwhOriginal)button.dataset.lwhOriginal=button.textContent;button.textContent="■ Stop"}
 u.onstart=()=>{if(current===u)status("Narration playing. Select Stop to end.")};
 u.onend=()=>{if(current===u){restore();status("Narration finished.")}};
 u.onerror=e=>{if(current===u){restore();status("Unable to play narration ("+(e.error||"audio error")+"). Check browser audio permissions and output.")}};
 try{synth.speak(u);if(synth.paused)synth.resume();status("Starting narration…")}catch(e){restore();status("Unable to start narration. Check browser sound settings.")}
}
window.LWHNarration={play,stop};
window.addEventListener("pagehide",()=>{if(current&&"speechSynthesis"in window)window.speechSynthesis.cancel()});
})();