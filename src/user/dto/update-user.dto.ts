import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserParamsDto {
  @IsNotEmpty({ message: 'Parameter: publicId is required.' })
  @IsUUID(4, { message: 'Please enter valid publicId' })
  publicId: string;
}
