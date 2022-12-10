/**
 * Defines key constant values for floor generation, providing a way
 * to modify these constants if desired.
 */
export class GenerationConstants
{
	merge_rooms_chance: number = 5; // (0 to 100) probability to merge two rooms together
	no_imperfections_chance: number = 60; // (0 to 100) probability that a room will not have imperfections, if it was already flagged for them
	secondary_structure_flag_chance: number = 80; // (0 to 100) probability that a room will be flagged to have a secondary structure.
	max_number_monster_house_item_spawns: number = 7; //Maximum number of items allowed to be spawned in a monster house.
	max_number_monster_house_enemy_spawns: number = 30; //Maximum number of enemies allowed to be spawned in a monster house.
	first_dungeon_id_allow_monster_house_traps: number = 28; //The first story dungeon that allows traps in monster houses (Dark Hill by default)
}

/**
 * Defines advanced settings for applying patches or changes to the original dungeon algorithm implementation
 * 
 * These settings are all disabled by default for vanilla generation.
 */
export class AdvancedGenerationSettings
{
	/**
	 * In GenerateMazeRoom, one of the initial checks tests if the current number of
	 * floor generation attempts is below 0, which is an impossible condition.
	 * 
	 * This results in no maze rooms made of walls ever being generated in the vanilla game.
	 * (Water mazes can still be generated via secondary structures, they call a sub-function
	 * to generate the maze)
	 * 
	 * This patch overrides this check, allowing GenerateMazeRoom to continue and potentially
	 * generate a maze in this manner.
	 */
	allow_wall_maze_room_generation: boolean = false;

	/**
	 * In AssignGridCellConnections, the second half of the function is dedicated to
	 * removing dead ends from floor generation if specified in the floor's properties.
	 * 
	 * Part of this process is searching for grid cells with only one connection (a dead end),
	 * then seeing if there is another grid cell that is adjacent that we can connect to.
	 * 
	 * A bug appears in that all of the four validation checks to ensure the grid cell 
	 * in the specified direction is valid end up using the same offset, meaning 3 
	 * of them are checking the wrong grid cell.
	 * 
	 * This patch fixes these checks to ensure that the correct grid cell is checked in all
	 * directions.
	 */
	fix_dead_end_validation_error: boolean = false;

	/**
	 * In GenerateOuterRoomsFloor (a layout where there are exclusively rooms on the outer ring of the floor), 
	 * there is an error involved in building the connections between grid cells to create the ring
	 * of rooms.
	 * 
	 * This error results in the original implementation failing for grid_size_x <= 2, as one
	 * of the branches for assigning connections is never taken, and the other branch will not
	 * provide a backup connection.
	 * 
	 * There is also a minor issue involving top/bottom connections which results in hallways
	 * being connected from the bottom instead of from the top, but this does not affect the
	 * connectivity of the map.
	 * 
	 * This patch fixes the error and minor issues within the function, providing 
	 * consistently connected generation for all grid sizes.
	 */
	fix_generate_outer_rooms_floor_error: boolean = false;
}