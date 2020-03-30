import { array } from "prop-types"

class BaseObject{
    constructor(props){
        this.OUTPUT_OBJ = "Output"
        this.INTEGER_OBJ = "INTEGER"
        this.BOOLEAN_OBJ = "BOOLEAN"
        this.STRING_OBJ = "String"
        this.ARRAY_OBJ = "Array"
        this.HASH_OBJ = "Hash"
        this.NULL_OBJ = "NULL"
        this.ERROR_OBJ = "Error"
        this.RETURN_VALUE_OBJ = "Return"
        this.FUNCTION_LITERAL = "FunctionLiteral"
        this.FUNCTION_CALL = "FunctionCall"

        this.value = props.value
    }

    getObType(){
        return null
    }

    getObInspect(){
        return null
    }
}

class Output extends BaseObject{
    getObType(){
        return this.OUTPUT_OBJ
    }
}

class Integer extends BaseObject{
    constructor(props){
        super(props)
        //this.value = props.value
    }
    
    getObType(){
        return this.INTEGER_OBJ
    }
    getObInspect(){
        return "integer with value: " + this.value
    }
}

class Boolean extends BaseObject{
    constructor(props){
        super(props)
        //this.value = props.value
    }

    getObType(){
        return this.BOOLEAN_OBJ
    }
    getObInspect(){
        return "boolean with value: " + this.value
    }
}

class String extends BaseObject{
    constructor(props){
        super(props)
        //this.value = props.value
    }

    getObType(){
        return this.STRING_OBJ
    }

    getObInspect(){
        return "content of string is: " + this.value
    }
}

class Array extends BaseObject{
    constructor(props){
        super(props)
        //this.value = props.value
    }

    getObType(){
        return this.ARRAY_OBJ
    }

    getObInspect(){
        var s = "["
        for(var i = 0 ; i < this.value.length-1; i++){
            s += this.value[i].getObInspect()
            s += ","
        }

        s += this.value[i].getObInspect()
        s += "]"
        return s
    }
}

class Hash extends BaseObject{
    constructor(props){
        super(props)
        this.keys = props.key
        //this.value = props.value
    }

    getObType(){
        return this.HASH_OBJ
    }

    getObInspect(){
        var s = "{"
        for(var i = 0; i < this.keys.length; i++){
            var pair = "" + this.keys[i].getObInspect()
            pair += ":"
            pair += this.value[i].getObInspect()
            pair += ","
            s += pair
        }

        s += "}"
        return s
    }
}
class Null extends BaseObject{
    getObType(){
        return this.NULL_OBJ
    }
    getObInspect(){
        return "null"
    }
}

class Error extends BaseObject{
    constructor(props){
        super(props)
        this.msg = props.errMsg
    }
    getObType(){
        return this.ERROR_OBJ
    }
    getObInspect(){
        return this.msg
    }
}

class ReturnValue extends BaseObject{
    constructor(props){
        super(props)
        //this.valueObject = props.value
        this.value = props.value
    }

    getObType(){
        return this.RETURN_VALUE_OBJ
    }
    getObInspect(){
        this.msg = "return with: " + this.value.getObInspect()
        return this.msg
    }
}

/*
class FunctionLiteral extends BaseObject{
    constructor(props){
        super(props)
        this.token = props.token
        this.parameters = props.identifiers
        this.blockStatement = props.blockStatement
    }

    getObType(){
        return this.FUNCTION_LITERAL
    }

    getObInspect(){
        var s = "fn( "
        var identifiers = []
        for(var i = 0; i < this.parameters.length; i++){
            identifiers[i] = this.parameters[i].tokenLiteral
        }
        
        s += identifiers.join(',')
        s += " ){\n"
        s += this.blockStatement.tokenLiteral
        s += "\n}"
    }
}
*/

class FunctionCall extends BaseObject{
    constructor(props){
        super(props)
        this.identifiers = props.identifiers
        this.blockStatement = props.blockStatement
        this.environment = undefined
    }
}

