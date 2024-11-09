import * as Constants from './constants';
import {
	FloorLayout,
	TerrainType,
	DungeonObjectiveType,
	MissionType,
	MissionSubtype,
	MissionSubtypeOutlaw,
	FloorSize,
	FloorType,
	DirectionId,
	CardinalDirection,
	SecondaryStructureType,
	HiddenStairsType,
	GenerationStepLevel,
	GenerationType,
	MajorGenerationType,
	MinorGenerationType,
} from './enums';
import { GridCell, Tile, FloorProperties, FloorGenerationStatus, Dungeon, DungeonGenerationInfo } from './key_types';
import { RoomFlags, StairsReachableFlags } from './minor_types';
import { DungeonRandom } from './random';
import { GenerationConstants, AdvancedGenerationSettings } from './settings';

const FLOOR_MAX_X = 56;
const FLOOR_MAX_Y = 32;
const DEFAULT_MAX_POSITION = 9999; //NA: 0233FF98
const DEFAULT_TILE = new Tile();

//
//Globals
//
let dungeonData: Dungeon;
let dungeonGenerationInfo: DungeonGenerationInfo;
let statusData: FloorGenerationStatus;
let dungeonRand: DungeonRandom;
let generationConstants: GenerationConstants;
let advancedGenerationSettings: AdvancedGenerationSettings;
let grid_cell_start_x: number[] = [];
let grid_cell_start_y: number[] = [];

let dungeonGenerationCallback: DungeonGenerationCallback;
let generationCallbackFrequency: GenerationStepLevel;

export type DungeonGenerationCallback = (
	generation_step_level: GenerationStepLevel,
	generation_type: GenerationType,
	dungeon_data: Dungeon,
	dungeon_generation_info: DungeonGenerationInfo,
	floor_generation_status: FloorGenerationStatus,
	grid_cell_start_x: number[],
	grid_cell_start_y: number[]
) => void;

/**
 * NA: 02340CAC
 * PosIsOutOfBounds - Checks if a position is out of bounds on the map.
 */
function PosIsOutOfBounds(x: number, y: number) {
	return x < 0 || x >= FLOOR_MAX_X || y < 0 || y >= FLOOR_MAX_Y;
}

/**
 * NA: 02340B0C
 * ResetFloor - Resets the floor in preparation for a floor generation attempt.
 *
 * Resets all tiles, ensures the border is impassable, and clears entity spawns.
 */
function ResetFloor() {
	dungeonData.list_tiles = new Array(FLOOR_MAX_X);

	//Reset Room Tiles
	for (let x = 0; x < FLOOR_MAX_X; x++) {
		dungeonData.list_tiles[x] = new Array(FLOOR_MAX_Y);

		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			dungeonData.list_tiles[x][y] = new Tile();

			if (
				PosIsOutOfBounds(x - 1, y) ||
				PosIsOutOfBounds(x, y - 1) ||
				PosIsOutOfBounds(x + 1, y) ||
				PosIsOutOfBounds(x, y + 1) ||
				PosIsOutOfBounds(x - 1, y - 1) ||
				PosIsOutOfBounds(x - 1, y + 1) ||
				PosIsOutOfBounds(x + 1, y - 1) ||
				PosIsOutOfBounds(x + 1, y + 1)
			) {
				dungeonData.list_tiles[x][y].terrain_flags.f_impassable_wall = true;
			}
		}
	}

	//Reset Stairs Position
	dungeonGenerationInfo.stairs_spawn_x = -1;
	dungeonGenerationInfo.stairs_spawn_y = -1;

	dungeonData.fixed_room_tiles = new Array(8);

	//Reset Fixed Room Tiles
	for (let x = 0; x < 8; x++) {
		dungeonData.fixed_room_tiles[x] = new Array(8);

		for (let y = 0; y < 8; y++) {
			dungeonData.fixed_room_tiles[x][y] = new Tile();
		}
	}

	dungeonData.num_items = 0;

	//Reset Traps
	dungeonData.active_traps = Array(64);

	grid_cell_start_x = [];
	grid_cell_start_y = [];
	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_RESET_FLOOR);
}

/**
 * NA: 0233CF84
 * GetGridPositions - Determines the starting positions of grid cells based on the given floor grid dimensions
 *
 * Returns:
 * list_x: Starting x coordinates for each grid column
 * list_y: Starting y coordinates for each grid row
 */
function GetGridPositions(grid_size_x: number, grid_size_y: number) {
	let sum_x = 0,
		sum_y = 0;
	let list_x: number[] = [],
		list_y: number[] = [];

	//<= is intentional here
	for (let x = 0; x <= grid_size_x; x++) {
		list_x.push(sum_x);
		sum_x += Math.floor(FLOOR_MAX_X / grid_size_x); //This is our grid step size
	}

	for (let y = 0; y <= grid_size_y; y++) {
		list_y.push(sum_y);
		sum_y += Math.floor(FLOOR_MAX_Y / grid_size_y);
	}

	return { list_x, list_y };
}

/**
 * NA: 0233D004
 * InitDungeonGrid - Initializes the default state of the dungeon grid
 *
 * The dungeon grid is an array of grid cells stored in column-major order
 * (to give contiguous storage to cells with the same x value), with a fixed column size of 15.
 *
 * Returns: initialized dungeon grid
 */
function InitDungeonGrid(grid_size_x: number, grid_size_y: number) {
	let grid: GridCell[][] = Array(15);

	for (let x = 0; x < 15; x++) {
		grid[x] = Array(15);

		for (let y = 0; y < 15; y++) {
			grid[x][y] = new GridCell();
		}
	}

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			if (statusData.floor_size === FloorSize.FLOOR_SIZE_SMALL && x >= Math.floor(grid_size_x / 2)) {
				grid[x][y].is_invalid = true;
			} else if (statusData.floor_size === FloorSize.FLOOR_SIZE_MEDIUM && x >= Math.floor((3 * grid_size_x) / 4)) {
				grid[x][y].is_invalid = true;
			} else {
				grid[x][y].is_invalid = false;
			}

			grid[x][y].is_room = true;
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_INIT_DUNGEON_GRID);

	return grid;
}

/**
 * NA: 0233D104
 * AssignRooms - Randomly selects a subset of grid cells to become rooms
 *
 * If number_of_rooms is positive, number_of_rooms + [0..2] will become rooms
 * If the selected cells for rooms are invalid, less rooms will be generated.
 * The number of rooms assigned will always be at least 2 and always <= 36.
 *
 * Any cells which aren't marked as rooms will become hallway anchors (those single 1x1 "rooms")
 * which will be connected as hallways later, to "anchor" hallway generation
 *
 * Primarily Modifies: grid to assign certain grid cells to have is_room true.
 */
function AssignRooms(grid: GridCell[][], grid_size_x: number, grid_size_y: number, number_of_rooms: number) {
	let extraRooms = dungeonRand.RandInt(3);

	//A negative # for room count requests an exact number of rooms
	if (number_of_rooms < 0) {
		number_of_rooms = -number_of_rooms;
	} else {
		number_of_rooms += extraRooms;
	}

	let random_room_bits: boolean[] = Array(256);

	for (let i = 0; i < number_of_rooms; i++) {
		random_room_bits[i] = true;
	}

	//Shuffle around the acceptable rooms
	const max_rooms = grid_size_x * grid_size_y;

	for (let x = 0; x < 64; x++) {
		let a = dungeonRand.RandInt(max_rooms);
		let b = dungeonRand.RandInt(max_rooms);

		let temp = random_room_bits[a];
		random_room_bits[a] = random_room_bits[b];
		random_room_bits[b] = temp;
	}

	statusData.num_rooms = 0;

	let odd_x = grid_size_x % 2;
	let counter = 0;

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			if (grid[x][y].is_invalid) continue;

			//There are too many rooms, remove
			if (statusData.num_rooms >= 32) {
				grid[x][y].is_room = false;
			}

			// Using the randomly shuffled bits, create or remove the room
			if (random_room_bits[counter]) {
				grid[x][y].is_room = true;
				statusData.num_rooms++;

				// Don't make a room at (x_mid, 1)
				if (odd_x !== 0 && y === 1 && x === Math.floor((grid_size_x - 1) / 2)) {
					grid[x][y].is_room = false;
				}
			} else {
				grid[x][y].is_room = false;
			}

			counter++;
		}
	}

	// We have at least 2 rooms, we're done.
	if (statusData.num_rooms >= 2) return;

	let attempts = 0;
	let enoughRooms = false;

	while (attempts < 200 && !enoughRooms) {
		for (let x = 0; x < grid_size_x; x++) {
			for (let y = 0; y < grid_size_y; y++) {
				if (grid[x][y].is_invalid) continue;

				if (dungeonRand.RandInt(100) < 60) {
					grid[x][y].is_room = true;
					enoughRooms = true;
					break;
				}
			}

			if (enoughRooms) break;
		}

		attempts++;
	}

	statusData.second_spawn = false;
}

/**
 * NA: 0233D318
 * CreateRoomsAndAnchors - Creates the rectangle regions of open terrain for each room
 * leaving a margin relative to the border
 *
 * If the room is an anchor, a single tile is placed with a hallway indicator for later.
 */
