var jsonfile = require('jsonfile')
var myBD = "files.json"
var pug = require('pug')


$(()=>{
    $("#refresh").click(()=>{
        jsonfile.readFile(myBD, (erro,ficheiros)=>{
            res.write(pug.renderFile('form-ficheiro.pug', {struct: ficheiros}))
            res.end()   
        }) 
    })
})