import { Result } from 'neverthrow';
import { Recipe, RecipeId } from './Recipe';

/**
 * Port for Recipe Persistence.
 */
export interface RecipeRepository {
  save(recipe: Recipe): Promise<Result<void, Error>>;
  findById(id: RecipeId): Promise<Result<Recipe | null, Error>>;
  findAll(): Promise<Result<Recipe[], Error>>;
}
