import { Integration, IntegrationModel } from '../models/integration';
import BankContextService from './bankCtx';
import WebTokenService from './token';
import { Buffer } from 'buffer';
import Str from '@supercharge/strings';
import { Op } from 'sequelize';

export default class IntegrationService {
  private bankCtx: BankContextService;
  private token: WebTokenService;

  constructor() {
    this.bankCtx = new BankContextService();
    this.token = new WebTokenService();
  }

  public async GetIntegration(
    id: string | null = null,
    secret: string | null = null,
    withoutToken = true,
  ): Promise<{ integration: IntegrationModel }> {
    let integration = null;

    if (id === null && secret === null) {
      throw Error(`Either id or secret has to be given.`);
    }

    if (withoutToken) {
      integration = await Integration.scope('withoutToken').findOne({ where: { [Op.or]: { id: id, token: secret } } });
    } else {
      integration = await Integration.findOne({ where: { [Op.or]: { id: id, token: secret } } });
    }
    if (!integration) {
      throw Error(`Integration with id ${id} does not exist.`);
    }

    return { integration };
  }

  public async GetIntegrations(): Promise<{ integrations: IntegrationModel[] }> {
    const integrations = await Integration.scope('withoutToken').findAll();

    return { integrations };
  }

  public async Create(name: string, url: string): Promise<{ integration: IntegrationModel }> {
    let integration = await Integration.findOne({ where: { name: name } });

    if (integration !== null) {
      throw Error(`Integration with name ${name} is already registered.`);
    }

    const token = Str.random(36);

    integration = await Integration.create({
      name: name,
      url: url,
      token: token,
    });

    return { integration };
  }

  public async Install(id: string, tokenId: string, bankCtxId: null | string = null): Promise<{ url: string }> {
    const { integration } = await this.GetIntegration(id, null, false);

    if (bankCtxId === null) {
      const { token } = await this.token.GetToken(tokenId);
      const { bankCtx } = await this.bankCtx.Create(token.user_id, integration.id);
      bankCtxId = bankCtx.id;
    }

    const data = JSON.stringify({ tokenId: tokenId, bankCtxId: bankCtxId, timestamp: Date.now() });

    return { url: integration.url + '/install?options=' + encodeURI(Buffer.from(data, 'utf-8').toString('base64')) };
  }
}
