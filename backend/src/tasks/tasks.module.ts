import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { Category } from '../categories/category.entity'; // <--- Import Category

@Module({
  imports: [TypeOrmModule.forFeature([Task, Category])], // <--- Add Category here
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}