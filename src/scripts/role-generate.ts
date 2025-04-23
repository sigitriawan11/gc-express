import * as fs from "fs";
import { roles } from "../constants/roles";

function getCombinations(arr: string[]): string[][] {
  const result: string[][] = [];
  const total = 1 << arr.length;

  for (let i = 1; i < total; i++) {
    const subset: string[] = [];
    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) {
        subset.push(arr[j]);
      }
    }
    result.push(subset);
  }

  return result;
}

function getPermutations(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr];
  const result: string[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const perms = getPermutations(remaining);
    for (const perm of perms) {
      result.push([current, ...perm]);
    }
  }

  return result;
}

function getAllRoleStrings(arr: string[]): string[] {
  const combos = getCombinations(arr);
  const results = new Set<string>();

  for (const combo of combos) {
    const perms = getPermutations(combo);
    for (const perm of perms) {
      results.add(`roles:${perm.join("|")}`);
    }
  }

  return Array.from(results);
}

const combinations = getAllRoleStrings(Object.keys(roles));

const output = `export const roleCombinations = [\n${combinations
  .sort()
  .map((c) => `  "${c}"`)
  .join(",\n")}\n] as const;\n\nexport type RoleMiddleware = typeof roleCombinations[number];\n`;

fs.writeFileSync("src/config/roles.ts", output);
console.log("✅ role combinations generated to src/config/roles.ts");
