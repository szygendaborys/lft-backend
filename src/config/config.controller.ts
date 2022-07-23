import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.config';
import { Role } from '../roles/roles.decorator';
import { ConfigsService } from './config.service';
import { GameConfigDto } from './dto/game.config.dto';
import { GameConfigSerializer } from './serializers/games.config.serializer';

@ApiBearerAuth()
@ApiTags('config')
@Controller('config')
export class ConfigsController {
  constructor(
    private readonly configService: ConfigsService,
    private readonly gameConfigSerializer: GameConfigSerializer,
  ) {}

  @Get('games')
  @HttpCode(HttpStatus.OK)
  @Role(Roles.USER)
  @ApiOkResponse({
    type: GameConfigDto,
    isArray: true,
    description: 'Games config list',
  })
  async getGamesConfig(): Promise<GameConfigDto[]> {
    return this.gameConfigSerializer.serializeCollection(
      await this.configService.getGamesConfig(),
    );
  }
}