function CreateRoomsAndAnchors(grid: GridCell[][], grid_size_x: number, grid_size_y: number, list_x: number[], list_y: number[], room_flags: RoomFlags) {
	let room_number = 0;

	for (let y = 0; y < grid_size_y; y++) {
		const cur_val_y = list_y[y];
		const next_val_y = list_y[y + 1];

		for (let x = 0; x < grid_size_x; x++) {
			const cur_val_x = list_x[x];
			const next_val_x = list_x[x + 1];
			const range_x = next_val_x - cur_val_x - 4;
			const range_y = next_val_y - cur_val_y - 3;

			if (grid[x][y].is_invalid) continue;

			if (!grid[x][y].is_room) {
				//This cell is not a room, create a 1x1 hallway anchor

				let unk_x1 = 2;
				let unk_x2 = 4;

				if (x === 0) {
					unk_x1 = 1;
				}

				if (x === grid_size_x - 1) {
					unk_x2 = 2;
				}

				let unk_y1 = 2;
				let unk_y2 = 4;

				if (y === 0) {
					unk_y1 = 1;
				}

				if (y === grid_size_y - 1) {
					unk_y2 = 2;
				}

				const pt_x = dungeonRand.RandRange(cur_val_x + 2 + unk_x1, cur_val_x + 2 + range_x - unk_x2);
				const pt_y = dungeonRand.RandRange(cur_val_y + 2 + unk_y1, cur_val_y + 2 + range_y - unk_y2);

				grid[x][y].start_x = pt_x;
				grid[x][y].start_y = pt_y;
				grid[x][y].end_x = pt_x + 1;
				grid[x][y].end_y = pt_y + 1;

				//Flag the tile as open to serve as a hallway anchor
				dungeonData.list_tiles[pt_x][pt_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;

				//Set the room index to 0xFE for anchor
				dungeonData.list_tiles[pt_x][pt_y].room_index = 0xfe;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ANCHOR);
			} else {
				//This cell is a room!
				let room_size_x = dungeonRand.RandRange(5, range_x);
				let room_size_y = dungeonRand.RandRange(4, range_y);

				//Force small rooms to have odd-numbered dimensions (?)
				if ((room_size_x | 1) < range_x) {
					room_size_x |= 1;
				}

				if ((room_size_y | 1) < range_y) {
					room_size_y |= 1;
				}

				//Aspect ratio 2/3 < x/y < 3/2
				if (room_size_x > Math.floor((room_size_y * 3) / 2)) {
					room_size_x = Math.floor((room_size_y * 3) / 2);
				}

				if (room_size_y > Math.floor((room_size_x * 3) / 2)) {
					room_size_y = Math.floor((room_size_x * 3) / 2);
				}

				const start_x = dungeonRand.RandInt(range_x - room_size_x) + cur_val_x + 2;
				const end_x = start_x + room_size_x;

				const start_y = dungeonRand.RandInt(range_y - room_size_y) + cur_val_y + 2;
				const end_y = start_y + room_size_y;

				//Create the room!
				grid[x][y].start_x = start_x;
				grid[x][y].start_y = start_y;
				grid[x][y].end_x = end_x;
				grid[x][y].end_y = end_y;

				for (let room_x = start_x; room_x < end_x; room_x++) {
					for (let room_y = start_y; room_y < end_y; room_y++) {
						dungeonData.list_tiles[room_x][room_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;

						dungeonData.list_tiles[room_x][room_y].room_index = room_number;
					}
				}

				//Randomly flag the room for a secondary structure
				let flag_secondary = dungeonRand.RandInt(100) < generationConstants.secondary_structure_flag_chance;
				if (statusData.secondary_structures_budget === 0) {
					flag_secondary = false;
				}

				//Flag for imperfections if needed
				let flag_imp = room_flags.f_room_imperfections;

				if (flag_secondary && flag_imp) {
					//If a room gets both, pick one at random
					if (dungeonRand.RandInt(100) < 50) {
						flag_imp = false;
					} else {
						flag_secondary = false;
					}
				}

				if (flag_imp) {
					grid[x][y].flag_imperfect = true;
				}

				if (flag_secondary) {
					grid[x][y].flag_secondary_structure = true;
				}

				room_number++;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ROOM);
			}
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_CREATE_ROOMS_AND_ANCHORS);
}

/**
 * NA: 0233E05C
 * AssignGridCellConnections - Responsible for assigning connections to randomly adjacent grid cells
 *
 * Connections begin from the grid cell at (cursor_x, cursor_y), and are created using a
 * random walk with momentum.
 *
 * There's a 50% chance it will continue in the same direction, otherwise it will be assigned a new random direction.
 * If the direction traveled runs into the border of the map, the direction turns counterclockwise.
 * If the direction walks towards an invalid grid tile, nothing happens and iteration continues.
 *
 * The random walk will be repeated floor_connectivity number of times (specified in FloorProperties)
 *
 * Once finished, if dead ends are disabled, an additional phase occurs to remove dead end hallway anchors (not rooms)
 * The original implementation contains a bug when applying new connections to these rooms, where the incorrect
 * grid cell index will be checked for validity (always the grid cell to the right), so some connections may go to
 * invalid tiles or not be applied to valid ones.
 *
 */
function AssignGridCellConnections(
	grid: GridCell[][],
	grid_size_x: number,
	grid_size_y: number,
	cursor_x: number,
	cursor_y: number,
	floor_props: FloorProperties
) {
	//Draw a random connection direction.
	//Connect the current cell with the cell to the:
	//	0: east
	// 	1: north
	//	2: west
	// 	3: south
	let direction: CardinalDirection = dungeonRand.RandInt(4);

	//Try to connect the current cell to another grid cell, repeat based on floor_connectivity
	for (let i = 0; i < floor_props.floor_connectivity; i++) {
		// Keep moving in the same direction with probability 1/2 ("momentum" to connect in a straight line)
		//Less forks and less doubling back

		const test = dungeonRand.RandInt(8);
		let new_direction = dungeonRand.RandInt(4);

		if (test < 4) {
			//Shuffle to a new direction
			direction = new_direction;
		}

		//Make sure our direction isn't going into a border
		//If so, rotate counterclockwise
		let ok = false;
		while (!ok) {
			switch (direction) {
				case CardinalDirection.DIR_RIGHT:
					ok = cursor_x < grid_size_x - 1;
					break;
				case CardinalDirection.DIR_UP:
					ok = cursor_y > 0;
					break;
				case CardinalDirection.DIR_LEFT:
					ok = cursor_x > 0;
					break;
				case CardinalDirection.DIR_DOWN:
					ok = cursor_y < grid_size_y - 1;
					break;
			}

			if (!ok) {
				//turn counter-clockwise
				direction = (direction + 1) % 4;
			}
		}

		//Set the connection, then move in that direction
		if (direction === CardinalDirection.DIR_RIGHT && !grid[cursor_x + 1][cursor_y].is_invalid) {
			grid[cursor_x][cursor_y].connected_to_right = true;
			grid[cursor_x + 1][cursor_y].connected_to_left = true;

			cursor_x++;
		} else if (direction === CardinalDirection.DIR_UP && !grid[cursor_x][cursor_y - 1].is_invalid) {
			grid[cursor_x][cursor_y].connected_to_top = true;
			grid[cursor_x][cursor_y - 1].connected_to_bottom = true;

			cursor_y--;
		} else if (direction === CardinalDirection.DIR_LEFT && !grid[cursor_x - 1][cursor_y].is_invalid) {
			grid[cursor_x][cursor_y].connected_to_left = true;
			grid[cursor_x - 1][cursor_y].connected_to_right = true;

			cursor_x--;
		} else if (direction === CardinalDirection.DIR_DOWN && !grid[cursor_x][cursor_y + 1].is_invalid) {
			grid[cursor_x][cursor_y].connected_to_bottom = true;
			grid[cursor_x][cursor_y + 1].connected_to_top = true;

			cursor_y++;
		}
	}

	// No dead ends, add some extra connections!
	if (!floor_props.allow_dead_ends) {
		let more = true;
		while (more) {
			more = false;

			//Locate potential dead ends
			for (let y = 0; y < grid_size_y; y++) {
				for (let x = 0; x < grid_size_x; x++) {
					if (!grid[x][y].is_invalid && !grid[x][y].is_room) {
						//Find which directions this tile is connected in
						let count_connect = 0;

						if (grid[x][y].connected_to_top) count_connect++;
						if (grid[x][y].connected_to_bottom) count_connect++;
						if (grid[x][y].connected_to_left) count_connect++;
						if (grid[x][y].connected_to_right) count_connect++;

						if (count_connect === 1) {
							//This tile has only one connection, it's a dead end
							//Connect it to a random other cell to remove the dead end

							direction = dungeonRand.RandInt(4);
							let ok = false;

							for (let i = 0; i < 8; i++) {
								if (direction === CardinalDirection.DIR_RIGHT && x < grid_size_x - 1 && !grid[x][y].connected_to_right) {
									ok = true;
								} else if (direction === CardinalDirection.DIR_UP && y > 0 && !grid[x][y].connected_to_top) {
									ok = true;
								} else if (direction === CardinalDirection.DIR_LEFT && x > 0 && !grid[x][y].connected_to_left) {
									ok = true;
								} else if (direction === CardinalDirection.DIR_DOWN && y < grid_size_y - 1 && !grid[x][y].connected_to_bottom) {
									ok = true;
								} else {
									direction = (direction + 1) % 4;
								}

								if (ok) break; //Once we find a successful direction, stop
							}

							//We couldn't find any successful direction, give up.
							if (!ok) continue;

							if (advancedGenerationSettings.fix_dead_end_validation_error) {
								if (direction === CardinalDirection.DIR_RIGHT && !grid[x + 1][y].is_invalid) {
									grid[x][y].connected_to_right = true;
									grid[x + 1][y].connected_to_left = true;

									//Because we've drawn a new connection, we have to
									//iterate through everything again in case we made a new dead end
									more = true;
									x++;
								} else if (direction === CardinalDirection.DIR_UP && !grid[x][y - 1].is_invalid) {
									grid[x][y].connected_to_top = true;
									grid[x][y - 1].connected_to_bottom = true;

									more = true;
									y--;
								} else if (direction === CardinalDirection.DIR_LEFT && !grid[x - 1][y].is_invalid) {
									grid[x][y].connected_to_left = true;
									grid[x - 1][y].connected_to_right = true;

									more = true;
									x--;
								} else if (direction === CardinalDirection.DIR_DOWN && !grid[x][y + 1].is_invalid) {
									grid[x][y].connected_to_bottom = true;
									grid[x][y + 1].connected_to_top = true;

									y++;
								}
							}
							//This section retains the original functionality
							else {
								if (direction === CardinalDirection.DIR_RIGHT && !grid[x + 1][y].is_invalid) {
									grid[x][y].connected_to_right = true;
									grid[x + 1][y].connected_to_left = true;

									more = true;
									x++;
								}
								//BUG: the wrong grid index is used for the validity check
								else if (direction === CardinalDirection.DIR_UP && !grid[x + 1][y].is_invalid) {
									grid[x][y].connected_to_top = true;
									grid[x][y - 1].connected_to_bottom = true;

									more = true;
									y--;
								}
								//BUG: the wrong grid index is used for the validity check
								else if (direction === CardinalDirection.DIR_LEFT && !grid[x + 1][y].is_invalid) {
									grid[x][y].connected_to_left = true;
									grid[x - 1][y].connected_to_right = true;

									more = true;
									x--;
								}
								//BUG: the wrong grid index is used for the validity check
								else if (direction === CardinalDirection.DIR_DOWN && !grid[x + 1][y].is_invalid) {
									grid[x][y].connected_to_bottom = true;
									grid[x][y + 1].connected_to_top = true;

									y++;
								}
							}
						}
					}
				}
			}
		}
	}
}

/**
 * NA: 0233F120
 * CreateHallway - Creates a hallway between two points.
 *
 *        |---------B
 *        |
 * A------|
 *
 * The hallway generated consists of two parallel paths connected by a perpendicular "kink" in the path
 * The "kink" in a path occurs along (turn_x, turn_y), which in practice is the grid cell boundary
 * If the paths trace same line, no "kink" will be generated
 *
 * If generation runs into an existing open tile, creation stops prematurely (such as another hallway).
 *
 * The vertical flag specifies whether the hallway is being generated horizontally or vertically
 */
function CreateHallway(start_x: number, start_y: number, end_x: number, end_y: number, vertical: boolean, turn_x: number, turn_y: number) {
	let cur_x = start_x;
	let cur_y = start_y;
	let counter = 0;

	if (!vertical) {
		//Horizontal hallway

		// Create the horizontal line between the starting point and the grid cell boundary
		while (cur_x !== turn_x) {
			if (counter >= 56) return; //Sanity check!

			counter++;

			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				//If we find open floor, stop here
				//The hall has connected up to an existing hall
				if (start_x !== cur_x) return;
			} else {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			if (cur_x >= turn_x) {
				cur_x--;
			} else {
				cur_x++;
			}
		}

		counter = 0;

		//Create the vertical line to connect the horizontal lines at two different y values
		while (cur_y !== end_y) {
			if (counter >= 56) return;

			counter++;

			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				//If we find open floor, stop here
				//The hall has connected up to an existing hall
				if (start_x !== cur_x || start_y !== cur_y) return;
			} else {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			if (cur_y >= end_y) {
				cur_y--;
			} else {
				cur_y++;
			}
		}

		counter = 0;

		//Create the horizontal line between the end point and the grid cell
		while (cur_x !== end_x) {
			if (counter >= 56) return;

			counter++;

			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				//If we find open floor, stop here
				//The hall has connected up to an existing hall
				if (start_x !== cur_x || start_y !== cur_y) return;
			} else {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			if (cur_x >= end_x) {
				cur_x--;
			} else {
				cur_x++;
			}
		}
	} else {
		//Vertical hallway

		// Create the vertical line between the starting point and the grid cell boundary
		while (cur_y !== turn_y) {
			if (counter >= 56) return; //Sanity check!

			counter++;

			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				//If we find open floor, stop here
				//The hall has connected up to an existing hall
				if (start_y !== cur_y) return;
			} else {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			if (cur_y >= turn_y) {
				cur_y--;
			} else {
				cur_y++;
			}
		}

		counter = 0;

		//Create the horizontal line to connect the horizontal lines at two different x values
		while (cur_x !== end_x) {
			if (counter >= 56) return;

			counter++;

			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				//If we find open floor, stop here
				//The hall has connected up to an existing hall
				if (start_x !== cur_x || start_y !== cur_y) return;
			} else {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			if (cur_x >= end_x) {
				cur_x--;
			} else {
				cur_x++;
			}
		}

		counter = 0;

		//Create the vertical line between the end point and the grid cell
		while (cur_y !== end_y) {
			if (counter >= 56) return;

			counter++;

			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				//If we find open floor, stop here
				//The hall has connected up to an existing hall
				if (start_x !== cur_x || start_y !== cur_y) return;
			} else {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			if (cur_y >= end_y) {
				cur_y--;
			} else {
				cur_y++;
			}
		}
	}
}

/**
 * NA: 0233E43C
 * CreateGridCellConnections - Creates connections through generating hallways and merging rooms
 *
 * First, connection links are copied over to a work array for managing hallway generation.
 *
 * Then, for each connection specified between two cells, a hallway is generated based on the following:
 * 	- If the cell is a hallway anchor, the hallway is generated based on the exact point of the anchor tile
 * 	- If the cell is a room, the hallway is generated based on a random interior point inside the room
 *
 * See: CreateHallway for how these points generate the hallway path
 *
 * Finally, if room merging is enabled there is a 9.75% chance that two connected rooms will be merged
 * into a single larger room. (9.75% comes from two 5% rolls, one for each of the two rooms being merged)
 * A room can only participate in a merge once.
 *
 * Merged rooms take up the full tile space occuipied between the two rooms.
 *
 */
function CreateGridCellConnections(
	grid: GridCell[][],
	grid_size_x: number,
	grid_size_y: number,
	list_x: number[],
	list_y: number[],
	disable_room_merging: boolean
) {
	//Validate and copy grid connections over to a work array
	for (let y = 0; y < grid_size_y; y++) {
		for (let x = 0; x < grid_size_x; x++) {
			if (!grid[x][y].is_invalid) {
				//For valid cells, remove cell connections beyond the grid bounds
				if (x === 0) {
					grid[x][y].connected_to_left = false;
				}

				if (y === 0) {
					grid[x][y].connected_to_top = false;
				}

				if (x === grid_size_x - 1) {
					grid[x][y].connected_to_right = false;
				}

				if (y === grid_size_y - 1) {
					grid[x][y].connected_to_bottom = false;
				}

				//Assign the connections
				grid[x][y].should_connect_to_top = grid[x][y].connected_to_top;
				grid[x][y].should_connect_to_bottom = grid[x][y].connected_to_bottom;
				grid[x][y].should_connect_to_left = grid[x][y].connected_to_left;
				grid[x][y].should_connect_to_right = grid[x][y].connected_to_right;
			} else {
				//For invalid cells, assign no connections

				grid[x][y].should_connect_to_top = false;
				grid[x][y].should_connect_to_bottom = false;
				grid[x][y].should_connect_to_left = false;
				grid[x][y].should_connect_to_right = false;
			}
		}
	}

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			if (grid[x][y].is_invalid) continue;

			let pt_x, pt_y, pt2_x, pt2_y;

			if (!grid[x][y].is_room) {
				//Hallway anchor, point is the 1x1 we've placed
				pt_x = grid[x][y].start_x;
				pt_y = grid[x][y].start_y;
			} else {
				//Room, pick a random point in the interior of the room
				pt_x = dungeonRand.RandRange(grid[x][y].start_x + 1, grid[x][y].end_x - 1);
				pt_y = dungeonRand.RandRange(grid[x][y].start_y + 1, grid[x][y].end_y - 1);
			}

			if (grid[x][y].should_connect_to_top) {
				//Connect to the cell above
				if (!grid[x][y - 1].is_invalid) {
					if (!grid[x][y - 1].is_room) {
						//Anchor, use the central x coordinate
						pt2_x = grid[x][y - 1].start_x;
					} else {
						//Room, pick a random interior x coordinate
						pt2_x = dungeonRand.RandRange(grid[x][y - 1].start_x + 1, grid[x][y - 1].end_x - 1);
					}

					//Create the hallway
					CreateHallway(pt_x, grid[x][y].start_y, pt2_x, grid[x][y - 1].end_y - 1, true, list_x[x], list_y[y]);
					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_HALLWAY);
				}

				//Mark the connection and unassign it so we don't try to draw
				//a second connection from the other way

				grid[x][y].should_connect_to_top = false;
				grid[x][y - 1].should_connect_to_bottom = false;
				grid[x][y].is_connected = true;
				grid[x][y - 1].is_connected = true;
			}

			if (grid[x][y].should_connect_to_bottom) {
				//Connect to the cell below
				if (!grid[x][y + 1].is_invalid) {
					if (!grid[x][y + 1].is_room) {
						//Anchor, use the central x coordinate
						pt2_x = grid[x][y + 1].start_x;
					} else {
						//Room, pick a random interior x coordinate
						pt2_x = dungeonRand.RandRange(grid[x][y + 1].start_x + 1, grid[x][y + 1].end_x - 1);
					}

					//Create the hallway
					CreateHallway(pt_x, grid[x][y].end_y - 1, pt2_x, grid[x][y + 1].start_y, true, list_x[x], list_y[y + 1] - 1);
					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_HALLWAY);
				}

				//Mark the connection and unassign it so we don't try to draw
				//a second connection from the other way

				grid[x][y].should_connect_to_bottom = false;
				grid[x][y + 1].should_connect_to_top = false;
				grid[x][y].is_connected = true;
				grid[x][y + 1].is_connected = true;
			}

			if (grid[x][y].should_connect_to_left) {
				//Connect to the cell on the left
				if (!grid[x - 1][y].is_invalid) {
					if (!grid[x - 1][y].is_room) {
						//Anchor, use the central y coordinate
						pt2_y = grid[x - 1][y].start_y;
					} else {
						//Room, pick a random interior y coordinate
						pt2_y = dungeonRand.RandRange(grid[x - 1][y].start_y + 1, grid[x - 1][y].end_y - 1);
					}

					//Create the hallway
					//Using (grid[x-1][y].start_x - 1) is a bug, it should be (grid[x-1][y].end_x - 1)
					//But CreateHallway has safety checks making the end result the same anyways.
					CreateHallway(grid[x][y].start_x, pt_y, grid[x - 1][y].start_x - 1, pt2_y, false, list_x[x], list_y[y]);
					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_HALLWAY);
				}

				//Mark the connection and unassign it so we don't try to draw
				//a second connection from the other way

				grid[x][y].should_connect_to_left = false;
				grid[x - 1][y].should_connect_to_right = false;
				grid[x][y].is_connected = true;
				grid[x - 1][y].is_connected = true;
			}

			if (grid[x][y].should_connect_to_right) {
				//Connect to the cell on the right
				if (!grid[x + 1][y].is_invalid) {
					if (!grid[x + 1][y].is_room) {
						//Anchor, use the central y coordinate
						pt2_y = grid[x + 1][y].start_y;
					} else {
						//Room, pick a random interior y coordinate
						pt2_y = dungeonRand.RandRange(grid[x + 1][y].start_y + 1, grid[x + 1][y].end_y - 1);
					}

					//Create the hallway
					CreateHallway(grid[x][y].end_x - 1, pt_y, grid[x + 1][y].start_x, pt2_y, false, list_x[x + 1] - 1, list_y[y]);
					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_HALLWAY);
				}

				//Mark the connection and unassign it so we don't try to draw
				//a second connection from the other way

				grid[x][y].should_connect_to_right = false;
				grid[x + 1][y].should_connect_to_left = false;
				grid[x][y].is_connected = true;
				grid[x + 1][y].is_connected = true;
			}
		}
	}

	//If we don't want to merge rooms, we're done
	if (disable_room_merging) {
		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_CREATE_GRID_CELL_CONNECTIONS);
		return;
	}

	//If we do, we can try to merge some!
	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			let chance = dungeonRand.RandInt(100);

			let src_x: number, src_y: number, dst_x: number, dst_y: number, merge_room_index: number;

			// Conditions for merging a room:
			// - rolls for merge chance
			// - valid
			// - connected to another room
			// - not already merged
			// - not have a secondary structure
			// - is a room, not an anchor
			if (
				chance < generationConstants.merge_rooms_chance &&
				!grid[x][y].is_invalid &&
				grid[x][y].is_connected &&
				!grid[x][y].is_merged &&
				!grid[x][y].has_secondary_structure &&
				grid[x][y].is_room
			) {
				let chance_two = dungeonRand.RandInt(4);

				//Verify the same for the target room
				if (
					chance_two === 0 &&
					x >= 1 &&
					!grid[x - 1][y].is_invalid &&
					grid[x - 1][y].is_connected &&
					!grid[x - 1][y].is_merged &&
					!grid[x - 1][y].has_secondary_structure &&
					grid[x - 1][y].is_room
				) {
					//Merge with the room to the left
					src_y = Math.min(grid[x - 1][y].start_y, grid[x][y].start_y);
					dst_y = Math.max(grid[x - 1][y].end_y, grid[x][y].end_y);
					src_x = grid[x - 1][y].start_x;
					dst_x = grid[x][y].end_x;

					//Use the original room's index
					merge_room_index = dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].room_index;

					//Carve out the merged room
					for (let cur_x = src_x; cur_x < dst_x; cur_x++) {
						for (let cur_y = src_y; cur_y < dst_y; cur_y++) {
							dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
							dungeonData.list_tiles[cur_x][cur_y].room_index = merge_room_index;
						}
					}

					//Update room boundaries
					grid[x - 1][y].start_x = src_x;
					grid[x - 1][y].start_y = src_y;
					grid[x - 1][y].end_x = dst_x;
					grid[x - 1][y].end_y = dst_y;

					//Mark merge flags on both rooms
					grid[x - 1][y].is_merged = true;
					grid[x][y].is_merged = true;
					grid[x][y].is_connected = false;
					grid[x][y].has_been_merged = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_MERGE_ROOM);
				} else if (
					chance_two === 1 &&
					y >= 1 &&
					!grid[x][y - 1].is_invalid &&
					grid[x][y - 1].is_connected &&
					!grid[x][y - 1].is_merged &&
					!grid[x][y - 1].has_secondary_structure &&
					grid[x][y - 1].is_room
				) {
					//Merge with the room above
					src_x = Math.min(grid[x][y - 1].start_x, grid[x][y].start_x);
					dst_x = Math.max(grid[x][y - 1].end_x, grid[x][y].end_x);
					src_y = grid[x][y - 1].start_y;
					dst_y = grid[x][y].end_y;

					//Use the original room's index
					merge_room_index = dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].room_index;

					//Carve out the merged room
					for (let cur_x = src_x; cur_x < dst_x; cur_x++) {
						for (let cur_y = src_y; cur_y < dst_y; cur_y++) {
							dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
							dungeonData.list_tiles[cur_x][cur_y].room_index = merge_room_index;
						}
					}

					//Update room boundaries
					grid[x][y - 1].start_x = src_x;
					grid[x][y - 1].start_y = src_y;
					grid[x][y - 1].end_x = dst_x;
					grid[x][y - 1].end_y = dst_y;

					//Mark merge flags on both rooms
					grid[x][y - 1].is_merged = true;
					grid[x][y].is_merged = true;
					grid[x][y].is_connected = false;
					grid[x][y].has_been_merged = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_MERGE_ROOM);
				} else if (
					chance_two === 2 &&
					x <= grid_size_x - 2 &&
					!grid[x + 1][y].is_invalid &&
					grid[x + 1][y].is_connected &&
					!grid[x + 1][y].is_merged &&
					!grid[x + 1][y].has_secondary_structure &&
					grid[x + 1][y].is_room
				) {
					//Merge with the room to the right
					src_y = Math.min(grid[x + 1][y].start_y, grid[x][y].start_y);
					dst_y = Math.max(grid[x + 1][y].end_y, grid[x][y].end_y);
					src_x = grid[x][y].start_x;
					dst_x = grid[x + 1][y].end_x;

					//Use the original room's index
					merge_room_index = dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].room_index;

					//Carve out the merged room
					for (let cur_x = src_x; cur_x < dst_x; cur_x++) {
						for (let cur_y = src_y; cur_y < dst_y; cur_y++) {
							dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
							dungeonData.list_tiles[cur_x][cur_y].room_index = merge_room_index;
						}
					}

					//Update room boundaries
					grid[x + 1][y].start_x = src_x;
					grid[x + 1][y].start_y = src_y;
					grid[x + 1][y].end_x = dst_x;
					grid[x + 1][y].end_y = dst_y;

					//Mark merge flags on both rooms
					grid[x + 1][y].is_merged = true;
					grid[x][y].is_merged = true;
					grid[x][y].is_connected = false;
					grid[x][y].has_been_merged = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_MERGE_ROOM);
				} else if (
					chance_two === 3 &&
					y <= grid_size_y - 2 &&
					!grid[x][y + 1].is_invalid &&
					grid[x][y + 1].is_connected &&
					!grid[x][y + 1].is_merged &&
					!grid[x][y + 1].has_secondary_structure &&
					grid[x][y + 1].is_room
				) {
					//Merge with the room below
					src_x = Math.min(grid[x][y + 1].start_x, grid[x][y].start_x);
					dst_x = Math.max(grid[x][y + 1].end_x, grid[x][y].end_x);
					src_y = grid[x][y].start_y;
					dst_y = grid[x][y + 1].end_y;

					//Use the original room's index
					merge_room_index = dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].room_index;

					//Carve out the merged room
					for (let cur_x = src_x; cur_x < dst_x; cur_x++) {
						for (let cur_y = src_y; cur_y < dst_y; cur_y++) {
							dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
							dungeonData.list_tiles[cur_x][cur_y].room_index = merge_room_index;
						}
					}

					//Update room boundaries
					grid[x][y + 1].start_x = src_x;
					grid[x][y + 1].start_y = src_y;
					grid[x][y + 1].end_x = dst_x;
					grid[x][y + 1].end_y = dst_y;

					//Mark merge flags on both rooms
					grid[x][y + 1].is_merged = true;
					grid[x][y].is_merged = true;
					grid[x][y].is_connected = false;
					grid[x][y].has_been_merged = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_MERGE_ROOM);
				}
			}
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_CREATE_GRID_CELL_CONNECTIONS);
}

/**
 * NA: 0233F424
 * EnsureConnectedGrid - Ensure the grid forms a connected graph (all valid cells are reachable) by adding hallways to unreachable cells
 *
 * If the unconnected cell is a hallway anchor, it will be ignored and filled in.
 * If the unconnected cell is a room, it will check all adjacent directions for a connected room, then add a hallway between if found.
 *
 * If no eligible room is found, the room will be removed and filled back in.
 */
function EnsureConnectedGrid(grid: GridCell[][], grid_size_x: number, grid_size_y: number, list_x: number[], list_y: number[]) {
	//Flag for OnCompleteGenerationStep to verify if any changes were actually made
	let was_grid_changed: boolean = false;

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			//If any of these is true, this cell is fine and we don't need to worry about it
			if (grid[x][y].is_invalid || grid[x][y].is_connected || grid[x][y].has_been_merged) continue;

			let rnd_x, rnd_y, pt_x, pt_y;

			if (grid[x][y].is_room && !grid[x][y].has_secondary_structure) {
				//Unconnected room
				rnd_x = dungeonRand.RandRange(grid[x][y].start_x + 1, grid[x][y].end_x - 1);
				rnd_y = dungeonRand.RandRange(grid[x][y].start_y + 1, grid[x][y].end_y - 1);

				if (y > 0 && !grid[x][y - 1].is_invalid && !grid[x][y - 1].is_merged && grid[x][y - 1].is_connected) {
					//Attempt to connect to the grid cell above if it's connected
					if (!grid[x][y - 1].is_room) {
						//Anchor, take center x
						pt_x = grid[x][y - 1].start_x;
					} else {
						//Room, take random interior x coordinate
						pt_x = dungeonRand.RandRange(grid[x][y - 1].start_x + 1, grid[x][y - 1].end_x - 1);
						pt_y = dungeonRand.RandRange(grid[x][y - 1].start_y + 1, grid[x][y - 1].end_y - 1); //Unused
					}

					CreateHallway(rnd_x, grid[x][y].start_y, pt_x, grid[x][y - 1].end_y - 1, true, list_x[x], list_y[y]);

					grid[x][y].is_connected = true;
					grid[x][y].connected_to_top = true;
					grid[x][y - 1].connected_to_bottom = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_ENSURE_CONNECTED_HALLWAY);
					was_grid_changed = true;
				} else if (y < grid_size_y - 1 && !grid[x][y + 1].is_invalid && !grid[x][y + 1].is_merged && grid[x][y + 1].is_connected) {
					//Attempt to connect to the grid cell below if it's connected
					if (!grid[x][y + 1].is_room) {
						//Anchor, take center x
						pt_x = grid[x][y + 1].start_x;
					} else {
						//Room, take random interior x coordinate
						pt_x = dungeonRand.RandRange(grid[x][y + 1].start_x + 1, grid[x][y + 1].end_x - 1);
						pt_y = dungeonRand.RandRange(grid[x][y + 1].start_y + 1, grid[x][y + 1].end_y - 1); //Unused
					}

					CreateHallway(rnd_x, grid[x][y].end_y - 1, pt_x, grid[x][y + 1].start_y, true, list_x[x], list_y[y + 1] - 1);

					grid[x][y].is_connected = true;
					grid[x][y].connected_to_bottom = true;
					grid[x][y + 1].connected_to_top = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_ENSURE_CONNECTED_HALLWAY);
					was_grid_changed = true;
				} else if (x > 0 && !grid[x - 1][y].is_invalid && !grid[x - 1][y].is_merged && grid[x - 1][y].is_connected) {
					//Attempt to connect to the grid cell left if it's connected
					if (!grid[x - 1][y].is_room) {
						//Anchor, take center y
						pt_y = grid[x - 1][y].start_y;
					} else {
						//Room, take random interior y coordinate
						pt_x = dungeonRand.RandRange(grid[x - 1][y].start_x + 1, grid[x - 1][y].end_x - 1); //Unused
						pt_y = dungeonRand.RandRange(grid[x - 1][y].start_y + 1, grid[x - 1][y].end_y - 1);
					}

					// Typo? Would expect grid[x - 1][y].end_x - 1 for 3rd parameter
					CreateHallway(grid[x][y].start_x, rnd_y, grid[x - 1][y].start_x - 1, pt_y, false, list_x[x], list_y[y]);

					grid[x][y].is_connected = true;
					grid[x][y].connected_to_left = true;
					grid[x - 1][y].connected_to_right = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_ENSURE_CONNECTED_HALLWAY);
					was_grid_changed = true;
				} else if (x < grid_size_x - 1 && !grid[x + 1][y].is_invalid && !grid[x + 1][y].is_merged && grid[x + 1][y].is_connected) {
					//Attempt to connect to the grid cell right if it's connected
					if (!grid[x + 1][y].is_room) {
						//Anchor, take center y
						pt_y = grid[x + 1][y].start_y;
					} else {
						//Room, take random interior y coordinate
						pt_x = dungeonRand.RandRange(grid[x + 1][y].start_x + 1, grid[x + 1][y].end_x - 1); //Unused
						pt_y = dungeonRand.RandRange(grid[x + 1][y].start_y + 1, grid[x + 1][y].end_y - 1);
					}

					CreateHallway(grid[x][y].end_x - 1, rnd_y, grid[x + 1][y].start_x, pt_y, false, list_x[x + 1] - 1, list_y[y]);

					grid[x][y].is_connected = true;
					grid[x][y].connected_to_right = true;
					grid[x + 1][y].connected_to_left = true;

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_ENSURE_CONNECTED_HALLWAY);
					was_grid_changed = true;
				}
			} else {
				//Unconnected anchor, don't bother trying.

				//Just fill it in with wall tiles
				dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;

				//Also remove any spawn flags
				dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].spawn_or_visibility_flags.f_stairs = false;
				dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].spawn_or_visibility_flags.f_item = false;
				dungeonData.list_tiles[grid[x][y].start_x][grid[x][y].start_y].spawn_or_visibility_flags.f_trap = false;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_REMOVE_UNCONNECTED_ANCHOR);
				was_grid_changed = true;
			}
		}
	}

	// If any rooms are still unconnected (meaning attempts to connect failed)
	// Fill in the rooms
	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			if (grid[x][y].is_invalid || grid[x][y].has_been_merged || grid[x][y].is_connected || grid[x][y].unk4) continue;

			for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
				for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
					//Set it to wall terrain
					dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;

					//Remove any spawn flags
					dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.f_stairs = false;
					dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.f_item = false;
					dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.f_trap = false;

					//Set room index to 0xFF (not a room)
					dungeonData.list_tiles[cur_x][cur_y].room_index = 0xff;

					if (grid[x][y].is_room) {
						was_grid_changed = true;
					}
				}
			}

			//Technicially this part of the function doesn't consider whether the grid cell is actually a room at all
			//(If it's an anchor, nothing visibly changes besides the loss of room index)
			if (grid[x][y].is_room) {
				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_REMOVE_UNCONNECTED_ROOM);
			}
		}
	}

	if (was_grid_changed) {
		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_ENSURE_CONNECTED_GRID);
	}
}

