import { Controller, Get, Query } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll(@Query('search') searchTerm?: string) {
    return this.languagesService.findAll(searchTerm);
  }
}
