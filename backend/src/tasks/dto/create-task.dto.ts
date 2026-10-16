import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional() // <--- NEW: Optional due date validation
  @IsString()
  dueDate?: string;
}