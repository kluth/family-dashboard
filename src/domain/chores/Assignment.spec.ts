import { Assignment, Assignee } from './Assignment';
import { Chore, ChoreId, ChoreTitle, Frequency } from './Chore';
import { ok, err } from 'neverthrow';

describe('Chores Bounded Context: Assignment', () => {
  const chore = Chore.create({
    id: ChoreId.create('550e8400-e29b-41d4-a716-446655440001')._unsafeUnwrap(),
    title: ChoreTitle.create('Dishes')._unsafeUnwrap(),
    frequency: Frequency.DAILY,
  })._unsafeUnwrap();

  it('should successfully assign a chore to a person', () => {
    const assignee = Assignee.create('Matthias')._unsafeUnwrap();
    const dueDate = new Date('2026-05-28T00:00:00Z');

    const result = Assignment.create({
      choreId: chore.id,
      assignee: assignee,
      dueDate: dueDate,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.assignee.name).toBe('Matthias');
      expect(result.value.dueDate).toEqual(dueDate);
    }
  });

  it('should return an error for an empty assignee name', () => {
    const result = Assignee.create('');
    expect(result.isErr()).toBe(true);
  });
});
