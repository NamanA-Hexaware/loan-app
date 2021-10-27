const path = require('path')
require("dotenv").config({path: path.join(__dirname, '../.env')})

let refreshTokens = []

const express = require('express')
const app = express()
app.use(express.json())

const userService = require('../service/user_service')
const crmService = require('../service/crm_service') 

const bcrypt = require ('bcrypt')

const jwt = require("jsonwebtoken")

// port 4000
const port = process.env.TOKEN_SERVER_PORT 

app.listen(port, () => { 
    console.log(`Authorization Server running on ${port}...`)
})

app.post ("/signup", async (req,res) => {
    const role = req.query.role
    const email = req.body.email
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    if(role === "user") {
        const userData = {
            email: email, 
            password: hashedPassword,
            name: req.body.name,
            age: req.body.age,
            income: req.body.income,
            cibilScore: req.body.cibil
        }
        const isAdded = userService.addNewUser(userData)
        console.log(isAdded)
        if(isAdded)
            res.status(200).send({"success": true})
        else
            res.status(200).send({"success": false, "message": "Email already exists"})
    } else {
        res.status(404).send("Bad request")
    }
})

app.post("/login", async (req,res) => {
    const role = req.query.role
    if(role === "user") {
        const user = userService.doesUserExist(req.body)
        if (!user) 
            res.status(404).send ("Email does not exist!")
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = generateAccessToken ({email: req.body.email})
            const refreshToken = generateRefreshToken ({email: req.body.email})
            res.json ({accessToken: accessToken, refreshToken: refreshToken})
        } 
        else {
            res.status(401).send("Password Incorrect!")
        }
    } else if(role === "crm") {
        const crmList = crmService.getCRMList()
        const crm = crmList.find((crm) => {
            if(crm.email === req.body.email && crm.password === req.body.password)
                return true
        })
        if (crm) {
            const accessToken = generateAccessToken ({email: req.body.email})
            const refreshToken = generateRefreshToken ({email: req.body.email})
            res.json ({accessToken: accessToken, refreshToken: refreshToken})
        } 
        else {
            res.status(401).send("Email or Password Incorrect!")
        }
    } else if(role === "manager") {
        if(req.body.password === "manager@123" && req.body.email === "manager") {
            const accessToken = generateAccessToken ({email: req.body.email})
            const refreshToken = generateRefreshToken ({email: req.body.email})
            res.json ({accessToken: accessToken, refreshToken: refreshToken})
        } else {
            res.status(401).send("Email or Password Incorrect!")
        }
    } else {
        res.status(404).send("Bad request")
    }
})

app.post("/refreshToken", (req,res) => {
    if (!refreshTokens.includes(req.body.token)) 
        res.status(400).send("Refresh Token Invalid")

    //remove the old refreshToken from the refreshTokens list
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)

    //generate new accessToken and refreshTokens
    const accessToken = generateAccessToken ({email: req.body.email})
    const refreshToken = generateRefreshToken ({email: req.body.email})
    res.json ({accessToken: accessToken, refreshToken: refreshToken})
})

app.delete("/logout", (req,res)=>{

    //remove the old refreshToken from the refreshTokens list
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)

    res.status(200).json({"msg": "Logged out!"})
})

function generateAccessToken(email) {
    return jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) 
}


function generateRefreshToken(email) {
    const refreshToken = jwt.sign(email, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
    refreshTokens.push(refreshToken)
    return refreshToken
}