import type { Club, Fixture, GameState, Player, Position } from './types';

const positions: Position[] = ['GK','RB','CB','CB','LB','DM','CM','CM','AM','RW','LW','ST','ST','CM','CB','RB','LW','DM','GK','AM','RW','LB','ST'];
const firstNames = ['Alex','Mateo','Noah','Luca','Elias','Theo','Milan','Oscar','Rafael','Ibrahim','Leo','Adrian','Nico','Jonas','Daniel','Sami','Anton','Gabriel','Erik','Dario','Kai','Victor','Yusuf','Marek','Hugo','Mika','Tomas','Amir','Felix','Ruben','Arman','Kian','David','Robin','Emil','Ayan','Milo','Andre','Samir','Nils'];
const lastNames = ['Moretti','Berg','Silva','Petrov','Novak','Costa','Keller','Ibrahim','Santos','Lind','Marin','Vega','Kovac','Fischer','Rossi','Yilmaz','Klein','Pereira','Sato','Muller','Haddad','Romano','Nordin','Walsh','Duarte','Bianchi','Karimi','Aoki','Mensah','Bauer','Duran','Larsen','Hansen','Varga','Meyer','Ortega','Iversen','Nowak','Alves','Schmidt'];
const countries = ['Germany','Portugal','Italy','Spain','Netherlands','France','Croatia','Japan','Morocco','Argentina','Denmark','Brazil','Sweden','Türkiye','Austria','Iran'];
export const money = (n:number, locale='en') => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : locale === 'zh' ? 'zh-CN' : 'en-GB', { style:'currency', currency:'EUR', maximumFractionDigits: n >= 1_000_000 ? 1 : 0, notation: n >= 1_000_000 ? 'compact' : 'standard' }).format(n);
export const compact = (n:number) => n >= 1_000_000 ? `€${(n/1_000_000).toFixed(1)}m` : n >= 1_000 ? `€${Math.round(n/1000)}k` : `€${n}`;

const clubSpecs = [
  {id:'crown',name:'Crown Athletic',shortName:'CRN',city:'Crownford',colors:['#d7b46a','#102b22'] as [string,string],reputation:73,cash:42_000_000,transferBudget:27_500_000,wageBudget:430_000,stadium:'Crown Park',capacity:41200,supporters:360000},
  {id:'northstar',name:'Northstar FC',shortName:'NSF',city:'Northhaven',colors:['#63a9ff','#10203e'] as [string,string],reputation:78,cash:51_000_000,transferBudget:31_000_000,wageBudget:490_000,stadium:'Polar Arena',capacity:50800,supporters:480000},
  {id:'royal',name:'Royal Meridian',shortName:'RMD',city:'Meridian',colors:['#ee6b83','#301521'] as [string,string],reputation:82,cash:70_000_000,transferBudget:45_000_000,wageBudget:640_000,stadium:'Meridian Bowl',capacity:62400,supporters:690000},
  {id:'harbor',name:'Harbor City',shortName:'HBC',city:'Harbor City',colors:['#60d7ca','#12363b'] as [string,string],reputation:69,cash:29_000_000,transferBudget:18_000_000,wageBudget:350_000,stadium:'Docklands Ground',capacity:33100,supporters:290000},
  {id:'atlas',name:'Atlas Rovers',shortName:'ATR',city:'Atlas',colors:['#f2a84b','#342313'] as [string,string],reputation:71,cash:32_000_000,transferBudget:21_000_000,wageBudget:380_000,stadium:'Summit Stadium',capacity:38500,supporters:320000},
  {id:'bluepeak',name:'Bluepeak United',shortName:'BPU',city:'Bluepeak',colors:['#a4a9ff','#22224b'] as [string,string],reputation:66,cash:24_000_000,transferBudget:14_000_000,wageBudget:290_000,stadium:'Peak Field',capacity:27800,supporters:210000},
  {id:'forge',name:'Ironforge FC',shortName:'IRF',city:'Ironforge',colors:['#c1cad4','#292e34'] as [string,string],reputation:64,cash:20_000_000,transferBudget:12_000_000,wageBudget:260_000,stadium:'Foundry Park',capacity:24100,supporters:180000},
  {id:'solaris',name:'Solaris Athletic',shortName:'SOL',city:'Solaris',colors:['#ffcf52','#3c3010'] as [string,string],reputation:68,cash:26_000_000,transferBudget:16_000_000,wageBudget:320_000,stadium:'Sunrise Arena',capacity:30600,supporters:245000},
] as const;

