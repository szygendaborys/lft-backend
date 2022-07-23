import * as als from 'async-local-storage';

export class UsersContext {
  static readonly namespace = 'usersContext';
  private static readonly key = `${UsersContext.namespace}:userId`;

  static set(userId: string): void {
    als.set(this.key, userId);
  }

  static get(): { userId: string } {
    return {
      userId: als.get(this.key),
    };
  }
}
