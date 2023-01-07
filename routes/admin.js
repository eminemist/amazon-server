const { response } = require('express');
const express = require ('express');
const adminRouter = express.Router();
const admin = require('../middlewares/admin');
const  {Product}  = require('../models/product');
const Order = require('../models/order');


//ADD PRODUCTS
adminRouter.post("/admin/add-product" , admin , async (req , res) => {

    try {
        const {name ,description , images , quantity , price , category} = req.body;
        let product = new Product({
            name,
            description,
            images,
            quantity,
            price,
            category,
        });

        //save to mongoDB 
    product = await product.save();
    res.json(product);    

    } catch (e) {
      res.status(500).json({error : e.message});
    }
});

//GET ALL PRODUCTS
adminRouter.get("/admin/get-products" , admin , async (req , res) => {

try {
    
    //Get all Products data from mongoDB
    const products = await Product.find({});
    
    // Return to client(admin)
    res.json(products);

   
} catch (error) {
    req.status(500).json({error : error.message});
}

});


//DELETE A PRODUCT
adminRouter.post("/admin/delete-product" , admin , async (req , res ) => {

    try {

        const {id} = req.body;


        //seacrch in database and delete
        let product = await Product.findByIdAndDelete(id);

       
        // Return to client(admin)
        res.json(product);
        
    } catch (error) {
        req.status(500).json({error : error.message});
    }


});

//GET ALL ORDERS
adminRouter.get ("/admin/get-orders" , admin , async (req , res ) => {

    try {
        
        let orders = await Order.find({});

        res.json(orders);

    } catch (error) {
        res.status(500).json({error : error.message});
    }

});

//CHANGE ORDER STATUS
adminRouter.post ("/admin/change-order-status"  , admin , async (req, res) =>{

try {

    const {id , status} = req.body;

    let order = await Order.findById(id); 

    order.status = status;

    order = await order.save();

    res.json(order);
} catch (error) {
    res.status(500).json({error : error.message});
}

});

adminRouter.get("/admin/analytics" , admin , async (req , res) => {
    try {
        const orders = await Order.find({});

        let totalEarnings = 0;

        for (let i = 0; i < orders.length; i++) {
           for (let j = 0; j < orders[i].products.length; j++) {
                totalEarnings+=
                orders[i].products[j].quantity*orders[i].products[j].product.price;
            }  
        }

    //CATEGORY WISE ORDER FETCHING
  let mobileEarnings = await fetchCategoryWiseProduct('Mobiles'); 
  let essentialEarnings = await fetchCategoryWiseProduct('Essentials');      
  let applianceEarnings = await fetchCategoryWiseProduct('Appliances');   
  let booksEarnings = await fetchCategoryWiseProduct('Books');   
  let fashionEarnings = await fetchCategoryWiseProduct('Fashion');   

  let earnings = {
    totalEarnings,
    mobileEarnings,
    essentialEarnings,
    applianceEarnings,
    booksEarnings,
    fashionEarnings,
  };

  res.json(earnings);

    } catch (error) {
        res.status(500).json({error : error.message});
    }
});

async function fetchCategoryWiseProduct(category) {
    let earnings =0;
    let categoryOrders = await Order.find({
    'products.product.category' :category,
    });

    for (let i = 0; i < categoryOrders.length; i++) {
        for (let j = 0; j < categoryOrders[i].products.length; j++) {
            earnings+=
            categoryOrders[i].products[j].quantity*categoryOrders[i].products[j].product.price;
        }  
    }
    return earnings;
}



module.exports = adminRouter;