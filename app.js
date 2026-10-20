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
renderTournament();
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

// Doppelrunde nach dem Kreisverfahren: acht Teams, sieben Runden pro Halbserie.
function buildFixtures(){
  const order=Array.from({length:teamCount},(_,i)=>i), games=[];
  for(let round=0;round<teamCount-1;round++){
    for(let k=0;k<teamCount/2;k++){
      let home=order[k],away=order[teamCount-1-k];
      if((round+k)%2){[home,away]=[away,home];}
      games.push({id:`H${round+1}-${k+1}`,round:round+1,home,away,hg:null,ag:null});
    }
    order.splice(1,0,order.pop());
  }
  const returnLeg=games.map(g=>({id:g.id.replace('H','R'),round:g.round+teamCount-1,home:g.away,away:g.home,hg:null,ag:null}));
  return [...games,...returnLeg];
}
function initFixtures(){
  if(!Array.isArray(state.fixtures)||state.fixtures.length!==56||new Set(state.fixtures.map(g=>g.id)).size!==56){state.fixtures=buildFixtures();persist();}
}
function tableData(){
 const tab=Array.from({length:teamCount},(_,i)=>({id:i,played:0,w:0,d:0,l:0,gf:0,ga:0,matchPts:0,bonus:state.scores[i]||0}));
 for(const g of state.fixtures){if(!Number.isInteger(g.hg)||!Number.isInteger(g.ag))continue;
 const h=tab[g.home],a=tab[g.away];h.played++;a.played++;h.gf+=g.hg;h.ga+=g.ag;a.gf+=g.ag;a.ga+=g.hg;
 if(g.hg>g.ag){h.w++;a.l++;h.matchPts+=3;}else if(g.hg<g.ag){a.w++;h.l++;a.matchPts+=3;}else{h.d++;a.d++;h.matchPts++;a.matchPts++;}
 }
 tab.forEach(r=>{r.diff=r.gf-r.ga;r.total=r.matchPts+r.bonus;});
 return tab.sort((a,b)=>b.total-a.total||b.diff-a.diff||b.gf-a.gf||b.w-a.w||a.id-b.id);
}
function renderTournament(){
 if(!Array.isArray(state.fixtures))return;
 const complete=state.fixtures.filter(g=>Number.isInteger(g.hg)&&Number.isInteger(g.ag)).length;
 $('gamesPlayed').textContent=`${complete} von 56 gespielt`;
 $('standingsBody').innerHTML=tableData().map((r,i)=>`<tr><td>${i+1}</td><td class="teamcol">${escapeHtml(state.names[r.id].trim()||'Team '+(r.id+1))}</td><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}:${r.ga}</td><td>${r.diff>0?'+':''}${r.diff}</td><td>${r.matchPts}</td><td>+${r.bonus}</td><td><strong>${r.total}</strong></td></tr>`).join('');
 $('fixtures').innerHTML=Array.from({length:14},(_,i)=>{
 const games=state.fixtures.filter(g=>g.round===i+1),finished=games.filter(g=>Number.isInteger(g.hg)&&Number.isInteger(g.ag)).length;
 return `<details class="round" ${i===0?'open':''}><summary>Spieltag ${i+1} · ${i<7?'Hinrunde':'Rückrunde'} <span>${finished}/4 Ergebnisse</span></summary>${games.map(g=>`<div class="fixture"><div class="match-names"><span>${escapeHtml(state.names[g.home].trim()||'Team '+(g.home+1))}</span><span class="versus">gegen</span><span>${escapeHtml(state.names[g.away].trim()||'Team '+(g.away+1))}</span></div><div class="score-inputs"><input aria-label="Tore ${escapeHtml(state.names[g.home])}" data-game="${g.id}" data-side="hg" inputmode="numeric" type="number" min="0" max="99" placeholder="–" value="${g.hg??''}"><b>:</b><input aria-label="Tore ${escapeHtml(state.names[g.away])}" data-game="${g.id}" data-side="ag" inputmode="numeric" type="number" min="0" max="99" placeholder="–" value="${g.ag??''}"></div><button class="save-game" data-save="${g.id}">Speichern</button><span class="saved-marker">${Number.isInteger(g.hg)&&Number.isInteger(g.ag)?'✓':''}</span></div>`).join('')}</details>`;
 }).join('');
}
function saveGame(id){
 const g=state.fixtures.find(x=>x.id===id);if(!g)return;
 const inputs=[...document.querySelectorAll('[data-game]')].filter(x=>x.dataset.game===id);
 const values=inputs.map(el=>el.value.trim());
 if(values.some(v=>v!=='')&&values.some(v=>v==='')){alert('Bitte beide Torzahlen eingeben oder beide Felder leeren.');return;}
 if(values.some(v=>v!==''&&(!/^\d+$/.test(v)||Number(v)>99))){alert('Bitte Tore als ganze Zahl zwischen 0 und 99 eintragen.');return;}
 g.hg=values[0]===''?null:Number(values[0]);g.ag=values[1]===''?null:Number(values[1]);persist();
 // Retain expanded fixture round after re-render.
 const round=g.round;renderTournament();const el=document.querySelectorAll('.round')[round-1];if(el)el.open=true;
}
function bindTournament(){
 initFixtures();renderTournament();
 $('fixtures').addEventListener('click',e=>{const button=e.target.closest('[data-save]');if(button)saveGame(button.dataset.save);});
 $('generateFixtures').addEventListener('click',()=>{if(!confirm('Spielplan und alle bisherigen Spielergebnisse vollständig neu erstellen? Bonuspunkte bleiben erhalten.'))return;state.fixtures=buildFixtures();persist();renderTournament();});
 $('resetResults').addEventListener('click',()=>{if(!confirm('Alle 56 Spielergebnisse löschen? Kartenzüge und Bonuspunkte bleiben erhalten.'))return;state.fixtures.forEach(g=>{g.hg=null;g.ag=null;});persist();renderTournament();});
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
      renderTournament();
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
bindTournament();
const help=$("help");$("helpBtn").onclick=()=>help.showModal();$("closeHelp").onclick=()=>help.close();$("okHelp").onclick=()=>help.close();render();}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));init();
})();