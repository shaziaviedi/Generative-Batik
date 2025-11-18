/* =============================================================
   GLOBALS
   ============================================================= */
   let patternType   = 1;
   let animFrame     = 0;
   let recording     = false;
   let gif;
   const TOTAL_FRAMES    = 400;
   const ANIMATE_PORTION = 0.8;
   let canvasElement;
   
   /* =============================================================
      SETUP
      ============================================================= */
   function setup() {
     pixelDensity(1);
     const cnv = createCanvas(800, 800);
     frameRate(60);
     canvasElement = cnv.elt;
   }
   
   /* =============================================================
      DRAW LOOP
      ============================================================= */
   function draw() {
     background(255);
   
     let rawT = animFrame / (TOTAL_FRAMES - 1);
     let t    = rawT < ANIMATE_PORTION ? rawT / ANIMATE_PORTION : 1;
   
     if (patternType === 1) {
       // PARANG → 4×4 bleed grid
       const cols = 4, rows = 4;
       const cellW = width  / cols;
       const cellH = height / rows;
       push();
         for (let i = -1; i <= cols; i++) {
           for (let j = -1; j <= rows; j++) {
             push();
               translate(i * cellW, j * cellH);
               drawParangKinetic(cellW, cellH, t);
             pop();
           }
         }
       pop();
   
     } else if (patternType === 2) {
       // SIDOLUHUR → 4×4 grid
       const cols = 4, rows = 4;
       const cellW = width  / cols;
       const cellH = height / rows;
       for (let i = 0; i < cols; i++) {
         for (let j = 0; j < rows; j++) {
           push();
             translate(i * cellW, j * cellH);
             drawSidoluhurKinetic(cellW, cellH, t);
           pop();
         }
       }
   
     } else if (patternType === 3) {
       // KAWUNG → 5×5 grid
       const cols = 5, rows = 5;
       const cellW = width  / cols;
       const cellH = height / rows;
       for (let i = 0; i < cols; i++) {
         for (let j = 0; j < rows; j++) {
           push();
             translate(i * cellW, j * cellH);
             drawKawungKinetic(cellW, cellH, t);
           pop();
         }
       }
     }
   
     // RECORDING
     if (recording) {
       if (animFrame > 0) gif.addFrame(canvasElement, { copy: true, delay: 1000/60 });
       if (animFrame === TOTAL_FRAMES - 1) {
         recording = false;
         gif.on('finished', blob => {
           const url = URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `pattern${patternType}.gif`;
           document.body.appendChild(a);
           a.click();
           a.remove();
           URL.revokeObjectURL(url);
         });
         gif.render();
       }
     }
   
     // advance frame (hold last Kawung frame slightly longer)
     if (patternType === 3 && rawT >= 1) {
      // slow down: only advance every 10 draw frames
       if (frameCount % 15 === 0) animFrame = (animFrame + 1) % TOTAL_FRAMES;
     } else {
       animFrame = (animFrame + 1) % TOTAL_FRAMES;
     }
   }
   
   /* =============================================================
      KEY HANDLER
      ============================================================= */
   function keyPressed() {
     if (['1','2','3'].includes(key)) {
       patternType = int(key);
       animFrame   = 0;
     }
     if ((key === 'r' || key === 'R') && !recording) {
       animFrame = 0;
       gif = new GIF({ workers:1, quality:20, workerScript:'libraries/gif.worker.js' });
       gif.addFrame(canvasElement, { copy:true, delay:1000/60 });
       recording = true;
     }
   }
   
