import { Tile } from './key_types'
import { TerrainType } from './enums'

export function CreateMapString(map: Tile[][], list_x?: number[], list_y?: number[]): string
{
	let map_string: string = "";

	let x_idx = 0, y_idx = 0, on_x_border = false, on_y_border = false;

	for(let y = 0; y < 32; y++)
	{
		let mapLine = "";

		if(list_y && y_idx < list_y.length && y >= list_y[y_idx] - 1)
		{
			if(y >= list_y[y_idx])
			{
				y_idx++;
			}
			
			on_y_border = true;
		}
		else
		{
			on_y_border = false;
		}

		x_idx = 0;

		for(let x = 0; x < 56; x++)
		{
			if(list_x && x_idx < list_x.length && x >= list_x[x_idx] - 1)
			{
				if(x >= list_x[x_idx])
				{
					x_idx++;
				}
				
				on_x_border = true;
			}
			else
			{
				on_x_border = false;
			}

			if(x > 0)
			{
				mapLine += " ";
			}

			if(map[x][y].terrain_flags.terrain_type == TerrainType.TERRAIN_NORMAL)
			{
				if(map[x][y].spawn_or_visibility_flags.f_stairs)
				{
					mapLine += "=";
				}
				else if(map[x][y].terrain_flags.f_in_kecleon_shop)
				{
					mapLine += "K";
				}
				else if(map[x][y].spawn_or_visibility_flags.f_item)
				{
					mapLine += "I";
				}
				else if(map[x][y].spawn_or_visibility_flags.f_monster)
				{
					mapLine += "M";
				}
				else if(map[x][y].spawn_or_visibility_flags.f_trap)
				{
					mapLine += "T";
				}
				else
				{
					if(map[x][y].room_index == 0xFF)
					{
						//Not a room
						mapLine += "P";
					}
					else if(map[x][y].room_index == 0xFE)
					{
						//Hallway Anchor
						mapLine += "A";
					}
					else
					{
						//a room
						if(map[x][y].terrain_flags.f_in_monster_house)
						{
							mapLine += "Z";
						}
						else
						{
							mapLine += "X";	
						}
					}
				}
			}
			else if(map[x][y].terrain_flags.terrain_type == TerrainType.TERRAIN_WALL)
			{
				if((on_x_border || on_y_border))
				{
					//flags signal we're on a grid cell border
					mapLine += "\\";
				}
				else
				{
					mapLine += "-";
				}
			}
			else if(map[x][y].terrain_flags.terrain_type == TerrainType.TERRAIN_SECONDARY)
			{
				mapLine += "v";
			}
			else if(map[x][y].terrain_flags.terrain_type == TerrainType.TERRAIN_CHASM)
			{
				mapLine += "C";
			}
		}

		map_string += mapLine + "\n";
	}

	return map_string;
}