class Environment{
    constructor(props){
        this.map = {}
        this.outer = undefined
    }
    getObj(name){
        var obj = this.map[name]
        if(obj !== undefined){
            return obj
        }

        //在当前环境找不到变量时， 通过回溯查找外层绑定环境是否有给定变量
        if(this.outer !== undefined){
            obj = this.outer.getObj(name)
        }

        return obj
    }

    setObj(name, obj){
        this.map[name] = obj
    }
}

class Interpreter{
    constructor(props){
        this.environment = new Environment()
    }

    interprete(node){
        var props = {}
        switch(node.type){
            case "program":
                return this.interpreteProgram(node)
            case "String":
                props.value = node.tokenLiteral
                return new String(props)
            case "ArrayLiteral":
                var elements = this.interpreteExpression(node.value)
                if(elements.length === 1 && this.isError(elements[0])){
                    return elements[0]
                }
                var props = {}
                props.value = elements
                return new Array(props)
            case "HashLiteral":
                return this.interpreteHashLiteral(node)
            case "IndexExpression":
                var left = this.interprete(node.left)
                if(this.isError(left)){
                    return left
                }
                var index = this.interprete(node.index)
                if(this.isError(index)){
                    return index
                }
                var obj = this. interpreteIndexExpression(left, index, node.token.lineNumber)
                if(obj !== null){
                    //console.log("the " + index.value + " element of array is: " + obj.getObInspect())
                }
                return obj
            case "LetStatement":
                var val = this.interprete(node.expression)
                if(this.isError(val)){
                    return val
                }
                this.environment.setObj(node.name.tokenLiteral, val)
                return val
            case "Statement_N":
                var identname = this.interpreteIdentifier(node.token, this.environment)
                if(identname.getObType() === identname.ERROR_OBJ){
                    return identname
                }
                var val = this.interprete(node.expression)
                if(this.isError(val)){
                    return val
                }
                this.environment.setObj(node.name.tokenLiteral, val)
                return val
            case "Identifier":
                //console.log("variable: " + node.tokenLiteral)
                var value = this.interpreteIdentifier(node, this.environment)
                //console.log("its binding value is: " + value.getObInspect())
                return value
            case "FunctionLiteral":
                var props = {}
                props.token = node.token
                props.identifiers = node.parameters
                props.blockStatement = node.body
                var funObj = new FunctionCall(props)
                //为实现闭包功能，需要为每个函数变脸配置一个绑定环境
                funObj.environment = this.newEncloseEvironment(this.environment)
                return funObj
            case "CallExpression":
                //console.log("execute a function with content: ", node.function.tokenLiteral)
                
                //把参数解析提前
                var args = this.interpreteExpression(node.arguments)
                if(args.length === 1 && this.isError(args[0])){
                    return args[0]
                }

                //console.log("interprete function call parameters: ")
                /*
                for(var i = 0 ; i < args.length ; i ++){
                    console.log("     " + args[i].value)
                }
                */

                //若没在符号表中找到，则调用builtins()，看看对应函数
                //是否是内嵌函数，若是，则执行并返回结果
                var functionCall = this.interprete(node.function)
                /*
                if(node.function.type === "Identifier"){
                    if(functionCall.getObInspect() === null 
                        || functionCall.value === undefined){
                            ;
                    } else{
                        console.log("variable: " + node.function.tokenLiteral)
                        console.log("its binding value is: " + functionCall.getObInspect())
                    }
                } 
                */

                if(this.isError(functionCall)){
                    return this.builtins(node.function, args)
                }

                /*
                for(var i = 0; i < args.length; i++){
                    console.log(args[i].getObInspect())
                }
                */

                //执行函数前保留当前绑定环境
                var oldEnvironment = this.environment
                //设置新的变量绑定环境
                this.environment = functionCall.environment
                /*
                //为函数调用创建新的绑定环境
                functionCall.environment = this.newEncloseEvironment(oldEnvironment)
                //设置新的变量绑定环境
                this.environment = functionCall.environment
                */
                //将输入参数名称与传入值在新环境中绑定
                for(var i = 0; i < functionCall.identifiers.length; i++){
                    var name = functionCall.identifiers[i].tokenLiteral
                    var val = args[i]
                    this.environment.setObj(name, val)
                }
                //执行函数体内代码
                var result = this.interprete(functionCall.blockStatement)
                //执行完函数后，里面恢复原有绑定环境
                this.environment = oldEnvironment
                if(result.getObType() === result.RETURN_VALUE_OBJ){
                    //console.log("function call return with: ", result.value.getObInspect())
                    return result.value
                }
                return result
            case "Integer":
                //console.log("Integer with value: ", node.value)
                props.value = node.value
                return new Integer(props)
            case "Boolean":
                //console.log("Boolean with value: ", node.value)
                props.value = node.value
                return new Boolean(props)
            case "ExpressionStatement":
                return this.interprete(node.expression)
            case "PrefixExpression":
                var right = this.interprete(node.right)
                if(this.isError(right)){
                    return right
                }

                var obj = this.interpretePrefixExpression(node, right)
                //console.log("interprete prefix expression: ", obj.getObInspect())
                return obj

            case "InfixExpression":
                var left = this.interprete(node.left)
                if(this.isError(left)){
                    return left
                }
                var right = this.interprete(node.right)
                if(this.isError(right)){
                    return right
                }
                return this.interpreteInfixExpression(node.operator, left, right, node.token.lineNumber)
            case "IfStatement":
                return this.interpreteIfExpression(node)
            case "WhileStatement":
                return this.interpreteWhileExpression(node)
            case "BlockStatement":
                return this.interpreteStatements(node)
            case "ReturnStatement":
                var props = {}
                props.value = this.interprete(node.expression)
                if(this.isError(props.value)){
                    return props.value
                }
                var obj = new ReturnValue(props)
                //console.log(obj.getObInspect())
                return obj
            default:
               return new Null({})
        }
    }

