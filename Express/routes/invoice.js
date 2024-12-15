import express from 'express'
import Joi from 'joi'
import db from '../config/database.js'
import XLSX from 'xlsx'
import multerUpload from '../services/uploadFile.js'
import convertExcelDate from '../services/formatDate.js'

const router = express.Router()

/**
 * invoice API create
 */
router.post('/create', async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        const schemaReq = Joi.object({
            invoice_no: Joi.string().min(1).required(),
            date: Joi.date().required(),
            customer_name: Joi.string().min(2).required(),
            salesperson_name : Joi.string().min(2).required(),
            payment_type: Joi.string().valid('CASH','CREDIT'),
            notes: Joi.string().min(5)
          })
          
        /**
         * secondly , access the validation into the body request
         */
        const {error, value} = schemaReq.validate(req.body)
        // let {id, nama, email} = req.body
        if (error){
            res.status(400).json({ 
                status : 'ERROR',
                message : error.details[0].message 
            })
        } else {
            // request body successfully validated
            // Extract validated data from the request body
            const { invoice_no, date, customer_name, salesperson_name, payment_type, notes, product_id } = value
            
            const result = await db('invoice')
            .insert({
                invoice_no,
                date,
                customer_name,
                salesperson_name,
                payment_type,
                notes
            })
            // Check if the insertion was successful
            if (result) {
                res.status(200).json({
                    status : 'SUCCESS',
                    message : `Data successfully inserted for invoice: ${invoice_no}`
                })
            } else {
                res.status(500).json({ 
                    status : 'ERROR',
                    message : 'Failed to insert data into the database.'
                })
            }
        }
        

    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})

/**
 * invoice API read
 */
router.get('/getData', async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        const schemaReq = Joi.object({
            date: Joi.date(),
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
            res.status(400).json({ 
                status : 'ERROR',
                message: error.details[0].message 
            })
        } else {
            // request body successfully validated
            // Extract validated data from the request body
            const { date, size, page } = value
           
            const data = db('invoice')
            .select('invoice.*', 
                'products.product_id', 
                'products.item_name', 
                'products.quantity',
                'products.total_price_sold',
                'products.total_cost_of_goods_sold',
                db.raw('products.total_price_sold - products.total_cost_of_goods_sold AS profit'),
            )
            .leftJoin('products', 'products.invoice_no', '=', 'invoice.invoice_no')
            /**
             * if date are added in the parameter 
             */
            if (date) {
                data.where('date',date)
            }
            data.limit(size).offset((page - 1) * size)
            const invoices = await data
            
            // Calculate the total cash transaction
            const totalCashTransaction = invoices.reduce((sum, item) => sum + parseInt(item.total_price_sold, 10), 0)

            // Calculate the total profit
            const totalProfit = invoices.reduce((sum, item) => sum + parseInt(item.profit, 10), 0)
            
            // Check if the insertion was successful
            if (invoices) {
                if (invoices.length === 0){
                    res.status(200).json({ 
                        status : 'SUCCESS',
                        message: 'Records not found.'
                    })
                } else {
                    const newInvoice = {
                        total_cash_transactions : `${totalCashTransaction}`,
                        total_profit : `${totalProfit}`,
                        details : invoices 
                    }
                    res.status(200).json({
                        status : 'SUCCESS',
                        message: 'Data successfully fetched',
                        data   : newInvoice
                    })
                }
                
            } else {
                res.status(500).json({ 
                    status : 'ERROR',
                    message: 'Failed to retrieve data.' 
                })
            }
        }
        

    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})

/**
 * invoice API update
 */
router.put('/update/:invoice_no', async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        const schemaReq = Joi.object({
            date: Joi.date().required(),
            customer_name: Joi.string().min(2).required(),
            salesperson_name : Joi.string().min(2).required(),
            payment_type: Joi.string().valid('CASH','CREDIT'),
            notes: Joi.string().min(5)
          })

        /**
         * secondly , access the validation into the body request
         */
        const {error, value} = schemaReq.validate(req.body)        
        // let {id, nama, email} = req.body
        if (error){
            res.status(400).json({ status : 'ERROR',message: error.details[0].message })
        } 
        else {
            // request body successfully validated
            // Extract id from param
            const invoiceNo = req.params.invoice_no
            // Extract validated data from the request body
            const { invoice_no,
                date,
                customer_name,
                salesperson_name,
                payment_type,
                notes} = value
            
            
            // check if the invoice number exist or not
            const getInvoice = await db('invoice').select('*').where('invoice_no', invoiceNo)
            if (getInvoice.length === 0){
                res.status(404).json({ 
                    status : 'ERROR',
                    message: 'Record not found'
                })
            } else {
                const result = await db('invoice')
                .update({
                    date,
                    customer_name,
                    salesperson_name,
                    payment_type,
                    notes
                })
                .where({invoice_no : invoiceNo})
                
                const updatedData = await db('invoice').select('*').where('invoice_no', invoiceNo)
                // Check if the insertion was successful
                if (result) {
                    res.status(200).json({
                        status : 'SUCCESS',
                        message : `Data successfully updated`,
                        data    : updatedData 
                    })
                } else {
                    res.status(500).json({ status : 'ERROR', message: 'Failed to update data into the database.' })
                }
            }
            
        }
        

    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})

/**
 * invoice API delete
 */
