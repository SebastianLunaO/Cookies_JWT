import * as model from './baseModel.js'
import bcrypt from 'bcrypt'

const nombre = model.nombre
const Validation = model.Validation

async function addToken(user,token) {
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
    try {
        const result = await nombre.query(
            `UPDATE 
            RTokens 
            SET token = ?
            WHERE user_id = ?`,[token,user.id]
        )
        const updated = await getTokenByUser(user)
        return updated
    } catch (error) {
        
    }
}

async function getTokenByToken(user,token) {
    try {
        const result = await nombre.query(
            `SELECT *
            FROM RTokens
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
            FROM RTokens
            WHERE user_id = ?`,user.id
        )    
        return result[0][0]
    } catch (error) {
        
    }
}

export class TokenRepo{
    static async destination(user,token) {
    try {
        const result = await getTokenByUser(user)
        
        if(!(result === undefined)){
            const resultado = await this.updatedToken(user,token)
            return resultado 
        } else{
            const resultado2 = await this.addNewToken(user,token)
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
            const result = await getTokenByUser(user,token)
            return result
        } catch (error) {
            console.log(error)
        }
    }
 }
