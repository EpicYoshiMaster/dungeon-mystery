# dungeon-mystery

[![npm](https://img.shields.io/npm/v/dungeon-mystery)](https://www.npmjs.com/package/dungeon-mystery)

![dungeon-mystery512x487](https://github.com/EpicYoshiMaster/dungeon-mystery/assets/32598419/8aeb7f74-c97d-473b-943a-115f4c83e015)

Logo by [@sgtmug](https://twitter.com/sergeantmug)
 
dungeon-mystery is a Typescript implementation of Pokémon Mystery Dungeon: Explorers of Sky's dungeon algorithm.

This package is the main code behind [Pokémon Dungeoneer](https://github.com/EpicYoshiMaster/pokemon-dungeoneer), a web tool for generating and visualizing PMD layouts.

It's built to replicate the original algorithm as closely as possible, while also being much more readable and useful as a reference.

This package features:

- Fully commented functions with address references for the NA version of Explorers of Sky
- Complete map generation, returning all relevant data associated with the map as used in the game.

## Installation

```bash
npm install dungeon-mystery
```

## Usage

dungeon-mystery is designed to offer a high level of control over as many aspects of generation as possible, with a focus on giving back a lot of information and letting you decide what to do with it.

The primary function provided is `GenerateDungeon`, which produces and returns a floor layout `Tile[][]`.


### If you just want something that will work and print something meaningful, here's all you'll need:

```js
import { GenerateDungeon, Dungeon, FloorProperties, CreateMapString } from 'dungeon-mystery'

const dungeon_map = GenerateDungeon(new FloorProperties(), new Dungeon());

console.log(CreateMapString(dungeon_map));
```

`FloorProperties` specifies many of the most important factors for floor generation. 

`Dungeon` specifies lesser but still relevant information about where we are in the game and what we're doing.

`CreateMapString` returns a simplified text-based representation of the map.

I wouldn't really recommend using the default settings provided, but you can if you want!


### Getting more control over the algorithm:
```js
import { GenerateDungeon, Dungeon, FloorProperties, GenerationConstants, AdvancedGenerationSettings, CreateMapString, FloorLayout } from 'dungeon-mystery'

let floor_props = new FloorProperties();
floor_props.layout = FloorLayout.LAYOUT_OUTER_ROOMS;

let dungeon = new Dungeon();
dungeon.nonstory_flag = true;

let generation_constants = new GenerationConstants();
generation_constants.merge_rooms_chance = 50;

let advanced_generation_settings = new AdvancedGenerationSettings();
advanced_generation_settings.fix_generate_outer_rooms_floor_error = true;

const dungeon_map = GenerateDungeon(floor_props, dungeon, generation_constants, advanced_generation_settings);

console.log(CreateMapString(dungeon_map));
```
If your goal is only to generate a final layout, these are all of the relevant classes you'll want to look at to configure the output.

`GenerationConstants` defines several important constant values and chances that are used but would otherwise be unchangeable. The default settings are the vanilla probabilities, you can use this to change these.

`AdvancedGenerationSettings` defines patches and other advanced settings which can be applied to the algorithm. This includes bug fixes to issues found in the original implementation. By default, all patches will be disabled to give vanilla generation.

### Getting detailed step-based generation information:
```js
import { GenerateDungeon, Dungeon, FloorProperties, GenerationConstants, AdvancedGenerationSettings, CreateMapString, FloorLayout, GenerationStepLevel, GenerationType, DungeonGenerationInfo, FloorGenerationStatus, MajorGenerationType, MinorGenerationType, } from 'dungeon-mystery'

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
floor_props.layout = FloorLayout.LAYOUT_OUTER_ROOMS;

let dungeon = new Dungeon();
dungeon.nonstory_flag = true;

let generation_constants = new GenerationConstants();
generation_constants.merge_rooms_chance = 50;

let advanced_generation_settings = new AdvancedGenerationSettings();
advanced_generation_settings.fix_generate_outer_rooms_floor_error = true;

GenerateDungeon(floor_props, dungeon, generation_constants, advanced_generation_settings, DungeonGenerationCallbackFunction, GenerationStepLevel.GEN_STEP_MAJOR);
```
This is where you're given the real power. You can provide a callback function as the 5th parameter, which will be called with basically all relevant generation information present in the algorithm.

`DungeonGenerationCallback` receives several calls as the algorithm progresses depending on the callback frequency set. This can be used to display step-by-step information on what's happening in the algorithm at key points.

`GenerationStepLevel` specifies the minimum significance level of events to be sent to the callback function. 
- `GEN_STEP_COMPLETE` will only return the final output
- `GEN_STEP_MAJOR` returns the essential major events that define the layout (and the final output)
- `GEN_STEP_MINOR` includes all of the previous calls as well as each minor step involved

**In the callback function:**

`generation_step_level` is the significance level of the event being called

`generation_type` specifies what the actual event was that occurred.

`dungeon_data` is a copy of the `Dungeon` which was passed in originally (but several properties can be changed over the course of the algorithm so it's included)

`dungeon_generation_info` defines run-time overall status of properties of the floor being generated

`floor_generation_status` is similar to `dungeon_generation_info` but includes information mostly derived from `FloorProperties`

`grid_cell_start_x` and `grid_cell_start_y` are arrays of numbers defining the row and column indices which start each Grid Cell space.

## Documentation

Detailed documentation is coming soon!

## License

[GNU GPL v3](LICENSE)

## Sources

This project could not exist without the amazing work by members of the community who have researched and documented the map generation process extensively.

[pmdsky-debug](https://github.com/UsernameFodder/pmdsky-debug) - Central resource for debugging information to reverse engineer Explorers of Sky

[dungeon-eos](https://github.com/SkyTemple/dungeon-eos) - Python implementation of the dungeon algorithm used as part of [SkyTemple](https://skytemple.org/)

[Map generation](https://docs.google.com/document/d/1HuJIEOtTYCtSHK6R-sp4LC2gk1RDL_mfoFL6Qn_wdkE/edit) - Document by End45 detailing the map generation process

[Dungeon data](https://docs.google.com/document/d/1UfiFz4xAPtGd-1X2JNE0Jy2z-BLkze1PE4Fo9u-QeYo/edit) - Document by End45 detailing how dungeon-related data is organized and structured
