import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  InternalServerErrorException,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true })) // Enable auto-transformation
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return this.userService.create(createUserDto);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  @Get()
  async findAll(@Res({ passthrough: true }) res: Response): Promise<User[]> {
    try {
      const response = await this.userService.findAll();
      const { users, count } = response;

      res.setHeader('x-total-count', count);

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.userService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  @Patch(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('publicId', ParseUUIDPipe) publicId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      await this.userService.update(publicId, updateUserDto);

      res
        .setHeader('x-message', 'User updated successfully')
        .setHeader('x-public-id', publicId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }
}
