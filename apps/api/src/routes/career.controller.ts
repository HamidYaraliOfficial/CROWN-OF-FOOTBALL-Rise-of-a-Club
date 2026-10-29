import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CareerService } from '../services/career.service';

class CreateCareerDto {
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @IsString() @MinLength(1) @MaxLength(80) clubId!: string;
  @IsOptional() @IsString() @MaxLength(20) season?: string;
}
class SaveCareerDto { @IsObject() payload!: Record<string, unknown>; }

@Controller('v1/careers')
export class CareerController {
  constructor(private readonly careers: CareerService) {}
  @Get() list() { return { items: this.careers.list(), storage: 'in-memory-development-adapter' }; }
  @Post() create(@Body() dto: CreateCareerDto) { return this.careers.create(dto); }
  @Get(':id') get(@Param('id') id: string) { return this.careers.get(id); }
  @Post(':id/save') save(@Param('id') id: string, @Body() dto: SaveCareerDto) { return this.careers.savePayload(id, dto.payload); }
}
