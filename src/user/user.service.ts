import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.usersRepository.save(createUserDto);
  }

  async findAll(): Promise<{ users: User[]; count: number }> {
    const [users, count] = await this.usersRepository.findAndCount();
    return { users, count };
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }

  async update(publicId: string, updateUserDto: UpdateUserDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { publicId },
        select: ['id'],
      });

      if (!user) {
        throw new NotFoundException(
          `User with public ID ${publicId} not found`,
        );
      }

      await queryRunner.manager.update(User, { id: user.id }, updateUserDto);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
