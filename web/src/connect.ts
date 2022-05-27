import axios from 'axios';
import config from './config';
import Alpine from 'alpinejs';

export default (tokenId: unknown) => ({
  token: null,
  init() {
    Alpine.store('isLoading', true);
    this.validate()
      .then((data) => {
        this.token = data.data;
        Alpine.store('isLoading', false);
      })
      .catch((err) => {
        Alpine.store('error', this.reason(err.response?.data?.reason));
        Alpine.store('isLoading', false);
      });
  },
  async validate() {
    const res = await axios.post(config.url + '/plaid/validate-web-token', { data: tokenId });
    return res.data;
  },
  reason(error: string) {
    let msg = 'unknown error occurred';
    switch (error) {
      case 'expired':
        msg = 'This token has expired';
        break;
      default:
        break;
    }

    return msg;
  },
});
