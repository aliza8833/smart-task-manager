import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TasksService', () => {
  let service: TasksService;

  const mockTasksRepository = {
    find: vi.fn().mockResolvedValue([{ id: 1, title: 'Test Task', is_completed: false }]),
    create: vi.fn().mockImplementation((dto) => Promise.resolve({ id: Date.now(), ...dto })),
  };

  const mockCategoryRepository = {
    find: vi.fn().mockResolvedValue([{ id: 1, name: 'Work' }]),
    findOne: vi.fn().mockResolvedValue({ id: 1, name: 'Work' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: 'TaskRepository', // Update this token if your project uses a different injection token or getRepositoryToken(Task)
          useValue: mockTasksRepository,
        },
        {
          provide: 'CategoryRepository', // Update this token if your project uses a different injection token or getRepositoryToken(Category)
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});