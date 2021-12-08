# Plataforma de Testes de Gestão de Identidades Autossoberana Baseada no Protocolo Jolocom

## Introdução 

A Identidade Autossoberana (SSI) é um padrão emergente baseado em [Identidades Descentralizadas](https://w3c.github.io/did-core/) e [Credenciais Verificáveis](https://w3c.github.io/vc-data-model/) que surgiu da necessidade dos usuários terem controle absoluto e exclusivo de seus dados, que no ecossistema atual estão centralizados e em posse de terceiros. Essa nova arquitetura contribui para melhorias de privacidade e diminuição dos riscos de vazamentos de informações pessoais. Este projeto objetiva estudar, por meio de várias análises e experimentações, uma das principais soluções SSI - [Jolocom](https://jolocom.io/wp-content/uploads/2019/12/Jolocom-Whitepaper-v2.1-A-Decentralized-Open-Source-Solution-for-Digital-Identity-and-Access-Management.pdf) e avaliar a possibilidade de integração da mesma com a federação CAFe em uma fase de transição de uma tecnologia baseada em federação de identidades para a outra baseada em identidades autossoberanas.

Esta implementação faz uso da ferramenta [Jolocom SDK](https://jolocom.github.io/jolocom-sdk/1.0.0/).

#### Projeto Financiado pelo Programa de Gestão de Identidades PGID 2021 da [Rede Nacional de Ensino e Pesquisa (RNP)](https://www.rnp.br).

---

## Configurando a Plataforma

Para poder instalar e executar a ferramenta, é necessário instalar o pacote [Node.js](https://nodejs.org/en/) v10 ou superior e o gerenciador de pacotes [npm](https://docs.npmjs.com/) v1.3.2 ou superior.

Em seguida, é necessário baixar uma cópia deste projeto em um diretório local e instalar as depêndencias Jolocom. Isso pode ser feito através da seguinte linha de comando no **diretório do projeto**:

```console
cd gid-autossoberana-jolocom
npm i
```

Após a instalação das depêndencias, é necessário configurar a ferramenta. Para isso, é preciso localizar e definir os parâmetros ```PUBLIC_URL```, ```PUBLIC_PORT``` e ```LOCAL_PORT``` presentes nos arquivos ```config.js```, ```/public/index.html``` e ```/public/issuer.html```.

O parâmetro ```LOCAL_PORT``` indica a porta em que o serviço será executado localmente em uma máquina. Para instanciar o serviço, por exemplo, na porta local **8080**, defina o parâmetro como descrito a seguir:

```js
var LOCAL_PORT = 8080
```
O parâmetro ```PUBLIC_URL``` indica o endereço público (IP ou Nome de Domínio) da máquina na qual o serviço será executado e aguardará as requisições HTTP. O nome de domínio ou IP público será usado como no exemplo abaixo:

No caso de um nome de domínio, configure da seguinte forma:
```js
var PUBLIC_URL = 'http://example.name.domain'
```
Caso seja um IP público, configure da seguinte forma:
```js
var PUBLIC_URL = 'http://aaa.bbb.ccc.ddd'
```
O parâmetro ```PUBLIC_PORT``` indica a porta pública para acessar o serviço. Essa porta dependerá exclusivamente do encaminhamento de porta feita. Caso seja feito um encaminhamento de porta da porta local ```LOCAL_PORT``` para uma porta pública, como por exemplo, na porta  **7777**, defina o parâmetro como descrito a seguir:

```js
var LOCAL_PORT = 7777
```

Esses parâmetros precisam ser definidos para que a ferramenta possa ser instanciada corretamente e para definir o caminho de rede pelo qual a solução receberá mensagens do dispositivo móvel.

## Como Usar

A ferramenta fará uso de um dispositivo móvel no qual deve ser instanciado previamente uma identidade autossoberana através do aplicativo [Jolocom SmartWallet](https://github.com/jolocom/smartwallet-app). A instalação pode ser feita em dispositivos [iOS](https://apps.apple.com/us/app/jolocom-smartwallet/id1223869062) ou [Android](https://play.google.com/store/apps/details?id=com.jolocomwallet).

### Iniciando a aplicação

Para executar a aplicação em modo de desenvolvedor, fazendo uso da ferramenta [nodemon](https://www.npmjs.com/package/nodemon), execute a seguinte linha de comando.

```console
npm run test
```

Caso queira executar a aplicação em modo normal, execute a seguinte linha de comando.

```console
npm run start
```

### Acessando a interface

A aplicação suporta dois tipos de fluxos: 
- fluxo de emissão e recebimento de credenciais verificáveis da plataforma de testes;
- fluxo de solicitação, fornecimento e verificação de credenciais verificáveis.


Para acessar a interface de **emissão**, acesse pelo navegador (Requisição HTTP do tipo GET) o seguinte URL: ```PUBLIC_URL:PUBLIC_PORT/issuer```. 

Para acessar a interface de **autenticação**, acesse pelo navegador (Requisição HTTP do tipo GET) o seguinte URL: ```PUBLIC_URL:PUBLIC_PORT/login```. 

---
## Autores

* [**Bryan Wolff**](https://github.com/bryan-wolff)

## Mais Informações:
* [**PGID 2021**](https://wiki.rnp.br/display/comitetgi/PGId+2021)
