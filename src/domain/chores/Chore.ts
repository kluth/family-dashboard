import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { UniqueId } from '../shared/UniqueId';

export class ChoreId extends UniqueId {
  public static override create(value: string): Result<ChoreId, Error> {
    const result = super.create(value);
    return result.map((id) => new ChoreId(id.value));
  }
}

const TitleSchema = z.string().min(1).max(100);

export class ChoreTitle {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<ChoreTitle, Error> {
    const result = TitleSchema.safeParse(value);
    if (!result.success) {
      return err(new Error(result.error.issues[0]?.message ?? "Invalid Title"));
    }
    return ok(new ChoreTitle(result.data));
  }
}

export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface ChoreProps {
  readonly id: ChoreId;
  readonly title: ChoreTitle;
  readonly frequency: Frequency;
}

/**
 * Chore Aggregate Root
 */
export class Chore {
  private constructor(private readonly props: ChoreProps) {}

  public static create(props: ChoreProps): Result<Chore, Error> {
    return ok(new Chore(props));
  }

  get id(): ChoreId {
    return this.props.id;
  }

  get title(): ChoreTitle {
    return this.props.title;
  }

  get frequency(): Frequency {
    return this.props.frequency;
  }
}
