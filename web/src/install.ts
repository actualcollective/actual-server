import axios from 'axios';
import config from './config';
import Alpine from 'alpinejs';

export default (tokenId: unknown) => ({
  url: '',
  getUrl(integrationId: string) {
    Alpine.store('isLoading', true);
    this.buildUrl(integrationId)
      .then((data) => {
        this.url = data.data.url;
        Alpine.store('isLoading', false);
        window.location.href = this.url;
      })
      .catch((err) => {
        console.log(err);
        Alpine.store('error', 'unknown error occurred');
        Alpine.store('isLoading', false);
      });
  },
  async buildUrl(integrationId: string) {
    const res = await axios({
      method: 'POST',
      baseURL: config.url,
      url: 'integrations/install',
      data: {
        token: tokenId,
        id: integrationId,
        // possible future bankCtx on relink
      },
    });
    return res.data;
  },
});
