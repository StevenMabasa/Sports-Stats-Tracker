import { describe, it, expect } from 'vitest';

const sum = (a: number, b: number) => a + b;

describe('sum function', () => {
  it('adds -1 + 2 to equal 1', () => {
    expect(sum(-1, 2)).toBe(1);
  });
});
