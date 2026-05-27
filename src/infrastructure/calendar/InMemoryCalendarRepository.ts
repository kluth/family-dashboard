import { Result, ok } from 'neverthrow';
import { CalendarEvent, EventId } from '../../domain/calendar/CalendarEvent';
import { CalendarRepository } from '../../domain/calendar/CalendarRepository';

/**
 * In-Memory Adapter for Calendar Repository.
 * Useful for development and testing.
 */
export class InMemoryCalendarRepository implements CalendarRepository {
  private readonly events: Map<string, CalendarEvent> = new Map();

  public async save(event: CalendarEvent): Promise<Result<void, Error>> {
    this.events.set(event.id.value, event);
    return ok(undefined);
  }

  public async findById(id: EventId): Promise<Result<CalendarEvent | null, Error>> {
    const event = this.events.get(id.value) ?? null;
    return ok(event);
  }

  public async findAll(): Promise<Result<CalendarEvent[], Error>> {
    return ok(Array.from(this.events.values()));
  }

  public async delete(id: EventId): Promise<Result<void, Error>> {
    this.events.delete(id.value);
    return ok(undefined);
  }
}
