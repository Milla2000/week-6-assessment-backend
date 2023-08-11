const mssql = require('mssql');
const {v4} = require('uuid');
const { createUsersTable } = require('../Database/Tables/createTables');
const { sqlConfig } = require('../config/config');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { loginSchema, registerSchema } = require('../validators/validators');
dotenv.config()



const registerUsers = async (req,res) =>{
    try {
        // console.log("why now");
        createUsersTable()

        const id = v4();
        // console.log("why now");
        
        const {full_name,email,password, cohort} = req.body

          if (!full_name || !email || !password ||!cohort) {
            return res.status(400).json({
              error: "Please input all values",
            });
          }

        const {error} = registerSchema.validate(req.body)
        if(error){
            return res.status(422).json(error.details)
        }

        // console.log(full_name);

        const hashedPwd = await bcrypt.hash(password, 5);

        const pool = await mssql.connect(sqlConfig);

        
        
        const result = await pool
          .request()
          .input("id", id)
          .input("full_name", mssql.VarChar, full_name)
          .input("email", mssql.VarChar, email)
          .input("password", mssql.VarChar, hashedPwd)
          .input("cohort", mssql.VarChar, cohort)
          .execute("registerUsersProc");

        // console.log(result);

        if(result.rowsAffected[0] == 1){
            // console.log(result.rowsAffected);
            return res.status(200).json({ message: "User registered successfully"})
        }else{
            return res.status(200).json({ message: "Registration failed"})
        }




    } catch (error) {
        return res.json({Error:error.message})
    }
}






module.exports = {
    registerUsers,
    // userLogin,
    
}