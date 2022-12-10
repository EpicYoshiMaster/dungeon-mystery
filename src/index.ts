import { GenerateDungeon } from "./dungeon";
import { FloorProperties, Dungeon } from "./key_types";
import { GenerationConstants, AdvancedGenerationSettings } from "./settings";
import { FloorLayout } from "./enums";

function Run()
{
	let floor_props = new FloorProperties();
	let dungeon = new Dungeon();
	let generation_constants = new GenerationConstants();
	let advanced_generation_settings = new AdvancedGenerationSettings();

	floor_props.layout = FloorLayout.LAYOUT_LARGE;
	floor_props.floor_connectivity = 15;
	floor_props.num_extra_hallways = 0;
	floor_props.room_density = 5;
	floor_props.allow_dead_ends = false;
	floor_props.secondary_structures_budget = 0;
	floor_props.kecleon_shop_chance = 0;
	floor_props.monster_house_chance = 100;
	floor_props.item_density = 10;
	floor_props.trap_density = 10;
	floor_props.buried_item_density = 10;
	floor_props.enemy_density = 10;
	floor_props.room_flags.f_secondary_structures = true;
	floor_props.room_flags.f_room_imperfections = true; //!!
	floor_props.secondary_terrain_density = 3;

	dungeon.id = 1; // Beach Cave
	dungeon.floor = 1;
	dungeon.nonstory_flag = false;
	dungeon.n_floors_plus_one = 5;

	generation_constants.merge_rooms_chance = 100;
	generation_constants.no_imperfections_chance = 0;

	GenerateDungeon(floor_props, dungeon, generation_constants, advanced_generation_settings);
	//PrintMap();
}

Run();