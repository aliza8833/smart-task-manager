// backend/src/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Task } from './task.entity';
import { Subtask } from './subtask.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Subtask)
    private readonly subtaskRepository: Repository<Subtask>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(userId: number, search?: string, status?: string): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = { user: { id: userId } };

    if (search) {
      where.title = Like(`%${search}%`);
    }

    if (status === 'active') {
      where.is_completed = false;
    } else if (status === 'completed') {
      where.is_completed = true;
    }

    return this.taskRepository.find({
      where,
      relations: { category: true, subtasks: true },
      order: { dueDate: 'ASC', id: 'DESC' },
    });
  }

  async create(userId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    let categoryEntity: Category | undefined = undefined;

    if (createTaskDto.category) {
      const found = await this.categoryRepository.findOne({ where: { name: createTaskDto.category } });
      if (found) {
        categoryEntity = found;
      } else {
        const newCat = this.categoryRepository.create({ name: createTaskDto.category });
        categoryEntity = await this.categoryRepository.save(newCat);
      }
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      priority: createTaskDto.priority,
      dueDate: createTaskDto.dueDate,
      category: categoryEntity,
      user: { id: userId } as User,
    });

    const savedTask = await this.taskRepository.save(task);
    return this.taskRepository.findOne({
      where: { id: savedTask.id },
      relations: { category: true, subtasks: true },
    }) as Promise<Task>;
  }

  async toggle(userId: number, id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { category: true, subtasks: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    task.is_completed = !task.is_completed;
    return this.taskRepository.save(task);
  }

  async remove(userId: number, id: number): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id, user: { id: userId } } });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepository.delete(id);
  }

  // --- Subtask Methods ---

  async addSubtask(taskId: number, title: string): Promise<Subtask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const subtask = this.subtaskRepository.create({
      title,
      task,
    });
    return this.subtaskRepository.save(subtask);
  }

  async toggleSubtask(subtaskId: number): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId } });
    if (!subtask) throw new NotFoundException('Subtask not found');

    subtask.is_completed = !subtask.is_completed;
    return this.subtaskRepository.save(subtask);
  }

  async deleteSubtask(subtaskId: number): Promise<void> {
    const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId } });
    if (!subtask) throw new NotFoundException('Subtask not found');

    await this.subtaskRepository.delete(subtaskId);
  }
}