import type { Club, Fixture, MatchEvent, MatchResult, Player, Tactics } from './types';

function seededRandom(seed:number) { let t=seed>>>0; return () => { t=(t+0x6D2B79F5)|0; let x=Math.imul(t^(t>>>15),1|t); x^=x+Math.imul(x^(x>>>7),61|x); return ((x^(x>>>14))>>>0)/4294967296; }; }
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const choose=<T,>(items:T[],r:()=>number):T=>items[Math.floor(r()*items.length)];
function attackRating(players:Player[]) {
  const outfield=players.filter(p=>p.position!=='GK'); if(!outfield.length)return 58;
  const attackers=outfield.filter(p=>['ST','LW','RW','AM'].includes(p.position));
  const mids=outfield.filter(p=>['CM','DM','AM'].includes(p.position));
  const vals=[...attackers,...mids].map(p=>p.overall*(0.65+p.fitness/260)*(0.8+p.morale/500));
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:outfield.reduce((a,p)=>a+p.overall,0)/outfield.length;
}
function defenseRating(players:Player[]) {
  const defenders=players.filter(p=>['GK','CB','LB','RB','DM'].includes(p.position));
  return defenders.length?defenders.reduce((a,p)=>a+(p.position==='GK'?p.goalkeeping:p.defending)*(.7+p.fitness/340),0)/defenders.length:60;
}
function styleAttack(style:Tactics['style']) { return ({balanced:1,pressing:1.04,counter:0.97,possession:1.02,direct:1.03}) as Record<Tactics['style'],number>; }
function scoreChance(xg:number, attack:number, defense:number, tactics:Tactics, r:()=>number) {
  const style=styleAttack(tactics.style)[tactics.style];
  const pressure=tactics.mentality==='attacking'?1.12:tactics.mentality==='defensive'?.87:1;
  const multiplier=clamp(1+(attack-defense)/115,0.62,1.42)*style*pressure;
  return r()<clamp(xg*multiplier,0.008,0.55);
}
export function simulateMatch(home:Club,away:Club,homePlayers:Player[],awayPlayers:Player[],homeTactics:Tactics,awayTactics:Tactics,seed=Date.now()):MatchResult {
  const r=seededRandom(seed); const homeAtk=attackRating(homePlayers),awayAtk=attackRating(awayPlayers),homeDef=defenseRating(homePlayers),awayDef=defenseRating(awayPlayers);
  const homePoss=clamp(Math.round(50+(homeAtk-awayAtk)*.42+(homeTactics.style==='possession'?5:0)+(r()-.5)*10),31,69);
  const homeShots=clamp(Math.round(9+r()*9+(homeAtk-awayDef)*.10+(homeTactics.tempo-50)*.035),4,25);
  const awayShots=clamp(Math.round(9+r()*9+(awayAtk-homeDef)*.10+(awayTactics.tempo-50)*.035),4,25);
  const events:MatchEvent[]=[]; let homeGoals=0,awayGoals=0,homeOnTarget=0,awayOnTarget=0,homeXg=0,awayXg=0;
  const simulateSide=(club:Club,opponent:Club,players:Player[],shots:number,attack:number,defense:number,tactics:Tactics,homeSide:boolean)=>{
    const active=players.filter(p=>p.injuredWeeks===0&&p.position!=='GK'); const shooters=active.length?active:players;
    for(let i=0;i<shots;i++) {
      const minute=3+Math.floor(r()*87); const player=choose(shooters,r); const xg=clamp(.045+r()*.19+(attack-defense)*.0009+(tactics.mentality==='attacking'?.018:0),.025,.36);
      const onTarget=r()<clamp(.27+player.shooting/180, .3,.8); const goal=onTarget&&scoreChance(xg,attack,defense,tactics,r);
      const xBase=homeSide?(-1.0+r()*.40):(0.60+r()*.40); const zBase=-.82+r()*1.64;
      events.push({minute,type:'shot',teamId:club.id,playerId:player.id,text:`${player.name} — ${goal?'GOAL':onTarget?'shot on target':'shot wide'}`,x:xBase,z:zBase,targetX:homeSide?.92:-.92,targetZ:(r()-.5)*.24,xg:Number(xg.toFixed(2))});
      if(onTarget) { if(homeSide)homeOnTarget++;else awayOnTarget++; }
      if(homeSide)homeXg+=xg;else awayXg+=xg;
      if(goal) {
        if(homeSide)homeGoals++;else awayGoals++;
        const assistCandidates=shooters.filter(p=>p.id!==player.id&&['CM','AM','LW','RW','ST'].includes(p.position)); const assist=assistCandidates.length&&r()>.18?choose(assistCandidates,r):undefined;
        events.push({minute,type:'goal',teamId:club.id,playerId:player.id,assistId:assist?.id,text:`GOAL! ${player.name}${assist?` (assist: ${assist.name})`:''}`,x:xBase,z:zBase,targetX:homeSide?.96:-.96,targetZ:(r()-.5)*.12,xg:Number(xg.toFixed(2))});
      } else if(onTarget&&r()<.62) events.push({minute,type:'save',teamId:opponent.id,text:`Goalkeeper makes a save`,x:xBase,z:zBase,targetX:homeSide?.88:-.88,targetZ:zBase,xg:Number(xg.toFixed(2))});
    }
    for(let i=0;i<Math.round(3+r()*7);i++) {
      const minute=2+Math.floor(r()*88); const type=r()<.16?'yellow':r()<.55?'foul':'corner'; const p=choose(players,r);
      events.push({minute,type,teamId:club.id,playerId:p.id,text:type==='yellow'?`Yellow card — ${p.name}`:type==='foul'?`Foul by ${p.name}`:`Corner kick for ${club.name}`,x:(r()-.5)*1.7,z:(r()-.5)*1.7,targetX:(r()-.5)*1.7,targetZ:(r()-.5)*1.7});
    }
  };
  simulateSide(home,away,homePlayers,homeShots,homeAtk+3,awayDef,homeTactics,true);
  simulateSide(away,home,awayPlayers,awayShots,awayAtk,homeDef,awayTactics,false);
  events.sort((a,b)=>a.minute-b.minute||(a.type==='goal'?-1:1));
  return {homeGoals,awayGoals,homeShots,awayShots,homeOnTarget,awayOnTarget,homePossession:homePoss,awayPossession:100-homePoss,homeXg:Number(homeXg.toFixed(2)),awayXg:Number(awayXg.toFixed(2)),events,seed};
}
export function calculateTable(clubs:Club[],fixtures:Fixture[]) {
  const table=clubs.map(c=>({...c,played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,points:0}));
  const byId=new Map(table.map(c=>[c.id,c]));
  for(const f of fixtures) if(f.played&&f.result) {
    const h=byId.get(f.homeClubId),a=byId.get(f.awayClubId); if(!h||!a)continue;
    h.played++;a.played++;h.goalsFor+=f.result.homeGoals;h.goalsAgainst+=f.result.awayGoals;a.goalsFor+=f.result.awayGoals;a.goalsAgainst+=f.result.homeGoals;
    if(f.result.homeGoals>f.result.awayGoals){h.won++;h.points+=3;a.lost++;} else if(f.result.homeGoals<f.result.awayGoals){a.won++;a.points+=3;h.lost++;} else {h.drawn++;a.drawn++;h.points++;a.points++;}
  }
  return table.sort((a,b)=>b.points-a.points||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor||b.reputation-a.reputation);
}
export function simulateFixture(home:Club,away:Club,players:Player[],seed:number):MatchResult {
  const neutral:Tactics={formation:'4-3-3',style:'balanced',mentality:'balanced',pressing:50,tempo:50,width:50,defensiveLine:50};
  return simulateMatch(home,away,players.filter(p=>p.clubId===home.id),players.filter(p=>p.clubId===away.id),neutral,neutral,seed);
}
export function formatDate(day:number) { const d=new Date(Date.UTC(2026,7,1+day)); return d.toISOString().slice(0,10); }
export function expectedMatchMinutes(result:MatchResult){ return result.events.reduce((m,e)=>Math.max(m,e.minute),0); }
