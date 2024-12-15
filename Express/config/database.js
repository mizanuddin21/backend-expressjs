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
