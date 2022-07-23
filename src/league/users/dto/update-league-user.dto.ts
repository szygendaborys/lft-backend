import { PartialType } from '@nestjs/swagger';
import { CreateLeagueUserDto } from './create-league-user.dto';

export class UpdateLeagueUserDto extends PartialType(CreateLeagueUserDto) {}
