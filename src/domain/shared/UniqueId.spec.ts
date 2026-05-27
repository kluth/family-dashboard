import { UniqueId } from './UniqueId';

class TestId extends UniqueId {
  public static override create(value: string) {
    return super.create(value).map(id => new TestId(id.value));
  }
}

describe('Shared Bounded Context: UniqueId', () => {
  const validUuid1 = '550e8400-e29b-41d4-a716-446655440001';
  const validUuid2 = '550e8400-e29b-41d4-a716-446655440002';

  it('should successfully create a valid UniqueId', () => {
    const result = TestId.create(validUuid1);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.value).toBe(validUuid1);
    }
  });

  it('should return an error for an invalid UUID', () => {
    const result = TestId.create('invalid-uuid');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Invalid UniqueId: must be a valid UUID");
    }
  });

  it('should correctly compare equality', () => {
    const id1 = TestId.create(validUuid1)._unsafeUnwrap();
    const id1Copy = TestId.create(validUuid1)._unsafeUnwrap();
    const id2 = TestId.create(validUuid2)._unsafeUnwrap();

    expect(id1.equals(id1Copy)).toBe(true);
    expect(id1.equals(id2)).toBe(false);
  });
});
