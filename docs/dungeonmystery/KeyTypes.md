
## Tile

A `Tile` is one individual square on the actual dungeon map.

Tiles are primarily defined by their [`TerrainFlags`](dungeonmystery/MinorTypes.md#Terrain-Flags) and [`SpawnFlags`](dungeonmystery/MinorTypes.md#Spawn-Flags) These define characteristics such as whether the tile is open ground or a wall, whether it is located within a monster house, if the tile has an item, and much more.

**Properties**

- `terrain_flags: TerrainFlags` - Determines many aspects of tile behavior. See: [`TerrainFlags`](dungeonmystery/MinorTypes.md#Terrain-Flags)
- `spawn_or_visibility_flags: SpawnFlags` - Tracks the kinds of entities which should be spawned on this tile. See: [`SpawnFlags`](dungeonmystery/MinorTypes.md#Spawn-Flags)
- `texture_id: number` - The Texture ID used for this tile.
- `room_index: number` - Set to `0xFF` if this tile is not a room, `0xFE` if this tile is a Hallway Anchor, and all other values represent room indexes.

## Grid Cell

A `GridCell` refers to a single enclosed tile-space of the dungeon map.
In the algorithm, these are used to form a matrix of grid cells which represent the entire map.

Each individual grid cell can hold one room or hallway anchor (or nothing if its contents are deleted later in generation). Grid cells are an important level of abstraction above the [`Tile`](dungeonmystery/KeyTypes.md#Tile) space, though they aren't used once dungeon generation has finished.

**Properties**

- `start_x: number` - The starting X-coordinate (inclusive) for the rectangular room space this grid cell encapsulates.
- `start_y: number` - The starting Y-coordinate (inclusive) for the rectangular room space this grid cell encapsulates.
- `end_x: number` - The ending X-coordinate (exclusive) for the rectangular room space this grid cell encapsulates.
- `end_y: number` - The ending Y-coordinate (exclusive) for the rectangular room space this grid cell encapsulates.
- `is_invalid: boolean` - Set to `true` if this grid cell is not an active part of the dungeon space being used, either determined by `FloorSize` or by the `FloorLayout` generated.
- `has_secondary_structure: boolean` - Set to `true` if a Secondary Structure has been generated within this grid cell.
- `is_room: boolean` - Set to `true` if this grid cell contains a room.
- `is_connected: boolean` - Set to `true` if this grid cell is connected by a dungeon-logic hallway to at least one other adjacent grid cell.
- `is_kecleon_shop: boolean` - Set to `true` if this grid cell contains a Kecleon Shop.
- `is_monster_house: boolean` - Set to `true` if this grid cell contains a Monster House.
- `unk4: boolean` - Not fully understood field, appears to always be `false` and is present in certain grid cell condition checks.
- `is_maze_room: boolean` - Set to `true` if this grid cell contains a Maze Room, this includes both Wall Maze Rooms and the Secondary Structure.
- `has_been_merged: boolean` - Set to `true` if this grid cell contains part of a Merged Room and is the primary room in the merge.
- `is_merged: boolean` - Set to `true` if this grid cell contains part of a Merged Room.
- `connected_to_top: boolean` - Set to `true` if by dungeon-logic this grid cell connects to the grid cell above it.
- `connected_to_bottom: boolean` - Set to `true` if by dungeon-logic this grid cell connects to the grid cell below it.
- `connected_to_left: boolean` - Set to `true` if by dungeon-logic this grid cell connects to the grid cell to the left of it.
- `connected_to_right: boolean` - Set to `true` if by dungeon-logic this grid cell connects to the grid cell to the right of it.
- `should_connect_to_top: boolean` - Part of the "working" set of grid cell connections. Marks whether a grid cell is queued to have a connection made to the grid cell above it.
- `should_connect_to_bottom: boolean` - Part of the "working" set of grid cell connections. Marks whether a grid cell is queued to have a connection made to the grid cell below it.
- `should_connect_to_left: boolean` - Part of the "working" set of grid cell connections. Marks whether a grid cell is queued to have a connection made to the grid cell to the left of it.
- `should_connect_to_right: boolean` - Part of the "working" set of grid cell connections. Marks whether a grid cell is queued to have a connection made to the grid cell to the right of it.
- `flag_imperfect: boolean` - Set to `true` if this room is flagged to have Room Imperfections.
- `flag_secondary_structure: boolean` - Set to `true` if this room is flagged to have a Secondary Structure.

## Floor Properties

`FloorProperties` defines many of the key properties for dungeon generation, such as the type of layout, base number of rooms, and floor connectivity.

In conjunction with `Dungeon`, these form the entirety of the vanilla parameters used to define dungeon generation.

**Properties**

- `layout: FloorLayout` - The type of layout to be generated. See: [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout).
- `room_density: number` - The number of rooms to generate. If positive, `room_density + [0..2]` grid cells will become rooms. If negative, the number of rooms placed will be exactly `room_density`. The number of rooms assigned will always be at least `2` and no more than `36`.
- `floor_connectivity: number` - The number of dungeon-logic connection hallways to attempt to generate between rooms. These connections are built via a random walk roaming from a random grid cell.
- `enemy_density: number` - The number of enemies to spawn. If positive, the actual number spawned will vary between `enemy_density / 2` and `enemy_density`. If negative, the number of enemies spawned will be exactly `enemy_density`. At least one enemy will always be spawned.
- `kecleon_shop_chance: number` - The `[0, 100]` percentage chance for this floor to contain a Kecleon Shop.
- `monster_house_chance: number` - The `[0, 100]` percentage chance for this floor to contain a Monster House.
- `maze_room_chance: number` - The `[0, 100]` percentage chance for this floor to contain a Wall Maze Room.
- `allow_dead_ends: boolean` - If `true`, dungeon-logic connection hallways will be allowed to lead to dead ends (a room is not considered a dead end). If `false`, detected dead ends will try to be fixed by adding more connection hallways.
- `secondary_structures_budget: number` - The number of Secondary Structure rooms which can be generated. If floor generation fails at least once, Secondary Structures will be disabled for future generations.
- `room_flags: RoomFlags` - A 1-byte bitfield specifying properties about rooms. See: [`RoomFlags`](dungeonmystery/MinorTypes.md#Room-Flags).
- `item_density: number` - The number of items to spawn. The actual number spawned will vary between `item_density - 2` and `item_density + 2`. At least one item will always be spawned.
- `trap_density: number` - The number of traps to spawn. The actual number spawned will vary between `trap_density / 2` and `trap_density`. At most, `56` traps can spawn.
- `fixed_room_id: number` - If relevant, the associated Fixed Room ID for this floor. Given output will not contain the fixed room data, as this is not stored within dungeon-mystery.
- `num_extra_hallways: number` - The number of extra hallways to attempt to generate. These hallways consist of random momentum walks starting from a random room, stopping on open terrain, out of bounds, an impassable tile, or if it would result in a 2x2 open square (as this is a room).
- `buried_item_density: number` - The number of buried items to spawn. The actual number spawned will vary between `buried_item_density - 2` and `buried_item_density + 2`. If set to `0` or less, no buried items will be spawned.
- `secondary_terrain_density: number` - During Secondary Terrain generation, if enabled, determines the number of standalone lakes of secondary terrain to generate.
- `itemless_monster_house_chance: number` - The `[0, 100]` percentage chance for a monster house, if spawned, to contain no items or monster house-specific traps.
- `hidden_stairs_type: HiddenStairsType` - The kind of Hidden Stairs to spawn on this floor. See: [`HiddenStairsType`](dungeonmystery/Enums.md#Hidden-Stairs-Type).

## Floor Generation Status

`FloorGenerationStatus` holds many of the runtime values for dungeon generation.
For the most part, these values are copied from other existing data, but some values, such as whether the floor has a monster house, are recorded as generation progresses.

**Properties**

- `second_spawn: boolean` - Always `false` during the dungeon algorithm, but used in a conditional to determine if the Hidden Stairs spawn coordinates should go in `FloorGenerationStatus` or in [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info).
- `has_monster_house: boolean` - Set to `true` if the floor contains a Monster House.
- `stairs_room_index: number` - The room index of the normal stairs, or `0xFF` if the stairs haven't been spawned yet.
- `has_kecleon_shop: boolean` - Set to `true` if the floor contains a Kecleon Shop.
- `is_invalid: boolean` - Always `false` during the dungeon algorithm, but is used as a pre-check before doing layout validation.
- `floor_size: FloorSize` - The size of the floor being generated, derived from the [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout) being generated, see: [`FloorSize`](dungeonmystery/Enums.md#Floor-Size).
- `has_maze: boolean` - Set to `true` if the floor contains a maze room of any kind.
- `no_enemy_spawn: boolean` - Set to `true` if no enemies should initially spawn on the floor.
- `kecleon_shop_chance: number` - The `[0, 100]` percentage chance for this floor to contain a Kecleon Shop, copied from [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties).
- `monster_house_chance: number` - The `[0, 100]` percentage chance for this floor to contain a Monster House, copied from [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties).
- `num_rooms: number` - The number of rooms present on the floor.
- `secondary_structures_budget: number` - The number of remaining Secondary Structure rooms which can be generated. If floor generation fails at least once, Secondary Structures will be disabled for future generations. Copied from [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties).
- `hidden_stairs_spawn_x: number` - The X-coordinate for the location the hidden stairs will spawn, if present. Due to `second_spawn`, not actually set in favor of the variables in [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info).
- `hidden_stairs_spawn_y: number` - The Y-coordinate for the location the hidden stairs will spawn, if present. Due to `second_spawn`, not actually set in favor of the variables in [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info).
- `kecleon_shop_middle_x: number` - The middle X-coordinate for the Kecleon Shop, if present.
- `kecleon_shop_middle_y: number` - The middle Y-coordinate for the Kecleon Shop, if present.
- `num_tiles_reachable_from_stairs: number` - The number of tiles reachable from the stairs, assuming normal movement. Set during stairs validation.
- `layout: FloorLayout` - The type of layout to be generated, copied from [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties). See: [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout).
- `hidden_stairs_type: HiddenStairsType` - The kind of Hidden Stairs to spawn on this floor, copied from [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties). See: [`HiddenStairsType`](dungeonmystery/Enums.md#Hidden-Stairs-Type).
- `kecleon_shop_min_x: number` - The X-coordinate for the beginning of the room containing the Kecleon Shop, if present.
- `kecleon_shop_min_y: number` - The Y-coordinate for the beginning of the room containing the Kecleon Shop, if present.
- `kecleon_shop_max_x: number` - The X-coordinate for the end of the room containing the Kecleon Shop, if present.
- `kecleon_shop_max_y: number` - The Y-coordinate for the end of the room containing the Kecleon Shop, if present.

## Dungeon Generation Info

`DungeonGenerationInfo` provides additional runtime information about dungeon generation, such as the spawn locations of the player and the stairs.

**Properties**

- `force_create_monster_house: boolean` - Set to `true` if a Monster House must be spawned on this floor. This occurs for `FloorLayout.LAYOUT_ONE_ROOM_MONSTER_HOUSE`, `FloorLayout.LAYOUT_TWO_ROOMS_WITH_MONSTER_HOUSE`, and if generation fails 10 times.
- `monster_house_room: number` - The index of the room containing a Monster House, `-1` if none.
- `hidden_stairs_type: HiddenStairsType` - The type of Hidden Stairs spawned, only set if Hidden Stairs are actually spawned. See: [`HiddenStairsType`](dungeonmystery/Enums.md#Hidden-Stairs-Type).
- `fixed_room_id: number` - If relevant, the associated Fixed Room ID for this floor, copied from [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties).
- `floor_generation_attempts: number` - The number of floor generation attempts. If this reaches `10`, we give up and spawn a One Room Monster House.
- `player_spawn_x: number` - The X-coordinate for the location the player will spawn.
- `player_spawn_y: number` - The Y-coordinate for the location the player will spawn.
- `stairs_spawn_x: number` - The X-coordinate for the location the stairs will spawn.
- `stairs_spawn_y: number` - The Y-coordinate for the location the stairs will spawn.
- `hidden_stairs_spawn_x: number` - The X-coordinate for the location the hidden stairs will spawn, if present.
- `hidden_stairs_spawn_y: number` - The Y-coordinate for the location the hidden stairs will spawn, if present.

## Dungeon

`Dungeon` holds one of the most important properties of all, `list_tiles`, the dungeon map. It also holds the remaining floor generation properties such as the dungeon's ID, the floor we're on, and information about the type of dungeon we're in.

**Properties**

- `id: number` - The ID of the dungeon we are currently in. Relevant to determine if we are far enough in the game for a monster house in story mode to spawn with traps inside.
- `floor: number` - The floor number of the dungeon we are in. This is used to determine if we are on a rescue floor, or if we are on the last floor of the dungeon.
- `rescue_floor: number` - If `dungeon_objective` is set as `OBJECTIVE_RESCUE`, the objective floor of the rescuer. A rescue floor will not spawn kecleon shops or regular monster houses, but forces the normal stairs room to become a monster house.
- `nonstory_flag: boolean` - Set to `true` if we are not doing this dungeon as part of the story. If `true`, traps will always be allowed to spawn in monster houses. If `false`, traps can only spawn in monster houses if we're in Dungeon ID `28` (Dark Hill) or later. 
- `mission_destination: MissionDestinationInfo` - Gives details about the destination of a mission. See: [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info).
- `dungeon_objective: DungeonObjectiveType` - The objective of the dungeon we are in. See: [`DungeonObjectiveType`](dungeonmystery/Enums.md#Dungeon-Objective-Type).
- `kecleon_shop_min_x: number` - The X-coordinate for the start of the Kecleon Shop.
- `kecleon_shop_min_y: number` - The Y-coordinate for the start of the Kecleon Shop.
- `kecleon_shop_max_x: number` - The X-coordinate for the end of the Kecleon Shop.
- `kecleon_shop_max_y: number` - The Y-coordinate for the end of the Kecleon Shop.
- `num_items: number` - The number of items which were spawned on the floor.
- `guaranteed_item_id: number` - The ID of an item guaranteed to spawn on the floor, if relevant.
- `n_floors_plus_one: number` - One greater than the maximum number of floors in the current dungeon.
- `list_tiles: Tile[][]` - The dungeon map, a `56` by `32` matrix of tiles. See: [`Tile`](dungeonmystery/KeyTypes.md#Tile).

