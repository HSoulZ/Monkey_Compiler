class Node{
    constructor(props){
        this.tokenLiteral = ""
        this.type = ""
    }
    getLiteral(){
        return this.tokenLiteral
    }
}

class Statement extends Node{
    constructor(props){
        super(props)
        this.type = "Statement"
        this.expression = props.expression
        this.token = props.token
        return this
    }
}

class Expression extends Node{
    constructor(props){
        super(props)
        this.type = "Expression"
        this.token = props.token
        this.tokenLiteral = props.token.getLiteral()
    }
}

class Identifier extends Expression{
    constructor(props){
        super(props)
        this.value = ""
        this.type = "Identifier"
    }
}

class Variable extends Expression{
    constructor(props){
        super(props)
        this.value = props.value
        this.type = "Variable"
    }
}

class IntegerLiteral extends Variable{
    constructor(props){
        super(props)
        this.type = "Integer"

        //var s = "int " + this.token.getLiteral()
        //this.tokenLiteral = s
        this.tokenLiteral = this.token.getLiteral()
    }
}

class Boolean extends Variable{
    constructor(props){
        super(props)
        this.type = "Boolean"
        var s = "Boolean token with value of " + this.value
        this.tokenLiteral = s
    }
}

class StringLiteral extends Variable{
    constructor(props){
        super(props)
        this.type = "String"
        this.tokenLiteral = this.token.getLiteral()
    }
}

class ArrayLiteral extends Variable{
    constructor(props){
        super(props)
        this.type = "ArrayLiteral"
    }

    getLiteral(){
        var str = "(array) [ "
        for(var i = 0; i < this.value.length; i++){
            str += this.value[i].getLiteral()
            if(i < this.value.length - 1){
                str += ","
            }
        }

        str += " ]"

        this.tokenLiteral = str
        return this.tokenLiteral
    }
}

class HashLiteral extends Variable{
    constructor(props){
        super(props)
        //this.token = props.token    //'{'
        this.keys = props.keys
        this.type = "HashLiteral"
    }

    getLiteral(){
        var s = "{"
        for(var i = 0; i < this.keys.length; i++){
            s += this.keys[i].getLiteral()
            s += ":"
            s += this.value[i].getLiteral()
            if(i < this.keys.length -1){
                s += ","
            }
        }

        s += "}"
        this.tokenLiteral = s
        return s
    }
}



//下标访问  <expression>[<expression>]
//将arr[0]当作一个中序表达式对待，故在中序解析表中添加解析函数
class IndexExpression extends Expression{
    constructor(props){
        super(props)
        //left 是[前面的表达式---可以是变量名，数组，函数调用
        this.left = props.left
        //index 可以数字常量，变量，函数调用
        this.index = props.index
        this.tokenLiteral = "([ " + this.left.getLiteral() + "] [" + this.index.getLiteral() + " ])"
        this.type = "IndexExpression"
    }
}

class ArithmeticalExpression extends Expression{
    constructor(props){
        super(props)
        this.type = "ArithExpression"
        this.operator = props.operator
        this.right = props.rightExpression

        var s = "(" + this.operator + this.right.getLiteral() + ")"
        this.tokenLiteral = s

        //console.log(s)
    }
}
//前序表达式
class PrefixExpression extends ArithmeticalExpression{
    constructor(props){
        super(props)
        this.type = "PrefixExpression"

        var s = "(" + this.operator + this.right.getLiteral() + ")"
        this.tokenLiteral = s

        //console.log(s)
    }
}

//中序表达式
class InfixExpression extends ArithmeticalExpression{
    constructor(props){
        super(props)
        this.type = "InfixExpression"
        this.left = props.leftExpression

        var s = "(" + this.left.getLiteral() + " " + this.operator + this.right.getLiteral() + ")"
        this.tokenLiteral = s

        //console.log(s)
    }
}

//while
class WhileExpression extends Expression{
    constructor(props){
        super(props)
        this.type = "WhileStatement"
        this.condition = props.condition
        this.consequence = props.consequence

        var s = "while expression with condiion: " + this.condition.getLiteral()
        s += "\n statements in block are: "
        s += this.consequence.getLiteral()

        this.tokenLiteral = s
        //console.log(s)
    }
}

