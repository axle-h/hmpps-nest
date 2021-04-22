import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ViewModel, ValidateAndRender } from './validation';

class ExampleDto {
  @IsString()
  @IsNotEmpty()
  stringValue: string;

  @IsInt()
  @Type(() => Number)
  intValue: number;
}

@Controller()
export class AppController {
  @Get()
  @Render('pages/index')
  get(): ViewModel<ExampleDto> {
    return { model: new ExampleDto() };
  }

  @Post()
  @ValidateAndRender('pages/index')
  post(@Body() model: ExampleDto): ViewModel<ExampleDto> {
    return { model };
  }
}
