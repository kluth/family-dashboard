import { CreateRecipeUseCase, CreateRecipeRequest } from './CreateRecipeUseCase';
import { InMemoryRecipeRepository } from '../../infrastructure/provisioning/InMemoryRecipeRepository';
import { ok, err } from 'neverthrow';

describe('CreateRecipeUseCase', () => {
  let repository: InMemoryRecipeRepository;
  let useCase: CreateRecipeUseCase;

  beforeEach(() => {
    repository = new InMemoryRecipeRepository();
    useCase = new CreateRecipeUseCase(repository);
  });

  const validUuid = '550e8400-e29b-41d4-a716-446655440001';

  it('should successfully create a vegan recipe', async () => {
    const request: CreateRecipeRequest = {
      id: validUuid,
      title: 'Vegan Tacos',
      ingredients: [
        { name: 'Beans', quantity: 200, unit: 'grams' },
        { name: 'Tortillas', quantity: 4, unit: 'pieces' }
      ]
    };

    const result = await useCase.execute(request);

    expect(result.isOk()).toBe(true);
    const savedRecipes = await repository.findAll();
    expect(savedRecipes._unsafeUnwrap()).toHaveLength(1);
    expect(savedRecipes._unsafeUnwrap()[0]?.title.value).toBe('Vegan Tacos');
  });

  it('should fail if one ingredient is non-vegan', async () => {
    const request: CreateRecipeRequest = {
      id: validUuid,
      title: 'Cheesy Beans',
      ingredients: [
        { name: 'Beans', quantity: 200, unit: 'grams' },
        { name: 'Cheese', quantity: 50, unit: 'grams' }
      ]
    };

    const result = await useCase.execute(request);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('is not vegan');
    }
  });

  it('should fail if the title is invalid', async () => {
    const request: CreateRecipeRequest = {
      id: validUuid,
      title: '',
      ingredients: [{ name: 'Apple', quantity: 1, unit: 'piece' }]
    };

    const result = await useCase.execute(request);
    expect(result.isErr()).toBe(true);
  });

  it('should fail if the repository fails', async () => {
    const mockRepo = {
      save: jest.fn().mockResolvedValue(err(new Error('Save Failed'))),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    const failingUseCase = new CreateRecipeUseCase(mockRepo);
    const request: CreateRecipeRequest = {
      id: validUuid,
      title: 'Valid Recipe',
      ingredients: [{ name: 'Apple', quantity: 1, unit: 'piece' }]
    };

    const result = await failingUseCase.execute(request);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Save Failed');
    }
  });
});
