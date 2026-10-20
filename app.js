(() => {
"use strict";
const $ = id => document.getElementById(id);
const key="sad-turnierkarten-v1";
let cards=[], busy=false, active=null, state={sport:"football",names:["Team Blau","Team Rot"],scores:[0,0],pending:[null,null],history:[],used:{football:[],handball:[],mixed:[]}};
try {const saved=JSON.parse(localStorage.getItem(key)); if(saved && Array.isArray(saved.scores) && Array.isArray(saved.pending) && saved.used) state={...state,...saved};} catch{}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
const pool=()=>cards.filter(c=>state.sport==="mixed" || c.sport==="all" || c.sport===state.sport);
const typeLabel=c=>c.sport==="football"?"FUSSBALL":c.sport==="handball"?"HANDBALL":"TEAMCHALLENGE";
const escapeHtml=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function rand(max){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);const limit=Math.floor(4294967296/max)*max;let n;do{crypto.getRandomValues(a);n=a[0];}while(n>=limit);return n%max;}return Math.floor(Math.random()*max);}
function render(){
$("sport").value=state.sport;
state.names.forEach((name,i)=>{$("name"+(i+1)).value=name;$("label"+(i+1)).textContent=name||"Team "+(i+1);$("score"+(i+1)).textContent=state.scores[i];const pc=state.pending[i];$("pending"+(i+1)).textContent=pc?"Offen: "+pc.title+" (+"+pc.points+")":"Bereit für die nächste Karte";});
document.querySelectorAll(".draw").forEach((b,i)=>{b.disabled=busy || Boolean(state.pending[i]) || !cards.length; b.textContent=state.pending[i]?"Karte noch offen":`Karte für Team ${i+1} ziehen →`;});
$("count").textContent=pool().length+" Karten im Stapel";
$("history").innerHTML=state.history.length?state.history.slice(0,35).map(h=>`<div class="entry"><div><b>${escapeHtml(h.name)} · ${escapeHtml(h.title)}</b><span>${escapeHtml(h.time)} · ${escapeHtml(h.result)}</span></div><em>${h.awarded?"+"+h.points+" Punkte":"0 Punkte"}</em></div>`).join(""):'<p class="muted">Noch keine Karten gezogen.</p>';
if(!active && state.pending.some(Boolean)){active=state.pending.findIndex(Boolean);}
if(active!==null && state.pending[active]){showCard(state.pending[active]);$("cardActions").hidden=false;$("activeHint").textContent="Karte von "+state.names[active]+". Ergebnis nach dem Spiel bestätigen.";}
else if(!busy){$("cardActions").hidden=true;$("activeHint").textContent="Punkte gibt es nur bei bestätigter Erfüllung – nicht schon beim Ziehen.";}
}
function showCard(c){$("card").classList.remove("empty");$("cardType").textContent=typeLabel(c);$("cardTitle").textContent=c.title;$("cardText").textContent=c.description;$("cardPoints").textContent="+"+c.points;$("cardId").textContent=c.id;$("cardEmoji").textContent=c.sport==="football"?"⚽":c.sport==="handball"?"◉":"★";$("stateLabel").textContent=state.names[active]||"Challenge";}
function choose(){const p=pool();let available=p.filter(c=>!state.used[state.sport].includes(c.id));if(!available.length){state.used[state.sport]=[];available=p;}const c=available[rand(available.length)];state.used[state.sport].push(c.id);return c;}
function draw(i){if(busy || !cards.length || state.pending[i])return;busy=true;active=i;render();$("cardActions").hidden=true;$("stateLabel").textContent="Zufallsauswahl läuft";$("cardType").textContent="MISCHEN …";$("cardTitle").textContent="Die Karten werden gemischt";$("cardText").textContent="Gleich entscheidet der Zufall über eure Aufgabe.";$("cardPoints").textContent="?";$("cardId").textContent="ZUFALLSAUSWAHL";$("progresswrap").hidden=false;let start=performance.now();const duration=2400;
function step(now){const t=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-t,1.7);$("bar").style.width=Math.round(eased*100)+"%";$("pct").textContent=Math.round(eased*100)+" %";if(t<1){requestAnimationFrame(step);return;}const c=choose();state.pending[i]=c;busy=false;$("progresswrap").hidden=true;$("bar").style.width="0%";persist();render();}
requestAnimationFrame(step);}
function finish(awarded){if(busy||active===null)return;const c=state.pending[active];if(!c)return;if(awarded)state.scores[active]+=c.points;state.history.unshift({name:state.names[active],title:c.title,id:c.id,points:c.points,awarded,result:awarded?"Aufgabe erfüllt":"Nicht erfüllt",time:new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})});state.history=state.history.slice(0,200);state.pending[active]=null;const next=state.pending.findIndex(Boolean);active=next<0?null:next;persist();if(active===null){$("cardType").textContent="GESCHAFFT";$("cardTitle").textContent=awarded?"Bonuspunkte vergeben!":"Karte abgelegt";$("cardText").textContent=awarded?`+${c.points} Punkte wurden gutgeschrieben.`:"Für diese Karte gibt es keine Zusatzpunkte.";$("cardPoints").textContent=awarded?"+"+c.points:"0";$("stateLabel").textContent="Bereit für die nächste Runde";}render();}
async function init(){
try{const r=await fetch("./cards.json");if(!r.ok)throw Error("HTTP "+r.status);cards=await r.json();if(cards.length!==200)throw Error("Kartendaten unvollständig");}catch(e){$("count").textContent="Karten konnten nicht geladen werden";$("cardTitle").textContent="Karten nicht verfügbar";$("cardText").textContent="Öffne die App über GitHub Pages (https://), nicht direkt als lokale HTML-Datei. "+e.message;return;}
$("sport").addEventListener("change",e=>{if(state.pending.some(Boolean)){alert("Bitte zuerst beide gezogenen Karten abschließen.");e.target.value=state.sport;return;}state.sport=e.target.value;active=null;persist();render();});
state.names.forEach((_,i)=>$("name"+(i+1)).addEventListener("input",e=>{state.names[i]=e.target.value;persist();$("label"+(i+1)).textContent=e.target.value||"Team "+(i+1);}));
document.querySelectorAll(".draw").forEach(b=>b.addEventListener("click",()=>draw(Number(b.dataset.team))));
$("completeBtn").addEventListener("click",()=>finish(true));$("skipBtn").addEventListener("click",()=>finish(false));
$("resetBtn").addEventListener("click",()=>{if(!confirm("Alle Bonuspunkte, gezogenen Karten und den Verlauf dieses Turniers löschen?"))return;state.scores=[0,0];state.pending=[null,null];state.history=[];state.used={football:[],handball:[],mixed:[]};active=null;persist();$("cardType").textContent="BEREIT?";$("cardTitle").textContent="Eure nächste Aufgabe wartet!";$("cardText").textContent="Wählt eine Mannschaft und zieht eure Karte.";$("cardPoints").textContent="?";$("cardId").textContent="TURNIERKARTEN";$("stateLabel").textContent="Bereit zum Ziehen";render();});
const help=$("help");$("helpBtn").onclick=()=>help.showModal();$("closeHelp").onclick=()=>help.close();$("okHelp").onclick=()=>help.close();render();}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));init();
})();