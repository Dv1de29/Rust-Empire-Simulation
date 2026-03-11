# 🌍 Empire Expansion Simulator & Map Editor

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)
![Rayon](https://img.shields.io/badge/Parallel-Rayon-blue?style=for-the-badge)

A high-performance, browser-based simulation engine built with **React**, **Rust**, and **WebAssembly (WASM)**. This project models the organic expansion of empires across a grid-based map, driven by terrain movement costs and strategic resource attraction, utilizing multi-threaded parallel rendering for real-time visualization.

---

## 🚀 Key Features

* **High-Performance Simulation:** Core logic is written in Rust and compiled to WebAssembly, capable of processing multi-million cell grids in milliseconds.
* **Parallel Rendering:** Utilizes `rayon` and `wasm-bindgen-rayon` to split pixel-buffer rendering across Web Workers, achieving 60 FPS even on massive maps.
* **Dual-Cost Dijkstra Expansion:** A custom implementation of Dijkstra's algorithm that separates **Travel Cost** (for accurate border calculations) from **Priority Cost** (allowing empires to "snake" toward high-value resources like Gold and Gems without breaking geometric math).
* **Interactive Map Editor:** Real-time terrain and resource brush painting with bounding-box optimization and responsive screen-to-grid coordinate mapping.
* **Zero-Copy Canvas Integration:** Renders directly to shared memory buffers (`Vec<u32>`) that JavaScript draws to the `<canvas>` via `ImageData`, eliminating costly serialization.

---

## 🏗 Architecture & Tech Stack

### The Frontend: React & TypeScript
Handles the user interface, state management for user preferences (brush size, selected terrain, empire aggressiveness), and capturing DOM events. React tracks the *intent*, but delegates heavy calculations to WASM.

### The Engine: Rust & WebAssembly
Maintains the single source of truth: the `World` struct. It holds 1D vectors for Terrains, Resources, Ownership, and Distance maps to ensure maximum CPU cache locality.

### The Bridge: Shared Memory & Rayon
To achieve multi-threading in the browser, the project leverages `SharedArrayBuffer`. Rust spawns a Web Worker pool via Rayon. When React requests a frame update, Rust processes the visual pixel buffers (`terrain_buffer`, `ownership_buffer`, etc.) in parallel chunks, returning a raw memory pointer to JavaScript for instant canvas drawing.

---

## 🧠 Algorithmic Highlights

### 1. Resource-Driven Pathfinding
Standard Dijkstra algorithms evaluate identical costs symmetrically. To make empires actively seek resources without breaking true distance metrics, the engine employs a **Dual-Cost Priority Queue**:
* `true_cost`: The actual cumulative friction of moving through terrain.
* `sort_cost`: A dynamic score used *only* for the priority queue ordering, calculated as `true_cost / (1 + resource_value)`. 

### 2. Frontier Scanning Optimization
Instead of recalculating expansion from capital cities every frame, the engine scans the existing `owners` array for "Frontier Tiles" (owned tiles adjacent to empty tiles) in $O(N)$ time. This acts as the seed for the next iteration of the `BinaryHeap`, making incremental growth exponentially faster than full-map recalculations.

### 3. Bitwise Color Compilation
Color mapping for the canvas is handled via bitwise operations in Rust. Colors are compiled into Little-Endian `0xAABBGGRR` `u32` integers and written directly to the memory buffer, bypassing the need to loop over 4 separate RGBA bytes per pixel.

---

## 📂 Project Structure

```text
/Root
├── Map_Simulator_Optimized/     (React Frontend)
│   ├── public/
│   └── src/
│       ├── assets/              (Images, static JSON configs)
│       ├── components/          (Reusable UI: Slider, SelectType, MapCanvas)
│       ├── context/             (Global State: SettingsContext)
│       ├── pages/               (Main views: Editor, Simulation)
│       ├── styles/              (CSS/SCSS)
│       ├── types/               (TypeScript interfaces, Config types)
│       └── utils/               (Pure math/helper functions, e.g., coordinate mapping)
│
└── rust_simulator/              (Rust WASM Backend)
    ├── Cargo.toml
    ├── src/
    │   ├── lib.rs               Main Rust logic 
    │   └── utils.rs                      
```

## 🛠 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v16+)
* [Rust & Cargo](https://rustup.rs/)
* [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

### 1. Build the WebAssembly Module

Navigate to your Rust directory and compile for the web, enabling atomics for multi-threading:

```bash
cd src-rust
wasm-pack build --target web
```

### 2. Install Frontend Dependencies
```bash
cd ..
npm install
```

###3. Run the Development Server

Note: Because this project uses SharedArrayBuffer for multithreading, your dev server MUST be configured to emit Cross-Origin Isolation headers.

```bash
npm run dev
```

(Ensure your Vite/Webpack config includes Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp)

```vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
```


# 🔮 Future Enhancements
* Empire Collision/Combat: Currently, empires expand into empty space. The next phase will introduce border friction, allowing empires to overwrite opponent tiles based on a dynamic "Military Strength" vs "Harshness" formula.

* Procedural Generation: Integrating OpenSimplex or Perlin noise to generate realistic starting maps rather than loading from static strings.

