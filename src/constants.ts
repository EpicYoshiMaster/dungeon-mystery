import { SecondaryTerrainType } from './enums';

/**
 * NA: 0235171C
 * (X, Y) direction offset pairs
 * This structure is called only for even indices ordinarily, so values are repeated twice
 * for each offset in this version.
 */
export const LIST_DIRECTIONS: number[] = [
	//Down
	0,
	0,
	1,
	1,

	//Down-Right
	1,
	1,
	1,
	1,

	//Right
	1,
	1,
	0,
	0,

	//Up-Right
	1,
	1,
	-1,
	-1,

	//Up
	0,
	0,
	-1,
	-1,

	//Up-Left
	-1,
	-1,
	-1,
	-1,

	//Left
	-1,
	-1,
	0,
	0,

	//Down-Left
	-1,
	-1,
	1,
	1,
];

/**
 * NA: 02353010
 * Used in GenerateRoomImperfections, table for determining
 * which directions we expect to find open or closed (wall/secondary) tiles in
 *
 * Ex. If generating from the Top-Left corner, we should only expect to find
 * open tiles below us or to our right, otherwise the room will look very strange.
 */
export const CORNER_CARDINAL_NEIGHBOR_EXPECT_OPEN: boolean[] = [
	//Top-Left Corner
	true, //Down
	false, //Down-Right
	true, //Right
	false, //Up-Right
	false, //Up
	false, //Up-Left
	false, //Left
	false, //Down-Left

	//Top-Right Corner
	true, //Down
	false, //Down-Right
	false, //Right
	false, //Up-Right
	false, //Up
	false, //Up-Left
	true, //Left
	false, //Down-Left

	//Bottom-Right Corner
	false, //Down
	false, //Down-Right
	false, //Right
	false, //Up-Right
	true, //Up
	false, //Up-Left
	true, //Left
	false, //Down-Left

	//Bottom-Left Corner
	false, //Down
	false, //Down-Right
	true, //Right
	false, //Up-Right
	true, //Up
	false, //Up-Left
	false, //Left
	false, //Down-Left
];

/**
 * NA: 020A1AE8
 * SECONDARY_TERRAIN_TYPES - The type of secondary terrain for each dungeon in the game.
 *
 * 0 = Water
 * 1 = Lava
 * 2 = Chasm
 */
export const SECONDARY_TERRAIN_TYPES: SecondaryTerrainType[] = [
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	2,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	2,
	2,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	2,
	2,
	1,
	1,
	0,
	0,
	2,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	0,
	0,
	1,
	2,
	0,
	0,
	0,
	0,
	0,
	2,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
];
