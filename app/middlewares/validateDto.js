// middlewares/validateAndMapDto.js
const { validationResult } = require('express-validator');
const { matchedData } = require('express-validator');
const bodyParser = require('body-parser');
const BadRequestException = require('../exceptions/BadRequestException');

const jsonParser = bodyParser.json();

const validateDto = (schema) => {
  return [
    jsonParser,
    schema,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadRequestException(errors.array());
      }

      const dto = matchedData(req, { includeOptionals: true });
      req.dto = dto;

      next();
    },
  ];
};

module.exports = validateDto;
