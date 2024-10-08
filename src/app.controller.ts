import { Controller, Get, Post, Request, UseGuards, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { User } from './users/schemas/users.schema';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './decorator/customize';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService
  ) {}

  @Get()
  getHello(): string {
    console.log(this.configService.get<string>('PORT'));
    return this.appService.getHello();
  }
  @Public()
  @UseGuards(LocalAuthGuard)//use local strategy
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

}
