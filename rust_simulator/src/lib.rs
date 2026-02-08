use std::{cmp::Ordering, collections::{BinaryHeap, HashMap}, u32};

use wasm_bindgen::prelude::*;
use rayon::{prelude::*}; 

pub use wasm_bindgen_rayon::init_thread_pool;

mod utlis;
use utlis::INTI_COSTS;


#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// 2. Create a macro that mimics println!
macro_rules! console_log {
    // This pattern matches arguments exactly like println! does
    ($($t:tt)*) => (log(&format!($($t)*)))
}

 
    // Maps t (0.0 to 1.0) to a u32 Color (0xAABBGGRR Little Endian)
    // 0.0 = Red (Hot/Close)
    // 0.5 = Green
    // 1.0 = Dark Blue (Cold/Far)
    fn heat_map_color(t: f32) -> u32 {
        let r: u32;
        let g: u32;
        let b: u32;
        let a: u32 = 0xFF; // Full Alpha

        // Multi-stop Gradient: Red -> Yellow -> Green -> Cyan -> Blue
        if t < 0.25 {
            // Red to Yellow
            // R: 255, G: 0->255, B: 0
            let seg = t / 0.25;
            r = 255;
            g = (255.0 * seg) as u32;
            b = 0;
        } else if t < 0.5 {
            // Yellow to Green
            // R: 255->0, G: 255, B: 0
            let seg = (t - 0.25) / 0.25;
            r = (255.0 * (1.0 - seg)) as u32;
            g = 255;
            b = 0;
        } else if t < 0.75 {
            // Green to Cyan
            // R: 0, G: 255, B: 0->255
            let seg = (t - 0.5) / 0.25;
            r = 0;
            g = 255;
            b = (255.0 * seg) as u32;
        } else {
            // Cyan to Dark Blue
            // R: 0, G: 255->0, B: 255->139
            let seg = (t - 0.75) / 0.25;
            r = 0;
            g = (255.0 * (1.0 - seg)) as u32;
            // Fade Blue (255) down to DarkBlue (139)
            b = (255.0 - (116.0 * seg)) as u32; 
        }

        // Combine into u32 (Little Endian: 0xAABBGGRR)
        (a << 24) | (b << 16) | (g << 8) | r
    }










#[derive(Copy, Clone, Eq, PartialEq)] // Eq and PartialEq are required for Ord
struct State {
    cost: u32,
    index: usize,
}

impl Ord for State{
    fn cmp(&self, other: &Self) -> Ordering{
        other.cost.cmp(&self.cost)
            .then_with(|| self.index.cmp(&other.index))
    }
}

impl PartialOrd for State {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}


#[derive(Copy, Clone, Eq, PartialEq)]
struct AutoGrowState{
    cost: u32,
    index: usize,
    empire_id: u32,
}

impl Ord for AutoGrowState{
    fn cmp(&self, other: &Self) -> Ordering{
        other.cost.cmp(&self.cost)
            .then_with(|| self.index.cmp(&other.index))
            .then_with(|| self.empire_id.cmp(&other.empire_id))
    }
}

impl PartialOrd for AutoGrowState{
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

// struct asState : State{

// }



#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Terrain {
    Water = 1,
    River = 2,
    Plain = 3,
    Mountain = 4,
    Desert = 5,
    Forest = 6,
    Ice = 7,
    Unknown = 0,
}

impl Terrain {
    pub fn from_u8(val: u8) -> Terrain {
        match val {
            1 => Terrain::Water,
            2 => Terrain::River,
            3 => Terrain::Plain,
            4 => Terrain::Mountain,
            5 => Terrain::Desert,
            6 => Terrain::Forest,
            7 => Terrain::Ice,
            _ => Terrain::Unknown,
        }
    }

    fn from_char(c: char) -> Terrain {
        match c {
            'W' => Terrain::Water,
            'R' => Terrain::River,
            'P' => Terrain::Plain,
            'M' => Terrain::Mountain,
            'D' => Terrain::Desert,
            'F' => Terrain::Forest,
            'I' => Terrain::Ice,
            _ => Terrain::Unknown,
        }
    }

    fn to_char(&self) -> char {
        match self {
            Terrain::Water => 'W',
            Terrain::River => 'R',
            Terrain::Plain => 'P',
            Terrain::Mountain => 'M',
            Terrain::Desert => 'D',
            Terrain::Forest => 'F',
            Terrain::Ice => 'I',
            Terrain::Unknown => '?',
        }
    }

