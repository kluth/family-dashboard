import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { ChoreId } from './Chore';

const AssigneeSchema = z.string().min(1).max(50);

export class Assignee {
  private constructor(public readonly name: string) {}

  public static create(name: string): Result<Assignee, Error> {
    const result = AssigneeSchema.safeParse(name);
    if (!result.success) {
      return err(new Error(result.error.issues[0]?.message ?? "Invalid Assignee"));
    }
    return ok(new Assignee(result.data));
  }
}

export interface AssignmentProps {
  readonly choreId: ChoreId;
  readonly assignee: Assignee;
  readonly dueDate: Date;
}

/**
 * Assignment Aggregate Root
 * Tracks who is responsible for which chore and when.
 */
export class Assignment {
  private constructor(private readonly props: AssignmentProps) {}

  public static create(props: AssignmentProps): Result<Assignment, Error> {
    // Basic validation: ensure dueDate is not in the deep past could be added here
    return ok(new Assignment(props));
  }

  get choreId(): ChoreId {
    return this.props.choreId;
  }

  get assignee(): Assignee {
    return this.props.assignee;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }
}
