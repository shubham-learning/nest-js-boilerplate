import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Parameter: name is required.' })
  @IsString({ message: 'Please enter valid name' })
  @MinLength(9, { message: 'Name must be at least 9 characters long.' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Parameter: email is required.' })
  email: string;
}