//if
class IfExpression extends WhileExpression{
    constructor(props){
        super(props)
        this.type = "IfStatement"
        //this.token = props.token
        //this.condition = props.condition
        //this.consequence = props.consequence
        this.alternative = props.alternative

        var s = "If expression:\n    condition: " + this.condition.getLiteral()
        s += "\n    statements in if block:\n  "
        //consequence 为if条件成立所执行的语句集合
        s += this.consequence.getLiteral()
        //alternative 表示else部分的语句集合
        if(this.alternative){
            s += "\n statements in else block:\n  "
            s += this.alternative.getLiteral()
        }
        this.tokenLiteral = s

        //console.log(s)
    }
}

//function
class FunctionLiteral extends Expression{
    constructor(props){
        super(props)
        this.type = "FunctionLiteral"
        this.parameters = props.parameters
        this.body = props.body

        var s = "Function:\n "
        s += " input parameters: ( "
        for(var i = 0; i < this.parameters.length; i++){
            s += this.parameters[i].getLiteral()
            if(i < this.parameters.length -1){
                s += ","
            }
        }
        s += " )\n "
        s += " statements in function body: { \n   "
        s += this.body.getLiteral()
        s += " }"
        
        this.tokenLiteral = s
        //console.log(s)
    }
}

//call
class CallExpression extends Expression{
    constructor(props){
        super(props)
        this.type = "CallExpression"
        this.function = props.function
        this.arguments = props.arguments

        var s = "Function call: " + this.function.getLiteral()
        s += "\n      parameters: ( "
        for(var i = 0; i < this.arguments.length; i++){
            s += this.arguments[i].getLiteral()
            if(i < this.arguments.length-1){
                s += ","
            }
        }
        s += ")"
        this.tokenLiteral = s
        //console.log(s)
    }
}
//算数表达式
class ExpressionStatement extends Statement{
    constructor(props){
        super(props)
        this.type = "ExpressionStatement"
        //this.expression = props.expression
        var s = "Expression: " + this.expression.getLiteral()
        this.tokenLiteral = s
        //console.log(s)
    }
}

//let
class LetStatement extends Statement{
    constructor(props){
        super(props)
        this.type = "LetStatement"
        this.name = props.identifier
        
        var s = "Let Statement:\n left is an identifier: "
        s += props.identifier.getLiteral()
        s += "\n right is: "
        s += this.expression.getLiteral()
        this.tokenLiteral = s
        //console.log("(parser)" + s)
    }
}

//赋值
class LetStatement_N extends LetStatement{
    constructor(props){
        super(props)
        this.type = "Statement_N"

        var s = "Assign Statement, left is an identifier:"
        s += props.identifier.getLiteral()
        s += " right is "
        s += this.expression.getLiteral()
        this.tokenLiteral = s
        //console.log(s)
    }
}

//return
class ReturnStatement extends Statement{
    constructor(props){
        super(props)
        this.type = "ReturnStatement"
        //this.expression = props.expression
        var s = "return with " + this.expression.getLiteral()
        this.tokenLiteral = s
        //console.log(s)
    }
}

//语句块(大括号内)
class BlockStatement extends Statement{
    constructor(props){
        super(props)
        this.statements = props.statements

        var s = ""
        for(var i = 0; i < this.statements.length; i++){
            s += this.statements[i].getLiteral()
            s += "\n"
        }

        this.tokenLiteral = s

        this.type = "BlockStatement"
        //console.log(s)
    }
}

class Program{
    constructor(){
        this.statements = []    //存储所有代码语句（statement）
        this.type = "program"
    }

    getLiteral(){
        if(this.statements.length > 0){
            return this.statements[0].tokenLiteral()
        } else{
            return ""
        }
    }
}

