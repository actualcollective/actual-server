import './style.css';
import Alpine from 'alpinejs';
import connect from './connect';
import integration from './integration';
import install from './install';

window.Alpine = Alpine;

Alpine.store('error', '');
Alpine.store('isLoading', true);

Alpine.data('connect', connect);
Alpine.data('integration', integration);
Alpine.data('install', install);

Alpine.start();
