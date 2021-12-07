//-----> Configure os PARÂMETROS AQUI!

//Porta da aplicação
var porta = 7777

//URL_BASE
var URL_BASE = `http://issuer-jolocom.gidlab.rnp.br`



function getFullURL(url, port) {
    if (url[url.length -1] == '/') {
        return url.slice(0,-1) + `:${port}`
    } else {
        return url + `:${port}`
    }
}

var fullURL = getFullURL(URL_BASE,porta)

export {porta, URL_BASE, fullURL}