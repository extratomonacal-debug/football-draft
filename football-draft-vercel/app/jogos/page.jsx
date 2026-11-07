"use client";
import React,{useEffect,useRef,useState} from "react";
import Link from "next/link";
import "./games.css";
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const positions=["Guarda-redes","Defesa central","Defesa lateral","Médio","Extremo","Avançado"];
const clubs=["Real Madrid","Barcelona","Manchester City","Liverpool","Arsenal","Bayern","PSG","Chelsea","Manchester United","Juventus","Inter","AC Milan","Benfica","Sporting","FC Porto"];
const nations=["Portugal","Brasil","França","Argentina","Espanha","Inglaterra","Alemanha","Itália","Países Baixos","Uruguai"];
const modes=[
{id:"classic",icon:"🔤",title:"Roleta das Letras",desc:"Posição + letra. Tens 30s para responder; o rival pode roubar em 10s.",tag:"O ORIGINAL"},
{id:"position",icon:"🎯",title:"Posição Surpresa",desc:"Uma posição aleatória. Quem conseguir mais jogadores vence.",tag:"RÁPIDO"},
{id:"club",icon:"🏟️",title:"Clube Misterioso",desc:"Diz um jogador que tenha representado o clube sorteado.",tag:"CLUBES"},
{id:"nation",icon:"🌍",title:"Batalha de Países",desc:"Encontra um jogador da nacionalidade sorteada.",tag:"SELEÇÕES"},
{id:"combo",icon:"⚡",title:"Desafio Impossível",desc:"Letra + posição + clube. Para verdadeiros especialistas.",tag:"DIFÍCIL"},
{id:"survival",icon:"🔥",title:"Sobrevivência",desc:"Cada falha dá um ponto ao rival. Primeiro a 5 ganha.",tag:"ELIMINAÇÃO"},
{id:"draft",icon:"🏆",title:"Draft 1v1",desc:"Cada resposta válida contrata um jogador para o teu onze.",tag:"11 JOGADORES"},
{id:"blitz",icon:"⏱️",title:"Blitz 15 Segundos",desc:"Sem tempo para pensar: responde em 15 segundos.",tag:"VELOCIDADE"}
];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const initial=()=>({names:["Jogador 1","Jogador 2"],scores:[0,0],squads:[[],[]],history:[]});
function makeChallenge(mode){
const letter=pick(alphabet),pos=pick(positions),club=pick(clubs),nation=pick(nations);
if(mode==="classic"||mode==="survival"||mode==="draft"||mode==="blitz")return {letter,pos,description:"Um "+pos.toLowerCase()+" cujo nome conhecido começa por "+letter,short:pos+" · "+letter};
if(mode==="position")return {pos,description:"Diz o nome de um "+pos.toLowerCase(),short:pos};
if(mode==="club")return {club,description:"Diz um jogador que tenha jogado no "+club,short:club};
if(mode==="nation")return {nation,description:"Diz um jogador da seleção de "+nation,short:nation};
return {letter,pos,club,description:"Um "+pos.toLowerCase()+" que tenha jogado no "+club+" e cujo nome conhecido começa por "+letter,short:pos+" · "+club+" · "+letter};
}
export default function Games(){
const [mode,setMode]=useState("classic"),[data,setData]=useState(initial),[turn,setTurn]=useState(0),[challenge,setChallenge]=useState(null),[phase,setPhase]=useState("idle"),[seconds,setSeconds]=useState(30),[answer,setAnswer]=useState(""),[notice,setNotice]=useState(""),[round,setRound]=useState(0),[spinning,setSpinning]=useState(false),[sound,setSound]=useState(false);
const [searchResults,setSearchResults]=useState([]),[searching,setSearching]=useState(false);
const timer=useRef(null),spinTimer=useRef(null);
useEffect(()=>{try{const s=JSON.parse(localStorage.getItem("fd-party-v1")||"null");if(s?.names?.length===2)setData(s)}catch{}},[]);
useEffect(()=>{localStorage.setItem("fd-party-v1",JSON.stringify(data))},[data]);
useEffect(()=>{if(phase!=="answer"&&phase!=="steal")return;timer.current=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>clearInterval(timer.current)},[phase]);
useEffect(()=>{if(seconds!==0)return;if(phase==="answer"){setPhase("steal");setSeconds(10);setAnswer("");setNotice("Tempo esgotado! O adversário tem 10 segundos para roubar.")}else if(phase==="steal"){setPhase("judge");setNotice("Ninguém respondeu a tempo. Podes marcar a ronda sem pontos.")}},[seconds,phase]);
useEffect(()=>{if(!answer.trim()||answer.trim().length<3||!["answer","steal","judge"].includes(phase)){setSearchResults([]);return}let cancelled=false;const t=setTimeout(async()=>{setSearching(true);try{const r=await fetch("/api/search?q="+encodeURIComponent(answer.trim()));const d=await r.json();if(!cancelled)setSearchResults(d.players||[])}catch{if(!cancelled)setSearchResults([])}finally{if(!cancelled)setSearching(false)}},500);return()=>{cancelled=true;clearTimeout(t)}},[answer,phase]);
useEffect(()=>()=>{clearInterval(timer.current);clearTimeout(spinTimer.current)},[]);
const active=phase==="steal"?1-turn:turn;
function start(){if(spinning)return;setSpinning(true);setPhase("spin");setAnswer("");setNotice("");setSearchResults([]);spinTimer.current=setTimeout(()=>{setChallenge(makeChallenge(mode));setSeconds(mode==="blitz"?15:30);setPhase("answer");setSpinning(false)},1100)}
function submit(){if(!answer.trim()){setNotice("Escreve um nome antes de submeter.");return}setPhase("judge");setNotice("Confirmem em conjunto se o jogador cumpre o desafio. O nome mais conhecido conta: Mbappé = M, não Kylian.")}
function award(winner){const name=answer.trim(),scorer=winner===null?null:winner;setData(prev=>({ ...prev,scores:prev.scores.map((n,i)=>i===scorer?n+1:n),squads:prev.squads.map((s,i)=>i===scorer&&mode==="draft"&&name&&s.length<11?[...s,name]:s),history:[{mode,challenge:challenge?.short||"",answer:name||"—",winner:scorer===null?"Sem pontos":prev.names[scorer]},...prev.history].slice(0,40)}));setRound(r=>r+1);setTurn(t=>1-t);setPhase("idle");setAnswer("");setChallenge(null);setNotice("");setSearchResults([])}
function wrong(){if(phase==="steal"){setPhase("judge");setNotice("Resposta recusada. Marca sem pontos ou atribui o ponto conforme as regras.")}else{setPhase("steal");setSeconds(10);setAnswer("");setNotice("Resposta recusada! O rival tem 10 segundos para roubar.")}}
function reset(){if(!window.confirm("Reiniciar pontuações, equipas e histórico?"))return;setData(prev=>({...initial(),names:prev.names}));setRound(0);setTurn(0);setPhase("idle");setChallenge(null);setAnswer("")}
const currentMode=modes.find(m=>m.id===mode);
return <main className="games-shell">
<header className="games-header"><Link href="/" className="games-logo">✦ FOOTBALL<span>DRAFT</span></Link><div className="games-nav"><Link href="/">← Criar equipa</Link><button onClick={reset}>↻ Reiniciar</button></div></header>
<section className="games-hero"><div className="games-kicker">FOOTBALL DRAFT · PARTY ARENA</div><h1>O FUTEBOL É <em>UMA BATALHA.</em></h1><p>Oito modos de jogo para desafiares o teu irmão, amigos ou rivais. Um ecrã, dois jogadores, infinitas discussões de futebol.</p><div className="games-meta"><span>⚡ 8 MODOS</span><span>👥 2 JOGADORES</span><span>🏆 DRAFT & PONTOS</span></div></section>
<div className="games-section-heading"><h2>ESCOLHE O TEU JOGO</h2><span>Seleciona um modo para começar</span></div>
<div className="games-modes">{modes.map(m=><button key={m.id} className={"games-mode "+(mode===m.id?"active":"")} onClick={()=>{if(phase!=="idle"&&!window.confirm("Abandonar a ronda atual?"))return;setMode(m.id);setPhase("idle");setChallenge(null);setAnswer("");setNotice("")}}><span className="games-mode-icon">{m.icon}</span><span className="games-tag">{m.tag}</span><strong>{m.title}</strong><small>{m.desc}</small></button>)}</div>
<section className="games-arena"><div className="games-arena-top"><div><span className="games-kicker">ARENA · RONDA {round+1}</span><h2>{currentMode.icon} {currentMode.title}</h2></div><span className="games-status">{phase==="idle"?"PRONTO A JOGAR":phase==="spin"?"A SORTEAR":phase==="steal"?"ROUBO DE BOLA":phase==="judge"?"DECISÃO DO ÁRBITRO":"A JOGAR"}</span></div>
<div className="games-scoreboard">{[0,1].map(i=><div key={i} className={"games-player "+(active===i&&phase!=="idle"?"on":"")}><label>JOGADOR {i+1}</label><input aria-label={"Nome do jogador "+(i+1)} value={data.names[i]} maxLength={22} onChange={e=>setData(p=>({...p,names:p.names.map((n,j)=>i===j?e.target.value:n)}))}/><strong>{data.scores[i]}</strong><span>{mode==="draft"?data.squads[i].length+"/11 CONTRATAÇÕES":i===turn?"COMEÇA A RONDA":"ADVERSÁRIO"}</span></div>)}</div>
<div className="games-stage">{phase==="idle"?<><div className="games-wheel">A <span>⚽</span> Z</div><h3>{data.names[turn]}, estás pronto?</h3><p>Roda a roleta e descobre o teu próximo desafio.</p><button className="games-primary" onClick={start}>🎲 RODAR E COMEÇAR</button></>:phase==="spin"?<><div className="games-wheel spinning">A <span>⚽</span> Z</div><h3>A SORTEAR O DESAFIO…</h3></>:<><div className="games-kicker">{phase==="steal"?"OPORTUNIDADE DE ROUBO":phase==="judge"?"VALIDAÇÃO MANUAL":"O TEU DESAFIO"}</div><h3 className="games-challenge">{challenge?.description}</h3><div className={"games-timer "+(seconds<=10?"urgent":"")}>{phase==="judge"?"✓":seconds}<small>{phase==="judge"?"VALIDAR RESPOSTA":"SEGUNDOS"}</small></div><p className="games-turn">{data.names[active]} {phase==="steal"?"pode roubar o ponto!":phase==="judge"?"— decidam se a resposta é válida.":"tem a palavra!"}</p><div className="games-answer"><input aria-label="Nome do futebolista" value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&phase!=="judge")submit()}} disabled={phase==="judge"} placeholder="Escreve o nome conhecido do jogador…" autoFocus/>{phase!=="judge"&&<button onClick={submit}>SUBMETER ↗</button>}</div>{searchResults.length>0&&<div className="games-suggestions"><small>SUGESTÕES TRANSFERMARKT · CONFIRMA AS REGRAS MANUALMENTE</small>{searchResults.slice(0,4).map(p=><button key={p.id} onClick={()=>setAnswer(p.name)} disabled={phase==="judge"}>{p.name} <span>{p.club}</span></button>)}</div>}{searching&&<small>A procurar no Transfermarkt…</small>}{notice&&<p className="games-notice">{notice}</p>}{phase==="judge"?<div className="games-actions"><button className="games-primary" onClick={()=>award(active)}>✓ VÁLIDO · +1 {data.names[active]}</button><button onClick={wrong}>✕ INVÁLIDO / ROUBO</button><button onClick={()=>award(null)}>SEM PONTOS</button></div>:<div className="games-actions"><button onClick={wrong}>Não sabe / Passar →</button></div>}</>}</div>
<div className="games-rules"><strong>📋 REGRAS DA CASA</strong><p>Contam os nomes pelos quais os jogadores são mais conhecidos: <b>Mbappé começa por M</b>, Cristiano Ronaldo por C e Neymar por N. O primeiro jogador tem 30 segundos (15 no Blitz); se falhar, o outro tem 10 segundos para roubar. As respostas são confirmadas pelos dois jogadores — a pesquisa é apenas uma ajuda, não um árbitro automático.</p></div>
</section>
<div className="games-bottom"><section><h2>🏆 EQUIPAS DO DRAFT</h2><div className="games-squads">{data.squads.map((s,i)=><div key={i}><h3>{data.names[i]} <span>{s.length}/11</span></h3>{Array.from({length:11},(_,j)=><p key={j}><span>{String(j+1).padStart(2,"0")}</span>{s[j]||"Por contratar"}</p>)}</div>)}</div></section><section><h2>📜 ÚLTIMAS RONDAS</h2>{data.history.length?data.history.slice(0,10).map((h,i)=><div className="games-history" key={i}><b>{h.winner}</b><span>{h.challenge}</span><small>{h.answer}</small></div>):<p className="games-empty">Ainda não há rondas. Começa a jogar!</p>}</section></div>
<footer className="games-footer">FOOTBALL DRAFT · PARTY ARENA <Link href="/">VOLTAR AO CONSTRUTOR →</Link></footer>
</main>
}