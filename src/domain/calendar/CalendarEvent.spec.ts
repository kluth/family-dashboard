import { CalendarEvent, EventId, EventTitle } from './CalendarEvent';
import { TimeSpan } from './TimeSpan';
import * as fc from 'fast-check';

describe('CalendarEvent Bounded Context', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';
  const validTitle = 'Family Dinner';
  const validStart = new Date('2026-05-27T18:00:00Z');
  const validEnd = new Date('2026-05-27T19:00:00Z');
  const validTimeSpan = TimeSpan.create({ start: validStart, end: validEnd })._unsafeUnwrap();

  describe('EventId Value Object', () => {
    it('should create a valid EventId from a valid UUID', () => {
      const result = EventId.create(validUuid);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.value).toBe(validUuid);
      }
    });

    it('should return an error for an invalid UUID', () => {
      const result = EventId.create('invalid-uuid');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Invalid UniqueId: must be a valid UUID");
      }
    });
  });

  describe('EventTitle Value Object', () => {
    it('should create a valid EventTitle', () => {
      const result = EventTitle.create(validTitle);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.value).toBe(validTitle);
      }
    });

    it('should return an error if title is too short', () => {
      const result = EventTitle.create('');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Too small: expected string to have >=1 characters");
      }
    });

    it('should return an error if title is too long', () => {
      const longTitle = 'a'.repeat(101);
      const result = EventTitle.create(longTitle);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Too big: expected string to have <=100 characters");
      }
    });
  });

  describe('CalendarEvent Aggregate', () => {
    it('should successfully create a valid CalendarEvent', () => {
      const eventId = EventId.create(validUuid)._unsafeUnwrap();
      const eventTitle = EventTitle.create(validTitle)._unsafeUnwrap();

      const result = CalendarEvent.create({
        id: eventId,
        title: eventTitle,
        timeSpan: validTimeSpan,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(eventId);
        expect(result.value.title).toBe(eventTitle);
        expect(result.value.timeSpan).toBe(validTimeSpan);
      }
    });

    it('should detect overlaps with another event', () => {
      const event1 = CalendarEvent.create({
        id: EventId.create('550e8400-e29b-41d4-a716-446655440001')._unsafeUnwrap(),
        title: EventTitle.create('Event 1')._unsafeUnwrap(),
        timeSpan: TimeSpan.create({ start: new Date('2026-05-27T10:00:00Z'), end: new Date('2026-05-27T11:00:00Z') })._unsafeUnwrap(),
      })._unsafeUnwrap();

      const event2 = CalendarEvent.create({
        id: EventId.create('550e8400-e29b-41d4-a716-446655440002')._unsafeUnwrap(),
        title: EventTitle.create('Event 2')._unsafeUnwrap(),
        timeSpan: TimeSpan.create({ start: new Date('2026-05-27T10:30:00Z'), end: new Date('2026-05-27T11:30:00Z') })._unsafeUnwrap(),
      })._unsafeUnwrap();

      expect(event1.overlapsWith(event2)).toBe(true);
    });
  });

  describe('Property-Based Testing', () => {
    it('should always create a valid CalendarEvent from valid parts', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.date(),
          fc.date(),
          (id, title, d1, d2) => {
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return true;
            if (d1.getTime() === d2.getTime()) return true;

            const start = d1 < d2 ? d1 : d2;
            const end = d1 < d2 ? d2 : d1;

            const timeSpan = TimeSpan.create({ start, end })._unsafeUnwrap();
            const eventId = EventId.create(id)._unsafeUnwrap();
            const eventTitle = EventTitle.create(title)._unsafeUnwrap();

            const result = CalendarEvent.create({
              id: eventId,
              title: eventTitle,
              timeSpan: timeSpan,
            });

            return result.isOk();
          }
        )
      );
    });
  });
});
