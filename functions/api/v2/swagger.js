const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TarkovTracker API",
      description:
        "Official TarkovTracker API - player's progress, objectives, level, reputation and much more in one place. If you are missing something here, let the developers know on TarkovTracker Discord server or create a new issue on GitHub.",
      version: "2.0",
      contact: {
        name: "TarkovTracker GitHub",
        url: "https://github.com/TarkovTracker/TarkovTracker",
      },
      license: {
        name: "GNU General Public License v3.0",
      },
    },
    servers: [
      {
        url: "https://tarkovtracker.io/api/v2",
        description: "TarkovTracker API v2 endpoint",
      },
    ],
    tags: [
      {
        name: "Token",
      },
      {
        name: "Progress",
      },
    ],
    security: [
      {
        bearer: [],
      },
    ],
  },
  apis: ["api/v2/api*.js", "api/v2/index.js", "api/v2/components*.js"],
};

const openapiSpecification = swaggerJsdoc(swaggerOptions);
fs.writeFile(
  "../docs/openapi.js",
  "let openapi = " + JSON.stringify(openapiSpecification),
  function (err) {
    if (err) {
      throw err;
    } else {
      console.log("openapi.js created successfully");
    }
  }
);
