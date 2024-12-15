import express from 'express'
import Joi from 'joi'
import db from '../config/database.js'
const router = express.Router()

/**
 * product API create
 */
router.post('/create', async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        const schemaReq = Joi.object({
            product_id: Joi.number().required(),
            item_name: Joi.string().required(),
            total_cost_of_goods_sold: Joi.number().positive().required(),
            total_price_sold : Joi.number().positive().required(),
            quantity: Joi.number().required()
          })
          
        /**
         * secondly , access the validation into the body request
         */
        const {error, value} = schemaReq.validate(req.body)
        if (error){
            res.status(400).json({ status : 'ERROR',message: error.details[0].message })
        } else {
            // request body successfully validated
            // Extract validated data from the request body
            const { product_id,item_name, total_cost_of_goods_sold, total_price_sold, quantity } = value
            
            const result = await db('products')
            .insert({
                product_id,
                item_name,
                total_cost_of_goods_sold,
                total_price_sold,
                quantity
            })
            console.log(result)
            // Check if the insertion was successful
            if (result) {
                res.status(200).json({
                    status : 'SUCCESS',
                    message: `Data successfully inserted.`
                })
            } else {
                res.status(500).json({ status : 'ERROR',message: 'Failed to insert data into the database.' })
            }
        }
        

    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})

/**
 * product API read
 */
router.get('/getData', async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        const schemaReq = Joi.object({
            size: Joi.number().required(),
            page: Joi.number().required()
          })
          
        /**
         * secondly , access the validation into the body request
         */
        // Extract query parameters
    // const { date, size = 10, page = 1 } = req.query;
        const {error, value} = schemaReq.validate(req.query)
        // let {id, nama, email} = req.body
        if (error){
            res.status(400).json({ status : 'ERROR',message: error.details[0].message })
        } else {
            // request body successfully validated
            // Extract validated data from the request body
            const { size, page } = value
           
            const data = db('products')
            .select('*')
            .orderBy('id', 'ASC')
            /**
             * if date are added in the parameter 
             */
            
            data.limit(size).offset((page - 1) * size)
            const products = await data
            
            // Check if the insertion was successful
            if (products) {

                if (products.length === 0){
                    res.status(404).json({ status : 'ERROR', message: 'Records not found.' })
                } else {
                    res.status(200).json({
                        status : 'SUCCESS',
                        message: 'Data successfully fetched',
                        data : products
                    })
                }
                
            } else {
                res.status(500).json({ status : 'ERROR', message: 'Failed to retrieve data.' })
            }
        }
        

    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})


export default router