/* =============================================================
   1. PARANG → KINETIC BANDS + ONE-CONTINUOUS BORDER + DIAMONDS
   ============================================================= */
   function drawParangKinetic(cellW, cellH, t) {
    // 1) fill cell
    noStroke();
    fill(230, 204, 154);
    rect(0, 0, cellW, cellH);
  
    // 2) compute diagonal & stripe metrics
    const rows         = 3;
    const diag         = sqrt(cellW*cellW + cellH*cellH);
    const stripeW      = diag / rows;
    const bleed        = stripeW * 1.1;
    const margin       = bleed;
    const totalStripes = rows + 2;       // 5 stripes
  
    push();
      // centre & rotate into diagonal
      translate(cellW/2, cellH/2);
      rotate(-PI/4);
      translate(-diag/2 - margin/2, -diag/2 - margin/2);
  
      // 3) one continuous border line
      const barDur   = 0.2;
      const pBorder  = constrain(t / barDur, 0, 1);
      const eBorder  = easeOutCubic(pBorder);
      const borderW  = stripeW * 0.4;
      const yBar     = stripeW + stripeW * 0.3;
      stroke(50);
      strokeWeight(borderW);
      noFill();
      line(0, yBar, (diag + margin) * eBorder, yBar);
  
      // 4) draw each stripe exactly as before, one by one
      for (let j = 0; j < totalStripes; j++) {
        let i     = j - 1;
        let start = j / totalStripes;
        let end   = (j + 1) / totalStripes;
        let u     = constrain((t - start) / (end - start), 0, 1);
        push();
          translate(i * stripeW, 0);
          drawParangStripeAnimated(bleed, bleed, u);
        pop();
      }
  
      // 5) popping diamonds, animated one by one, full count
      const lightCol = color(222, 185, 105);
      const darkCol  = color(60, 30, 0);
      const dW       = stripeW * 0.25;
      const dH       = stripeW * 0.5;
      const spacing  = stripeW * 0.6;
      const count    = floor((diag + margin) / spacing) + 1;
      const diaStart = 0.7;
      const diaDur   = 0.3;
  
      for (let k = 0; k < count; k++) {
        let u = constrain((t - (diaStart + k * (diaDur/count))) / (diaDur/count), 0, 1);
        if (u <= 0) continue;
        let s = easeOutCubic(u);
        let x = k * spacing;
        push();
          translate(x, yBar);
          rotate(HALF_PI);
          scale(s);
          noStroke();
          fill(lightCol);
          beginShape();
            vertex(0,     -dH/2);
            vertex(dW/2,   0);
            vertex(0,      dH/2);
            vertex(-dW/2,  0);
          endShape(CLOSE);
          for (let n = 1; n <= 4; n++) {
            let sc = 1 - n/5;
            fill((n % 2) ? darkCol : lightCol);
            beginShape();
              vertex(0,           -dH*sc/2);
              vertex(dW*sc/2,     0);
              vertex(0,            dH*sc/2);
              vertex(-dW*sc/2,    0);
            endShape(CLOSE);
          }
        pop();
      }
  
    pop();
  }
  
  /* helper: draw one stripe “S” and fade in its fill */
  function drawParangStripeAnimated(w, h, t) {
    const cp = {
      c1x1:0.18, c1y1:0.82, c2x1:0.32, c2y1:0.38, end1x:0.12, end1y:0.18,
      c1x2:0.02, c1y2:0.02, c2x2:0.40, c2y2:0.02, end2x:0.52, end2y:0.30,
      c1x3:0.62, c1y3:0.52, c2x3:0.72, c2y3:0.78, end3x:1.00, end3y:0.90
    };
    const N = 100;
    let pts = [];
    for (let i = 0; i <= N; i++) {
      let u = i/N, x, y;
      if (u < 1/3) {
        let v = u*3;
        x = bezierPoint(0, cp.c1x1*w, cp.c2x1*w, cp.end1x*w, v);
        y = bezierPoint(h*0.9, cp.c1y1*h, cp.c2y1*h, cp.end1y*h, v);
      } else if (u < 2/3) {
        let v = (u - 1/3)*3;
        x = bezierPoint(cp.end1x*w, cp.c1x2*w, cp.c2x2*w, cp.end2x*w, v);
        y = bezierPoint(cp.end1y*h, cp.c1y2*h, cp.c2y2*h, cp.end2y*h, v);
      } else {
        let v = (u - 2/3)*3;
        x = bezierPoint(cp.end2x*w, cp.c1x3*w, cp.c2x3*w, cp.end3x*w, v);
        y = bezierPoint(cp.end2y*h, cp.c1y3*h, cp.c2y3*h, cp.end3y*h, v);
      }
      pts.push({ x, y });
    }
  
    // stroke‐draw progression
    let count = floor(t * N);
    noFill();
    stroke(60, 30, 0);
    strokeWeight(2);
    beginShape();
      for (let i = 0; i <= count; i++) vertex(pts[i].x, pts[i].y);
    endShape();
  
    // once complete, fade in fill + tear‐drop
    if (t >= 1) {
      let fT    = constrain((t - 1 + 0.2)/0.2, 0, 1);
      let alpha = map(easeOutCubic(fT), 0, 1, 0, 255);
      noStroke();
      fill(222, 185, 105, alpha);
      beginShape();
        for (let p of pts) vertex(p.x, p.y);
        vertex(w, h);
        vertex(0, h);
      endShape(CLOSE);
  
      let p1 = pts[floor(N/3)], p2 = pts[floor(2*N/3)];
      drawTeardrop((p1.x+p2.x)/2 + w*0.5, (p1.y+p2.y)/2, w*0.25);
    }
  }
  
  /* helper: tear-drop detail */
  function drawTeardrop(cx, cy, r) {
    push();
      const offset = r * 0.2;
      translate(cx - offset, cy);
      rotate(4*PI/3 + radians(10));
      noStroke();
      fill(222, 185, 105);
      beginShape();
        vertex(0, -r);
        bezierVertex( r*0.8, -r*0.2,  r*0.6,  r*0.8,  0, r*0.8);
        bezierVertex(-r*0.6,  r*0.8, -r*0.8, -r*0.2,  0, -r);
      endShape(CLOSE);
      noFill();
      stroke(60, 30, 0);
      strokeWeight(2);
      beginShape();
        vertex(0, -r);
        bezierVertex( r*0.8, -r*0.2,  r*0.6,  r*0.8,  0, r*0.8);
        bezierVertex(-r*0.6,  r*0.8, -r*0.8, -r*0.2,  0, -r);
      endShape(CLOSE);
    pop();
  }
  
  /* helper: cubic ease-out */
  function easeOutCubic(x) {
    return 1 - pow(1 - x, 3);
  }
   
