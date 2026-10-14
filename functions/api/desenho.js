import { gerarDesenho } from "../../lib/desenho.js";

export async function onRequestPost({ request, env }) {
  try {
    let dados;

    try {
      dados = await request.json();
    } catch {
      return new Response("Requisição inválida.", {
        status: 400
      });
    }

    const numero = dados.numero;
    const token = dados.token;

    // Verifica se o número é válido.
    if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
      return new Response("Número inválido.", {
        status: 400
      });
    }

    // Verifica se o token e o Client ID existem.
    if (
      typeof token !== "string" ||
      !token ||
      !env.GOOGLE_CLIENT_ID
    ) {
      return new Response("Não autorizado.", {
        status: 401
      });
    }

    // Consulta o Google para validar o token.
    const url = new URL("https://oauth2.googleapis.com/tokeninfo");
    url.searchParams.set("id_token", token);

    const verificacao = await fetch(url);

    if (verificacao.status !== 200) {
      return new Response("Token inválido.", {
        status: 401
      });
    }

    const usuario = await verificacao.json();

    // Confere o Client ID e o e-mail verificado.
    if (
      usuario.aud !== env.GOOGLE_CLIENT_ID ||
      usuario.email_verified !== "true" ||
      !usuario.email
    ) {
      return new Response("Token não autorizado.", {
        status: 401
      });
    }

    // Gera o desenho usando o e-mail confirmado pelo Google.
    const svg = gerarDesenho(numero, usuario.email);

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return new Response("Erro interno ao gerar o desenho.", {
      status: 500
    });
  }
}