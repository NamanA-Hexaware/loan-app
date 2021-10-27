const path = require('path')
require("dotenv").config({path: path.join(__dirname, '../.env')})
const express = require("express")
const app = express()
app.use (express.json())
const jwt = require("jsonwebtoken")
const userService = require('../service/user_service')
const loanService = require('../service/loan_service')
const port = process.env.PORT

//port 5000
app.listen(port,()=> {
    console.log(`Validation server running on ${port}...`)
})

function validateToken(req, res, next) {
    
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    
    if (token == null) 
        res.sendStatus(400).send("Token not present")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, email) => {
        if (err) { 
            res.status(403).send("Token invalid")
        }
        else {
            req.email = email
            next() 
        }
    }) 
} 

app.post('/apply-loan', validateToken, (req, res) => {
    const isAdded = loanService.addNewLoan(req.email.email, req.body.loan_amount, req.body.collateral)
    console.log(isAdded)
    if(isAdded)
        res.status(200).send({"msg": "Loan Application Sent Successfully"})
    else
        res.status(200).send({"msg": "Problem applying loan"})
})

app.get('/loan-list', validateToken, (req, res) => {
    const role = req.query.role
    let loanList = undefined
    if(role === "user") {
        loanList = loanService.getLoanByUserEmail(req.email.email)
        if(loanList) {
            res.status(200).send(loanList.loan_details)
        } else {
            res.status(404).send({"msg": "Not Applied for loan yet"})
        }
    } else if(role === "crm") {
        loanList = loanService.getLoanByCrmEmail(req.email.email)
        if(loanList) {
            res.status(200).send(loanList)
        } else {
            res.status(404).send({"msg": "No Data Found"})
        }
    } else if(role === "manager") {
        loanList = loanService.getLoanByManagerEmail(req.email.email)
        if(loanList) {
            res.status(200).send(loanList)
        } else {
            res.status(404).send({"msg": "No Data Found"})
        }
    } else {
        res.status(404).send("Bad Request")
    }
    
})

app.put('/update-loan-status', validateToken, (req, res) => {
    const role = req.query.role
    const lrn = req.body.lrn
    const customerEmail = req.body.customerEmail
    const accept = req.body.accept
    if(role === "crm" || role === "manager") {
        const isUpdated = loanService.updateLoanStatus(customerEmail, lrn, role, accept)
        if(isUpdated) {
            res.status(200).send({"msg": "Loan Status Update successfuly"})
        } else {
            res.status(401).send({"msg": "Loan Status Update Failed"})
        }
    } else {
        res.status(404).send("Bad request")
    }
})