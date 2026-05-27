import { Recipe, RecipeId, RecipeTitle } from './Recipe';
import { Ingredient } from './Ingredient';
import { v4 as uuidv4 } from 'uuid';

describe('Provisioning Bounded Context: Recipe', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440005';
  const apple = Ingredient.create('Apple', 'pieces')._unsafeUnwrap();
  const banana = Ingredient.create('Banana', 'pieces')._unsafeUnwrap();

  it('should successfully create a valid recipe', () => {
    const result = Recipe.create({
      id: RecipeId.create(validUuid)._unsafeUnwrap(),
      title: RecipeTitle.create('Fruit Salad')._unsafeUnwrap(),
      ingredients: [
        { ingredient: apple, quantity: 2 },
        { ingredient: banana, quantity: 1 }
      ]
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.title.value).toBe('Fruit Salad');
      expect(result.value.ingredients).toHaveLength(2);
    }
  });

  it('should return an error if a recipe has no ingredients', () => {
    const result = Recipe.create({
      id: RecipeId.create(validUuid)._unsafeUnwrap(),
      title: RecipeTitle.create('Empty Plate')._unsafeUnwrap(),
      ingredients: []
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('A recipe must have at least one ingredient');
    }
  });

  it('should return an error if recipe title is too short', () => {
    const result = RecipeTitle.create('');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Too small: expected string to have >=1 characters");
    }
  });

  it('should return an error if recipe title is too long', () => {
    const result = RecipeTitle.create('a'.repeat(151));
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe("Too big: expected string to have <=150 characters");
    }
  });

  it('should return an error if RecipeId is invalid', () => {
    const result = RecipeId.create('invalid-uuid');
    expect(result.isErr()).toBe(true);
  });
});
