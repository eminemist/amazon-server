const express = require ('express');
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const Order = require('../models/order');
const { Product } = require('../models/product');
const User = require('../models/user');


//ADD TO CART
userRouter.post("/api/add-to-cart" , auth , async (req , res) => {

    try {
        
        //request id from function
        const {id} = req.body;

        //find product in DB
        const product  = await Product.findById(id);

        //find correct user
        let user = await User.findById(req.user);

        //check user cart length
        if(user.cart.length == 0){
            user.cart.push({product , quantity:1});
        }else{
            let isProductFound = false;
            for (let index = 0; index < user.cart.length; index++) {
                //because we are comparing mongoDB given id which is object we use equals
                if(user.cart[index].product._id.equals(product._id)){
                    isProductFound= true;
                }
            }

            if (isProductFound) {
                let producttt = user.cart.find((productt) =>
                 productt.product._id.equals(product._id)
                 );
                producttt.quantity+=1;
            }else{
                user.cart.push({product, quantity: 1});
            }
        }
        
    user = await user.save();

    res.json(user);
        
    } catch (e) {
      res.status(500).json({error : e.message});
    }
});


//DELETE FROM CART
userRouter.delete("/api/remove-from-cart/:id" , auth , async (req , res) => {

    try {
        
        //request id from function
        const {id} = req.params;

        //find product in DB
        const product  = await Product.findById(id);

        //find correct user
        let user = await User.findById(req.user);

        
            for (let index = 0; index < user.cart.length; index++) {
                //because we are comparing mongoDB given id which is object we use equals
                if(user.cart[index].product._id.equals(product._id)){
                    if (user.cart[index].quantity == 1) {
                        user.cart.splice(index,1);
                    }else{
                        user.cart[index].quantity -= 1;
                    }
                    
                }
            }

            
       
        
    user = await user.save();

    res.json(user);
        
    } catch (e) {
      res.status(500).json({error : e.message});
    }
});


//SAVE USER ADDRESS
userRouter.post("/api/save-user-address" , auth , async (req , res) => {

    try {
        
        //request address from function
        const {address} = req.body;

        //find correct user
        let user = await User.findById(req.user);

        //save the address to DB
        user.address = address;
        
    user = await user.save();        
    
    res.json(user);
        
    } catch (e) {
      res.status(500).json({error : e.message});
    }
});


//ORDER PRODUCT
userRouter.post("/api/order" , auth , async (req , res) => {

    try {
        
        
        const {cart,totalPrice ,address} = req.body;
        let products =[];

        for (let i = 0; i < cart.length; i++) {
            let product = await Product.findById(cart[i].product._id);
            if (product.quantity >= cart[i].quantity) {
                product.quantity -= cart[i].quantity;
                products.push({product , quantity: cart[i].quantity});
                await product.save();
            }else{
                return res.status(400).json({msg : `${product.name} is out of stock!`});
            }
        }
        
    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();

    let order = new Order({
        products,
        totalPrice,
        address,
        userId: req.user,
        orderedAt: new Date().getTime(),
    });
       
        
    order = await order.save();       
    
    res.json(order);
        
    } catch (e) {
      res.status(500).json({error : e.message});
    }
});



//GET PREVIOUS ORDERS
userRouter.get("/api/orders/me" , auth , async (req , res ) => {
    try {
       
        

        const orders = await Order.find({userId: req.user });

        res.json(orders);

    } catch (error) {
        res.status(500).json({error : error.message});
    }


});


module.exports = userRouter;