import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from 'src/common';
import { CredentialService } from './credential.service';
import { CreateCredentialDto } from './dtos/create.dto';

@Controller({ path: 'credential', version: '1' })
export class CredentialController {
  private readonly logger = new Logger(CredentialController.name);

  constructor(
    private readonly credentialService: CredentialService,
    // private readonly systemLogService: SystemLogService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor(''))
  async create(@Body() createDto: CreateCredentialDto, @Req() req) {
    const category = await this.credentialService.create(createDto, req.user);

    // await this.systemLogService.log({
    //   type: SystemLogType.CategoryCreated,
    //   note: `User ${req.user.email} created a new CATEGORY.`,
    //   status: Status.Success,
    //   data: {
    //     user: req.user,
    //     id: category.result._id,
    //     title: category.result.name,
    //   },
    // });

    return category;
  }

  //   @Patch(':id')
  //   @UseGuards(AdminJwtAuthGuard, RolesGuard)
  //   async update(
  //     @Param('id') id: string,
  //     @Body() updateData: { name: string },
  //     @Req() req,
  //   ) {
  //     const updatedCategory = await this.platformService.update(
  //       id,
  //       updateData,
  //       req.user,
  //     );

  //     // await this.systemLogService.log({
  //     //   type: SystemLogType.CategoryUpdated,
  //     //   note: `User ${req.user.email} updated CATEGORY ${id}`,
  //     //   status: Status.Success,
  //     //   data: {
  //     //     user: req.user,
  //     //     id: updatedCategory._id,
  //     //     title: updatedCategory.name,
  //     //     changes: updateData,
  //     //   },
  //     // });

  //     return updatedCategory;
  //   }
}