/**
 * NA: 0233F900
 * SetTerrainObstacleChecked - Sets terrain on a specific tile as an obstacle (either a wall or secondary terrain)
 *
 * If secondary terrain is requested and the room indices match, secondary terrain (water/lava) will be placed for the tile.
 *
 * Otherwise, the tile will be a wall.
 */
function SetTerrainObstacleChecked(tile: Tile, use_secondary_terrain: boolean, room_index: number) {
	if (use_secondary_terrain && tile.room_index === room_index) {
		tile.terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
	} else {
		tile.terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;
	}
}

/**
 * NA: 023406D4
 * GenerateMazeLine - Generates a "maze line" from the given start point, within the given bounds.
 *
 * A "maze line" is a random walk starting from (x0, y0). The random walk moves in strides of 2
 * in a random direction, placing down obstacles as it goes.
 *
 * The walk will terminate when the random walk has no available open tiles it can walk to.
 *
 *  [ ^ ] [   ] [   ]      	[ o ] [ - ] [ > ]
 *  [ | ] [   ] [   ]   =>	[ W ] [   ] [   ]  => etc.
 *  [ o ] [   ] [ W ]		[ W ] [   ] [ W ]
 *
 * First, an obstacle is placed at the given position (see: SetTerrainObstacleChecked)
 *
 * Then, a random direction is selected, searching for an open tile distance 2 away from (x0, y0).
 * Each direction is attempted rotating counter-clockwise until an open tile is found or all directions are exhausted.
 *
 * If an open tile is found, an obstacle is placed between the two tiles, and (x0, y0) moves to the new open tile.
 * This process continues until no valid open tile can be found.
 */
function GenerateMazeLine(x0: number, y0: number, xmin: number, ymin: number, xmax: number, ymax: number, use_secondary_terrain: boolean, room_index: number) {
	let ok = true;
	while (ok) {
		let direction = dungeonRand.RandInt(4);
		SetTerrainObstacleChecked(dungeonData.list_tiles[x0][y0], use_secondary_terrain, room_index);

		ok = false;
		for (let i = 0; i < 4; i++) {
			let offset_x = 0,
				offset_y = 0;

			//Offset from our current position to look 2 tiles in a given direction
			if (direction === CardinalDirection.DIR_RIGHT) {
				offset_x = 2;
				offset_y = 0;
			} else if (direction === CardinalDirection.DIR_UP) {
				offset_x = 0;
				offset_y = -2;
			} else if (direction === CardinalDirection.DIR_LEFT) {
				offset_x = -2;
				offset_y = 0;
			} else if (direction === CardinalDirection.DIR_DOWN) {
				offset_x = 0;
				offset_y = 2;
			}

			const pos_x = x0 + offset_x;
			const pos_y = y0 + offset_y;

			//Check that this position is in-bounds
			if (pos_x >= xmin && pos_x < xmax && pos_y >= ymin && pos_y < ymax) {
				//Check that this tile is open ground
				if (dungeonData.list_tiles[pos_x][pos_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
					//We found open ground, we're done!
					ok = true;
					break;
				}
			}

			//We didn't find any, try a different direction
			direction = (direction + 1) % 4;
		}

		//If we found some open terrain, set an obstacle for the terrain in between those two,
		//then move to the open terrain we found.
		if (ok) {
			if (direction === CardinalDirection.DIR_RIGHT) {
				SetTerrainObstacleChecked(dungeonData.list_tiles[x0 + 1][y0], use_secondary_terrain, room_index);

				x0 += 2;
			} else if (direction === CardinalDirection.DIR_UP) {
				SetTerrainObstacleChecked(dungeonData.list_tiles[x0][y0 - 1], use_secondary_terrain, room_index);

				y0 -= 2;
			} else if (direction === CardinalDirection.DIR_LEFT) {
				SetTerrainObstacleChecked(dungeonData.list_tiles[x0 - 1][y0], use_secondary_terrain, room_index);

				x0 -= 2;
			} else if (direction === CardinalDirection.DIR_DOWN) {
				SetTerrainObstacleChecked(dungeonData.list_tiles[x0][y0 + 1], use_secondary_terrain, room_index);

				y0 += 2;
			}
		}
	}
}

/**
 * NA: 02340458
 * GenerateMaze - Generate a maze room within the given grid cell.
 *
 * A "maze" is generated using a series of random walks whiich place obstacle terrain (walls / secondary terrain)
 * in a maze-like arrangement. "Maze lines" (see: GenerateMazeLine) are generated using every other tile around the
 * room's border, and every other interior tile as a starting point, ensuring there are stripes of walkable open terrain
 * surrounded by striples of obstacles (maze walls).
 *
 */
function GenerateMaze(grid_cell: GridCell, use_secondary_terrain: boolean) {
	grid_cell.is_maze_room = true;
	statusData.has_maze = true;

	const room_index = dungeonData.list_tiles[grid_cell.start_x][grid_cell.start_y].room_index;

	// Random walks from upper border
	for (let cur_x = grid_cell.start_x + 1; cur_x < grid_cell.end_x - 1; cur_x += 2) {
		if (dungeonData.list_tiles[cur_x][grid_cell.start_y - 1].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) {
			GenerateMazeLine(
				cur_x,
				grid_cell.start_y - 1,
				grid_cell.start_x,
				grid_cell.start_y,
				grid_cell.end_x,
				grid_cell.end_y,
				use_secondary_terrain,
				room_index
			);
		}
	}

	// Random walks from right border
	for (let cur_y = grid_cell.start_y + 1; cur_y < grid_cell.end_y - 1; cur_y += 2) {
		if (dungeonData.list_tiles[grid_cell.end_x][cur_y].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) {
			GenerateMazeLine(grid_cell.end_x, cur_y, grid_cell.start_x, grid_cell.start_y, grid_cell.end_x, grid_cell.end_y, use_secondary_terrain, room_index);
		}
	}

	// Random walks from lower border
	for (let cur_x = grid_cell.start_x + 1; cur_x < grid_cell.end_x - 1; cur_x += 2) {
		if (dungeonData.list_tiles[cur_x][grid_cell.end_y].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) {
			GenerateMazeLine(cur_x, grid_cell.end_y, grid_cell.start_x, grid_cell.start_y, grid_cell.end_x, grid_cell.end_y, use_secondary_terrain, room_index);
		}
	}

	// Random walks from left border
	for (let cur_y = grid_cell.start_y + 1; cur_y < grid_cell.end_y - 1; cur_y += 2) {
		if (dungeonData.list_tiles[grid_cell.start_x - 1][cur_y].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) {
			GenerateMazeLine(
				grid_cell.start_x - 1,
				cur_y,
				grid_cell.start_x,
				grid_cell.start_y,
				grid_cell.end_x,
				grid_cell.end_y,
				use_secondary_terrain,
				room_index
			);
		}
	}

	// Fill in all the inner tiles with a stride of 2
	for (let cur_x = grid_cell.start_x + 3; cur_x < grid_cell.end_x - 3; cur_x += 2) {
		for (let cur_y = grid_cell.start_y + 3; cur_y < grid_cell.end_y - 3; cur_y += 2) {
			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				if (use_secondary_terrain) {
					dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
				} else {
					dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;
				}

				// More random walks
				GenerateMazeLine(cur_x, cur_y, grid_cell.start_x, grid_cell.start_y, grid_cell.end_x, grid_cell.end_y, use_secondary_terrain, room_index);
			}
		}
	}
}

/**
 * NA: 02340224
 * GenerateMazeRoom - Determines and calls for whether to generate a maze room on the floor.
 *
 * A maze room can be generated by the probability specified in the maze_chance parameter, usually in vanilla
 * this parameter is set to either 0 or 1, giving a 0-1% chance for trying to spawn a maze room.
 *
 * Then, a strange check occurs for whether the floor_generation_attempts is < 0, which will always fail, resulting
 * in no maze rooms ever being generated under normal conditions. A patch is provided to allow this check to go
 * through and generate a maze room if desired.
 *
 * Candidate maze rooms have to be valid, connected, have odd dimensions, and not have any other features.
 * If any candidates are found, the game will select one of these rooms and call GenerateMaze.
 */
function GenerateMazeRoom(grid: GridCell[][], grid_size_x: number, grid_size_y: number, maze_chance: number) {
	if (maze_chance <= 0) return; //No chance for maze, stop
	if (dungeonRand.RandInt(100) >= maze_chance) return; //Need to roll the probability chance (which is usually 0-1%...)

	if (advancedGenerationSettings.allow_wall_maze_room_generation || dungeonGenerationInfo.floor_generation_attempts < 0) {
		// Count the number of rooms that can be mazified:
		// - Valid
		// - Not a Merged Room
		// - Connected
		// - Not a Monster House
		// - Both Dimensions are Odd

		let num_valid = 0;
		for (let y = 0; y < grid_size_y; y++) {
			for (let x = 0; x < grid_size_x; x++) {
				if (
					!grid[x][y].is_invalid &&
					!grid[x][y].has_been_merged &&
					grid[x][y].is_connected &&
					grid[x][y].is_room &&
					!grid[x][y].has_secondary_structure &&
					!grid[x][y].is_kecleon_shop &&
					!grid[x][y].is_monster_house &&
					!grid[x][y].unk4
				) {
					if ((grid[x][y].end_x - grid[x][y].start_x) % 2 !== 0 && (grid[x][y].end_y - grid[x][y].start_y) % 2 !== 0) {
						num_valid++;
					}
				}
			}
		}

		if (num_valid <= 0) return;

		// Have a single 1, the rest as 0's
		let values: boolean[] = Array(256).fill(false);
		values[0] = true;

		//Shuffle values
		for (let i = 0; i < 64; i++) {
			let a = dungeonRand.RandInt(num_valid);
			let b = dungeonRand.RandInt(num_valid);

			let temp = values[a];
			values[a] = values[b];
			values[b] = temp;
		}

		let counter = 0;

		for (let y = 0; y < grid_size_y; y++) {
			for (let x = 0; x < grid_size_x; x++) {
				if (
					!grid[x][y].is_invalid &&
					!grid[x][y].has_been_merged &&
					grid[x][y].is_connected &&
					grid[x][y].is_room &&
					!grid[x][y].has_secondary_structure &&
					!grid[x][y].is_kecleon_shop &&
					!grid[x][y].is_monster_house &&
					!grid[x][y].unk4
				) {
					if ((grid[x][y].end_x - grid[x][y].start_x) % 2 !== 0 && (grid[x][y].end_y - grid[x][y].start_y) % 2 !== 0) {
						//This room can be mazified
						if (values[counter]) {
							GenerateMaze(grid[x][y], false);
							OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_MAZE_ROOM);
						}

						counter++;
					}
				}
			}
		}
	}
}

/**
 * NA: 022E03B0
 * GetFloorType - Gets the current floor type.
 *
 * Floor Types:
 * 	0 - Current floor is "normal"
 * 	1 - Current floor is a fixed floor
 * 	2 - Current Floor has a rescue point
 */
function GetFloorType() {
	if (dungeonData.dungeon_objective === DungeonObjectiveType.OBJECTIVE_RESCUE && dungeonData.floor === dungeonData.rescue_floor) {
		return FloorType.FLOOR_TYPE_RESCUE;
	}

	if (dungeonGenerationInfo.fixed_room_id > 0 && dungeonGenerationInfo.fixed_room_id <= 0x6e) {
		//Fixed-floor room
		return FloorType.FLOOR_TYPE_FIXED;
	}

	return FloorType.FLOOR_TYPE_NORMAL;
}

/**
 * NA: 0233FBE8
 * GenerateKecleonShop - Potentially generate a kecleon shop on the floor.
 *
 * To spawn a kecleon shop, the floor cannot have a monster house, must not be a rescue floor, and must roll
 * the percentage chance of kecleon_chance.
 *
 * Grid cells indices are shuffled, then each is checked to meet the conditions to spawn a kecleon shop in that cell:
 * The room must be valid, connected, have no other special features, and have dimensions of at least 5x4.
 *
 * Once the first room (if any) is found that meets these conditions, the room is assigned as a kecleon shop.
 * The kecleon shop will occupy the whole room interior, with a one tile margin from the room walls.
 * Kecleon shop tiles restrict monster and stair spawns.
 */
function GenerateKecleonShop(grid: GridCell[][], grid_size_x: number, grid_size_y: number, kecleon_chance: number) {
	if (statusData.has_monster_house || GetFloorType() === FloorType.FLOOR_TYPE_RESCUE || kecleon_chance <= 0) return;
	if (dungeonRand.RandInt(100) >= kecleon_chance) return;

	// All possible grid cells
	let list_x: number[] = [],
		list_y: number[] = [];
	for (let i = 0; i < 0xf; i++) {
		list_x.push(i);
		list_y.push(i);
	}

	// Shuffle x indices
	for (let x = 0; x < 200; x++) {
		let a = dungeonRand.RandInt(0xf);
		let b = dungeonRand.RandInt(0xf);

		let temp = list_x[a];
		list_x[a] = list_x[b];
		list_x[b] = temp;
	}

	// Shuffle y indices
	for (let y = 0; y < 200; y++) {
		let a = dungeonRand.RandInt(0xf);
		let b = dungeonRand.RandInt(0xf);

		let temp = list_y[a];
		list_y[a] = list_y[b];
		list_y[b] = temp;
	}

	for (let i = 0; i < list_x.length; i++) {
		if (list_x[i] >= grid_size_x) continue;

		const x = list_x[i];

		for (let j = 0; j < list_y.length; j++) {
			if (list_y[j] >= grid_size_y) continue;

			const y = list_y[j];

			// We've identified a random in-bounds grid cell
			// To support a kecleon shop it must be:
			// - valid
			// - not a merged room
			// - connected
			// - a room
			// - have no other special features (mazes/secondary structures)
			// - have dimensions of at least 5x4
			if (
				grid[x][y].is_invalid ||
				grid[x][y].has_been_merged ||
				grid[x][y].is_merged ||
				!grid[x][y].is_connected ||
				!grid[x][y].is_room ||
				grid[x][y].has_secondary_structure ||
				grid[x][y].is_maze_room ||
				grid[x][y].flag_secondary_structure
			)
				continue;

			if (Math.abs(grid[x][y].start_x - grid[x][y].end_x) < 5 || Math.abs(grid[x][y].start_y - grid[x][y].end_y) < 4) continue;

			//This room can be a kecleon shop
			statusData.has_kecleon_shop = true;
			grid[x][y].is_kecleon_shop = true;

			//Make the shop span the whole room
			statusData.kecleon_shop_min_x = grid[x][y].start_x;
			statusData.kecleon_shop_min_y = grid[x][y].start_y;
			statusData.kecleon_shop_max_x = grid[x][y].end_x;
			statusData.kecleon_shop_max_y = grid[x][y].end_y;

			if (grid[x][y].end_y - grid[x][y].start_y < 3) {
				// This should never happen?
				statusData.kecleon_shop_max_y = grid[x][y].end_y + 1;
			}

			//Set to values that guarantee they'll be replaced later
			dungeonData.kecleon_shop_min_x = DEFAULT_MAX_POSITION;
			dungeonData.kecleon_shop_min_y = DEFAULT_MAX_POSITION;
			dungeonData.kecleon_shop_max_x = -DEFAULT_MAX_POSITION;
			dungeonData.kecleon_shop_max_y = -DEFAULT_MAX_POSITION;

			// Generate the actual shop on the interior, leaving
			// a 1-tile border from the room walls
			for (let cur_x = statusData.kecleon_shop_min_x + 1; cur_x < statusData.kecleon_shop_max_x - 1; cur_x++) {
				for (let cur_y = statusData.kecleon_shop_min_y + 1; cur_y < statusData.kecleon_shop_max_y - 1; cur_y++) {
					dungeonData.list_tiles[cur_x][cur_y].terrain_flags.f_in_kecleon_shop = true;

					// Restrict monsters and stairs from spawning here
					dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.f_monster = false;
					dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.f_stairs = false;

					//Ensure the borders are assigned properly
					if (cur_x <= dungeonData.kecleon_shop_min_x) {
						dungeonData.kecleon_shop_min_x = cur_x;
					}

					if (cur_y <= dungeonData.kecleon_shop_min_y) {
						dungeonData.kecleon_shop_min_y = cur_y;
					}

					if (cur_x >= dungeonData.kecleon_shop_max_x) {
						dungeonData.kecleon_shop_max_x = cur_x;
					}

					if (cur_y >= dungeonData.kecleon_shop_max_y) {
						dungeonData.kecleon_shop_max_y = cur_y;
					}
				}
			}

			//Sets an unknown spawn flag for all tiles in the room
			for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
				for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
					dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.f_special_tile = true;
				}
			}

			statusData.kecleon_shop_middle_x = Math.floor((statusData.kecleon_shop_min_x + statusData.kecleon_shop_max_x) / 2);
			statusData.kecleon_shop_middle_y = Math.floor((statusData.kecleon_shop_min_y + statusData.kecleon_shop_max_y) / 2);

			OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_KECLEON_SHOP);

			return;
		}
	}
}

/**
 * NA: 02349250
 * IsCurrentMissionTypeExact - Checks if the current floor is an active mission destination of the given type and subtype.
 */
function IsCurrentMissionTypeExact(type: MissionType, subtype: MissionSubtype) {
	if (dungeonData.mission_destination.is_destination_floor) {
		if (dungeonData.mission_destination.mission_type === type && dungeonData.mission_destination.mission_subtype === subtype) {
			return true;
		}
	}

	return false;
}

/**
 * NA: 02349298
 * IsOutlawMonsterHouseFloor - Checks if the current floor is a mission destination for a Monster House outlaw mission.
 */
function IsOutlawMonsterHouseFloor() {
	return IsCurrentMissionTypeExact(MissionType.MISSION_ARREST_OUTLAW, MissionSubtypeOutlaw.MISSION_OUTLAW_MONSTER_HOUSE);
}

/**
 * NA: 02349748
 * FloorHasMissionMonster - Checks if a given floor is a mission destination with
 * a special monster, either a target to rescue or an enemy to defeat.
 *
 * This function traditionally accepts a mission_destination_info, but this is embedded
 * in the DungeonData class for this implementation.
 */
function FloorHasMissionMonster() {
	if (dungeonData.mission_destination.is_destination_floor) {
		if (
			dungeonData.mission_destination.mission_type === MissionType.MISSION_RESCUE_CLIENT ||
			dungeonData.mission_destination.mission_type === MissionType.MISSION_RESCUE_TARGET ||
			dungeonData.mission_destination.mission_type === MissionType.MISSION_ESCORT_TO_TARGET ||
			dungeonData.mission_destination.mission_type === MissionType.MISSION_DELIVER_ITEM ||
			dungeonData.mission_destination.mission_type === MissionType.MISSION_SEARCH_FOR_TARGET ||
			dungeonData.mission_destination.mission_type === MissionType.MISSION_TAKE_ITEM_FROM_OUTLAW ||
			dungeonData.mission_destination.mission_type === MissionType.MISSION_ARREST_OUTLAW
		) {
			return true;
		}
	}

	return false;
}

/**
 * NA: 0234934C
 * IsDestinationFloorWithMonster - Checks if the current floor is a mission destination floor with a special monster.
 *
 * See: FloorHasMissionMonster
 */
function IsDestinationFloorWithMonster() {
	return FloorHasMissionMonster();
}

