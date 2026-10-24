// backend/src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { Subtask } from './subtask.entity'; // <-- Add this import
import { Category } from '../categories/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Subtask, Category])], // <-- Include Subtask here
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}