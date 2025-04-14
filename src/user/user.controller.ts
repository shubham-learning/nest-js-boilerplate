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
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UserParamsDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { GetUserDto } from './dto/get-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const { data } = await this.userService.create(createUserDto);
      res
        .setHeader('x-message', 'User created successfully')
        .setHeader('x-public-id', data.publicId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  @Get()
  async findAll(@Res({ passthrough: true }) res: Response): Promise<User[]> {
    try {
      const { data, count } = await this.userService.findAll();

      res.setHeader('x-total-count', count);

      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  @Get(':publicId')
  async findOne(@Param() params: GetUserDto): Promise<User | null> {
    try {
      const { data } = await this.userService.findOne(params.publicId);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  @Patch(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param() params: UserParamsDto,
    @Body() updateUserDto: UpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.userService.update(params.publicId, updateUserDto);

    res
      .setHeader('x-message', 'User updated successfully')
      .setHeader('x-public-id', params.publicId);
  }
}
