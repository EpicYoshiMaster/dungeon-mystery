
## Generate Dungeon

`GenerateDungeon` is the entry function into creating your very own dungeons! At a minimum, you'll need [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties) to define the primary characteristics of generation, such as the type of layout, number of rooms, floor connectivity, and much more. You'll also need [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon) which gives insight into the overall context of the floor being generated, such as the dungeon ID, the floor we're on, if we're doing a mission, etc. 

For greater control, you can use [`GenerationConstants`](dungeonmystery/Settings.md#Generation-Constants) to alter some of the constant values present in the algorithm, such as the probability of merging two rooms together. You can also use [`AdvancedGenerationSettings`](dungeonmystery/Settings.md#Advanced-Generation-Settings) to apply patches to obscure bugs. 

Perhaps most interesting, [`DungeonGenerationCallback`](dungeonmystery/Functions.md#Dungeon-Generation-Callback) allows you to get step-by-step callbacks as the dungeon algorithm progresses, depending on the [`GenerationStepLevel`](dungeonmystery/Enums.md#Generation-Step-Level) you provide. 

**Arguments**
- `floor_props: FloorProperties` - Required. See: [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties).
- `dungeon_data: Dungeon` - Required. See: [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon).
- `generation_constants?: GenerationConstants` - Optional. See: [`GenerationConstants`](dungeonmystery/Settings.md#Generation-Constants).
- `advanced_generation_settings?: AdvancedGenerationSettings` - Optional. See: [`AdvancedGenerationSettings`](dungeonmystery/Settings.md#Advanced-Generation-Settings).
- `dungeon_generation_callback?: DungeonGenerationCallback` - Optional. See: [`DungeonGenerationCallback`](dungeonmystery/Functions.md#Dungeon-Generation-Callback).
- `generation_callback_frequency?: GenerationStepLevel` - Optional. See: [`GenerationStepLevel`](dungeonmystery/Enums.md#Generation-Step-Level).

**Return Type**

- `Tile[][]` - The dungeon map, a `56x32` grid of [`Tile`](dungeonmystery/KeyTypes.md#Tile).

## Dungeon Generation Callback

`DungeonGenerationCallback` provides a mechanism for obtaining step-by-step callbacks in tandem with a [`GenerationStepLevel`](dungeonmystery/Enums.md#Generation-Step-Level) when provided in [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon). It includes all relevant information from the dungeon algorithm, except information that was already provided when [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon) was originally called. The data provided is not a separate copy, and should be considered as read-only so as to not interfere with the algorithm.

**Expected Arguments**

- `generation_step_level: GenerationStepLevel` - The significance level of the callback event produced. See: [`GenerationStepLevel`](dungeonmystery/Enums.md#Generation-Step-Level).
- `generation_type: GenerationType` - The specific generation event which occurred. See: [`GenerationType`](dungeonmystery/Enums.md#Generation-Type).
- `dungeon_data: Dungeon` - Contains the map as `dungeon_data.list_tiles`, updates over the course of the algorithm from the values initially given (this is a separate copy from the one in [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon)). See: [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon).
- `dungeon_generation_info: DungeonGenerationInfo` - See: [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info).
- `floor_generation_status: FloorGenerationStatus` - See: [`FloorGenerationStatus`](dungeonmystery/KeyTypes.md#Floor-Generation-Status).
- `grid_cell_start_x: number[]` -
- `grid_cell_start_y: number[]` -

**Return Type**

- `void` - No value should be returned.

## Create Map String

`CreateMapString` is a utility function designed to make a quick display output for a dungeon map, handy for testing.

**Arguments**

- `map: Tile[][]` - The dungeon map, expected to be a `56x32` grid. See: [`Tile`](dungeonmystery/KeyTypes.md#Tile).
- `list_x?: number[]` - A list of the x-indices for the beginning coordinate of each grid cell, this is equivalent to `grid_cell_start_x` in [`DungeonGenerationCallback`](dungeonmystery/Functions.md#Dungeon-Generation-Callback).
- `list_y?: number[]` - A list of the y-indices for the beginning coordinate of each grid cell, this is equivalent to `grid_cell_start_x` in [`DungeonGenerationCallback`](dungeonmystery/Functions.md#Dungeon-Generation-Callback).

**Return Type**

- `string` - A string containing an ASCII Art-like representation of the overall map.