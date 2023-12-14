
## Generation Constants

`GenerationConstants` defines several key constant values used for floor generation to provide a way to modify these constants as desired. By default, these values are set exactly how they appear in the vanilla dungeon algorithm.

**Properties**

- `merge_rooms_chance: number` - The `[0, 100]` percentage chance that two rooms will be merged together. By default, this is `5%`.
- `no_imperfections_chance: number` - The `[0, 100]` percentage chance that a room will not be given room imperfections if it was previously flagged to have them. By default, this is `60%`.
- `secondary_structure_flag_chance: number` - The `[0, 100]` percentage chance that a room will be flagged to have a secondary structure. By default, this is `80%`.
- `max_number_monster_house_item_spawns: number` - The maximum number of items which are allowed to be spawned in a monster house. By default, this is `7`.
- `max_number_monster_house_enemy_spawns: number` - The maximum number of enemies which are allowed to be spawned in a monster house. By default, this is `30`.
- `first_dungeon_id_allow_monster_house_traps: number` - The first story dungeon which allows traps to be contained in monster houses. By default, this is `28`, or Dark Hill.

## Advanced Generation Settings

`AdvancedGenerationSettings` defines settings for applying patches or changes to the original dungeon algorithm implementation, typically for bugs or obscure fixes. These settings are all disabled by default for vanilla generation.

**Properties**

- `allow_wall_maze_room_generation: boolean` - When generating maze rooms, one of the initial checks tests if the current number of floor generation attempts is below 0, which is an impossible condition. This results in no maze rooms made of walls ever being generated in the vanilla game, though it's still possible for water mazes to be generated via secondary structures. This patch overrides this check, allowing maze room generation to continue and potentially generate a maze in this manner.
- `fix_dead_end_validation_error: boolean` - When assigning grid cell connections, the second half of the function is dedicated to removing dead ends from floor generation, if specified in [`FloorProperties`](dungeonmystery/KeyTypes.md#Floor-Properties). Part of this process is searching for grid cells with only one connection (a dead end), then seeing if there is another grid cell that is adjacent that we can connect to. A bug appears in that all of the four validation checks to ensure the grid cell in the specified direction is valid end up using the same offset, meaning 3 of them are checking the wrong grid cell. This patch fixes these checks to ensure that the correct grid cell is checked in all directions.
- `fix_generate_outer_rooms_floor_error: boolean` - When generating an Outer Rooms layout (a layout where there are exclusively rooms on the outer ring of the floor), there is an error involved in building the connections between grid cells to create the ring of rooms. This error results in the original implementation failing for grid dimensions of 2 or less, as one of the branches for assigning connections is never taken, and the other branch will not provide a backup connection. There is also a minor issue involving top/bottom connections which results in hallways being connected from the bottom instead of from the top, but this does not affect the connectivity of the map. This patch fixes the error and minor issues within the function, providing consistently connected generation for all grid sizes.