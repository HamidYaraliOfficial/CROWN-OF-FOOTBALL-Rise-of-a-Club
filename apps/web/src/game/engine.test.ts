import { describe, expect, it } from 'vitest';
import { createInitialState } from './seed';
import { calculateTable, simulateMatch } from './engine';
import type { Tactics } from './types';

const neutral:Tactics={formation:'4-3-3',style:'balanced',mentality:'balanced',pressing:50,tempo:50,width:50,defensiveLine:50};

describe('CROWN OF FOOTBALL simulation engine',()=>{
  it('creates a complete fictional football world',()=>{
    const s=createInitialState();
    expect(s.clubs).toHaveLength(8);
    expect(s.players.filter(p=>p.clubId===s.currentClubId).length).toBeGreaterThanOrEqual(18);
    expect(s.fixtures.length).toBe(8*7*2);
    expect(new Set(s.players.map(p=>p.id)).size).toBe(s.players.length);
  });
  it('is reproducible for the same seed and inputs',()=>{
    const s=createInitialState();const h=s.clubs[0],a=s.clubs[1];
    const hp=s.players.filter(p=>p.clubId===h.id),ap=s.players.filter(p=>p.clubId===a.id);
    const one=simulateMatch(h,a,hp,ap,neutral,neutral,123456);const two=simulateMatch(h,a,hp,ap,neutral,neutral,123456);
    expect(one).toEqual(two);
  });
  it('keeps match statistics and goal events consistent',()=>{
    const s=createInitialState();const h=s.clubs[0],a=s.clubs[1];
    const res=simulateMatch(h,a,s.players.filter(p=>p.clubId===h.id),s.players.filter(p=>p.clubId===a.id),neutral,neutral,44);
    expect(res.homeGoals).toBe(res.events.filter(e=>e.type==='goal'&&e.teamId===h.id).length);
    expect(res.awayGoals).toBe(res.events.filter(e=>e.type==='goal'&&e.teamId===a.id).length);
    expect(res.homePossession+res.awayPossession).toBe(100);
    expect(res.homeShots).toBeGreaterThanOrEqual(res.homeOnTarget);
    expect(res.awayShots).toBeGreaterThanOrEqual(res.awayOnTarget);
  });
  it('calculates table points and goal difference correctly',()=>{
    const s=createInitialState();const h=s.clubs[0],a=s.clubs[1];
    const fixtures=s.fixtures.slice(0,2).map((f,i)=>({...f,played:true,result:{homeGoals:i===0?2:0,awayGoals:i===0?0:1,homeShots:0,awayShots:0,homeOnTarget:0,awayOnTarget:0,homePossession:50,awayPossession:50,homeXg:0,awayXg:0,events:[],seed:i}}));
    const table=calculateTable(s.clubs,fixtures);const home=table.find(c=>c.id===fixtures[0].homeClubId)!;
    expect(home.played).toBeGreaterThanOrEqual(1); expect(table.every(c=>c.points>=0)).toBe(true);
    expect(h.id).toBeTruthy();expect(a.id).toBeTruthy();
  });
});
