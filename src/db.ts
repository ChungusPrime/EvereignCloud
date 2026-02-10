import mysql from "mysql2/promise";
import Log from "./logger";
import Migrations from "./migrations";
import { response } from "express";

export default class Database {

    public connection: mysql.Connection | undefined;

    public credentials: mysql.ConnectionOptions = {};

    public tables: string[] = [];

    constructor(db: string, host: string, pass: string, user: string) {
        this.credentials = {
            host: host,
            user: user,
            password: pass,
            database: db,
            namedPlaceholders: true
        }
    }

    async Connect() {
        try {
            this.connection = await mysql.createConnection(this.credentials);

            // Create schema if it doesnt exist
            /*await this.connection.query(`CREATE DATABASE IF NOT EXISTS ${this.credentials.database}`);
            await this.connection.query(`USE ${this.credentials.database}`);
      
            // Get Current Tables
            const [Rows, Fields] = await this.connection.query(`SHOW TABLES;`) as any;
            this.tables = Rows.map(row => row[`Tables_in_${this.credentials.database}`]);
      
            // Create missing tables
            Migrations.forEach( async ( migration ) => {
              if ( !this.tables.includes(migration.table) ) {
                await this.connection.query(migration.statement);
                Log(`Missing table: ${migration.table} created`);
              }
            });*/

            Log("Database online");

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            Log(`Error: ${message}`);
            console.error('Error:', message);
        }
    }

    async Query(statement: string, params: any): Promise<any> {
        try {
            if (!this.connection) {
                throw new Error("Database connection is not established");
            }
            const Result = await this.connection.query(statement, params);
            Log(`Executing Query: ${statement} - Success`);
            return Result;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            Log(`Query Error: ${message}`);
            console.error('Query Error:', message);
        }
    }

}
