#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Resource {
    None = 0,
    Gold = 1,
    Silver = 2,
    Gems = 3,
    Coal = 4,
    Cows = 5,
    Wheat = 6,
    Fish = 7,
    Silk = 8,
    Spices = 9,
    Wine = 10,
}

impl Resource {
    pub fn from_u8(val: u8) -> Resource {
        match val {
            1 => Resource::Gold,
            2 => Resource::Silver,
            3 => Resource::Gems,
            4 => Resource::Coal,
            5 => Resource::Cows,
            6 => Resource::Wheat,
            7 => Resource::Fish,
            8 => Resource::Silk,
            9 => Resource::Spices,
            10 => Resource::Wine,
            _ => Resource::None,
        }
    }

    pub fn to_u8(&self) -> u8 {
        *self as u8
    }

    // Characters for map string export/import
    // g=Gold, s=Silver, *=Gems, c=Coal, C=Cows, w=Wheat, f=Fish, S=Silk, !=Spices, v=Wine
    pub fn from_char(c: char) -> Resource {
        match c {
            'g' => Resource::Gold,
            's' => Resource::Silver,
            '*' => Resource::Gems,
            'c' => Resource::Coal,
            'C' => Resource::Cows,
            'w' => Resource::Wheat,
            'f' => Resource::Fish,
            'S' => Resource::Silk,
            '!' => Resource::Spices,
            'v' => Resource::Wine,
            _ => Resource::None,
        }
    }

    pub fn to_char(&self) -> char {
        match self {
            Resource::Gold => 'g',
            Resource::Silver => 's',
            Resource::Gems => '*',
            Resource::Coal => 'c',
            Resource::Cows => 'C',
            Resource::Wheat => 'w',
            Resource::Fish => 'f',
            Resource::Silk => 'S',
            Resource::Spices => '!',
            Resource::Wine => 'v',
            Resource::None => '.',
        }
    }

    pub fn get_value(&self) -> u32 {
        match self {
            Resource::Gold => 100,
            Resource::Silver => 70,
            Resource::Gems => 150,
            Resource::Coal => 70,
            Resource::Cows => 30,
            Resource::Wheat => 20,
            Resource::Fish => 25,
            Resource::Silk => 80,
            Resource::Spices => 90,
            Resource::Wine => 40,
            Resource::None => 0,
        }
    }

    // Returns Color in Little Endian (0xAABBGGRR) format for the pixel buffer
    pub fn get_color(&self) -> u32 {
        match self {
            Resource::Gold   => 0xFF00D7FF, // #FFD700
            Resource::Silver => 0xFFC0C0C0, // #C0C0C0
            Resource::Gems   => 0xFFD670DA, // #DA70D6 (Orchid)
            Resource::Coal   => 0xFF4F4F2F, // #2F4F4F (Dark Slate Grey)
            Resource::Cows   => 0xFF2D52A0, // #A0522D (Sienna)
            Resource::Wheat  => 0xFFB3DEF5, // #F5DEB3 (Wheat)
            Resource::Fish   => 0xFFEEEEAF, // #AFEEEE (Pale Turquoise)
            Resource::Silk   => 0xFFB469FF, // #FF69B4 (Hot Pink)
            Resource::Spices => 0xFF1E69D2, // #D2691E (Chocolate)
            Resource::Wine   => 0xFF000080, // #800000 (Maroon)
            Resource::None   => 0x00000000, // Transparent or handle separately
        }
    }
}
