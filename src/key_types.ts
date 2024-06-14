import { FloorLayout, DungeonObjectiveType, FloorSize, HiddenStairsType, GameId, ShopItemPositions } from './enums';
import { RoomFlags, TerrainFlags, SpawnFlags, MissionDestinationInfo, SpawnedShopkeeperData } from './minor_types';

/**
 * A Grid Cell refers to a single enclosed tile-space of the dungeon map.
 * These are used in dungeon.ts to form a matrix of grid cells that represent the entire map.
 *
 * Each individual grid cell can hold one room or hallway anchor (or nothing if its contents are deleted later in generation).
 *
 * Grid Cells are an important level of abstraction above the tile space, though they aren't used once dungeon generation has finished.
 */
export class GridCell {
	//Defines the enclosing rectangular room space for this grid cell on the dungeon map [start_x, end_x), [start_y, end_y)
	start_x: number = 0;
	start_y: number = 0;
	end_x: number = 0;
	end_y: number = 0;

	is_invalid: boolean = false;
	has_secondary_structure: boolean = false;
	is_room: boolean = false;
	is_connected: boolean = false;
	is_kecleon_shop: boolean = false;
	unk3: boolean = false;
	is_monster_house: boolean = false;
	unk4: boolean = false;
	is_maze_room: boolean = false;
	has_been_merged: boolean = false;
	is_merged: boolean = false;
	connected_to_top: boolean = false;
	connected_to_bottom: boolean = false;
	connected_to_left: boolean = false;
	connected_to_right: boolean = false;
	should_connect_to_top: boolean = false;
	should_connect_to_bottom: boolean = false;
	should_connect_to_left: boolean = false;
	should_connect_to_right: boolean = false;
	unk5: boolean = false;
	flag_imperfect: boolean = false;
	flag_secondary_structure: boolean = false;
}

/**
 * A Tile is one individual square on the actual dungeon map.
 *
 * Most of its relevant properties are contained in TerrainFlags and SpawnFlags, which specify how the
 * tile operates and what it will look like.
 */
export class Tile {
	terrain_flags: TerrainFlags = new TerrainFlags();
	spawn_or_visibility_flags: SpawnFlags = new SpawnFlags(); // Technically context-dependent, but is always SpawnFlags for dungeon gen
	texture_id: number = 0;
	room_index: number = 0xff; // 0xFF = Not a room, 0xFE = hallway anchors (set to 0xFF later). Other values are room indexes

	//TODO: Investigate relevance of flags
	//walkable_neighbor_flags: boolean[];
}

/**
 * NA: Offset 0x286B2 on the Dungeon struct
 * Floor Properties defines many of the key properties for dungeon generation, such as
 * the type of layout, base number of rooms, and floor connectivity.
 *
 * It's worth noting that not all settings affecting dungeon generation are contained here, as
 * various other properties in Dungeon can also impact how the floor will generate.
 */
export class FloorProperties {
	layout: FloorLayout = FloorLayout.LAYOUT_SMALL;
	room_density: number = 4;
	floor_connectivity: number = 15;
	enemy_density: number = 0;
	kecleon_shop_chance: number = 0; //Percentage chance 0-100%
	monster_house_chance: number = 0; //Percentage chance 0-100%
	maze_room_chance: number = 0; //Percentage chance 0-100%
	allow_dead_ends: boolean = false;
	secondary_structures_budget: number = 0; //Maximum number of secondary structures that can be generated

	room_flags: RoomFlags = new RoomFlags();

	item_density: number = 0;
	trap_density: number = 0;
	//floor_number: number = 0;
	fixed_room_id: number = 0;
	num_extra_hallways: number = 0;
	buried_item_density: number = 0; //Density of buried items (in walls)
	secondary_terrain_density: number = 10; //Controls how much secondary terrain is spawned

	shop_item_positions: ShopItemPositions = ShopItemPositions.SHOP_POSITION_0; //0x18: Chance of an item spawning on each tile in a Kecleon shop

	itemless_monster_house_chance: number = 0; //Chance that a monster house will be itemless
	hidden_stairs_type: HiddenStairsType = HiddenStairsType.HIDDEN_STAIRS_NONE;
	hidden_stairs_spawn_chance: number = 0;
}

/**
 * NA: 0237CFBC
 * Floor Generation Status holds many of the runtime values for dungeon generation
 *
 * Generally, most of these values are copied from other existing data, but some like has_monster_house
 * do record information as generation progresses.
 */
