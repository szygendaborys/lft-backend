import { GameConfigSerializer } from './games.config.serializer';
import { createGameConfig } from '../../../test/utils/config.utils';

describe('Games config unit tests', () => {
  let serializer: GameConfigSerializer;

  beforeEach(() => {
    serializer = new GameConfigSerializer();
  });

  it('should serialize game', () => {
    const game = createGameConfig();

    const result = serializer.serialize(game);
    expect(result).toMatchObject({
      id: game.id,
      key: game.key,
      name: game.name,
      description: game.description,
      isActive: game.isActive,
      logo: game.logo,
    });
  });

  it('should serialize games', () => {
    const game = createGameConfig();
    const game2 = createGameConfig();

    const result = serializer.serializeCollection([game, game2]);
    expect(result).toMatchObject(
      expect.arrayContaining([
        {
          id: game.id,
          key: game.key,
          name: game.name,
          description: game.description,
          isActive: game.isActive,
          logo: game.logo,
          href: game.href,
        },
        {
          id: game2.id,
          key: game2.key,
          name: game2.name,
          description: game2.description,
          isActive: game2.isActive,
          logo: game2.logo,
          href: game2.href,
        },
      ]),
    );
  });
});
