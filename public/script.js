// A importação do "desenho.js" foi removida pois a função agora roda no servidor.

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";
let tokenGoogle = ""; // Variável para guardar o token do Google

// Função chamada automaticamente pelo Google após o login com sucesso
window.handleGoogleLogin = function(response) {
  tokenGoogle = response.credential;
  mensagem.textContent = "Login efetuado com sucesso! Pode desenhar.";
  mensagem.style.color = "green";
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "A gerar desenho no servidor...";
  mensagem.style.color = "black";
  area.innerHTML = "";
  botaoBaixar.hidden = true;

  const numero = Number(campoNumero.value);

  // Verifica se o utilizador já fez login
  if (!tokenGoogle) {
    mensagem.textContent = "Por favor, faça login com o Google primeiro.";
    mensagem.style.color = "red";
    return;
  }

  try {
    // Faz o pedido à nossa nova API no Cloudflare
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenGoogle}` // Envia o token no cabeçalho
      },
      body: JSON.stringify({ numero: numero }) // Envia apenas o número
    });

    // Tratamento OBRIGATÓRIO dos erros 400 e 401 para a avaliação
    if (resposta.status === 400) {
      mensagem.textContent = "Erro 400: Número inválido. Digite um número inteiro entre 1 e 100.";
      mensagem.style.color = "red";
      return;
    }
    
    if (resposta.status === 401) {
      mensagem.textContent = "Erro 401: Não autorizado. Faça login novamente ou token inválido.";
      mensagem.style.color = "red";
      return;
    }

    if (!resposta.ok) {
      mensagem.textContent = `Erro ${resposta.status}: Ocorreu um problema no servidor.`;
      mensagem.style.color = "red";
      return;
    }

    // Sucesso (200 OK) - Recebe e mostra o SVG gerado pelo servidor
    svgAtual = await resposta.text();
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
    mensagem.textContent = "";

  } catch (erro) {
    mensagem.textContent = "Erro de ligação. Verifique se o servidor está a correr.";
    mensagem.style.color = "red";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});