const jwt = require('jsonwebtoken');
const User = require('../models/user');

const admin = async (err , req , res , next) => {

    try {
         //
         const token = req.header('x-auth-token');
         if(!token){
             return res.status(401).json({msg : "No auth Token Access Denied"});
         }
 
         //
         const verified = jwt.verify(token, 'passwordKey');
         if(!verified){
             return res
             .status(401)
             .json({msg : "Token Verification Filed Authorization Denied"});
         }
 
         //imp step
         const user = await User.findById(verified.id);
         if(user.type == 'user' || user.type == 'seller'){
            return res
            .status(401)
            .json({msg : "You are not Admin!"});
         }
         req.user = verified.id;
         req.token = token;
         next();
    } catch (error) {
        res.status(500).json({error : error.msg});
    }
};

module.exports = admin;