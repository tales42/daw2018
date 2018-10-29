var http = require('http') 
var url = require('url')
var pug = require('pug')
var fs = require('fs')
var jsonfile = require('jsonfile')


var {parse} = require('querystring')

var myBD = 'tarefas.json'

var myServer = http.createServer((req,res)=>{
    var purl = url.parse(req.url,true)
    var query = purl.query

    console.log('Recebi o pedido: '+purl.pathname)
    console.log('Com o método: '+ req.method)

    if(req.method== 'GET'){
        if(purl.pathname == '/' || purl.pathname == '/index'){
            res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('index.pug'))
            res.end()
        }
        else if(purl.pathname == '/registo'){
            res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('form-tarefa.pug'))
            res.end()
        }
        else if(purl.pathname == '/lista'){
            jsonfile.readFile(myBD, (erro,tarefas)=>{
                if(!erro){
                    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
                    res.write(pug.renderFile('lista-tarefas.pug',{lista: tarefas}))
                    res.end()                    
                }
                else{
                    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
                    res.write(pug.renderFile('erro.pug',{e: "Erro na leitura da BD"}))
                    res.end()
                }
            })
        }
    
        else if(purl.pathname == '/processaForm'){
            res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('tarefa-recebida.pug',{tarefa: query}))
            res.end()
        }
    
        else if(purl.pathname == '/w3.css'){
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
        }
    
        else{
            res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('erro.pug',{e:"Erro "+purl.pathname+" não está implementado!"}))
            res.end()        
        }
    }
    else if(req.method == 'POST'){
        if(purl.pathname == '/processaForm'){
            recuperaInfo(req,resultado =>{
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1;
                var yyyy = today.getFullYear();
                today = yyyy + '-' + mm + '-' + dd 
                resultado["dataRegisto"] = today.toString()
                resultado["concluida"] = "false"
                resultado["dataConclusao"] = resultado["dataConclusao"].toString()
                console.log(resultado)
                jsonfile.readFile(myBD, (erro, tarefas)=>{
                    if(!erro){
                        var id = tarefas.length + 1
                        resultado["id"] = id 
                        tarefas.push(resultado)
                        console.dir(tarefas)
                        jsonfile.writeFile(myBD,tarefas,erro =>{
                            if(erro) console.log(erro)
                            else console.log('Registo gravado com sucesso.')
                        })
                    }
                    else{
                        res.end(pug.renderFile('erro.pug',{e:erro}))
                    }
                })
                res.end(pug.renderFile('tarefa-recebida.pug',{tarefa: resultado}))
            })
        }
        else if(purl.pathname=='/tarefaConcluida'){
            recuperaInfo(req,resultado =>{
                console.log(resultado)
                var deleteID = resultado["eliminar"]
                
                
                jsonfile.readFile(myBD, (erro, tarefas)=>{
                    if(!erro){
                        for(var campo in tarefas){
                            if(tarefas[campo]["id"] == deleteID){
                                tarefas[campo]["concluida"]="true"
                            }
                        }
                        console.log(resultado)
                        
                        jsonfile.writeFile(myBD,tarefas,erro =>{
                            if(erro) console.log(erro)
                            else console.log('Registo gravado com sucesso.')
                        })
                        
                    }
                    else{
                        res.end(pug.renderFile('erro.pug',{e:erro}))
                    }
                    res.end(pug.renderFile('lista-tarefas.pug',{lista: tarefas}))
                })
            })    
        }
        else{
            res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('erro.pug',{e:"Erro "+purl.pathname+" não está implementado!"}))
            res.end()   
        }
    }
    else{
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
        res.write(pug.renderFile('erro.pug',{e:"Método "+req.method+" não suportado!"}))
        res.end()   
    }

})

myServer.listen(4006, ()=>{
    console.log('Servidor à escuta na porta 4006...')
})


function recuperaInfo(request, callback){
    if(request.headers['content-type'] == 'application/x-www-form-urlencoded'){
        let body = ''
        request.on('data', bloco =>{
            body += bloco.toString()
        })
        request.on('end',()=>{
            callback(parse(body))
        })
    }
    else{
        callback(null)
    }
}