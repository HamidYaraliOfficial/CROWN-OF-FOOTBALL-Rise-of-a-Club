import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Club, MatchEvent, Player } from '../game/types';

interface Props { home:Club; away:Club; homePlayers:Player[]; awayPlayers:Player[]; progress:number; events:MatchEvent[]; }
interface Actor { group:THREE.Group; playerId:string; teamId:string; base:THREE.Vector3; }
interface SceneState { scene:THREE.Scene; camera:THREE.PerspectiveCamera; renderer:THREE.WebGLRenderer; actors:Actor[]; ball:THREE.Mesh; ballShadow:THREE.Mesh; eventText:THREE.Object3D[]; resize:()=>void; }

function line(scene:THREE.Scene, points:THREE.Vector3[], color=0xdbeae2) {
  const geometry=new THREE.BufferGeometry().setFromPoints(points);
  const obj=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.9})); scene.add(obj); return obj;
}
function buildPlayer(scene:THREE.Scene, player:Player, club:Club, x:number,z:number,teamId:string):Actor {
  const group=new THREE.Group();
  const kit=new THREE.MeshStandardMaterial({color:club.colors[0],roughness:.7,metalness:.03});
  const shorts=new THREE.MeshStandardMaterial({color:club.colors[1],roughness:.8});
  const skin=new THREE.MeshStandardMaterial({color:player.nationality==='Japan'?0xd2a17c:0xc78f68,roughness:.9});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.68,.77,1.75,8),kit); body.position.y=1.45; body.castShadow=true; group.add(body);
  const short=new THREE.Mesh(new THREE.CylinderGeometry(.72,.65,.62,8),shorts);short.position.y=.48;short.castShadow=true;group.add(short);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.39,10,8),skin);head.position.y=2.62;head.castShadow=true;group.add(head);
  const legMat=new THREE.MeshStandardMaterial({color:0x17211d});
  for(const side of [-1,1]) { const leg=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.78,6),legMat);leg.position.set(side*.28,-.15,.02);leg.castShadow=true;group.add(leg); }
  group.position.set(x,0,z); scene.add(group);
  return {group,playerId:player.id,teamId,base:new THREE.Vector3(x,0,z)};
}
function getLineup(players:Player[]) {
  const positions=['GK','RB','CB','CB','LB','DM','CM','AM','RW','LW','ST']; const used=new Set<string>(); const result:Player[]=[];
  for(const pos of positions) { const found=players.filter(p=>p.position===pos&&!used.has(p.id)).sort((a,b)=>b.overall-a.overall)[0] ?? players.filter(p=>!used.has(p.id)).sort((a,b)=>b.overall-a.overall)[0]; if(found){result.push(found);used.add(found.id);} }
  return result;
}
export default function Match3D({home,away,homePlayers,awayPlayers,progress,events}:Props) {
  const canvasRef=useRef<HTMLCanvasElement|null>(null); const stateRef=useRef<SceneState|null>(null); const propsRef=useRef({progress,events,home,away});
  propsRef.current={progress,events,home,away};
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    let state:SceneState|undefined; let animation=0; let disposed=false;
    try {
      const scene=new THREE.Scene(); scene.background=new THREE.Color(0x071712); scene.fog=new THREE.Fog(0x071712,105,210);
      const camera=new THREE.PerspectiveCamera(42,1,.1,260); camera.position.set(0,87,68); camera.lookAt(0,0,0);
      const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8)); renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
      scene.add(new THREE.HemisphereLight(0xc7e6ff,0x17271b,2.0));
      const sun=new THREE.DirectionalLight(0xfff3d1,3.4);sun.position.set(-28,70,35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;scene.add(sun);
      const pitch=new THREE.Mesh(new THREE.PlaneGeometry(105,68),new THREE.MeshStandardMaterial({color:0x226b46,roughness:.92,metalness:0}));pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;scene.add(pitch);
      for(let i=0;i<10;i++){const strip=new THREE.Mesh(new THREE.PlaneGeometry(10.5,68),new THREE.MeshStandardMaterial({color:i%2?0x236d48:0x2a7a50,roughness:1}));strip.rotation.x=-Math.PI/2;strip.position.set(-47.25+i*10.5,.008,0);scene.add(strip);}
      const y=.035; const white=0xf1f7f2;
      line(scene,[new THREE.Vector3(-52.5,y,-34),new THREE.Vector3(52.5,y,-34),new THREE.Vector3(52.5,y,34),new THREE.Vector3(-52.5,y,34),new THREE.Vector3(-52.5,y,-34)] ,white);
      line(scene,[new THREE.Vector3(0,y,-34),new THREE.Vector3(0,y,34)],white);
      const circle=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;circle.push(new THREE.Vector3(Math.cos(a)*9.15,y,Math.sin(a)*9.15));}line(scene,circle,white);
      for(const sign of [-1,1]) {
        const cx=sign*41.5; const box=[new THREE.Vector3(cx,y,-20.15),new THREE.Vector3(sign*52.5,y,-20.15),new THREE.Vector3(sign*52.5,y,20.15),new THREE.Vector3(cx,y,20.15)];line(scene,[...box,box[0]],white);
        const gx=sign*46.5; const six=[new THREE.Vector3(gx,y,-9.16),new THREE.Vector3(sign*52.5,y,-9.16),new THREE.Vector3(sign*52.5,y,9.16),new THREE.Vector3(gx,y,9.16)];line(scene,[...six,six[0]],white);
        const goal=new THREE.Group(); const goalMat=new THREE.MeshStandardMaterial({color:0xe5eee9,roughness:.45,metalness:.25});
        for(const zz of [-3.66,3.66]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2.45,8),goalMat);pole.position.set(sign*53.2,1.22,zz);goal.add(pole);}const bar=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,7.32,8),goalMat);bar.rotation.z=Math.PI/2;bar.position.set(sign*53.2,2.45,0);goal.add(bar);scene.add(goal);
      }
      // Stadium terraces, fascia and compact crowd points.
      const standMat=new THREE.MeshStandardMaterial({color:0x172c26,roughness:.86});
      for(const side of [-1,1]) { const stand=new THREE.Mesh(new THREE.BoxGeometry(118,8,10),standMat);stand.position.set(0,3,side*40);stand.receiveShadow=true;scene.add(stand); const end=new THREE.Mesh(new THREE.BoxGeometry(10,8,90),standMat);end.position.set(side*59,3,0);scene.add(end); }
      const crowdGeo=new THREE.BufferGeometry();const crowdPts:number[]=[];const crowdCols:number[]=[];let randomSeed=8182;
      const rand=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
      for(let i=0;i<1700;i++){const side=i%4;let x=0,z=0,yc=3+rand()*5;if(side===0){x=(rand()-.5)*116;z=35.5+rand()*9;}else if(side===1){x=(rand()-.5)*116;z=-35.5-rand()*9;}else if(side===2){x=53+rand()*10;z=(rand()-.5)*72;}else{x=-53-rand()*10;z=(rand()-.5)*72;}crowdPts.push(x,yc,z);const c=new THREE.Color().setHSL(rand(),.42,.32+rand()*.28);crowdCols.push(c.r,c.g,c.b);}
      crowdGeo.setAttribute('position',new THREE.Float32BufferAttribute(crowdPts,3));crowdGeo.setAttribute('color',new THREE.Float32BufferAttribute(crowdCols,3));const crowd=new THREE.Points(crowdGeo,new THREE.PointsMaterial({size:.48,vertexColors:true,sizeAttenuation:true}));scene.add(crowd);
      // Floodlights.
      const poleMat=new THREE.MeshStandardMaterial({color:0x657b72,metalness:.55,roughness:.45});
      for(const x of [-56,56])for(const z of [-42,42]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.24,.36,27,8),poleMat);p.position.set(x,13.5,z);scene.add(p);const light=new THREE.PointLight(0xd9f5ff,90,78,2);light.position.set(x,27,z);scene.add(light);const lamp=new THREE.Mesh(new THREE.BoxGeometry(3,1.1,1.8),new THREE.MeshStandardMaterial({color:0xe9f6f0,emissive:0xe9f6f0,emissiveIntensity:1.2}));lamp.position.copy(light.position);scene.add(lamp);}
      const homeLineup=getLineup(homePlayers),awayLineup=getLineup(awayPlayers); const actors:Actor[]=[];
      const homeX=[-44,-29,-26,-26,-29,-12,-4,-5,22,21,34];const homeZ=[0,-23,-7,7,23,0,-19,19,-21,21,0];
      homeLineup.forEach((p,i)=>actors.push(buildPlayer(scene,p,home,p.position==='GK'?-47:homeX[i],homeZ[i],home.id)));
      awayLineup.forEach((p,i)=>actors.push(buildPlayer(scene,p,away,p.position==='GK'?47:-homeX[i],-homeZ[i],away.id)));
      const ball=new THREE.Mesh(new THREE.SphereGeometry(.66,14,10),new THREE.MeshStandardMaterial({color:0xf4f4ec,roughness:.4,metalness:.04}));ball.position.set(0,.75,0);ball.castShadow=true;scene.add(ball);
      const ballShadow=new THREE.Mesh(new THREE.CircleGeometry(.78,16),new THREE.MeshBasicMaterial({color:0x07120d,transparent:true,opacity:.35,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;ballShadow.position.set(0,.025,0);scene.add(ballShadow);
      const resize=()=>{if(!canvas.isConnected)return;const rect=canvas.getBoundingClientRect();const w=Math.max(300,rect.width),h=Math.max(250,rect.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
      state={scene,camera,renderer,actors,ball,ballShadow,eventText:[],resize};stateRef.current=state;resize();
      const clock=new THREE.Clock();
      const animate=()=>{if(disposed)return;animation=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);const current=propsRef.current;const now=current.progress;const evs=current.events.filter(e=>e.minute<=now);const event=evs[evs.length-1];
        if(event){const bx=THREE.MathUtils.clamp(event.x*47,-50,50),bz=THREE.MathUtils.clamp(event.z*28,-31,31);ball.position.x=THREE.MathUtils.damp(ball.position.x,bx,3.1,dt);ball.position.z=THREE.MathUtils.damp(ball.position.z,bz,3.1,dt);ball.position.y=.7+Math.abs(Math.sin(clock.elapsedTime*5))*.08;ballShadow.position.x=ball.position.x;ballShadow.position.z=ball.position.z;}
        else {const t=clock.elapsedTime;ball.position.x=Math.sin(t*.38)*7;ball.position.z=Math.cos(t*.5)*5;ballShadow.position.x=ball.position.x;ballShadow.position.z=ball.position.z;}
        state!.actors.forEach((a,i)=>{let tx=a.base.x,tz=a.base.z;if(event&&a.playerId===event.playerId){tx=THREE.MathUtils.clamp(event.x*47,-48,48);tz=THREE.MathUtils.clamp(event.z*28,-30,30);}else if(event&&a.teamId===event.teamId){tx+=event.targetX*3;tz+=event.targetZ*2;}a.group.position.x=THREE.MathUtils.damp(a.group.position.x,tx,1.7,dt);a.group.position.z=THREE.MathUtils.damp(a.group.position.z,tz,1.7,dt);a.group.position.y=Math.abs(Math.sin(clock.elapsedTime*4+i))*.045;});
        renderer.render(scene,camera);
      };animate();
      const ro=new ResizeObserver(()=>state?.resize());ro.observe(canvas);return()=>{disposed=true;cancelAnimationFrame(animation);ro.disconnect();renderer.dispose();scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const mat=obj.material;if(Array.isArray(mat))mat.forEach(m=>m.dispose());else mat.dispose();}else if(obj instanceof THREE.Line){obj.geometry.dispose();(obj.material as THREE.Material).dispose();}});stateRef.current=null;};
    } catch (e) { console.error('3D match scene initialization failed',e); return; }
  },[home.id,away.id,homePlayers,awayPlayers]);
  return <div className="match-render-wrap"><canvas ref={canvasRef} className="match-canvas" aria-label="Three-dimensional football match visualization"/><div className="stadium-vignette"/><div className="match-canvas-label"><span className="live-dot"/> 3D MATCH ENGINE <span>·</span> <strong>{Math.min(90,Math.floor(progress))}'</strong></div><div className="match-canvas-hint">SIMULATED MATCH · LIVE EVENT VISUALIZATION</div></div>;
}