    fn get_color(&self) -> u32 {
        match self {
            Terrain::Water => 0xFFDB9538,
            Terrain::River => 0xFFE0C040,
            Terrain::Plain => 0xFF408035,
            Terrain::Mountain => 0xFF606060,
            Terrain::Desert => 0xFF60C0F0,
            Terrain::Forest => 0xFF225510,
            Terrain::Ice => 0xFFFAFAFA,
            Terrain::Unknown => 0xFF000000,
        }
    }

    fn is_liveable(&self) -> bool{
        match self {
            Terrain::Water | Terrain::Unknown => false,
            _ => true,
        }
    }

    fn is_watery(&self) -> bool{
        match self{
            Terrain::Water | Terrain::River => true,
            _ => false,
        }
    }
}


#[derive(Clone, Copy, Debug)]
pub struct Empire{
    pub id: u32,
    pub color: u32,
    pub size: u32,
    pub cap_index: usize,

    //[u32;8] avoids cache misses because its fixed memory
    pub costs: [u32; 8],
}

impl Empire{
    pub fn new(id: u32, color: u32, size: u32, settings: [u32; 8], cap_index: usize) -> Empire{
        Empire { id, color, costs: settings, size, cap_index }
    }
}


#[wasm_bindgen]
pub struct World {
    width: usize,
    height: usize,
    tiles: Vec<Terrain>,
    owners: Vec<u32>,
    terrain_buffer: Vec<u32>,
    ownership_buffer: Vec<u32>,
    dist_buffer: Vec<u32>,
    
    dist_vector: Vec<u32>,
    dist_map: Vec<u32>,
    empires: HashMap<u32, Empire>,
}

#[wasm_bindgen]
impl World {
    pub fn new(map_str: &str) -> World {
        // (Parsing logic remains the same - usually fast enough sequentially)
        let lines: Vec<&str> = map_str.lines().filter(|l| !l.is_empty()).collect();
        let height = lines.len();
        let width = if height > 0 { lines[0].trim().len() } else { 0 };
        let size = width * height;

        let dist_vector = vec![u32::MAX; width* height];
        let dist_map = vec![u32::MAX; size];
        let empires = HashMap::new();

        let mut tiles = Vec::with_capacity(size);
        for line in lines {
            for c in line.trim().chars() {
                tiles.push(Terrain::from_char(c));
            }
        }

        let mut world = World {
            width,
            height,
            tiles,
            owners: vec![0; size],
            terrain_buffer: vec![0xFF000000; size],
            ownership_buffer: vec![0x00000000; size],
            dist_buffer: vec![0x0000000; size],

            dist_vector,
            dist_map,
            empires
        };

        // Render immediately upon creation
        world.render_terrain();

        world
    }

    pub fn width(&self) -> usize { self.width }
    pub fn height(&self) -> usize { self.height }


    ////////Rendering logic

    pub fn get_terrain_buffer_ptr(&self) -> *const u32 {
        self.terrain_buffer.as_ptr()
    }

    pub fn get_ownership_buffer_ptr(&self) -> *const u32 {
        self.ownership_buffer.as_ptr()
    }

    pub fn get_dist_buffer_ptr(&self) -> *const u32 {
        self.dist_buffer.as_ptr()
    }

    // --- PARALLEL RENDERER ---
    
    pub fn render_terrain(&mut self) {
        // Zip the tiles (Read) with the buffer (Write)
        // par_iter() splits this work across all Web Workers
        self.terrain_buffer
            .par_iter_mut()
            .zip(self.tiles.par_iter())
            .for_each(|(pixel, tile)| {
                *pixel = tile.get_color();
            });
    }

    pub fn render_ownership(&mut self) {
        let empires= &self.empires;

        // We can also parallelize the ownership overlay
        self.ownership_buffer
            .par_iter_mut()
            .zip(self.owners.par_iter())
            .for_each(|(pixel, &owner_id)| {
                if owner_id == 0 {
                    *pixel = 0x00000000;
                } else {
                    *pixel = match empires.get(&owner_id) {
                        Some(emp) => emp.color,
                        None => 0xFFFFFFFF 
                    };
                }
            });
    }

