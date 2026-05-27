import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';

/**
 * Validates that dates are valid and that start is strictly before the end.
 */
const DateSchema = z.instanceof(Date).refine((d) => !isNaN(d.getTime()), {
  message: "Invalid date",
});

const TimeSpanSchema = z.object({
  start: DateSchema,
  end: DateSchema,
}).refine((data) => data.start < data.end, {
  message: "Start date must be before end date",
  path: ["start"],
});

type TimeSpanProps = z.infer<typeof TimeSpanSchema>;

export class TimeSpan {
  private constructor(private readonly props: TimeSpanProps) {}

  public static create(props: { start: Date; end: Date }): Result<TimeSpan, Error> {
    const result = TimeSpanSchema.safeParse(props);

    if (!result.success) {
      return err(new Error(result.error.issues[0]?.message ?? "Invalid TimeSpan"));
    }

    return ok(new TimeSpan(result.data));
  }

  get start(): Date {
    return this.props.start;
  }

  get end(): Date {
    return this.props.end;
  }

  /**
   * Calculates duration in minutes.
   * McCabe Complexity: 1
   */
  get durationInMinutes(): number {
    const diffMs = this.props.end.getTime() - this.props.start.getTime();
    return Math.floor(diffMs / 1000 / 60);
  }

  /**
   * Determines if this TimeSpan overlaps with another.
   * McCabe Complexity: 1
   */
  public overlaps(other: TimeSpan): boolean {
    return this.start < other.end && other.start < this.end;
  }
}
