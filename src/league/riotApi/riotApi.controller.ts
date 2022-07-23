import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';
import {
  RiotApiRankedDataBySummonerIdParams,
  RiotApiSummonerFindByNameParams,
} from './dto/riotApiParams.dto';
import {
  RiotApiRankedDataBySummonerIdDto,
  RiotApiSummonerResponseDto,
} from './dto/riotApiResponses.dto';
import { RiotApiService } from './riotApi.service';

@Controller('riot_api')
@ApiTags('league', 'games')
export class RiotApiController {
  constructor(private readonly riotApiService: RiotApiService) {}

  @Public()
  @Get(':region/:summonerName')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: RiotApiSummonerResponseDto,
  })
  async findAccount(
    @Param() { summonerName, region }: RiotApiSummonerFindByNameParams,
  ): Promise<RiotApiSummonerResponseDto> {
    return this.riotApiService.fetchAccount(region, summonerName);
  }

  @ApiBearerAuth()
  @Get('/ranked/:region/:summonerId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: RiotApiRankedDataBySummonerIdDto,
    isArray: true,
  })
  async findRankedData(
    @Param() { summonerId, region }: RiotApiRankedDataBySummonerIdParams,
  ): Promise<RiotApiRankedDataBySummonerIdDto[]> {
    return this.riotApiService.fetchPlayerRankedInfo(region, summonerId);
  }
}
