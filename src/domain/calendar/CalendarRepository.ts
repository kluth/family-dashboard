import { Result } from 'neverthrow';
import { CalendarEvent, EventId } from './CalendarEvent';

/**
 * Port for Calendar Event Persistence.
 */
export interface CalendarRepository {
  save(event: CalendarEvent): Promise<Result<void, Error>>;
  findById(id: EventId): Promise<Result<CalendarEvent | null, Error>>;
  findAll(): Promise<Result<CalendarEvent[], Error>>;
  delete(id: EventId): Promise<Result<void, Error>>;
}
