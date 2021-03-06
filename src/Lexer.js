class Token {
	constructor(type, literal, lineNumber) {
        this.tokenType = type
        this.literal = literal
		this.lineNumber = lineNumber  
		this.classname = "Token"  
	}

	getType() {
        return this.tokenType
	}

	getLiteral() {
        return this.literal
	}

	getLineNumber() {
		return this.lineNumber
	}

};

class Lexer {

	constructor(sourceCode) {
		this.initTokenType()
		this.initKeywords()
		this.sourceCode = sourceCode
		this.position = 0
		this.readPosition = 0
		this.lineCount = 0
		this.ch = ''
		this.tokens = []

		this.observer = null
		this.observerContext = null
	}

	initTokenType() {
        this.ILLEGAL = -2
	    this.EOF = -1
	    this.LET = 0
		this.IDENTIFIER = 1
		
		this.ASSIGN_SIGN = 2
		
		this.PLUS_SIGN = 3
		this.MINUS_SIGN = 4
		this.ASTERISK = 5
		this.SLASH = 6
		this.BANG_SIGN = 7

		this.INTEGER = 8
		this.STRING = 9
		this.TRUE = 10
		this.FALSE = 11

		this.EQ = 12
		this.NOT_EQ = 13

		this.COLON = 14
		this.COMMA = 15
		this.SEMICOLON = 16
		
		this.LT = 17
		this.GT = 18
		this.NGT = 19
		this.NLT = 20

		this.FUNCTION = 21
		this.RETURN = 22

		//{}
		this.LEFT_BRACE = 23
		this.RIGHT_BRACE = 24
		//()
		this.LEFT_PARENT = 25
		this.RIGHT_PARENT = 26
		//[ ]
		this.LEFT_BRACKET = 27
		this.RIGHT_BRACKET = 28

		this.IF = 29
		this.ELSE = 30
		this.WHILE = 31


	}

	getLiteralByTokenType(type){
		switch(type){
			case this.EOF:
				return "end of Code"
			case this.LET:
				return "let"
			case this.IDENTIFIER:
				return "identifier"
			case this.ASSIGN_SIGN:
				return "assign sign"
			case this.PLUS_SIGN:
				return "plus sign"
			case this.INTEGER:
				return "integer"
			case this.FLOAT:
				return "float"
			case this.SEMICOLON:
				return "semicolon"
			case this.IF:
				return "if"
			case this.ELSE:
				return "else"
			case this.MINUS_SIGN:
				return "minus sign"
			case this.BANG_SIGN:
				return "!"
			case this.ASTERISK:
				return "*"
			case this.SLASH:
				return "slash"
			case this.LT:
				return "<"
			case this.NGT:
				return "<="
			case this.GT:
				return ">"
			case this.NLT:
				return ">="
			case this.COMMA:
				return ","
			case this.FUNCTION:
				return "fun"
			case this.TRUE:
				return "true"
			case this.FALSE:
				return "false"
			case this.RETURN:
				return "return"
			case this.LEFT_BRACE:
				return "{"
			case this.RIGHT_BRACE:
				return "}"
			case this.EQ:
				return "=="
			case this.NOT_EQ:
				return "!="
			case this.LEFT_PARENT:
				return "("
			case this.RIGHT_PARENT:
				return ")"
			case this.LEFT_BRACKET:
				return "["
			case this.RIGHT_BRACKET:
				return "]"
			case this.COLON:
				return ":"
			default:
				return "unknown token"
		}
	}

	initKeywords(){
		this.keyWordMap = [];
		this.keyWordMap["let"] = new Token(this.LET, "let", 0)
		this.keyWordMap["if"] = new Token(this.IF, "if", 0)
		this.keyWordMap["else"] = new Token(this.ELSE, "else", 0)
		this.keyWordMap["fn"] = new Token(this.FUNCTION, "fn", 0)
		this.keyWordMap["true"] = new Token(this.TRUE, "true", 0)
		this.keyWordMap["false"] = new Token(this.FALSE, "false", 0)
		this.keyWordMap["return"] = new Token(this.RETURN, "return", 0)
		this.keyWordMap["while"] = new Token(this.WHILE, "while", 0)
	}

	setLexingObserver(o, context){
		if(o !== null && o !== undefined){
			this.observer = o
			this.observerContext = context
		}
	}

	getKeyWords(){
		return this.keyWordMap
	}

	readChar() {
        if (this.readPosition >= this.sourceCode.length) {
        	this.ch = -1
        } else {
        	this.ch = this.sourceCode[this.readPosition]
        }

        this.readPosition++
	}

	peekChar(){
		if(this.readPosition >= this.sourceCode.length){
			return 0
		} else{
			return this.sourceCode[this.readPosition]
		}
	}

	skipWhiteSpaceAndNewLine() {
		//忽略空格
		while (this.ch === ' ' || this.ch === '\t' 
		|| this.ch === '\u00a0'|| this.ch === '\n') 
		{
		    if (this.ch === '\t' || this.ch === '\n') {
		    	this.lineCount++;
		    }
		    this.readChar()
		}
	}