    pub fn render_dist_map(&mut self, max_dist_option: Option<u32>) {
        let max_dist_f: f32 = match max_dist_option {
            Some(val) => val as f32,
            None => {
                let max_found = self.dist_map
                    .par_iter()
                    .filter(|&&d| d != u32::MAX)
                    .max()
                    .cloned()
                    .unwrap_or(1);
                    
                max_found as f32
            }
        };

        // 2. Render Pixels in Parallel
        self.dist_buffer
            .par_iter_mut()
            .zip(self.dist_map.par_iter())
            .for_each(|(pixel, &dist)| {
                if dist == u32::MAX {
                    // Unreachable areas (e.g. Oceans if you can't swim) -> Transparent
                    *pixel = 0x00000000; 
                } else {
                    // Normalize distance 0.0 to 1.0
                    let t = dist as f32 / max_dist_f;
                    *pixel = heat_map_color(t);
                }
            });
    }




    ///////////////Modifications to empires


    /// adding an empire capital
    pub fn add_empire(&mut self, x: usize, y: usize, empire_id: u32, color: u32, size: u32, settings: Vec<u32>) {
        if settings.len() != 8{
            panic!("Settings empire must have lenght 8");
        }

        // maybe add a if !self.tiles[index].is_liveable(){panic!("Terrain capital must not be water type")}

        let index = y * self.width + x;
        if index < self.owners.len() {
            self.owners[index] = empire_id;
            self.dist_vector[index] = 0;
        }

        // first will be always for unknown.
        let mut costs: [u32; 8] = [99999;8];
        for (i, &cost) in settings.iter().enumerate(){
            costs[i] = cost;
        }

        let empire = Empire::new(empire_id, color, size, costs, index);

        self.empires.insert(empire_id, empire);

        self.calc_teritory(index, empire_id, size);
    }

    /// updating empire color
    pub fn set_empire_color(&mut self, empire_id: u32, color: u32){
        if let Some(empire) = self.empires.get_mut(&empire_id){
            empire.color = color;
        }
    }

    /// changing empire settings
    pub fn set_empire_settings(&mut self, empire_id: u32, settings: Vec<u32>){
        if settings.len() != 8{
            panic!("Settings vector must have length 8");
        }
        let mut costs = [999;8];

        for (i, &cost) in settings.iter().enumerate(){
            costs[i] = cost;
        }

        if let Some(empire) = self.empires.get_mut(&empire_id){
            empire.costs = costs;
        }
    }

    /// deleting an empire
    pub fn delete_empire(&mut self, empire_id: u32){
        self.empires.remove(&empire_id);

        self.owners.par_iter_mut()
            .zip(self.dist_vector.par_iter_mut())
            .for_each(|(owner, dist)| {
                if *owner == empire_id{
                    *owner = 0;
                    *dist = u32::MAX;
                }
            });
    }
}


//////Map Logic Implementation
impl World{
    pub fn calc_teritory(
        &mut self,
        start_index: usize,
        empire_id: u32,
        n: u32,    
    ){
        console_log!("Starting to calculate djisktra with size: {}", n);

        let width = self.width;
        let height = self.height;

        let costs = self.empires.get(&empire_id).expect("Empire ID is wrong").costs;

        let mut pq = BinaryHeap::<State>::new();
        let mut dist_local = vec![u32::MAX; width * height];
        let directions = [(0, -1), (0, 1), (-1, 0), (1, 0)];

        pq.push(State{cost: 0, index: start_index});
        dist_local[start_index] = 0;

        let mut claimed_count: u32 = 0;

        while let Some(State{cost, index}) = pq.pop() {
            if claimed_count >= n {
                break;
            }

            if cost > dist_local[index]{continue;}

            if cost > self.dist_vector[index]{continue;}

            // claim the tyle
            if self.tiles[index].is_liveable(){
                self.owners[index] = empire_id;
                self.dist_vector[index] = cost;
                claimed_count += 1;
            }

            let x: i32 = (index % width) as i32;
            let y: i32 = (index / width) as i32;

            let current_terrain = self.tiles[index];

            for (dx, dy) in directions{
                let nx = x + dx;
                let ny = y + dy;

                if nx < 0 || nx >= (width as i32) || ny < 0 || ny >= (height as i32){continue;}

                let neib_idx = (ny as usize * width) + (nx as usize);

                let neib_terrain = self.tiles[neib_idx];

                let move_cost = costs[self.tiles[neib_idx] as usize];
                let is_transition = current_terrain.is_watery() != neib_terrain.is_watery();
                let penalty = if is_transition { costs[1] * 3 } else { 0 };
                let new_cost = cost + move_cost + penalty;

                if new_cost >= self.dist_vector[neib_idx]{continue;}

                if new_cost < dist_local[neib_idx]{
                    dist_local[neib_idx] = new_cost;
                    pq.push(State{cost: new_cost, index: neib_idx});
                }
            }
        }

        
    }

    
}


