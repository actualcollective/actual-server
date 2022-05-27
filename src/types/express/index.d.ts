import { UserModel } from '../../models/user';
import { WebTokenModel } from '../../models/token';
import { IntegrationModel } from '../../models/integration';

declare global {
  namespace Express {
    export interface Request {
      currentUser: UserModel;
      webToken: WebTokenModel | null;
      integration: IntegrationModel | null;
    }
  }
}
