import { TimeSpan } from './TimeSpan';
import { ok, err } from 'neverthrow';
import * as fc from 'fast-check';

describe('TimeSpan Value Object', () => {
  const validStart = new Date('2026-05-27T10:00:00Z');
  const validEnd = new Date('2026-05-27T11:00:00Z');

  it('should successfully create a valid TimeSpan', () => {
    const result = TimeSpan.create({ start: validStart, end: validEnd });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.start).toEqual(validStart);
      expect(result.value.end).toEqual(validEnd);
    }
  });

  it('should return an error if start is after end', () => {
    const invalidStart = new Date('2026-05-27T12:00:00Z');
    const result = TimeSpan.create({ start: invalidStart, end: validEnd });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Start date must be before end date");
    }
  });

  it('should return an error if start is equal to end', () => {
    const result = TimeSpan.create({ start: validStart, end: validStart });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Start date must be before end date");
    }
  });

  it('should return an error if start is an invalid date', () => {
    const result = TimeSpan.create({ start: new Date(NaN), end: validEnd });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Invalid date");
    }
  });

  it('should return an error if end is an invalid date', () => {
    const result = TimeSpan.create({ start: validStart, end: new Date(NaN) });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Invalid date");
    }
  });

  it('should return an error for completely invalid input', () => {
    const result = TimeSpan.create({} as any);
    expect(result.isErr()).toBe(true);
  });

  it('should calculate the correct duration in minutes', () => {
    const result = TimeSpan.create({ start: validStart, end: validEnd });
    if (result.isOk()) {
      expect(result.value.durationInMinutes).toBe(60);
    }
  });

  describe('overlaps', () => {
    it('should detect overlaps correctly', () => {
      const ts1 = TimeSpan.create({ start: new Date('2026-05-27T10:00:00Z'), end: new Date('2026-05-27T11:00:00Z') })._unsafeUnwrap();
      const ts2 = TimeSpan.create({ start: new Date('2026-05-27T10:30:00Z'), end: new Date('2026-05-27T11:30:00Z') })._unsafeUnwrap();
      const ts3 = TimeSpan.create({ start: new Date('2026-05-27T11:00:00Z'), end: new Date('2026-05-27T12:00:00Z') })._unsafeUnwrap();

      expect(ts1.overlaps(ts2)).toBe(true);
      expect(ts2.overlaps(ts1)).toBe(true);
      expect(ts1.overlaps(ts3)).toBe(false);
      expect(ts3.overlaps(ts1)).toBe(false);
    });
  });

  describe('Property-Based Testing', () => {
    it('should always succeed for valid date pairs (start < end)', () => {
      fc.assert(
        fc.property(fc.date(), fc.date(), (d1, d2) => {
          if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return true;

          const start = d1 < d2 ? d1 : d2;
          const end = d1 < d2 ? d2 : d1;

          if (start.getTime() === end.getTime()) return true;

          const result = TimeSpan.create({ start, end });
          return result.isOk();
        })
      );
    });

    it('should always fail if start equals end', () => {
      fc.assert(
        fc.property(fc.date(), (d) => {
          const result = TimeSpan.create({ start: d, end: d });
          return result.isErr();
        })
      );
    });
  });
});