#[wasm_bindgen]
impl World{
    pub fn djisktra_dist_point(&mut self, start_x: usize, start_y: usize, empire_id: u32, settings: Vec<u32>) {
        let width = self.width;
        let height = self.height;
        let size = width * height;
        let start_index = start_y * width + start_x;

        for i in 0..size {
            self.dist_map[i] = u32::MAX;
        }

        // Get empire costs
        // let costs = match self.empires.get(&empire_id) {
        //     Some(e) => e.costs,
        //     None => {
        //         console_log!("Empire ID {} not found", empire_id);
        //         console_log!("Empire settings: {:?}", self.empires);
        //         INTI_COSTS
        //     }
        // };

        let mut costs: [u32; 8] = [9999; 8];

        for (i, &cost) in settings.iter().enumerate(){
            costs[i] = cost;
        }

        // Dijkstra setup
        let mut pq = BinaryHeap::<State>::new();
        let directions = [(0, -1), (0, 1), (-1, 0), (1, 0)];

        // Start point
        pq.push(State { cost: 0, index: start_index });
        self.dist_map[start_index] = 0;

        while let Some(State { cost, index }) = pq.pop() {
            // If we found a shorter path previously, skip
            if cost > self.dist_map[index] {
                continue;
            }

            let x = (index % width) as i32;
            let y = (index / width) as i32;
            let current_terrain = self.tiles[index];

            for (dx, dy) in directions {
                let nx = x + dx;
                let ny = y + dy;

                if nx < 0 || nx >= (width as i32) || ny < 0 || ny >= (height as i32) {
                    continue;
                }

                let neib_idx = (ny as usize * width) + (nx as usize);
                let neib_terrain = self.tiles[neib_idx];

                // Calculate cost using empire settings and transition logic
                let move_cost = costs[neib_terrain as usize];
                let is_transition = current_terrain.is_watery() != neib_terrain.is_watery();
                let penalty = if is_transition { costs[1] * 3 } else { 0 }; // using Water (index 1) cost for penalty base
                
                // Add saturation check to prevent overflow
                let new_cost = cost.saturating_add(move_cost).saturating_add(penalty);

                // If this path is better, record it and push to queue
                if new_cost < self.dist_map[neib_idx] {
                    self.dist_map[neib_idx] = new_cost;
                    pq.push(State { cost: new_cost, index: neib_idx });
                }
            }
        }
        
       ;
    }