    newEncloseEvironment(outerEnv){
        var env = new Environment()
        env.outer = outerEnv
        return env
    }

    isError(obj){
        if(obj !== undefined){
            return obj.getObType() === obj.ERROR_OBJ
        }

        return false
    }

    newError(msg){
        var props = {}
        props.errMsg = msg
        return new Error(props)
    }


    //把所有子节点解释执行
    interpreteProgram(program){
        var result = null
        for(var i = 0; i < program.statements.length; i++){
            result = this.interprete(program.statements[i])
            if(result.getObType() === result.RETURN_VALUE_OBJ){
                return result.value
            }

            if(result.getObType() === result.NULL_OBJ){
                return result
            }

            if(result.getObType() === result.ERROR_OBJ){
                console.log(result.msg)
                //return result
            }
        }

        return result
    }

    interpreteExpression(exps){
        var result = []
        for(var i = 0; i < exps.length; i++){
            var evaluated = this.interprete(exps[i])
            if(this.isError(evaluated)){
                return evaluated    //错误
            }
            result[i] = evaluated
        }

        return result
    }

    interpreteIdentifier(node, env){
        /*
        if(node.tokenLiteral === "len"){
            return this.newError("")
        }
        */
        var v = node.classname
        if(v === "Token"){
            var val = env.getObj(node.literal)
            if(val === undefined){
                return this.newError("啦啦啦Error: identifier no found: " + node.literal)
            }
        }
        if(v === undefined){
            var val = env.getObj(node.tokenLiteral)
            if(val === undefined){
                return this.newError("Line "+ node.token.lineNumber + "：" +"Error: identifier no found: " + node.name)
            }
        }

        return val
    }

    interpreteArrayIndexExpression(array, index, lineCount){
        var idx = index.value
        var max = array.value.length - 1
        //判断是否越界
        if(idx < 0 || idx > max){
            return this.newError("Line "+ lineCount+ "：" + "Error: out of the array bound")
        }

        return array.value[idx]
    }

