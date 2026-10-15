# Desenho Assinado

Página que recebe um número inteiro entre 1 e 100 e devolve uma figura em SVG, assinada com um e-mail.

A figura é a tabuada modular no círculo: 240 pontos igualmente espaçados numa circunferência, com cada ponto `i` ligado ao ponto `(k * i) mod 240`, em que `k = número + 1`. O número 1 produz uma cardioide, o 2 uma nefroide, e cada valor gera uma figura diferente.

## Estado inicial

Nesta versão tudo acontece no navegador. O arquivo `public/desenho.js` contém a função `gerarDesenho(numero, email)`, e o e-mail é digitado pelo usuário num campo do formulário.

```
public/
  index.html    formulário com os campos número e e-mail
  style.css     aparência da página
  script.js     lê o formulário e chama gerarDesenho
  desenho.js    gera o SVG (função pura, sem DOM)
```

## Publicação no Cloudflare Pages

Framework preset: `None`. Build command: vazio. Build output directory: `public`.

## Identificação (preencha após o fork)

Nome: Luis Felipe Machado Konopika
RA: 2026109633
URL: https://
