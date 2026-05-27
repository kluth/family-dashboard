import { z } from 'zod';
import { Result, ok, err } from 'neverthrow';

const NON_VEGAN_KEYWORDS = [
  'milk', 'cheese', 'butter', 'egg', 'honey', 'meat', 'beef', 'pork', 'chicken', 'fish', 'lamb', 'yogurt', 'cream'
];

const IngredientSchema = z.object({
  name: z.string().min(1).max(100).transform(val => val.toLowerCase().trim()),
  unit: z.string().min(1).max(20).transform(val => val.toLowerCase().trim()),
});

export class Ingredient {
  private constructor(
    public readonly name: string,
    public readonly unit: string
  ) {}

  public static create(name: string, unit: string): Result<Ingredient, Error> {
    const result = IngredientSchema.safeParse({ name, unit });
    
    if (!result.success) {
      return err(new Error(result.error.issues[0]?.message ?? "Invalid Ingredient"));
    }

    const normalizedName = result.data.name;
    const isNotVegan = NON_VEGAN_KEYWORDS.some(keyword => normalizedName.includes(keyword));

    if (isNotVegan) {
      return err(new Error(`Ingredient "${normalizedName}" is not vegan`));
    }

    return ok(new Ingredient(normalizedName, result.data.unit));
  }
}
