const productSchema = require("../models/ProductModel");

//api
const getAllProducts = async (req, res) => {
  //db query
  const allProducts = await productSchema.find();
  res.json({
    message: "all products",
    data: allProducts,
  });
};

const getProductById = async (req, res) => {
  //req.params.id
  //const foundProduct = await productSchema.find({_id:req.params.id}) //[]
  const foundProduct = await productSchema.findById(req.params.id); //{}
  if (foundProduct) {
    res.json({
      message: "product found",
      data: foundProduct,
    });
  } else {
    res.json({
      message: "product not found",
    });
  }
};

// const addProduct = async (req, res) => {
//   //console.log("body...",req.body)
//   const savedProduct = await productSchema.create(req.body);
//   res.status(201).json({
//     message: "product saved",
//     data: savedProduct,
//   });
// };

const addProduct = async (req, res) => {
  try {
    const savedProduct = await productSchema.create(req.body);
    res.status(201).json({
      message: "product saved",
      data: savedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while creating product",
      err: err,
    });
  }
};

const deleteProduct = async (req, res) => {
  //delete from products where id = ?
  //db.products.removeOne({_id:?})
  //productSchema.removeOne({_id:req.params.id})
  //productSchema.findByIdAndDelete(req.params.id)

  const deletedProductObj = await productSchema.findByIdAndDelete(
    req.params.id,
  );
  if (deletedProductObj) {
    res.status(200).json({
      message: "product deleted",
      data: deletedProductObj,
    });
  } else {
    res.status(200).json({
      message: "product not found to delete",
    });
  }
};

const updateProduct = async (req, res) => {
  //update products ,,, where id =?
  //db.products.updateOne({$set:{,,,},{_id:?}})
  //new data to update : req.body
  //where ?? id : req.params

  //const updatedObj = await productSchema.findByIdAndUpdate(req.params.id,req.body)
  const updatedObj = await productSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.status(200).json({
    message: "data updated..",
    data: updatedObj,
  });
};

const searchProduct = async (req, res) => {
  try {

    const name = req.query.name

    const products = await productSchema.find({
      productName: { $regex: name, $options: "i" }
    })

    res.json({
      message: "search results",
      data: products
    })

  } catch (err) {
    res.status(500).json({
      message: "error while searching",
      error: err
    })
  }
};

const addColor = async (req, res) => {
  try {
    const updatedProduct = await productSchema.findByIdAndUpdate(
      req.params.id,
      { $push: { productColors: req.body.productColors } }, 
      { new: true }
    );

    res.json({
      message: "color added",
      data: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "error adding color",
      error: err,
    });
  }
};


// Remove Color
const removeColor = async (req, res) => {
  try {
    const updatedProduct = await productSchema.findByIdAndUpdate(
      req.params.id,
      { $pull: { productColors: req.body.color } },
      { new: true }
    );

    res.json({
      message: "color removed",
      data: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "error removing color",
      error: err,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  searchProduct,
  deleteProduct,
  addColor,
  removeColor
};
