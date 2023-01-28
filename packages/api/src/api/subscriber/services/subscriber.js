'use strict';

/**
 * subscriber service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::subscriber.subscriber');
