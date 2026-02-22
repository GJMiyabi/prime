/**
 * Sample Test - Pure JavaScript Functions
 * テスト環境の動作確認用サンプル（外部依存なし）
 */

import { describe, it, expect } from 'vitest';

// Pure function examples
function add(a: number, b: number): number {
  return a + b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

function greet(name: string): string {
  return `Hello, ${name}!`;
}

describe('Math Operations', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-5, 3)).toBe(-2);
    });

    it('should handle zero', () => {
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('should return zero when multiplied by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(multiply(-2, 3)).toBe(-6);
    });
  });
});

describe('String Operations', () => {
  describe('greet', () => {
    it('should create greeting message', () => {
      expect(greet('World')).toBe('Hello, World!');
    });

    it('should handle empty string', () => {
      expect(greet('')).toBe('Hello, !');
    });
  });

  describe('toUpperCase', () => {
    it('should convert string to uppercase', () => {
      expect('hello'.toUpperCase()).toBe('HELLO');
    });

    it('should handle empty string', () => {
      expect(''.toUpperCase()).toBe('');
    });
  });
});

describe('Array Operations', () => {
  it('should filter even numbers', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const even = numbers.filter((n) => n % 2 === 0);
    expect(even).toEqual([2, 4, 6]);
  });

  it('should map array elements', () => {
    const numbers = [1, 2, 3];
    const doubled = numbers.map((n) => n * 2);
    expect(doubled).toEqual([2, 4, 6]);
  });

  it('should reduce array to sum', () => {
    const numbers = [1, 2, 3, 4];
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    expect(sum).toBe(10);
  });
});

