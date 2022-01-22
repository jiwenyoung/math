const algebra = require('algebra.js');
const commander = require('commander')

const main = async () => {
  try{
    const program = new commander.Command();
    program.version('0.0.1');

    // Fraction
    const isFraction = (number) => {
      if((number.split('')).includes('/')){
        const nums = number.split('/')
        if(Number.isInteger(Number(nums[0])) && Number.isInteger(Number(nums[0]))){
          return true
        }else{
          return false
        }
      }else{
        return false
      }      
    }
    const Fraction = program.command('fraction')
    Fraction.addArgument(new commander.Argument('<first>', 'First fraction number').argParser((value)=>{
      if(isFraction(value)){
        return value
      }else{
        throw new Error('First number is not a fraction')
      }
    }))
    Fraction.addArgument(new commander.Argument('<operation>', 'Operation').choices(['+' ,'-', '*', '/' ]))
    Fraction.addArgument(new commander.Argument('<second>', 'Second fraction number').argParser((value)=>{
      if(isFraction(value)){
        return value
      }else{
        throw new Error('Second number is not a fraction')
      }
    }))
    Fraction.action((first, operation, second )=>{
      let numbers =  [ first.split('/'), second.split('/') ]
      let firstNumber = new algebra.Fraction(parseInt(numbers[0][0]), parseInt(numbers[0][1]))
      let secondNumber = new algebra.Fraction(parseInt(numbers[1][0]), parseInt(numbers[1][1]))
      let result = ''
      if(operation === '+'){
        result = firstNumber.add(secondNumber)
      }
      if(operation === '-'){
        result = firstNumber.subtract(secondNumber)
      }
      if(operation === '*'){
        result = firstNumber.multiply(secondNumber)
      }
      if(operation === '/'){
        result = firstNumber.divide(secondNumber)
      }
      console.log(result.toString())
    })

    // Formula
    const Formula = program.command('formula')
    
    // Univeriate Equation
    const UnivariateEquation = Formula.command('univeriate')
    UnivariateEquation.argument('<equation>', 'equation')
    UnivariateEquation.option('-r, --resovle <symbol>', 'Example: --resove x')
    UnivariateEquation.action((equation, options)=>{
      let resovle = options.resovle
      if(resovle.length === 1){
        if(equation.split('').includes(resovle)){
          let exp = algebra.parse(equation)
          let result = exp.solveFor(resovle)
          if(result !== undefined){
            let get = result.toString()
            const includeAlpha = (str) => {
              let strs = str.split('')
              for(let char of strs){
                if(/^[a-zA-Z]*$/.test(char)){
                  return true
                }
              }
              return false
            }
            if(includeAlpha(get)){
              result = `${resovle} = ${get}`
            }else{
              result = `${resovle} = ${eval(get)}`
            }
            console.log(result)      
          }else{
            throw new Error('calculation error')
          }
        }else{
          throw new Error('resovle arugment is not in equation')
        }
      }else{
        throw new Error('--resovle argument error')
      }
    })

    // Binary equation
    const BinaryEquation = Formula.command('binary')
    BinaryEquation.argument('<first>', 'first equation')
    BinaryEquation.argument('<second>', 'second equation')
    BinaryEquation.option('-r,--resolve <symbols>', 'Example --resolve x,y', (value)=>{
      if(value.split('').includes(',')){
        let symbols = value.split(',')
        return symbols
      }else{
        throw new Error('--resovle argument error')
      }
    })
    BinaryEquation.action((first, second, options)=>{
      const has = (expression, symbol) =>{
        expression = expression.split('')
        if(expression.includes(symbol)){
          return true
        }else{
          return false
        }
      }
      let symbols = options.resolve
      for(let symbol of symbols){
        if(has(first, symbol) || has(second, symbol)){
          continue
        }else{
          throw new Error('--resolve argument error')
        }
      }

      let out = {
        [symbols[0]] : '',
        [symbols[1]] : '' 
      }
      const calculation = (first, second) => {
        let commonSymbol = ''
        let leftSymbol = ''
        if(has(first, symbols[0]) && has(second, symbols[0])){
          commonSymbol = symbols[0]
          leftSymbol = symbols[1]
        }else{
          if(has(first, symbols[1]) && has(second, symbols[1])){
            commonSymbol = symbols[1]
            leftSymbol = symbols[0]
          }else{
            throw new Error('Equation is wrong')
          }
        }
        let commonSymbolReplace = ((algebra.parse(first)).solveFor(commonSymbol)).toString()
        let secondeReplaced = second.replaceAll(commonSymbol, `(${commonSymbolReplace})`)
        let getLeftSymbol = ((algebra.parse(secondeReplaced)).solveFor(leftSymbol)).toString()
        out[leftSymbol] = getLeftSymbol
        if(has(first, leftSymbol)){
          first = first.replaceAll(leftSymbol, getLeftSymbol)
          let getCommonSymbol = ((algebra.parse(first)).solveFor(commonSymbol)).toString()
          out[commonSymbol] = getCommonSymbol
        }
        if(has(second, leftSymbol)){
          second = second.replaceAll(leftSymbol, getLeftSymbol)
          let getCommonSymbol = ((algebra.parse(second)).solveFor(commonSymbol)).toString()
          out[commonSymbol] = getCommonSymbol
        }
      }
      calculation(first,second)
      //calculation(second,first)
      for(let element of Object.entries(out)){
        console.log(`${element[0]} = ${eval(element[1])}`)
      }
    })

    program.parse(process.argv)

  }catch(error){
    console.error(error.message)
  }    
}

main()