/**
 * NA: 0233FF9C
 * GenerateMonsterHouse - Possibly generate a monster house on the floor.
 *
 * A Monster House will be generated with a probability determined by the Monster House spawn chance, and only
 * if the floor supports one (no kecleon shop, no non-MH outlaw missions, no special floor types)
 *
 * A Monster House will be generated in a random room that's valid, connected, not merged, not a maze room, and
 * is not a few unknown conditions.
 */
function GenerateMonsterHouse(grid: GridCell[][], grid_size_x: number, grid_size_y: number, monster_house_chance: number) {
	// To spawn a monster house on this floor:
	// - It must meet the probability chance
	// - not have a kecleon shop
	// - Be an outlaw monster house floor or not be a special destination floor with a target
	// - Be a Normal Floor Type
	if (monster_house_chance <= 0) return;
	if (dungeonRand.RandInt(100) >= monster_house_chance) return;
	if (statusData.has_kecleon_shop) return;
	if ((!IsOutlawMonsterHouseFloor() && IsDestinationFloorWithMonster()) || GetFloorType() !== FloorType.FLOOR_TYPE_NORMAL) return;

	let num_valid = 0;

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			//A grid cell can have a monster house if it:
			// - is valid
			// - is not a merged room
			// - is connected
			// - is a room
			// - is not a maze
			// - and some other unknown conditions
			if (
				!grid[x][y].is_invalid &&
				!grid[x][y].has_been_merged &&
				grid[x][y].is_connected &&
				grid[x][y].is_room &&
				!grid[x][y].is_kecleon_shop &&
				!grid[x][y].unk4 &&
				!grid[x][y].is_maze_room &&
				!grid[x][y].has_secondary_structure
			) {
				num_valid++;
			}
		}
	}

	if (num_valid <= 0) return;

	// Have a single 1, the rest as 0's
	let values: boolean[] = Array(256).fill(false);
	values[0] = true;

	//Shuffle values
	for (let i = 0; i < 64; i++) {
		let a = dungeonRand.RandInt(num_valid);
		let b = dungeonRand.RandInt(num_valid);

		let temp = values[a];
		values[a] = values[b];
		values[b] = temp;
	}

	let counter = 0;

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			if (
				!grid[x][y].is_invalid &&
				!grid[x][y].has_been_merged &&
				grid[x][y].is_connected &&
				grid[x][y].is_room &&
				!grid[x][y].is_kecleon_shop &&
				!grid[x][y].unk4 &&
				!grid[x][y].is_maze_room &&
				!grid[x][y].has_secondary_structure
			) {
				if (values[counter]) {
					//The selected room can support a monster house
					//Generate one!
					statusData.has_monster_house = true;
					grid[x][y].is_monster_house = true;

					for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
						for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
							dungeonData.list_tiles[cur_x][cur_y].terrain_flags.f_in_monster_house = true;

							dungeonGenerationInfo.monster_house_room = dungeonData.list_tiles[cur_x][cur_y].room_index;
						}
					}

					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_MONSTER_HOUSE);

					return;
				}

				counter++;
			}
		}
	}
}

/**
 * NA: 0233C9E8
 * GenerateExtraHallways - Generate extra hallways on the floor via a series of random walks.
 *
 * These paths are often visibly dead-end hallways, or hallways which loop on themselves.
 *
 * Each walk begin at a random tile in a random room, leaving in a random cardinal direction, tunneling
 * through obstacles until it reaches open terrain, is out of bounds, or reaches an impassable obstruction.
 *
 * For each hallway the following steps are done:
 *
 * 1. Select a room, tile, and cardinal direction (specific conditions documented below)
 *
 * 2. Walk from the tile in that direction until we are out of the room, and reach an obstacle (could traverse hallways on the way)
 *
 * 3. Check we're safe to proceed (not at map borders, counterclockwise/clockwise tiles are not open)
 *
 * Begin our random-length walk strides:
 *
 * 4. Check we're safe to proceed (not at borders, not open tile, not impassable wall, will not make a 2x2 open square)
 *
 * 5. Place Open Terrain at this tile
 *
 * 6. Check we're safe to proceed (counterclockwise/clockwise tiles are not open)
 *
 * 7. Check if we've reached the end of the current stride (steps at 0), if so, turn left or right at random and start a new stride.
 *
 * 8. Move in the current direction.
 *
 * Repeat 4-8 until a check fails.
 */
function GenerateExtraHallways(grid: GridCell[][], grid_size_x: number, grid_size_y: number, num_extra_hallways: number) {
	//Flag for OnCompletedGenerationStep to verify if an extra hallway was added to the floor
	let added_extra_hallway: boolean = false;

	for (let i = 0; i < num_extra_hallways; i++) {
		//Select a random grid cell
		const x = dungeonRand.RandInt(grid_size_x);
		const y = dungeonRand.RandInt(grid_size_y);

		//To generate extra hallways the cell must be:
		// - a room
		// - connected
		// - valid
		// - not a maze room
		if (!grid[x][y].is_room || !grid[x][y].is_connected || grid[x][y].is_invalid || grid[x][y].is_maze_room) continue;

		//Choose a random tile in the room
		let cur_x = dungeonRand.RandRange(grid[x][y].start_x, grid[x][y].end_x);
		let cur_y = dungeonRand.RandRange(grid[x][y].start_y, grid[x][y].end_y);

		//Choose a random cardinal direction
		let direction: DirectionId = dungeonRand.RandInt(4) * 2;

		//if invalid, rotate counter-clockwise until one works
		for (let j = 0; j < 3; j++) {
			if (direction === DirectionId.DIR_DOWN && y >= grid_size_y - 1) {
				direction = DirectionId.DIR_RIGHT;
			}

			if (direction === DirectionId.DIR_RIGHT && x >= grid_size_x - 1) {
				direction = DirectionId.DIR_UP;
			}

			if (direction === DirectionId.DIR_UP && y <= 0) {
				direction = DirectionId.DIR_LEFT;
			}

			if (direction === DirectionId.DIR_LEFT && x <= 0) {
				direction = DirectionId.DIR_DOWN;
			}
		}

		const room_index = dungeonData.list_tiles[cur_x][cur_y].room_index;

		//Walk in the random direction until out of the room
		let continue_walk = true;
		while (continue_walk) {
			if (dungeonData.list_tiles[cur_x][cur_y].room_index === room_index) {
				//LIST_DIRECTIONS gives us the proper (x,y) offset to move one tile
				//in the given direction.
				cur_x += Constants.LIST_DIRECTIONS[direction * 4];
				cur_y += Constants.LIST_DIRECTIONS[direction * 4 + 2];
			} else {
				continue_walk = false;
			}
		}

		//Keep walking until an obstacle is encountered
		continue_walk = true;
		while (continue_walk) {
			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
				cur_x += Constants.LIST_DIRECTIONS[direction * 4];
				cur_y += Constants.LIST_DIRECTIONS[direction * 4 + 2];
			} else {
				continue_walk = false;
			}
		}

		//Abort if we reached secondary terrain
		if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) continue;

		//Check that the current tile is at least 2 away from the map border
		let valid = true;
		for (let x = cur_x - 2; x < cur_x + 3; x++) {
			for (let y = cur_y - 2; y < cur_y + 3; y++) {
				if (x < 0 || x >= FLOOR_MAX_X || y < 0 || y >= FLOOR_MAX_Y) {
					valid = false;
					break;
				}
			}

			if (!valid) break;
		}

		if (!valid) continue;

		let check_direction: DirectionId, check_x: number, check_y: number;

		//Make sure the direction 90 degrees counterclockwise isn't an open tile
		check_direction = (direction + 2) % 8;
		check_x = cur_x + Constants.LIST_DIRECTIONS[check_direction * 4];
		check_y = cur_y + Constants.LIST_DIRECTIONS[check_direction * 4 + 2];
		if (dungeonData.list_tiles[check_x][check_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) continue;

		//Do the same for 90 degrees clockwise (or 270 counterclockwise) and make sure it's not an open tile
		check_direction = (direction + 6) % 8;
		check_x = cur_x + Constants.LIST_DIRECTIONS[check_direction * 4];
		check_y = cur_y + Constants.LIST_DIRECTIONS[check_direction * 4 + 2];
		if (dungeonData.list_tiles[check_x][check_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) continue;

		//Number of steps to walk in one direction before turning
		let steps = dungeonRand.RandInt(3) + 3;
		while (true) {
			//Check for stopping conditions:
			// - Out of bounds or on the 1-tile border of impassable walls
			// - Reached an open tile
			// - Reached an impassable wall
			// - Would result in carving out a 2x2 square (not a hallway at that point)

			if (cur_x <= 1 || cur_y <= 1 || cur_x >= 55 || cur_y >= 31) break;
			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) break;
			if (dungeonData.list_tiles[cur_x][cur_y].terrain_flags.f_impassable_wall) break;

			let will_not_make_square = true;

			//Check Bottom to Right
			if (
				dungeonData.list_tiles[cur_x + 1][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x + 1][cur_y + 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x][cur_y + 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL
			) {
				will_not_make_square = false;
			}

			//Check Top to Right
			if (
				dungeonData.list_tiles[cur_x + 1][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x + 1][cur_y - 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x][cur_y - 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL
			) {
				will_not_make_square = false;
			}

			//Check Bottom to Left
			if (
				dungeonData.list_tiles[cur_x - 1][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x - 1][cur_y + 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x][cur_y + 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL
			) {
				will_not_make_square = false;
			}

			//Check Top to Left
			if (
				dungeonData.list_tiles[cur_x - 1][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x - 1][cur_y - 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[cur_x][cur_y - 1].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL
			) {
				will_not_make_square = false;
			}

			//If true, make the tile open, it will not produce a 2x2 opening
			//If false, it will abort from neighbor checks so we don't break here
			if (will_not_make_square) {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			}

			//Make sure the direction 90 degrees counterclockwise isn't an open tile
			check_direction = (direction + 2) % 8;
			check_x = cur_x + Constants.LIST_DIRECTIONS[check_direction * 4];
			check_y = cur_y + Constants.LIST_DIRECTIONS[check_direction * 4 + 2];
			if (dungeonData.list_tiles[check_x][check_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) break;

			//Do the same for 90 degrees clockwise (or 270 counterclockwise) and make sure it's not an open tile
			check_direction = (direction + 6) % 8;
			check_x = cur_x + Constants.LIST_DIRECTIONS[check_direction * 4];
			check_y = cur_y + Constants.LIST_DIRECTIONS[check_direction * 4 + 2];
			if (dungeonData.list_tiles[check_x][check_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) break;

			steps -= 1;
			if (steps === 0) {
				steps = dungeonRand.RandInt(3) + 3;

				//Turn left or right with an equal chance
				const rotate_rand = dungeonRand.RandInt(100);

				if (rotate_rand < 50) {
					direction = (direction + 2) % 8;
				} else {
					direction = (direction + 6) % 8;
				}

				//If we'd step into an invalid grid cell, stop
				//(We don't always utilize the entire floor space)
				if (cur_x >= 32 && statusData.floor_size === FloorSize.FLOOR_SIZE_SMALL && direction === DirectionId.DIR_RIGHT) break;
				if (cur_x >= 48 && statusData.floor_size === FloorSize.FLOOR_SIZE_MEDIUM && direction === DirectionId.DIR_RIGHT) break;
			}

			//Move in the current direction
			cur_x += Constants.LIST_DIRECTIONS[direction * 4];
			cur_y += Constants.LIST_DIRECTIONS[direction * 4 + 2];
		}

		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_EXTRA_HALLWAY);
		added_extra_hallway = true;
	}

	if (added_extra_hallway) {
		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_EXTRA_HALLWAYS);
	}
}

/**
 * NA: 0233ED34
 * GenerateRoomImperfections - Attempt to generate room imperfections for each room, if flagged to do so.
 *
 * Rooms are flagged for whether to allow imperfections in CreateRoomsAndAnchors.
 * Each qualifying flagged room has a 40% chance to generate imperfections in the room.
 *
 * Imperfections are generated by randomly growing walls of the room inwards
 * for a certain number of iterations, depending on the average length of the room.
 *
 * Each iteration will go in both a counterclockwise and clockwise generation movement (not necessarily for the same corner though)
 *
 * We pick a random corner, derive our direction from the movement being used, then seek up to 10 tiles for one to replace.
 * We avoid getting too close to hallways and ensure our cardinal neighbor tiles match what we expect for open terrain.
 */
function GenerateRoomImperfections(grid: GridCell[][], grid_size_x: number, grid_size_y: number) {
	//Flag for OnCompleteGenerationStep to verify if any imperfections were actually added
	let added_room_imperfections: boolean = false;

	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			//To have imperfections a room must:
			// - be valid
			// - not have been merged
			// - be a room
			// - be connected
			// - not have a secondary structure
			// - not be a maze room
			// - be flagged to be made imperfect
			if (
				grid[x][y].is_invalid ||
				grid[x][y].has_been_merged ||
				grid[x][y].is_merged ||
				!grid[x][y].is_room ||
				!grid[x][y].is_connected ||
				grid[x][y].has_secondary_structure ||
				grid[x][y].is_maze_room ||
				!grid[x][y].flag_imperfect
			)
				continue;

			//Roll for imperfections
			//By default, is a 40% chance that the room will still have imperfections
			if (dungeonRand.RandInt(100) < generationConstants.no_imperfections_chance) continue;

			//Flag for OnCompleteGenerationStep to verify if any imperfections were actually added (to this room specifically)
			let added_imperfections_to_this_room: boolean = false;

			let length = grid[x][y].end_x - grid[x][y].start_x + (grid[x][y].end_y - grid[x][y].start_y);

			length = Math.max(Math.floor(length / 4), 1);

			//Shrink the room from its corners either in the x or y direction
			//Repeat the number of times equal to the average room length
			for (let counter = 0; counter < length; counter++) {
				for (let i = 0; i < 2; i++) {
					//Start from one of four corners
					// i === 0 => fill in walls counterclockwise
					// i === 1 => fill in walls clockwise

					let starting_corner = dungeonRand.RandInt(4);
					let pt_x = 0,
						pt_y = 0,
						move_x = 0,
						move_y = 0;

					if (starting_corner === 0) {
						//Top-left corner
						pt_x = grid[x][y].start_x;
						pt_y = grid[x][y].start_y;

						if (i === 0) {
							move_x = 0;
							move_y = 1;
						} else {
							move_x = 1;
							move_y = 0;
						}
					} else if (starting_corner === 1) {
						//Top-right corner
						pt_x = grid[x][y].end_x - 1;
						pt_y = grid[x][y].start_y;

						if (i === 0) {
							move_x = -1;
							move_y = 0;
						} else {
							move_x = 0;
							move_y = 1;
						}
					} else if (starting_corner === 2) {
						//Bottom-right corner
						pt_x = grid[x][y].end_x - 1;
						pt_y = grid[x][y].end_y - 1;

						if (i === 0) {
							move_x = 0;
							move_y = -1;
						} else {
							move_x = -1;
							move_y = 0;
						}
					} else if (starting_corner === 3) {
						//Bottom-left corner
						pt_x = grid[x][y].start_x;
						pt_y = grid[x][y].end_y - 1;

						if (i === 0) {
							move_x = 1;
							move_y = 0;
						} else {
							move_x = 0;
							move_y = -1;
						}
					}

					//Search up to 10 tiles for a new tile to replace
					//from the selected starting corner and direction
					for (let v = 0; v < 10; v++) {
						//Make sure we're still in bounds
						if (pt_x < grid[x][y].start_x || pt_x >= grid[x][y].end_x || pt_y < grid[x][y].start_y || pt_y >= grid[x][y].end_y) break;

						if (dungeonData.list_tiles[pt_x][pt_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
							//Make sure there aren't any hallways within 2 spaces from the current tile
							//If there are, skip filling it in

							let direction = DirectionId.DIR_DOWN;
							while (direction < 8) {
								const next_x = pt_x + Constants.LIST_DIRECTIONS[direction * 4];
								const next_y = pt_y + Constants.LIST_DIRECTIONS[direction * 4 + 2];

								let found = false;
								for (let offset_x = -1; offset_x <= 1; offset_x++) {
									for (let offset_y = -1; offset_y <= 1; offset_y++) {
										//Search for open terrain which is not a part of a room (a hallway)
										if (
											dungeonData.list_tiles[next_x + offset_x][next_y + offset_y].terrain_flags.terrain_type ===
											TerrainType.TERRAIN_NORMAL
										) {
											if (dungeonData.list_tiles[next_x + offset_x][next_y + offset_y].room_index === 0xff) {
												found = true;
												break;
											}
										}
									}

									if (found) break;
								}

								if (found) break;

								direction += 1;
							}

							//If direction === 8, we didn't find any hallways and are good to proceed
							if (direction === 8) {
								//Check that our cardinal neighbors' terrain types match what we expect for generating new tiles in
								//this direction
								//For example, if we're generating from the top-left corner, we should only expect tiles
								//below us or to our right to have open terrain. If another tile does, we should stop
								//because the resulting room may look strange otherwise

								let base = starting_corner * 8;
								direction = 0;

								while (direction < 8) {
									let next_x = pt_x + Constants.LIST_DIRECTIONS[direction * 4];
									let next_y = pt_y + Constants.LIST_DIRECTIONS[direction * 4 + 2];

									let is_open: boolean;

									if (dungeonData.list_tiles[next_x][next_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
										is_open = true;
									} else {
										is_open = false;
									}

									if (Constants.CORNER_CARDINAL_NEIGHBOR_EXPECT_OPEN[base + direction] !== is_open) break;

									// Advance by 2 to only check cardinal directions
									direction += 2;
								}

								//if direction === 8, the neighbors match what we expect
								if (direction === 8) {
									//fill in the current open floor tile with a wall
									dungeonData.list_tiles[pt_x][pt_y].terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;

									added_room_imperfections = true;
									added_imperfections_to_this_room = true;
								}
							}

							break;
						} else {
							//The terrain is filled or already a wall, move to the next tile
							pt_x += move_x;
							pt_y += move_y;
						}
					}
				}
			}

			if (added_imperfections_to_this_room) {
				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_ROOM_IMPERFECTION);
			}
		}
	}

	if (added_room_imperfections) {
		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_ROOM_IMPERFECTIONS);
	}
}

/**
 * NA:0234087C
 * SetSpawnFlag5 - Sets unknown spawn flag 0x5 on all tiles in a room
 */
function SetSpawnFlag5(grid_cell: GridCell) {
	for (let x = grid_cell.start_x; x < grid_cell.end_x; x++) {
		for (let y = grid_cell.start_y; y < grid_cell.end_y; y++) {
			dungeonData.list_tiles[x][y].spawn_or_visibility_flags.spawn_flags_field_0x5 = true;
		}
	}
}

/**
 * NA: 023408D0
 * IsNextToHallway - Checks if a tile position is either in a hallway or next to one.
 */
function IsNextToHallway(x: number, y: number): boolean {
	for (let offset_x = -1; offset_x <= 1; offset_x++) {
		if (x + offset_x < 0) continue;
		if (x + offset_x >= FLOOR_MAX_X) break;

		for (let offset_y = -1; offset_y <= 1; offset_y++) {
			if (y + offset_y < 0) continue;
			if (y + offset_y >= FLOOR_MAX_Y) break;
			if (offset_x !== 0 && offset_y !== 0) continue;

			if (
				dungeonData.list_tiles[x + offset_x][y + offset_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[x + offset_x][y + offset_y].room_index === 0xff
			) {
				return true;
			}
		}
	}

	return false;
}

/**
 * NA: 0233D674
 * GenerateSecondaryStructures - Attempt to generate secondary structures in flagged rooms.
 *
 * For a valid flagged room with no extra features, one of the following will attempt to generate:
 * 0. No Secondary Structure
 * 1. A maze (made of water/lava walls), or a "plus" sign fallback, or a single dot in the center fallback
 * 2. Checkerboard pattern of water/lava
 * 3. A central pool in the room made of water/lava
 * 4. A central island with items and a warp tile, surrounded by water/lava
 * 5. A horizontal or vertical line of water/lava splitting the room in two.
 *
 * If a room doesn't meet the conditions for the secondary structure chosen, it will be left unchanged.
 */
function GenerateSecondaryStructures(grid: GridCell[][], grid_size_x: number, grid_size_y: number) {
	//Flag for OnCompleteGenerationStep to verify if any secondary structures were generated
	let generated_secondary_structure: boolean = false;

	for (let y = 0; y < grid_size_y; y++) {
		for (let x = 0; x < grid_size_x; x++) {
			//To have a secondary structure a room must be:
			// - valid
			// - not a monster house, merged, or have imperfections
			// - be a room
			// - be flagged for a secondary structure
			if (
				grid[x][y].is_invalid ||
				grid[x][y].is_monster_house ||
				grid[x][y].is_merged ||
				!grid[x][y].is_room ||
				!grid[x][y].flag_secondary_structure ||
				grid[x][y].flag_imperfect
			)
				continue;

			const structure_type: SecondaryStructureType = dungeonRand.RandInt(6); //0 = no secondary structure

			const room_size_x = grid[x][y].end_x - grid[x][y].start_x;
			const room_size_y = grid[x][y].end_y - grid[x][y].start_y;
			const middle_x = Math.floor((grid[x][y].end_x + grid[x][y].start_x) / 2);
			const middle_y = Math.floor((grid[x][y].end_y + grid[x][y].start_y) / 2);

			if (structure_type === SecondaryStructureType.SECONDARY_STRUCTURE_MAZE_PLUS_DOT && statusData.secondary_structures_budget > 0) {
				statusData.secondary_structures_budget -= 1;

				//If the dimensions are odd, generate a maze room
				if (room_size_x % 2 !== 0 && room_size_y % 2 !== 0) {
					//Both dimensions are odd. Generate a maze room
					SetSpawnFlag5(grid[x][y]);
					GenerateMaze(grid[x][y], true);
				} else {
					if (room_size_x >= 5 && room_size_y >= 5) {
						//Both dimensions are at least 5, generate a water/lava cross in the center
						dungeonData.list_tiles[middle_x][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x][middle_y - 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 1][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x + 1][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x][middle_y + 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
					} else {
						//Generate a single water/lava spot in the center
						dungeonData.list_tiles[middle_x][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
					}
				}

				grid[x][y].has_secondary_structure = true;
				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURE);
				generated_secondary_structure = true;
			} else if (structure_type === SecondaryStructureType.SECONDARY_STRUCTURE_CHECKERBOARD && statusData.secondary_structures_budget > 0) {
				if (room_size_x % 2 !== 0 && room_size_y % 2 !== 0) {
					//Dimensions are odd, generate diagonal stripes/checkerboard of water/lava
					statusData.secondary_structures_budget -= 1;
					SetSpawnFlag5(grid[x][y]);

					for (let i = 0; i < 64; i++) {
						const rand_x = dungeonRand.RandInt(room_size_x);
						const rand_y = dungeonRand.RandInt(room_size_y);

						if ((rand_x + rand_y) % 2 !== 0) {
							dungeonData.list_tiles[grid[x][y].start_x + rand_x][grid[x][y].start_y + rand_y].terrain_flags.terrain_type =
								TerrainType.TERRAIN_SECONDARY;
						}
					}

					grid[x][y].has_secondary_structure = true;
					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURE);
					generated_secondary_structure = true;
				}
			} else if (structure_type === SecondaryStructureType.SECONDARY_STRUCTURE_POOL) {
				if (room_size_x >= 5 && room_size_y >= 5) {
					//Both dimensions are at least 5, generate a "pool" of water/lava

					let rand_x1 = dungeonRand.RandRange(grid[x][y].start_x + 2, grid[x][y].end_x - 3);
					let rand_y1 = dungeonRand.RandRange(grid[x][y].start_y + 2, grid[x][y].end_y - 3);
					let rand_x2 = dungeonRand.RandRange(grid[x][y].start_x + 2, grid[x][y].end_x - 3);
					let rand_y2 = dungeonRand.RandRange(grid[x][y].start_y + 2, grid[x][y].end_y - 3);

					if (statusData.secondary_structures_budget > 0) {
						statusData.secondary_structures_budget -= 1;
						SetSpawnFlag5(grid[x][y]);

						if (rand_x1 > rand_x2) {
							const temp = rand_x1;
							rand_x1 = rand_x2;
							rand_x2 = temp;
						}

						if (rand_y1 > rand_y2) {
							const temp = rand_y2;
							rand_y1 = rand_y2;
							rand_y2 = temp;
						}

						for (let cur_x = rand_x1; cur_x <= rand_x2; cur_x++) {
							for (let cur_y = rand_y1; cur_y <= rand_y2; cur_y++) {
								dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
							}
						}

						grid[x][y].has_secondary_structure = true;
						OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURE);
						generated_secondary_structure = true;
					}
				}
			} else if (structure_type === SecondaryStructureType.SECONDARY_STRUCTURE_ISLAND) {
				if (room_size_x >= 6 && room_size_y >= 6) {
					//Both dimensions are at least 6. Generate an "island" with lava, items, and a Warp Tile at the center
					if (statusData.secondary_structures_budget > 0) {
						statusData.secondary_structures_budget -= 1;

						SetSpawnFlag5(grid[x][y]);

						//Water "Moat"
						dungeonData.list_tiles[middle_x - 2][middle_y - 2].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 2][middle_y - 2].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x - 1][middle_y - 2].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 1][middle_y - 2].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x][middle_y - 2].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x][middle_y - 2].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x + 1][middle_y - 2].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x + 1][middle_y - 2].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x - 2][middle_y - 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 2][middle_y - 1].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x - 2][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 2][middle_y].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x - 2][middle_y + 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 2][middle_y + 1].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x - 1][middle_y + 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x - 1][middle_y + 1].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x][middle_y + 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x][middle_y + 1].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x + 1][middle_y - 2].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x + 1][middle_y - 2].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x + 1][middle_y - 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x + 1][middle_y - 1].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x + 1][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x + 1][middle_y].terrain_flags.f_corner_cuttable = true;
						dungeonData.list_tiles[middle_x + 1][middle_y + 1].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						dungeonData.list_tiles[middle_x + 1][middle_y + 1].terrain_flags.f_corner_cuttable = true;

						//Warp Tile
						dungeonData.list_tiles[middle_x - 1][middle_y - 1].spawn_or_visibility_flags.f_trap = true;
						dungeonData.list_tiles[middle_x - 1][middle_y - 1].spawn_or_visibility_flags.f_special_tile = true;
						dungeonData.list_tiles[middle_x - 1][middle_y - 1].spawn_or_visibility_flags.spawn_flags_field_0x6 = true;

						//Items
						dungeonData.list_tiles[middle_x][middle_y - 1].spawn_or_visibility_flags.f_item = true;
						dungeonData.list_tiles[middle_x][middle_y - 1].spawn_or_visibility_flags.f_special_tile = true;
						dungeonData.list_tiles[middle_x - 1][middle_y].spawn_or_visibility_flags.f_item = true;
						dungeonData.list_tiles[middle_x - 1][middle_y].spawn_or_visibility_flags.f_special_tile = true;
						dungeonData.list_tiles[middle_x][middle_y].spawn_or_visibility_flags.f_item = true;
						dungeonData.list_tiles[middle_x][middle_y].spawn_or_visibility_flags.f_special_tile = true;

						grid[x][y].has_secondary_structure = true;
						OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURE);
						generated_secondary_structure = true;
					}
				}
			} else if (structure_type === SecondaryStructureType.SECONDARY_STRUCTURE_DIVIDER && statusData.secondary_structures_budget > 0) {
				//Generate a "split room" with two sides separated by a line of water/lava
				statusData.secondary_structures_budget -= 1;
				SetSpawnFlag5(grid[x][y]);

				let valid = true;

				if (dungeonRand.RandInt(2) === 0) {
					//Split the room with a horizontal line

					for (let i = grid[x][y].start_x; i < grid[x][y].end_x; i++) {
						if (IsNextToHallway(i, middle_y)) {
							valid = false;
							break;
						}
					}

					if (valid) {
						for (let i = grid[x][y].start_x; i < grid[x][y].end_x; i++) {
							dungeonData.list_tiles[i][middle_y].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						}

						for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
							for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
								dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.spawn_flags_field_0x7 = true;
							}
						}

						grid[x][y].has_secondary_structure = true;
						OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURE);
						generated_secondary_structure = true;
					}
				} else {
					//Split the room with a vertical line

					for (let i = grid[x][y].start_y; i < grid[x][y].end_y; i++) {
						if (IsNextToHallway(middle_x, i)) {
							valid = false;
							break;
						}
					}

					if (valid) {
						for (let i = grid[x][y].start_y; i < grid[x][y].end_y; i++) {
							dungeonData.list_tiles[middle_x][i].terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
						}

						for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
							for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
								dungeonData.list_tiles[cur_x][cur_y].spawn_or_visibility_flags.spawn_flags_field_0x7 = true;
							}
						}

						grid[x][y].has_secondary_structure = true;
						OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURE);
						generated_secondary_structure = true;
					}
				}
			}
		}
	}

	if (generated_secondary_structure) {
		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_SECONDARY_STRUCTURES);
	}
}

