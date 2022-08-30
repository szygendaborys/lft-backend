import { PageOptionsDto } from './../shared/page/pageOptions.dto';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../shared/page/page.constants';
import { PageDto } from '../shared/page/page.dto';

@Injectable()
export class RoomChatMessagesRepository {
  constructor(
    @InjectRepository(RoomChatMessageEntity)
    private readonly repository: Repository<RoomChatMessageEntity>,
  ) {}

  saveMessage(message: RoomChatMessageEntity): Promise<RoomChatMessageEntity> {
    return this.repository.save(message);
  }

  getAllMessagesForRoom({
    roomId,
    pageOptionsDto,
  }: {
    roomId: string;
    pageOptionsDto: PageOptionsDto;
  }): Promise<PageDto<RoomChatMessageEntity>> {
    return this.repository
      .createQueryBuilder('rcm')
      .leftJoinAndSelect('rcm.author', 'rcma')
      .where('rcm.roomId = :roomId', { roomId })
      .orderBy('rcm.createdAt', Order.ASC)
      .paginate(pageOptionsDto);
  }
}
