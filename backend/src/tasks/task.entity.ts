import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity'; // <--- Import User

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: 'Medium' })
  priority: string;

  @Column({ nullable: true })
  dueDate: string;

  @Column({ default: false })
  is_completed: boolean;

  @ManyToOne(() => Category, (category) => category.tasks, { onDelete: 'SET NULL', nullable: true })
  category: Category;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User; // <--- Links task to its owner
}