import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LoginGuard } from '../guards/login.guard';

@Controller('login')
export class LoginController {
  @Get()
  @UseGuards(LoginGuard)
  public async get() {
    return;
  }

  @Get('callback')
  @UseGuards(LoginGuard)
  public async getCallback(@Res() res: Response) {
    res.redirect('/'); // TODO redirect based on session
  }
}
