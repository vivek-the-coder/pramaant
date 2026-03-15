import { sha256 } from "./hash";

/**
 * Compute the Merkle root from an array of hashes.
 * Used for batched blockchain anchoring.
 */
export function computeMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) {
    return sha256("EMPTY_BATCH");
  }

  let level = [...hashes];

  while (level.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        nextLevel.push(sha256(level[i] + level[i + 1]));
      } else {
        // Odd element — hash with itself
        nextLevel.push(sha256(level[i] + level[i]));
      }
    }

    level = nextLevel;
  }

  return level[0];
}
