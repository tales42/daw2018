var http = require('http')
var url = require('url')
var fs = require('fs')
var pug = require('pug')

var puburl= /\/obra\//
var estilo = /w3\.css/


http.createServer((req,res)=>{
    var purl = url.parse(req.url)

    if((purl.pathname == '/') || (purl.pathname == '/index')){
        res.writeHead(200,{'Content-Type':'text/html'})
        fs.readFile('json/index.json','utf8',(erro,dados)=>{
            if(!erro){
                console.log(JSON.parse(dados))
                res.write(pug.renderFile('index.pug',{ind: JSON.parse(dados)}));
            }
            else{
                res.write('<p><b>ERRO!</b>'+erro+'</p>')
            }
            res.end();
        })
    }
    else if(puburl.test(purl.pathname)){
        var ficheiro = purl.pathname.split('/')[2]
        res.writeHead(200,{'Content-Type':'text/html'})
        fs.readFile('json/'+ficheiro+'.json',(erro,dados)=>{
            if(!erro){
                console.log(JSON.parse(dados))
                res.write(pug.renderFile('template.pug',{obra: JSON.parse(dados)}));
            }
            else{
                res.write('<p><b>ERRO!</b>'+erro+'</p>')
            }
            res.end();   
        })     
    }
    else if(estilo.test(purl.pathname)){
        res.writeHead(200,{'Content-Type':'text/css'})
        fs.readFile('estilo/w3.css',(erro,dados)=>{
            if(!erro){
                res.write(dados);
            }
            else{
                res.write('<p><b>ERRO!</b>'+erro+'</p>')
            }
            res.end();         
        })     
    }
    else{
        res.writeHead(200,{'Content-Type':'text/html'}) 
        res.write('<p><b>ERRO! Pedido Desconhecido</b>'+purl.pathname+'</p>')
        res.end()
    }
}).listen(1600,()=>{
    console.log('Servidor à escuta na porta 1600...')
})