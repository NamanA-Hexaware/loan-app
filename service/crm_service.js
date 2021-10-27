const fs = require('fs')
const path = require('path')

const getCRMList = () => {
    try {
        const bufferedData = fs.readFileSync(path.join(__dirname, '../model/crm.json'))
        const crmList = JSON.parse(bufferedData.toString())
        return crmList
    } catch(e) {
        return []
    }
}

module.exports = {
    getCRMList: getCRMList
}