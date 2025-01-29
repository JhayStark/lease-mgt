const statisticsRouter = require('express').Router();
const { getStatistics } = require('./stats.controller');

statisticsRouter.get('/', getStatistics);

module.exports = statisticsRouter;
