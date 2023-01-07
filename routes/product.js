const express = require ('express');
const {Product} = require('../models/product');
const productRouter = express.Router();
const auth = require('../middlewares/auth');


//GET PRODUCTS BY CATEGORY
// /api/products?category=Essentials
productRouter.get("/api/products" , auth , async (req , res) => {
    try {

        //get category from query
        //console.log(req.query.category);

        //get products from database
        const products = await Product.find({category: req.query.category});

        //send products to display
        res.json(products);


    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


//GET PRODUCTS BY SEARCH
productRouter.get("/api/products/search/:name" , auth , async (req , res) =>{

    try {
        
        //get products from database
        const products = await Product.find({
            name: { $regex: req.params.name , $options: "i"},
        });

        //send products to be displayed
        res.json(products);

    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


//RATE PRODUCTS
productRouter.post("/api/rate-product" , auth , async (req , res) => {

    try {
        
        const{ id , rating} = req.body;

        //getproduct from DB
        let product = await Product.findById(id);

        //check if user has already rated and if then delete
        for (let i = 0; i < product.ratings.length; i++) {
            if(product.ratings[i].userId == req.user){
                product.ratings.splice(i,1);
                break;
            }
        }

        //create new rating schema
        const ratingSchema = {
            userId: req.user,
            rating,

        };

        //update new rating to DB and save it
        product.ratings.push(ratingSchema);
        product = await product.save();

        //display rating to user
        res.json(product);

    } catch (error) {
        res.status(500).json({error:error.message});
    }
  
});


//RETRIVE DEAL OF THE DAY  USING RATINGS
productRouter.get("/api/deal-of-day" , auth , async (req , res)=>{


    try {
                
        //get products
        let products = await Product.find({});

        //sort products based on ratings
       products =  products.sort((a,b) => {
            let aSum =0;
            let bSum =0;

            for (let index = 0; index < a.ratings.length; index++) {
                aSum+=a.ratings[index].rating;                
            }
            for (let index = 0; index < b.ratings.length; index++) {
                bSum+=b.ratings[index].rating;                
            }

            //return one with high rating
            return aSum < bSum ?  1 : -1;
        });

        //send deal of the day
        res.json(products[0]);

    } catch (error) {
        res.status(500).json({error : error.message});
    }
});




module.exports = productRouter;