const dino = document.getElementById("dino");
const gameArea = document.querySelector(".game-area");
const mensagem = document.getElementById("mensagem");
const pontuacao = document.getElementById("pontuacao");
const btnPular = document.getElementById("btnPular");

const VELOCIDADE_INICIAL = 13;
let velocidadeCacto = VELOCIDADE_INICIAL;

let pontos = 0;
let intervaloCacto = 4000;
let jogoAtivo = true;

let pulando = false;
let segurando = false;
let posY = 0;
let velocidade = 0;
let gravidade = 2;
let impulso = 14;

let timerCacto;
let timerPassaro;
let tempoInicio;
const tempoMinimo = 200;
const tempoMaximo = 600;

let cactos = [];
let passaros = [];

let ultimoTempoPontuacao = Date.now();

document.addEventListener("keydown", e => { if (e.code === "Space") iniciarPulo(); });
document.addEventListener("keyup", e => { if (e.code === "Space") terminarPulo(); });

btnPular.addEventListener("mousedown", iniciarPulo);
btnPular.addEventListener("mouseup", terminarPulo);
btnPular.addEventListener("touchstart", iniciarPulo);
btnPular.addEventListener("touchend", terminarPulo);

function iniciarPulo() {
  if (!pulando && jogoAtivo) {
    pulando = true;
    segurando = true;
    tempoInicio = Date.now();
    velocidade = impulso;
  }
}

function terminarPulo() { segurando = false; }

function atualizar() {
  const agora = Date.now();

  if (jogoAtivo) {
    const delta = agora - ultimoTempoPontuacao;
    if (delta >= 100) {
      pontos += Math.floor(delta / 100);
      ultimoTempoPontuacao = agora;
      pontuacao.innerText = `Pontos: ${pontos}`;
      if (pontos % 100 === 0) aumentarDificuldade();
    }
  }

  if (pulando) {
    const tempoDecorrido = agora - tempoInicio;
    if (segurando && tempoDecorrido < tempoMaximo) {
      velocidade -= 0.5;
    } else {
      velocidade -= gravidade;
    }

    posY += velocidade;
    if (tempoDecorrido < tempoMinimo) posY = Math.max(posY, 50);
    if (posY <= 0) {
      posY = 0;
      pulando = false;
      velocidade = 0;
    }
    dino.style.bottom = posY + "px";
  }

  for (let i = cactos.length - 1; i >= 0; i--) {
    const cacto = cactos[i];
    cacto.x -= velocidadeCacto;
    cacto.element.style.left = cacto.x + "px";

    const dinoRect = dino.getBoundingClientRect();
    const cactoRect = cacto.element.getBoundingClientRect();

    if (
      dinoRect.right > cactoRect.left &&
      dinoRect.left < cactoRect.right &&
      dinoRect.bottom > cactoRect.top
    ) {
      gameOver();
    }

    if (cacto.x < -60) {
      cacto.element.remove();
      cactos.splice(i, 1);
    }
  }

  for (let i = passaros.length - 1; i >= 0; i--) {
    const passaro = passaros[i];
    passaro.x -= velocidadeCacto + 2;
    passaro.element.style.left = passaro.x + "px";

    const dinoRect = dino.getBoundingClientRect();
    const passaroRect = passaro.element.getBoundingClientRect();

    if (
      dinoRect.right > passaroRect.left &&
      dinoRect.left < passaroRect.right &&
      dinoRect.bottom > passaroRect.top &&
      dinoRect.top < passaroRect.bottom
    ) {
      gameOver();
    }

    if (passaro.x < -80) {
      passaro.element.remove();
      passaros.splice(i, 1);
    }
  }

  requestAnimationFrame(atualizar);
}

function criarCacto() {
  if (!jogoAtivo) return;

  const quantidadeCactos = Math.floor(Math.random() * 3) + 1;
  const gameWidth = gameArea.offsetWidth;
  let espacamento = 0;

  for (let i = 0; i < quantidadeCactos; i++) {
    const novoCacto = document.createElement("div");
    novoCacto.classList.add("cacto");
    gameArea.appendChild(novoCacto);

    let posX = gameWidth + espacamento;
    cactos.push({ element: novoCacto, x: posX });

    espacamento += novoCacto.offsetWidth + 10;
  }

  const minIntervalo = 2000;
  let maxIntervalo = pontos > 600 ? 600 : intervaloCacto;
  const proximoCacto = Math.random() * (maxIntervalo - minIntervalo) + minIntervalo;

  clearTimeout(timerCacto);
  timerCacto = setTimeout(criarCacto, proximoCacto);
}

function criarPassaro() {
  if (!jogoAtivo) return;
  if (pontos < 500) {
    timerPassaro = setTimeout(criarPassaro, 1000);
    return;
  }

  const gameWidth = gameArea.offsetWidth;
  const distanciaSeguraCacto = 200;
  const distanciaSeguraPassaro = 400;

  // Checa se qualquer cacto está próximo
  const cactoProximo = cactos.some(c => c.x > gameWidth - distanciaSeguraCacto);
  if (cactoProximo) {
    timerPassaro = setTimeout(criarPassaro, 800);
    return;
  }

  // Checa se qualquer outro pássaro está próximo
  const passaroProximo = passaros.some(p => p.x > gameWidth - distanciaSeguraPassaro);
  if (passaroProximo) {
    timerPassaro = setTimeout(criarPassaro, 1200);
    return;
  }

  const novoPassaro = document.createElement("div");
  novoPassaro.classList.add("passaro");
  gameArea.appendChild(novoPassaro);

  const altura = Math.random() * 50 + 100;
  const posX = gameWidth + 60;

  novoPassaro.style.bottom = `${altura}px`;
  novoPassaro.style.left = `${posX}px`;

  passaros.push({ element: novoPassaro, x: posX });

  const intervalo = Math.random() * 2500 + 2500;
  timerPassaro = setTimeout(criarPassaro, intervalo);
}

function aumentarDificuldade() {
  if (pontos <= 500) velocidadeCacto += 1;
}

function reiniciarJogo() {
  clearTimeout(timerCacto);
  clearTimeout(timerPassaro);
  cactos.forEach(c => c.element.remove());
  passaros.forEach(p => p.element.remove());
  cactos = [];
  passaros = [];

  pontos = 0;
  velocidadeCacto = VELOCIDADE_INICIAL;
  intervaloCacto = 2000;
  posY = 0;
  pulando = false;
  segurando = false;
  velocidade = 0;
  jogoAtivo = true;

  pontuacao.innerText = `Pontos: 0`;
  mensagem.innerHTML = "";

  btnPular.disabled = false;
  btnPular.style.backgroundColor = "transparent";

  ultimoTempoPontuacao = Date.now();

  criarCacto();
  criarPassaro();
}

function gameOver() {
  jogoAtivo = false;
  mensagem.innerHTML = "💀 Game Over! Clique ou pressione espaço para reiniciar.";
  btnPular.disabled = true;
  btnPular.style.backgroundColor = "#555";

  function ativarReinicio() {
    reiniciarJogo();
  }

  window.addEventListener("keydown", function keyListener(e) {
    if (e.code === "Space") {
      ativarReinicio();
      window.removeEventListener("keydown", keyListener);
    }
  });

  const reinicioTela = () => ativarReinicio();
  window.addEventListener("click", reinicioTela, { once: true });
  window.addEventListener("touchstart", reinicioTela, { once: true });
  btnPular.addEventListener("mousedown", ativarReinicio, { once: true });
  btnPular.addEventListener("touchstart", ativarReinicio, { once: true });
}

requestAnimationFrame(atualizar);
criarCacto();
criarPassaro();