/* =============================================================
   2. SIDOLUHUR → KINETIC DIAMOND, VINES, LEAVES & DOT CLUSTERS
   ============================================================= */
   function drawSidoluhurKinetic(cellW, cellH, t) {
    noStroke();
    fill(247,254,254);
    rect(0,0,cellW,cellH);
  
    const strokeW = 19, wob=4, wc=3, ws=0.02;
    stroke(88,46,60);
    strokeWeight(strokeW);
    drawWavyDiamond(cellW,cellH,t,wob,wc,ws);
  
    let dotT = constrain((t-0.4)/0.2,0,1);
    let sDot = dotT<0.5 ? 2*dotT*dotT : 1 - pow(-2*dotT+2,2)/2;
    if (sDot>0) {
      noStroke();
      fill(247,254,254);
      const dR=cellW*0.02, off=cellW*0.035;
      const midPts=[{x:cellW/2,y:0},{x:cellW,y:cellH/2},{x:cellW/2,y:cellH},{x:0,y:cellH/2}];
      const offs=[{x:0,y:-off},{x:off,y:0},{x:0,y:off},{x:-off,y:0}];
      for (let p of midPts){
        push(); translate(p.x,p.y);
        for (let o of offs){
          push(); translate(o.x,o.y);
            scale(sDot);
            circle(0,0,dR*2);
          pop();
        }
        pop();
      }
    }
  
    const inset=strokeW/2+4, maxL=cellW*0.30, midF=0.6, sideF=0.5, sCurv=PI/8, steps=20;
    let vT = constrain((t-0.2)/0.6,0,1),
        rL = constrain((t-0.65)/0.35,0,1),
        lT = rL<0.5 ? 4*rL*rL*rL : 1-pow(-2*rL+2,3)/2;
    const corners=[
      {x:cellW/2,y:inset},{x:cellW-inset,y:cellH/2},
      {x:cellW/2,y:cellH-inset},{x:inset,y:cellH/2}
    ];
    const center={x:cellW/2,y:cellH/2};
    stroke(28,37,61); strokeWeight(2);
    for (let c of corners){
      let bA=atan2(center.y-c.y,center.x-c.x);
      for (let dir of [-1,0,1]){
        let L=maxL*(dir===0?midF:sideF), bend=dir===0?0:sCurv;
        let prev=null;
        for (let i=0;i<=steps*vT;i++){
          let u=i/steps, r=L*u, a=bA+dir*bend*u;
          let x=c.x+cos(a)*r, y=c.y+sin(a)*r;
          if(prev) line(prev.x,prev.y,x,y);
          prev={x,y};
        }
        if(lT>0){
          let tA=bA+dir*bend,
              tX=c.x+cos(tA)*L,
              tY=c.y+sin(tA)*L;
          drawGrowingLeaf(tX,tY,tA,cellW*0.06,cellW*0.12,lT);
        }
      }
    }
  
    drawTemple(cellW/2,cellH/2, constrain((t-0.5)*2,0,1));
  
    if (sDot>0){
      noStroke();
      fill(59,64,96);
      const dR=cellW*0.02, off=cellW*0.035;
      push(); translate(cellW/2,cellH/2);
        for (let o of [{x:0,y:-off},{x:off,y:0},{x:0,y:off},{x:-off,y:0}]){
          push(); translate(o.x,o.y);
            scale(sDot);
            circle(0,0,dR*2);
          pop();
        }
      pop();
    }
  }
  
  // helpers for SIDOLUHUR
  function drawWavyDiamond(w,h,t,amp,count,speed){
    const C=[{x:w/2,y:0},{x:w,y:h/2},{x:w/2,y:h},{x:0,y:h/2},{x:w/2,y:0}];
    const segs=80, pts=[];
    for(let i=0;i<4;i++){
      let A=C[i],B=C[i+1];
      for(let j=0;j<=segs;j++){
        let u=j/segs;
        let x=lerp(A.x,B.x,u), y=lerp(A.y,B.y,u);
        let dx=B.y-A.y, dy=-(B.x-A.x);
        let L=sqrt(dx*dx+dy*dy); dx/=L; dy/=L;
        let phase=speed*frameCount+i*PI/2+u*TWO_PI*count;
        let wob=sin(phase)*amp;
        pts.push({x:x+dx*wob, y:y+dy*wob});
      }
    }
    let N=t<1?floor(pts.length*t):pts.length;
    stroke(88,46,60);
    strokeWeight(19);
    for(let i=0;i<N-1;i++){
      line(pts[i].x,pts[i].y,pts[i+1].x,pts[i+1].y);
    }
  }
  
  function drawGrowingLeaf(x,y,ang,halfW,len,prog){
    push(); translate(x,y); rotate(ang+HALF_PI);
    let w=halfW*prog, h=len*prog;
    noStroke(); fill(59,64,96);
    beginShape();
      vertex(0,0);
      bezierVertex(w*0.8,-h*0.3, w*0.5,-h*0.8, 0,-h);
      bezierVertex(-w*0.5,-h*0.8, -w*0.8,-h*0.3, 0,0);
    endShape(CLOSE);
    pop();
  }
  
  function drawTemple(cx,cy,prog){
    let u=easeOutCubic(prog);
    if(u<=0) return;
    const pc=6,mL=25,mW=12;
    noStroke(); fill(4,5,13);
    push(); translate(cx,cy);
      for(let i=0;i<pc;i++){
        push(); rotate(TWO_PI*i/pc);
          beginShape();
            vertex(0,0);
            bezierVertex(mW*u,-mL*0.3*u, mW*0.5*u,-mL*0.8*u, 0,-mL*u);
            bezierVertex(-mW*0.5*u,-mL*0.8*u, -mW*u,-mL*0.3*u, 0,0);
          endShape(CLOSE);
        pop();
      }
    pop();
  }
   