class Parser{
    constructor(lexer){
        this.lexer = lexer
        this.lexer.lexing()
        this.tokenPos = 0
        this.curToken = null
        this.peekToken = null
        this.nextToken()
        this.nextToken()
        this.program = new Program()

        //解析函数表prefixParsFns，当解析器遇到某类token时，就根据token表
        //里拿出一个解析函数，执行这个函数就能实现对当前token的解析
        //优先级，数字越大优先级越高
        this.LOWEST = 0
        this.EQUALS = 1         // ==
        this.LESSGREATER = 2    // <  or >
        this.SUM = 3        //+ or -
        this.PRODUCT = 4    //* or /
        this.PREFIX = 5     //-X or !X
        this.CALL = 6       //myFunction(X)
        this.INDEX = 7      //下标索引

        this.prefixParseFns = {}
        this.prefixParseFns[this.lexer.IDENTIFIER] = this.parseIdentifier
        this.prefixParseFns[this.lexer.INTEGER] = this.parseIntegerLiteral
        this.prefixParseFns[this.lexer.STRING] = this.parseStringLiteral
        //前序(!和-)
        this.prefixParseFns[this.lexer.BANG_SIGN] = this.parsePrefixExpression
        this.prefixParseFns[this.lexer.MINUS_SIGN] = this.parsePrefixExpression
        //true flase
        this.prefixParseFns[this.lexer.TRUE] = this.parseBoolean
        this.prefixParseFns[this.lexer.FALSE] = this.parseBoolean
        //(  if   fn
        this.prefixParseFns[this.lexer.LEFT_PARENT] = this.parseGroupExpression
        this.prefixParseFns[this.lexer.IF] = this.parseIfExpression
        this.prefixParseFns[this.lexer.WHILE] = this.parseWhileExpression
        this.prefixParseFns[this.lexer.FUNCTION] = this.parseFunctionLiteral
        //[: 数组
        this.prefixParseFns[this.lexer.LEFT_BRACKET] = this.parseArrayLiteral
        //{: Map
        this.prefixParseFns[this.lexer.LEFT_BRACE] = this.parseHashLiteral

        //中序
        this.initPrecedencesMap()
        this.registerInfixMap()
    }

    //优先级表初始化
    initPrecedencesMap(){
        this.precedencesMap = {}
        this.precedencesMap[this.lexer.EQ] = this.EQUALS
        this.precedencesMap[this.lexer.NOT_EQ] = this.EQUALS
        this.precedencesMap[this.lexer.LT] = this.LESSGREATER
        this.precedencesMap[this.lexer.GT] = this.LESSGREATER
        this.precedencesMap[this.lexer.NLT] = this.LESSGREATER
        this.precedencesMap[this.lexer.NGT] = this.LESSGREATER
        this.precedencesMap[this.lexer.PLUS_SIGN] = this.SUM
        this.precedencesMap[this.lexer.MINUS_SIGN] = this.SUM
        this.precedencesMap[this.lexer.SLASH] = this.PRODUCT
        this.precedencesMap[this.lexer.ASTERISK] = this.PRODUCT
        this.precedencesMap[this.lexer.LEFT_PARENT] = this.CALL
        this.precedencesMap[this.lexer.LEFT_BRACKET] = this.INDEX
        this.precedencesMap[this.lexer.LEFT_BRACE] = this.LOWEST
    }

    //中序  函数列表
    registerInfixMap(){
        this.infixParseFns = {}
        this.infixParseFns[this.lexer.PLUS_SIGN] = this.parseInfixExpression
        this.infixParseFns[this.lexer.MINUS_SIGN] = this.parseInfixExpression
        this.infixParseFns[this.lexer.SLASH] = this.parseInfixExpression
        this.infixParseFns[this.lexer.ASTERISK] = this.parseInfixExpression
        this.infixParseFns[this.lexer.EQ] = this.parseInfixExpression
        this.infixParseFns[this.lexer.NOT_EQ] = this.parseInfixExpression
        this.infixParseFns[this.lexer.LT] = this.parseInfixExpression
        this.infixParseFns[this.lexer.GT] = this.parseInfixExpression
        this.infixParseFns[this.lexer.NLT] = this.parseInfixExpression
        this.infixParseFns[this.lexer.NGT] = this.parseInfixExpression

        //(
        this.infixParseFns[this.lexer.LEFT_PARENT] = this.parseCallExpression
        //[
        this.infixParseFns[this.lexer.LEFT_BRACKET] = this.parseIndexExpression
    }

    nextToken(){
        //一次读入2个token
        this.curToken = this.peekToken
        this.peekToken = this.lexer.tokens[this.tokenPos]
        this.tokenPos++
    }

    curTokenIs(tokenType){  //当前currtoken类型和传进来的是否相同
        return this.curToken.getType() === tokenType
    }

    peekTokenIs(tokenType){ 
        return this.peekToken.getType() === tokenType
    }
    
