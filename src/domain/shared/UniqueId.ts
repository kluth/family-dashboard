import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';

const IdSchema = z.string().uuid();

/**
 * Base Value Object for Unique Identifiers.
 * Ensures that all IDs in the domain are valid UUIDs.
 */
export class UniqueId {
  protected constructor(public readonly value: string) {}

  public static create(value: string): Result<UniqueId, Error> {
    const result = IdSchema.safeParse(value);
    if (!result.success) {
      return err(new Error("Invalid UniqueId: must be a valid UUID"));
    }
    return ok(new UniqueId(result.data));
  }

  public equals(other: UniqueId): boolean {
    return this.value === other.value;
  }
}