    pub fn auto_grow(&mut self, size: u32) {
        let width = self.width;
        let height = self.height;

        let mut pq = BinaryHeap::new();
        let mut grow_counts: HashMap<u32, u32> = HashMap::new();
        let directions = [(0, -1), (0, 1), (-1, 0), (1, 0)];

        // --- 1. SCAN FOR FRONTIER (The Fix) ---
        // Instead of starting at capitals, we look for owned tiles next to empty ones.
        // This is O(MapSize), which is very fast in Rust/WASM (~5-10ms for 2000x2000).
        for index in 0..(width * height) {
            let owner = self.owners[index];
            
            // If this tile belongs to an empire...
            if owner != 0 {
                // Check if it's a "Frontier" tile (has empty neighbor)
                let x = (index % width) as i32;
                let y = (index / width) as i32;
                let current_dist = self.dist_vector[index];

                // Get costs for this empire
                // (Unwrap safety: if owner exists in array, it must exist in map)
                if let Some(empire) = self.empires.get(&owner) {
                    let costs = empire.costs;

                    for (dx, dy) in directions {
                        let nx = x + dx;
                        let ny = y + dy;

                        // Bounds check
                        if nx < 0 || nx >= width as i32 || ny < 0 || ny >= height as i32 { continue; }
                        
                        let neib_idx = (ny as usize * width) + (nx as usize);
                        
                        // IF NEIGHBOR IS EMPTY -> It's a candidate for growth!
                        if self.owners[neib_idx] == 0 {
                            // Calculate cost to move INTO the empty tile
                            let neib_terrain = self.tiles[neib_idx];
                            let move_cost = costs[neib_terrain as usize];
                            
                            // Transition penalty logic (optional)
                            let current_terrain = self.tiles[index];
                            let is_transition = current_terrain.is_watery() != neib_terrain.is_watery();
                            let penalty = if is_transition { costs[1] * 3 } else { 0 };

                            let new_cost = current_dist.saturating_add(move_cost).saturating_add(penalty);

                            // Push to PQ
                            pq.push(AutoGrowState {
                                cost: new_cost, 
                                index: neib_idx, 
                                empire_id: owner
                            });
                        }
                    }
                }
            }
        }

        let mut local_dist = vec![u32::MAX; width * height];

        // --- 2. THE FLOOD LOOP ---
        while let Some(AutoGrowState { cost, index, empire_id }) = pq.pop() {
            
            // cant go in your teritory and for now not in enemy teritory
            if self.owners[index] != 0 {continue;}
            if cost > local_dist[index] { continue; }

            let current_growth = grow_counts.entry(empire_id).or_insert(0);
            if *current_growth >= size { continue; }

            // C. Claim Logic
            if self.owners[index] == 0 {

                if self.tiles[index].is_liveable() {
                    self.owners[index] = empire_id;
                    self.dist_vector[index] = cost;
                    local_dist[index] = cost;
                    *current_growth += 1;
                }

                // D. Expand from this new tile
                let costs = self.empires.get(&empire_id).unwrap().costs;
                let x = (index % width) as i32;
                let y = (index / width) as i32;
                let current_terrain = self.tiles[index];

                for (dx, dy) in directions {
                    let nx = x + dx;
                    let ny = y + dy;
                    if nx < 0 || nx >= width as i32 || ny < 0 || ny >= height as i32 { continue; }
                    
                    let neib_idx = (ny as usize * width) + (nx as usize);

                    // Only expand into EMPTY space
                    if self.owners[neib_idx] == 0 {
                        let neib_terrain = self.tiles[neib_idx];
                        let move_cost = costs[neib_terrain as usize];
                        let is_transition = current_terrain.is_watery() != neib_terrain.is_watery();
                        let penalty = if is_transition { costs[1] * 3 } else { 0 };

                        let new_cost = cost.saturating_add(move_cost).saturating_add(penalty);

                        // Competitive Check
                        if new_cost < local_dist[neib_idx] {
                            local_dist[neib_idx] = new_cost;
                            pq.push(AutoGrowState { cost: new_cost, index: neib_idx, empire_id });
                        }
                    }
                }
            }
        }
    }

}


// Implementing the painting options
#[wasm_bindgen]
impl World {
    // ... existing methods ...

    pub fn paint_terrain_brush(
        &mut self, 
        center_x: i32, 
        center_y: i32, 
        radius: i32, 
        terrain_val: char,
    ) {
        let width = self.width as i32;
        let height = self.height as i32;

        // 1. Convert the integer from JS to your Rust Enum
        let terrain_type = Terrain::from_char(terrain_val.to_ascii_uppercase());
        console_log!("Received {} transformed into {:?}", terrain_val, terrain_type);
        
        // Get the correct color (0xAABBGGRR)
        let color = terrain_type.get_color();

        // 2. Bounding Box Optimization (Clamped to map edges)
        let min_x = (center_x - radius).max(0);
        let max_x = (center_x + radius).min(width - 1);
        let min_y = (center_y - radius).max(0);
        let max_y = (center_y + radius).min(height - 1);

        let radius_sq = radius * radius;

        for y in min_y..=max_y {
            for x in min_x..=max_x {
                // 3. Circle Check (Using i32 prevents underflow panic)
                let dx = x - center_x;
                let dy = y - center_y;

                if dx * dx + dy * dy <= radius_sq {
                    let index = (y * width + x) as usize;

                    // 4. Update Logic
                    
                    // A. Update the logical data
                    self.tiles[index] = terrain_type;

                    // B. Update the visual buffer 
                    // Since terrain_buffer is Vec<u32>, we assign the color directly.
                    // This is much faster than setting 4 separate bytes.
                    self.terrain_buffer[index] = color;
                    
                    // Optional: Clear ownership/distance on painted tiles?
                    // self.owners[index] = 0;
                    // self.dist_vector[index] = u32::MAX;
                }
            }
        }
    }
}

// send the mapString of the tiles
#[wasm_bindgen]
impl World {
    pub fn export_map_to_string(&self) -> String {
        let capacity = self.width * self.height + self.height;
        let mut output = String::with_capacity(capacity);

        for y in 0..self.height {
            for x in 0..self.width {
                let index = y * self.width + x;
                output.push(self.tiles[index].to_char());
            }
            output.push('\n');
        }

        output
    }
}