    hashable(node){
        if(node.getObType() === node.INTEGER_OBJ
            || node.getObType() === node.STRING_OBJ
            || node.getObType() === node.BOOLEAN_OBJ){
                return true
        }

        return false
    }

    interpreteHashLiteral(node){
        var props = {}
        props.key = []
        props.value = []

        for(var i = 0; i < node.keys.length; i++){
            var key_s = this.interprete(node.keys[i])
            if(this.isError(key_s)){
                return key_s
            }

            if(this.hashable(key_s) !== true){
                return this.newError("Line "+ node.token.lineNumber+ ": " + "Error: unhashable type: " + key_s.getObType())
            }

            var value_s = this.interprete(node.value[i])
            if(this.isError(value_s)){
                return value_s
            }

            props.key.push(key_s)
            props.value.push(value_s)
        }
        
        var hashObj = new Hash(props)
        //console.log("interprete hash object: ", hashObj.getObInspect())
        return hashObj
    }

    interpreteHashIndexExpression(hash, index, lineCount){
        if(!this.hashable(index)){
            return this.newError("Line "+ lineCount + ": "+ "Error: unhashable type: " + index.getObType())
        }

        for(var i = 0; i < hash.keys.length; i++){
            if(hash.keys[i].value === index.value){
                //console.log("(interprete) hash value: " , hash.value[i])
                return hash.value[i]
            }
        }

        return null
    }

    interpreteIndexExpression(left, index, lineCount){
        if(left.getObType() === left.ARRAY_OBJ && index.getObType() === index.INTEGER_OBJ){
            return this.interpreteArrayIndexExpression(left, index, lineCount)
        } 
        if(left.getObType() === left.HASH_OBJ){
            return this.interpreteHashIndexExpression(left, index, lineCount)
        } 
    }

    //取非  ！
    interpreteBangOperatorExpression(right, lineCount){
        var props = {}
        if(right.getObType() === right.BOOLEAN_OBJ){
            if(right.value === true){
                props.value = false
            } else{
                props.value = true
            }
        }

        else if(right.getObType() === right.INTEGER_OBJ){
            if(right.value === 0){
                props.value = true
            } else{
                props.value = false
            }
        }

        else if(right.getObType() === right.NULL_OBJ){
            props.value = true
        }

        else{
            return this.newError("Line " + lineCount + ": "+ "Error: unknown operator:! ")
        }
        
        return new Boolean(props)
    }

    //取相反数  -
    interpreteMinusPrefixOperatorExpression(right, lineCount){
        if(right.getObType() !== right.INTEGER_OBJ){
            return this.newError("Line " + lineCount + ": "+ "Error: unknown operator:- ")
        }

        var props = {}
        props.value = -right.value
        return new Integer(props)
    }

    isTr(condition){
        if(condition.getObType() === condition.INTEGER_OBJ){
            if(condition.value !== 0){
                return true
            }
            return false
        }

        if(condition.getObType() === condition.BOOLEAN_OBJ){
            return condition.value
        }

        if(condition.getObType() === condition.NUll){
            return false
        }

        return true
    }

    //if
    interpreteIfExpression(ifNode){
        //console.log("begin to interprete if statement")
        var condition = this.interprete(ifNode.condition)
        if(this.isError(condition)){
            return condition
        }
        if(this.isTr(condition)){
            //console.log("condition T, interprete statements in if block")
            return this.interprete(ifNode.consequence)
        } else if(ifNode.alternative !== null){
            //console.log("condition F, interprete statements in else block")
            return this.interprete(ifNode.alternative)
        } else{
            //console.log("condition F, interprete nothing!")
            return null
        }
    }

