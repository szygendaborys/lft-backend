import { RoomChatMessageService } from './roomChatMessage.service';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { PAGINATION_ROOM_CHAT_MESSAGE_SERIALIZER } from './roomChatMessage.config';
import { User } from './../users/user.entity';
import { PageOptionsDto } from './../shared/page/pageOptions.dto';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../roles/roles.config';
import { Role } from '../roles/roles.decorator';
import { RoomChatMessageDto } from './dto/roomChatMessage.dto';
import { AuthUser } from '../auth/authUser.decorator';
import { PageDto } from '../shared/page/page.dto';
import { AbstractPaginationSerializer } from '../shared/serializer/abstract-pagination.serializer';

@Controller('/rooms/chat/messages')
export class RoomChatMessageController {
  constructor(
    private readonly roomChatMessageService: RoomChatMessageService,
    @Inject(PAGINATION_ROOM_CHAT_MESSAGE_SERIALIZER)
    private readonly paginationRoomChatMessageSerializer: AbstractPaginationSerializer<
      RoomChatMessageEntity,
      RoomChatMessageDto
    >,
  ) {}

  @Get(':roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: RoomChatMessageDto,
    isArray: true,
    description: 'Paginated room chat message response',
  })
  @Role(Roles.USER)
  async fetchMessages(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @AuthUser() user: User,
  ): Promise<PageDto<RoomChatMessageDto>> {
    return this.paginationRoomChatMessageSerializer.serialize(
      await this.roomChatMessageService.fetchMessages({
        pageOptionsDto,
        roomId,
        userId: user.id,
      }),
    );
  }
}
