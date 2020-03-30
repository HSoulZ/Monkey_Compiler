import React , {Component} from 'react'
import * as bootstrap from 'react-bootstrap'
import rangy from 'rangy/lib/rangy-selectionsaverestore'
import Lexer from './Lexer'


class CompilerEditer extends Component{
    constructor(props){
        super(props)
        this.keyWords = props.keyWords
        rangy.init()
        this.keyWordClass = 'keyword'
        this.keyWordElementArray = []
        this.identifierElementArray = []
        this.textNodeArray = []
        this.lineNodeClass = 'line'
        this.lineSpanNode = 'LineSpan'
        this.identifierClass = "Identifier"
        this.breakPointClass = "breakpoint"
        this.spanToTokenMap = {}
        this.state = {
            placement : "right",
            positionLeft: -200,
            positionTop: -200,
            content : "",
            title: ""
        }        
        this.keyToIgnore = ["Enter", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

        
        var ruleClass1= 'span.'+this.lineSpanNode + ':before'
        var rule = 'counter-increment: line;content: counter(line);display: inline-block;'
        rule += 'border-right: 1px solid #ddd;padding: 0 .5em;'
        rule += 'margin-right: .5em;color: #666;'
        rule += 'pointer-events:all;'
        //console.log(document.styleSheets.length)
        document.styleSheets[1].addRule(ruleClass1, rule);

        
        this.bpMap = {}
        this.ide = null
    }

    
    initPopoverControl() {
        this.setState ({
            placement : "right",
            positionLeft: -200,
            positionTop: -200,
            content : "",
            title: ""
        })
    }

    getContent(){
        return this.divInstance.innerText
    }

    //注册观察者
    changeNode(n){
        //深度优先搜索
        var f = n.childNodes;//访问节点n的孩子
        for(var c in f){//对每个孩子调用changeNode()
            this.changeNode(f[c]);
        }

        //若含有数据
        if(n.data){
            //console.log(n.parentNode.innerHTML)
            this.lastBegin = 0
            n.keyWordCount = 0
            n.identifierCount = 0
            //调用词法分析器进行分析
            var lexer = new Lexer(n.data)
            this.lexer = lexer
            //设置一个分析过程的观察者
            lexer.setLexingObserver(this, n)
            //开始分析
            lexer.lexing()
        }
    }

    //拿到起始位置和结束位置
    notifyTokenCreation(token, elementNode, begin, end){
            var e = {}
            e.node = elementNode
            e.begin = begin
            e.end = end
            e.token = token

            if(this.keyWords[token.getLiteral()] !== undefined){
                elementNode.keyWordCount++;
                this.keyWordElementArray.push(e)
            }

            //无关键字字符串
            if(elementNode.keyWordCount === 0 && token.getType() === this.lexer.IDENTIFIER){
                elementNode.identifierCount++
                this.identifierElementArray.push(e)
            }        
    }

    //高亮的实现
    highLightKeyWord(token, elementNode, begin, end){
        var strBefore = elementNode.data.substr(this.lastBegin, 
            begin - this.lastBegin)//下一个关键字起始位置-上一个关键字结束位置
        strBefore = this.changeSpaceToNBSP(strBefore)
        
        //创建新节点并加入
        var textNode = document.createTextNode(strBefore)
        var parentNode = elementNode.parentNode
        parentNode.insertBefore(textNode, elementNode)

        this.textNodeArray.push(textNode)

        //加span标签做高亮
        var span = document.createElement('span')
        span.style.color = 'blue'
        span.classList.add(this.keyWordClass)
        span.appendChild(document.createTextNode(token.getLiteral()))
        parentNode.insertBefore(span, elementNode)

        this.lastBegin = end - 1

        elementNode.keyWordCount--
        //console.log(this.divInstance.innerHTML)
    }

    changeSpaceToNBSP(str){
        var s = ""
        for(var i= 0; i < str.length; i++){//遍历
            if(str[i] === ' '){//是空格则转换成unicode空格编码，因为新建text节点会删掉原空格
                s += '\u00a0'
            } else{
                s += str[i]
            }
        }
        return s;
    }

    //把keyWordElementArray数组中记录的信息拿出来，然后调用highLightKeyWord()
    highLightSyntax(){
        var i
        this.textNodeArray = []

        for(i = 0; i< this.keyWordElementArray.length; i++){
            var e = this.keyWordElementArray[i]
            this.currentElement = e.node
            this.highLightKeyWord(e.token, e.node, e.begin, e.end)

            //把原节点删除掉
            if(this.currentElement.keyWordCount === 0){
                var end = this.currentElement.data.length
                var lastText = this.currentElement.data.substr(this.lastBegin, end)
                lastText = this.changeSpaceToNBSP(lastText)
                var parent = this.currentElement.parentNode
                var lastNode = document.createTextNode(lastText)
                parent.insertBefore(lastNode, this.currentElement)

                //解析最后一个节点，这样可以为关键字后面的变量字符串设立popover控件
                this.textNodeArray.push(lastNode)

                parent.removeChild(this.currentElement)
            }
        }
        this.keyWordElementArray = []
    }

    //获得行号,,,,,,,oooooooooooo
    getCaretLineNode(){
        var sel = document.getSelection()
        //得到光标所在行的node对象
        var nd = sel.anchorNode
        //查看其父节点是否是span. 若不是，插入一个span节点用来表示光标所在行
        var currentLineSpan = null;
        //lineSpan是个变量，记录行号属性
        var elements = document.getElementsByClassName(this.lineSpanNode)
        
        //for循环查看光标所在节点是否在linespan这种标签内部
        for(var i = 0; i< elements.length; i++){
            var element = elements[i]
            
            if (element.contains(nd)) {
                currentLineSpan = element
            }
            while (element.classList.length > 0) {
                element.classList.remove(element.classList.item(0))
            }
            element.classList.add(this.lineSpanNode)
            element.classList.add(this.lineNodeClass + i)
            
        }
        
        if (currentLineSpan !== null) {
            //change
            currentLineSpan.onclick = function(e){
                this.createBreakPoint(e.toElement)
            }.bind(this)
            return currentLineSpan
        }
        
        //计算当前光标所在节点的前面有多少个div节点,前面的div节点数就是光标所在节点的行数

        var divElements = this.divInstance.childNodes;
        var l = 0;
        for(i = 0; i< divElements.length; i++){
            //当前光标所在节点前面是否有div节点
            if(divElements[i].tagname === "DIV" && divElements[i].contains(nd)){
                l = i;
                break;
            }
        }

        //创造span节点
        var spanNode = document.createElement('span')
        spanNode.classList.add(this.lineSpanNode)
        spanNode.classList.add(this.lineNodeClass + l)

        //change
        spanNode.dataset.lineNum = l
        spanNode.onclict = function(e){
            this.createBreakPoint(e.toElement)
        }.bind(this)

        nd.parentNode.replaceChild(spanNode, nd)
        spanNode.appendChild(nd)
        return spanNode
    }

    createBreakPoint(elem){
        if(elem.classList.item(0) !== this.lineSpanNode){
            return
        }

        //是否已存在断点
        if(elem.dataset.bp === "true"){
            var bp = elem.previousSibling
            bp.remove()
            elem.dataset.bp = false
            delete this.bpMap[''+ elem.dataset.lineNum]
            if(this.ide !== null){
                this.ide.updateBreakPointMap(this.bpMap)
            }
            return
        }

        //构造一个红点
        elem.dataset.bp = true
        this.bpMap[''+ elem.dataset.lineNum] = elem.dataset.lineNum
        var bp = document.createElement('span')
        bp.style.height = '10px'
        bp.style.width = '10px'
        bp.style.backgroundColor = 'red'
        bp.style.borderRadius = '50%'
        bp.style.display = 'inline-block'
        bp.classList.add(this.breakPointClass)
        elem.parentNode.insertBefore(bp, elem.parentNode.firstChild)
        if (this.ide != null) {
                this.ide.updateBreakPointMap(this.bpMap)
        }
    }

    handleIdentifierOnMouseOver(e){
        e.currentTarget.isOver = true
        var token = e.currentTarget.token

        this.setState({
            positionLeft: e.clientX + 10,
            positionTop: e.currentTarget.offsetTop - e.currentTarget.offsetHeight,
            content: "name:" + token.getLiteral() + "\nType:" + token.getType()+ "\nLine:" + e.target.parentNode.classList[1],
            title: "Syntax"
        });

        if (this.ide != null) {
            var env = this.ide.getSymbolInfo(token.getLiteral())
            if (env) {
                this.setState({
                    title: token.getLiteral(),
                    contains: env
                })
            }
        }
    }

    handleIdentifierOnMouseOut(e){
    	this.initPopoverControl()
    }

    addPopoverSpanToIdentifier(token, elementNode, begin, end) {
        var strBefore = elementNode.data.substr(this.lastBegin, 
    		             begin - this.lastBegin)
    	strBefore = this.changeSpaceToNBSP(strBefore)
    	var textNode = document.createTextNode(strBefore)
    	var parentNode = elementNode.parentNode
    	parentNode.insertBefore(textNode, elementNode) 


        var span = document.createElement('span')
        //添加两个响应函数
        span.onmouseenter = (this.handleIdentifierOnMouseOver).bind(this)
    	span.onmouseleave = (this.handleIdentifierOnMouseOut).bind(this)
        
        span.classList.add(this.identifierClass)
    	span.appendChild(document.createTextNode(token.getLiteral()))
        span.token = token
        
    	parentNode.insertBefore(span, elementNode)
    	this.lastBegin = end - 1
    	elementNode.identifierCount--
    }

    addPopoverByIdentifierArray() {
        //该函数的逻辑跟hightLightSyntax一摸一样
        //把所有变量字符串存储在identifierElementArray中，遍历，取出所有变量字符串
        //计算开始和结束位置
    	for (var i = 0; i < this.identifierElementArray.length; i++) {
            //用 span 将每一个变量包裹起来，这样鼠标挪上去时就可以弹出popover控件
            var e = this.identifierElementArray[i]
    		this.currentElement = e.node
    		//找到每个IDENTIFIER类型字符串的起始和末尾，给他们添加span标签
    		this.addPopoverSpanToIdentifier(e.token, e.node, e.begin, e.end)

            if (this.currentElement.identifierCount === 0) {
                var end = this.currentElement.data.length
    	        var lastText = this.currentElement.data.substr(this.lastBegin, end)
    	        lastText = this.changeSpaceToNBSP(lastText)
    	        var parent = this.currentElement.parentNode
    	        var lastNode = document.createTextNode(lastText)
    	        parent.insertBefore(lastNode, this.currentElement)
    	        parent.removeChild(this.currentElement)
    	    }
        }

        this.identifierElementArray = []
    }

    preparePopoverForIdentifers() {
        //判断textNodeArray中是否有内容
        if (this.textNodeArray.length > 0) {
            //add 2019.12.07
            this.identifierElementArray = []
            
            for (var i = 0; i < this.textNodeArray.length; i++) {
                //将text 节点中的文本提交给词法解析器抽取IDENTIFIER
                //有内容就交给changeNode()函数--会提交给词法解析器
                this.changeNode(this.textNodeArray[i])
                //为解析出的IDENTIFIER字符串添加鼠标取词功能
                this.addPopoverByIdentifierArray()
            }
            this.textNodeArray = []
        } else {//若textNodeArray中没有关键字
        	this.addPopoverByIdentifierArray()
        }
    }

    /*
    hightlineByLine (line) {
        var lineClass = this.lineNodeClass + line
        var spans = document.getElementsByClassName(lineClass)
        if (spans !== null) {
        	var span = spans[0]
            span.style.backgroundColor = 'red'
        }
    }
    */
    
    onDivContentChange(evt){
        //若当前按键时回车或者空格，不做处理
        /*
        if(evt.key === 'Enter' || evt.key === " "){
            return;
        }*/
        if (this.keyToIgnore.indexOf(evt.key) >= 0) {
			return;
		}

        //用到第三方国库rangy，由Google提供，为了解决加标签光标自动跳转到开头的问题
        //rangy库可以用npm下载安装
        var bookmark = undefined
        if(evt.key !== 'Enter'){
            //传入的参数是光标所在的控件，记录当前光标所在位置
            bookmark = rangy.getSelection().getBookmark(this.divInstance)
        }

        var currentLine = this.getCaretLineNode()
        for(var i = 0; i < currentLine.childNodes.length; i++){
            if(currentLine.childNodes[i].className === this.keyWordClass
                || currentLine.childNodes[i].className === this.identifierClass){
                    var child = currentLine.childNodes[i]
                    var t = document.createTextNode(child.innerText)
                    currentLine.replaceChild(t, child)
                }
        }
        
        currentLine.normalize();
        this.identifierElementArray = []
        this.changeNode(currentLine)
        this.highLightSyntax()
        this.preparePopoverForIdentifers()


        //改变完之后再用moveToBookmark()把光标移到原来所在的位置即bookmark
        if(evt.key !== 'Enter'){
            rangy.getSelection().moveToBookmark(bookmark)
        }
    }

    render(){
        let textAreaStyle = {
            height: 350,
            boder: "1px solid black"
        };
        
        let popoverStyle = {
            left: this.state.positionLeft - 15,
            top: this.state.positionTop + 20

        }
        
    
        return(
            <div>
                <div style={textAreaStyle}
                onKeyUp={this.onDivContentChange.bind(this)}
                ref = {(ref) => {this.divInstance = ref}}
                contentEditable>
                
                </div>
                
                <bootstrap.Popover placement = {this.state.placement}
                style={popoverStyle}
                id = "identifier-show">
                    <bootstrap.Popover.Title>
                        {this.state.title}
                    </bootstrap.Popover.Title>
                    {this.state.content}
                </bootstrap.Popover>
            </div>
        );
    }

}

export default CompilerEditer