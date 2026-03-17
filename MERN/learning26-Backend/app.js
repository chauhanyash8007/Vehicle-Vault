// //#express require
// const express = require("express"); //express module
// //create an object of express
// const app = express();
// app.use(express.json()) //global middleware --> it will accept json data..


// const dbConnection = require("./src/utils/DBConnection")
// dbConnection() //calling function...

// // //API CREATION...

// // //http://localhost:3000/test
// // app.get("/test", (req, res) => {
// //   console.log("test api called....");
// //   res.send("Test Api Called...");
// // });

// // const user = {
// //   id: 101,
// //   name: "amit",
// //   age: 23,
// //   salary: 23000,
// // };
// // //http:localhost:3000/user
// // app.get("/user", (req, res) => {
// //   //res.json(user)
// //   res.json({
// //     message: "user fetched successfully!!",
// //     data: user,
// //   });
// // });

// // //dummy users array
// // const users = [
// //   { id: 1, name: "raj", age: 23 },
// //   { id: 2, name: "parth", age: 24 },
// //   { id: 3, name: "jay", age: 25 },
// // ];

// // //http:localhost:3000/users
// // app.get("/users", (req, res) => {
// //   res.json({
// //     message: "all users",
// //     data: users,
// //   });
// // });

// // //url -->data
// // //http:localhost:3000/user/1234
// // app.get("/user/:id", (req, res) => {
// //   const users = [
// //     { id: 1, name: "Alice" },
// //     { id: 2, name: "Bob" },
// //     { id: 3, name: "Charlie" },
// //   ];
// //   //:id -->wild char --.
// //   //req.params -->id
// //   //req.params -->{} --> {id:..}
// //   console.log(req.params);
// //   console.log(req.params.id);

// //   const userId = parseInt(req.params.id);

// //   //task --> id -->find that id record from dummy array
// //   //if record found send as response ..
// //   //if user not found from id / it is not available send response message user not found with id
// //   //HINT : find function
// //   //Note: dont forget to send response from both if and else

// //   const foundUser = users.find((user) => user.id === userId);

// //   if (foundUser) {
// //     res.json({
// //       message: "user fetched...",
// //       user: foundUser,
// //     });
// //   } else {
// //     res.status(404).json({
// //       message: `user not found with id ${userId}`,
// //     });
// //   }
// // });

// const userRoutes = require("./src/routes/UserRoutes");
// //http://localhost:3000/urls
// //app.use(userRoutes)
// //http://localhost:3000/user/urls
// app.use("/user",userRoutes)

// const employeeRoutes = require("./src/routes/EmployeeRoutes");
// app.use("/emp", employeeRoutes);

// const productRoutes = require("./src/routes/ProductRoutes")
// app.use("/prod",productRoutes)

// const bookRoutes = require("./src/routes/bookRoutes")
// app.use("/book", bookRoutes)

// const cityRoutes = require("./src/routes/cityRoutes")
// app.use("/city", cityRoutes)

// const stateRoutes = require("./src/routes/stateRoutes")
// app.use("/state", stateRoutes)

// const categoryRoutes = require("./src/routes/categoryRoutes")
// app.use("/category", categoryRoutes)

// //server creation...
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`server started on PORT ${PORT}`);
// });

const express = require("express")
const app = express()
const cors = require("cors")
//load env file.. using process
require("dotenv").config()
app.use(express.json())
app.use(cors()) //allow all requests

const DBConnection = require("./src/utils/DBConnection")
DBConnection()

const UsersRoutes = require("./src/routes/UsersRoutes")
app.use("/user",UsersRoutes)

const CategorysRoutes = require("./src/routes/CategorysRoutes")
app.use("/category",CategorysRoutes)

const ProductsRoutes = require("./src/routes/ProductsRoutes")
app.use("/product",ProductsRoutes)



const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`)
})
//server creation