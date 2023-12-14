
## Floor Layout

`FloorLayout` is an enum contained within [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties) which designates the type of generator to use for dungeon generation. The 3 primary standard generators `LAYOUT_SMALL`, `LAYOUT_MEDIUM`, and `LAYOUT_LARGE` designate using a percentage of the total floor space (50%, 75%, and 100% respectively). There are also special generators, which can create unique shapes and patterns by marking particular grid cells to be rooms or hallways.

**Values**

- `LAYOUT_LARGE` - A standard generator which uses the full floor space available.
- `LAYOUT_SMALL` - A standard generator which uses the left-most 50% of the available floor space. Generates with grid dimensions of either `4x2` or `4x3`.
- `LAYOUT_ONE_ROOM_MONSTER_HOUSE` - A special generator which makes a single, full-floor sized room which is forced to be a Monster House. This layout is used as a failsafe in the event generation fails 10 times in either stage.
- `LAYOUT_OUTER_RING` - A special generator which produces a ring of hallways around the outside of the map, with 8 rooms in its interior.
- `LAYOUT_CROSSROADS` - A special generator which places 10 rooms in a ring around the outside, excluding corners, with 6 cells of hallway connections on the inside.
- `LAYOUT_TWO_ROOMS_WITH_MONSTER_HOUSE` - A special generator which generates two large rooms connected by a single hallway. One of the rooms is forced to be a Monster House.
- `LAYOUT_LINE` - A special generator which produces a horizontal line of 5 rooms on the upper half of the map.
- `LAYOUT_CROSS` - A special generator which produces a central room with 4 cardinally connected adjacent rooms, forming the shape of a cross or plus sign.
- `LAYOUT_LARGE_0x8` - A standard generator which functions the same as `LAYOUT_LARGE` but restricts the maximum grid size to at most `5x4`.
- `LAYOUT_BEETLE` - A special generator which produces a large, vertically merged room which is connected to 3 rooms on either side, forming a shape similar to a beetle.
- `LAYOUT_OUTER_ROOMS` - A special generator which produces a full ring of rooms around the outside of the floor.
- `LAYOUT_MEDIUM` - A standard generator which uses the left-most 75% of the available floor space. Generates with grid dimensions of either `4x2` or `4x3`.
- `LAYOUT_UNUSED_0xC` - An unused generator. If selected, will default to generating a `LAYOUT_LARGE`.
- `LAYOUT_UNUSED_0xD` - An unused generator. If selected, will default to generating a `LAYOUT_LARGE`.
- `LAYOUT_UNUSED_0xE` - An unused generator. If selected, will default to generating a `LAYOUT_LARGE`.
- `LAYOUT_UNUSED_0xF` - An unused generator. If selected, will default to generating a `LAYOUT_LARGE`.

## Terrain Type

