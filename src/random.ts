//TODO: This class has not been set up to use original behavior and is currently using JS Random

const LCG_MULTIPLIER = 0x5D588B65;
const ADD_T1 = 0x269EC3;

//2^32
//const MODULUS = 0x100000000;

function dec2bin(dec: number) 
{
	return (dec >>> 0).toString(2);
}

//NA: 02353570
export class DungeonRandom {
	use_secondary: boolean = false;

	//type 0
	seq_num_primary: number = 0;
	preseed: number = 0;
	last_value_primary: number = 0;

	//type 1
	idx_secondary: number = 0;
	seeds_t1: number[] = Array(5);

	showDebug: boolean = false;

	SetShowDebug(showDebug: boolean)
	{
		this.showDebug = showDebug;
	}

	SetDungeonRngPreseed(preseed: number)
	{
		this.preseed = preseed;
	}

	/**
	 * NA: 022EA980
	 * GenerateDungeonRngSeed - Seed for initializing the dungeon Primary RNG
	 * 
	 * Based on the preseed, performs two Primary LCG iterations
	 * Stores the second iteration as a new preseed, returns an RNG seed
	 */
	GenerateDungeonRngSeed(): number
	{
		let firstIter = this.preseed * LCG_MULTIPLIER + 1;
		let secondIter = firstIter * LCG_MULTIPLIER + 1;
		
		this.preseed = secondIter;

		console.log("GenerateDungeonRngSeed " + [firstIter, secondIter, (secondIter & 0xff0000) | (firstIter >> 0x10) | 1]);

		return (secondIter & 0xff0000) | (firstIter >> 0x10) | 1;
	}

	InitDungeonRng(seed: number)
	{
		this.last_value_primary = seed | 1;
		this.seq_num_primary = 0;

		for(let i = 0; i < this.seeds_t1.length; i++)
		{
			this.seeds_t1[i] = seed;
		}
	}

	/**
	 * NA: 022EAA20
	 * DungeonRand16Bit
	 * 
	 * returns: pseudorandom integer on the interval [0, 65535]
	 */
	Rand16Bit(): number
	{
		let result;

		if(!this.use_secondary)
		{
			this.seq_num_primary++;

			let intermediate = (this.last_value_primary * LCG_MULTIPLIER + 1);
			console.log("Intermediate: " + intermediate + " Binary: " + dec2bin(intermediate));
			result = intermediate & 0xFFFF0000;

			console.log("New Result: " + result + " Binary: " + dec2bin(result));
			this.last_value_primary = intermediate;
		}
		else
		{
			result = (LCG_MULTIPLIER * this.seeds_t1[this.idx_secondary] + ADD_T1);

			this.seeds_t1[this.idx_secondary] = result;

			result = result * 0x10000;
		}

		return result >> 0x10; //Right shift 16
	}

	/**
	 * NA: 022EAA98
	 * DungeonRandInt
	 * 
	 * returns: pseudorandom integer on the interval [0, n - 1]
	 */
	RandInt(n: number): number
	{
		/*
		let value = this.Rand16Bit();
		return ((value & 0xFFFF) * n) >> 0x10 & 0xFFFF;*/
		return Math.floor(Math.random() * n);
	}

	/**
	 * NA: 022EAAC0
	 * DungeonRandRange
	 * 
	 * returns: pseudorandom integer on the interval [min(x, y), max(x, y) - 1]
	 */
	RandRange(x: number, y: number): number
	{
		/*
		let randValue;

		if(x == y) return x;

		randValue = this.Rand16Bit();*/
		if(x < y)
		{
			//return x + (((randValue & 0xFFFF) * (y - x)) >> 0x10) & 0xFFFF; //0xFFFF should be unsigned
			return Math.floor(Math.random() * (y - x)) + x;
		}
		else
		{
			//return y + (((randValue & 0xFFFF) * (x - y)) >> 0x10) & 0xFFFF;
			return Math.floor(Math.random() * (x - y)) + y;
		}
	}

	/**
	 * NA: 022EAC5C
	 * DungeonRngSetSecondary - Sets the Dungeon PRNG to use one of the 5 secondary LCGs for random number generation.
	 */
	DungeonRngSetSecondary(secondary_index: number)
	{
		this.use_secondary = true;
		this.idx_secondary = secondary_index;
	}
};