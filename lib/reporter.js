"use strict";

module.exports = {
  reporter: function (errors) {
    process.stdout.write(JSON.stringify(errors));
  }
};