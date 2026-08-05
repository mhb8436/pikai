import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DetailproductService } from './detailproduct.service';
import { SearchDetailProductDto } from './dto/search-detailproduct.dto';

@Controller('detailproduct')
export class DetailproductController {
  constructor(private readonly detailproductService: DetailproductService) {}

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: '페이지 번호',
  })
  @Get()
  findAll(@Query('page') page = '1') {
    return this.detailproductService.findAll(Number(page));
  }

  @Get('search')
  @ApiOperation({ summary: '상품 검색' })
  searchProductByName(@Query() query: SearchDetailProductDto) {
    return this.detailproductService.searchProductByName(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detailproductService.findOne(id);
  }
}
