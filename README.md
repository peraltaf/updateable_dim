This [Next.js](https://nextjs.org/) app showcases a custom front end to modify a MySQL (or any other database) table without users having direct access to the database or knowing SQL. The app stores all modification history where users can compare between version and see what's been modified. 

## Installation
Use NPM to install the necessary packages specified in package.json after cloning the codebase.

```bash
npm install
```

### Dependencies
All required packages are listed in package.json. The main dependencies that are not required by NextJS are as follows:

* [MaterialUI](https://mui.com/material-ui/): Open-source React UI components
* [Day.js](https://day.js.org/): Manipulates a JavaScript date object to a target format.
* [deep-object-diff](https://github.com/mattphillips/deep-object-diff): Compares the differences between two JavaScript Objects.
* [Papa Parse](https://www.papaparse.com/): In-browser CSV parser.
* [UUID](https://github.com/uuidjs/uuid): Create an RFC version 4 (random) UUID
* [mysql2](https://github.com/sidorares/node-mysql2): Connect to MySQL.

## Usage
Create an .env file that should look similar to below.

```bash
DB_HOST=<db host uri>
DB_USER=<db user>
DB_PASS=<db password>
DB_SCHEMA=<default db schema>
DB_PORT=<db port>
TARGET_TABLE=<target table name in db>
```

Next run the following command in the terminal to launch the app locally:

```bash
npm run dev
```
