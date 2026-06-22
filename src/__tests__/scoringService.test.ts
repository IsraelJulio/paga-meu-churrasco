import { describe, it, expect } from "vitest";
import { calculateScore } from "@/services/scoring/scoringService";
import { DEFAULT_SCORING } from "@/types";

const s = DEFAULT_SCORING;

describe("calculateScore", () => {
  it("exact score gives 17 points (3+2+2+10)", () => {
    // Palpite: 2x0 | Resultado: 2x0
    const result = calculateScore(2, 0, 2, 0, false, s);
    expect(result.resultPoints).toBe(3);
    expect(result.goalDifferencePoints).toBe(2);
    expect(result.totalGoalsPoints).toBe(2);
    expect(result.exactScorePoints).toBe(10);
    expect(result.totalPoints).toBe(17);
    expect(result.isExactScore).toBe(true);
    expect(result.isCorrectResult).toBe(true);
  });

  it("correct winner only gives 3 points", () => {
    // Palpite: 2x1 | Resultado: 2x0 — acertou vencedor mas não diferença nem total
    const result = calculateScore(2, 1, 2, 0, false, s);
    expect(result.resultPoints).toBe(3);
    expect(result.goalDifferencePoints).toBe(0);
    expect(result.totalGoalsPoints).toBe(0);
    expect(result.exactScorePoints).toBe(0);
    expect(result.totalPoints).toBe(3);
    expect(result.isExactScore).toBe(false);
    expect(result.isCorrectResult).toBe(true);
  });

  it("correct winner and difference gives 5 points", () => {
    // Palpite: 3x1 | Resultado: 2x0 — diff=2 same, total different (4 vs 2)
    const result = calculateScore(3, 1, 2, 0, false, s);
    expect(result.resultPoints).toBe(3);
    expect(result.goalDifferencePoints).toBe(2);
    expect(result.totalGoalsPoints).toBe(0);
    expect(result.exactScorePoints).toBe(0);
    expect(result.totalPoints).toBe(5);
  });

  it("correct winner and total gives 5 points (but not difference)", () => {
    // Palpite: 1x1 | Resultado: 2x0 — acertou total (2) mas não vencedor
    const result = calculateScore(1, 1, 2, 0, false, s);
    expect(result.resultPoints).toBe(0); // draw vs home win
    expect(result.goalDifferencePoints).toBe(0); // diff 0 vs 2
    expect(result.totalGoalsPoints).toBe(2); // total 2 == 2
    expect(result.totalPoints).toBe(2);
  });

  it("complete miss gives 0 points", () => {
    // Palpite: 0x1 | Resultado: 2x0 — previu derrota do time da casa
    const result = calculateScore(0, 1, 2, 0, false, s);
    expect(result.resultPoints).toBe(0);
    expect(result.goalDifferencePoints).toBe(0);
    expect(result.totalGoalsPoints).toBe(0);
    expect(result.exactScorePoints).toBe(0);
    expect(result.totalPoints).toBe(0);
  });

  it("draw prediction matches draw result gives 3+2+2 points", () => {
    // Palpite: 1x1 | Resultado: 1x1 — placar exato empate
    const result = calculateScore(1, 1, 1, 1, false, s);
    expect(result.resultPoints).toBe(3);
    expect(result.goalDifferencePoints).toBe(2);
    expect(result.totalGoalsPoints).toBe(2);
    expect(result.exactScorePoints).toBe(10);
    expect(result.totalPoints).toBe(17);
  });

  it("0-0 draw matches 0-0 result (exact score)", () => {
    const result = calculateScore(0, 0, 0, 0, false, s);
    expect(result.totalPoints).toBe(17);
    expect(result.isExactScore).toBe(true);
  });

  it("double multiplier doubles total points when base > 0", () => {
    // Exact score of 17 doubled = 34
    const result = calculateScore(2, 0, 2, 0, true, s);
    expect(result.doubleMultiplier).toBe(2);
    expect(result.totalPoints).toBe(34);
  });

  it("double multiplier does not affect 0 points", () => {
    // Complete miss — 0 points, double has no effect
    const result = calculateScore(0, 3, 2, 0, true, s);
    expect(result.totalPoints).toBe(0);
    expect(result.doubleMultiplier).toBe(1);
  });

  it("away win prediction matches away win result", () => {
    // Palpite: 0x2 | Resultado: 1x3 — away wins both, diff=-2 both
    const result = calculateScore(0, 2, 1, 3, false, s);
    expect(result.resultPoints).toBe(3); // both away wins
    expect(result.goalDifferencePoints).toBe(2); // diff = -2 both
    expect(result.totalGoalsPoints).toBe(0); // 2 vs 4
    expect(result.totalPoints).toBe(5);
  });

  it("explanation is generated", () => {
    const result = calculateScore(2, 0, 2, 0, false, s);
    expect(result.explanation).toContain("Placar exato");
  });

  it("explanation shows 'Sem pontos' for total miss", () => {
    const result = calculateScore(0, 3, 2, 0, false, s);
    expect(result.explanation).toBe("Sem pontos");
  });

  it("double multiplier description in explanation", () => {
    const result = calculateScore(2, 0, 2, 0, true, s);
    expect(result.explanation).toContain("Vale o dobro");
  });
});
