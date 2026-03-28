import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { ProductCategoryService } from '../services/product-category.service';

@Controller('product-categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Post()
  createCategory(@Body() body: { name: string; description?: string }) {
    return this.categoryService.createCategory(body);
  }

  @Get()
  findAllCategories() {
    return this.categoryService.findAllCategories();
  }

  @Get(':id')
  findCategoryById(@Param('id') id: number) {
    return this.categoryService.findCategoryById(id);
  }

  @Patch(':id')
  updateCategory(@Param('id') id: number, @Body() body: { name?: string; description?: string }) {
    return this.categoryService.updateCategory(id, body);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
