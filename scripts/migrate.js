//require path module
const path = require("path");

//require umzug module
const Umzug = require("umzug");

//creating new umzug
let umzug = new Umzug({

    //sending logs into the console
    //running the migrations function
    //running up and down  migrations
    logging: () => {
        console.log.apply(null, arguments);
    },
    migrations: {
        path: "./database/migrations",
        pattern: /\.js$/
    },
    upName: "up",
    downName: "down"
});

function logUmzugEvent(eventName) {
    return (name, migration) => {
        console.log(`${name} ${eventName}`);
    };
}

// using event listeners to log events
umzug.on("migrating", logUmzugEvent("migrating"));
umzug.on("migrated", logUmzugEvent("migrated"));
umzug.on("reverting", logUmzugEvent("reverting"));
umzug.on("reverted", logUmzugEvent("reverted"));

// this will run your migrations
umzug.up().then(console.log("all migrations done"));