    //获取优先级
    peekPriority(){
        var p = this.precedencesMap[this.peekToken.getType()]
        if(p !== undefined){
            return p
        }
        return this.LOWEST
    }

    //获取优先级
    curPriority(){
        var p = this.precedencesMap[this.curToken.getType()]
        if(p !== undefined){
            return p
        }
        return this.LOWEST
    }

    peekError(type){
        var s = "Error: " + this.lexer.getLiteralByTokenType(type) + " is wanted"
        return s
    }

    expectPeek(tokenType){  //peekToken是否与指定类型相同
        if(this.peekTokenIs(tokenType)){
            this.nextToken()
            return true
        } else{
            if(this.curToken.literal === "let" ||this.curToken.literal === "if" 
                ||this.curToken.literal === "else" ||this.curToken.literal === "fn"
                ||this.curToken.literal === "true" ||this.curToken.literal === "false"
                ||this.curToken.literal === "return" ||this.curToken.literal === "while"){
                    console.log("Line " + this.peekToken.lineNumber +": " + this.peekError(tokenType))
                } else{
                    console.log("Line " + this.curToken.lineNumber +": " + this.peekError(tokenType))
                }
            return false
        }
    }

    createIdentifier(){
        var identProps = {}
        identProps.token = this.curToken
        identProps.value = this.curToken.getLiteral()
        return new Identifier(identProps)
    }

    parseIdentifier(caller){
        return caller.createIdentifier()
    }

    parseIntegerLiteral(caller){
        var intProps = {}
        intProps.token = caller.curToken
        intProps.value = parseInt(caller.curToken.getLiteral())
        if(isNaN(intProps.value)){
            console.log("could not parse token as integer")
            return null
        }
        return new IntegerLiteral(intProps)
    }

    parseBoolean(caller){
        var props = {}
        props.token = caller.curToken
        props.value = caller.curTokenIs(caller.lexer.TRUE)

        return new Boolean(props)
    }

    parseStringLiteral(caller){
        var props = {}
        props.token = caller.curToken
        props.value = caller.curToken.getLiteral()
        return new StringLiteral(props)
    }
    
    parseExpressionList(end){
        var list = []
        if(this.peekTokenIs(end)){
            this.nextToken()
            return list
        }

        this.nextToken()
        list.push(this.parseExpression(this.LOWEST))
        while(this.peekTokenIs(this.lexer.COMMA)){
            this.nextToken()
            this.nextToken()//越过COMMA
            list.push(this.parseExpression(this.LOWEST))
        }

        if(!this.expectPeek(end)){
            //return null
            return list
        }

        return list
    }

    parseArrayLiteral(caller){
        var props = {}
        props.token = caller.curToken
        props.value = caller.parseExpressionList(caller.lexer.RIGHT_BRACKET)
        var obj = new ArrayLiteral(props)
        //console.log("Parsing array result: " + obj.getLiteral())
        return obj
    }

    parseHashLiteral(caller){
        var props = {}
        props.token = caller.curToken
        props.keys = []
        props.value = []
        while(caller.peekTokenIs(caller.lexer.RIGHT_BRACE) !== true){
            caller.nextToken()
            //<expression>:<expression>左边
            var key = caller.parseExpression(caller.LOWEST)
            //:  越过
            if(!caller.expectPeek(caller.lexer.COLON)){
                return null
            }

            caller.nextToken()
            //<expression>:<expression>右边
            var value_s = caller.parseExpression(caller.LOWEST)
            props.keys.push(key)
            props.value.push(value_s)
            //,  或者  }
            if(!caller.peekTokenIs(caller.lexer.RIGHT_BRACE) 
                && !caller.expectPeek(caller.lexer.COMMA)){
                    return null
            }
        }

        //}  结束
        if(!caller.expectPeek(caller.lexer.RIGHT_BRACE)){
            return null
        }
        var obj = new HashLiteral(props)
        //console.log("parsing map obj: ", obj.getLiteral())
        return obj
    }

    parseExpression(priority){
        var prefix = this.prefixParseFns[this.curToken.getType()]
        if(prefix === null){
            console.log("no parsing function for token " + this.curToken.getLiteral())
            return null
        }

        //前序
        var leftExp = prefix(this)
        //中序,下一个是不是分号，下一个运算符是否比当前运算符优先级高
        while(this.peekTokenIs(this.lexer.SEMICOLON) !== true &&
            priority < this.peekPriority()){
                var infix = this.infixParseFns[this.peekToken.getType()]
                if(infix === null){
                    return leftExp
                }

                this.nextToken()
                leftExp = infix(this, leftExp)
        }
            
        return leftExp
    }

