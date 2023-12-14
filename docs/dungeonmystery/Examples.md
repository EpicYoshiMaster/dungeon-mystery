## Basic Usage

```js
import { GenerateDungeon, Dungeon, FloorProperties, CreateMapString } from 'dungeon-mystery'

const dungeon_map = GenerateDungeon(new FloorProperties(), new Dungeon());

console.log(CreateMapString(dungeon_map));
```

This is the most basic usage of features in dungeon-mystery and encompasses all of the things you'll need to know about if you only plan to work with vanilla-esque generations.

This code snippet generates a floor, then prints out the result. I wouldn't really recommend actually using the default settings for [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties) and [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon) as is done here, but at the very least it will work! There are plenty of properties to explore and mess around with to produce various kinds of generations.

**Links**

- [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties)
- [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon)
- [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon)
- [`CreateMapString`](dungeonmystery/Functions.md#Create-Map-String)

**Example Output**

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X P P P - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X I - - P P P X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X = X - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - P - - - - - - - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - P - - - - - - - - - - - X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - P - - - - - - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - P - - - - - - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - P P P P P P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - P - - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X X X X X - - - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X X X X X P P P - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X X X X X - - P - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X X X X X - - P - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X X X X X - - P P P P P P P P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - X M X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

## Generating a Beach Cave Floor

```js
import { GenerateDungeon, Dungeon, FloorProperties, CreateMapString, FloorLayout, HiddenStairsType, DungeonObjectiveType } from 'dungeon-mystery'

let floor_props = new FloorProperties();
floor_props.layout = FloorLayout.LAYOUT_SMALL;
floor_props.room_density = 5;
floor_props.floor_connectivity = 15;
floor_props.enemy_density = 4;
floor_props.kecleon_shop_chance = 0;
floor_props.monster_house_chance = 0;
floor_props.maze_room_chance = 0;
floor_props.allow_dead_ends = false;
floor_props.room_flags.f_secondary_terrain_generation = true;
floor_props.room_flags.f_room_imperfections = false;
floor_props.item_density = 1;
floor_props.trap_density = 3;
floor_props.num_extra_hallways = 5;
floor_props.buried_item_density = 0;
floor_props.secondary_terrain_density = 0;
floor_props.itemless_monster_house_chance = 0;
floor_props.hidden_stairs_type = HiddenStairsType.HIDDEN_STAIRS_NONE;
floor_props.hidden_stairs_spawn_chance = 0;

let dungeon = new Dungeon();
dungeon.id = 1;
dungeon.floor = 1;
dungeon.nonstory_flag = false;
dungeon.dungeon_objective = DungeonObjectiveType.OBJECTIVE_STORY;

const dungeon_map = GenerateDungeon(floor_props, dungeon);

console.log(CreateMapString(dungeon_map));
```

Here's an example using the settings for the first floor of Beach Cave!

**Links**

- [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties)
- [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout)
- [`HiddenStairsType`](dungeonmystery/Enums.md#Hidden-Stairs-Type)
- [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon)
- [`DungeonObjectiveType`](dungeonmystery/Enums.md#Dungeon-Objective-Type)
- [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon)
- [`CreateMapString`](dungeonmystery/Functions.md#Create-Map-String)

**Example Output**

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - P P P P P P X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - P - - - - - X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P P P P P P P P P P P - - - - - X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P - - - - v v v v v v - - - - - X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P - - - v v v v v v v - - - - - X = I X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P - - - - v v v v v v v - - - - X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P - - - - v v v v v v v - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P - - - v - v v v v v v - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - P P P P - - - v v v v v - - - - - P P P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - P - - - - - - - v - - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - P - - - - - - - v v v v v v v - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - P - - - - - - - - - X X X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - P - - - - - - - - - X X X X X I X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - P - - - - - - - - - X X X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - X X X X T X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - X X X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - P P P X X X X X X X X I - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - P - - X X X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - P - - X M X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X M X - - P - - X X X X X X X X X - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X P P P - - - - - - - - - v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - M X X X X X X X X - - - - - - - - v v v v v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - X X X X X X X X X - - - - - - - - v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

```

## Full Generation Customization

```js
import { GenerateDungeon, Dungeon, FloorProperties, GenerationConstants, AdvancedGenerationSettings, CreateMapString, FloorLayout } from 'dungeon-mystery'

let floor_props = new FloorProperties();
floor_props.layout = FloorLayout.LAYOUT_LARGE;
floor_props.room_density = 6;
floor_props.item_density = 5;
floor_props.buried_item_density = 10;
floor_props.enemy_density = 10;
floor_props.trap_density = 5;
floor_props.floor_connectivity = 15;
floor_props.num_extra_hallways = 10;
floor_props.kecleon_shop_chance = 20;
floor_props.monster_house_chance = 20;
floor_props.room_flags.f_secondary_terrain_generation = true;
floor_props.secondary_terrain_density = 5;
floor_props.secondary_structures_budget = 5;
floor_props.maze_room_chance = 100;

let dungeon = new Dungeon();

let generation_constants = new GenerationConstants();
generation_constants.merge_rooms_chance = 50;

let advanced_generation_settings = new AdvancedGenerationSettings();
advanced_generation_settings.allow_wall_maze_room_generation = true;

const dungeon_map = GenerateDungeon(floor_props, dungeon, generation_constants, advanced_generation_settings);

console.log(CreateMapString(dungeon_map));
```

Here's a slightly more complex example which uses everything involved in the generation process. 

This example is designed around highlighting merged rooms by increasing their odds beyond normal, and allowing maze rooms composed of walls to have a good chance of generating as well.

**Links**

- [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties)
- [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout)
- [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon)
- [`GenerationConstants`](dungeonmystery/Settings.md#Generation-Constants)
- [`AdvancedGenerationSettings`](dungeonmystery/Settings.md#Advanced-Generation-Settings)
- [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon)
- [`CreateMapString`](dungeonmystery/Functions.md#Create-Map-String)

**Example Output**

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X X M - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - P P P P P X X X X X X X X X X - - - - - -
- - - - - - - P P P P P P P P P P P P P P P P P P P P P P P P P P P P P - - - - X X I X X X X X X X - - - - - -
- - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X M X - - - - - -
- - - - - - - P - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X X X - - - - - -
- - - - - - - P - v - v - v - - - - - - - - - - - - - - - - - - - - - - - - - - X X I X I X X X X X - - - - - -
- - - - - - - P - v v v - - - v v - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X X X - - - - - -
- - - - - P P P - - v v - - - v - - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X X X - - - - - -
- - - - - P - - - v v v v - - - - - - - - - - - - - - - - - - - - - - - - - - - X X I X X X X X X X v v v v v -
- - - - - P - - - v v - - v - - v - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X X X v v v v v -
- - - X - X X X - X - v - - - v - - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X T X X - v v v v -
- - - = - - - X - X v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - X X X X X X X X X X - - v - v -
- - - X X X - X - X P P P P P P P P P P P P P P P P P P P - - - - - - - - - - - X X M X X X X X X X - v v - v -
- - - X - - - X - X - - - - - - - - - - - - - - - - - - P - v v v - v - - - - - X X X X X X X X X X - - v - - -
- - - X X X X X X X - - - - - - - - - - - - - - - - - - P v v v v v v - - v - - X X X I X X X X X X v - v - - -
- - - - - - - - P - - - - - - - - - - - - - - - - - - - P - v v - - - - - - - v X X X X T X X X X X - - - - - -
- - - - - - - - P - - - - - - - - - - - - - - - - - - - P - - v v - - - - - - v - - - v v P - - - - - - - - - -
- - - - - - - P P - - - - - - - - - - - - - P P P P P P P - v - v - - - - - - v v - P P P P P P - - - - - - - -
- - - - - - - P - - - - - - - - - - - - - - P - - - - - - v - - v - - - - - - v v - P v - P - P - - - - - - - -
- - - - - - - P - - - - - - - - - - - - - - P - - - - - v v - - - v v - - - v v v v P v v P - P - - - - - - - -
- - X X X X X X X - - - - - - - - - - - - - P - - - - - - v - - - - - - - - v v v X X X X X X X X T - - - - - -
- - X X M X X X X - - - - - - - - - - - - X X X X X - - - - - - - - - - - - - v - X X v v v v X X X - - - - - -
- - v v v v v v v - - - - - - - - - - - - X K K K X - - - - - - - - - P P P P P P X X v T I v X X M - - - - - -
- - X X X X X X X P P P P P P P P P P P P X K K K X P P P P P P P P P P - - - - - X X v I I v X X X - - - - - -
- - M X X X X X X - - - - - - - - - - - - X K K K X - - v v - v - v - v - - - - - X X v v v v X X X - - - - - -
- - - - - - - - - - - - - - - - - - - - - X X X X X - - v - - - - v v v - - - - - X X X X X M X X X - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - v v v v v v v - - - - - - - v - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - v v v v v - - - - - - - - v - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - v v v v v - - - - - - - v - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

## Using a Dungeon Generation Callback

```js
import { GenerateDungeon, Dungeon, FloorProperties, CreateMapString, FloorLayout, GenerationStepLevel, GenerationType, DungeonGenerationInfo, FloorGenerationStatus, MajorGenerationType } from 'dungeon-mystery'

function DungeonGenerationCallbackFunction(
	generation_step_level: GenerationStepLevel,
	generation_type: GenerationType,
	dungeon_data: Dungeon, 
	dungeon_generation_info: DungeonGenerationInfo, 
	floor_generation_status: FloorGenerationStatus, 
	grid_cell_start_x: number[],
	grid_cell_start_y: number[])
{
	console.log("Generation Step: " + GenerationStepLevel[generation_step_level] + ", " + MajorGenerationType[generation_type]);
	console.log(CreateMapString(dungeon_data.list_tiles, grid_cell_start_x, grid_cell_start_y));
	console.log("");
}

let floor_props = new FloorProperties();
floor_props.layout = FloorLayout.LAYOUT_BEETLE;
floor_props.item_density = 10;
floor_props.enemy_density = 10;
floor_props.num_extra_hallways = 10;

let dungeon = new Dungeon();

GenerateDungeon(floor_props, dungeon, undefined, undefined, DungeonGenerationCallbackFunction, GenerationStepLevel.GEN_STEP_MAJOR);
```

Here's an example of using a [`DungeonGenerationCallback`](dungeonmystery/Functions.md#Dungeon-Generation-Callback). 
This is incredibly useful if you need to collect information as each step of the dungeon algorithm is completed.

In combination with the data provided into [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon), this gives you access to all information relating to the current dungeon algorithm state.
Note that when using the callback, the map now needs to be accessed through [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon) in `list_tiles`, which is where it is actually stored.

**Links**

- [`DungeonGenerationCallback`](dungeonmystery/Functions.md#Dungeon-Generation-Callback)
- [`GenerationStepLevel`](dungeonmystery/Enums.md#Generation-Step-Level)
- [`GenerationType`](dungeonmystery/Enums.md#Generation-Type)
- [`MajorGenerationType`](dungeonmystery/Enums.md#Major-Generation-Type)
- [`DungeonGenerationInfo`](dungeonmystery/KeyTypes.md#Dungeon-Generation-Info)
- [`FloorGenerationStatus`](dungeonmystery/KeyTypes.md#Floor-Generation-Status)
- [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties)
- [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout)
- [`Dungeon`](dungeonmystery/KeyTypes.md#Dungeon)
- [`GenerateDungeon`](dungeonmystery/Functions.md#Generate-Dungeon)
- [`CreateMapString`](dungeonmystery/Functions.md#Create-Map-String)

**Example Output**
```
Generation Step: GEN_STEP_MAJOR, GEN_TYPE_RESET_FLOOR
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_INIT_DUNGEON_GRID
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_CREATE_ROOMS_AND_ANCHORS
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_CREATE_GRID_CELL_CONNECTIONS
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P P P P P X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - - - - - X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - - - - - X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - - X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P P P P X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - - - - X X X X X X X P P P P \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - P P P P P X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - - - - X X X X X X X - - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X - - - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X - - - - P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X P P P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_MERGE_ROOM_VERTICALLY
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X - - P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_GENERATE_EXTRA_HALLWAYS
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X P P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - - P - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ P \ \ P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ P P P P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X - - P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P P P P P P P X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_SPAWN_NON_ENEMIES
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X I X X P P P \ - - - - - X X X X X X X X I X X - - \ \ - - - X X X X I X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X I X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X I X X X - - \ \ - - - X X X X X P P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X = X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - - P - - P - - \ \ - - - - - X X X I X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ P \ \ P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ P P P P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X P P P \ - - - I X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X - - P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P P P P P P P X X X X X X X X X X X P P P \ - - - X X X X X X I - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X I I X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_MAJOR, GEN_TYPE_SPAWN_ENEMIES
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X I X X P P P \ - - - - - X X X X X X X X I X X - - \ \ - - - X X X X I X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X M X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X I X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X M X X X I X X X - - \ \ - - - X X X X X P P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X M X = X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X M X X X X X X X X X - - P P P P P X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X M X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X M - - - - - \ \ - - - - -
- - - - \ \ - - P - - P - - \ \ - - - - - X X X I X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ P \ \ P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ P P P P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X M X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X P P P \ - - - I X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X M X X X X X X X - - P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P P P P P P P X X X X X X X X X X X P P P \ - - - X X X X X X I - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X I I X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -


Generation Step: GEN_STEP_COMPLETE, GEN_TYPE_GENERATE_FLOOR
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - X X I X X P P P \ - - - - - X X X X X X X X I X X - - \ \ - - - X X X X I X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X M X X X X X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \ \ X X X X X X X I X X X \ \ \ \ \ \ \ \ \ \ \ \ \ P \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - P - - - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X M X X X I X X X - - \ \ - - - X X X X X P P - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P P P P P P P X X X X X X M X = X X - - \ \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X P P P \ - - - X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X M X X X X X X X X X - - P P P P P X X X X X - - - - - \ \ - - - - -
- - - - \ \ - X X M X X - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - X X X X M - - - - - \ \ - - - - -
- - - - \ \ - - P - - P - - \ \ - - - - - X X X I X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ P \ \ P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ P P P P \ \ \ \ \ \ \ \ \ X X X X X X X X X X X \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X X X X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - P - - \ \ - - - - - X X X X X M X X X X X - - \ \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X X X X X X X P P P \ - - - I X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P \ - - - - - X X X X X X X X X X X - - P P P P P X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X - - P \ - - - - - X X X M X X X X X X X - - P \ - - - X X X X X X X - - - \ \ - - - - -
- - - - \ \ - X X X X X P P P P P P P P P X X X X X X X X X X X P P P \ - - - X X X X X X I - - - \ \ - - - - -
- - - - \ \ - X X X X X - - \ \ - - - - - X X X X X I I X X X X - - \ \ - - - - - - - - - - - - - \ \ - - - - -
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \
- - - - \ \ - - - - - - - - \ \ - - - - - - - - - - - - - - - - - - \ \ - - - - - - - - - - - - - \ \ - - - - -
```