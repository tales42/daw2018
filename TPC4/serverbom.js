var http = require('http')
var url = require('url')
var fs = require('fs')


http.createServer((req,res)=>{
    var myObj = url.parse(req.url,true)
    var p = myObj.pathname
    var q = myObj.query
    console.log(myObj)
    res.writeHead(200,{'Content-Type':'text/html'})
    if((p=="/"||p=="/arq")){
        fs.readFile('website/index.html',(erro,dados)=>{
            if(!erro)
                res.write(dados)
            else
                res.write('<p><b>ERRO: </b>' + erro + '</p>')
            res.end()
        })
    }
    else{
        var id = q.id;
        fs.readFile('website/html/'+q.id+'.html',(erro,dados)=>{
            if(!erro)
                res.write(dados)
            else 
                res.write('<p><b>ERRO: </b>' + erro + '</p>')
            res.end()
        })
    }
}).listen(4003,()=>
    console.log('Servidor à escuta na porta 4003.')
)