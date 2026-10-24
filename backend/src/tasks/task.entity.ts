// backend/src/tasks/task.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { Subtask } from './subtask.entity'; // <-- Add this import

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ default: 'Medium' })
  priority: string;

  @Column({ nullable: true })
  dueDate: string;

  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true, eager: true })
  category: Category;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User;

  // ---> ADD THIS LINE BELOW <---
  @OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true, eager: true })
  subtasks: Subtask[];
}