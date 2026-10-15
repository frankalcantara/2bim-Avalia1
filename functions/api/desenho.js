import { gerarDesenho } from '../../lib/desenho.js';

export async function onRequest(context) {
    const { request, env } = context;

    // 1. ORDEM 1: Validação do Método (Erro 405)
    if (request.method !== "POST") {
        return new Response("Método não permitido", { status: 405 });
    }

    // 2. ORDEM 2: Validação do Corpo (Erro 400)
    let corpo;
    try {
        corpo = await request.json();
    } catch (e) {
        // Se falhar ao ler o JSON, o corpo está ausente ou inválido
        return new Response("Corpo ausente ou JSON inválido", { status: 400 });
    }

    const numero = corpo.numero;
    // Verifica se numero está ausente, não é inteiro, ou está fora de 1 a 100
    if (numero === undefined || !Number.isInteger(numero) || numero < 1 || numero > 100) {
        return new Response("Numero inválido ou fora do intervalo", { status: 400 });
    }

    // 3. ORDEM 3: Validação do Token (Erro 401)
    const headerAuth = request.headers.get("Authorization");
    if (!headerAuth || !headerAuth.startsWith("Bearer ")) {
        return new Response("Token ausente ou mal formatado", { status: 401 });
    }

    // Extrai apenas o token (removendo a palavra "Bearer ")
    const token = headerAuth.split(" ")[1];

    // Chama o endpoint do Google para verificar o token
    const urlGoogle = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const respostaGoogle = await fetch(urlGoogle);

    // Se o Google não retornar 200, o token é inválido ou expirou
    if (!respostaGoogle.ok) {
        return new Response("Token inválido ou expirado", { status: 401 });
    }

    const dadosToken = await respostaGoogle.json();

    // Verifica se o aud (Client ID) é igual ao configurado nas variáveis de ambiente
    if (dadosToken.aud !== env.GOOGLE_CLIENT_ID) {
        return new Response("Client ID não corresponde", { status: 401 });
    }

    // Verifica se o e-mail foi verificado pelo Google
    if (dadosToken.email_verified !== "true" && dadosToken.email_verified !== true) {
        return new Response("E-mail não verificado", { status: 401 });
    }

    // 4. SUCESSO (200)
    const emailAssinatura = dadosToken.email;
    const svgGerado = gerarDesenho(numero, emailAssinatura);

    // Retorna o SVG com o Content-Type exigido
    return new Response(svgGerado, {
        status: 200,
        headers: {
            "Content-Type": "image/svg+xml"
        }
    });
}