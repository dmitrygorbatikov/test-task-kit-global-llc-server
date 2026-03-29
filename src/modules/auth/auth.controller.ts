import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'User successfully logged in',
    schema: {
      example: {
        accessToken: 'jwt-token-here',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() body: LoginUserDto) {
    return await this.authService.loginUser(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    schema: {
      example: {
        accessToken: 'jwt-token-here',
      },
    },
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() body: RegisterUserDto) {
    return await this.authService.registerUser(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'User successfully logged out',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: express.Request) {
    const token = req.headers.authorization?.split(' ')[1] as string;

    await this.authService.logout(token);

    return {
      success: true,
    };
  }
}
