const fs = require('fs')
const path = require('path')
function doesUserExist(loginUser) {
    try {
        const users = loadUsers()
        const user = users.find((user) => user.email === loginUser.email)
        return user
    } catch(e) {
        console.log(e)
        return undefined
    }
}

function addNewUser (newUser)  {
    const users = loadUsers()
    const userNo = users.length + 1
    newUser.userNo = userNo
    const dupUser = users.find((user) => user.email === newUser.email)
    if(!dupUser) {
        users.push(newUser)
        saveUser(users)
        return true
    } else {
        return false
    }
}

const loadUsers = () => {
    try {
        const dir = path.join(__dirname, '../model/users.json')
        const bufferedData = fs.readFileSync(dir)
        const userData = bufferedData.toString()
        const users = JSON.parse(userData)
        return users
    } catch(e) {
        return []
    }   
}

const getUserByEmail = (email) => {
    const users = loadUsers()
    const user = users.filter((u) => u.email === email)
    if(user.length !== 0) {
        return user[0]
    } else {
        return undefined
    }
}

const saveUser = (usersData) => {
    fs.writeFile('./model/users.json', JSON.stringify(usersData), (err) => {
        if(err) throw err
    })
}

module.exports = {
    addNewUser: addNewUser,
    doesUserExist: doesUserExist,
    getUserByEmail: getUserByEmail
}