/**
 * NA: 0233B028
 * GenerateStandardFloor - Generates a standard, typical floor layout.
 *
 * Overview:
 * 1. Determine the grid based on grid_size_x, grid_size_y
 * 2. Assign and create rooms and hallway anchors to each grid cell
 * 3. Assign and create connections between grid cells (these are traditional hallways connecting the map together)
 * 4. Fix any unconnected grid cells by adding more connections or removing their rooms/hallway anchors
 * 5. Generate special rooms like a Maze Room (unused in vanilla), Kecleon Shop, or Monster House
 * 6. Create additional "extra hallways" with random walks outside of existing rooms
 * 7. Finalize extra room details with imperfections (unused in vanilla), and structures with secondary terrain
 */
function GenerateStandardFloor(grid_size_x: number, grid_size_y: number, floor_props: FloorProperties) {
	const { list_x, list_y } = GetGridPositions(grid_size_x, grid_size_y);

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	AssignRooms(grid, grid_size_x, grid_size_y, floor_props.room_density);

	CreateRoomsAndAnchors(grid, grid_size_x, grid_size_y, list_x, list_y, floor_props.room_flags);

	const cursor_x = dungeonRand.RandInt(grid_size_x);
	const cursor_y = dungeonRand.RandInt(grid_size_y);

	AssignGridCellConnections(grid, grid_size_x, grid_size_y, cursor_x, cursor_y, floor_props);
	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, false);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);

	GenerateMazeRoom(grid, grid_size_x, grid_size_y, floor_props.maze_room_chance);
	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
	GenerateSecondaryStructures(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 0233C774
 * GenerateOneRoomMonsterHouseFloor - Generates a floor layout with just one large room which is a Monster House.
 *
 * This generator is used as a fallback in the event generation fails too many times.
 */
function GenerateOneRoomMonsterHouseFloor() {
	let grid = InitDungeonGrid(1, 1);

	grid[0][0].start_x = 2;
	grid[0][0].end_x = 0x36;
	grid[0][0].start_y = 2;
	grid[0][0].end_y = 0x1e;
	grid[0][0].is_room = true;
	grid[0][0].is_connected = true;
	grid[0][0].is_invalid = false;

	for (let x = grid[0][0].start_x; x < grid[0][0].end_x; x++) {
		for (let y = grid[0][0].start_y; y < grid[0][0].end_y; y++) {
			dungeonData.list_tiles[x][y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			dungeonData.list_tiles[x][y].room_index = 0;
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_ONE_ROOM_MONSTER_HOUSE_FLOOR);

	GenerateMonsterHouse(grid, 1, 1, 999);
}

/**
 * NA: 0233B190
 * GenerateOuterRingFloor - Generates on a 6x4 grid, with the outer border of grid cells being hallways and the inner 4x2 grid being rooms.
 *
 * It's "that one floor" in Apple Woods
 */
function GenerateOuterRingFloor(floor_props: FloorProperties) {
	const grid_size_x = 6;
	const grid_size_y = 4;
	const list_x = [0, 5, 0x10, 0x1c, 0x27, 0x33, 0x38];
	const list_y = [2, 7, 0x10, 0x19, 0x1e];

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	//Mark the outer ring as not being rooms
	for (let x = 0; x < grid_size_x; x++) {
		grid[x][0].is_room = false;
		grid[x][grid_size_y - 1].is_room = false;
	}

	for (let y = 0; y < grid_size_y; y++) {
		grid[0][y].is_room = false;
		grid[grid_size_x - 1][y].is_room = false;
	}

	//Mark the inner tiles as rooms
	for (let x = 1; x < grid_size_x - 1; x++) {
		for (let y = 1; y < grid_size_y - 1; y++) {
			grid[x][y].is_room = true;
		}
	}

	let cur_room_index = 0;

	for (let y = 0; y < grid_size_y; y++) {
		for (let x = 0; x < grid_size_x; x++) {
			if (grid[x][y].is_room) {
				//Room
				const range_x = list_x[x + 1] - list_x[x] - 3;
				const range_y = list_y[y + 1] - list_y[y] - 3;

				const room_size_x = dungeonRand.RandRange(5, range_x);
				const room_size_y = dungeonRand.RandRange(4, range_y);
				const start_x = dungeonRand.RandInt(range_x - room_size_x) + list_x[x] + 2;
				const start_y = dungeonRand.RandInt(range_y - room_size_y) + list_y[y] + 2;

				grid[x][y].start_x = start_x;
				grid[x][y].start_y = start_y;
				grid[x][y].end_x = start_x + room_size_x;
				grid[x][y].end_y = start_y + room_size_y;
				for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
					for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
						dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
						dungeonData.list_tiles[cur_x][cur_y].room_index = cur_room_index;
					}
				}

				cur_room_index += 1;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ROOM);
			} else {
				//Hallway Anchor
				const start_x = dungeonRand.RandRange(list_x[x] + 1, list_x[x + 1] - 2);
				const start_y = dungeonRand.RandRange(list_y[y] + 1, list_y[y + 1] - 2);

				grid[x][y].start_x = start_x;
				grid[x][y].start_y = start_y;
				grid[x][y].end_x = start_x + 1;
				grid[x][y].end_y = start_y + 1;

				dungeonData.list_tiles[start_x][start_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
				dungeonData.list_tiles[start_x][start_y].room_index = 0xff;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ANCHOR);
			}
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_OUTER_RING_FLOOR);

	grid[0][0].connected_to_right = true;
	grid[1][0].connected_to_left = true;
	grid[1][0].connected_to_right = true;
	grid[2][0].connected_to_left = true;
	grid[2][0].connected_to_right = true;
	grid[3][0].connected_to_left = true;
	grid[3][0].connected_to_right = true;
	grid[4][0].connected_to_left = true;
	grid[4][0].connected_to_right = true;
	grid[5][0].connected_to_left = true;
	grid[0][0].connected_to_bottom = true;
	grid[0][1].connected_to_top = true;
	grid[0][1].connected_to_bottom = true;
	grid[0][2].connected_to_top = true;
	grid[0][2].connected_to_bottom = true;
	grid[0][3].connected_to_top = true;
	grid[0][3].connected_to_right = true;
	grid[1][3].connected_to_left = true;
	grid[1][3].connected_to_right = true;
	grid[2][3].connected_to_left = true;
	grid[2][3].connected_to_right = true;
	grid[3][3].connected_to_left = true;
	grid[3][3].connected_to_right = true;
	grid[4][3].connected_to_left = true;
	grid[4][3].connected_to_right = true;
	grid[5][3].connected_to_left = true;
	grid[5][0].connected_to_bottom = true;
	grid[5][1].connected_to_top = true;
	grid[5][1].connected_to_bottom = true;
	grid[5][2].connected_to_top = true;
	grid[5][2].connected_to_bottom = true;
	grid[5][3].connected_to_top = true;

	const cursor_x = dungeonRand.RandInt(grid_size_x);
	const cursor_y = dungeonRand.RandInt(grid_size_y);

	AssignGridCellConnections(grid, grid_size_x, grid_size_y, cursor_x, cursor_y, floor_props);
	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, false);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);

	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 0233B61C
 * GenerateCrossroadsFloor - Generates a floor layout with hallways on the inside and rooms on the outside, with empty corners.
 *
 * Also nicknamed "Ladder Layout" by some.
 */
function GenerateCrossroadsFloor(floor_props: FloorProperties) {
	const grid_size_x = 5;
	const grid_size_y = 4;

	const list_x = [0, 0xb, 0x16, 0x21, 0x2c, 0x38];
	const list_y = [1, 9, 0x10, 0x17, 0x1f];

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	//Mark the outer ring as rooms
	for (let x = 0; x < grid_size_x; x++) {
		grid[x][0].is_room = true;
		grid[x][grid_size_y - 1].is_room = true;
	}

	for (let y = 0; y < grid_size_y; y++) {
		grid[0][y].is_room = true;
		grid[grid_size_x - 1][y].is_room = true;
	}

	//Mark the inner cells as hallways
	for (let x = 1; x < grid_size_x - 1; x++) {
		for (let y = 1; y < grid_size_y - 1; y++) {
			grid[x][y].is_room = false;
		}
	}

	//Invalidate the corners
	grid[0][0].is_invalid = true;
	grid[0][grid_size_y - 1].is_invalid = true;
	grid[grid_size_x - 1][0].is_invalid = true;
	grid[grid_size_x - 1][grid_size_y - 1].is_invalid = true;

	let cur_room_index = 0;

	for (let y = 0; y < grid_size_y; y++) {
		for (let x = 0; x < grid_size_x; x++) {
			if (grid[x][y].is_invalid) continue;

			if (grid[x][y].is_room) {
				//Room
				const range_x = list_x[x + 1] - list_x[x] - 3;
				const range_y = list_y[y + 1] - list_y[y] - 3;

				const room_size_x = dungeonRand.RandRange(5, range_x);
				const room_size_y = dungeonRand.RandRange(4, range_y);
				const start_x = dungeonRand.RandInt(range_x - room_size_x) + list_x[x] + 2;
				const start_y = dungeonRand.RandInt(range_y - room_size_y) + list_y[y] + 2;

				grid[x][y].start_x = start_x;
				grid[x][y].start_y = start_y;
				grid[x][y].end_x = start_x + room_size_x;
				grid[x][y].end_y = start_y + room_size_y;
				for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
					for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
						dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
						dungeonData.list_tiles[cur_x][cur_y].room_index = cur_room_index;
					}
				}

				cur_room_index += 1;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ROOM);
			} else {
				//Hallway Anchor
				const start_x = dungeonRand.RandRange(list_x[x] + 1, list_x[x + 1] - 2);
				const start_y = dungeonRand.RandRange(list_y[y] + 1, list_y[y + 1] - 2);

				grid[x][y].start_x = start_x;
				grid[x][y].start_y = start_y;
				grid[x][y].end_x = start_x + 1;
				grid[x][y].end_y = start_y + 1;

				dungeonData.list_tiles[start_x][start_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
				dungeonData.list_tiles[start_x][start_y].room_index = 0xff;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ANCHOR);
			}
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_CROSSROADS_FLOOR);

	for (let x = 1; x < grid_size_x - 1; x++) {
		for (let y = 0; y < grid_size_y - 1; y++) {
			grid[x][y].connected_to_bottom = true;
			grid[x][y + 1].connected_to_top = true;
		}
	}

	for (let x = 0; x < grid_size_x - 1; x++) {
		for (let y = 1; y < grid_size_y - 1; y++) {
			grid[x][y].connected_to_right = true;
			grid[x + 1][y].connected_to_left = true;
		}
	}

	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, true);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);
	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 0233C844
 * GenerateTwoRoomsWithMonsterHouseFloor - Generates a floor layout with two rooms (left and right), with one being a Monster House.
 */
function GenerateTwoRoomsWithMonsterHouseFloor() {
	const grid_size_x = 2;
	const grid_size_y = 1;
	const list_x = [2, 0x1c, 0x36];
	const list_y = [2, 0x1e];

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	let cur_room_index = 0;
	const y = 0;

	for (let x = 0; x < grid_size_x; x++) {
		const range_x = list_x[x + 1] - list_x[x] - 3;
		const range_y = list_y[y + 1] - list_y[y] - 3;
		const room_size_x = dungeonRand.RandRange(10, range_x);
		const room_size_y = dungeonRand.RandRange(16, range_y);
		const start_x = dungeonRand.RandInt(range_x - room_size_x) + list_x[x] + 1;
		const start_y = dungeonRand.RandInt(range_y - room_size_y) + list_y[y] + 1;

		grid[x][y].start_x = start_x;
		grid[x][y].start_y = start_y;
		grid[x][y].end_x = start_x + room_size_x;
		grid[x][y].end_y = start_y + room_size_y;

		for (let cur_x = grid[x][y].start_x; cur_x < grid[x][y].end_x; cur_x++) {
			for (let cur_y = grid[x][y].start_y; cur_y < grid[x][y].end_y; cur_y++) {
				dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
				dungeonData.list_tiles[cur_x][cur_y].room_index = cur_room_index;
			}
		}

		cur_room_index++;

		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_CREATE_ROOM);
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_TWO_ROOMS_WITH_MONSTER_HOUSE_FLOOR);

	grid[0][0].connected_to_right = true;
	grid[1][0].connected_to_left = true;

	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, false);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, 999);
}

/**
 * NA: 0233BA7C
 * GenerateLineFloor - Generates a floor layout with 5 grid cells in a horizontal line.
 */
function GenerateLineFloor(floor_props: FloorProperties) {
	const grid_size_x = 5;
	const grid_size_y = 1;
	const list_x = [0, 0xb, 0x16, 0x21, 0x2c, 0x38];
	const list_y = [4, 0xf];

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	AssignRooms(grid, grid_size_x, grid_size_y, floor_props.room_density);
	CreateRoomsAndAnchors(grid, grid_size_x, grid_size_y, list_x, list_y, floor_props.room_flags);

	const cursor_x = dungeonRand.RandInt(grid_size_x);
	const cursor_y = dungeonRand.RandInt(grid_size_y);

	AssignGridCellConnections(grid, grid_size_x, grid_size_y, cursor_x, cursor_y, floor_props);
	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, true);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);

	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 0233BBDC
 * GenerateCrossFloor - Generates a floor layout with 5 rooms arranged in a "plus" or "cross" configuration.
 */
