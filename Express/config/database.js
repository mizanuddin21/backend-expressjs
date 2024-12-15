// import pg from 'pg'
// import dotenv from "dotenv"
// dotenv.config()
// import knex from "knex"



// // const knexInstance = knex({
// const knexConfig = knex({
//     client : 'pg',
//     version : '12',
//     connection : {
//         // user: process.env.DB_USER,
//         // password: process.env.DB_PASS,
//         // host: process.env.DB_HOST,
//         // database: process.env.DB_NAME
//         user:'postgres',
//         password: 'darkmage21',
//         host: 'localhost',
//         database: 'postgres',
//     },
//     migrations: {
//         directory: './config/migrations',
//         tableName: 'knex_migrations'
//     },
//     debug: true // Enable debugging
// })



// // Create the Knex instance for use in your API
// // const knexInstance = knexConfig

// // export default knexInstance
// // export default { knexConfig, knexInstance }

// export default knexConfig


import dotenv from 'dotenv'
import knex from 'knex'

dotenv.config()

const knexConfigX = {
    client: 'pg',
    version: '12',
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: 5432, // Default PostgreSQL port
    },
    debug: false, // Enable debugging
}
const knexConfig = knex(knexConfigX)
export default knexConfig
