// Function to convert Excel serial date to YYYY-MM-DD format
const convertExcelDate = (excelDate) => {
    // Adjust for Excel's 1900-01-01 start date and the leap year bug.
    const excelStartDate = new Date(1900, 0, 1)  // Starting date for Excel (1900-01-01)
    
    // Excel serial dates are based on the number of days since 1900-01-01
    // 25569 is the number of days between 1900-01-01 and 1970-01-01
    const javascriptDate = new Date(excelStartDate.getTime() + (excelDate - 1) * 86400 * 1000) // Convert Excel serial date to JavaScript date
    // Return date in YYYY-MM-DD format
    const year = javascriptDate.getFullYear()
    const month = (javascriptDate.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based
    const day = (javascriptDate.getDate() - 1).toString().padStart(2, '0')


    return `${year}-${month}-${day}`  // Return formatted date string
}

export default convertExcelDate
