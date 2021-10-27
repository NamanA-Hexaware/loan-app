const fs = require('fs')
const path = require('path')
const userService = require('./user_service')
const crmService = require('./crm_service')

const loadLoans = () => {
    try {
        const bufferedData = fs.readFileSync(path.join(__dirname, '../model/loans.json'))
        const loanDataList = JSON.parse(bufferedData.toString())
        return loanDataList
    } catch(e) {
        return []
    }
}

const addNewLoan = (email, loan_amount, collateral) => {
    const loanList = loadLoans()
    const user = userService.getUserByEmail(email)
    let loanData = undefined;
    if(loanList.length !== 0)
        loanData = loanList.find((loan) => loan.email === email)
    const crmList = crmService.getCRMList()
    if(user) {
        if(loanData) {
            const doesLoanRecordExists = loanData.loan_details
            if(!doesLoanRecordExists) {
                loanData.loan_details = []
            }
            loanData.loan_details.push({
                loanReferenceNo: "" + user.userNo + (loanData.loan_details.length + 1),
                loan_amount: loan_amount,
                collateral: collateral,
                crmApproval: false,
                crmStatus: "Pending",
                managerApproval: false,
                managerStatus: "Pending"
            })
            loanList.find((loan) => {
                if(loan.email === email) {
                    loan = loanData
                }
            })
        } else {
            const loan = {
                email: email,
                loan_details: [ 
                    {
                        loanReferenceNo: "" + user.userNo + 1,
                        loan_amount: loan_amount,
                        collateral: collateral,
                        crmApproval: false,
                        crmStatus: "Pending",
                        managerApproval: false,
                        managerStatus: "Pending"
                    }
                ],
                userDetails: user,
                crm: crmList[(user.userNo-1)%4].email,
            }
            loanList.push(loan)
        }
        let isAdded = true
        fs.writeFile(path.join(__dirname, '../model/loans.json'), JSON.stringify(loanList), (err) => {
            if(err) {
                console.log(err)
                isAdded = false
            }
        })
        return isAdded
    }
}

const getLoanByUserEmail = (email) => {
    const loanList = loadLoans()
    if(loanList.length !== 0) {
        const loanDataList = loanList.find((loan) => loan.email === email)
        return loanDataList
    } else {
        return undefined
    }
}

const getLoanByCrmEmail = (email) => {
    const loanList = loadLoans()
    if(loanList.length !== 0) {
        const loanDataList = loanList.filter((loan) => loan.crm === email)
        const loanListCrm = []
        loanDataList.forEach(loanData => {
            const loanDataDetails = {}
            loanDataDetails.email = loanData.userDetails.email
            const userDetails = {
                name: loanData.userDetails.name,
                age: loanData.userDetails.age,
                income: loanData.userDetails.income,
                cibilScore: loanData.userDetails.cibilScore
            }
            loanDataDetails.userDetails = userDetails
            loanDataDetails.loanDetails = loanData.loan_details
            loanDataDetails.crm = loanData.crm
            loanListCrm.push(loanDataDetails)
        });
        return loanListCrm
    } else {
        return undefined
    }
}

const getLoanByManagerEmail = (email) => {
    const loanList = loadLoans()
    if(loanList.length !== 0) {
        const loanListManager = []
        loanList.forEach(loanData => {
            const loanDataDetails = {}
            loanDataDetails.email = loanData.userDetails.email
            const userDetails = {
                name: loanData.userDetails.name,
                age: loanData.userDetails.age,
                income: loanData.userDetails.income,
                cibilScore: loanData.userDetails.cibilScore
            }
            loanDataDetails.userDetails = userDetails
            loanDataDetails.loanDetails = loanData.loan_details
            loanDataDetails.crm = loanData.crm
            loanListManager.push(loanDataDetails)
        });
        return loanListManager
    } else {
        return undefined
    }
}

const updateLoanStatus = (email, lrn, role, accept) => {
    const loanDetailsList = loadLoans()
    const userLoanDetails = loanDetailsList.find((loan) => loan.email === email)
    let status = false
    if(userLoanDetails) {
        userLoanDetails.loan_details.find((loan) => {
            if(loan.loanReferenceNo === lrn) {
                if(role === "crm") {
                    if(accept === true) {
                        loan.crmApproval = true
                        loan.crmStatus = "Approved"
                    } else {
                        loan.crmStatus = "Rejected"
                    }
                } else if(role === "manager") {
                    if(accept === true) {
                        loan.managerApproval = true
                        loan.managerStatus = "Approved"
                    } else {
                        loan.managerStatus = "Rejected"
                    }
                }
            }
        })
        loanDetailsList.find((loanDetail) => {
            if(loanDetail.email === email) {
                loanDetail = userLoanDetails
            }
        })
        fs.writeFile(path.join(__dirname, '../model/loans.json'), JSON.stringify(loanDetailsList), (err) => {
            if(err) {
                status = false
            }
        })
        status = true
    }
    return status
}

module.exports = {
    addNewLoan: addNewLoan,
    getLoanByUserEmail: getLoanByUserEmail,
    getLoanByCrmEmail: getLoanByCrmEmail,
    getLoanByManagerEmail: getLoanByManagerEmail,
    updateLoanStatus: updateLoanStatus
}