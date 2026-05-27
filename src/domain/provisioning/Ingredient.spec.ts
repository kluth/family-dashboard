import { Ingredient } from './Ingredient';
import { ok, err } from 'neverthrow';

describe('Provisioning Bounded Context: Ingredient', () => {
  it('should successfully create a valid vegan ingredient', () => {
    const result = Ingredient.create('Apple', 'pieces');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.name).toBe('apple');
      expect(result.value.unit).toBe('pieces');
    }
  });

  it('should return an error for a non-vegan ingredient (milk)', () => {
    const result = Ingredient.create('Milk', 'liters');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Ingredient "milk" is not vegan');
    }
  });

  it('should return an error for a non-vegan ingredient (beef)', () => {
    const result = Ingredient.create('Ground Beef', 'grams');
    expect(result.isErr()).toBe(true);
  });

  it('should return an error for invalid input', () => {
    const result = Ingredient.create('', '');
    expect(result.isErr()).toBe(true);
  });
});
