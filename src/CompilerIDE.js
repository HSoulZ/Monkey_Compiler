import React , {Component} from 'react'
import * as bootstrap from 'react-bootstrap'
import Lexer from './Lexer'
import CompilerEditer from './CompilerEditer'
import Parser from './Parser'
import Interpreter from './Interpreter'

class CompilerIDE extends Component{
    constructor(props){
        super(props)
        this.lexer = new Lexer("")
        this.interpreter = new Interpreter()
    }

    onLexingClick(){
        this.lexer = new Lexer(this.inputInstance.getContent())
        //console.log(this.lexer.tokens)
        this.parser = new Parser(this.lexer)
        this.parser.parseProgram()
        this.program = this.parser.program
        /*
        for(var i = 0; i < this.program.statements.length; i++){
          console.log(this.program.statements[i].getLiteral())
          this.interpreter.interprete(this.program.statements[i])
        }
        */
        //console.log(this.program)
        this.interpreter.interprete(this.program)
    }

    //Button ---->   Modal
    render () {
        return (
          <bootstrap.Card>
            <bootstrap.Card.Header>Compiler IDE</bootstrap.Card.Header>
            <CompilerEditer
             ref = {(ref) => {this.inputInstance = ref;}}
             keyWords = {this.lexer.getKeyWords()}/>
             
            <bootstrap.Button onClick={this.onLexingClick.bind(this)}
             style = {{marginTop: '16px'}}>
              Start
            </bootstrap.Button>

          </bootstrap.Card>
          );
    }
}

export default CompilerIDE