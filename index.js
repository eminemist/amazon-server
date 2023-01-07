//IMPORT FORM PACKAGES
const express = require('express');
const mongoose = require('mongoose');
const adminRouter = require('./routes/admin');


//IMPORT FORM OTHER FILES
const authRouter = require("./routes/auth"); 
const productRouter = require('./routes/product');
const userRouter = require('./routes/user');

//INIT(Initialization)
const PORT = 3000;
const app = express();
const DB ="mongodb+srv://kunal:kunal123@cluster0.iwojesb.mongodb.net/?retryWrites=true&w=majority";



//middleWare
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);


//CONNECTIONS
mongoose
.connect(DB)
.then(() => {
    console.log('Connection Succesful!!!!!');
})
.catch((error) => {
    console.log(error);
});


app.listen(PORT , "0.0.0.0" , () => {
    console.log(`Connected at port  ${PORT} hello `);
});
