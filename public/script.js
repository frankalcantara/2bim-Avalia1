const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

// Guarda o SVG gerado e a URL temporária da imagem.
let svgAtual = "";
let urlSvg = null;

// O token é recebido pela função global definida no index.html.
// Inicializamos a variável global caso ainda não exista.
if (typeof window.tokenGoogle === "undefined") {
  window.tokenGoogle = null;
}

// Recebe o número do formulário e solicita o desenho ao servidor.
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  area.replaceChildren();
  botaoBaixar.hidden = true;
  svgAtual = "";

  // Lê o número digitado.
  const numero = Number(campoNumero.value);

  // Verifica se o número é um inteiro entre 1 e 100.
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um número inteiro entre 1 e 100.";
    return;
  }

  // Verifica se o Google entregou o token de autenticação.
  const token = window.tokenGoogle;

  if (typeof token !== "string" || token.length === 0) {
    mensagem.textContent =
      "Faça login com o Google antes de desenhar.";
    return;
  }

  try {
    mensagem.textContent = "Gerando seu desenho...";

    // Envia o número e o token ao servidor Cloudflare.
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero: numero,
        token: token
      })
    });

    // Trata os erros retornados pela API.
    if (resposta.status === 400) {
      mensagem.textContent = "Erro 400: número ou requisição inválida.";
      return;
    }

    if (resposta.status === 401) {
      mensagem.textContent =
        "Erro 401: autenticação inválida. Faça login novamente.";
      return;
    }

    if (!resposta.ok) {
      mensagem.textContent =
        `Erro ${resposta.status}: não foi possível gerar o desenho.`;
      return;
    }

    // Recebe o conteúdo SVG enviado pelo servidor.
    const svg = await resposta.text();

    // Confere se a resposta parece conter um SVG.
    if (!/^\s*<svg(?:\s|>)/i.test(svg)) {
      mensagem.textContent = "O servidor não retornou um SVG válido.";
      return;
    }

    svgAtual = svg;

    // Libera a URL anterior, se houver.
    if (urlSvg) {
      URL.revokeObjectURL(urlSvg);
    }

    // Cria uma imagem temporária para mostrar o desenho.
    const arquivo = new Blob([svgAtual], {
      type: "image/svg+xml;charset=utf-8"
    });

    urlSvg = URL.createObjectURL(arquivo);

    const imagem = document.createElement("img");
    imagem.src = urlSvg;
    imagem.alt = "Desenho assinado";

    area.replaceChildren(imagem);

    // Exibe o botão de download.
    botaoBaixar.hidden = false;
    mensagem.textContent = "Desenho gerado com sucesso!";

  } catch (erro) {
    console.error("Erro ao gerar o desenho:", erro);
    mensagem.textContent =
      "Erro de conexão ao tentar gerar o desenho.";
  }
});

// Faz o download do SVG gerado.
botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) {
    mensagem.textContent = "Gere um desenho antes de baixar.";
    return;
  }

  const arquivo = new Blob([svgAtual], {
    type: "image/svg+xml;charset=utf-8"
  });

  const urlDownload = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = urlDownload;
  link.download = "desenho-assinado.svg";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(urlDownload);
});