function GenerateCrossFloor(floor_props: FloorProperties) {
	const grid_size_x = 3;
	const grid_size_y = 3;
	const list_x = [0xb, 0x16, 0x21, 0x2c];
	const list_y = [2, 0xb, 0x14, 0x1e];

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	//Set all cells as rooms
	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			grid[x][y].is_room = true;
		}
	}

	//Invalidate the corners
	grid[0][0].is_invalid = true;
	grid[0][grid_size_y - 1].is_invalid = true;
	grid[grid_size_x - 1][0].is_invalid = true;
	grid[grid_size_x - 1][grid_size_y - 1].is_invalid = true;

	CreateRoomsAndAnchors(grid, grid_size_x, grid_size_y, list_x, list_y, floor_props.room_flags);

	grid[1][0].connected_to_bottom = true;
	grid[1][1].connected_to_top = true;
	grid[1][1].connected_to_bottom = true;
	grid[1][2].connected_to_top = true;
	grid[0][1].connected_to_right = true;
	grid[1][1].connected_to_left = true;
	grid[1][1].connected_to_right = true;
	grid[2][1].connected_to_left = true;

	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, true);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);

	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 0233BF30
 * MergeRoomsVertically - Merges two vertically stacked rooms into one larger room.
 */
function MergeRoomsVertically(room_x: number, room_y1: number, room_dy: number, grid: GridCell[][]) {
	const room_y2 = room_y1 + room_dy;

	const start_x = Math.min(grid[room_x][room_y1].start_x, grid[room_x][room_y2].start_x);
	const end_x = Math.max(grid[room_x][room_y1].end_x, grid[room_x][room_y2].end_x);
	const start_y = grid[room_x][room_y1].start_y;
	const end_y = grid[room_x][room_y2].end_y;

	//Carve out the new larger room, retaining the index of the first room
	const room_index = dungeonData.list_tiles[grid[room_x][room_y1].start_x][grid[room_x][room_y1].start_y].room_index;

	for (let x = start_x; x < end_x; x++) {
		for (let y = start_y; y < end_y; y++) {
			dungeonData.list_tiles[x][y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			dungeonData.list_tiles[x][y].room_index = room_index;
		}
	}

	//Assign the new grid cell room space
	grid[room_x][room_y1].start_x = start_x;
	grid[room_x][room_y1].start_y = start_y;
	grid[room_x][room_y1].end_x = end_x;
	grid[room_x][room_y1].end_y = end_y;

	grid[room_x][room_y1].is_merged = true;
	grid[room_x][room_y2].is_merged = true;
	grid[room_x][room_y2].is_connected = false;
	grid[room_x][room_y2].has_been_merged = true;

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_MERGE_ROOM_VERTICALLY);
}

/**
 * NA: 0233BD74
 * GenerateBeetleFloor - Generates a floor layout in a "beetle" shape, with a
 * 3x3 grid of rooms, a merged center column, and hallways along each row
 */
function GenerateBeetleFloor(floor_props: FloorProperties) {
	const grid_size_x = 3;
	const grid_size_y = 3;
	const list_x = [0x5, 0xf, 0x23, 0x32];
	const list_y = [2, 0xb, 0x14, 0x1e];

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	//Set all cells as rooms
	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			grid[x][y].is_room = true;
		}
	}

	CreateRoomsAndAnchors(grid, grid_size_x, grid_size_y, list_x, list_y, floor_props.room_flags);

	//Connect rooms in the same row together
	for (let y = 0; y < grid_size_y; y++) {
		grid[0][y].connected_to_right = true;
		grid[1][y].connected_to_left = true;
		grid[1][y].connected_to_right = true;
		grid[2][y].connected_to_left = true;
	}

	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, true);

	//Merge the center column into one large room
	MergeRoomsVertically(1, 0, 1, grid);
	MergeRoomsVertically(1, 0, 2, grid);

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_MERGE_ROOM_VERTICALLY);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);

	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 0233C07C
 * GenerateOuterRoomsFloor - Generates a floor layout with a ring of rooms and nothing on the interior.
 *
 * This layout is bugged and will not properly connect rooms for grid_size_x < 3.
 */
function GenerateOuterRoomsFloor(grid_size_x: number, grid_size_y: number, floor_props: FloorProperties) {
	let { list_x, list_y } = GetGridPositions(grid_size_x, grid_size_y);

	grid_cell_start_x = list_x;
	grid_cell_start_y = list_y;

	let grid = InitDungeonGrid(grid_size_x, grid_size_y);

	//Make all cells rooms
	for (let x = 0; x < grid_size_x; x++) {
		for (let y = 0; y < grid_size_y; y++) {
			grid[x][y].is_room = true;
		}
	}

	//Invalidate all interior cells
	for (let x = 1; x < grid_size_x - 1; x++) {
		for (let y = 1; y < grid_size_y - 1; y++) {
			grid[x][y].is_invalid = true;
		}
	}

	CreateRoomsAndAnchors(grid, grid_size_x, grid_size_y, list_x, list_y, floor_props.room_flags);

	if (advancedGenerationSettings.fix_generate_outer_rooms_floor_error) {
		for (let x = 0; x < grid_size_x; x++) {
			if (x > 0) {
				//If not on the left border, connect to the left
				grid[x][0].connected_to_left = true;
				grid[x][grid_size_y - 1].connected_to_left = true;
			}

			if (x < grid_size_x - 1) {
				//If not on the right border, connect to the right
				grid[x + 1][0].connected_to_right = true;
				grid[x + 1][grid_size_y - 1].connected_to_right = true;
			}
		}

		for (let y = 0; y < grid_size_y; y++) {
			if (y > 0) {
				//If not on the top border, connect above
				grid[0][y].connected_to_top = true;
				grid[grid_size_x - 1][y].connected_to_top = true;
			}

			if (y < grid_size_y - 1) {
				//If not on the bottom border, connect below
				grid[0][y + 1].connected_to_bottom = true;
				grid[grid_size_x - 1][y + 1].connected_to_bottom = true;
			}
		}
	} else {
		//The original implementation fails for grid_size_x <= 2, as one of the branches
		//is never taken, and the other branch does not provide a backup connection, leaving the two sides unconnected.
		//Additionally, there is a minor issue for top/bottom connections which results in hallways being connected from the bottom
		//instead of from the top, but this does not affect the connectivity of the map.
		for (let x = 0; x < grid_size_x; x++) {
			if (x > 0) {
				grid[x][0].connected_to_right = true;
				grid[x][grid_size_y - 1].connected_to_right = true;
			}

			//Bug: if grid_size_x <= 2, this branch will never be run.
			//Additionally, because the branch above this has no meaningful hallways produced for
			//x === 1, no connections will be made between columns here.
			//This results in an unconnected map for grid_size_x <= 2.
			if (x < grid_size_x - 2) {
				grid[x + 1][0].connected_to_left = true;
				grid[x + 1][grid_size_y - 1].connected_to_left = true;
			}
		}

		for (let y = 0; y < grid_size_y; y++) {
			if (y > 0) {
				grid[0][y].connected_to_top = true;
				grid[grid_size_x - 1][y].connected_to_top = true;
			}

			//This connection ends up not being set for the bottom row, but this is fine because the other
			//connection to this room is still correct. The result is that hallways here will using the opposing end
			//of the grid cell boundary for their turns compared to top/bottom hallways between other rows.
			if (y < grid_size_y - 2) {
				grid[0][y].connected_to_bottom = true;
				grid[grid_size_x - 1][y].connected_to_bottom = true;
			}
		}
	}

	CreateGridCellConnections(grid, grid_size_x, grid_size_y, list_x, list_y, false);

	EnsureConnectedGrid(grid, grid_size_x, grid_size_y, list_x, list_y);

	GenerateMazeRoom(grid, grid_size_x, grid_size_y, floor_props.maze_room_chance);
	GenerateKecleonShop(grid, grid_size_x, grid_size_y, statusData.kecleon_shop_chance);
	GenerateMonsterHouse(grid, grid_size_x, grid_size_y, statusData.monster_house_chance);

	GenerateExtraHallways(grid, grid_size_x, grid_size_y, floor_props.num_extra_hallways);
	GenerateRoomImperfections(grid, grid_size_x, grid_size_y);
	GenerateSecondaryStructures(grid, grid_size_x, grid_size_y);
}

/**
 * NA: 02342B7C
 * ResetInnerBoundaryTileRows - Resets inner boundary tile rows (y === 1 and y === 30)
 * to their initial state of all wall tiles, with impassable walls at the edges.
 *
 * This is needed because during generation these soft border walls may have been altered or breached.
 */
function ResetInnerBoundaryTileRows() {
	for (let x = 0; x < FLOOR_MAX_X; x++) {
		dungeonData.list_tiles[x][1] = new Tile();

		if (x === 0 || x === FLOOR_MAX_X - 1) {
			dungeonData.list_tiles[x][1].terrain_flags.f_impassable_wall = true;
		}

		dungeonData.list_tiles[x][0x1e] = new Tile();

		if (x === 0 || x === FLOOR_MAX_X - 1) {
			dungeonData.list_tiles[x][0x1e].terrain_flags.f_impassable_wall = true;
		}
	}
}

/**
 * NA: 02340A78
 * EnsureImpassableTilesAreWalls - Force all tiles with the impassable flag to be set as walls.
 */
function EnsureImpassableTilesAreWalls() {
	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			if (dungeonData.list_tiles[x][y].terrain_flags.f_impassable_wall) {
				dungeonData.list_tiles[x][y].terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;
			}
		}
	}
}

/**
 * NA: 0233F93C
 * FinalizeJunctions - Finalizes junction tiles by setting the junction flag and verifying the tiles are open terrain
 *
 * Due to the nature of how this function iterates left-to-right / top-to-bottom, by identifying junctions as any
 * open, non-hallway tile (room_index !== 0xFF) adjacent to an open, hallway tile (room_index === 0xFF), the function
 * runs into issues handling hallway anchors (room_index === 0xFE). The room index of hallway anchors is set to 0xFF using
 * the same loop, which means a hallway anchor may or may not be considered a junction depending on how the connected
 * hallways are oriented.
 *
 * For example, in the configuration below, the "o" tile would be marked as a junction because the neighboring hallway tile
 * to its left comes earlier in iteration, while "o" still has the room index 0xFE, with the algorithm mistaking it for a
 * room tile.
 *
 * X X X X X
 * - - - o X
 * X X X | X
 * X X X | X
 *
 * Alternatively, in the configuration below, the "o" tile would not be marked as a junction because it comes earlier in
 * iteration than any of its neighboring hallway tiles, so its room index is set to 0xFF before it can be marked as a junction.
 * This configuration is actually the only one where a hallway anchor will not be marked as a junction.
 *
 * X X X X X
 * X o - - -
 * X | X X X
 * X | X X X
 */
function FinalizeJunctions() {
	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) continue;

			//Not in a room
			if (dungeonData.list_tiles[x][y].room_index === 0xff) {
				//Tile to the left is in a room (or anchor), mark junction
				if (x > 0 && dungeonData.list_tiles[x - 1][y].room_index !== 0xff) {
					dungeonData.list_tiles[x - 1][y].terrain_flags.f_natural_junction = true;

					//If there's any water/lava on the junction tile, remove it
					if (dungeonData.list_tiles[x - 1][y].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
						dungeonData.list_tiles[x - 1][y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
					}
				}
				//Tile above is in a room
				else if (y > 0 && dungeonData.list_tiles[x][y - 1].room_index !== 0xff) {
					dungeonData.list_tiles[x][y - 1].terrain_flags.f_natural_junction = true;

					//If there's any water/lava on the junction tile, remove it
					if (dungeonData.list_tiles[x][y - 1].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
						dungeonData.list_tiles[x][y - 1].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
					}
				}
				//Tile below is in a room
				else if (y < FLOOR_MAX_Y - 1 && dungeonData.list_tiles[x][y + 1].room_index !== 0xff) {
					dungeonData.list_tiles[x][y + 1].terrain_flags.f_natural_junction = true;

					//If there's any water/lava on the junction tile, remove it
					if (dungeonData.list_tiles[x][y + 1].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
						dungeonData.list_tiles[x][y + 1].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
					}
				}
				//Tile to the right is in a room
				else if (x < FLOOR_MAX_X - 1 && dungeonData.list_tiles[x + 1][y].room_index !== 0xff) {
					dungeonData.list_tiles[x + 1][y].terrain_flags.f_natural_junction = true;

					//If there's any water/lava on the junction tile, remove it
					if (dungeonData.list_tiles[x + 1][y].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
						dungeonData.list_tiles[x + 1][y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
					}
				}
			}
			//Hallway Anchor
			else if (dungeonData.list_tiles[x][y].room_index === 0xfe) {
				dungeonData.list_tiles[x][y].room_index = 0xff;
			}
		}
	}

	//TODO: Investigate relevance of GenerateNaturalJunctionList()
	//GenerateNaturalJunctionList();
}

/**
 * NA: 0234176C
 * SetSecondaryTerrainOnWall - Set a specific tile to have secondary terrain if the tile
 * is a passable wall.
 */
function SetSecondaryTerrainOnWall(tile: Tile) {
	if (tile.terrain_flags.f_impassable_wall || tile.terrain_flags.terrain_type !== TerrainType.TERRAIN_WALL) return;

	tile.terrain_flags.terrain_type = TerrainType.TERRAIN_SECONDARY;
}

/**
 * NA: 023417AC
 * GenerateSecondaryTerrainFormations - Generates secondary terrain (water/lava) formations
 *
 * This generation includes rivers, lakes along the river path, and standalone lakes.
 *
 * The river flows from top-to-bottom or bottom-to-top, using a random walk ending when the walk
 * goes out of bounds or finds existing secondary terrain. Because of this, rivers can end prematurely
 * when a lake is generated.
 *
 * Lakes are a large collection of secondary terrain generated around a central point.
 * Standalone lakes are generated based on secondary_terrain_density
 *
 * The formations will never cut into room tiles, but can pass through to the other side.
 */
function GenerateSecondaryTerrainFormations(test_flag: boolean, floor_props: FloorProperties) {
	if (!floor_props.room_flags.f_secondary_terrain_generation || !test_flag) return;

	//Generate 1-3 "river+lake" formations
	const num_to_gen = [1, 1, 1, 2, 2, 2, 3, 3][dungeonRand.RandInt(8)];

	for (let i = 0; i < num_to_gen; i++) {
		//Randomly pick between starting from the bottom going up, or from the top going down
		let pt_x, pt_y, dir_x, dir_y, dir_y_upwards;

		if (dungeonRand.RandInt(100) < 50) {
			pt_y = FLOOR_MAX_Y - 1;
			dir_y = -1;
			dir_y_upwards = true;
		} else {
			pt_y = 0;
			dir_y = 1;
			dir_y_upwards = false;
		}

		let steps_until_lake = dungeonRand.RandInt(50) + 10;

		//Pick a random column in the interior to start the river on
		pt_x = dungeonRand.RandRange(2, FLOOR_MAX_X - 2);
		dir_x = 0;

		let done = false;
		while (!done) {
			//
			let generated_river_tiles: boolean = false;

			//Fill in tiles in chunks of size 2-7 before changing the flow direction
			const num_tiles_fill = dungeonRand.RandInt(6) + 2;
			for (let v = 0; v < num_tiles_fill; v++) {
				if (pt_x >= 0 && pt_x < FLOOR_MAX_X) {
					let tile: Tile;

					if (pt_y >= 0 && pt_y < FLOOR_MAX_Y) {
						tile = dungeonData.list_tiles[pt_x][pt_y];
					} else {
						tile = DEFAULT_TILE;
					}

					if (tile.terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
						done = true;

						if (generated_river_tiles) {
							OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SECONDARY_TERRAIN_RIVER);
						}
						break;
					}

					if (!PosIsOutOfBounds(pt_x, pt_y)) {
						//Fill in secondary terrain as we go
						SetSecondaryTerrainOnWall(dungeonData.list_tiles[pt_x][pt_y]);
						generated_river_tiles = true;
					}
				}

				//Move to the next tile
				pt_x += dir_x;
				pt_y += dir_y;

				//Vertically out of bounds, stop
				if (pt_y < 0 || pt_y >= FLOOR_MAX_Y) {
					OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SECONDARY_TERRAIN_RIVER);
					break;
				}

				steps_until_lake -= 1;

				if (steps_until_lake !== 0) continue;

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SECONDARY_TERRAIN_RIVER);

				//After we go a certain number of steps, make a "lake"

				//This loop will attempt to generate new lake tiles up to 64 times
				//We select a random tile, check for space and nearby secondary terrain tiles,
				//then if verified add a new lake tile.
				for (let j = 0; j < 64; j++) {
					//Each tile is in a random location +-3 tiles from the current cursor in either direction
					const offset_x = dungeonRand.RandInt(7) - 3;
					const offset_y = dungeonRand.RandInt(7) - 3;

					const target_x = pt_x + offset_x;
					const target_y = pt_y + offset_y;

					//Check that there's enough space for a lake within a 2 tile margin of the map bounds
					if (target_x >= 2 && target_x < FLOOR_MAX_X - 2 && target_y >= 2 && target_y < FLOOR_MAX_Y - 2) {
						//Make secondary terrain here if it's within 2 tiles
						//of a tile that's currently secondary terrain
						//This results in a "cluster" akin to a lake

						let second_near = false;

						for (let x = -1; x < 2; x++) {
							for (let y = -1; y < 2; y++) {
								if (dungeonData.list_tiles[target_x + x][target_y + y].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
									second_near = true;
									break;
								}
							}

							if (second_near) break;
						}

						if (second_near) {
							if (!PosIsOutOfBounds(target_x, target_y)) {
								SetSecondaryTerrainOnWall(dungeonData.list_tiles[target_x][target_y]);
							}
						}
					}
				}

				//Finalization/gap-filling step because the random approach
				//might leave weird gaps. Go through every tile and do an
				//online nearest-neighbor interpolation of secondary terrain
				//tiles to smoothen out the "lake"
				for (let offset_x = -3; offset_x < 4; offset_x++) {
					for (let offset_y = -3; offset_y < 4; offset_y++) {
						const target_x = pt_x + offset_x;
						const target_y = pt_y + offset_y;

						let num_adjacent = 0;

						if (target_x >= 2 && target_x < FLOOR_MAX_X - 2 && target_y >= 2 && target_y < FLOOR_MAX_Y - 2) {
							//Count the number of secondary terrain tiles adjacent (all 8 directions)
							for (let x = -1; x < 2; x++) {
								for (let y = -1; y < 2; y++) {
									if (x === 0 && y === 0) continue;

									if (dungeonData.list_tiles[target_x + x][target_y + y].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
										num_adjacent += 1;
									}
								}
							}

							//If at least half are secondary terrain, make this tile secondary terrain as well
							if (num_adjacent >= 4) {
								if (!PosIsOutOfBounds(target_x, target_y)) {
									SetSecondaryTerrainOnWall(dungeonData.list_tiles[target_x][target_y]);
								}
							}
						}
					}
				}

				OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SECONDARY_TERRAIN_RIVER_LAKE);
			}

			//Creating a lake doesn't mean we are done yet
			//but it's likely that the next iteration will hit the tile
			//stopping condition for secondary terrain, if not the river continues
			if (!done) {
				//Alternate between horizontal and vertical movement each iteration
				if (dir_x !== 0) {
					//The y direction never reverses, ensuring the river doesn't
					//double back on itself and cuts across the map only once
					if (dir_y_upwards) {
						dir_y = -1;
					} else {
						dir_y = 1;
					}

					dir_x = 0;
				} else {
					//Randomly pick between left and right
					if (dungeonRand.RandInt(100) < 50) {
						dir_x = -1;
					} else {
						dir_x = 1;
					}

					dir_y = 0;
				}
			}

			if (pt_y < 0 || pt_y >= FLOOR_MAX_Y) {
				//Vertically out of bounds, stop
				done = true;
			}
		}
	}

	//Generate standalone lakes secondary_terrain_density # of times
	for (let i = 0; i < floor_props.secondary_terrain_density; i++) {
		//Try to pick a random tile in the interior to seed the "lake"
		//Incredibly unlikely to fail
		let attempts = 0;
		let rnd_x = 0,
			rnd_y = 0;

		while (attempts < 200) {
			rnd_x = dungeonRand.RandInt(FLOOR_MAX_X);
			rnd_y = dungeonRand.RandInt(FLOOR_MAX_Y);

			if (rnd_x >= 1 && rnd_x < FLOOR_MAX_X - 1 && rnd_y >= 1 && rnd_y < FLOOR_MAX_Y - 1) break;

			attempts++;
		}

		if (attempts === 200) continue;

		//Make a 10x10 grid with true on the boundary and false on the interior
		let table: boolean[][] = new Array(10);
		for (let x = 0; x < 10; x++) {
			table[x] = new Array(10);

			for (let y = 0; y < 10; y++) {
				if (x === 0 || y === 0 || x === 9 || y === 9) {
					table[x][y] = true;
				} else {
					table[x][y] = false;
				}
			}
		}

		//Generate an "inverse lake" by spreading the true values inwards
		for (let v = 0; v < 80; v++) {
			//Pick a random interior point on the 10x10 grid
			const x = dungeonRand.RandInt(8) + 1;
			const y = dungeonRand.RandInt(8) + 1;

			if (table[x - 1][y] || table[x + 1][y] || table[x][y - 1] || table[x][y + 1]) {
				table[x][y] = true;
			}
		}

		//Iterate through the grid, any spaces which are still false form the inverse-inverse lake
		//or as some may prefer to call it, just a regular lake!
		for (let x = 0; x < 10; x++) {
			for (let y = 0; y < 10; y++) {
				if (!table[x][y]) {
					//Shift the 0-10 random offset position into +- 5 to center around the lake seed tile
					if (!PosIsOutOfBounds(rnd_x + x - 5, rnd_y + y - 5)) {
						SetSecondaryTerrainOnWall(dungeonData.list_tiles[rnd_x + x - 5][rnd_y + y - 5]);
					} else {
						SetSecondaryTerrainOnWall(DEFAULT_TILE);
					}
				}
			}
		}

		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SECONDARY_TERRAIN_STANDALONE_LAKE);
	}

	//Clean up secondary terrain that got in places it shouldn't
	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type !== TerrainType.TERRAIN_SECONDARY) continue;

			//Revert tiles back to open terrain if:
			// - in a kecleon shop
			// - in a monster house
			// - is an unbreakable tile
			// - on a stairs spawn point
			//This really shouldn't happen since we only place terrain on wall tiles to begin with,
			//but it provides additional safety

			if (
				dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop ||
				dungeonData.list_tiles[x][y].terrain_flags.f_in_monster_house ||
				dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable ||
				dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable ||
				dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_stairs
			) {
				dungeonData.list_tiles[x][y].terrain_flags.terrain_type = TerrainType.TERRAIN_NORMAL;
			} else {
				//Revert to wall tiles if they're on the soft/hard borders
				if (x <= 1 || x >= FLOOR_MAX_X - 1 || y <= 1 || y >= FLOOR_MAX_Y - 1) {
					dungeonData.list_tiles[x][y].terrain_flags.terrain_type = TerrainType.TERRAIN_WALL;
				}
			}
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_GENERATE_SECONDARY_TERRAIN);
}

