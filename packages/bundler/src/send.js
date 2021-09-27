const debug = require('debug')('webpack:send');

export const DONE = 'DONE';
export const ERROR = 'ERROR';
export const STATS = 'STATS';
export const STARTING = 'STARTING';
export const RESTART = 'RESTART';
export const UPDATE_PORT = 'UPDATE_PORT';

export default function send(message) {
  if (process.send) {
    debug(`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}
