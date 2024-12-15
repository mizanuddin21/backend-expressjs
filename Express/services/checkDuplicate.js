const findDuplicates = (data, columnName) => {
    const seen = new Set()
    const duplicates = []
    console.log('1', data)
    console.log('2', columnName)
    data.forEach((row, index) => {
        
        if (row[columnName] && seen.has(row[columnName])) {
        duplicates.push({
          row: index + 1,  // Row number (1-based index)
          value: row[columnName],
        });
      } else {
        seen.add(row[columnName])
      }
    });
    console.log('1', duplicates)
    return duplicates
  };
  
  // Export the function as default
  export default findDuplicates  