import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import {
  SystemLogStatus,
  SystemLogType,
} from '../../entities/system-log.entity';
import { CronTime } from '../../utils/time';
import { SystemLogService } from '../system-log/system-log.service';
import { SuperUserService } from './superuser.service';

@Injectable()
export class UserSchedule {
  constructor(
    private readonly service: SuperUserService,
    private readonly systemLogService: SystemLogService,
  ) {}

  @Cron(CronTime.Daily)
  async statisticTotalUserCountOfEachStatus(): Promise<void> {
    this.systemLogService.log({
      type: SystemLogType.UserStatistic,
      status: SystemLogStatus.Success,
      note: 'Statistic total user count of each status.',
      data: await this.service.getTotalCountOfEachStatus(),
    });
  }
}
