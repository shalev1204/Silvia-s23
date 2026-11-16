// S15 labyrinth: safe-reachability over (square x turn) to place optional finds. Run: node scratch/verifications/s15_finds_solver.js
const src = require('fs').readFileSync(__dirname + '/../../web/hub/js/stations/s15-sandstone-labyrinth.js', 'utf8');
const LEVEL = eval('(' + src.match(/const LEVEL = (\{[\s\S]*?\n      \});/)[1] + ')');
const REACH = 2, C = LEVEL.cols, R = LEVEL.rows;
const DIRS = [[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]];
const wb = (x,y) => parseInt(LEVEL.walls[y][x],16);
const key = (x,y) => y*C+x;
const g = (r,t) => r[t % r.length];
const gcd=(a,b)=>b?gcd(b,a%b):a; const P = LEVEL.guards.reduce((a,r)=>a*r.length/gcd(a,r.length),1);
function lit(t){const s=new Set();LEVEL.guards.forEach(r=>{const[x,y]=g(r,t),[nx,ny]=g(r,t+1);s.add(key(x,y));const d=DIRS.find(d=>d[1]===nx-x&&d[2]===ny-y);if(!d)return;let cx=x,cy=y;for(let i=0;i<REACH&&!(wb(cx,cy)&d[0]);i++){cx+=d[1];cy+=d[2];s.add(key(cx,cy));}});return s;}
const LIT = Array.from({length:P},(_,t)=>lit(t));
function bfs(sx,sy,t0){ // returns dist map key*P+t -> moves
  const dist=new Map(), q=[[sx,sy,t0%P,0]]; dist.set(key(sx,sy)*P+t0%P,0);
  while(q.length){const[x,y,t,d]=q.shift();
    const opts=[[0,0]].concat(DIRS.filter(dd=>!(wb(x,y)&dd[0])).map(dd=>[dd[1],dd[2]]));
    for(const[dx,dy]of opts){const nx=x+dx,ny=y+dy,k=key(nx,ny);
      if(LIT[t].has(k))continue; const nt=(t+1)%P; if(LIT[nt].has(k))continue;
      const id=k*P+nt; if(dist.has(id))continue; dist.set(id,d+1); q.push([nx,ny,nt,d+1]);}}
  return dist;}
const minTo=(dist,x,y)=>{let m=Infinity,tt=-1;for(let t=0;t<P;t++){const v=dist.get(key(x,y)*P+t);if(v!==undefined&&v<m){m=v;tt=t;}}return [m,tt];};
const d0=bfs(LEVEL.start[0],LEVEL.start[1],0);
const [ex,ey]=LEVEL.exit; console.log('PERIOD',P,'start->exit',minTo(d0,ex,ey));
const deg=(x,y)=>DIRS.filter(d=>!(wb(x,y)&d[0])).length;
const out=[];
for(let y=0;y<R;y++)for(let x=0;x<C;x++){
  const [m,t]=minTo(d0,x,y); if(m===Infinity)continue;
  const d1=bfs(x,y,t); const [back]=minTo(d1,ex,ey);
  const lt=LIT.some(s=>s.has(key(x,y)));
  if(deg(x,y)===1) out.push({x,y,toFind:m,findToExit:back,total:m+back,patrolled:lt});
}
out.sort((a,b)=>a.total-b.total); console.log(JSON.stringify(out));
const arg=process.argv.slice(2).map(Number); if(arg.length){ // chain check: start -> f1 -> f2 ... -> exit
  let x=LEVEL.start[0],y=LEVEL.start[1],t=0,tot=0; for(let i=0;i<arg.length;i+=2){const d=bfs(x,y,t);const[m,tt]=minTo(d,arg[i],arg[i+1]);tot+=m;x=arg[i];y=arg[i+1];t=tt;console.log('->',x,y,m);} const[m]=minTo(bfs(x,y,t),ex,ey);console.log('-> exit',m,'total',tot+m);}
