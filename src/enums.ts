
//
// Floor Properties
//
export enum FloorLayout 
{
	LAYOUT_LARGE, 
	LAYOUT_SMALL, 
	LAYOUT_ONE_ROOM_MONSTER_HOUSE, 
	LAYOUT_OUTER_RING,
	LAYOUT_CROSSROADS,
	LAYOUT_TWO_ROOMS_WITH_MONSTER_HOUSE,
	LAYOUT_LINE,
	LAYOUT_CROSS,
	LAYOUT_LARGE_0x8,
	LAYOUT_BEETLE,
	LAYOUT_OUTER_ROOMS,
	LAYOUT_MEDIUM,
	LAYOUT_UNUSED_0xC,
	LAYOUT_UNUSED_0xD,
	LAYOUT_UNUSED_0xE,
	LAYOUT_UNUSED_0xF,
};

//
// Dungeon Tile Data
//
export enum TerrainType 
{
	TERRAIN_WALL,
	TERRAIN_NORMAL,
	TERRAIN_SECONDARY,
	TERRAIN_CHASM,
};

export enum SecondaryTerrainType
{
	SECONDARY_TERRAIN_WATER,
	SECONDARY_TERRAIN_LAVA,
	SECONDARY_TERRAIN_CHASM,
};

//
// Dungeon Data
//

// The objective while in a dungeon
export enum DungeonObjectiveType
{
	OBJECTIVE_STORY, //Visited as part of the story
	OBJECTIVE_NORMAL,
	OBJECTIVE_RESCUE, //Rescuing another player
	OBJECTIVE_UNK_GAMEMODE_5 // $GAME_MODE == 5 when entering the dungeon
};

export enum MissionType
{
	MISSION_RESCUE_CLIENT,
	MISSION_RESCUE_TARGET,
	MISSION_ESCORT_TO_TARGET,
	MISSION_EXPLORE_WITH_CLIENT,
	MISSION_PROSPECT_WITH_CLIENT,
	MISSION_GUIDE_CLIENT,
	MISSION_FIND_ITEM,
	MISSION_DELIVER_ITEM,
	MISSION_SEARCH_FOR_TARGET,
	MISSION_TAKE_ITEM_FROM_OUTLAW,
	MISSION_ARREST_OUTLAW,
	MISSION_CHALLENGE_REQUEST,
	MISSION_TREASURE_MEMO,
};

export enum MissionSubtypeChallenge
{
	MISSION_CHALLENGE_NORMAL,
	MISSION_CHALLENGE_MEWTWO,
	MISSION_CHALLENGE_ENTEI,
	MISSION_CHALLENGE_RAIKOU,
	MISSION_CHALLENGE_SUICUNE,
	MISSION_CHALLENGE_JIRACHI,
};

export enum MissionSubtypeExplore
{
	MISSION_EXPLORE_NORMAL,
	MISSION_EXPLORE_SEALED_CHAMBER,
	MISSION_EXPLORE_GOLDEN_CHAMBER,
	MISSION_EXPLORE_NEW_DUNGEON,
};

export enum MissionSubtypeOutlaw
{
	MISSION_OUTLAW_NORMAL_0,
	MISSION_OUTLAW_NORMAL_1,
	MISSION_OUTLAW_NORMAL_2,
	MISSION_OUTLAW_NORMAL_3,
	MISSION_OUTLAW_ESCORT,
	MISSION_OUTLAW_FLEEING,
	MISSION_OUTLAW_HIDEOUT,
	MISSION_OUTLAW_MONSTER_HOUSE,
};

export enum MissionSubtypeTakeItem
{
	MISSION_TAKE_ITEM_NORMAL_OUTLAW,
	MISSION_TAKE_ITEM_HIDDEN_OUTLAW,
	MISSION_TAKE_ITEM_FLEEING_OUTLAW,
};

export type MissionSubtype = MissionSubtypeChallenge | MissionSubtypeExplore | MissionSubtypeOutlaw | MissionSubtypeTakeItem;

//
// Floor Generation Status
//
export enum FloorSize
{
	FLOOR_SIZE_LARGE,
	FLOOR_SIZE_SMALL,
	FLOOR_SIZE_MEDIUM
};

export enum HiddenStairsType
{
	HIDDEN_STAIRS_NONE,
	HIDDEN_STAIRS_SECRET_BAZAAR,
	HIDDEN_STAIRS_SECRET_ROOM,
	HIDDEN_STAIRS_RANDOM_SECRET_BAZAAR_OR_SECRET_ROOM = 255
};

//
// Dungeon Algorithm Types
//

// The dungeon floor type
// see: GetFloorType
export enum FloorType
{
	FLOOR_TYPE_NORMAL,
	FLOOR_TYPE_FIXED, //Fixed room
	FLOOR_TYPE_RESCUE //Rescuing another player
}
 
 /**
  * DirectionId - Direction on the dungeon grid
  * 
  * Enum values can be mapped to offsets in LIST_DIRECTIONS
  */
 export enum DirectionId
 {
	 DIR_NONE = 4294967295,
	 DIR_DOWN = 0,
	 DIR_DOWN_RIGHT = 1,
	 DIR_RIGHT = 2,
	 DIR_UP_RIGHT = 3,
	 DIR_UP = 4,
	 DIR_UP_LEFT = 5,
	 DIR_LEFT = 6,
	 DIR_DOWN_LEFT = 7,
	 DIR_CURRENT = 8, //Current direction of an entity. Used as a special value in some functions
 };

 //
 // Dungeon Algorithm Helper Types (not part of original code)
 //
 
 /**
 * CardinalDirection - used to help make 4-directional branching readable
 * 
 * Not part of the original code
 */
  export enum CardinalDirection
  {
	  DIR_RIGHT,
	  DIR_UP,
	  DIR_LEFT,
	  DIR_DOWN,
  };
  
  /**
   * SecondaryStructureType - for readability in GenerateSecondaryStructures
   * 
   * Not part of the original code
   */
  export enum SecondaryStructureType
  {
	  SECONDARY_STRUCTURE_NONE,
	  SECONDARY_STRUCTURE_MAZE_PLUS_DOT,
	  SECONDARY_STRUCTURE_CHECKERBOARD,
	  SECONDARY_STRUCTURE_POOL,
	  SECONDARY_STRUCTURE_ISLAND,
	  SECONDARY_STRUCTURE_DIVIDER
  }