const dino = document.getElementById("dino");
const gameArea = document.querySelector(".game-area");
const mensagem = document.getElementById("mensagem");
const pontuacao = document.getElementById("pontuacao");
const btnPular = document.getElementById("btnPular");
const VELOCIDADE_INICIAL = 10; // aqui você define a nova velocidade
let velocidadeCacto = VELOCIDADE_INICIAL;


let pontos = 0;
let intervaloCacto = 2000;
let jogoAtivo = true;

let pulando = false;
let segurando = false;
let posY = 0;
let velocidade = 0;
let gravidade = 2;
let impulso = 12;

let timerCacto; // para controlar a criação de cactos
let tempoInicio;
const tempoMinimo = 200;
const tempoMaximo = 600;

let cactos = []; // array global de cactos

let ultimoTempoPontuacao = Date.now(); // usado para pontuação baseada no tempo

// --- Controles ---
document.addEventListener("keydown", e => { if (e.code === "Space") iniciarPulo(); });
document.addEventListener("keyup", e => { if (e.code === "Space") terminarPulo(); });

btnPular.addEventListener("mousedown", iniciarPulo);
btnPular.addEventListener("mouseup", terminarPulo);
btnPular.addEventListener("touchstart", iniciarPulo);
btnPular.addEventListener("touchend", terminarPulo);

// --- Pulo ---
function iniciarPulo() {
  if (!pulando && jogoAtivo) {
    pulando = true;
    segurando = true;
    tempoInicio = Date.now();
    velocidade = impulso;
  }
}
function terminarPulo() { segurando = false; }

// --- Loop principal ---
function atualizar() {
  const agora = Date.now();

  // --- Atualizar pontuação baseado no tempo ---
  if (jogoAtivo) {
    const delta = agora - ultimoTempoPontuacao;
    if (delta >= 100) { // 1 ponto a cada 100ms
      pontos += Math.floor(delta / 100);
      ultimoTempoPontuacao = agora;
      pontuacao.innerText = `Pontos: ${pontos}`;

      // Aumentar dificuldade a cada 100 pontos
      if (pontos % 100 === 0) aumentarDificuldade();
    }
  }

  // --- Pulo do dino ---
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

  // --- Mover cactos ---
  for (let i = cactos.length - 1; i >= 0; i--) {
    const cacto = cactos[i];
    cacto.x -= velocidadeCacto;
    cacto.element.style.left = cacto.x + "px";

    const dinoRect = dino.getBoundingClientRect();
    const cactoRect = cacto.element.getBoundingClientRect();

    // Colisão
    if (
      dinoRect.right > cactoRect.left &&
      dinoRect.left < cactoRect.right &&
      dinoRect.bottom > cactoRect.top
    ) {
      gameOver();
    }

    // Remover cacto saindo da tela
    if (cacto.x < -60) {
      cacto.element.remove();
      cactos.splice(i, 1);
    }
  }

  requestAnimationFrame(atualizar);
}

// --- Criar cactos ---
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

  const minIntervalo = 1000;
  let maxIntervalo = pontos > 400 ? 400 : intervaloCacto;
  const proximoCacto = Math.random() * (maxIntervalo - minIntervalo) + minIntervalo;

  clearTimeout(timerCacto);
  timerCacto = setTimeout(criarCacto, proximoCacto);
}

// --- Aumentar dificuldade ---
function aumentarDificuldade() {
  if (pontos <= 400) velocidadeCacto += 1;
}

// --- Reiniciar jogo ---
function reiniciarJogo() {
  clearTimeout(timerCacto);
  cactos.forEach(c => c.element.remove());
  cactos = [];

  pontos = 0;
  velocidadeCacto = VELOCIDADE_INICIAL; // usa a velocidade inicial configurada
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
}


// --- Game Over ---
function gameOver() {
  jogoAtivo = false;
  mensagem.innerHTML = "💀 Game Over! Clique ou pressione espaço ou o botão para reiniciar.";
  btnPular.disabled = true;
  btnPular.style.backgroundColor = "#555";

  function ativarReinicio() {
    reiniciarJogo();
  }

  // Espaço
  window.addEventListener("keydown", function keyListener(e) {
    if (e.code === "Space") {
      ativarReinicio();
      window.removeEventListener("keydown", keyListener);
    }
  });

  // Clique/touch na tela
  const reinicioTela = () => ativarReinicio();
  window.addEventListener("click", reinicioTela, { once: true });
  window.addEventListener("touchstart", reinicioTela, { once: true });

  // Botão de pular
  btnPular.addEventListener("mousedown", ativarReinicio, { once: true });
  btnPular.addEventListener("touchstart", ativarReinicio, { once: true });
}

// --- Início ---
requestAnimationFrame(atualizar);
criarCacto();

