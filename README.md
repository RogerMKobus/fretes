## Descrição do projeto

Projeto desenvolvido com o intuito de aprendizado focado nas Cloud Functions do Firebase e no processamento em filas do Google Cloud Pub/Sub, nesta aplicação a api dos correios é consumida para cálculo de frete, e o Pub/Sub é utilizado da forma mais simples possível, gravando uma string no Firestore assim que recebida pela fila.

## Tecnologias Utilizadas

- NodeJS
- Firebase Cloud Functions
- Firestore
- Google Cloud Pub/Sub

## Como baixar e utilizar o projeto

```
# Clonar o Repositório
$ git clone https://github.com/RogerMKobus/fretes.git

# Entrar no diretório
$ cd fretes/functions

# Instalar as dependências
$ yarn
```

Após instalar as dependências, acesse o Firebase console para fazer o download do arquivo de configuração da sua Service Account. Seguindo o caminho Configurações -> Usuários e permissões -> Menu Contas de Serviço -> Gerar nova chave privada.

Mova o arquivo para a pasta fretes/functions e altere seu nome para serviceAccountKey.json

Preencha o arquivo .env_mirror com seus dados.

```
# Inicie a aplicação
$ yarn serve
```

## Rotas de acesso

Assim que iniciar o emulador, as rotas serão descritas no console, a porta padrão é a 5001, exemplificando:

http://localhost:5001/<id-projeto>/<local-projeto>/<nome-funcao>

## Funções

calculaFrete => Recebe os parâmetros no corpo da requisição e retorna o calculo do frete pelos meios de entrega PAC e sedex.

Parâmetros => {

origin_postcode: string,

destination_postcode: string,

width: string,

height: string,

length: string,

weight: string

}

publish => Envia para fila a mensagem informada no corpa da requisição.

Parâmetros => {

"message": string

}

listen => Verifica se existem mensagens não lidas na fila, e espera por novas mensagens.


list => Retorna todas as mensagens registradas no Firestore.