import { TerrainType, MissionType, MissionSubtype, MissionSubtypeChallenge } from "./enums";

/**
 * room_flags - 1-byte bitfield
 */
export class RoomFlags
{
	f_secondary_terrain_generation: boolean = false; // 0x0: Is secondary terrain generation allowed
	//room_flags_unk1: number; //1
	f_room_imperfections: boolean = false; // 0x2: Are room imperfections allowed
	//room_flags_unk3: number; //5
};

/**
 * terrain_flags - 
 */
export class TerrainFlags
{
	terrain_type: TerrainType = TerrainType.TERRAIN_WALL;
	f_corner_cuttable: boolean = false; // This tile can be corner-cut when walking. Seemingly only used during dungeon generation.
	
	// Includes room tiles right next to a hallway, and branching points within corridors.
    // Only applies to natural halls, not ones made by Absolute Mover, not "hallways" made of
    // secondary terrain, etc. Used by the AI for navigation.
	f_natural_junction: boolean = false; 
	
	// This tile is impassable, even with Absolute Mover/Mobile Scarf. Used for the map border,
    // key chamber walls, walls in boss battle rooms, etc.
	f_impassable_wall: boolean = false;
	f_in_kecleon_shop: boolean = false;
	f_in_monster_house: boolean = false;
	terrain_flags_unk7: boolean = false;
	f_unbreakable: boolean = false; // Cannot be broken by Absolute Mover. Set naturally on key doors.
	f_stairs: boolean = false; // Tile is any type of "stairs" (normal stairs, Hidden Stairs, Warp Zone)
	terrain_flags_unk10: boolean = false;
	f_key_door: boolean = false;
	f_key_door_key_locked: boolean = false;
	f_key_door_escort_locked: boolean = false; // Key door is locked and requires an escort to open (for Sealed Chamber missions)
	terrain_flags_unk14: boolean = false;
	f_unreachable_from_stairs: boolean = false;
};

/**
 * spawn_flags - 2-byte bitfield
 */
export class SpawnFlags
{
	f_stairs: boolean = false;
	f_item: boolean = false;
	f_trap: boolean = false;
	f_monster: boolean = false;
	f_special_tile: boolean = false; //set for kecleon, items, traps

	//TODO: Identify these, they are used in the current code
	spawn_flags_field_0x5: boolean = false;
	spawn_flags_field_0x6: boolean = false;
	spawn_flags_field_0x7: boolean = false;

	//There are more spawn flags here, but they don't appear to be relevant
};

/**
 * mission_destination_info - Information about a mission destination floor
 */
export class MissionDestinationInfo
{
	is_destination_floor: boolean = false;  // 0x0
	mission_type: MissionType = MissionType.MISSION_RESCUE_CLIENT;  // 0x1
	mission_subtype: MissionSubtype = MissionSubtypeChallenge.MISSION_CHALLENGE_NORMAL;  // 0x2
}

export class StairsReachableFlags
{
	f_cannot_corner_cut: boolean = false;
	f_secondary_terrain_cannot_corner_cut: boolean = false;
	f_unknown_field_0x2: boolean = false; //used for corners
	f_starting_point: boolean = false;
	f_in_visit_queue: boolean = false;
	f_visited: boolean = false;
};

