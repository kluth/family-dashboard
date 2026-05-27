import { ScheduleEventUseCase, ScheduleEventRequest } from './ScheduleEventUseCase';
import { InMemoryCalendarRepository } from '../../infrastructure/calendar/InMemoryCalendarRepository';
import { CalendarEvent, EventId, EventTitle } from '../../domain/calendar/CalendarEvent';
import { TimeSpan } from '../../domain/calendar/TimeSpan';
import { ok, err } from 'neverthrow';

describe('ScheduleEventUseCase', () => {
  let repository: InMemoryCalendarRepository;
  let useCase: ScheduleEventUseCase;

  beforeEach(() => {
    repository = new InMemoryCalendarRepository();
    useCase = new ScheduleEventUseCase(repository);
  });

  const createRequest = (id: string, start: Date, end: Date): ScheduleEventRequest => ({
    id,
    title: 'Test Event',
    start,
    end,
  });

  it('should successfully schedule an event when there are no conflicts', async () => {
    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440001',
      new Date('2026-05-27T10:00:00Z'),
      new Date('2026-05-27T11:00:00Z')
    );

    const result = await useCase.execute(request);

    expect(result.isOk()).toBe(true);
    const savedEvents = await repository.findAll();
    expect(savedEvents._unsafeUnwrap()).toHaveLength(1);
  });

  it('should fail to schedule an event when there is a conflict', async () => {
    // Save an existing event
    const existingEvent = CalendarEvent.create({
      id: EventId.create('550e8400-e29b-41d4-a716-446655440001')._unsafeUnwrap(),
      title: EventTitle.create('Existing Event')._unsafeUnwrap(),
      timeSpan: TimeSpan.create({
        start: new Date('2026-05-27T10:00:00Z'),
        end: new Date('2026-05-27T11:00:00Z'),
      })._unsafeUnwrap(),
    })._unsafeUnwrap();
    await repository.save(existingEvent);

    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440002',
      new Date('2026-05-27T10:30:00Z'),
      new Date('2026-05-27T11:30:00Z')
    );

    const result = await useCase.execute(request);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('Conflict detected');
    }
  });

  it('should fail if the input is invalid (e.g. invalid UUID)', async () => {
    const request = createRequest(
      'invalid-uuid',
      new Date('2026-05-27T10:00:00Z'),
      new Date('2026-05-27T11:00:00Z')
    );

    const result = await useCase.execute(request);
    expect(result.isErr()).toBe(true);
  });

  it('should fail if the title is invalid', async () => {
    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440001',
      new Date('2026-05-27T10:00:00Z'),
      new Date('2026-05-27T11:00:00Z')
    );
    request.title = '';

    const result = await useCase.execute(request);
    expect(result.isErr()).toBe(true);
  });

  it('should fail if the time span is invalid', async () => {
    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440001',
      new Date('2026-05-27T11:00:00Z'), // start after end
      new Date('2026-05-27T10:00:00Z')
    );

    const result = await useCase.execute(request);
    expect(result.isErr()).toBe(true);
  });

  it('should fail if the repository fails to find all events', async () => {
    const mockRepo = {
      findAll: jest.fn().mockResolvedValue(err(new Error('DB Error'))),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    const failingUseCase = new ScheduleEventUseCase(mockRepo);
    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440001',
      new Date('2026-05-27T10:00:00Z'),
      new Date('2026-05-27T11:00:00Z')
    );

    const result = await failingUseCase.execute(request);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('DB Error');
    }
  });

  it('should fail if the repository fails to save', async () => {
    const mockRepo = {
      findAll: jest.fn().mockResolvedValue(ok([])),
      save: jest.fn().mockResolvedValue(err(new Error('Save Error'))),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    const failingUseCase = new ScheduleEventUseCase(mockRepo);
    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440001',
      new Date('2026-05-27T10:00:00Z'),
      new Date('2026-05-27T11:00:00Z')
    );

    const result = await failingUseCase.execute(request);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Save Error');
    }
  });
});