router.delete('/delete', async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        const schemaReq = Joi.object({
            invoice_no: Joi.string().required(),
        })
          
        /**
         * secondly , access the validation into the body request
         */
        const {error, value} = schemaReq.validate(req.query)
        if (error){
            res.status(400).json({ status : 'ERROR', message: error.details[0].message })
        } else {
            // check if the data is exist or not
            const getInvoice = await db('invoice').select('*').where('invoice_no', value.invoice_no)
            if (getInvoice.length === 0){
                res.status(404).json({ 
                    status : 'ERROR',
                    message: 'Record not found'
                })
            } else {
                // request param successfully validated

                /**Delete invoice */
                const result = await db('invoice').where('invoice_no' , value.invoice_no).del()
                // Check if the deletion was successful
                if (result) {
                    /**Delete product related invoice */
                    await db('products').where('invoice_no' , value.invoice_no).del()
                    res.status(200).json({
                        status : 'SUCCESS',
                        message : `Data successfully deleted for invoice no. ${value.invoice_no}`
                    })
                } else {
                    res.status(500).json({status : 'ERROR', message: 'Failed to delete data into the database.' })
                }
            }
            
        }

    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})

/**
 * invoice API upload csv
 */
router.post('/uploadCsv', multerUpload.single('file'),async (req,res) => {
    try {
        /**
         * first, validate the request body of API
         */
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'XLSX file is required' })
        }

        // Read and parse the XLSX file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0] // Get the first sheet
        const sheetName2 = workbook.SheetNames[1] // Get the second sheet
        const sheet = workbook.Sheets[sheetName]
        const sheet2 = workbook.Sheets[sheetName2]
        const jsonData = XLSX.utils.sheet_to_json(sheet) // Convert the sheet to JSON
        const jsonData2 = XLSX.utils.sheet_to_json(sheet2) // Convert the sheet2 to JSON
        const headerData = Object.keys(jsonData[0])
        const headerData2 = Object.keys(jsonData2[0])
        const newHeader = headerData.map(item => item.replace(/\s+/g, '_'))
        const newHeader2 = headerData2.map(item => item.replace(/\s+/g, '_'))
        let headersValid = true
        let errorData = []
        let successData = []
        
        
        //check header contained in sheet 1
        for (let header of newHeader) {
            if (![
                "invoice_no","date","customer", 
                "salesperson", "payment_type",
                "notes"].includes(header)) {
                    console.log('w3w')
                headersValid = false
            } else {
            }
        }
        //check header contained in sheet 2
        for (let header2 of newHeader2) {
            if (![
                "Invoice_no","item","quantity","total_cogs","total_price"].includes(header2)) {
                    console.log('w3w2')
                headersValid = false
            } else {
            }
        }

       
        if (!headersValid) {
            return res.status(400).json({ status: 'error', message: 'Header file is not complete. Please check again.' })
        }

        //Extract all the data from sheet 1
        const rowsData = jsonData.map(item => {

            const rowData = Object.keys(item).reduce((acc,key) => {
                // replace space with underscore
                const newKey = key.replace(/\s+/g, '_')
                acc[newKey] = item[key]
                return acc
            }, {})
            
            return rowData 
        })
        
        // Convert the date field to YYYY-MM-DD format sheet1
        rowsData.map(item => {
            // Convert the Excel date to YYYY-MM-DD format
            item.date = convertExcelDate(item.date)
            return item
        })

        //Extract all the data from sheet 2
        const rowsData2 = jsonData2.map(item => {
            const rowData = Object.keys(item).reduce((acc,key) => {
                // replace space with underscore
                const newKey = key.replace(/\s+/g, '_')
                acc[newKey] = item[key]
                return acc
            }, {})
          
            
            return rowData
        })
       

        //insert data invoice into db
        for (let invoice of rowsData){        
            //query to table invoice
            const invoiceData = await db('invoice')
            .select('*')
            .where('invoice_no', invoice.invoice_no)
            if (invoiceData.length != 0){
                let msg = `Invoice no. ${invoice.invoice_no} already exist in database. Invoice no. duplicated`
                errorData.push(msg)
            } else {
                try {
                    await db('invoice')
                        .insert({
                            invoice_no : invoice.invoice_no,
                            date : invoice.date,
                            customer_name : invoice.customer,
                            salesperson_name : invoice.salesperson,
                            payment_type : invoice.payment_type,
                            notes : invoice.notes
                        })

                        let msg = `Invoice no. ${invoice.invoice_no} successfully inserted.`
                        successData.push(msg)
                } catch (error){
                    // console.log('e',error)
                }
                
            }
        }

        //insert data invoice into db
        for (let product of rowsData2){ 
            //query to table invoice
            const checkInvoice = await db('invoice').select('*').where('invoice_no', product.Invoice_no)
            if (checkInvoice.length != 0){
                try {
                    await db('products')
                    .insert({
                        invoice_no : product.Invoice_no,
                        item_name : product.item,
                        quantity : product.quantity,
                        total_cost_of_goods_sold : product.total_cogs,
                        total_price_sold : product.total_price
                    })

                    let msg = `Product with invoce no. ${product.Invoice_no} successfully inserted.`
                    successData.push(msg)
                } catch (error){
                    // console.log('e',error)
                }
                
            }
            
        }


        //give all response success and error
        res.status(200).json({
            failed : errorData,
            success : successData
        })


    } catch(error){
        console.log('error', error)
        res.send(error)
    }
})

export default router

