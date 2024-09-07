const express = require('express');
const body_pa = require('body-parser');
const multer = require('multer');
const uploads = multer();

function configureExpress(app) {
  app.use(
    express.urlencoded({
      extended: false,
    }),
  );
  app.use(express.json());
  app.use(body_pa.urlencoded({ extended: true }));
}
global.uploads = uploads;

module.exports = configureExpress;