    parseIndexExpression(caller,left){
        var props = {}
        props.token = caller.curToken
        props.left = left
        caller.nextToken()
        props.index = caller.parseExpression(caller.LOWEST)
        if(!caller.expectPeek(caller.lexer.RIGHT_BRACKET)){
            return null //错误
        }

        var obj = new IndexExpression(props)
        //console.log("array indexing: ", obj.getLiteral())
        return new IndexExpression(props)
    }

    //前序
    parsePrefixExpression(caller){
        var props = {}
        props.token = caller.curToken
        props.operator = caller.curToken.getLiteral()
        caller.nextToken()
        props.rightExpression = caller.parseExpression(caller.PREFIX)

        return new PrefixExpression(props)
    }

    //中序
    parseInfixExpression(caller, left){
        var props = {}
        props.leftExpression = left
        props.token = caller.curToken
        props.operator = caller.curToken.getLiteral()

        var priority = caller.curPriority()
        caller.nextToken()
        props.rightExpression = caller.parseExpression(priority)

        return new InfixExpression(props)
    }

    //()
    parseGroupExpression(caller){
        caller.nextToken()
        var exp = caller.parseExpression(caller.LOWEST)
        if(caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true){
            return null
        }
        return exp
    }

    //if
    parseIfExpression(caller){
        var props = {}
        props.token = caller.curToken
        if(caller.expectPeek(caller.lexer.LEFT_PARENT) !== true){
            return null
        }

        caller.nextToken()
        props.condition = caller.parseExpression(caller.LOWEST)

        if(caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true){
            return null
        }

        if(caller.expectPeek(caller.lexer.LEFT_BRACE) !== true){
            return null
        }

        props.consequence = caller.parseBlockStatement(caller)

        if(caller.peekTokenIs(caller.lexer.ELSE) === true){
            caller.nextToken()
            if(caller.expectPeek(caller.lexer.LEFT_BRACE) !== true){
                return null
            }

            props.alternative = caller.parseBlockStatement(caller)
        }

        return new IfExpression(props)
    }

    //while
    parseWhileExpression(caller){
        var props = {}
        props.token = caller.curToken
        if(caller.expectPeek(caller.lexer.LEFT_PARENT) !== true){
            return null
        }

        caller.nextToken()
        props.condition = caller.parseExpression(caller.LOWEST)

        if(caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true){
            return null
        }

        if(caller.expectPeek(caller.lexer.LEFT_BRACE) !== true){
            return null
        }

        props.consequence = caller.parseBlockStatement(caller)

        return new WhileExpression(props)
    }

    parseCallArguments(caller){
        var args = []
        if(caller.peekTokenIs(caller.lexer.RIGHT_PARENT)){
            caller.nextToken()
            return args
        }
        caller.nextToken()
        //var identProp = {}
        //identProp.token = caller.curToken
        //args.push(new Identifier(identProp))
        args.push(caller.parseExpression(caller.LOWEST))

        while(caller.peekTokenIs(caller.lexer.COMMA)){
            caller.nextToken()
            caller.nextToken()
            //var ident = {}
            //ident.token = caller.curToken
            //args.push(new Identifier(ident))
            args.push(caller.parseExpression(caller.LOWEST))
        }

        if(caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true){
            return null
        }

        return args
    }

    parseCallExpression(caller, func){
        var props = {}
        props.token = caller.curToken
        props.function = func
        props.arguments = caller.parseCallArguments(caller)

        return new CallExpression(props)
    }

    //let
    parseLetStatement(){
        var props = {}
        props.token = this.curToken
        //expectPeek会调用nextToken将curToken转换为下一个token
        if(!this.expectPeek(this.lexer.IDENTIFIER)){
            return null
        }
        
        props.identifier = this.createIdentifier()

        if(!this.expectPeek(this.lexer.ASSIGN_SIGN)){
            return null
        }

        //是整形则构造expression类，把整形对应的token传入
        var exprProps = {}
        exprProps.token = this.curToken
        this.nextToken()
        props.expression = this.parseExpression(this.LOWEST)
        
        if(!this.expectPeek(this.lexer.SEMICOLON)){
            return null
        }
        return new LetStatement(props)
    }

