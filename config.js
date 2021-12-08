//-----> Configure os PARÂMETROS AQUI!

//Porta da aplicação local
var LOCAL_PORT = 7777

//Porta da aplicação pública (após encaminhmento)
var PUBLIC_PORT = 80

//URL_BASE
var PUBLIC_URL = `http://issuer-jolocom.gidlab.rnp.br`

function fixURL(url,port) {
    if (url[url.length -1] == '/') {
        return url.slice(0,-1) + `:${port}`
    } else {
        return url + `:${port}`
    }
}

PUBLIC_URL = fixURL(PUBLIC_URL, PUBLIC_PORT)

export {LOCAL_PORT, PUBLIC_PORT, PUBLIC_URL}