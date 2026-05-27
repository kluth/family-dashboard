import { Result, err } from 'neverthrow';
import { RecipeRepository } from '../../domain/provisioning/RecipeRepository';
import { Recipe, RecipeId, RecipeTitle, RecipeIngredient } from '../../domain/provisioning/Recipe';
import { Ingredient } from '../../domain/provisioning/Ingredient';

export interface CreateRecipeRequest {
  id: string;
  title: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

export class CreateRecipeUseCase {
  constructor(private readonly repository: RecipeRepository) {}

  public async execute(request: CreateRecipeRequest): Promise<Result<void, Error>> {
    // 1. Create RecipeId
    const idResult = RecipeId.create(request.id);
    if (idResult.isErr()) return err(idResult.error);

    // 2. Create RecipeTitle
    const titleResult = RecipeTitle.create(request.title);
    if (titleResult.isErr()) return err(titleResult.error);

    // 3. Create Ingredients (Validating Vegan Invariant)
    const recipeIngredients: RecipeIngredient[] = [];
    for (const ing of request.ingredients) {
      const ingredientResult = Ingredient.create(ing.name, ing.unit);
      if (ingredientResult.isErr()) {
        return err(new Error(`Failed to add ingredient "${ing.name}": ${ingredientResult.error.message}`));
      }
      recipeIngredients.push({
        ingredient: ingredientResult.value,
        quantity: ing.quantity,
      });
    }

    // 4. Create Recipe Aggregate
    const recipeResult = Recipe.create({
      id: idResult.value,
      title: titleResult.value,
      ingredients: recipeIngredients,
    });

    if (recipeResult.isErr()) return err(recipeResult.error);

    // 5. Save
    return this.repository.save(recipeResult.value);
  }
}
