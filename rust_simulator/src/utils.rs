pub const INTI_COSTS: [u32; 8] = [
    9999, // 0: Unknown / Void
    25,  // 1: Water
    10,  // 2: River
    15,   // 3: Plain
    80,  // 4: Mountain
    60,  // 5: Desert
    20,  // 6: Forest
    100,  // 7: Ice
];

// Maps t (0.0 to 1.0) to a u32 Color (0xAABBGGRR Little Endian)
// 0.0 = Red (Hot/Close)
// 0.5 = Green
// 1.0 = Dark Blue (Cold/Far)
pub fn heat_map_color(t: f32) -> u32 {
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

pub fn string_to_vec<T, F>(map_data: &str, parser: F, fixed_size: usize, default: T) -> Vec<T>
where
    F: Fn(char) -> T, 
    T: Clone,
{
    let lines: Vec<&str> = map_data.lines().filter(|l| !l.is_empty()).collect();
    let height = lines.len();
    let width = if height > 0 { lines[0].trim().len() } else { 0 };
    let size = width * height;

    if size != fixed_size {
        return vec![default; size]
    }

    let mut result_vector = Vec::with_capacity(size);

    for line in lines {
        for c in line.trim().chars() {
            result_vector.push(parser(c));
        }
    }

    result_vector
}
