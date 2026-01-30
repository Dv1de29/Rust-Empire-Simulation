use std::{cmp::Ordering, collections::{BinaryHeap, HashMap}, u32};

use wasm_bindgen::prelude::*;
use rayon::{prelude::*}; // <--- 1. Import Rayon traits

// --- EXPOSE THREAD POOL INITIALIZER ---
// JavaScript needs to call this once to spawn the workers
pub use wasm_bindgen_rayon::init_thread_pool;


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


#[derive(Clone, Copy)]
pub struct Empire{
    pub id: u32,
    pub color: u32,
    pub size: u32,

    //[u32;8] avoids cache misses because its fixed memory
    pub costs: [u32; 8],
}

impl Empire{
    pub fn new(id: u32, color: u32, size: u32, settings: [u32; 8]) -> Empire{
        Empire { id, color, costs: settings, size }
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
    
    dist_vector: Vec<u32>,
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

            dist_vector,
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

        let empire = Empire::new(empire_id, color, size, costs);

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
            if claimed_count >= n {break;}

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