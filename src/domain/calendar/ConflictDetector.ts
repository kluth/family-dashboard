import { CalendarEvent } from './CalendarEvent';

export interface Conflict {
  readonly event1: CalendarEvent;
  readonly event2: CalendarEvent;
}

export class ConflictDetector {
  /**
   * Detects all overlapping events in a given list.
   * Implementation uses a sweep-line style approach for O(n log n) efficiency.
   * 
   * @param events List of calendar events to check for conflicts.
   * @returns List of detected conflicts.
   */
  public static detectConflicts(events: CalendarEvent[]): Conflict[] {
    if (events.length < 2) {
      return [];
    }

    const sortedEvents = [...events].sort((a, b) => a.timeSpan.start.getTime() - b.timeSpan.start.getTime());
    const conflicts: Conflict[] = [];

    for (let i = 0; i < sortedEvents.length; i++) {
      const current = sortedEvents[i];
      if (!current) continue;
      
      for (let j = i + 1; j < sortedEvents.length; j++) {
        const next = sortedEvents[j];
        if (!next) continue;
        
        // If the next event starts after the current event ends, no more overlaps are possible for the current event.
        if (next.timeSpan.start >= current.timeSpan.end) {
          break;
        }

        // We know next.start < current.end AND next.start >= current.start (due to sorting).
        // This guarantees an overlap.
        conflicts.push({
          event1: current,
          event2: next
        });
      }
    }

    return conflicts;
  }
}