export class FloorGenerationStatus {
	second_spawn: boolean = false; // 0x0
	has_monster_house: boolean = false; // 0x1: This floor has a monster house
	stairs_room_index: number = 0; // 0x2: The index of the room containing the stairs
	has_kecleon_shop: boolean = false; // 0x3: This floor has a Kecleon Shop
	has_chasms_as_secondary_terrain: boolean = false; // 0x4: Secondary Terrain Type is SECONDARY_TERRAIN_CHASM
	is_invalid: boolean = false; // 0x5: Set when floor generation fails (except that it's never actually set..?)
	floor_size: FloorSize = FloorSize.FLOOR_SIZE_LARGE; // 0x6
	has_maze: boolean = false; // 0x7: This floor has a maze room
	no_enemy_spawn: boolean = false; // 0x8: No enemies should spawn on this floor
	kecleon_shop_chance: number = 100; // 0xC
	monster_house_chance: number = 0; // 0x10
	num_rooms: number = 0; // 0x14: Number of rooms this floor should have
	secondary_structures_budget: number = 0; // 0x18

	//Location of the hidden stairs, -1 indicates no Hidden Stairs
	hidden_stairs_spawn_x: number = 0; // 0x1C
	hidden_stairs_spawn_y: number = 0; // 0x1E

	//Location of the middle of the kecleon shop, if applicable
	kecleon_shop_middle_x: number = 0; // 0x20
	kecleon_shop_middle_y: number = 0; // 0x22

	num_tiles_reachable_from_stairs: number = 0; // 0x24 Number of tiles reachable from the stairs assuming normal mobility
	layout: FloorLayout = FloorLayout.LAYOUT_LARGE; // 0x28
	hidden_stairs_type: HiddenStairsType = HiddenStairsType.HIDDEN_STAIRS_NONE; // 0x2C

	// The limits of the Kecleon Shop, if applicable
	kecleon_shop_min_x: number = 0; // 0x30
	kecleon_shop_min_y: number = 0; // 0x34
	kecleon_shop_max_x: number = 0; // 0x38
	kecleon_shop_max_y: number = 0; // 0x3C
}

/**
 * NA: 0x40C4 Offset on the Dungeon struct
 * Dungeon Generation Info provides additional information about dungeon generation
 * at runtime.
 */
export class DungeonGenerationInfo {
	force_create_monster_house: boolean = false; // 0x0
	locked_door_opened: boolean = false; // 0x1
	kecleon_shop_spawned: boolean = false; // 0x2
	monster_house_room: number = -1; // 0x5
	hidden_stairs_type: HiddenStairsType = HiddenStairsType.HIDDEN_STAIRS_NONE; // 0x8
	tileset_id: number = 0; //0x10
	fixed_room_id: number = 0; // 0x16
	floor_generation_attempts: number = 0; //0x1A
	player_spawn_x: number = -1; // 0x8C1C
	player_spawn_y: number = -1;
	stairs_spawn_x: number = -1; // 0x8C20
	stairs_spawn_y: number = -1;
	hidden_stairs_spawn_x: number = -1; // 0x8C24
	hidden_stairs_spawn_y: number = -1;
}

/**
 * NA: 02353538
 * Dungeon - Essentially the master class for just about all properties.
 *
 * Holds various key data, as well as the dungeon map: list_tiles
 */
export class Dungeon {
	shopkeeper_spawns: SpawnedShopkeeperData[] = new Array(8); // 0x5E0
	shopkeeper_spawn_count: number = 0; //0x610: Number of valid shopkeeper spawns

	id: number = 1; // 0x748: Current Dungeon ID
	floor: number = 1; // 0x749: Current floor number
	rescue_floor: number = 1; // 0x751
	nonstory_flag: boolean = true; // 0x75C
	mission_destination: MissionDestinationInfo = new MissionDestinationInfo(); //0x760
	enemy_density: number = 0; // 0x786
	dungeon_objective: DungeonObjectiveType = DungeonObjectiveType.OBJECTIVE_NORMAL; // 0x798
	dungeon_game_version_id: GameId = GameId.GAME_SKY; //0x7CC

	n_items: number = 0; // 0x3FC0 This number is generated, not a property
	field_0x3fc2: number = 0; // 0x3FC2
	field_0x3fc3: number = 0; // 0x3FC3
	traps: number[] = new Array(64); // 0x3FC4

	kecleon_shop_min_x: number = 0; // 0xCD14
	kecleon_shop_min_y: number = 0; // 0xCD18
	kecleon_shop_max_x: number = 0; // 0xCD1C
	kecleon_shop_max_y: number = 0; // 0xCD20
	fixed_room_tiles: Tile[][] = []; // 0xCD60

	list_tiles: Tile[][] = []; // 0xD2E4 This is the dungeon map

	boost_kecleon_shop_spawn_chance: boolean = false; // 0x12B24
	boost_hidden_stairs_spawn_chance: boolean = false; // 0x12B25

	guaranteed_item_id: number = 0; // 0x2C9E8
	n_floors_plus_one: number = 4; // 0x2CAF4: One more than the maximum number of floors in the current dungeon

	
}
