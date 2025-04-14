import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetUserDto {
  @IsNotEmpty({ message: 'Parameter: publicId is required.' })
  @IsUUID(4, { message: 'Please enter valid publicId' })
  publicId: string;
}
