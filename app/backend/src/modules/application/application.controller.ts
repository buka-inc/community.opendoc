import { QueryApplicationsResponseDTO } from './dto/query-applications-response.dto'
import { Body, Controller, Delete, Get, Header, Param, Put, Query } from '@nestjs/common'
import { ApplicationService } from './application.service'
import { RegisterApplicationDTO } from './dto/register-application.dto'
import { QueryApplicationsDTO } from './dto/query-applications.dto'
import { Application } from './entity/application.entity'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'


@Controller('application')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService
  ) {}

  @ApiOperation({
    deprecated: true,
  })
  @Put()
  async registerApplication(
    @Body() dto: RegisterApplicationDTO
  ): Promise<void> {
    await this.applicationService.register(dto)
  }

  @Get()
  async queryApplications(
    @Query() dto: QueryApplicationsDTO
  ): Promise<QueryApplicationsResponseDTO> {
    return this.applicationService.queryApplications(dto)
  }

  @Get(':applicationIdOrCode')
  async queryApplication(
    @Param('applicationIdOrCode') applicationIdOrCode: string
  ): Promise<Application> {
    return this.applicationService.queryApplicationByIdOrCode(applicationIdOrCode)
  }

  @Delete(':applicationIdOrCode')
  async deleteApplication(
    @Param('applicationIdOrCode') applicationIdOrCode: string
  ): Promise<void> {
    await this.applicationService.deleteApplication(applicationIdOrCode)
  }
}

