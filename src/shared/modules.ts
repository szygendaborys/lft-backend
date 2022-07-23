import { ConfigsModule } from '../config/configs.module';
import { LeagueModule } from '../league/league.module';
import { UserModule } from '../users/user.module';
import { SeedingModule } from '../database/seeding/seeding.module';

export default [UserModule, SeedingModule, ConfigsModule, LeagueModule];
