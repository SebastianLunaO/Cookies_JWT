import * as model from './baseModel.js'
import bcrypt from 'bcrypt'


const nombre = model.nombre
const Validation = model.Validation

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
            console.log(error)
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
