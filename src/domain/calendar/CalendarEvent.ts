import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { TimeSpan } from './TimeSpan';
import { UniqueId } from '../shared/UniqueId';

/**
 * EventId Value Object
 */
export class EventId extends UniqueId {
  public static override create(value: string): Result<EventId, Error> {
    const result = super.create(value);
    return result.map((id) => new EventId(id.value));
  }
}

/**
 * EventTitle Value Object
 */
const TitleSchema = z.string().min(1).max(100);

export class EventTitle {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<EventTitle, Error> {
    const result = TitleSchema.safeParse(value);
    if (!result.success) {
      return err(new Error(result.error.issues[0]?.message ?? "Invalid Title"));
    }
    return ok(new EventTitle(result.data));
  }
}

/**
 * CalendarEvent Aggregate Root
 */
export interface CalendarEventProps {
  readonly id: EventId;
  readonly title: EventTitle;
  readonly timeSpan: TimeSpan;
}

export class CalendarEvent {
  private constructor(private readonly props: CalendarEventProps) {}

  public static create(props: CalendarEventProps): Result<CalendarEvent, Error> {
    return ok(new CalendarEvent(props));
  }

  get id(): EventId {
    return this.props.id;
  }

  get title(): EventTitle {
    return this.props.title;
  }

  get timeSpan(): TimeSpan {
    return this.props.timeSpan;
  }

  /**
   * Determines if this event overlaps with another.
   * McCabe Complexity: 1
   */
  public overlapsWith(other: CalendarEvent): boolean {
    return this.timeSpan.overlaps(other.timeSpan);
  }
}