    //赋值  不包括声明
    parseLetStatement_N(){
        var props = {}
        props.token = this.curToken
        
        props.identifier = this.createIdentifier()

        if(!this.expectPeek(this.lexer.ASSIGN_SIGN)){
            return null
        }

        //是整形则构造expression类，把整形对应的token传入
        var exprProps = {}
        exprProps.token = this.curToken
        this.nextToken()
        props.expression = this.parseExpression(this.LOWEST)
        
        if(!this.expectPeek(this.lexer.SEMICOLON)){
            return null
        }
        return new LetStatement_N(props)
    }

    //return
    parseReturnStatement(){
        var props = {}
        props.token = this.curToken

        var exprProps = {}
        exprProps.token = this.curToken
        this.nextToken()
        props.expression = this.parseExpression(this.LOWEST)

        //暂时只返回整形数字
        if(!this.expectPeek(this.lexer.SEMICOLON)){
            return null
        }

        return new ReturnStatement(props)
    }

    parseBlockStatement(caller){
        var props = {}
        props.token = caller.curToken
        props.statements = []
    /*
        caller.nextToken()
        while(caller.curTokenIs(caller.lexer.RIGHT_BRACE) !== true){
            var stmt = caller.parseStatement()
            if(stmt !== null){
                props.statements.push(stmt)
            }
            caller.nextToken()
        }
        */
        while(caller.peekTokenIs(caller.lexer.RIGHT_BRACE) !== true){
            caller.nextToken()
            var stmt = caller.parseStatement()
            if(stmt !== null){
                props.statements.push(stmt)
            }
        }

        if(!caller.expectPeek(caller.lexer.RIGHT_BRACE)){
            return null
        }


        return new BlockStatement(props)
    }

    parseFunctionParameters(caller){
        var parameters = []
        if(caller.peekTokenIs(caller.lexer.RIGHT_PARENT)){
            caller.nextToken()
            return parameters
        }

        caller.nextToken()
        var identProp = {}
        identProp.token = caller.curToken
        parameters.push(new Identifier(identProp))

        while(caller.peekTokenIs(caller.lexer.COMMA)){
            caller.nextToken()
            caller.nextToken()
            var ident = {}
            ident.token = caller.curToken
            parameters.push(new Identifier(ident))
        }

        if(caller.expectPeek(caller.lexer.RIGHT_PARENT) !== true){
            return null
        }

        return parameters
    }

    parseFunctionLiteral(caller){
        var props = {}
        props.token = caller.curToken

        if(caller.expectPeek(caller.lexer.LEFT_PARENT) !== true){
            return null
        }

        props.parameters = caller.parseFunctionParameters(caller)

        if(caller.expectPeek(caller.lexer.LEFT_BRACE) !== true){
            return null
        }

        props.body = caller.parseBlockStatement(caller)

        return new FunctionLiteral(props)
    }

    //表达式
    parseExpressionStatement(){
        var props = {}
        props.token = this.curToken
        props.expression = this.parseExpression(this.LOWEST)
        
        var stmt = new ExpressionStatement(props)

        if(this.peekTokenIs(this.lexer.SEMICOLON)){
            //如果表达式后面跟";"，忽略
            this.nextToken()
        }

        return stmt
    }

    parseStatement(){
        switch(this.curToken.getType()){
            case this.lexer.RETURN:
                return this.parseReturnStatement();
            case this.lexer.LET:
                return this.parseLetStatement();
            case this.lexer.IDENTIFIER:
                if(this.peekToken.getType() === this.lexer.ASSIGN_SIGN){
                    return this.parseLetStatement_N();
                }
            default:
                return this.parseExpressionStatement()
        }
    }

    //语法分析入口
    parseProgram(){//不是结尾则读入第一个token
        while(this.curToken.getType() !== this.lexer.EOF){
            var stmt = this.parseStatement()
            if(stmt !== null){
                //console.log(stmt.tokenLiteral)
                this.program.statements.push(stmt)
            }
            /*
            if(stmt === null){
                return null
            }
            */
            this.nextToken()
        }
        return this.program
    }
    
}

export default Parser