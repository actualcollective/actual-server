import { WebToken, WebTokenAttributes, WebTokenModel } from '../models/token';
import { FindOptions, UpdateOptions } from 'sequelize';
import ActualError from '../exceptions/actual';

export default class WebTokenService {
  public async Create(userId: string): Promise<{ token: WebTokenModel }> {
    const token = await WebToken.create({ user_id: userId });

    return { token };
  }

  public async Update(
    id: string,
    userId: string | null = null,
    input: Partial<WebTokenModel>,
  ): Promise<{ token: WebTokenModel }> {
    const options: UpdateOptions<WebTokenAttributes> = { where: { id: id } };

    if (userId) {
      options.where = { ...options.where, user_id: userId };
    }

    const [affectedCount] = await WebToken.update(input, options);

    if (affectedCount === 0) {
      throw Error(`Update was unsuccessful for token with id ${id}. no rows affected.`);
    }

    return await this.GetToken(id);
  }

  public async GetToken(id: string, userId: string | null = null): Promise<{ token: WebTokenModel }> {
    const options: FindOptions<WebTokenAttributes> = { where: { id: id } };

    if (userId) {
      options.where = { ...options.where, user_id: userId };
    }

    const token = await WebToken.findOne(options);

    if (!token) {
      throw new ActualError('not-found');
    }

    return { token };
  }

  public async Validate(id: string, userId: string | null = null): Promise<{ token: WebTokenModel }> {
    const { token } = await this.GetToken(id, userId);

    if (Date.now() - token.createdAt.getTime() >= 1000 * 60 * 10) {
      throw new ActualError('expired');
    }

    return { token };
  }
}
