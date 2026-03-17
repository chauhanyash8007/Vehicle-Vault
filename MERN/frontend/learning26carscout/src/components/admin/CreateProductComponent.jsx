import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export const CreateProductComponent = () => {
    const{register,handleSubmit}=useForm()
    const [categories, setcategories] = useState([])

    const submitHandler = async(data)=>{
        console.log(data)// --api
        try{
            const res = await axios.post("/product/product",data)
            if(res.status==201){
                toast.success("product added..")
                //navigate..
            }
        // eslint-disable-next-line no-unused-vars
        }catch(err){
            toast.error("error while create product")
        }
    }
    
    //fetch all categories...
    const fetchAllCategories = async()=>{
        const res = await axios.get("/category/categories")
        console.log(res.data.data)
        setcategories(res.data.data)
    }
    useEffect(()=>{
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAllCategories()
        //fetchAllSubCatgory
    },[])


  return (
    <div>
        <form onSubmit={handleSubmit(submitHandler)}>
            <div>
                <label>NAME:</label>
                <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" type='text' {...register("name")}></input>
            </div>
            <div>
                <label>PRICE</label>
                <input className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" type='text' {...register("price")}></input>
            </div>
            <div>
                <label>CATEGORIES</label>
                <select className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400' {...register("categoryId")}>
                    
                    {
                        categories.map((cat)=>{
                            return <option value={cat._id}>{cat.name}</option>
                        })
                    }
                </select>
            </div>
            <div>
                <input type='submit' value="CREATE PRODUCT" className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"></input>
            </div>
        </form>
    </div>
  )
}