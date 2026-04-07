import { Controller, Get, Query } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Languages | Linguagens')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar linguagens',
    description:
      'Retorna até 50 linguagens ordenadas por nome. Permite filtrar por termo de busca (case-insensitive).',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Termo de busca para filtrar linguagens pelo nome.',
    example: 'type',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de linguagens retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          slug: { type: 'string', example: 'typescript' },
          name: { type: 'string', example: 'TypeScript' },
        },
      },
    },
    example: [
      { id: 1, slug: 'typescript', name: 'TypeScript' },
      { id: 2, slug: 'python', name: 'Python' },
      { id: 3, slug: 'rust', name: 'Rust' },
    ],
  })
  async findAll(@Query('search') searchTerm?: string) {
    return this.languagesService.findAll(searchTerm);
  }
}