	nextToken () {
		var tok
		this.skipWhiteSpaceAndNewLine() 
		var lineCount = this.lineCount

		var needReadChar = true;
		this.position = this.readPosition

		switch (this.ch) {
			case '=':
				if(this.peekChar() === '='){
					this.readChar()
					tok = new Token(this.EQ, "==", lineCount)
				} else{
					tok = new Token(this.ASSIGN_SIGN, "=", lineCount)
				}
				break
			case ';':
				tok = new Token(this.SEMICOLON, ";", lineCount)
				break;
			case '+':
				tok = new Token(this.PLUS_SIGN, "+", lineCount)
				break;
			case -1:
				tok = new Token(this.EOF, "", lineCount)
				break;
			case '-':
				tok = new Token(this.MINUS_SIGN, "-", lineCount)
				break;
			case '!':
				if(this.peekChar() === '='){
					this.readChar()
					tok = new Token(this.NOT_EQ, "!=", lineCount)
				} else{
					tok = new Token(this.BANG_SIGN, "!", lineCount)
				}
				break;
			case '*':
				tok = new Token(this.ASTERISK, "*", lineCount)
				break;
			case '/':
				tok = new Token(this.SLASH, "/", lineCount)
				break;
			case '<':
				if(this.peekChar() === '='){
					this.readChar()
					tok = new Token(this.NGT, "<=", lineCount)
				} else{
					tok = new Token(this.LT, "<", lineCount)
				}
				break;
			case '>':
				if(this.peekChar() === '='){
					this.readChar()
					tok = new Token(this.NLT, ">=", lineCount)
				} else{
					tok = new Token(this.GT, ">", lineCount)
				}
				break;
			case ',':
				tok = new Token(this.COMMA, ",", lineCount)
				break;
			case '{':
				tok = new Token(this.LEFT_BRACE, "{", lineCount)
				break;
			case '}':
				tok = new Token(this.RIGHT_BRACE, "}", lineCount)
				break;
			case '(':
				tok = new Token(this.LEFT_PARENT, "(", lineCount)
				break;
			case ')':
				tok = new Token(this.RIGHT_PARENT, ")", lineCount)
				break;
			case '[':
				tok = new Token(this.LEFT_BRACKET, "[", lineCount)
				break;
			case ']':
				tok = new Token(this.RIGHT_BRACKET, "]", lineCount)
				break;
			case '"':
				var str = this.readString()
				if(str === undefined){
					tok = new Token(this.ILLEGAL, undefined, lineCount)
				} else{
					tok = new Token(this.STRING, str, lineCount)
				}
				break;
			case ":":
				tok = new Token(this.COLON, ":", lineCount)
				break;
			default:
			var res = this.readIdentifier()
			if (res !== false) {
				if(this.keyWordMap[res] !== undefined){
					tok = this.keyWordMap[res]
					//tok.lineNumber = lineCount
				} else{
					tok = new Token(this.IDENTIFIER, res, lineCount)
				}
			} else {
				res = this.readNumber()
				if (res !== false) {
					tok = new Token(this.INTEGER, res, lineCount)
				} else{/*
					res = this.readNumber()
					if(res !== false){
						tok = new Token(this.Float, res, lineCount)
					} else{*/
						tok = undefined
				}
				
			}

			needReadChar = false;

		}

		if(needReadChar === true){
			this.readChar()
		}

		if(tok !== undefined){//每生成一个token就把token信息传递给观察者
			this.notifyObserver(tok)
		}

		return tok
	}

	notifyObserver(token){
		if(this.observer !== null){
			this.observer.notifyTokenCreation(token,
				this.observerContext, this.position - 1,
				this.readPosition)
		}
	}

	isLetter(ch) {
		return ('a' <= ch && ch <= 'z') || 
		       ('A' <= ch && ch <= 'Z') ||
		       (ch === '_')
	}

	readIdentifier() {
		var identifier = ""
		if(this.isLetter(this.ch)){
			identifier += this.ch
			this.readChar()
		}else{
			return false
		}

		while (this.isLetter(this.ch) || this.isDigit(this.ch)) {
			identifier += this.ch
			this.readChar()
		}

		return identifier
	}

	readString(){
		//越过开始的双引号
		this.readChar()
		var str = ""
		while(this.ch !== '"' && this.ch !== this.EOF){
			str += this.ch
			this.readChar()
		}

		if(this.ch !== '"'){
			return undefined
		}

		return str
	}

	isDigit(ch) {
		return '0' <= ch && ch <= '9'
	}

	readNumber() {
		var number = ""
		while (this.isDigit(this.ch)) {
			number += this.ch
			this.readChar()
		}

		if (number.length > 0) {
			return number
		} else {
			return false
		}
	}

	lexing() {
		this.readChar()
		
		var token = this.nextToken()
		while(token !== undefined && token.getType() !== this.EOF) {
			this.tokens.push(token)
			token = this.nextToken()
		}

		this.tokens.push(token)
	}
}

export default Lexer