import { Result, ok } from 'neverthrow';
import { Recipe, RecipeId } from '../../domain/provisioning/Recipe';
import { RecipeRepository } from '../../domain/provisioning/RecipeRepository';

export class InMemoryRecipeRepository implements RecipeRepository {
  private readonly recipes: Map<string, Recipe> = new Map();

  public async save(recipe: Recipe): Promise<Result<void, Error>> {
    this.recipes.set(recipe.id.value, recipe);
    return ok(undefined);
  }

  public async findById(id: RecipeId): Promise<Result<Recipe | null, Error>> {
    return ok(this.recipes.get(id.value) ?? null);
  }

  public async findAll(): Promise<Result<Recipe[], Error>> {
    return ok(Array.from(this.recipes.values()));
  }
}
