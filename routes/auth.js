const express = require("express");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth =require("../middlewares/auth");

//SIGN UP ROUTE
authRouter.post('/api/signup', async (req , res) => {

    try {

        //get tha data
        const {name , email , password} = req.body; 
   
     const exsistingUser = await User.findOne({email}); 
     if(exsistingUser){
        return res.status(400),json({msg:"User with same email already exsist!"});
     }

    
    //secure the passord 
    const hashPassword = await bcryptjs.hash(password , 8 ); 


    //save data to DataBase
    let user = new  User({
        email,
        password : hashPassword,
        name,
     })


    //return that data to the user 
     user = await user.save();
     res.json({user});

    } catch (error) {
        res
        .status(500)
        .json({ error : error.message});
    }
     
    
});


//SIGN IN ROUTE
authRouter.post('/api/signin' , async (req ,res) => {

    try{
    
    //get the data
     const { email , password } = req.body;

     const user = await User.findOne({email});
     if(!user){
        return res
        .status(404)
        .json({msg : "User Does not exsist"});
     }
    
    //check the data
    const isMatch = await bcryptjs.compare(password , user.password);
    
    //authorise signin if match
     if(!isMatch){
        return res.status(400).json({msg : "Incorrect Passowrd"});
     }

   const token = jwt.sign({id: user._id}, "passwordKey") ;
   res.json({token , ...user._doc})//object destructuring



    }catch(error){
        res.status(500).json({ error : error.message});
    }
});



//TO CHECK FOR TOKEN 
authRouter.post('/tokenIsValid' , async (req ,res) => {

    try{

    //to check if token exsist ie using appp for 1st time    
    const token = req.header('x-auth-token');
    if(!token){
        return res.json(flase);
    }
    
    //checking if token is correct
    const verified = jwt.verify(token, 'passwordKey');
    if(!verified){
        return res.json(flase);
    }

    //to check if user exsist by that token
    const user = await User.findById(verified.id);
    if(!user){
        return res.json(flase);
    }


    //all conditions are true
    res.json(true);

    

    }catch(error){
        res.status(500).json({ error : error.message});
    }
});


//GET USER DATA
authRouter.get("/" , auth , async (req , res) =>{
    const user = await User.findById(req.user);
    res.json({...user._doc, token: req.token});
} )


module.exports = authRouter;