    //while
    interpreteWhileExpression(whileNode){
        //console.log("begin to interprete while statement")
        var result
        var condition = this.interprete(whileNode.condition)
        if(this.isError(condition)){
            return condition
        }
        while(this.isTr(condition)){
            //console.log("condition T")
            result = this.interprete(whileNode.consequence)
            condition = this.interprete(whileNode.condition)
            if(!this.isTr(condition)){
                return result
            }
        } 
        if(!this.isTr(condition)){
            //console.log("condition F, interprete nothing!")
            return null
        }

        
    }

    interpreteStatements(node){
        var result = null
        for(var i = 0; i < node.statements.length; i++){
            result = this.interprete(node.statements[i])
            if(result.getObType() === result.RETURN_VALUE_OBJ || result.getObType() === result.ERROR_OBJ){
                return result
            }
        }

        return result
    }

    interpreteIntegerInfixExpression(operator, left, right){
        var leftVal = left.value
        var rightVal = right.value
        var props = {}
        var resultType = "integer"

        switch(operator){
            case "+":
                props.value = leftVal + rightVal
                break;
            case "-":
                props.value = leftVal - rightVal
                break;
            case "*":
                props.value = leftVal * rightVal
                break;
            case "/":
                props.value = leftVal / rightVal
                break;
            case "==":
                resultType = "boolean"
                props.value = (leftVal === rightVal)
                break;
            case "!=":
                resultType = "boolean"
                props.value = (leftVal !== rightVal)
                break;
            case ">":
                resultType = "boolean"
                props.value = (leftVal > rightVal)
                break;
            case ">=":
                resultType = "boolean"
                props.value = (leftVal >= rightVal)
                break;
            case "<":
                resultType = "boolean"
                props.value = (leftVal < rightVal)
                break;
            case "<=":
                resultType = "boolean"
                props.value = (leftVal <= rightVal)
                break;
            default:
                return this.new("Error: unkown operator for Integer")
        }

        //console.log("interprete infix expression result is: ", props.value)
        var result = null
        if(resultType === "integer"){
            result = new Integer(props)
        } else if(resultType === "boolean"){
            result =  new Boolean(props)
        }

        return result
    }

    interpreteStringInfixExpression(operator, left, right, lineCount){
        if(operator !== "+"){
            return this.newError("Line " + lineCount + ": "
            + "Error: unknown operator for string operation")
        }

        var leftVal = left.value
        var rightVal = right.value
        var props = {}
        props.value = leftVal + rightVal
        //console.log("result of string add is: ", props.value)
        return new String(props)
    }

    //infix
    interpreteInfixExpression(operator, left, right, lineCount){
        if(left.getObType() !== right.getObType()){
            return this.newError("Line " + lineCount + ": "
            + "Error: type unmatched: " + left.getObType() 
            + " and " + right.getObType())
        }
        if(left.getObType() === left.INTEGER_OBJ && right.getObType() === right.INTEGER_OBJ){
            return this.interpreteIntegerInfixExpression(operator, left, right)
        }
        //字符串连接操作  +
        if(left.getObType() === left.STRING_OBJ && right.getObType() === right.STRING_OBJ){
            return this.interpreteStringInfixExpression(operator, left, right, lineCount)
        }

        var props = {}
        if(operator === '=='){
            props.value = (left.value === right.value)
            //console.log("result on boolean operation of " + operator + " is " + props.value)
            return new Boolean(props)
        } else if(operator === '!='){
            props.value = (left.value !== right.value)
            //console.log("result on boolean operation of "+ operator+ " is " + props.value)
            return new Boolean(props)
        }

        return this.newError("Line " + lineCount + ": "
        + "Error: unknown operator: " + operator)
    }

    //prefix
    interpretePrefixExpression(node, right){
        switch(node.operator){
            case "!":
                return this.interpreteBangOperatorExpression(right, node.token.lineNumber)
            case "-":
                return this.interpreteMinusPrefixOperatorExpression(right, node.token.lineNumber)
            default:
                return this.newError("Line "+ node.token.lineNumber+ ": "
                + "Error: Unknown operator: ", node.operator, right.getObType())
        }
    }

