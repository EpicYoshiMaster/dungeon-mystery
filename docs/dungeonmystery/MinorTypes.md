
## Room Flags

`RoomFlags` is a 1-byte bitfield within [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties) which specifies whether rooms are allowed to generate secondary terrain, and whether rooms imperfections are permitted. 

Additional flag variables are present internally, but they appear to be unused, at least within known code.

**Properties**

- `f_secondary_terrain_generation: boolean` - Is secondary terrain generation allowed?
- `f_room_imperfections: boolean` - Are room imperfections allowed?

## Terrain Flags

`TerrainFlags` is a 2-byte bitfield within [`Tile`](dungeonmystery/KeyTypes.md#Tile) which determines some of the underlying behaviors of the tile.

**Properties**

- `terrain_type: TerrainType` - The kind of Terrain that on this tile (ex. Open, Wall, Secondary Terrain, or a Chasm). See: [`TerrainType`](dungeonmystery/Enums.md#Terrain-Type).
- `f_corner_cuttable: boolean` - Whether this tile can be corner-cut when walking. Seemingly only used during dungeon generation.
- `f_natural_junction: boolean` - Used by AI for navigation. This is `true` for room tiles directly next to a hallway and branching points within corridors.
- `f_impassable_wall: boolean` - An impassable tile even with Absolute Mover or the Mobile Scarf. This is `true` for things like map border tiles, key chamber walls, walls in boss battle rooms, etc.
- `f_in_kecleon_shop: boolean` - Whether this tile is located inside a Kecleon Shop.
- `f_in_monster_house: boolean` - Whether this tile is located inside a Monster House.
- `f_unbreakable: boolean` - This tile cannot be broken by Absolute Mover. This is set to `true` for key doors.
- `f_stairs: boolean` - This tile is some kind of "stairs" (Normal Stairs, Hidden Stairs, Warp Zone).
- `f_unreachable_from_stairs: boolean` - This tile is open terrain but unreachable from the stairs spawn point. Used during dungeon generation validity checks.

## Spawn Flags

`SpawnFlags` is a 2-byte bitfield within [`Tile`](dungeonmystery/KeyTypes.md#Tile) which keeps track of the kinds of entities which should be spawned here.

**Properties**

- `f_stairs: boolean` - This tile has the stairs.
- `f_item: boolean` - This tile has an item on it.
- `f_trap: boolean` - This tile has a trap on it.
- `f_monster: boolean` - This tile has a monster on it.
- `f_special_tile: boolean` - This is a special tile, such as for Kecleon Shops, items, and traps.
- `spawn_flags_field_0x5: boolean` - Not fully understood field relating to Secondary Structures. Set to `true` for all tiles in secondary structure rooms except for Cross or Dot rooms.
- `spawn_flags_field_0x6: boolean` - Not fully understood field. In the dungeon algorithm, it is set to `true` on a Warp tile.
- `spawn_flags_field_0x7: boolean` - Not fully understood field. In the dungeon algorithm, it is set to `true` for all tiles in a Divider secondary structure room.

## Mission Destination Info

`MissionDestinationInfo` gives information about the destination of a mission (this may be surprising). 

**Properties**

- `is_destination_floor: boolean` - Set to `true` if the current floor we're on is a mission destination.
- `mission_type: MissionType` - Determines the primary class of mission, such as rescuing a client, finding an item, etc. See: [`MissionType`](dungeonmystery/Enums.md#Mission-Type).
- `mission_subtype: MissionSubtype` - Depending on the `MissionType`, determines more specific details about the mission. See: [`MissionSubtype`](dungeonmystery/Enums.md#Mission-Subtype).

## Stairs Reachable Flags

`StairsReachableFlags` is used during validation checks to determine if all walkable tiles are reachable from the stairs tile.

**Properties**

- `f_cannot_corner_cut: boolean` - Set to `true` for non-open terrain tiles which have `f_corner_cuttable` in their [`TerrainFlags`](dungeonmystery/MinorTypes.md#Terrain-Flags) as `false`.
- `f_secondary_terrain_cannot_corner_cut: boolean` - Set to `true` for secondary terrain tiles which have `f_corner_cuttable` in their [`TerrainFlags`](dungeonmystery/MinorTypes.md#Terrain-Flags) as `false`.
- `f_unknown_field_0x2: boolean` - Not fully understood field. Is tested in relation to corners, but appears to never be set to `true`.
- `f_starting_point: boolean` - Determines the starting point for graph traversal, set to `true` on the Stairs tile.
- `f_in_visit_queue: boolean` - Set to `true` for tiles which are currently queued to be visited.
- `f_visited: boolean` - Set to `true` for tiles which have been visited.