import { Chore, ChoreId, ChoreTitle, Frequency } from './Chore';
import { ok, err } from 'neverthrow';

describe('Chores Bounded Context: Chore', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440001';

  it('should successfully create a valid chore', () => {
    const result = Chore.create({
      id: ChoreId.create(validUuid)._unsafeUnwrap(),
      title: ChoreTitle.create('Do the Dishes')._unsafeUnwrap(),
      frequency: Frequency.DAILY,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.title.value).toBe('Do the Dishes');
      expect(result.value.frequency).toBe(Frequency.DAILY);
    }
  });

  it('should return an error for an invalid title', () => {
    const result = ChoreTitle.create('');
    expect(result.isErr()).toBe(true);
  });
});
