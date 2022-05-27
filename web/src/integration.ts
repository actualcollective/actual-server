import axios from 'axios';
import config from './config';
import Alpine from 'alpinejs';

export default () => ({
  integrations: [],
  selectedIntegration: null,
  init() {
    Alpine.store('isLoading', true);
    this.getItems()
      .then((data) => {
        this.integrations = data.data;
        Alpine.store('isLoading', false);
      })
      .catch(() => {
        Alpine.store('error', 'unknown error occurred');
        Alpine.store('isLoading', false);
      });
  },
  async getItems() {
    const res = await axios.get(config.url + '/integrations');
    return res.data;
  },
});
