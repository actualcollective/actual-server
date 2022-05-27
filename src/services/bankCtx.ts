import { BankCtx, BankCtxAttributes, BankCtxModel } from '../models/bankCtx';
import { FindOptions } from 'sequelize';

export default class BankContextService {
  public async GetContext(
    id: string | null = null,
    externalId: string | null = null,
  ): Promise<{ bankCtx: BankCtxModel }> {
    if (id === null && externalId === null) {
      throw Error(`Either id or externalId has to be given.`);
    }
    const options: FindOptions<BankCtxAttributes> = { where: {} };

    if (id) {
      options.where = { ...options.where, id: id };
    }

    if (externalId) {
      options.where = { ...options.where, external_id: externalId };
    }

    const bankCtx = await BankCtx.findOne(options);

    if (!bankCtx) {
      throw Error(`Bank Context with id ${id} does not exist.`);
    }

    return { bankCtx };
  }

  public async Create(userId: string, integrationId: string): Promise<{ bankCtx: BankCtxModel }> {
    const bankCtx = await BankCtx.create({ integration_id: integrationId, user_id: userId });

    return { bankCtx };
  }

  public async Update(
    id: string,
    integrationId: string,
    payload: string,
    externalId: string | null = null,
  ): Promise<{ affectedCount: number }> {
    const [affectedCount] = await BankCtx.update(
      { payload: payload, external_id: externalId },
      { where: { id: id, integration_id: integrationId } },
    );

    if (affectedCount === 0) {
      throw Error(`Update was unsuccessful for bankCtx with id ${id}. no rows affected.`);
    }

    return { affectedCount };
  }
}
