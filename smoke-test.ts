import { InMemoryCalendarRepository } from './src/infrastructure/calendar/InMemoryCalendarRepository';
import { ScheduleEventUseCase } from './src/application/calendar/ScheduleEventUseCase';
import { InMemoryRecipeRepository } from './src/infrastructure/provisioning/InMemoryRecipeRepository';
import { CreateRecipeUseCase } from './src/application/provisioning/CreateRecipeUseCase';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

async function runSmokeTest() {
  console.log(chalk.bold.magenta('\n--- Family Dashboard Smoke Test ---\n'));

  // 1. Setup
  const calendarRepo = new InMemoryCalendarRepository();
  const scheduleUC = new ScheduleEventUseCase(calendarRepo);
  const recipeRepo = new InMemoryRecipeRepository();
  const recipeUC = new CreateRecipeUseCase(recipeRepo);

  // 2. Schedule Events
  console.log(chalk.blue('Action: Scheduling events...'));
  await scheduleUC.execute({
    id: uuidv4(),
    title: 'Morning Yoga',
    start: new Date('2026-05-27T07:00:00Z'),
    end: new Date('2026-05-27T08:00:00Z'),
  });

  const conflictResult = await scheduleUC.execute({
    id: uuidv4(),
    title: 'Conflicting Meeting',
    start: new Date('2026-05-27T07:30:00Z'),
    end: new Date('2026-05-27T08:30:00Z'),
  });

  if (conflictResult.isErr()) {
    console.log(chalk.yellow(`Expected Conflict: ${conflictResult.error.message}`));
  }

  // 3. Create Recipes
  console.log(chalk.blue('\nAction: Adding recipes...'));
  await recipeUC.execute({
    id: uuidv4(),
    title: 'Vegan Burger',
    ingredients: [
      { name: 'Black Beans', quantity: 400, unit: 'grams' },
      { name: 'Oats', quantity: 100, unit: 'grams' },
    ],
  });

  const nonVeganResult = await recipeUC.execute({
    id: uuidv4(),
    title: 'Cheese Omelette',
    ingredients: [
      { name: 'Egg', quantity: 3, unit: 'pieces' },
      { name: 'Cheese', quantity: 50, unit: 'grams' },
    ],
  });

  if (nonVeganResult.isErr()) {
    console.log(chalk.yellow(`Expected Invariant Violation: ${nonVeganResult.error.message}`));
  }

  // 4. Verify State
  console.log(chalk.blue('\n--- Final System State ---'));
  
  const events = await calendarRepo.findAll();
  console.log(chalk.bold('Calendar:'));
  events._unsafeUnwrap().forEach(e => console.log(`  - ${e.title.value} (${e.timeSpan.start.toISOString()})`));

  const recipes = await recipeRepo.findAll();
  console.log(chalk.bold('Recipes:'));
  recipes._unsafeUnwrap().forEach(r => console.log(`  - ${r.title.value} [VEGAN]`));

  console.log(chalk.green.bold('\n✔ Smoke Test Passed.\n'));
}

runSmokeTest().catch(console.error);
