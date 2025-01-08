 import DBLocal from 'db-local'
 const {Schema} = new DBLocal({path: './db'})
 import bcrypt from 'bcrypt'
 import mysql2 from 'mysql2/promise'

 const passwordSQL = process.env.PASSWORD_MYSQL

 const optionsConnection = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: passwordSQL,
    database: 'passport_test'
};

const pool  = mysql2.createPool(optionsConnection).promise() 

 export class UserRepository{
    static async create ({username, password}) {
        Validation.username(username)
        Validation.password(password)
        
        const user = User.findOne({username});
        if (user) throw new Error ('username already exist');
        
        const id = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(password,10);

        User.create({
            _id: id,
            username,
            password: hashedPassword
        }).save()
        return id
    }
    static async login ({username,password}){
        Validation.username(username)
        Validation.password(password)
        
        const user = User.findOne({username});
        if (!user) throw new Error ('username does not exist');

        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid) throw new Error('username or password invalid')

            const {password: _, ...publicUser} = user

        return publicUser
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

