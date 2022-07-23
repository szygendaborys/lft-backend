import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { UtilsService } from '../shared/utils.service';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    if (event.entity.password) {
      event.entity.password = UtilsService.generateHash(event.entity.password);
    }
  }

  beforeUpdate(event: UpdateEvent<User>) {
    if (
      event.entity?.password &&
      event.databaseEntity?.password &&
      event.entity.password !== event.databaseEntity.password
    ) {
      event.entity.password = UtilsService.generateHash(event.entity.password);
    }
  }
}
