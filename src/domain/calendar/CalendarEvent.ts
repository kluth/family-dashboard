import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { TimeSpan } from './TimeSpan';

/**
 * EventId Value Object
 */
const IdSchema = z.string().uuid();

export class EventId {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<EventId, Error> {
    const result = IdSchema.safeParse(value);
    if (!result.success) {
      return err(new Error("Invalid EventId: must be a valid UUID"));
    }
    return ok(new EventId(result.data));
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