    //内嵌API的实现
    builtins(func, args){
        switch(func.tokenLiteral){
            //获取字符串、数组或链表长度
            case "len":
                if(args.length !== 1){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    +"Error: function len should have 1 parameter")
                }
                switch(args[0].getObType()){
                    case args[0].STRING_OBJ:
                        var props = {}
                        props.value = args[0].value.length
                        var obj = new Integer(props)
                        //console.log("length of string is : ", obj.getObInspect())
                        return obj
                    case args[0].ARRAY_OBJ:
                        var props = {}
                        props.value = args[0].value.length
                        //console.log("length of array is: " + args[0].getObInspect() + " is " + props.value)
                        return new Integer(props)
                }
            case "first":
                if(args.length !== 1){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: function len should have 1 parameter")
                }
                if(args[0].getObType() !== args[0].ARRAY_OBJ){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: arguments of function first must be ARRAY")
                }
                if(args[0].value.length > 0){
                    //console.log("the first element of array is: ", args[0].value[0].getObInspect())
                    return args[0].value[0]
                }
                return null
            case "rest":
                if(args.length !== 1){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: function len should have 1 parameter")
                }
                if(args[0].getObType() !== args[0].ARRAY_OBJ){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: arguments of rest must be ARRAY")
                }
                if(args[0].value.length > 1){
                    var props = {}
                    //去掉第一个元素
                    props.value = args[0].value.slice(1)
                    var obj = new Array(props)
                    //console.log("rest return: ", obj.getObInspect())
                    return obj
                }
                return null
            case "append":
                //将新元素添加到给定数组末尾，但它不改变原数组，
                //而是构造新的数组
                if(args.length !== 2){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: function len should have 2 parameters")
                }
                if(args[0].getObType() !== args[0].ARRAY_OBJ){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: the first argument of append must be ARRAY")
                }
                var props = {}
                props.value = args[0].value.slice(0)

                if(args[1].getObType() !== props.value[0].getObType()){
                    return this.newError("Line "+ func.token.lineNumber + ": "
                    + "Error: same type is wanted when calling function append: " 
                    + props.value[0].getObType())
                }

                props.value.push(args[1])
                var obj = new Array(props)
                //console.log("new array after calling append is: ", obj.getObInspect())
                return obj
            case "print":
                for(var i = 0; i < args.length ; i ++){
                    switch(args[i].getObType()){
                        case args[0].INTEGER_OBJ:
                            //var props = {}
                            //props.value = args[i].value
                            console.log(args[i].value)
                            break;
                        case args[0].BOOLEAN_OBJ:
                            console.log(args[i].value)
                            break;
                        case args[0].STRING_OBJ:
                            console.log(args[i].value)
                            break;
                        case args[0].ARRAY_OBJ:
                            var s = "[ "
                            for(var j = 0; j < args[i].value.length; j++){
                                s += args[i].value[j].value
                                if(i < args[i].value.length -1){
                                    s += ","
                                }
                            }
                            s += " ]"
                            console.log(s)
                            break;
                        case args[0].HASH_OBJ:
                            var s = "{"
                            for(var j = 0; j < args[i].keys.length - 1; j++){
                                s += args[i].keys[j].value + ": " + args[i].value[j].value + ", "
                                //s += ", "
                                //s += args[i].value[j].value
                                //s +=  ", "
                            }
                            s += args[i].keys[j].value + ": " + args[i].value[j].value + " }"
                            console.log(s)
                            break;
                        case args[0].NULL_OBJ:
                            console.log(args[i].value)
                            break;
                        case args[0].ERROR_OBJ:
                            console.log(args[i].value)
                            break;
                        default:
                            break;
                    }
                }
                props = {}
                return new Output(props)
            default:
                return this.newError("Line "+ func.token.lineNumber + ": "
                + "Error: unknown function call")
        }
        //return this.newError("Error: unknown function call")
    }

    
}

export default Interpreter