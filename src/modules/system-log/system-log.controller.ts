import { Controller, Get, Query } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
// import { RolesGuard } from '../auth/guards/RolesGuard';
import { SystemLogType } from '../../entities/system-log.entity';
import { PaginationOptionsInterface } from '../paginate/pagination.options.interface';

@Controller('logs')
export class SystemLogController {
  constructor(private readonly systemLogService: SystemLogService) {}

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  async getLogs(
    @Query('type') type?: SystemLogType,
    @Query('page') page = 1,
    @Query('page_size') page_size = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const paginationOptions: PaginationOptionsInterface = {
      page: +page,
      page_size: +page_size,
    };

    // Always use the findAll method with all filters
    return await this.systemLogService.findAll(paginationOptions, {
      type,
      startDate,
      endDate,
    });
  }

  @Get('/latest-user-statistic')
  async getLatestUserStatistic() {
    return await this.systemLogService.findLatestUserStatistic();
  }
}
