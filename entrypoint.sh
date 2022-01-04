#!/bin/bash

yarn
yarn add discord.js dotenv nodemon
yarn install

exec "$@"
