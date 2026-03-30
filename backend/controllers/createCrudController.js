const crudModel = require('../models/crudModel');

const createCrudController = (config) => ({
  async list(req, res, next) {
    try {
      const rows = await crudModel.list(config, req.query.search || '');
      res.json({ data: rows });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const record = await crudModel.getById(config, req.params.id);

      if (!record) {
        return res.status(404).json({ message: 'Record not found.' });
      }

      res.json({ data: record });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const payload = config.preparePayload(req.body);
      const missingFields = config.validate(payload);

      if (missingFields.length) {
        return res.status(400).json({ message: `Missing or invalid fields: ${missingFields.join(', ')}` });
      }

      const record = await crudModel.create(config, payload);
      res.status(201).json({ message: 'Record created successfully.', data: record });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const payload = config.preparePayload(req.body);
      const record = await crudModel.update(config, req.params.id, payload);
      res.json({ message: 'Record updated successfully.', data: record });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await crudModel.remove(config, req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: 'Record not found.' });
      }

      res.json({ message: 'Record deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  async navigate(req, res, next) {
    try {
      const record = await crudModel.navigate(config, req.query.direction, req.query.currentId);

      if (!record) {
        return res.status(404).json({ message: 'No record found for this direction.' });
      }

      res.json({ data: record });
    } catch (error) {
      next(error);
    }
  },
});

module.exports = createCrudController;
