import { Command } from 'commander';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryCalendarRepository } from '../../infrastructure/calendar/InMemoryCalendarRepository';
import { ScheduleEventUseCase } from '../../application/calendar/ScheduleEventUseCase';
import { InMemoryRecipeRepository } from '../../infrastructure/provisioning/InMemoryRecipeRepository';
import { CreateRecipeUseCase } from '../../application/provisioning/CreateRecipeUseCase';

const program = new Command();

// --- Setup ---
const calendarRepo = new InMemoryCalendarRepository();
const scheduleEventUC = new ScheduleEventUseCase(calendarRepo);

const recipeRepo = new InMemoryRecipeRepository();
const createRecipeUC = new CreateRecipeUseCase(recipeRepo);

program
  .name('family-dashboard')
  .description('CLI for managing your household mental load')
  .version('1.0.0');

// --- Calendar Commands ---
const calendar = program.command('calendar').description('Manage calendar events');

calendar
  .command('add')
  .description('Schedule a new event')
  .argument('<title>', 'Event title')
  .argument('<start>', 'Start time (ISO string)')
  .argument('<end>', 'End time (ISO string)')
  .action(async (title, start, end) => {
    const result = await scheduleEventUC.execute({
      id: uuidv4(),
      title,
      start: new Date(start),
      end: new Date(end),
    });

    if (result.isOk()) {
      console.log(chalk.green(`✔ Event "${title}" scheduled successfully.`));
    } else {
      console.log(chalk.red(`✘ Failed to schedule event: ${result.error.message}`));
    }
  });

calendar
  .command('list')
  .description('List all events')
  .action(async () => {
    const result = await calendarRepo.findAll();
    if (result.isOk()) {
      console.log(chalk.blue('\n--- Upcoming Events ---'));
      result.value.forEach(event => {
        console.log(`${chalk.bold(event.title.value)}: ${event.timeSpan.start.toLocaleString()} - ${event.timeSpan.end.toLocaleString()}`);
      });
      console.log('');
    }
  });

// --- Provisioning Commands ---
const provisioning = program.command('provisioning').description('Manage recipes and ingredients');

provisioning
  .command('add-recipe')
  .description('Add a new vegan recipe')
  .argument('<title>', 'Recipe title')
  .argument('<ingredients...>', 'Ingredients in format name:quantity:unit')
  .action(async (title, ingredients) => {
    const parsedIngredients = ingredients.map((ing: string) => {
      const [name, quantity, unit] = ing.split(':');
      return { name, quantity: Number(quantity), unit };
    });

    const result = await createRecipeUC.execute({
      id: uuidv4(),
      title,
      ingredients: parsedIngredients,
    });

    if (result.isOk()) {
      console.log(chalk.green(`✔ Recipe "${title}" added successfully.`));
    } else {
      console.log(chalk.red(`✘ Failed to add recipe: ${result.error.message}`));
    }
  });

provisioning
  .command('list-recipes')
  .description('List all recipes')
  .action(async () => {
    const result = await recipeRepo.findAll();
    if (result.isOk()) {
      console.log(chalk.blue('\n--- Family Recipes ---'));
      result.value.forEach(recipe => {
        const ings = recipe.ingredients.map(i => `${i.quantity} ${i.ingredient.unit} of ${i.ingredient.name}`).join(', ');
        console.log(`${chalk.bold(recipe.title.value)}: [${ings}]`);
      });
      console.log('');
    }
  });

program.parse(process.argv);
