import BankContextService from './bankCtx';
import IntegrationService from './integration';
import axios from 'axios';

export default class BankSyncService {
  private bankCtx: BankContextService;
  private integration: IntegrationService;

  constructor() {
    this.bankCtx = new BankContextService();
    this.integration = new IntegrationService();
  }

  public async GetAccounts(bankCtxId: string): Promise<{ accounts: unknown }> {
    const { bankCtx } = await this.bankCtx.GetContext(bankCtxId);
    const { integration } = await this.integration.GetIntegration(bankCtx.integration_id, null, false);

    const res = await axios.post<ExpectedResponse>(integration.url + '/api/plaid/accounts', {
      token: integration.token,
      bankCtx: bankCtx.id,
    });

    return { accounts: res.data.data };
  }

  public async GetTransactions(
    bankCtxId: string,
    startDate: string,
    endDate: string,
    acctId: string,
    count: number,
    offset: number,
  ): Promise<unknown> {
    const { bankCtx } = await this.bankCtx.GetContext(bankCtxId);
    const { integration } = await this.integration.GetIntegration(bankCtx.integration_id, null, false);

    const res = await axios.post<ExpectedResponse>(integration.url + '/api/plaid/transactions', {
      token: integration.token,
      bankCtx: bankCtx.id,
      startDate,
      endDate,
      acctId,
      count,
      offset,
    });

    return res.data.data;
  }
}

interface ExpectedResponse {
  status: string;
  data: unknown;
}
