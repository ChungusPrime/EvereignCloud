import Database from './db';
import express, { Request, Response } from "express";
import http from "http";
import crypto from 'crypto';
import cors from "cors";
import bcrypt from 'bcrypt';
import axios from 'axios';
import Log from './logger';

const ListenPort: string = process.env.PORT as string;
const DatabaseName: string = process.env.DATABASE as string;
const ServerName: string = process.env.SERVER as string;
const DbHost: string = process.env.DB_HOST as string;
const DbPass: string = process.env.DB_PASS as string;
const DbUser: string = process.env.DB_USER as string;
const Environment: string = process.env.ENVIRONMENT as string;

const app = express().options("*", cors()).use([
	express.urlencoded({
		extended: true
	}),
	express.json(),
	express.static(__dirname)
]);

const Server: http.Server = http.createServer(app);
const DB: Database = new Database(DatabaseName, DbHost, DbPass, DbUser);

(async () => {

	await Log(`Starting Cloud Server - Environment: ${Environment}`);
	await DB.Connect();

	Server.listen({
		port: ListenPort,
		host: "0.0.0.0"
	}, () => {
		Log(`${ServerName} finished start up and is running on port: ${ListenPort}`);
	});

})();

app.get('/status', async (request: Request, response: Response) => {
	response.header("Access-Control-Allow-Origin", "*");
	response.json({
		success: true
	});
});

app.post('/register', async (request: Request, response: Response) => {

	try {

		response.header("Access-Control-Allow-Origin", "*");
		Log(`Account creation request from ${request.socket.remoteAddress}`);

		const Username: string = request.body.username;
		if (Username == "" || Username.length < 6)
			throw Error(`Username error: Value: "${Username}", Length: ${Username.length}`);

		const [UsernameCheck] = await DB.Query("SELECT username FROM accounts WHERE username = ? LIMIT 1", [Username]);

		if (UsernameCheck.length > 0)
			throw Error("Username error: This username is not available");

		const Password: string = request.body.password;
		if (Password == "" || Password.length < 6)
			throw Error(`Password error Length: ${Password.length}`);

		const EmailAddress: string = request.body.email;
		if ( EmailAddress == "" || EmailAddress.length < 6 )
		  throw Error(`Email error: Value: "${EmailAddress}" Length: ${EmailAddress.length}`);

		const [EmailCheck] = await DB.Query("SELECT email FROM accounts WHERE email = ? LIMIT 1", [EmailAddress]);
		if ( EmailCheck.length != 0 )
		  throw Error(`Email error: This email is not available`);

		const EncryptedPassword: string = await bcrypt.hash(Password, 10);
		const SQL: string = 'INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
		const ID: string = crypto.randomUUID({ disableEntropyCache: true });
		const Params = [ID, Username, EmailAddress, EncryptedPassword, null, 0, new Date(), null, null];
		const [Result] = await DB.Query(SQL, Params);

		if (Result.affectedRows == 1) {
			Log(`New Account creation successful - ID: ${ID}`);
			return response.json({
				success: true,
				message: "Account created succesfully"
			});
		}

		throw Error("Failed to create new account");

	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		Log(`New Account error: ${errorMessage}`);
		return response.json({ success: false, message: errorMessage });
	}

});

app.post('/login', async (request: Request, response: Response) => {

	response.header("Access-Control-Allow-Origin", "*");

	try {

		Log(`Login request from ${request.socket.remoteAddress}`);

		const Username: string = request.body.username;
		if (Username == "" || Username.length < 6)
			throw Error(`Username error: Value: "${Username}", Length: ${Username.length}`);

		const Password: string = request.body.password;
		if (Password == "" || Password.length < 6)
			throw Error(`Password error Length: ${Password.length}`);

		const [User] = await DB.Query("SELECT id, username, password, banned FROM accounts WHERE username = ? LIMIT 1", [Username]);
		if (User.length == 0)
			throw Error(`Username not found`);

		if (User.length == 1 && User[0].banned == 1)
			throw Error(`This account has been banned`);

		if (!await bcrypt.compare(Password, User[0].password))
			throw Error(`invalid password entered: username: ${Username}`);

		Log(`Successful login: ${Username}`);

		return response.json({
			success: true,
			userid: User[0].id
		});

	} catch (error: any) {
		Log(`Login error: ${error}`);
		return response.json({ success: false, message: error });
	}
});