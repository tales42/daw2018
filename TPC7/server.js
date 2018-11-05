var express = require('express')
var http = require('http') 
var pug = require('pug')
var fs = require('fs')
var formidable = require('formidable')
var logger = require('morgan')
var jsonfile = require('jsonfile')
var url = require('url')
var path = require('path')
var myBD = "files.json"

var app = express()

app.use(logger('combined'))
app.use(express.static('uploaded'))

app.all('*', (req,res,next)=>{
    if(req.url != '/w3.css' && (req.url.split('?')[0]!='/getFile')){
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
    }
    next()
})

app.get('/', (req,res)=>{
    jsonfile.readFile(myBD, (erro,ficheiros)=>{
        res.write(pug.renderFile('form-ficheiro.pug', {struct: ficheiros}))
        res.end()   
    })  
})

app.get('/w3.css', (req,res)=>{
    res.writeHead(200,{'Content-Type':'text/css'})
    fs.readFile('stylesheets/w3.css',(erro,dados)=>{
        if(!erro){
            res.write(dados);
        }
        else{
            res.write(pug.renderFile('erro.pug',{e: erro}))
        }
        res.end();         
    })   
})


app.post('/processaForm',(req,res)=>{
    var form = new formidable.IncomingForm()
    form.parse(req, (erro, fields, files)=>{
        var fenviado = files.ficheiro.path
        var fnovo = './uploaded/'+files.ficheiro.name

        jsonfile.readFile(myBD, (erro,ficheiros)=>{
            var myObj = {}
            var id = ficheiros.length + 1
            myObj["id"] = id
            myObj["path"] = fnovo
            myObj["desc"] = fields.desc
            ficheiros.push(myObj)
            jsonfile.writeFile(myBD,ficheiros,erro =>{
                if(!erro) console.log("Registo Gravado com Sucesso")
            })
        })
        
        fs.rename(fenviado,fnovo, err =>{
            if(!err){
                /*
                res.write(pug.renderFile('ficheiro-recebido.pug',
                    {ficheiro: files.ficheiro.name, 
                    status:'Ficheiro Recebido e guardado com sucesso'}))
                res.end()
                */
                jsonfile.readFile(myBD, (erro,ficheiros)=>{
                    res.write(pug.renderFile('form-ficheiro.pug', {struct: ficheiros}))
                    res.end()   
                })  
            }
            else{
                res.write(pug.renderFile('erro.pug',{e: 'Ocorreram erros no armazenamento do ficheiro'}))
            }
        })
        
    })    
})

app.get('/getFile',(req,res)=>{
    var myObj
    var myID = (url.parse(req.url).query.split('=')[1])
    jsonfile.readFile(myBD,(erro,ficheiro)=>{
        for(var i = 0; i < ficheiro.length; i++) {
            if(myID == ficheiro[i].id) {
                myObj = ficheiro[i]
                break
            }
        }
        if(!erro){
            res.sendFile(path.join(__dirname,myObj.path))
        }
        else{
            res.write(pug.renderFile('erro.pug',{e: 'Ocorreram erros no download do ficheiro'}))
        }
    })
})

var myServer = http.createServer(app)
myServer.listen(4007, () =>{
    console.log('Servidor à escuta na porta 4007...')
})
