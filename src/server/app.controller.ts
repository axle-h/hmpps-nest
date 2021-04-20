import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('pages/index')
  root() {
    return {};
  }
}
