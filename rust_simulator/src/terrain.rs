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

    pub fn from_char(c: char) -> Terrain {
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

    pub fn to_char(&self) -> char {
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

    pub fn get_color(&self) -> u32 {
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

    pub fn is_liveable(&self) -> bool{
        match self {
            Terrain::Water | Terrain::Unknown => false,
            _ => true,
        }
    }

    pub fn is_watery(&self) -> bool{
        match self{
            Terrain::Water | Terrain::River => true,
            _ => false,
        }
    }
}
