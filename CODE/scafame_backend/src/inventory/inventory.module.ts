import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './services/product.service';
import { UnitService } from './services/unit.service';
import { ProductCategoryService } from './services/product-category.service';

import { ProductCategoryController } from './controllers/product-category.controller';
import { ProductController } from './controllers/product.controller';
import { UnitController } from './controllers/unit.controller';

import { Product } from '../entities/product.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { Unit } from '../entities/unit.entity';

import { Report } from '../entities/report.entity';
import { ProductReport } from '../entities/productReport.entity';
import { User } from '../entities/user.entity'; 
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';

import { InventoryReportController } from './controllers/inventory-report.controller';
import { InventoryReportService } from './services/inventory-report.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory, Unit, Report, ProductReport, User]), // <- Aquí se importan las entidades
    NotificationsModule,
  ],
  providers: [
    ProductService,
    UnitService,
    ProductCategoryService,
    ReportService,
    InventoryReportService,
  ],
  controllers: [
    ProductCategoryController,
    ProductController,
    UnitController,
    ReportController,
    InventoryReportController
  ],
})
export class InventoryModule {}
