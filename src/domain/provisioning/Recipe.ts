import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';
import { UniqueId } from '../shared/UniqueId';
import { Ingredient } from './Ingredient';

export class RecipeId extends UniqueId {
  public static override create(value: string): Result<RecipeId, Error> {
    const result = super.create(value);
    return result.map((id) => new RecipeId(id.value));
  }
}

const TitleSchema = z.string().min(1).max(150);

export class RecipeTitle {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<RecipeTitle, Error> {
    const result = TitleSchema.safeParse(value);
    if (!result.success) {
      return err(new Error(result.error.issues[0]?.message ?? "Invalid Title"));
    }
    return ok(new RecipeTitle(result.data));
  }
}

export interface RecipeIngredient {
  readonly ingredient: Ingredient;
  readonly quantity: number;
}

export interface RecipeProps {
  readonly id: RecipeId;
  readonly title: RecipeTitle;
  readonly ingredients: RecipeIngredient[];
}

/**
 * Recipe Aggregate Root
 * Enforces that a recipe must have at least one valid (vegan) ingredient.
 */
export class Recipe {
  private constructor(private readonly props: RecipeProps) {}

  public static create(props: RecipeProps): Result<Recipe, Error> {
    if (props.ingredients.length === 0) {
      return err(new Error('A recipe must have at least one ingredient'));
    }

    // Since 'Ingredient' can only be created if it's vegan, 
    // the type system guarantees all recipes are vegan here.
    return ok(new Recipe(props));
  }

  get id(): RecipeId {
    return this.props.id;
  }

  get title(): RecipeTitle {
    return this.props.title;
  }

  get ingredients(): ReadonlyArray<RecipeIngredient> {
    return [...this.props.ingredients];
  }
}
