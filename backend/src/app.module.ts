import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';
import { Subtask } from './tasks/subtask.entity'; // <--- 1. Import Subtask here
import { Category } from './categories/category.entity';
import { User } from './users/user.entity';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: '/app/data/database.sqlite',
      entities: [Task, Subtask, Category, User], // <--- 2. Add Subtask to entities array
      synchronize: true,
    }),
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
