// SHADOWCONSOLE 500-GAME ARCADE
const $=id=>document.getElementById(id);
const categories=[
 {name:"Action",icon:"⚔️",type:"dodge",colors:["#57245f","#17152e"]},
 {name:"Racing",icon:"🏎️",type:"racing",colors:["#174d70","#11192e"]},
 {name:"Horror",icon:"👻",type:"survival",colors:["#5a203b","#1b1026"]},
 {name:"Adventure",icon:"🗺️",type:"collect",colors:["#285b50","#101f2b"]},
 {name:"Shooting",icon:"🚀",type:"shooter",colors:["#4a316f","#11172c"]},
 {name:"Puzzle",icon:"🧩",type:"puzzle",colors:["#25536a","#11182c"]},
 {name:"Sports",icon:"🏆",type:"pong",colors:["#236147","#10241f"]},
 {name:"Arcade",icon:"👾",type:"breaker",colors:["#5b3b1e","#20162a"]},
 {name:"Strategy",icon:"♟️",type:"target",colors:["#4d4a29","#191a22"]},
 {name:"Space",icon:"🪐",type:"space",colors:["#263c75","#101326"]}
];
const words=[
 ["Neon Clash","Shadow Strike","Cyber Duel","Blade Rush","Rogue Arena","Mech Brawl","Ninja Circuit","Chaos Zone","Titan Fight","Pulse Combat"],
 ["Turbo Drift","Midnight Racer","Nitro Sprint","Street Velocity","Neon Rally","Drift Legends","Hyper Kart","Turbo Circuit","Velocity X","Road Phantom"],
 ["Haunted Hall","Night Watch","Phantom Run","Cursed Manor","Ghost Signal","Dark Corridor","Silent Steps","The Last Lantern","Grave Shift","Fear Factory"],
 ["Lost Temple","Jungle Quest","Crystal Trail","Mystic Island","Sky Explorer","Ancient Map","Treasure Run","Wild Frontier","Moon Relic","Hidden Kingdom"],
 ["Star Blaster","Pixel Assault","Astro Defender","Laser Squad","Robo Siege","Alien Strike","Nova Force","Plasma Patrol","Meteor Hunter","Galactic Raid"],
 ["Brain Grid","Color Logic","Tile Twist","Mystery Matrix","Number Lab","Shape Shift","Circuit Puzzle","Gem Match","Mind Maze","Pattern Pop"],
 ["Goal Rush","Hoop Heroes","Racket Rally","Penalty Pro","Street Cricket","Ice Sprint","Power Serve","Volley Stars","Kick Masters","Track Champion"],
 ["Pixel Breaker","Coin Quest","Bubble Storm","Brick Bash","Retro Runner","Gem Drop","Candy Circuit","Jelly Jump","Pop Galaxy","Block Party"],
 ["Kingdom Tactics","Tower Guard","Castle Command","Grid General","Empire Builder","Fortress Five","Battle Planner","Mini Kingdom","War Room","Tactical Trail"],
 ["Orbit Dash","Moon Hopper","Cosmic Drift","Asteroid Run","Planet Patrol","Comet Chase","Lunar Escape","Galaxy Glide","Star Hopper","Void Runner"]
];
const suffixes=["Reloaded","Ultra","DX","Infinity","Zero","Turbo","Prime","Origins","Reborn","Arena","Legends","Rush","X","Neo","Deluxe","2049","Unleashed","Evolution","Remix","Final"];
const games=[];
categories.forEach((cat,ci)=>{for(let i=0;i<50;i++){
 const title=words[ci][i%10]+(i>=10?" "+suffixes[Math.floor(i/10)-1]:"");
 games.push({id:ci*50+i+1,title,category:cat.name,icon:cat.icon,type:cat.type,c1:cat.colors[0],c2:cat.colors[1],difficulty:1+(i%5),seed:ci*71+i*13});
}});
let filtered=[...games],page=1,perPage=20,selected=null;
const grid=$("gameGrid");
function render(){
 const q=$("searchInput").value.toLowerCase(),cat=$("categoryFilter").value,sort=$("sortFilter").value;
 filtered=games.filter(g=>(cat==="All"||g.category===cat)&&(g.title.toLowerCase().includes(q)||g.category.toLowerCase().includes(q)));
 if(sort==="az")filtered.sort((a,b)=>a.title.localeCompare(b.title));
 else if(sort==="za")filtered.sort((a,b)=>b.title.localeCompare(a.title));
 else filtered.sort((a,b)=>a.id-b.id);
 const pages=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.min(page,pages);
 $("visibleCount").textContent=filtered.length;
 $("pageLabel").textContent=`PAGE ${page} / ${pages}`;
 $("prevPage").disabled=page===1;$("nextPage").disabled=page===pages;
 grid.innerHTML="";
 filtered.slice((page-1)*perPage,page*perPage).forEach(g=>{
  const card=document.createElement("button");card.className="game-card";
  card.innerHTML=`<div class="game-art" style="--c1:${g.c1};--c2:${g.c2}"><small class="game-number">#${String(g.id).padStart(3,"0")}</small><span>${g.icon}</span></div><div class="game-card-content"><h3>${g.title}</h3><p>${g.category} · Level ${g.difficulty}</p></div>`;
  card.onclick=()=>launch(g);grid.appendChild(card);
 });
}
categories.forEach(c=>{const o=document.createElement("option");o.value=c.name;o.textContent=c.name;$("categoryFilter").appendChild(o);const b=document.createElement("button");b.className="chip";b.textContent=c.icon+" "+c.name;b.onclick=()=>{$("categoryFilter").value=c.name;page=1;document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");render();};$("categoryChips").appendChild(b);});
const allChip=document.createElement("button");allChip.className="chip active";allChip.textContent="✦ All games";allChip.onclick=()=>{$("categoryFilter").value="All";page=1;document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));allChip.classList.add("active");render();};$("categoryChips").prepend(allChip);
$("searchInput").oninput=()=>{page=1;render();};$("categoryFilter").onchange=()=>{page=1;render();};$("sortFilter").onchange=()=>{page=1;render();};
$("prevPage").onclick=()=>{page=Math.max(1,page-1);render();};$("nextPage").onclick=()=>{page++;render();};

const canvas=$("gameCanvas"),ctx=canvas.getContext("2d");let peer=null,conn=null,keys=new Set(),running=false,raf=0,score=0,world={},lastTime=0;
const instructions={
 dodge:"Move left and right. Avoid the falling hazards. Keyboard: ← → / A D. Phone: D-pad.",
 racing:"Steer left and right to avoid traffic. Survive as long as possible.",
 survival:"The dark is closing in. Move quickly and dodge the ghosts.",
 collect:"Collect the glowing gems and avoid hazards. Use all directions.",
 shooter:"Move and fire with Space or the A button. Clear the incoming targets.",
 puzzle:"Move around the board and collect the glowing target. Avoid the moving blockers.",
 pong:"Move up and down to return the ball. Use ↑ ↓ or the phone D-pad.",
 breaker:"Move your paddle and bounce the ball to break all the blocks.",
 target:"Move your cursor/ship and hit the targets. Space or A fires.",
 space:"Pilot through the asteroid field. Dodge debris and collect stars."
};
function setConnection(text,online=false){$("connectionStatus").textContent="● "+text;$("connectionStatus").classList.toggle("online",online);}
$("createRoom").onclick=()=>{if(peer)peer.destroy();const id="shadow-"+Math.random().toString(36).slice(2,8);$("roomCode").textContent=id;setConnection("CREATING ROOM");peer=new Peer(id);peer.on("open",()=>setConnection("PC ROOM READY"));peer.on("connection",c=>{if(conn)conn.close();conn=c;c.on("open",()=>setConnection("PHONE CONNECTED",true));c.on("data",d=>{if(d&&d.type==="input"){if(d.down)keys.add(d.key);else keys.delete(d.key);}});c.on("close",()=>{keys.clear();setConnection("PHONE DISCONNECTED");});});peer.on("error",e=>{setConnection("CONNECTION ERROR");alert("Peer connection error: "+e.type);});};
$("copyCode").onclick=async()=>{try{await navigator.clipboard.writeText($("roomCode").textContent);$("copyCode").textContent="COPIED";setTimeout(()=>$("copyCode").textContent="COPY",1200);}catch(e){alert("Select and copy the room code.");}};
$("connectBtn").onclick=()=>{const code=$("connectCode").value.trim();if(!code)return alert("Enter the PC room code.");if(peer)peer.destroy();setConnection("CONNECTING");peer=new Peer();peer.on("open",()=>{conn=peer.connect(code,{reliable:true});conn.on("open",()=>setConnection("PHONE CONNECTED",true));conn.on("close",()=>setConnection("DISCONNECTED"));});peer.on("error",()=>{setConnection("CONNECTION FAILED");alert("Connection failed. Check code and internet.");});};
function send(key,down){if(conn&&conn.open)conn.send({type:"input",key,down});}
document.querySelectorAll("[data-key]").forEach(btn=>{let k=btn.dataset.key;const down=e=>{e.preventDefault();send(k,true);keys.add(k);};const up=e=>{e.preventDefault();send(k,false);keys.delete(k);};btn.addEventListener("pointerdown",down);["pointerup","pointercancel","pointerleave"].forEach(t=>btn.addEventListener(t,up));});
window.addEventListener("keydown",e=>{const m={ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right",ArrowUp:"up",w:"up",ArrowDown:"down",s:"down"," ":"fire",Enter:"fire"};if(m[e.key]){keys.add(m[e.key]);e.preventDefault();}});window.addEventListener("keyup",e=>{const m={ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right",ArrowUp:"up",w:"up",ArrowDown:"down",s:"down"," ":"fire",Enter:"fire"};if(m[e.key])keys.delete(m[e.key]);});
function launch(g){selected=g;$("playingTitle").textContent=`#${String(g.id).padStart(3,"0")} — ${g.title}`;$("gameInstructions").textContent=instructions[g.type];$("gameStartOverlay").classList.add("hidden");$("playPanel").scrollIntoView({behavior:"smooth",block:"start"});startGame();}
$("closeGame").onclick=()=>{running=false;cancelAnimationFrame(raf);$("gameStartOverlay").classList.remove("hidden");$("gameStartOverlay").querySelector("h3").textContent="GAME PAUSED";$("gameStartOverlay").querySelector("p").textContent="Choose another game from the vault.";};
$("restartGame").onclick=()=>{if(selected)startGame();};
function startGame(){if(!selected)return;running=false;cancelAnimationFrame(raf);score=0;lastTime=0;const r=()=>Math.random();world={player:{x:450,y:410,w:34,h:24},objects:[],bullets:[],ball:{x:450,y:250,vx:4,vy:4},paddle:390,blocks:[],target:{x:450,y:150},memory:[],tick:0};for(let i=0;i<10;i++)world.blocks.push({x:35+i*83,y:70+(i%2)*42,w:55,h:18,alive:true});for(let i=0;i<6;i++)world.objects.push({x:40+r()*820,y:-r()*500-20,s:14+r()*16,v:2+r()*selected.difficulty*.7});running=true;$("gameStartOverlay").classList.add("hidden");$("scoreValue").textContent="0";raf=requestAnimationFrame(frame);}
function bg((world?.tick ?? 0)*.3){ctx.fillStyle="#080817";ctx.fillRect(0,0,900,500);ctx.strokeStyle="#1a1b36";for(let x=0;x<900;x+=45){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,500);ctx.stroke();}for(let y=0;y<500;y+=45){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(900,y);ctx.stroke();}for(let i=0;i<45;i++){ctx.fillStyle="#ffffff18";ctx.fillRect((i*137+(selected?.seed ?? 0)*9)%900,(i*71+world.tick*.3)%500,2,2);}}
function playerDraw(){const p=world.player;ctx.save();ctx.shadowBlur=18;ctx.shadowColor=selected.c1;ctx.fillStyle="#b99aff";ctx.beginPath();ctx.moveTo(p.x,p.y-15);ctx.lineTo(p.x+18,p.y+14);ctx.lineTo(p.x,p.y+7);ctx.lineTo(p.x-18,p.y+14);ctx.closePath();ctx.fill();ctx.restore();}
function frame(t){if(!running)return;const dt=Math.min((t-lastTime||16)/16,2);lastTime=t;world.tick+=dt;bg((world?.tick ?? 0)*.3);const p=world.player,speed=5+selected.difficulty*.4;const move=(axis)=>{if(keys.has(axis))return true;return false;};
 if(move("left"))p.x-=speed*dt;if(move("right"))p.x+=speed*dt;if(move("up"))p.y-=speed*dt;if(move("down"))p.y+=speed*dt;p.x=Math.max(25,Math.min(875,p.x));p.y=Math.max(35,Math.min(475,p.y));
 const type=selected.type;
 if(["dodge","survival","racing","collect","space","puzzle"].includes(type)){
  world.objects.forEach(o=>{o.y+=o.v*dt;if(type==="racing")o.y+=2*dt;if(o.y>520){o.y=-20;o.x=35+Math.random()*830;score+=type==="collect"?0:1;}if(type==="collect"&&Math.abs(o.x-p.x)<25&&Math.abs(o.y-p.y)<25){o.y=-30;o.x=30+Math.random()*840;score+=10;}});
  world.objects.forEach(o=>{ctx.fillStyle=type==="survival"?"#ff558b":type==="collect"?"#4fffd0":"#ff8b53";ctx.shadowBlur=13;ctx.shadowColor=ctx.fillStyle;ctx.fillRect(o.x,o.y,o.s,o.s);ctx.shadowBlur=0;if(type!=="collect"&&Math.abs(o.x-p.x)<o.s+13&&Math.abs(o.y-p.y)<o.s+13){if(type==="dodge"||type==="survival"||type==="racing"||type==="space"){endGame();return;}}});
  if(!running)return;playerDraw();if(type==="collect"){ctx.fillStyle="#54f5d2";ctx.font="18px Orbitron";ctx.fillText("COLLECT THE GEMS",20,30);}
 }else if(type==="shooter"||type==="target"){
  playerDraw();if(keys.has("fire")||keys.has("a")){if(world.tick%9<2)world.bullets.push({x:p.x,y:p.y-20});}
  world.bullets.forEach(b=>b.y-=9*dt);world.bullets=world.bullets.filter(b=>b.y>0);world.objects.forEach(o=>o.y+=o.v*dt);world.objects.forEach(o=>{ctx.fillStyle="#ff668d";ctx.beginPath();ctx.arc(o.x,o.y,o.s,0,Math.PI*2);ctx.fill();world.bullets.forEach(b=>{if(Math.abs(b.x-o.x)<o.s&&Math.abs(b.y-o.y)<o.s){o.y=530;score+=5;}});});world.bullets.forEach(b=>{ctx.fillStyle="#4df5ff";ctx.fillRect(b.x-3,b.y,6,15);});
 }else if(type==="pong"||type==="breaker"){
  const paddleY=type==="pong"?p.y:450;world.paddle=Math.max(0,Math.min(800,world.paddle+(move("left")?-7:0)+(move("right")?7:0)));if(type==="pong")world.paddle=Math.max(0,Math.min(800,world.paddle+(move("up")?-7:0)+(move("down")?7:0)));
  const b=world.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<10||b.x>890)b.vx*=-1;if(b.y<10)b.vy=Math.abs(b.vy);if(type==="pong"){ctx.fillStyle="#b99aff";ctx.fillRect(25,paddleY-45,13,90);ctx.fillRect(862,b.y-42,13,84);if(b.x<45&&Math.abs(b.y-paddleY)<50)b.vx=Math.abs(b.vx);if(b.x>850&&Math.abs(b.y-250)<50)b.vx=-Math.abs(b.vx);if(b.y>500){endGame();return;}}else{ctx.fillStyle="#b99aff";ctx.fillRect(world.paddle,465,110,12);if(b.y>450&&b.x>world.paddle&&b.x<world.paddle+110)b.vy=-Math.abs(b.vy);if(b.y>500){endGame();return;}world.blocks.forEach(bl=>{if(bl.alive){ctx.fillStyle=selected.c1;ctx.fillRect(bl.x,bl.y,bl.w,bl.h);if(b.x>bl.x&&b.x<bl.x+bl.w&&b.y>bl.y&&b.y<bl.y+bl.h){bl.alive=false;b.vy*=-1;score+=10;}}});if(world.blocks.every(x=>!x.alive)){endGame(true);return;}}
  ctx.fillStyle="#4cf3ff";ctx.beginPath();ctx.arc(b.x,b.y,9,0,Math.PI*2);ctx.fill();
 }else if(type==="puzzle"){
  playerDraw();ctx.fillStyle="#52f5cf";ctx.fillRect(world.target.x,world.target.y,24,24);if(Math.abs(p.x-world.target.x)<30&&Math.abs(p.y-world.target.y)<30){score+=10;world.target={x:30+Math.random()*830,y:30+Math.random()*420};}
  world.objects.forEach(o=>{ctx.fillStyle="#ff688d";ctx.fillRect(o.x,o.y,o.s,o.s);});
 }
 $("scoreValue").textContent=score;raf=requestAnimationFrame(frame);}
function endGame(won=false){running=false;cancelAnimationFrame(raf);ctx.fillStyle="#080812df";ctx.fillRect(0,0,900,500);ctx.textAlign="center";ctx.fillStyle=won?"#52f5cf":"#ff6c9f";ctx.font="bold 36px Orbitron";ctx.fillText(won?"LEVEL CLEAR":"GAME OVER",450,225);ctx.fillStyle="#fff";ctx.font="20px Rajdhani";ctx.fillText("Final score: "+score,450,265);ctx.textAlign="left";$("scoreValue").textContent=score;}
bg();render();
