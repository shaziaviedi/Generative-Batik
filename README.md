# Generative-Batik

This project is a generative, animated interpretation of three classic **Indonesian batik motifs** built with p5.js.  
Each pattern unfolds over time inside a tiled grid, turning batik into a kinetic system rather than a static textile.

Patterns included  
- Parang  
- Sidoluhur  
- Kawung  

Press keys to switch motifs and optionally record seamless looping GIFs.


## Concept

The sketch explores how traditional batik structures can be translated into:

- **Parametric geometry**  
  Curves, grids, and motifs are defined as reusable functions with timing and easing.
- **Temporal drawing**  
  Strokes and fills appear in stages, so you see the pattern being constructed rather than only the final state.
- **Looped motion**  
  A shared animation timeline lets each motif breathe and hold, similar to the rhythm of a textile repeat.

The goal is not to copy batik literally but to **encode its logic** (diagonal flows, symmetry, central axes, layered details) into generative rules.


## Patterns

### 1. Parang (key `1`)

A 4×4 grid of cells that each contain

- Warm base color as cloth.  
- Diagonal “S” shaped **Parang stripes** built from chained Bézier curves.  
- A single continuous diagonal border line that grows across the tile.  
- Staggered **diamond stacks** that pop in one by one along the stripe.  
- A tear-drop motif placed into the filled area of the stripe.

Animation focuses on

- Stripes drawing from nothing to full length.  
- Later fade in of fills and decorative tear-drops.  
- Diamonds easing in with cubic ease-out to feel like organic growth.


### 2. Sidoluhur (key `2`)

A 4×4 grid of Sidoluhur tiles that combine

- Light background as cloth.  
- A thick **wavy diamond** frame at the center, drawn with wobbling offsets along its edges.  
- Corner **vines** that grow inward from each side toward the center.  
- **Leaves** that sprout at vine tips with easing.  
- A central **temple or crown** shape that rises up in radial symmetry.  
- Dot clusters at midpoints and center that pop in at a later phase.

Timing is staggered

- Diamond frame first.  
- Vines and leaves next.  
- Temple form grows in.  
- Dot clusters appear once the main structure is established.


### 3. Kawung (key `3`)

A 5×5 grid of Kawung units with

- Dark brown background.  
- Four **ovals or petals** around each cell center, rotated to form the classic Kawung cross.  
- Light outlines and central dots.

Animation

- Petal arcs sweep gradually until a full ellipse is drawn.  
- After arcs complete, fill fades in and outline appears.  
- Two dots along the vertical axis animate in sequence.  
- The animation uses a shorter active portion and a longer hold so the loop lingers in a finished state.

For Kawung, the global animation frame advances more slowly at the end of the loop, giving extra time to read the full pattern.


## Interaction and Controls

- Press `1`  
  Switch to **Parang** pattern and reset animation.
- Press `2`  
  Switch to **Sidoluhur** pattern and reset animation.
- Press `3`  
  Switch to **Kawung** pattern and reset animation.
- Press `R` (or `r`)  
  Start **GIF recording** from the beginning of the loop.

The animation runs on a global timeline

- `TOTAL_FRAMES` set to 400  
- `animFrame` cycles from 0 to `TOTAL_FRAMES - 1`  
- `ANIMATE_PORTION` controls how much of the loop is active animation versus still hold for patterns 1 and 2.  
- Kawung uses its own active portion and hold in the cell function.


## GIF Recording

The sketch uses **gif.js** to record a seamless loop.

Recording flow

- Press `R` to begin recording.  
- `animFrame` resets to 0.  
- Each frame of the loop is captured and pushed into a GIF encoder.  
- At the end of the loop, recording stops and the GIF renders.  
- When finished, the browser triggers a download named `patternX.gif`  
  X matches the current `patternType`.

Requirements

- `gif.js` included in your project.  
- Worker script path set via  
  `workerScript: 'libraries/gif.worker.js'`.


## Code Structure

High level structure

- `setup`  
  Creates an 800×800 canvas, sets pixel density and frame rate, stores the canvas DOM element for GIF capture.
- `draw`  
  Clears the canvas, computes normalized time `t` for the current frame, dispatches to one of  
  `drawParangKinetic`, `drawSidoluhurKinetic`, or `drawKawungKinetic`.  
  Handles recording logic and advanced timing for the Kawung hold.
- Pattern functions  
  - `drawParangKinetic`  
    Builds diagonal stripes, border line, diamonds, and tear-drop detail.  
  - `drawSidoluhurKinetic`  
    Builds wavy diamond, dot clusters, growing vines, leaves, and central temple.  
  - `drawKawungKinetic`  
    Builds petals, outlines, and dots with a loop that has a defined active portion and hold time.
- Shared helpers  
  - `easeOutCubic` for smooth easing.  
  - Geometry helpers for teardrops, leaves, temple petals, and wavy lines.

