"use strict";

const Hapi = require("@hapi/hapi");
const path = require("path");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
      files: {
        relativeTo: path.join(__dirname, "static")
      }
    }
  });

  await server.register([
    {
      plugin: require("hapi-geo-locate"),
      options: {
        enableByDefault: true
      }
    },
    {
      plugin: require("@hapi/inert")
    },
    {
      plugin: require("@hapi/vision")
    }
  ]);

  server.views({
    engines: {
      hbs: require("handlebars")
    },
    path: path.join(__dirname, "views"),
    layout: "default"
  });

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return h.file("welcome.html");
      }
    },
    {
      method: "GET",
      path: "/dynamic",
      handler: (request, h) => {
        const data = {
          name: "Ricardo"
        };
        return h.view("index", data);
      }
    },
    {
      method: "POST",
      path: "/login",
      handler: (request, h) => {
        return h.view("index", { username: request.payload.username });
      }
    },
    {
      method: "GET",
      path: "/download",
      handler: (request, h) => {
        return h.file("welcome.html", {
          mode: "attachment",
          filename: "welcome-download.html"
        });
      }
    },
    {
      method: "GET",
      path: "/location",
      handler: (request, h) => {
        if (request.location) {
          return h.view("location", { location: request.location.ip });
        } else {
          return h.view("location", {
            location: "Your location is not enabled"
          });
        }
      }
    },
    {
      method: "GET",
      path: "/users",
      handler: (request, h) => {
        return "<h1>Your user is already logged in</h1>";
      }
    },
    {
      method: "GET",
      path: "/{any*}",
      handler: (request, h) => {
        return "<h1>Oh no!,you must be lost!</h1>";
      }
    }
  ]);

  await server.start();
  console.log("Server running on port %s", server.info.port);
};

process.on("uncaughtException", err => {
  console.log(err);
  process.exit(1);
});

init();
