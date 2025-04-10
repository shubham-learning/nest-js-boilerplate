import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { publicId } = await this.authService.createUser(email, password);
    res
      .setHeader('x-message', 'User updated successfully')
      .setHeader('x-public-id', publicId);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ success: boolean }> {
    const isValid = await this.authService.validatePassword(email, password);
    return { success: isValid };
  }
}
