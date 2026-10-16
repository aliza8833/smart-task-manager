import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';
import { Category } from './categories/category.entity';
import { User } from './users/user.entity';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3', // <--- Updated to match supported driver
      database: 'database.sqlite',
      entities: [Task, Category, User],
      synchronize: true,
    }),
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
