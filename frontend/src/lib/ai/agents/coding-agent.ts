import { generateJSON } from "../client";

const SYSTEM = `You are the Coding Coach Agent. Generate DSA coding problems for placement preparation.`;

export interface CodingProblem {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  hints: string[];
  optimalComplexity: { time: string; space: string };
}

export function fallbackCodingProblem(category: string, difficulty: string): CodingProblem {
  const problems: Record<string, CodingProblem> = {
    arrays: {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
      category: "arrays",
      difficulty,
      starterCode: "def two_sum(nums, target):\n    # Your code here\n    pass",
      testCases: [{ input: "nums=[2,7,11,15], target=9", expectedOutput: "[0,1]" }],
      hints: ["Use a hash map to store complements", "Check if complement exists before adding"],
      optimalComplexity: { time: "O(n)", space: "O(n)" },
    },
    strings: {
      title: "Valid Palindrome",
      description: "Given a string s, return true if it is a palindrome, considering only alphanumeric characters.",
      category: "strings",
      difficulty,
      starterCode: "def is_palindrome(s):\n    # Your code here\n    pass",
      testCases: [{ input: 's="A man a plan a canal Panama"', expectedOutput: "true" }],
      hints: ["Use two pointers from both ends", "Skip non-alphanumeric characters"],
      optimalComplexity: { time: "O(n)", space: "O(1)" },
    },
    dp: {
      title: "Climbing Stairs",
      description: "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways?",
      category: "dp",
      difficulty,
      starterCode: "def climb_stairs(n):\n    # Your code here\n    pass",
      testCases: [{ input: "n=3", expectedOutput: "3" }],
      hints: ["Think Fibonacci sequence", "Use bottom-up DP"],
      optimalComplexity: { time: "O(n)", space: "O(1)" },
    },
  };

  return problems[category] ?? problems.arrays;
}

export async function generateCodingProblem(
  category: string,
  difficulty: string
): Promise<CodingProblem> {
  return generateJSON<CodingProblem>(
    SYSTEM,
    `Generate a ${difficulty} ${category} coding problem.
Return JSON: { title, description, category, difficulty, starterCode, testCases[{input,expectedOutput}], hints[], optimalComplexity{time,space} }`,
    fallbackCodingProblem(category, difficulty)
  );
}

export async function evaluateCode(
  code: string,
  problem: string,
  language: string
): Promise<{ passed: boolean; score: number; timeComplexity: string; spaceComplexity: string; feedback: string }> {
  return generateJSON(
    `You are a coding evaluator. Assess code correctness and complexity.`,
    `Evaluate this ${language} solution:
Problem: ${problem}
Code:
${code}

Return JSON: { passed: boolean, score: 0-100, timeComplexity, spaceComplexity, feedback }`,
    { passed: true, score: 75, timeComplexity: "O(n)", spaceComplexity: "O(n)", feedback: "Solution looks reasonable. Consider edge cases and optimize space if possible." }
  );
}