/**
 * NA: 02342C8C
 * SpawnStairs - Spawns stairs at a given location.
 *
 * If a hidden stairs type is specified, hidden stairs will spawn instead.
 *
 * If spawning normal stairs and the current floor is a rescue floor, the room
 * with the stairs will be converted into a Monster House.
 */
function SpawnStairs(x: number, y: number, hidden_stairs_type: HiddenStairsType) {
	dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_item = false;
	dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_stairs = true;

	if (hidden_stairs_type === HiddenStairsType.HIDDEN_STAIRS_NONE) {
		//Normal stairs
		dungeonGenerationInfo.stairs_spawn_x = x;
		dungeonGenerationInfo.stairs_spawn_y = y;
		statusData.stairs_room_index = dungeonData.list_tiles[x][y].room_index;
	} else {
		//Hidden stairs
		if (statusData.second_spawn) {
			statusData.hidden_stairs_spawn_x = x;
			statusData.hidden_stairs_spawn_y = y;
		} else {
			dungeonGenerationInfo.hidden_stairs_spawn_x = x;
			dungeonGenerationInfo.hidden_stairs_spawn_y = y;
			dungeonGenerationInfo.hidden_stairs_type = hidden_stairs_type;
		}
	}

	//If we're spawning normal stairs and this is a rescue floor, make the stairs room a Monster House
	if (hidden_stairs_type === HiddenStairsType.HIDDEN_STAIRS_NONE && GetFloorType() === FloorType.FLOOR_TYPE_RESCUE) {
		let room_index = dungeonData.list_tiles[x][y].room_index;
		for (let cur_x = 0; cur_x < FLOOR_MAX_X; cur_x++) {
			for (let cur_y = 0; cur_y < FLOOR_MAX_Y; cur_y++) {
				if (
					dungeonData.list_tiles[cur_x][cur_y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
					dungeonData.list_tiles[cur_x][cur_y].room_index === room_index
				) {
					dungeonData.list_tiles[cur_x][cur_y].terrain_flags.f_in_monster_house = true;
					dungeonGenerationInfo.monster_house_room = dungeonData.list_tiles[x][y].room_index;
				}
			}
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_STAIRS);
}

/**
 * NA: 02340CE4
 * ShuffleSpawnPositions - Randomly shuffle an array of spawn positions
 */
function ShuffleSpawnPositions(spawn_x: number[], spawn_y: number[]) {
	//Do twice as many swaps as there are items in the array
	for (let i = 0; i < spawn_x.length * 2; i++) {
		let a = dungeonRand.RandInt(spawn_x.length);
		let b = dungeonRand.RandInt(spawn_x.length);

		let temp_x = spawn_x[a];
		let temp_y = spawn_y[a];
		spawn_x[a] = spawn_x[b];
		spawn_y[a] = spawn_y[b];

		spawn_x[b] = temp_x;
		spawn_y[b] = temp_y;
	}
}

/**
 * NA: 02340D4C
 * SpawnNonEnemies - Spawns all non-enemy entities: Stairs, Items, Traps, and the player.
 *
 * Most entities spawn randomly on a subset of the valid tiles for their type.
 *
 * These spawns are categorized into:
 * - Stairs (and hidden stairs)
 * - Normal Items
 * - Buried Items
 * - Monster House Items/Traps
 * - Normal Traps
 * - Player Spawn
 *
 * See below for specific conditions on each type of spawn.
 */
function SpawnNonEnemies(floor_props: FloorProperties, is_empty_monster_house: boolean) {
	//Spawn Stairs
	if (dungeonGenerationInfo.stairs_spawn_x === -1 || dungeonGenerationInfo.stairs_spawn_y === -1) {
		let valid_spawns_x = [],
			valid_spawns_y = [];

		for (let x = 0; x < FLOOR_MAX_X; x++) {
			for (let y = 0; y < FLOOR_MAX_Y; y++) {
				//The stairs can spawn on tiles that are:
				// - Open Terrain
				// - In a room
				// - Not in a Kecleon Shop
				// - Not an enemy spawn
				// - Not a special tile (flagged by kecleon shops, traps, and items)
				// - Not a junction tile (next to a hallway)
				// - Not a special tile that can't be broken by Absolute Mover

				if (
					dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
					dungeonData.list_tiles[x][y].room_index !== 0xff &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
					!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_monster &&
					!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_special_tile &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_natural_junction &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable
				) {
					valid_spawns_x.push(x);
					valid_spawns_y.push(y);
				}
			}
		}

		if (valid_spawns_x.length > 0) {
			//Randomly select one of the valid tiles to spawn the stairs on
			const stairs_index = dungeonRand.RandInt(valid_spawns_x.length);
			SpawnStairs(valid_spawns_x[stairs_index], valid_spawns_y[stairs_index], HiddenStairsType.HIDDEN_STAIRS_NONE);

			if (statusData.hidden_stairs_type !== HiddenStairsType.HIDDEN_STAIRS_NONE) {
				//Spawn hidden stairs, just not where the normal stairs are!
				valid_spawns_x.splice(stairs_index, 1);
				valid_spawns_y.splice(stairs_index, 1);

				//Only spawn hidden stairs if we're not on the last floor of the dungeon
				if (dungeonData.floor + 1 < dungeonData.n_floors_plus_one) {
					dungeonRand.DungeonRngSetSecondary(3);
					const hidden_index = dungeonRand.RandInt(valid_spawns_x.length);
					SpawnStairs(valid_spawns_x[hidden_index], valid_spawns_y[hidden_index], statusData.hidden_stairs_type);
				}
			}
		}
	}

	//Spawn normal items
	let valid_spawns_x = [],
		valid_spawns_y = [];

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			//Normal items can spawn on tiles that are:
			// - Open Terrain
			// - In a room
			// - Not in a Kecleon Shop
			// - Not in a Monster House
			// - Not a junction tile (next to a hallway)
			// - Not a special tile that can't be broken by Absolute Mover

			if (
				dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[x][y].room_index !== 0xff &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_in_monster_house &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_natural_junction &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable
			) {
				valid_spawns_x.push(x);
				valid_spawns_y.push(y);
			}
		}
	}

	if (valid_spawns_x.length > 0) {
		let num_items = floor_props.item_density;
		if (num_items !== 0) {
			//Add variation to the item count
			num_items = Math.max(dungeonRand.RandRange(num_items - 2, num_items + 2), 1);
		}

		if (dungeonData.guaranteed_item_id !== 0) {
			//Account for a guaranteed item spawn
			num_items += 1;
		}

		dungeonData.num_items = num_items + 1;

		if (num_items + 1 > 0) {
			//Randomly select among the valid item spawn spots
			ShuffleSpawnPositions(valid_spawns_x, valid_spawns_y);
			let cur_index = dungeonRand.RandInt(valid_spawns_x.length);
			num_items += 1;
			for (let i = 0; i < num_items; i++) {
				const pos_x = valid_spawns_x[cur_index];
				const pos_y = valid_spawns_y[cur_index];

				cur_index++;

				if (cur_index === valid_spawns_x.length) {
					//Wrap around to the start
					cur_index = 0;
				}

				//Spawn an item here
				dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_item = true;
			}

			OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_ITEMS);
		}
	}

	//Spawn Buried Items (in walls)
	valid_spawns_x = [];
	valid_spawns_y = [];

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			//Any wall tile is all buried items need
			if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_WALL) {
				valid_spawns_x.push(x);
				valid_spawns_y.push(y);
			}
		}
	}

	if (valid_spawns_x.length > 0) {
		let num_items = floor_props.buried_item_density;

		if (num_items !== 0) {
			//Add variation to the item count
			num_items = dungeonRand.RandRange(num_items - 2, num_items + 2);
		}

		if (num_items > 0) {
			//Randomly select among the valid item spawn spots
			ShuffleSpawnPositions(valid_spawns_x, valid_spawns_y);
			let cur_index = dungeonRand.RandInt(valid_spawns_x.length);
			for (let i = 0; i < num_items; i++) {
				const pos_x = valid_spawns_x[cur_index];
				const pos_y = valid_spawns_y[cur_index];

				cur_index++;

				if (cur_index === valid_spawns_x.length) {
					//Wrap around to the start
					cur_index = 0;
				}

				//Spawn an item here
				dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_item = true;
			}

			OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_BURIED_ITEMS);
		}
	}

	//Spawn items/traps in a non-empty Monster House
	valid_spawns_x = [];
	valid_spawns_y = [];

	if (!is_empty_monster_house) {
		for (let x = 0; x < FLOOR_MAX_X; x++) {
			for (let y = 0; y < FLOOR_MAX_Y; y++) {
				//Monster House items/traps can spawn on tiles that are:
				// - not in a kecleon shop (how would they be?)
				// - in a Monster House
				// - not a junction (near a hallway)
				if (
					!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
					dungeonData.list_tiles[x][y].terrain_flags.f_in_monster_house &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_natural_junction
				) {
					valid_spawns_x.push(x);
					valid_spawns_y.push(y);
				}
			}
		}
	}

	if (valid_spawns_x.length > 0) {
		//Choose a subset of the available tiles to spawn stuff on
		let num_items = Math.max(6, dungeonRand.RandRange(Math.floor((5 * valid_spawns_x.length) / 10), Math.floor((8 * valid_spawns_x.length) / 10)));

		//Cap item spawns at 7 (normally)
		if (num_items >= generationConstants.max_number_monster_house_item_spawns) {
			num_items = generationConstants.max_number_monster_house_item_spawns;
		}

		//Randomly select among the valid item spawn spots
		ShuffleSpawnPositions(valid_spawns_x, valid_spawns_y);
		let cur_index = dungeonRand.RandInt(valid_spawns_x.length);
		for (let i = 0; i < num_items; i++) {
			const pos_x = valid_spawns_x[cur_index];
			const pos_y = valid_spawns_y[cur_index];

			cur_index++;

			if (cur_index === valid_spawns_x.length) {
				//Wrap around to the start
				cur_index = 0;
			}

			//50/50 chance of spawning an item or a trap
			if (dungeonRand.RandInt(2) === 1) {
				//Spawn an item
				dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_item = true;
			} else if (dungeonData.nonstory_flag || dungeonData.id >= generationConstants.first_dungeon_id_allow_monster_house_traps) {
				dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_trap = true;
			}
		}

		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_MONSTER_HOUSE_ITEMS_TRAPS);
	}

	//Spawn Normal Traps
	valid_spawns_x = [];
	valid_spawns_y = [];

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			//Normal traps can spawn on tiles that are:
			// - Open Terrain
			// - In a room
			// - Not in a Kecleon Shop
			// - Don't already have an item spawn
			// - Not a junction tile (next to a hallway)
			// - Not a special tile that can't be broken by Absolute Mover

			if (
				dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[x][y].room_index !== 0xff &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
				!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_item &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_natural_junction &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable
			) {
				valid_spawns_x.push(x);
				valid_spawns_y.push(y);
			}
		}
	}

	if (valid_spawns_x.length > 0) {
		let num_traps = dungeonRand.RandRange(Math.floor(floor_props.trap_density / 2), floor_props.trap_density);

		if (num_traps > 0) {
			if (num_traps >= 56) {
				//Cap the number of traps at 56
				num_traps = 56;
			}

			//Randomly select among the valid item spawn spots
			ShuffleSpawnPositions(valid_spawns_x, valid_spawns_y);
			let cur_index = dungeonRand.RandInt(valid_spawns_x.length);
			for (let i = 0; i < num_traps; i++) {
				const pos_x = valid_spawns_x[cur_index];
				const pos_y = valid_spawns_y[cur_index];

				cur_index++;

				if (cur_index === valid_spawns_x.length) {
					//Wrap around to the start
					cur_index = 0;
				}

				//Spawn a trap here
				dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_trap = true;
			}

			OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_TRAPS);
		}
	}

	let is_rescue_floor: boolean;

	if (GetFloorType() === FloorType.FLOOR_TYPE_RESCUE) {
		is_rescue_floor = true;
	} else {
		is_rescue_floor = false;
	}

	//Spawn the player
	if (dungeonGenerationInfo.player_spawn_x === -1 || dungeonGenerationInfo.player_spawn_y === -1) {
		let valid_spawns_x = [],
			valid_spawns_y = [];

		for (let x = 0; x < FLOOR_MAX_X; x++) {
			for (let y = 0; y < FLOOR_MAX_Y; y++) {
				//The player can spawn on tiles that are:
				// - Open Terrain
				// - In a room
				// - Not in a Kecleon Shop
				// - Not a junction tile (next to a hallway)
				// - Not a special tile that can't be broken by Absolute Mover
				// - Not an item, enemy, or trap spawn

				if (
					dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
					dungeonData.list_tiles[x][y].room_index !== 0xff &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_natural_junction &&
					!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable &&
					!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_item &&
					!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_monster &&
					!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_trap
				) {
					//Also, on rescue floors the player can't spawn directly on the stairs
					if (!is_rescue_floor || !dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_stairs) {
						valid_spawns_x.push(x);
						valid_spawns_y.push(y);
					}
				}
			}
		}

		if (valid_spawns_x.length > 0) {
			//Randomly select one of the valid tiles to spawn the player on
			const spawn_index = dungeonRand.RandInt(valid_spawns_x.length);
			dungeonGenerationInfo.player_spawn_x = valid_spawns_x[spawn_index];
			dungeonGenerationInfo.player_spawn_y = valid_spawns_y[spawn_index];

			OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_PLAYER);
		}
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_SPAWN_NON_ENEMIES);
}

/**
 * NA: 02341470
 * SpawnEnemies - Spawns all enemies, including those in forced monster houses
 */
function SpawnEnemies(floor_props: FloorProperties, is_empty_monster_house: boolean) {
	let valid_spawns_x = [],
		valid_spawns_y = [];
	let num_enemies: number;

	if (floor_props.enemy_density < 1) {
		//Negative means exact value
		num_enemies = Math.abs(floor_props.enemy_density);
	} else {
		//Positive means value with variance
		num_enemies = dungeonRand.RandRange(Math.floor(floor_props.enemy_density / 2), floor_props.enemy_density);

		if (num_enemies < 1) {
			num_enemies = 1;
		}
	}

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			// Enemies can spawn on tiles that are:
			// - Open Terrain
			// - In a room
			// - Not in a Kecleon Shop
			// - Don't have stairs, an item, or another enemy spawn
			// - Not a special tile that can't be broken by Absolute Mover
			// - Not where the player spawns
			// - Not in the monster house room

			if (
				dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[x][y].room_index !== 0xff &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
				!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_item &&
				!dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_stairs &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_natural_junction &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable
			) {
				if (dungeonGenerationInfo.player_spawn_x !== x || dungeonGenerationInfo.player_spawn_y !== y) {
					if (!statusData.no_enemy_spawn || dungeonGenerationInfo.monster_house_room !== dungeonData.list_tiles[x][y].room_index) {
						valid_spawns_x.push(x);
						valid_spawns_y.push(y);
					}
				}
			}
		}
	}

	if (valid_spawns_x.length > 0 && num_enemies + 1 > 0) {
		//Randomly select among the valid item spawn spots
		ShuffleSpawnPositions(valid_spawns_x, valid_spawns_y);

		num_enemies += 1;

		let cur_index = dungeonRand.RandInt(valid_spawns_x.length);

		for (let i = 0; i < num_enemies; i++) {
			const pos_x = valid_spawns_x[cur_index];
			const pos_y = valid_spawns_y[cur_index];

			cur_index++;

			if (cur_index === valid_spawns_x.length) {
				//Wrap around to the start
				cur_index = 0;
			}

			//Spawn an enemy here
			dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_monster = true;
		}

		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_NON_MONSTER_HOUSE_ENEMIES);
	}

	if (!dungeonGenerationInfo.force_create_monster_house) {
		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_SPAWN_ENEMIES);
		return;
	}

	//This floor was marked to force a monster house
	//Place extra enemy spawns in the Monster House room
	valid_spawns_x = [];
	valid_spawns_y = [];

	let num_monster_house_spawn = generationConstants.max_number_monster_house_enemy_spawns;

	if (is_empty_monster_house) {
		//An "empty" monster house only spawns 3 enemies
		num_monster_house_spawn = 3;
	}

	if (dungeonGenerationInfo.force_create_monster_house) {
		num_monster_house_spawn = Math.floor((num_monster_house_spawn * 3) / 2);
	}

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			// Monster House enemies can spawn on tiles that are:
			// - Open Terrain
			// - In a room
			// - Not in a Kecleon Shop
			// - Don't have stairs, an item, or another enemy spawn
			// - Not a special tile that can't be broken by Absolute Mover
			// - Not where the player spawns
			// - Not in the monster house room

			if (
				dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL &&
				dungeonData.list_tiles[x][y].room_index !== 0xff &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_in_kecleon_shop &&
				!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable &&
				dungeonData.list_tiles[x][y].terrain_flags.f_in_monster_house
			) {
				if (dungeonGenerationInfo.player_spawn_x !== x || dungeonGenerationInfo.player_spawn_y !== y) {
					valid_spawns_x.push(x);
					valid_spawns_y.push(y);
				}
			}
		}
	}

	if (valid_spawns_x.length > 0) {
		num_enemies = Math.max(1, dungeonRand.RandRange(Math.floor((7 * valid_spawns_x.length) / 10), Math.floor((8 * valid_spawns_x.length) / 10)));

		if (num_enemies >= num_monster_house_spawn) {
			//Don't spawn more enemies than the designated limit
			num_enemies = num_monster_house_spawn;
		}

		//Randomly select among the valid item spawn spots
		ShuffleSpawnPositions(valid_spawns_x, valid_spawns_y);

		let cur_index = dungeonRand.RandInt(valid_spawns_x.length);

		for (let i = 0; i < num_enemies; i++) {
			const pos_x = valid_spawns_x[cur_index];
			const pos_y = valid_spawns_y[cur_index];

			cur_index++;

			if (cur_index === valid_spawns_x.length) {
				//Wrap around to the start
				cur_index = 0;
			}

			//Spawn an enemy here
			dungeonData.list_tiles[pos_x][pos_y].spawn_or_visibility_flags.f_monster = true;
		}

		OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MINOR, MinorGenerationType.GEN_TYPE_SPAWN_MONSTER_HOUSE_EXTRA_ENEMIES);
	}

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_MAJOR, MajorGenerationType.GEN_TYPE_SPAWN_ENEMIES);
}

/**
 * NA: 02340974
 * ResolveInvalidSpawns - Resolve any potentially invalid spawns on tiles.
 *
 * Obstacles can't spawn traps, impassable obstacles can't spawn items (you aren't able to reach them)
 *
 * A tile marked for the stairs must not have a trap there
 *
 * A tile marked for an item also must not have a trap there
 */
function ResolveInvalidSpawns() {
	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) {
				if (dungeonData.list_tiles[x][y].terrain_flags.f_impassable_wall && dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable) {
					//This tile is an impassable obstacle, make sure no items spawn here
					dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_item = false;
				}

				//This tile is an obstacle, make sure no traps spawn here
				dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_trap = false;
			}

			if (dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_stairs) {
				//This tile has the stairs, make sure the stairs bit is set and
				//make sure no traps spawn here
				dungeonData.list_tiles[x][y].terrain_flags.f_stairs = true;
				dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_trap = false;
			}

			if (dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_item) {
				//This tile is an item spawn, make sure no traps spawn here
				dungeonData.list_tiles[x][y].spawn_or_visibility_flags.f_trap = false;
			}
		}
	}
}

/**
 * NA: 02341E6C
 * StairsAlwaysReachable - Checks that the stairs are always reachable from every walkable tile on the floor
 *
 * Uses a graph-traversal similar to Breadth-First Search (but with slightly different order due to how
 * iteration works))
 *
 * If any tile is walkable but wasn't reached, this function will return false.
 * If every tile was reached, this function will return true.
 */
