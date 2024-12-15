import express from 'express'
import Joi from 'joi'
import db from '../config/database.js'
import XLSX from 'xlsx'
import multerUpload from '../services/uploadFile.js'

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
            notes: Joi.string().min(5),
            product_id: Joi.number().required()
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
                notes,
                product_id
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
                'products.item_name', 
                'products.quantity',
                'products.total_price_sold',
                'products.total_cost_of_goods_sold',
                db.raw('products.total_price_sold - products.total_cost_of_goods_sold AS profit'),
            )
            .leftJoin('products', 'products.id', '=', 'invoice.product_id')
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
router.put('/update/:id', async (req,res) => {
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
            notes: Joi.string().min(5),
            product_id: Joi.number().required()
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
            const id = req.params.id
            // Extract validated data from the request body
            const { invoice_no,
                date,
                customer_name,
                salesperson_name,
                payment_type,
                notes,
                product_id} = value
            
            
            // check if the invoice number exist or not
            const getInvoice = await db('invoice').select('*').where('id', id)
            if (getInvoice.length === 0){
                res.status(404).json({ 
                    status : 'ERROR',
                    message: 'Record not found'
                })
            } else {
                const result = await db('invoice')
                .update({
                    invoice_no,
                    date,
                    customer_name,
                    salesperson_name,
                    payment_type,
                    notes,
                    product_id
                })
                .where({id : id})
                
                const updatedData = await db('invoice').select('*').where('id', id)
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
                const result = await db('invoice').where('invoice_no' , value.invoice_no).del()
                // Check if the deletion was successful
                if (result) {
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
        const newHeader = JSON.stringify(headerData[0]).replace(/^"|"$/g, '').split(';')
        const headerData2 = Object.keys(jsonData2[0])
        const newHeader2 = JSON.stringify(headerData2[0]).replace(/^"|"$/g, '').split(';')
        let headersValid = true
        let errorData = []
        let successData = []

        //check header contained in sheet 1
        for (let header of newHeader) {
            if (![
                "invoice_no","date","customer_name", 
                "salesperson_name", "payment_type",
                "notes","product_id"].includes(header)) {
                headersValid = false
            } else {
            }
        }
        //check header contained in sheet 2
        for (let header2 of newHeader2) {
            if (![
                "item_name","quantity","total_cost_of_goods_sold","total_price_sold"].includes(header2)) {
                headersValid = false
            } else {
            }
        }
        if (!headersValid) {
            return res.status(400).json({ status: 'error', message: 'Header file is not complete. Please check again.' })
        }

        //Extract all the data from sheet 1
        const rowsData = jsonData.map(item => {
            const key = Object.keys(item)[0] // Get the key (header part before ":")
            const value = item[key]          // Get the value (data part after ":")
            
            // Split the header and data into arrays
            const headers = key.split(';')   // Split header string by ";"
            const rowData = value.split(';') // Split data string by ";"
            
            return rowData 
        })

        // Map each array to an object using the headers for data1
        const output1 = rowsData.map(row => {
            return newHeader.reduce((obj, header, index) => {
            obj[header] = row[index]
            return obj
            }, {})
        })

        //Extract all the data from sheet 2
        const rowsData2 = jsonData2.map(item => {
            const key = Object.keys(item)[0] // Get the key (header part before ":")
            const value = item[key]          // Get the value (data part after ":")
            
            // Split the header and data into arrays
            const headers = key.split(';')   // Split header string by ";"
            const rowData = value.split(';') // Split data string by ";"
            
            return rowData
        })

        // Map each array to an object using the headers for data2
        const output2 = rowsData2.map(row => {
            return newHeader2.reduce((obj, header, index) => {
            obj[header] = row[index]
            return obj
            }, {})
        })

        //insert data invoice into db
        for (let invoice of output1){
            console.log('walawe', invoice)           
            //query to table invoice
            const invoiceData = await db('invoice')
            .select('*')
            .where('invoice_no', invoice.invoice_no)
            if (invoiceData.length != 0){
                let msg = `Invoice no. ${invoice.invoice_no} already exist in database. Invoice no. duplicated`
                errorData.push(msg)
                // return res.status(422).json({ status: 'error', message: `Invoice no. ${invoice.invoice_no} already exist in database.` })
            } else {
                // check whether the product id is exist in table product or not
                const productData = await db('products')
                .select('*')
                .where('id', invoice.product_id)
                
                if (productData.length == 0) {
                    let msg = `Invoice no. ${invoice.invoice_no} using product id '${invoice.product_id}' that does not exist in table. `
                    errorData.push(msg)
                } else {
                    await db('invoice')
                    .insert({
                        invoice_no : invoice.invoice_no,
                        date : invoice.date,
                        customer_name : invoice.customer_name,
                        salesperson_name : invoice.salesperson_name,
                        payment_type : invoice.payment_type,
                        notes : invoice.notes,
                        product_id : invoice.product_id
                    })
                    let msg = `Invoice no. ${invoice.invoice_no} successfully inserted.`
                    successData.push(msg)
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
