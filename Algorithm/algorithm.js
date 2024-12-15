import readline from 'readline'
// const readline = require('readline')

//interface to read input user from terminal
const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
})

//function generate combination from array of numbers
function section3(arr, t){
    let result = []

    function combine(start, combination){
        if (combination.length == t){
            result.push([...combination])
            return
        }

        for (let i = start; i < arr.length; i++){
            combination.push(arr[i])
            combine(i+1, combination)
            combination.pop()
        }
    }

    combine(0, [])
    return result
}

//input l from user
rl.question('Enter your first input (l): ', (inputL) => {
    rl.question('Enter your second input (t): ', (inputT) => {
        //parse input L and T to a number
        const numbL = parseFloat(inputL)
        const numbT = parseFloat(inputT)

        // Validate the inputs
        if (isNaN(numbL) || isNaN(numbT) || numbL < 1 || numbL > 9 || numbT < numbL) {
            console.log('Invalid input. Please ensure that l is between 1 and 9, and t is a valid sum.')
            rl.close()
            return
        }

        const digitRange = [1, 2, 3, 4, 5, 6, 7, 8, 9]

        //generate all combination
        const combination = section3(digitRange, numbL)

        //filter combination whose sum equal to total off all number combination T
        const finalCombination = combination.filter(comb => comb.reduce((sum, num) => sum + num, 0) == numbT)

        console.log(`Valid combination input: l = ${numbL} and t = ${numbT}: `)
        console.log(finalCombination)

        rl.close()
    })
})