`TerrainType` is an enum contained within [`TerrainFlags`](dungeonmystery/MinorTypes.md#Terrain-Flags), as part of [`Tile`](dungeonmystery/KeyTypes.md#Tile). It determines the type of terrain present on the tile, whether it be a wall, open ground, water or lava, or a chasm tile.

**Values**

- `TERRAIN_WALL` - This tile is a wall.
- `TERRAIN_NORMAL` - This tile is open terrain.
- `TERRAIN_SECONDARY` - This tile is secondary terrain, like water or lava.
- `TERRAIN_CHASM` - This tile is an open chasm.

## Secondary Terrain Type

`SecondaryTerrainType` is an enum specific to [`SECONDARY_TERRAIN_TYPES`](dungeonmystery/Constants.md#Secondary-Terrain-Types). It is used to determine whether a dungeon has water, lava, or chasms as its secondary terrain.

**Values**

- `SECONDARY_TERRAIN_WATER` - This dungeon features water for its secondary terrain.
- `SECONDARY_TERRAIN_LAVA` - This dungeon features lava for its secondary terrain.
- `SECONDARY_TERRAIN_CHASM` - This dungeon features chasms for its secondary terrain.

## Dungeon Objective Type

`DungeonObjectiveType` is an enum contained within [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon). It determines the goal of the dungeon being played, and is relevant in dungeon generation if the player is on a rescue floor, forcing the stairs room to be a Monster House.

**Values**

- `OBJECTIVE_STORY` - This dungeon is being visited as part of the story.
- `OBJECTIVE_NORMAL` - This dungeon is being played outside of story mode.
- `OBJECTIVE_RESCUE` - This dungeon is being played to rescue another player.
- `OBJECTIVE_UNK_GAMEMODE_5` - Unknown gamemode.

## Mission Type

`MissionType` is an enum contained within [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info), as part of [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon). It determines the overall category of the mission, such as rescuing a client, finding or delivering an item, or arresting an outlaw. Some mission types require a [`MissionSubtype`](dungeonmystery/Enums.md#Mission-Subtype), which subcategorizes the specific mission type with further details.

**Values**

- `MISSION_RESCUE_CLIENT`
- `MISSION_RESCUE_TARGET`
- `MISSION_ESCORT_TO_TARGET`
- `MISSION_EXPLORE_WITH_CLIENT` - Requires a subtype. See: [`MissionSubtypeExplore`](dungeonmystery/Enums.md#Mission-Subtype-Explore).
- `MISSION_PROSPECT_WITH_CLIENT`
- `MISSION_GUIDE_CLIENT`
- `MISSION_FIND_ITEM`
- `MISSION_DELIVER_ITEM`
- `MISSION_SEARCH_FOR_TARGET`
- `MISSION_TAKE_ITEM_FROM_OUTLAW` - Requires a subtype. See: [`MissionSubtypeTakeItem`](dungeonmystery/Enums.md#Mission-Subtype-Take-Item).
- `MISSION_ARREST_OUTLAW` - Requires a subtype. See: [`MissionSubtypeOutlaw`](dungeonmystery/Enums.md#Mission-Subtype-Outlaw).
- `MISSION_CHALLENGE_REQUEST` - Requires a subtype. See: [`MissionSubtypeChallenge`](dungeonmystery/Enums.md#Mission-Subtype-Challenge).
- `MISSION_TREASURE_MEMO`

## Mission Subtype

`MissionSubtype` is an enum contained within [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info), as part of [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon). It defines further subcategories for specific values of [`MissionType`](dungeonmystery/Enums.md#Mission-Type). These subcategories specify things like the opponent for a challenge letter, the type of exploration, or the variety of outlaw encountered.

**Definition**

```js
export type MissionSubtype = MissionSubtypeChallenge | MissionSubtypeExplore | MissionSubtypeOutlaw | MissionSubtypeTakeItem;
```

### Mission Subtype Challenge

`MissionSubtypeChallenge`, as part of [`MissionSubtype`](dungeonmystery/Enums.md#Mission-Subtype), provides subcategories when the value of [`MissionType`](dungeonmystery/Enums.md#Mission-Type) is set to `MISSION_CHALLENGE_REQUEST` in [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info). It specifies the opponent of the challenge letter mission.

**Values**

- `MISSION_CHALLENGE_NORMAL`
- `MISSION_CHALLENGE_MEWTWO`
- `MISSION_CHALLENGE_ENTEI`
- `MISSION_CHALLENGE_RAIKOU`
- `MISSION_CHALLENGE_SUICUNE`
- `MISSION_CHALLENGE_JIRACHI`

###  Mission Subtype Explore

`MissionSubtypeExplore`, as part of [`MissionSubtype`](dungeonmystery/Enums.md#Mission-Subtype), provides subcategories when the value of [`MissionType`](dungeonmystery/Enums.md#Mission-Type) is set to `MISSION_EXPLORE_WITH_CLIENT` in [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info). It specifies the goal of the exploration mission.

**Values**

- `MISSION_EXPLORE_NORMAL`
- `MISSION_EXPLORE_SEALED_CHAMBER`
- `MISSION_EXPLORE_GOLDEN_CHAMBER`
- `MISSION_EXPLORE_NEW_DUNGEON`

### Mission Subtype Outlaw

`MissionSubtypeOutlaw`, as part of [`MissionSubtype`](dungeonmystery/Enums.md#Mission-Subtype), provides subcategories when the value of [`MissionType`](dungeonmystery/Enums.md#Mission-Type) is set to `MISSION_ARREST_OUTLAW` in [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info). It specifies the kind of outlaw encountered.

**Values**

- `MISSION_OUTLAW_NORMAL_0`
- `MISSION_OUTLAW_NORMAL_1`
- `MISSION_OUTLAW_NORMAL_2`
- `MISSION_OUTLAW_NORMAL_3`
- `MISSION_OUTLAW_ESCORT`
- `MISSION_OUTLAW_FLEEING`
- `MISSION_OUTLAW_HIDEOUT`
- `MISSION_OUTLAW_MONSTER_HOUSE`

### Mission Subtype Take Item

`MissionSubtypeTakeItem`, as part of [`MissionSubtype`](dungeonmystery/Enums.md#Mission-Subtype), provides subcategories when the value of [`MissionType`](dungeonmystery/Enums.md#Mission-Type) is set to `MISSION_TAKE_ITEM_FROM_OUTLAW` in [`MissionDestinationInfo`](dungeonmystery/MinorTypes.md#Mission-Destination-Info). It specifies the kind of outlaw encountered.

**Values**

- `MISSION_TAKE_ITEM_NORMAL_OUTLAW`
- `MISSION_TAKE_ITEM_HIDDEN_OUTLAW`
- `MISSION_TAKE_ITEM_FLEEING_OUTLAW`

## Floor Size

`FloorSize` is an enum contained within [`FloorGenerationStatus`](dungeonmystery/KeyTypes.md#Floor-Generation-Status). It is derived based on the value of [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout) and determines the percentage of the total floor space to be used for generation.

**Values**

- `FLOOR_SIZE_LARGE` - The entire floor space will be used for generation. This is the default and is used for most layouts.
- `FLOOR_SIZE_SMALL` - Only the left-most 50% of the space will be used for generation. This is set when [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout) has the value `LAYOUT_SMALL`.
- `FLOOR_SIZE_MEDIUM` - Only the left-most 75% of the space will be used for generation. This is set when [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout) has the value `LAYOUT_MEDIUM`.

## Hidden Stairs Type

`HiddenStairsType` is an enum contained within [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties). It specifies the kind of hidden stairs to be spawned on the floor, if any at all.

**Values**

- `HIDDEN_STAIRS_NONE` - No hidden stairs should spawn on the floor.
- `HIDDEN_STAIRS_SECRET_BAZAAR` - Hidden stairs to a secret bazaar should spawn on the floor.
- `HIDDEN_STAIRS_SECRET_ROOM` - Hidden stairs to a secret room should spawn on the floor.
- `HIDDEN_STAIRS_RANDOM_SECRET_BAZAAR_OR_SECRET_ROOM` - Hidden stairs should spawn, either randomly to a secret bazaar or a secret room. This has value `255`.

## Floor Type

`FloorType` is an enum derived from values contained in [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon) and [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info). 

**Values**

- `FLOOR_TYPE_NORMAL` - The current floor is a normal floor.
- `FLOOR_TYPE_FIXED` - The current floor is a fixed floor room. This is set if [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info) has `fixed_room_id` of a value `> 0` and `<= 0x6e`.
- `FLOOR_TYPE_RESCUE` - The current floor is a rescue floor. This is set if [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon) has [`DungeonObjectiveType`](dungeonmystery/Enums.md#Dungeon-Objective-Type) set to `OBJECTIVE_RESCUE` and our `floor` currently matches `rescue_floor`.

## Direction ID

`DirectionId` is an enum able to be used for 8-directional code. Though this is true, the dungeon algorithm actually typically uses it as 4-directional branching code when generating extra hallways.

**Values**

- `DIR_NONE` - Uses value `4294967295`.
- `DIR_DOWN` - Uses value `0`.
- `DIR_DOWN_RIGHT` - Uses value `1`.
- `DIR_RIGHT` - Uses value `2`.
- `DIR_UP_RIGHT` - Uses value `3`.
- `DIR_UP` - Uses value `4`.
- `DIR_UP_LEFT` - Uses value `5`.
- `DIR_LEFT` - Uses value `6`.
- `DIR_DOWN_LEFT` - Uses value `7`.
- `DIR_CURRENT` - Uses value `8`. Refers to the current direction of an entity, needed for special functions but isn't relevant for dungeon generation.

## Cardinal Direction

`CardinalDirection` is a helper type used to help distinguish 4-directional branching code in the dungeon algorithm and replace number values with concrete directions. 

**Values**

- `DIR_RIGHT`
- `DIR_UP`
- `DIR_LEFT`
- `DIR_DOWN`

## Secondary Structure Type

`SecondaryStructureType` is a helper type used to make explicit the possible secondary structures which can be randomly rolled to generate in the dungeon algorithm.

**Values**

- `SECONDARY_STRUCTURE_NONE` - No secondary structure will be generated.
- `SECONDARY_STRUCTURE_MAZE_PLUS_DOT` - One of 3 secondary structures depending on the dimensions of the room. If the room has odd dimensions, the result is a maze room. Otherwise, if the room has dimensions of at least `5x5`, a cross or plus pattern is made instead. If both fail, a single tile of secondary terrain will be placed in the center of the room.
- `SECONDARY_STRUCTURE_CHECKERBOARD` - If the room has odd dimensions, a checkerboard pattern made of randomly placed diagonal stripes of secondary terrain will be generated. If not, no secondary structure will be generated.
- `SECONDARY_STRUCTURE_POOL` - If the room has dimensions of at least `5x5`, a rectangular pool of secondary terrain will be generated. If not, no secondary structure will be generated.
- `SECONDARY_STRUCTURE_ISLAND` - If the room has dimensions of at least `6x6`, an island of items and a warp tile surrounded by secondary terrain will be generated. If not, no secondary structure will be generated.
- `SECONDARY_STRUCTURE_DIVIDER` - A "divider" of secondary terrain will split the room in half randomly either horizontally or vertically.

## Generation Step Level

`GenerationStepLevel` is used to specify the lowest significance level on events to accept for a `DungeonGenerationCallback`. A lower significance level means more event callbacks, this is useful to specify if you have a particular use case for dungeon-mystery that may not need every event.

**Values**

- `GEN_STEP_COMPLETE` - The callback function will only receive an event when the full floor has completed generation.
- `GEN_STEP_MAJOR` - The callback function will receive events when a major generation function has been completed or used. This also includes events from the above level. See: [`MajorGenerationType`](dungeonmystery/Enums.md#Major-Generation-Type).
- `GEN_STEP_MINOR` - The callback function will receive events when a minor generation step has been completed or used. This also includes events from the above level. See: [`MinorGenerationType`](dungeonmystery/Enums.md#Minor-Generation-Type).

## Generation Type

`GenerationType` is used to describe key events in the dungeon generation process when used with a `DungeonGenerationCallback`. [`MajorGenerationType`](dungeonmystery/Enums.md#Major-Generation-Type) is used for when full stages of the dungeon algorithm are completed, such as the placement of all rooms and anchors or placing all of the item spawn locations. [`MinorGenerationType`](dungeonmystery/Enums.md#Minor-Generation-Type) is used for smaller events, like placing a single room or hallway.

**Definition**

```js
export type GenerationType = MajorGenerationType | MinorGenerationType;
```

### Major Generation Type

`MajorGenerationType` describes full stage events of the dungeon algorithm and, as part of [`GenerationType`](dungeonmystery/Enums.md#Generation-Type) is relevant for `DungeonGenerationCallback` events. Major events generally refer to the completion of dungeon algorithm functions. Some examples include the creation of all rooms and hallway anchors, placing hallways between grid cells, generating a maze room, kecleon shop, or monster house, and more as seen below. Events should not be expected and are not all guaranteed to occur, for example, the probability chance for a kecleon shop may fail so a floor may not generate one and the `GEN_TYPE_GENERATE_KECLEON_SHOP` event will not be fired. Events may occur multiple times if a floor fails generation and needs to reset the floor, beginning the process all over again.

**Values**

- `GEN_TYPE_RESET_FLOOR` - The floor has been fully reset with an empty dungeon map.
- `GEN_TYPE_INIT_DUNGEON_GRID` - The dungeon grid has been inialized with a set of grid cell dimensions.
- `GEN_TYPE_CREATE_ROOMS_AND_ANCHORS` - All rooms and hallway anchors have been placed.
- `GEN_TYPE_CREATE_GRID_CELL_CONNECTIONS` - All hallway connections between grid cells have been placed, this step also includes potentially merging rooms together.
- `GEN_TYPE_ENSURE_CONNECTED_GRID` - If an unconnected grid cell was found, placed extra connections or removed rooms or hallway anchors as needed to fix the connectivity issues. 
- `GEN_TYPE_GENERATE_MAZE_ROOM` - Completed generation of a wall maze room on this floor.
- `GEN_TYPE_GENERATE_KECLEON_SHOP` - Completed generation of a kecleon shop on this floor.
- `GEN_TYPE_GENERATE_MONSTER_HOUSE` - Completed generation of a monster house on this floor.
- `GEN_TYPE_GENERATE_EXTRA_HALLWAYS` - If specified, all extra hallways have been placed on this floor.
- `GEN_TYPE_GENERATE_ROOM_IMPERFECTIONS` - If specified, all room imperfections have been performed on this floor.
- `GEN_TYPE_GENERATE_SECONDARY_STRUCTURES` - If specified, all secondary structures have been placed on this floor.
- `GEN_TYPE_ONE_ROOM_MONSTER_HOUSE_FLOOR` - A One Room Monster House floor has finished being set up. This layout does not use the core generation functions and instead manually sets up the floor.
- `GEN_TYPE_OUTER_RING_FLOOR` - An Outer Ring floor has finished being set up. This layout does not use the core generation functions and instead manually sets up the floor.
- `GEN_TYPE_CROSSROADS_FLOOR` - A Crossroads floor has finished being set up. This layout does not use the core generation functions and instead manually sets up the floor.
- `GEN_TYPE_TWO_ROOMS_WITH_MONSTER_HOUSE_FLOOR` - A Two Rooms with Monster House floor has finished being set up. This layout does not use the core generation functions and instead manually sets up the floor.
- `GEN_TYPE_MERGE_ROOM_VERTICALLY` - Finished merging the middle column of rooms for the Beetle layout.
- `GEN_TYPE_GENERATE_SECONDARY_TERRAIN` - Completed generation of all secondary terrain on this floor.
- `GEN_TYPE_SPAWN_NON_ENEMIES` - Completed placement of all non-enemy entities including the stairs, items, buried items, traps, and the player.
- `GEN_TYPE_SPAWN_ENEMIES` - Completed placement of all enemies on the floor.
- `GEN_TYPE_GENERATE_FLOOR` - Finished the dungeon generation process and completed the floor!

### Minor Generation Type

`MinorGenerationType` describes small-scale events of the dungeon algorithm and, as part of [`GenerationType`](dungeonmystery/Enums.md#Generation-Type) is relevant for `DungeonGenerationCallback` events. Minor events generally refer to steps in the middle of dungeon algorithm functions. Some examples include placing a single room or hallway anchor, making a hallway, adding imperfections to a single room, and more as seen below. These events have the ability to occur many times within one major generation step, may not occur at all, or may be repeated if the floor fails generation.

**Values**

- `GEN_TYPE_CREATE_ROOM` - A new room has been placed on the floor.
- `GEN_TYPE_CREATE_ANCHOR` - A new hallway anchor has been placed on the floor.
- `GEN_TYPE_CREATE_HALLWAY` - A new hallway has been placed on the floor.
- `GEN_TYPE_MERGE_ROOM` - Two rooms have been merged together.
- `GEN_TYPE_ENSURE_CONNECTED_HALLWAY` - A new hallway has been placed to assist in connecting unconnected grid cells.
- `GEN_TYPE_REMOVE_UNCONNECTED_ANCHOR` - A hallway anchor has been removed as it was not connected to other grid cells earlier.
- `GEN_TYPE_REMOVE_UNCONNECTED_ROOM` - A room has been removed as attempts to re-connect it failed.
- `GEN_TYPE_GENERATE_EXTRA_HALLWAY` - An extra hallway has been placed on the floor.
- `GEN_TYPE_GENERATE_ROOM_IMPERFECTION` - Imperfections for one room have been placed on the floor.
- `GEN_TYPE_GENERATE_SECONDARY_STRUCTURE` - A secondary structure for a room has been placed on the floor.
- `GEN_TYPE_MERGE_ROOM_VERTICALLY` - Two rooms in the Beetle layout have been vertically merged together.
- `GEN_TYPE_SECONDARY_TERRAIN_RIVER` - A river of secondary terrain has been placed on the floor.
- `GEN_TYPE_SECONDARY_TERRAIN_RIVER_LAKE` - A lake along the river has been placed on the floor.
- `GEN_TYPE_SECONDARY_TERRAIN_STANDALONE_LAKE` - A separate lake has been placed randomly on the floor.
- `GEN_TYPE_SPAWN_STAIRS` - The stairs have been spawned.
- `GEN_TYPE_SPAWN_ITEMS` - Items have finished spawning.
- `GEN_TYPE_SPAWN_BURIED_ITEMS` - Buried items have finished spawning.
- `GEN_TYPE_SPAWN_MONSTER_HOUSE_ITEMS_TRAPS` - The items and traps in a monster house have finished spawning.
- `GEN_TYPE_SPAWN_TRAPS` - Traps have finished spawning.
- `GEN_TYPE_SPAWN_PLAYER` - The player's spawn has been placed.
- `GEN_TYPE_SPAWN_NON_MONSTER_HOUSE_ENEMIES` - Enemies not part of a monster house have been placed.
- `GEN_TYPE_SPAWN_MONSTER_HOUSE_EXTRA_ENEMIES` - Additional enemies which are part of a forced monster house spawn have been placed.
