(() => {
"use strict";
const $ = id => document.getElementById(id);
const key="sad-turnierkarten-v2";
const oldKey="sad-turnierkarten-v1";
const teamCount=8;
const defaults=Array.from({length:teamCount},(_,i)=>`Team ${i+1}`);
let cards=[], busy=false, active=null;
let state={sport:"football",names:[...defaults],scores:Array(teamCount).fill(0),pending:Array(teamCount).fill(null),history:[],used:{football:[],handball:[],mixed:[]}};
try {
  const saved=JSON.parse(localStorage.getItem(key)||localStorage.getItem(oldKey));
  if(saved && Array.isArray(saved.scores) && Array.isArray(saved.pending) && saved.used){
    state={...state,...saved};
    state.names=defaults.map((v,i)=>typeof saved.names?.[i]==="string"?saved.names[i]:v);
    state.scores=defaults.map((_,i)=>Number.isFinite(saved.scores?.[i])?saved.scores[i]:0);
    state.pending=defaults.map((_,i)=>saved.pending?.[i]||null);
  }
} catch{}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
const pool=()=>cards.filter(c=>state.sport==="mixed" || c.sport==="all" || c.sport===state.sport);
const typeLabel=c=>c.sport==="football"?"FUSSBALL":c.sport==="handball"?"HANDBALL":"TEAMCHALLENGE";
const escapeHtml=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function rand(max){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);const limit=Math.floor(4294967296/max)*max;let n;do{crypto.getRandomValues(a);n=a[0];}while(n>=limit);return n%max;}return Math.floor(Math.random()*max);}
function render(){
$("sport").value=state.sport;
state.names.forEach((name,i)=>{
  const label=$("label"+(i+1)), score=$("score"+(i+1)), pending=$("pending"+(i+1));
  label.textContent=name.trim()||"Team "+(i+1);
  score.textContent=state.scores[i];
  const pc=state.pending[i];
  pending.textContent=pc?"Offen: "+pc.title+" (+"+pc.points+")":"Bereit für die nächste Karte";
});
document.querySelectorAll(".draw").forEach((b,i)=>{
  b.disabled=busy || !cards.length || Boolean(state.pending[i]);
  b.textContent=state.pending[i]?"Offene Karte ansehen":`Karte für ${state.names[i].trim()||"Team "+(i+1)} ziehen →`;
  if(state.pending[i] && !busy)b.disabled=false;
});
$("count").textContent=pool().length+" Karten im Stapel";
$("history").innerHTML=state.history.length?state.history.slice(0,35).map(h=>`<div class="entry"><div><b>${escapeHtml(h.name)} · ${escapeHtml(h.title)}</b><span>${escapeHtml(h.time)} · ${escapeHtml(h.result)}</span></div><em>${h.awarded?"+"+h.points+" Punkte":"0 Punkte"}</em></div>`).join(""):'<p class="muted">Noch keine Karten gezogen.</p>';
if(active===null && state.pending.some(Boolean))active=state.pending.findIndex(Boolean);
if(active!==null && state.pending[active]){
  showCard(state.pending[active]);
  $("cardActions").hidden=false;
  $("activeHint").textContent="Karte von "+state.names[active]+". Ergebnis nach dem Spiel bestätigen.";
}else if(!busy){
  $("cardActions").hidden=true;
  $("activeHint").textContent="Punkte gibt es nur bei bestätigter Erfüllung – nicht schon beim Ziehen.";
}
}
function makeTeamUi(){
  $("teamNames").innerHTML=defaults.map((_,i)=>`<label>Team ${i+1} – Name<input id="name${i+1}" maxlength="26" autocomplete="off" aria-label="Mannschaft ${i+1} benennen"></label>`).join("");
  $("scoreboard").innerHTML=defaults.map((_,i)=>`<article class="team ${i%2?"red":"blue"}"><div class="team-meta"><span class="teamlabel">MANNSCHAFT ${i+1}</span><h3 id="label${i+1}"></h3></div><strong id="score${i+1}">0</strong><span class="scorecaption">BONUSPUNKTE</span><button class="draw" data-team="${i}"></button><div class="pending" id="pending${i+1}"></div></article>`).join("");
  state.names.forEach((name,i)=>{
    const field=$("name"+(i+1));
    field.value=name;
    field.addEventListener("input",e=>{
      state.names[i]=e.target.value;
      persist();
      $("label"+(i+1)).textContent=e.target.value.trim()||"Team "+(i+1);
      const button=document.querySelector(`.draw[data-team="${i}"]`);
      if(!state.pending[i])button.textContent=`Karte für ${e.target.value.trim()||"Team "+(i+1)} ziehen →`;
    });
  });
}
function showCard(c){$("card").classList.remove("empty");$("cardType").textContent=typeLabel(c);$("cardTitle").textContent=c.title;$("cardText").textContent=c.description;$("cardPoints").textContent="+"+c.points;$("cardId").textContent=c.id;$("cardEmoji").textContent=c.sport==="football"?"⚽":c.sport==="handball"?"◉":"★";$("stateLabel").textContent=state.names[active]||"Challenge";}
function choose(){const p=pool();let available=p.filter(c=>!state.used[state.sport].includes(c.id));if(!available.length){state.used[state.sport]=[];available=p;}const c=available[rand(available.length)];state.used[state.sport].push(c.id);return c;}
function draw(i){if(busy || !cards.length)return;if(state.pending[i]){active=i;render();$("cardzone")?.scrollIntoView({behavior:"smooth",block:"start"});return;}busy=true;active=i;render();$("cardActions").hidden=true;$("stateLabel").textContent="Zufallsauswahl läuft";$("cardType").textContent="MISCHEN …";$("cardTitle").textContent="Die Karten werden gemischt";$("cardText").textContent="Gleich entscheidet der Zufall über eure Aufgabe.";$("cardPoints").textContent="?";$("cardId").textContent="ZUFALLSAUSWAHL";$("progresswrap").hidden=false;let start=performance.now();const duration=2400;
function step(now){const t=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-t,1.7);$("bar").style.width=Math.round(eased*100)+"%";$("pct").textContent=Math.round(eased*100)+" %";if(t<1){requestAnimationFrame(step);return;}const c=choose();state.pending[i]=c;busy=false;$("progresswrap").hidden=true;$("bar").style.width="0%";persist();render();}
requestAnimationFrame(step);}
function finish(awarded){if(busy||active===null)return;const c=state.pending[active];if(!c)return;if(awarded)state.scores[active]+=c.points;state.history.unshift({name:state.names[active],title:c.title,id:c.id,points:c.points,awarded,result:awarded?"Aufgabe erfüllt":"Nicht erfüllt",time:new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})});state.history=state.history.slice(0,200);state.pending[active]=null;const next=state.pending.findIndex(Boolean);active=next<0?null:next;persist();if(active===null){$("cardType").textContent="GESCHAFFT";$("cardTitle").textContent=awarded?"Bonuspunkte vergeben!":"Karte abgelegt";$("cardText").textContent=awarded?`+${c.points} Punkte wurden gutgeschrieben.`:"Für diese Karte gibt es keine Zusatzpunkte.";$("cardPoints").textContent=awarded?"+"+c.points:"0";$("stateLabel").textContent="Bereit für die nächste Runde";}render();}
async function init(){makeTeamUi();
try{const r=await fetch("./cards.json");if(!r.ok)throw Error("HTTP "+r.status);cards=await r.json();if(cards.length!==200)throw Error("Kartendaten unvollständig");}catch(e){$("count").textContent="Karten konnten nicht geladen werden";$("cardTitle").textContent="Karten nicht verfügbar";$("cardText").textContent="Öffne die App über GitHub Pages (https://), nicht direkt als lokale HTML-Datei. "+e.message;return;}
$("sport").addEventListener("change",e=>{if(state.pending.some(Boolean)){alert("Bitte zuerst alle offenen Karten abschließen.");e.target.value=state.sport;return;}state.sport=e.target.value;active=null;persist();render();});
document.querySelectorAll(".draw").forEach(b=>b.addEventListener("click",()=>draw(Number(b.dataset.team))));
$("completeBtn").addEventListener("click",()=>finish(true));$("skipBtn").addEventListener("click",()=>finish(false));
$("resetBtn").addEventListener("click",()=>{if(!confirm("Alle Bonuspunkte, gezogenen Karten und den Verlauf dieses Turniers löschen?"))return;state.scores=Array(teamCount).fill(0);state.pending=Array(teamCount).fill(null);state.history=[];state.used={football:[],handball:[],mixed:[]};active=null;persist();$("cardType").textContent="BEREIT?";$("cardTitle").textContent="Eure nächste Aufgabe wartet!";$("cardText").textContent="Wählt eine Mannschaft und zieht eure Karte.";$("cardPoints").textContent="?";$("cardId").textContent="TURNIERKARTEN";$("stateLabel").textContent="Bereit zum Ziehen";render();});
const help=$("help");$("helpBtn").onclick=()=>help.showModal();$("closeHelp").onclick=()=>help.close();$("okHelp").onclick=()=>help.close();render();}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));init();
})();