/* =============================================================
   3. KAWUNG → KINETIC PETALS & DOTS
   ============================================================= */
function drawKawungKinetic(cellW, cellH, t) {
  const bg    = color(60,26,8),
        petal = color(158,84,28),
        dotC  = color(240,235,220);

  const spacingFactor    = 0.355,
        outlineThickness = 5,
        ovalW            = cellW * 0.6,
        ovalH            = cellH * 0.35,
        holeR            = cellW * 0.03;

  noStroke(); fill(bg);
  rect(0,0,cellW,cellH);

  // raw animation progress [0…1]
  let rawT = animFrame / (TOTAL_FRAMES - 1);

  // shorten animate portion to 70%, leave 30% hold
  const ACTIVE_PORTION = 0.7;
  let drawT = rawT < ACTIVE_PORTION
            ? rawT / ACTIVE_PORTION
            : 1;                    

  let s2  = sqrt(2),
      off = cellH * spacingFactor;

  const dirs = [
    {x:1,y:1},{x:-1,y:1},{x:-1,y:-1},{x:1,y:-1}
  ];

  for (let d of dirs) {
    let cx  = cellW/2 + d.x * off/s2,
        cy  = cellH/2 + d.y * off/s2,
        rot = atan2(d.y, d.x) + PI;

    // 1) opening arc
    push(); translate(cx, cy); rotate(rot);
      noFill(); stroke(petal); strokeWeight(4);
      arc(0, 0, ovalW, ovalH,
          -HALF_PI,
          -HALF_PI + TWO_PI * drawT
      );
    pop();

    if (drawT >= 1) {
      // 2) fade-in fill over the last part of ACTIVE_PORTION
      let fadeT = constrain(rawT / ACTIVE_PORTION, 0, 1);
      let alpha = map(easeOutCubic(fadeT), 0, 1, 0, 255);
      push(); translate(cx, cy); rotate(rot);
        noStroke();
        fill(red(petal), green(petal), blue(petal), alpha);
        ellipse(0, 0, ovalW, ovalH);
      pop();

      // 3) outline
      push(); translate(cx, cy); rotate(rot);
        noFill(); stroke(dotC); strokeWeight(outlineThickness);
        ellipse(0, 0, ovalW, ovalH);
      pop();

      // 4) dots appearing one after the other
      const holdDur = 1 - ACTIVE_PORTION;
      const dotDur  = holdDur / 2;

      let d1T = constrain((rawT - ACTIVE_PORTION) / dotDur, 0, 1);
      let d2T = constrain((rawT - (ACTIVE_PORTION + dotDur)) / dotDur, 0, 1);

      let dOff = holeR * 2;
      push(); translate(cx, cy); rotate(rot + HALF_PI);
        noStroke(); fill(dotC);
        if (d1T > 0) circle(0, -dOff, holeR*2 * easeOutCubic(d1T));
        if (d2T > 0) circle(0,  dOff, holeR*2 * easeOutCubic(d2T));
      pop();
    }
  }
}