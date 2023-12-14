
## Tile

The name for one particular square on the dungeon map. 
The whole map is comprised of a constant `56x32` arrangement of tiles. 
It's also the technical name for [`Tile`](dungeonmystery/KeyTypes.md#Tile).

## Grid Cell

An invisible abstraction layer above tiles, which comprises a rectangular area of tiles within its ownership.
One grid cell can contain at most one room, one hallway anchor, or absolutely nothing at all.
Grid cells can connect to one another through generating hallways.
Typically, every grid cell on the map is of the exact same size, but for certain floor layouts, this isn't the case.
It's also the technical name for [`GridCell`](dungeonmystery/KeyTypes.md#Grid-Cell).

## Floor Layout

The name given to the overall structural organization of a given floor.
Different floor layouts use different generators: standard generators create the typical floors you would expect from Explorers of Sky, and special generators produce variants on consistent patterns.
It's also the technical name for [`FloorLayout`](dungeonmystery/Enums.md#Floor-Layout).

## Room

Any open space of `2x2` or larger created in generation.
Only one room can be placed in each grid cell, which keeps them separated out across the map.
Rooms can also be merged with each other, producing a larger combined room.
Rooms have room indexes and are managed by their owning grid cells, allowing for making smart connections for navigating between each other.

## Hallway Anchor

The name for a `1x1` tile which is placed down to "anchor" hallway generation. 
When generating rooms, any grid cells which aren't selected to have a room will place a hallway anchor down instead. 
Since this "room" is only a `1x1`, it ensures that any generated hallways from adjacent cells will all link together at a single point.
Later in the algorithm, their distinction is eventually removed making them become a regular tile.

## Hallway

The name for a path generated between two grid cells, whether this is between rooms, hallway anchors, or a mix of both.
Explorers of Sky generates hallways with a "kink" in the middle.
This means if you travel to a grid cell above you, you would likely travel up, then left or right, then up again to reach the room.
This "kink" in the hallway is placed right at the border between the two grid cells, and you'll often see all the hallways on the floor actually have them all lined up.
There are exceptions to this as it depends on if the hallway is generated from the top, bottom, left, or right but the pattern is quite noticeable.
These are also referred to as "dungeon-logic hallways" as they are the method by which the game is certain you can travel between two grid cells.

## Extra Hallway

An extra hallway is a random walk open path which generates with no consideration for creating paths between any two points and roams until it reaches a stopping condition.
You will likely remember these as being paths which loop on themselves going to nowhere, but they can just as easily link two rooms together as well.
They are distinct from regular hallways in that they aren't involved in any true connectivity logic beyond the final check to determine if every open tile is reachable.

## Secondary Terrain

The name for water tiles, lava tiles, and contextually chasm tiles. 
Secondary terrain is primarily generated through a series of "rivers" and "lakes".

## Secondary Structure

The name for a structure placed in a room created out of secondary terrain.
There are several varieties which can be generated, you can check out [`SecondaryStructureType`](dungeonmystery/Enums.md#Secondary-Structure-Type) for more information on each one!

## Maze Room

The name for a feature which can be added to a room, causing it to be essentially a maze.
This randomly places either walls (unused in vanilla) or secondary terrain (used as a secondary structure) in a way producing winding 1-wide paths resulting in a maze-like structure.

## Room Imperfections

The term for the chiseled out corner varieties which can be optionally added to rooms.
This feature was actually unused in vanilla, but is fully functional and able to be played with.

