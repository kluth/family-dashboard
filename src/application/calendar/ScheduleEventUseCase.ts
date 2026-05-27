import { Result, err } from 'neverthrow';
import { CalendarRepository } from '../../domain/calendar/CalendarRepository';
import { CalendarEvent, EventId, EventTitle } from '../../domain/calendar/CalendarEvent';
import { TimeSpan } from '../../domain/calendar/TimeSpan';
import { ConflictDetector } from '../../domain/calendar/ConflictDetector';

export interface ScheduleEventRequest {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

/**
 * Use Case: Schedule an Event.
 * Implements the business process of validating and persisting a new event.
 */
export class ScheduleEventUseCase {
  constructor(private readonly repository: CalendarRepository) {}

  public async execute(request: ScheduleEventRequest): Promise<Result<void, Error>> {
    // 1. Create Domain Objects (Parsing Phase)
    const idResult = EventId.create(request.id);
    const titleResult = EventTitle.create(request.title);
    const timeSpanResult = TimeSpan.create({ start: request.start, end: request.end });

    if (idResult.isErr()) return err(idResult.error);
    if (titleResult.isErr()) return err(titleResult.error);
    if (timeSpanResult.isErr()) return err(timeSpanResult.error);

    const eventResult = CalendarEvent.create({
      id: idResult.value,
      title: titleResult.value,
      timeSpan: timeSpanResult.value,
    });

    if (eventResult.isErr()) return err(eventResult.error);
    const newEvent = eventResult.value;

    // 2. Load Existing Events for Conflict Detection
    const findAllResult = await this.repository.findAll();
    if (findAllResult.isErr()) return err(findAllResult.error);
    const existingEvents = findAllResult.value;

    // 3. Check for Conflicts
    const conflicts = ConflictDetector.detectConflicts([...existingEvents, newEvent]);
    const hasConflict = conflicts.some(
      (c) => c.event1.id.equals(newEvent.id) || c.event2.id.equals(newEvent.id)
    );

    if (hasConflict) {
      return err(new Error(`Conflict detected for event "${newEvent.title.value}"`));
    }

    // 4. Save the event
    return this.repository.save(newEvent);
  }
}
