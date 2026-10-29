import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Club, FinancialTransaction, GameState, MatchResult, Player, Tactics } from './types';
import { createInitialState, createPlayer, createRoundRobinFixtures } from './seed';
import { simulateFixture } from './engine';

export interface GameStore extends GameState {
  resetGame: () => void;
  updateTactics: (changes: Partial<Tactics>) => void;
  makeTransferOffer: (playerId: string, offerAmount: number) => { accepted: boolean; message: string; counterOffer?: number };
  sellPlayer: (playerId: string) => { ok: boolean; message: string };
  scoutPlayer: (playerId: string) => { ok: boolean; message: string };
  upgradeFacility: (key: keyof GameState['facilities']) => { ok: boolean; message: string };
  signYouthProspect: () => { ok: boolean; message: string };
  trainSquad: () => { ok: boolean; message: string };
  finishCurrentMatch: (result: MatchResult) => void;
  skipCurrentMatch: () => void;
  exportCareer: () => string;
  importCareer: (data: unknown) => { ok: boolean; message: string };
  dismissNews: (id: string) => void;
}

const tx = (description:string, amount:number, category:FinancialTransaction['category'], day:number):FinancialTransaction => ({id:`tx-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,date:new Date(Date.UTC(2026,7,1+day)).toISOString().slice(0,10),description,amount,category});
const currentClub = (s:GameState) => s.clubs.find(c=>c.id===s.currentClubId)!;
const squad = (s:GameState, clubId:string) => s.players.filter(p=>p.clubId===clubId);
const wageTotal = (s:GameState, clubId:string) => squad(s,clubId).reduce((a,p)=>a+p.wage,0);
const pushNews = (news:GameState['news'],title:string,detail:string,type:GameState['news'][number]['type']='info',day=0) => [{id:`news-${Date.now()}-${Math.random()}`,title,detail,type,day},...news].slice(0,80);
const seeded = (n:number) => { let x=n>>>0; return () => {x=(x*1664525+1013904223)>>>0;return x/4294967296;}; };

function applyTableStats(clubs:Club[],fixtures:GameState['fixtures'],season:string) {
  const stats=new Map(clubs.map(c=>[c.id,{played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,points:0}]));
  for(const f of fixtures) if(f.season===season&&f.played&&f.result) {
    const h=stats.get(f.homeClubId),a=stats.get(f.awayClubId); if(!h||!a)continue;
    h.played++;a.played++;h.goalsFor+=f.result.homeGoals;h.goalsAgainst+=f.result.awayGoals;a.goalsFor+=f.result.awayGoals;a.goalsAgainst+=f.result.homeGoals;
    if(f.result.homeGoals>f.result.awayGoals){h.won++;h.points+=3;a.lost++;} else if(f.result.homeGoals<f.result.awayGoals){a.won++;a.points+=3;h.lost++;} else {h.drawn++;a.drawn++;h.points++;a.points++;}
  }
  return clubs.map(c=>({...c,...stats.get(c.id)!}));
}

export const useGameStore = create<GameStore>()(persist((set,get)=>({
  ...createInitialState(),
  resetGame:()=>set(createInitialState()),
  updateTactics:(changes)=>set(s=>({tactics:{...s.tactics,...changes},news:pushNews(s.news,'Tactical plan updated',`Your tactical preset is now ${changes.formation??s.tactics.formation} / ${changes.style??s.tactics.style}.`,'success',s.day)})),
  makeTransferOffer:(playerId,offerAmount)=>{
    const s=get(); const player=s.players.find(p=>p.id===playerId); const club=currentClub(s);
    if(!player)return {accepted:false,message:'Player not found.'};
    if(player.clubId===club.id)return {accepted:false,message:'This player is already in your squad.'};
    if(squad(s,club.id).length>=30)return {accepted:false,message:'Squad limit reached (30 players).'};
    if(wageTotal(s,club.id)+player.wage>club.wageBudget)return {accepted:false,message:'The requested wage would exceed your weekly wage budget.'};
    const isFree=player.clubId==='free-agent'; const fee=isFree?0:Math.max(0,Math.round(offerAmount));
    if(!isFree&&(fee>club.cash||fee>club.transferBudget))return {accepted:false,message:'Insufficient available cash or transfer budget.'};
    const r=seeded(Date.now()+player.id.length+s.day*93); const seller=s.clubs.find(c=>c.id===player.clubId);
    const minimum=player.value*(seller?0.80+seller.reputation/650:0);
    if(!isFree&&fee<minimum) return {accepted:false,message:'The selling club rejected the offer.',counterOffer:Math.round(player.value*1.04/50_000)*50_000};
    if(!isFree&&seller&&fee<player.value*.94&&r()<.28)return {accepted:false,message:'The club wants a better offer.',counterOffer:Math.round(player.value*1.08/50_000)*50_000};
    set(st=>{
      const clubs=st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash-fee,transferBudget:c.transferBudget-fee}:c.id===player.clubId?{...c,cash:c.cash+fee,transferBudget:c.transferBudget+Math.round(fee*.45)}:c);
      const players=st.players.map(p=>p.id===playerId?{...p,clubId:club.id,contractYears:Math.max(2,p.contractYears),morale:Math.min(100,p.morale+5)}:p);
      const transactions=[...(fee?[tx(`Transfer: ${player.name}`, -fee,'transfer',st.day)]:[]),...st.transactions].slice(0,150);
      return {clubs,players,transactions,news:pushNews(st.news,isFree?'Free transfer completed':'Transfer completed',`${player.name} has joined ${club.name}${fee?` for €${fee.toLocaleString('en-GB')}`:' on a free transfer'}.`,'success',st.day)};
    });
    return {accepted:true,message:`${player.name} has joined the club.`};
  },
  sellPlayer:(playerId)=>{
    const s=get(); const club=currentClub(s); const player=s.players.find(p=>p.id===playerId);
    if(!player||player.clubId!==club.id)return {ok:false,message:'Player not found in your squad.'};
    if(squad(s,club.id).length<=18)return {ok:false,message:'Keep at least 18 players in the first-team squad.'};
    const destination=s.clubs.filter(c=>c.id!==club.id).sort((a,b)=>b.cash-a.cash)[0];
    if(!destination)return {ok:false,message:'No suitable buyer is available.'};
    const fee=Math.round(player.value*.82/50_000)*50_000;
    set(st=>({players:st.players.map(p=>p.id===playerId?{...p,clubId:destination.id}:p),clubs:st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash+fee,transferBudget:c.transferBudget+Math.round(fee*.75)}:c.id===destination.id?{...c,cash:c.cash-fee,transferBudget:Math.max(0,c.transferBudget-fee)}:c),transactions:[tx(`Player sale: ${player.name}`,fee,'transfer',st.day),...st.transactions].slice(0,150),news:pushNews(st.news,'Transfer completed',`${player.name} moved to ${destination.name} for €${fee.toLocaleString('en-GB')}.`,'success',st.day)}));
    return {ok:true,message:`Sold ${player.name} for €${fee.toLocaleString('en-GB')}.`};
  },
  scoutPlayer:(playerId)=>{
    const s=get(); const club=currentClub(s); const p=s.players.find(x=>x.id===playerId);
    if(!p)return {ok:false,message:'Player not found.'};
    if(s.scoutingReports.some(r=>r.playerId===playerId))return {ok:true,message:'You already have a scouting report for this player.'};
    const cost=75_000*Math.max(1,1.15-s.facilities.scouting*.05);
    if(club.cash<cost)return {ok:false,message:'Not enough cash to commission this report.'};
    const accuracy=Math.min(96,55+s.facilities.scouting*7+Math.floor(Math.random()*12));
    const estimate=Math.round(p.potential+(Math.random()-.5)*(100-accuracy)*.35);
    set(st=>({clubs:st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash-cost}:c),scoutingReports:[...st.scoutingReports,{playerId,estimatedPotential:Math.max(p.overall,Math.min(96,estimate)),accuracy,report:accuracy>82?'High-confidence assessment':'Preliminary assessment'}],transactions:[tx(`Scouting report: ${p.name}`,-cost,'other',st.day),...st.transactions].slice(0,150),news:pushNews(st.news,'Scouting report delivered',`A ${accuracy}% confidence report is available for ${p.name}.`,'info',st.day)}));
    return {ok:true,message:`Scouting report delivered (${accuracy}% confidence).`};
  },
  upgradeFacility:(key)=>{
    const s=get(); const club=currentClub(s); const level=s.facilities[key];
    if(level>=5)return {ok:false,message:'This facility is already at maximum level.'};
    const cost=[0,1_500_000,2_750_000,4_500_000,7_000_000,0][level+1];
    if(club.cash<cost)return {ok:false,message:'Not enough available cash for this upgrade.'};
    const names:Record<typeof key,string>={training:'Training ground',academy:'Youth academy',medical:'Medical centre',scouting:'Scouting network',stadium:'Stadium'};
    set(st=>({facilities:{...st.facilities,[key]:level+1},clubs:st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash-cost}:c),transactions:[tx(`${names[key]} upgrade`, -cost,'facility',st.day),...st.transactions].slice(0,150),news:pushNews(st.news,'Facility upgraded',`${names[key]} is now level ${level+1}.`,'success',st.day)}));
    return {ok:true,message:`${names[key]} upgraded to level ${level+1}.`};
  },
  signYouthProspect:()=>{
    const s=get(); const club=currentClub(s); const cost=250_000;
    if(club.cash<cost)return {ok:false,message:'Not enough cash to sign an academy prospect.'};
    const id=`youth-${Date.now()}`; const r=seeded(Date.now()); const youth=createPlayer(id,club.id,s.players.length,club.reputation-15,r,true); youth.wage=Math.max(250,Math.round(youth.wage*.38)); youth.value=Math.round(youth.value*.55);
    set(st=>({players:[...st.players,youth],clubs:st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash-cost}:c),transactions:[tx(`Youth signing: ${youth.name}`,-cost,'academy',st.day),...st.transactions].slice(0,150),news:pushNews(st.news,'New academy prospect',`${youth.name}, ${youth.age}, has joined the academy pathway.`,'success',st.day)}));
    return {ok:true,message:`${youth.name} joined the squad pathway.`};
  },
  trainSquad:()=>{
    const s=get(); const club=currentClub(s); const totalWages=wageTotal(s,club.id); const cost=120_000+s.facilities.training*35_000;
    if(club.cash<cost)return {ok:false,message:'Not enough cash for the training camp.'};
    set(st=>({players:st.players.map(p=>p.clubId===club.id?{...p,fitness:Math.min(100,p.fitness+8+st.facilities.training),morale:Math.min(100,p.morale+2),form:Math.min(2,p.form+1),overall:p.age<25&&p.overall<p.potential&&Math.random()<.08?Math.min(p.potential,p.overall+1):p.overall}:p),clubs:st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash-cost}:c),transactions:[tx('First-team training camp',-cost,'other',st.day),...st.transactions].slice(0,150),news:pushNews(st.news,'Training camp completed',`Fitness and morale improved across the squad. Weekly wages currently total €${Math.round(totalWages).toLocaleString('en-GB')}.`,'success',st.day)}));
    return {ok:true,message:'Training completed. Fitness and morale improved.'};
  },
  finishCurrentMatch:(result)=>{
    const s=get(); const club=currentClub(s); const fixture=s.fixtures.find(f=>f.season===s.season&&f.round===s.currentRound&&!f.played&&(f.homeClubId===club.id||f.awayClubId===club.id));
    if(!fixture)return;
    const roundFixtures=s.fixtures.filter(f=>f.season===s.season&&f.round===s.currentRound&&!f.played);
    let updatedFixtures=[...s.fixtures];
    for(const f of roundFixtures) {
      let res:MatchResult;
      if(f.id===fixture.id)res=result;
      else {
        const home=s.clubs.find(c=>c.id===f.homeClubId)!,away=s.clubs.find(c=>c.id===f.awayClubId)!;
        res=simulateFixture(home,away,s.players,`${s.season}-${f.round}-${f.id}`.split('').reduce((a,c)=>a+c.charCodeAt(0),0));
      }
      updatedFixtures=updatedFixtures.map(x=>x.id===f.id?{...x,played:true,result:res}:x);
    }
    const userResult=result; const isHome=fixture.homeClubId===club.id; const gf=isHome?userResult.homeGoals:userResult.awayGoals; const ga=isHome?userResult.awayGoals:userResult.homeGoals;
    const income=isHome?Math.round(Math.min(club.capacity,club.supporters*.06)*27*(.86+club.reputation/300)):Math.round(250_000+club.reputation*4500);
    const weeklyWages=Math.round(wageTotal(s,club.id)); const sponsor=275_000+Math.round(club.reputation*1700);
    const allTransactions=[tx(isHome?'Home matchday revenue':'Away match participation',income,'matchday',s.day),tx('Weekly sponsor income',sponsor,'sponsor',s.day),tx('Weekly squad wages',-weeklyWages,'wages',s.day),...s.transactions].slice(0,150);
    const seededR=seeded(result.seed+87);
    const updatedPlayers=s.players.map(p=>{
      if(p.clubId!==club.id)return p;
      const scored=result.events.filter(e=>e.type==='goal'&&e.playerId===p.id).length;
      const assisted=result.events.filter(e=>e.type==='goal'&&e.assistId===p.id).length;
      const played=p.injuredWeeks===0;
      const morale=clamp(p.morale+(gf>ga?5:gf===ga?1:-5),15,100);
      const injury=p.injuredWeeks===0&&played&&seededR()<.012?1+Math.floor(seededR()*3):Math.max(0,p.injuredWeeks-(p.injuredWeeks>0?1:0));
      return {...p,appearances:p.appearances+(played?1:0),goals:p.goals+scored,assists:p.assists+assisted,fitness:Math.max(32,p.fitness-(played?9+Math.floor(seededR()*8):0)),morale,form:clamp(p.form+(gf>ga?1:gf===ga?0:-1),-2,2),injuredWeeks:injury};
    });
    const nextRound=s.currentRound+1; let season=s.season; let fixtures=updatedFixtures; let round=nextRound; let day=s.day+7;
    if(nextRound>14) { const parts=season.split('/'); const nextYear=(Number(parts[0])+1).toString(); season=`${nextYear}/${String(Number(nextYear)+1).slice(-2)}`; round=1; const newFix=createRoundRobinFixtures(s.clubs,season); fixtures=[...updatedFixtures,...newFix]; }
    const winning=gf>ga?'Win':gf===ga?'Draw':'Defeat';
    set(st=>({fixtures,players:updatedPlayers,transactions:allTransactions,season,currentRound:round,day,clubs:st.clubs.map(c=>c.id===club.id?{...c,cash:c.cash+income+sponsor-weeklyWages}:c),news:pushNews(st.news,`${winning}: ${isHome?club.shortName+' '+gf+'–'+ga:ga+'–'+gf+' '+club.shortName}`,`${fixture.date} · Matchday revenue, sponsorship and weekly wages have been posted to the ledger.` ,gf>ga?'success':gf===ga?'info':'warning',st.day)}));
  },
  skipCurrentMatch:()=>{
    const s=get(); const club=currentClub(s); const f=s.fixtures.find(x=>x.season===s.season&&x.round===s.currentRound&&!x.played&&(x.homeClubId===club.id||x.awayClubId===club.id));
    if(!f)return;
    const home=s.clubs.find(c=>c.id===f.homeClubId)!,away=s.clubs.find(c=>c.id===f.awayClubId)!;
    const res=simulateFixture(home,away,s.players,Date.now()); get().finishCurrentMatch(res);
  },
  exportCareer:()=>JSON.stringify({saveVersion:get().saveVersion,...get()},null,2),
  importCareer:(data)=>{
    if(!data||typeof data!=='object')return {ok:false,message:'Invalid save file.'};
    const d=data as Partial<GameState>;
    if(d.saveVersion!==1||!Array.isArray(d.clubs)||!Array.isArray(d.players)||!Array.isArray(d.fixtures)||!d.currentClubId)return {ok:false,message:'Unsupported or incomplete save version.'};
    if(!d.clubs.some(c=>c.id===d.currentClubId))return {ok:false,message:'Save references a missing club.'};
    const initial=createInitialState();
    set({...initial,...d,saveVersion:1,news:pushNews(d.news??[],'Career imported','The selected career file has been loaded.','success',d.day??0)});
    return {ok:true,message:'Career imported successfully.'};
  },
  dismissNews:(id)=>set(s=>({news:s.news.filter(n=>n.id!==id)})),
}),{name:'crown-of-football-save-v1',version:1,partialize:(state)=>({saveVersion:state.saveVersion,season:state.season,currentRound:state.currentRound,day:state.day,currentClubId:state.currentClubId,clubs:state.clubs,players:state.players,fixtures:state.fixtures,transactions:state.transactions,news:state.news,tactics:state.tactics,facilities:state.facilities,scoutingReports:state.scoutingReports,lastResult:state.lastResult} as GameState)}));

export const selectUserClub=(s:GameState)=>s.clubs.find(c=>c.id===s.currentClubId)!;
export const selectSquad=(s:GameState)=>s.players.filter(p=>p.clubId===s.currentClubId).sort((a,b)=>b.overall-a.overall);
export const selectCurrentFixture=(s:GameState)=>s.fixtures.find(f=>f.season===s.season&&f.round===s.currentRound&&!f.played&&(f.homeClubId===s.currentClubId||f.awayClubId===s.currentClubId));
export const selectTable=(s:GameState)=>applyTableStats(s.clubs,s.fixtures,s.season).sort((a,b)=>b.points-a.points||((b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst))||b.goalsFor-a.goalsFor);
export const selectCurrentRoundFixtures=(s:GameState)=>s.fixtures.filter(f=>f.season===s.season&&f.round===s.currentRound);
