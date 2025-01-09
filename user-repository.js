 import DBLocal from 'db-local'
 const {Schema} = new DBLocal({path: './db'})
 import bcrypt from 'bcrypt'
 import mysql from 'mysql2/promise'

 const passwordSQL = process.env.PASSWORD_MYSQL

 const optionsConnection = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'Mausebas22',
    database: 'jwt'
};

    
const nombre =  mysql.createPool(optionsConnection)

async function createUser(username,password) {
    try {
        const [result] = await nombre.query(
            `INSERT INTO
            users(username,password) 
            VALUES (?,?)`, [username,password] 
        );
        const id = result.insertId
        return id
    } catch (error) {
        console.log(error)
    }

}

async function findByUser(username) {
    try {
        const result = await nombre.query(
            `SELECT * FROM
            users
            WHERE username = ?`, username
        );
        const rows = result[0]
        return rows[0]
    } catch (error) {
        throw new Error(error)
    }    
}

async function addToken(user,token) {
    console.log(`user: ${user.id} and token: ${token}`)
    try {
        const [result] = await nombre.query(
            `INSERT 
            INTO RTokens(token,user_id)
            VALUES(?,?)`,[token,user.id]
        )
        return result.insertId
    } catch (error) {
        console.log(error)
    }
}

async function updateToken(user,token) {
    console.log(``)
    try {
        const result = await nombre.query(
            `UPDATE 
            RToken 
            SET token = ?
            WHERE user_id = ?`,[token,user.id]
        )
        return result
    } catch (error) {
        
    }
}

async function getTokenByToken(user,token) {
    try {
        const result = await nombre.query(
            `SELECT *
            FROM RToken
            WHERE token = ?`,token
        )
        return result[0][0]
    } catch (error) {
        
    }
}

async function getTokenByUser(user) {
    try {
        const result = await nombre.query(
            `SELECT *
            FROM RToken
            WHERE user_id = ?`,user.id
        )
        return result
    } catch (error) {
        
    }
}

 export class UserRepository{
    static async create ({username, password}) {
        Validation.username(username)
        Validation.password(password)
        
        const user = await findByUser(username)
        try {
            if(!(user === undefined)){
                throw new Error ('username already taken')
            } else{
                const hashedPassword = await bcrypt.hash(password,10);
                const resultId= await createUser(username,hashedPassword)
                return resultId
            }
        } catch (error) {
            console.error(error)
        }
    }

    static async login ({username,password}){
        Validation.username(username)
        Validation.password(password)
        try {
            const user = await findByUser(username)
        if ((user.length === 0)) throw new Error ('username does not exist');
        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid) throw new Error('username or password invalid')

        const {password: _, ...publicUser} = user

        return publicUser
        } catch (error) {
            console.error(`Failing validating user ${error}`)
        }
        
    }
 }

 class Validation{
    static username(username){
        if(typeof username !== 'string') throw new Error('Username must be a string');
        if(username.length < 3)throw new Error ('username must be  at least 3 characters long');
    }

    static password(password){
        if(typeof password !== 'string') throw new Error('Username must be a string');
        if(password.length < 3)throw new Error ('username must be  at least 3 characters long');
    }

 }

 export class TokenRepo{
    static async destination(user,token) {
    try {
        const result = await getTokenByUser(user)
        
        if(!(result === undefined)){
            const resultado = await this.updatedTokenNewToken(user,token)
            console.log(`updated`)
            return resultado 
        } else{
            const resultado2 = await this.addNewToken(user,token)
            console.log(`created`)
            return resultado2
        }
    } catch (error) {
        console.log(error)
    }
   }

    static async addNewToken(user,token){
        try {
            const result = await addToken(user,token)
            return result
        } catch (error) {
            console.log(error)
        }
    }

    static async updatedToken(user,token){
        try {
            const result = await updateToken(user,token)
            return result
        } catch (error) {
            console.log(error)
        }
    }

    static async getToken(user,token){
        try {
            const result = await getTokenByToken(user,token)
            console.log(`inside get token ${result}`)
            return result
        } catch (error) {
            console.log(error)
        }
    }
 }