function hashRand(seed:number) { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
function playerOverall(position:Position, r:()=>number, clubRating:number) { return Math.max(51,Math.min(91,Math.round(54 + r()*23 + (clubRating-65)*0.42))); }
export function createPlayer(id:string, clubId:string, index:number, clubRating:number, r:()=>number, youth=false):Player {
  const position = youth ? positions[Math.floor(r()*positions.length)] : positions[index % positions.length];
  const age = youth ? 16 + Math.floor(r()*3) : 18 + Math.floor(r()*16);
  const overall = youth ? 48 + Math.floor(r()*17) : playerOverall(position,r,clubRating);
  const potential = Math.max(overall,Math.min(94,overall + Math.floor(r()*(youth?34:20))));
  const value = Math.round(Math.max(100_000, overall*overall*(age < 24 ? 1800 : age > 31 ? 600 : 1300) * (potential>overall+14?1.28:1)) / 50_000)*50_000;
  return {
    id, name:`${firstNames[Math.floor(r()*firstNames.length)]} ${lastNames[Math.floor(r()*lastNames.length)]}`, age,
    nationality:countries[Math.floor(r()*countries.length)], position, clubId, overall, potential,
    pace:Math.min(99,Math.round(overall*(0.78+r()*0.36))), shooting:Math.min(99,Math.round(overall*(0.72+r()*0.42))),
    passing:Math.min(99,Math.round(overall*(0.77+r()*0.36))), defending:Math.min(99,Math.round(overall*(0.68+r()*0.42))),
    physical:Math.min(99,Math.round(overall*(0.8+r()*0.32))), goalkeeping:position==='GK'?Math.min(99,overall+Math.round(r()*7)):20+Math.round(r()*35),
    value, wage:Math.round((overall*overall*(age>30?0.62:0.78))/50)*50, contractYears:1+Math.floor(r()*5),
    fitness:76+Math.floor(r()*25), morale:62+Math.floor(r()*36), form:Math.floor(r()*5)-2, injuredWeeks:0, appearances:0, goals:0, assists:0, isYouth:youth,
  };
}
export function createRoundRobinFixtures(clubs:Club[], season='2026/27'):Fixture[] {
  const list = clubs.map(c=>c.id); if(list.length%2) list.push('BYE');
  const n=list.length, rounds=n-1, half=n/2; const fixtures:Fixture[]=[]; let ring=[...list];
  for(let r=0;r<rounds*2;r++) {
    const roundNo=r+1; const firstLeg=r<rounds; const weekIndex=firstLeg?r:r-rounds;
    for(let i=0;i<half;i++) {
      let home=ring[i], away=ring[n-1-i]; if(home==='BYE'||away==='BYE') continue;
      if((weekIndex+i)%2===1) [home,away]=[away,home];
      if(!firstLeg) [home,away]=[away,home];
      const startYear=Number(season.slice(0,4))||2026; const date=new Date(Date.UTC(startYear,7,15+weekIndex*7));
      fixtures.push({id:`fx-${roundNo}-${home}-${away}`,season,round:roundNo,date:date.toISOString().slice(0,10),homeClubId:home,awayClubId:away,played:false});
    }
    const fixed=ring[0], tail=ring.slice(1); tail.unshift(tail.pop()!); ring=[fixed,...tail];
  }
  return fixtures;
}
export function createInitialState():GameState {
  const r=hashRand(20261029); const clubs:Club[]=clubSpecs.map(c=>({...c,played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,points:0}));
  const players:Player[]=[];
  for(const club of clubs) {
    const count=club.id==='crown'?23:20;
    for(let i=0;i<count;i++) players.push(createPlayer(`p-${club.id}-${String(i+1).padStart(2,'0')}`,club.id,i,club.reputation,r));
  }
  for(let i=0;i<24;i++) players.push(createPlayer(`fa-${i+1}`,'free-agent',i,63,r));
  const fixtures=createRoundRobinFixtures(clubs);
  return {
    saveVersion:1,season:'2026/27',currentRound:1,day:0,currentClubId:'crown',clubs,players,fixtures,
    transactions:[{id:'tx-opening',date:'2026-08-01',description:'Opening transfer budget',amount:0,category:'other'}],
    news:[
      {id:'n1',title:'A new era at Crown Park',detail:'The board has set a top-half finish as its minimum season objective.',day:0,type:'success'},
      {id:'n2',title:'Summer window is open',detail:'Scouts have identified promising players across the fictional football world.',day:0,type:'info'},
      {id:'n3',title:'Facilities review',detail:'Training and medical facilities are ready for your first investment decisions.',day:0,type:'info'},
    ],
    tactics:{formation:'4-3-3',style:'balanced',mentality:'balanced',pressing:58,tempo:55,width:58,defensiveLine:52},
    facilities:{training:2,academy:2,medical:2,scouting:1,stadium:2},scoutingReports:[],
  };
}
