
## List Directions

`LIST_DIRECTIONS` contains a set of `(X, Y)` directional offset pairs, with each value repeated twice as it is normally only called for even indices. In combination with [`DirectionId`](dungeonmystery/Enums.md#Direction-ID), this allows for getting the correct offsets for moving one tile in the specified direction. It's relevant to note that `(0,0)` is in the top-left corner, meaning that positive X means travelling to the right, and a positive Y means travelling downwards, and vice versa.

**Definition**

```js
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
```

## Corner Cardinal Neighbor Expect Open

`CORNER_CARDINAL_NEIGHBOR_EXPECT_OPEN` is a table for determining which directions we should expect to find open or closed (wall or secondary terrain) tiles in, used when generating room imperfections. As an example, if we're generating from the top-left corner, we should only expect to find open tiles beloow us or to our right, as otherwise the room may end up with a strange shape.

**Definition**

```js
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
```

## Secondary Terrain Types

`SECONDARY_TERRAIN_TYPES` is a large table which contains the values of the kind of secondary terrain present for each dungeon in the game by dungeon ID. A value of `0` means water, `1` means lava, and `2` means chasms. See: [`SecondaryTerrainType`](dungeonmystery/Enums.md#Secondary-Terrain-Type).

**Definition**

```js
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
```