function StairsAlwaysReachable(x_stairs: number, y_stairs: number, mark_unreachable: boolean): boolean {
	let test: StairsReachableFlags[][] = new Array(FLOOR_MAX_X);

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		test[x] = new Array(FLOOR_MAX_Y);

		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			test[x][y] = new StairsReachableFlags();

			if (mark_unreachable) {
				//Reset all unreachable flags on tiles, they'll be recomputed from scratch
				dungeonData.list_tiles[x][y].terrain_flags.f_unreachable_from_stairs = false;
			}

			if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type !== TerrainType.TERRAIN_NORMAL) {
				if (!dungeonData.list_tiles[x][y].terrain_flags.f_corner_cuttable) {
					test[x][y].f_cannot_corner_cut = true;
				}
			}

			if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_SECONDARY) {
				if (!dungeonData.list_tiles[x][y].terrain_flags.f_corner_cuttable) {
					test[x][y].f_secondary_terrain_cannot_corner_cut = true;
				}
			}
		}
	}

	test[x_stairs][y_stairs].f_starting_point = true;
	test[x_stairs][y_stairs].f_in_visit_queue = true;

	if (dungeonGenerationInfo.stairs_spawn_x !== x_stairs && dungeonGenerationInfo.stairs_spawn_y !== y_stairs) {
		return false;
	}

	statusData.num_tiles_reachable_from_stairs = 0;
	let count = 0;
	let checked = 1;

	// Uses a semi-BFS starting from the stairs until all reachable tiles
	// have been visited
	while (checked !== 0) {
		count += 1;
		checked = 0;

		for (let x = 0; x < FLOOR_MAX_X; x++) {
			for (let y = 0; y < FLOOR_MAX_Y; y++) {
				if (!test[x][y].f_visited && test[x][y].f_in_visit_queue) {
					test[x][y].f_in_visit_queue = false;
					test[x][y].f_visited = true;
					checked += 1;

					//Queue up in cardinal directions of this tile

					//Left
					if (x > 0 && !test[x - 1][y].f_cannot_corner_cut && !test[x - 1][y].f_secondary_terrain_cannot_corner_cut && !test[x - 1][y].f_visited) {
						test[x - 1][y].f_in_visit_queue = true;
					}

					//Up
					if (y > 0 && !test[x][y - 1].f_cannot_corner_cut && !test[x][y - 1].f_secondary_terrain_cannot_corner_cut && !test[x][y - 1].f_visited) {
						test[x][y - 1].f_in_visit_queue = true;
					}

					//Right
					if (
						x < FLOOR_MAX_X - 1 &&
						!test[x + 1][y].f_cannot_corner_cut &&
						!test[x + 1][y].f_secondary_terrain_cannot_corner_cut &&
						!test[x + 1][y].f_visited
					) {
						test[x + 1][y].f_in_visit_queue = true;
					}

					//Down
					if (
						y < FLOOR_MAX_Y - 1 &&
						!test[x][y + 1].f_cannot_corner_cut &&
						!test[x][y + 1].f_secondary_terrain_cannot_corner_cut &&
						!test[x][y + 1].f_visited
					) {
						test[x][y + 1].f_in_visit_queue = true;
					}

					//Note:
					//For corner directions, checks are also made on the 3rd bit
					//of the test array, but this value is never assigned
					//I have removed this check here since its use is unclear.
					//(This should not change behavior)

					//Up-left
					if (
						x > 0 &&
						y > 0 &&
						!test[x - 1][y - 1].f_cannot_corner_cut &&
						!test[x - 1][y - 1].f_secondary_terrain_cannot_corner_cut &&
						!test[x - 1][y - 1].f_unknown_field_0x2 &&
						!test[x - 1][y - 1].f_visited &&
						!test[x][y - 1].f_cannot_corner_cut &&
						!test[x - 1][y].f_cannot_corner_cut
					) {
						test[x - 1][y - 1].f_in_visit_queue = true;
					}

					//Up-Right
					if (
						x < FLOOR_MAX_X - 1 &&
						y > 0 &&
						!test[x + 1][y - 1].f_cannot_corner_cut &&
						!test[x + 1][y - 1].f_secondary_terrain_cannot_corner_cut &&
						!test[x + 1][y - 1].f_unknown_field_0x2 &&
						!test[x + 1][y - 1].f_visited &&
						!test[x][y - 1].f_cannot_corner_cut &&
						!test[x + 1][y].f_cannot_corner_cut
					) {
						test[x + 1][y - 1].f_in_visit_queue = true;
					}

					//Down-left
					if (
						x > 0 &&
						y < FLOOR_MAX_Y - 1 &&
						!test[x - 1][y + 1].f_cannot_corner_cut &&
						!test[x - 1][y + 1].f_secondary_terrain_cannot_corner_cut &&
						!test[x - 1][y + 1].f_unknown_field_0x2 &&
						!test[x - 1][y + 1].f_visited &&
						!test[x][y + 1].f_cannot_corner_cut &&
						!test[x - 1][y].f_cannot_corner_cut
					) {
						test[x - 1][y + 1].f_in_visit_queue = true;
					}

					//Down-right
					if (
						x < FLOOR_MAX_X - 1 &&
						y < FLOOR_MAX_Y - 1 &&
						!test[x + 1][y + 1].f_cannot_corner_cut &&
						!test[x + 1][y + 1].f_secondary_terrain_cannot_corner_cut &&
						!test[x + 1][y + 1].f_unknown_field_0x2 &&
						!test[x + 1][y + 1].f_visited &&
						!test[x][y + 1].f_cannot_corner_cut &&
						!test[x + 1][y].f_cannot_corner_cut
					) {
						test[x + 1][y + 1].f_in_visit_queue = true;
					}
				}
			}
		}
	}

	statusData.num_tiles_reachable_from_stairs = count;

	for (let x = 0; x < FLOOR_MAX_X; x++) {
		for (let y = 0; y < FLOOR_MAX_Y; y++) {
			if (
				!test[x][y].f_cannot_corner_cut &&
				!test[x][y].f_secondary_terrain_cannot_corner_cut &&
				!test[x][y].f_unknown_field_0x2 &&
				!test[x][y].f_visited
			) {
				//This is an open tile that wasn't visited by BFS, which means it's unreachable
				//from the starting stairs
				if (mark_unreachable) {
					dungeonData.list_tiles[x][y].terrain_flags.f_unreachable_from_stairs = true;
				} else {
					//unbreakable tiles can't really be navigated onto anyways, so if
					//we can ignore the tile (otherwise it's a problem!)
					if (!dungeonData.list_tiles[x][y].terrain_flags.f_unbreakable) {
						return false;
					}
				}
			}
		}
	}

	return true;
}

/**
 * NA: 0233A6D8
 * GenerateFloor - The Master Function for generating a dungeon floor
 *
 * Runs based on 3 loop levels of safety
 *
 * Innermost Loop: 32 attempts for deciding the maximum rooms in each dimension for the floor
 * 		- The dimensions are capped at 6x4 (but we can randomize outside this range and fail)
 * 		- Must maintain a certain number of tiles per grid cell in both dimensions
 * 		- If this loop fails 32 times, defaults to a 4x4 maximum
 *
 * Inner Main Loop: 10 attempts for the main layout of a floor
 * 		- This loop can fail by being marked invalid during generation
 * 		- Or, it can fail by having < 2 rooms or < 20 room tiles
 * 		- This occurs prior to secondary terrain generation
 * 		- If the loop fails 10 times, defaults to generating a One-Room Monster House
 *
 * Outermost Loop: 10 attempts for everything involved in generating a layout
 * 		- This is where secondary terrain generation and junction additions takes place
 * 		- This loop can fail during spawn location verification (can you get to the stairs?)
 * 		- If the loop fails 10 times, defaults to generating a One-Room Monster House
 */
function GenerateFloor(floor_props: FloorProperties): Tile[][] {
	//TODO: Continue early GenerateFloor operations
	//dungeonData.field_0x12aa4 = false;
	//dungeonData.field_0x3fc2 = false;

	//LoadFixedRoomDataVeneer();
	//value from fixed room data function call

	//dungeonData.field_0x12aa4 = that value;

	/*
	  statusData.has_kecleon_shop = false;
	  statusData.has_monster_house = false;
	  statusData.has_maze = false;
  
	  ResetHiddenStairsSpawn();
	  statusData.no_enemy_spawn = IsOutlawMonsterHouseFloor();
	  statusData.hidden_stairs_type = GetHiddenStairsType();
  
	  if(Constants.SECONDARY_TERRAIN_TYPES[statusData.tileset_id] === SecondaryTerrainType.SECONDARY_TERRAIN_CHASM) 
	  { 
		  statusData.has_chasms_as_secondary_terrain = true;
	  }
	  else
	  {
		  statusData.has_chasms_as_secondary_terrain = false;
	  }*/

	statusData.stairs_room_index = 0xff;
	statusData.floor_size = FloorSize.FLOOR_SIZE_LARGE;

	dungeonGenerationInfo.fixed_room_id = floor_props.fixed_room_id;

	statusData.monster_house_chance = floor_props.monster_house_chance;
	statusData.kecleon_shop_chance = floor_props.kecleon_shop_chance;
	statusData.secondary_structures_budget = floor_props.secondary_structures_budget;
	statusData.hidden_stairs_type = floor_props.hidden_stairs_type;

	let spawn_attempts;
	for (spawn_attempts = 0; spawn_attempts < 10; spawn_attempts++) {
		dungeonGenerationInfo.player_spawn_x = -1;
		dungeonGenerationInfo.player_spawn_y = -1;
		dungeonGenerationInfo.stairs_spawn_x = -1;
		dungeonGenerationInfo.stairs_spawn_y = -1;
		dungeonGenerationInfo.hidden_stairs_spawn_x = -1;
		dungeonGenerationInfo.hidden_stairs_spawn_y = -1;

		let fixed_room = false;
		let secondary_gen = false;

		//
		// Actual generation attempts, up to 10 times per entity
		let gen_attempts;
		for (gen_attempts = 0; gen_attempts < 10; gen_attempts++) {
			if (fixed_room) {
				// Check for a full-floor fixed room, if this is the case, generation is done.
				// 0xA5 is the first non-full-floor fixed room ID (which corresponds to Sealed Chambers)
				if (dungeonGenerationInfo.fixed_room_id > 0 && dungeonGenerationInfo.fixed_room_id < 0xa5) break;

				fixed_room = false;
			}

			dungeonGenerationInfo.floor_generation_attempts = gen_attempts;

			// If we fail layout generation once, turn off secondary structures for the remaining generations
			if (gen_attempts > 0) {
				statusData.secondary_structures_budget = 0;
			}

			statusData.is_invalid = false;
			statusData.kecleon_shop_middle_x = -1;
			statusData.kecleon_shop_middle_y = -1;

			ResetFloor();

			dungeonGenerationInfo.player_spawn_x = -1;
			dungeonGenerationInfo.player_spawn_y = -1;

			/* TODO: Continue fixed room support
				  if (dungeonGenerationInfo.fixed_floor_number !== 0) {
					  // Special handling for fixed rooms
	  
					  if (!ProcessFixedRoom(dungeonGenerationInfo.fixed_floor_number, floor_props)) {
						  fixed_room = true;
	  
						  break; //This would actually be a goto skipping layout generation
					  }
				  }*/

			let grid_size_x = 2; //[r13, #+0x8]
			let grid_size_y = 2; //[r13, #+0x4]

			// Attempt to generate random grid dimensions
			let attempts = 32;
			while (attempts > 0) {
				let max_x, max_y;

				if (floor_props.layout === FloorLayout.LAYOUT_LARGE_0x8) {
					max_x = 5;
					max_y = 4;
				} else {
					max_x = 9;
					max_y = 8;
				}

				grid_size_x = dungeonRand.RandRange(2, max_x);
				grid_size_y = dungeonRand.RandRange(2, max_y);

				// Limit overall dimensions
				if (grid_size_x <= 6 && grid_size_y <= 4) break;

				attempts--;
			}

			// We failed to generate random grid dimensions, default to 4x4
			if (attempts === 0) {
				grid_size_x = 4;
				grid_size_y = 4;
			}

			// Make sure there are at least 7 tiles per grid cell in both
			// dimensions. Otherwise, the grid size is too big so default to 1
			if (Math.floor(FLOOR_MAX_X / grid_size_x) < 8) {
				grid_size_x = 1;
			}

			if (Math.floor(FLOOR_MAX_Y / grid_size_y) < 8) {
				grid_size_y = 1;
			}

			statusData.layout = floor_props.layout;

			switch (floor_props.layout) {
				case FloorLayout.LAYOUT_LARGE:
				case FloorLayout.LAYOUT_LARGE_0x8:
				default:
					GenerateStandardFloor(grid_size_x, grid_size_y, floor_props);
					secondary_gen = true;
					break;

				case FloorLayout.LAYOUT_SMALL:
					grid_size_x = 4;
					grid_size_y = dungeonRand.RandInt(2) + 2;
					statusData.floor_size = FloorSize.FLOOR_SIZE_SMALL;
					GenerateStandardFloor(grid_size_x, grid_size_y, floor_props);
					secondary_gen = true;
					break;

				case FloorLayout.LAYOUT_ONE_ROOM_MONSTER_HOUSE:
					GenerateOneRoomMonsterHouseFloor();
					dungeonGenerationInfo.force_create_monster_house = true;
					break;

				case FloorLayout.LAYOUT_OUTER_RING:
					GenerateOuterRingFloor(floor_props);
					secondary_gen = true;
					break;

				case FloorLayout.LAYOUT_CROSSROADS:
					GenerateCrossroadsFloor(floor_props);
					secondary_gen = true;
					break;

				case FloorLayout.LAYOUT_TWO_ROOMS_WITH_MONSTER_HOUSE:
					GenerateTwoRoomsWithMonsterHouseFloor();
					dungeonGenerationInfo.force_create_monster_house = true;
					break;

				case FloorLayout.LAYOUT_LINE:
					GenerateLineFloor(floor_props);
					secondary_gen = true;
					break;

				case FloorLayout.LAYOUT_CROSS:
					GenerateCrossFloor(floor_props);
					break;

				case FloorLayout.LAYOUT_BEETLE:
					GenerateBeetleFloor(floor_props);
					break;

				case FloorLayout.LAYOUT_OUTER_ROOMS:
					GenerateOuterRoomsFloor(grid_size_x, grid_size_y, floor_props);
					secondary_gen = true;
					break;

				case FloorLayout.LAYOUT_MEDIUM:
					grid_size_x = 4;
					grid_size_y = dungeonRand.RandInt(2) + 2;
					statusData.floor_size = FloorSize.FLOOR_SIZE_MEDIUM;
					GenerateStandardFloor(grid_size_x, grid_size_y, floor_props);
					secondary_gen = true;
					break;
			}

			ResetInnerBoundaryTileRows();
			EnsureImpassableTilesAreWalls();

			// Nothing failed during generation
			if (!statusData.is_invalid) {
				//We need to make sure there are at least 2 rooms with at least 20 total tiles
				let room: boolean[] = new Array(64).fill(false);
				let room_tiles: number = 0;

				for (let x = 0; x < FLOOR_MAX_X; x++) {
					for (let y = 0; y < FLOOR_MAX_Y; y++) {
						if (dungeonData.list_tiles[x][y].terrain_flags.terrain_type === TerrainType.TERRAIN_NORMAL) {
							if (dungeonData.list_tiles[x][y].room_index < 0xf0) {
								room_tiles++;
								if (dungeonData.list_tiles[x][y].room_index < 0x40) {
									room[dungeonData.list_tiles[x][y].room_index] = true;
								}
							}
						}
					}
				}

				let num_rooms = room.filter(room => room).length;

				if (num_rooms >= 2 && room_tiles >= 20) break; //This layout is good!
			}

			//This layout is bad! We need to try again
		}

		//If we fail to generate a layout in 10 attempts, just abort and make a one-room Monster House
		if (gen_attempts === 10) {
			statusData.kecleon_shop_middle_x = -1;
			statusData.kecleon_shop_middle_y = -1;
			GenerateOneRoomMonsterHouseFloor();
			dungeonGenerationInfo.force_create_monster_house = true;
		}

		//We will be guaranteed to have a good layout by this point
		FinalizeJunctions();
		if (secondary_gen) {
			GenerateSecondaryTerrainFormations(true, floor_props);
		}

		//OnCompleteGenerationStep("Finalize Junctions and Generate Secondary Terrain Formations");

		let is_empty_monster_house = dungeonRand.RandInt(100) < floor_props.itemless_monster_house_chance;

		SpawnNonEnemies(floor_props, is_empty_monster_house);
		SpawnEnemies(floor_props, is_empty_monster_house);

		ResolveInvalidSpawns(); //Make sure multiple flags aren't set for one tile

		//OnCompleteGenerationStep("Spawn Entities and Resolve Invalid Spawns");

		if (dungeonGenerationInfo.player_spawn_x !== -1 && dungeonGenerationInfo.player_spawn_y !== -1) {
			// This is for normal fixed rooms, we don't need to validate the stairs in this scenario
			// Since it's fixed already
			if (GetFloorType() === FloorType.FLOOR_TYPE_FIXED) break;

			if (dungeonGenerationInfo.stairs_spawn_x !== -1 && dungeonGenerationInfo.stairs_spawn_y !== -1) {
				// We can reach the stairs, we're good!
				if (StairsAlwaysReachable(dungeonGenerationInfo.stairs_spawn_x, dungeonGenerationInfo.stairs_spawn_y, false)) break;
			}

			//Something went bad with spawns, we'll need to retry on a new generation
		}

		//If we fail with spawns (or otherwise) 10 times, opt for a One-Room Monster House generation
		if (spawn_attempts + 1 === 10) {
			statusData.kecleon_shop_middle_x = -1;
			statusData.kecleon_shop_middle_y = -1;

			ResetFloor();
			GenerateOneRoomMonsterHouseFloor();
			dungeonGenerationInfo.force_create_monster_house = true;

			FinalizeJunctions();
			SpawnNonEnemies(floor_props, false);
			SpawnEnemies(floor_props, false);
			ResolveInvalidSpawns();

			//We don't care about validating because this is our bailout, so we're done!
		}
	}

	//TODO: Integrate late GenerateFloor operations

	OnCompleteGenerationStep(GenerationStepLevel.GEN_STEP_COMPLETE, MajorGenerationType.GEN_TYPE_GENERATE_FLOOR);

	return dungeonData.list_tiles;
}

/**
 * OnCompleteGenerationStep - responsible for mid-generation dungeon progression if additional output is desired
 */
function OnCompleteGenerationStep(generation_step_level: GenerationStepLevel, generation_type: GenerationType) {
	//Check if the event is at or below the threshold we've set for accepting callbacks
	if (generationCallbackFrequency >= generation_step_level && typeof dungeonGenerationCallback === 'function') {
		dungeonGenerationCallback(generation_step_level, generation_type, dungeonData, dungeonGenerationInfo, statusData, grid_cell_start_x, grid_cell_start_y);
	}
}

/**
 * GenerateDungeon - Entry function provided to generate a dungeon floor (not part of the original code)
 *
 * @param floor_props - Primary properties of the floor, such as its room density or floor connectivity.
 * @param dungeon_data - Properties of the Dungeon we're in, such as what dungeon we're in or if we're doing a mission.
 * @param generation_constants - Modifications to the vanilla values for constants like the chance to merge rooms.
 * @param advanced_generation_settings - Modifications and patches to dungeon algorithm bugs / other advanced functionality
 * @param dungeon_generation_callback - A callback function to provide all information on the steps of generation as the algorithm progresses,
 * 										it will be called based on the the frequency specified in generation_callback_frequency
 * @param generation_callback_frequency - Determines how often to call the callback function. By default this will only be for the final generated layout,
 * 									 but this can be modified to include major generation events (ex. Generating all hallways on a floor) or minor generation
 * 									 events (ex. Generating a single hallway on the floor).
 * @returns The dungeon tile map for the final generated floor.
 */
export function GenerateDungeon(
	floor_props: FloorProperties,
	dungeon_data: Dungeon,
	generation_constants?: GenerationConstants,
	advanced_generation_settings?: AdvancedGenerationSettings,
	dungeon_generation_callback?: DungeonGenerationCallback,
	generation_callback_frequency?: GenerationStepLevel
): Tile[][] {
	//We want to make this a deep copy, otherwise changes to dungeonData will leak to the original reference
	//(we also really don't want the map stored there unknowingly).
	dungeonData = JSON.parse(JSON.stringify(dungeon_data));

	dungeonGenerationInfo = new DungeonGenerationInfo();
	statusData = new FloorGenerationStatus();
	dungeonRand = new DungeonRandom();

	if (typeof generation_constants !== 'undefined') {
		generationConstants = generation_constants;
	} else {
		generationConstants = new GenerationConstants();
	}

	if (typeof advanced_generation_settings !== 'undefined') {
		advancedGenerationSettings = advanced_generation_settings;
	} else {
		advancedGenerationSettings = new AdvancedGenerationSettings();
	}

	if (typeof dungeon_generation_callback !== 'undefined') {
		dungeonGenerationCallback = dungeon_generation_callback;
	}

	if (typeof generation_callback_frequency !== 'undefined') {
		generationCallbackFrequency = generation_callback_frequency;
	} else {
		generationCallbackFrequency = GenerationStepLevel.GEN_STEP_COMPLETE;
	}

	return GenerateFloor(floor_props);
}
