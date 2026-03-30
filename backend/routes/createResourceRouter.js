const express = require('express');

const createResourceRouter = (controller) => {
  const router = express.Router();

  router.get('/', controller.list);
  router.get('/navigate', controller.navigate);
  if (controller.getInvoice) {
    router.get('/:id/invoice', controller.getInvoice);
  }
  router.get('/:id', controller.getById || controller.getOne);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};

module.exports = createResourceRouter;
