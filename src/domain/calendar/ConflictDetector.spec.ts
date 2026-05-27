import { CalendarEvent, EventId, EventTitle } from './CalendarEvent';
import { TimeSpan } from './TimeSpan';
import { ConflictDetector } from './ConflictDetector';
import * as fc from 'fast-check';

describe('ConflictDetector Domain Service', () => {
  const createEvent = (id: string, start: Date, end: Date) => {
    return CalendarEvent.create({
      id: EventId.create(id)._unsafeUnwrap(),
      title: EventTitle.create('Test Event')._unsafeUnwrap(),
      timeSpan: TimeSpan.create({
        start: start,
        end: end,
      })._unsafeUnwrap(),
    })._unsafeUnwrap();
  };

  const uuid1 = '550e8400-e29b-41d4-a716-446655440001';
  const uuid2 = '550e8400-e29b-41d4-a716-446655440002';
  const uuid3 = '550e8400-e29b-41d4-a716-446655440003';

  it('should return empty list when no events are provided', () => {
    const result = ConflictDetector.detectConflicts([]);
    expect(result).toEqual([]);
  });

  it('should return empty list when only one event is provided', () => {
    const event = createEvent(uuid1, new Date('2026-05-27T10:00:00Z'), new Date('2026-05-27T11:00:00Z'));
    const result = ConflictDetector.detectConflicts([event]);
    expect(result).toEqual([]);
  });

  it('should return empty list when events do not overlap', () => {
    const event1 = createEvent(uuid1, new Date('2026-05-27T10:00:00Z'), new Date('2026-05-27T11:00:00Z'));
    const event2 = createEvent(uuid2, new Date('2026-05-27T11:00:00Z'), new Date('2026-05-27T12:00:00Z')); // Adjacent
    const event3 = createEvent(uuid3, new Date('2026-05-27T13:00:00Z'), new Date('2026-05-27T14:00:00Z'));

    const result = ConflictDetector.detectConflicts([event1, event2, event3]);
    expect(result).toEqual([]);
  });

  it('should detect a single overlap', () => {
    const event1 = createEvent(uuid1, new Date('2026-05-27T10:00:00Z'), new Date('2026-05-27T11:00:00Z'));
    const event2 = createEvent(uuid2, new Date('2026-05-27T10:30:00Z'), new Date('2026-05-27T11:30:00Z'));

    const result = ConflictDetector.detectConflicts([event1, event2]);
    expect(result).toHaveLength(1);
    expect(result[0].event1.id.value).toBe(uuid1);
    expect(result[0].event2.id.value).toBe(uuid2);
  });

  it('should detect multiple overlaps', () => {
    const event1 = createEvent(uuid1, new Date('2026-05-27T10:00:00Z'), new Date('2026-05-27T11:00:00Z'));
    const event2 = createEvent(uuid2, new Date('2026-05-27T10:30:00Z'), new Date('2026-05-27T11:30:00Z'));
    const event3 = createEvent(uuid3, new Date('2026-05-27T10:45:00Z'), new Date('2026-05-27T11:15:00Z'));

    // event1 overlaps with event2
    // event1 overlaps with event3
    // event2 overlaps with event3
    const result = ConflictDetector.detectConflicts([event1, event2, event3]);
    expect(result).toHaveLength(3);
  });

  it('should handle fully contained events', () => {
    const event1 = createEvent(uuid1, new Date('2026-05-27T10:00:00Z'), new Date('2026-05-27T13:00:00Z'));
    const event2 = createEvent(uuid2, new Date('2026-05-27T11:00:00Z'), new Date('2026-05-27T12:00:00Z'));

    const result = ConflictDetector.detectConflicts([event1, event2]);
    expect(result).toHaveLength(1);
    expect(result[0].event1.id.value).toBe(uuid1);
    expect(result[0].event2.id.value).toBe(uuid2);
  });

  describe('Property-Based Testing', () => {
    it('should find all overlapping pairs and only those pairs', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              start: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
              duration: fc.integer({ min: 1, max: 1440 }) // 1 min to 24 hours
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (rawEvents) => {
            const events = rawEvents
              .filter(re => !isNaN(re.start.getTime()))
              .map(re => {
                const start = re.start;
                const end = new Date(start.getTime() + re.duration * 60000);
                return createEvent(re.id, start, end);
              });

            const conflicts = ConflictDetector.detectConflicts(events);

            // 1. All returned conflicts must be actual overlaps
            for (const conflict of conflicts) {
              if (!conflict.event1.overlapsWith(conflict.event2)) return false;
            }

            // 2. The number of conflicts must match the number of overlapping pairs found by O(n^2) check
            let expectedCount = 0;
            for (let i = 0; i < events.length; i++) {
              for (let j = i + 1; j < events.length; j++) {
                if (events[i].overlapsWith(events[j])) {
                  expectedCount++;
                }
              }
            }

            return conflicts.length === expectedCount;
          }
        )
      );
    });
  });
});
