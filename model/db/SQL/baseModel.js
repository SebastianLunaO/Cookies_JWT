import bcrypt from 'bcrypt'
import mysql from 'mysql2/promise'


//Pool creation to DataBase

 const passwordSQL = process.env.PASSWORD_MYSQL

 const optionsConnection = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: passwordSQL,
    database: 'jwt'
};

    
export const nombre =  mysql.createPool(optionsConnection)


export class Validation{
    static username(username){
        if(typeof username !== 'string') throw new Error('Username must be a string');
        if(username.length < 3)throw new Error ('username must be  at least 3 characters long');
    }

    static password(password){
        if(typeof password !== 'string') throw new Error('Username must be a string');
        if(password.length < 3)throw new Error ('username must be  at least 3 characters long');
    }

 }
