import { ChatModule } from '../chat/chat.module';
import { ConfigsModule } from '../config/configs.module';
import { LeagueModule } from '../league/league.module';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../users/user.module';

export default [
  UserModule,
  ChatModule,
  ConfigsModule,
  LeagueModule,
  TicketModule,
];
