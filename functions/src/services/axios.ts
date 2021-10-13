import axios from "axios";

const correios = axios.create({
  baseURL: "http://ws.correios.com.br",
});

export default correios;
