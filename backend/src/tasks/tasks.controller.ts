import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Defines the shape of the request object after JWT validation
interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Req() req: RequestWithUser, @Query('search') search?: string, @Query('status') status?: string) {
    return this.tasksService.findAll(req.user.userId, search, status);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Patch(':id/toggle')
  async toggle(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.tasksService.toggle(req.user.userId, Number(id));
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.tasksService.remove(req.user.userId, Number(id));
  }
}
