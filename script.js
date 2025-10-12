const dino = document.getElementById("dino");
const gameArea = document.querySelector(".game-area");
const mensagem = document.getElementById("mensagem");
const pontuacao = document.getElementById("pontuacao");
const btnPular = document.getElementById("btnPular");

let pontos = 0;
let velocidadeCacto = 4;
let intervaloCacto = 2000;
let intervaloPontuacao = 200;
let intervaloPontuacaoAtual;
let jogoAtivo = true;

let pulando = false;
let segurando = false;
let posY = 0;
let velocidade = 0;
let gravidade = 1;
let impulso = 15;

let timerCacto; // para controlar o setTimeout da criação de cactos

let tempoInicio;
const tempoMinimo = 200;
const tempoMaximo = 600;

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

// --- Loop do jogo ---
function atualizar() {
  if (pulando) {
    const tempoDecorrido = Date.now() - tempoInicio;

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

  requestAnimationFrame(atualizar);
}
requestAnimationFrame(atualizar);

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

    const mover = setInterval(() => {
      if (!jogoAtivo) {
        clearInterval(mover);
        return;
      }

      posX -= velocidadeCacto;
      novoCacto.style.left = posX + "px";

      const dinoRect = dino.getBoundingClientRect();
      const cactoRect = novoCacto.getBoundingClientRect();

      // Colisão
      if (
        dinoRect.right > cactoRect.left &&
        dinoRect.left < cactoRect.right &&
        dinoRect.bottom > cactoRect.top
      ) {
        gameOver();
        clearInterval(mover);
      }

      // Remover cacto quando sair da tela
      if (posX < -60) {
        novoCacto.remove();
        clearInterval(mover);
      }
    }, 10);

    espacamento += novoCacto.offsetWidth + 10;
  }

  // --- Próxima geração ---
  const minIntervalo = 1000;
  let maxIntervalo = pontos > 400 ? 400 : intervaloCacto;
  const proximoCacto = Math.random() * (maxIntervalo - minIntervalo) + minIntervalo;

  // Limpar timer antigo antes de criar novo
  clearTimeout(timerCacto);
  timerCacto = setTimeout(criarCacto, proximoCacto);
}


// --- Pontuação ---
function iniciarPontuacao() {
  intervaloPontuacaoAtual = setInterval(() => {
    if (!jogoAtivo) return;

    pontos++;
    pontuacao.innerText = `Pontos: ${pontos}`;

    if (pontos % 100 === 0) aumentarDificuldade();
  }, intervaloPontuacao);
}

// --- Dificuldade ---
function aumentarDificuldade() {
  if (pontos <= 400) 
  velocidadeCacto += 1;
  intervaloCacto = 2000;
  intervaloPontuacao = Math.max(50, intervaloPontuacao - 20);

  clearInterval(intervaloPontuacaoAtual);
  iniciarPontuacao();
}
// --- REINICIAR JOGO ---
function reiniciarJogo() {
   clearTimeout(timerCacto); // limpa timer da geração
  document.querySelectorAll(".cacto").forEach(c => c.remove());
  
  // Resetar variáveis
  pontos = 0;
  velocidadeCacto = 4;
  intervaloCacto = 2000;
  intervaloPontuacao = 200;
  posY = 0;
  pulando = false;
  segurando = false;
  velocidade = 0;
  jogoAtivo = true;

  // Resetar pontuação e mensagem
  pontuacao.innerText = `Pontos: 0`;
  mensagem.innerHTML = "";

  // Remover todos os cactos antigos
  document.querySelectorAll(".cacto").forEach(c => c.remove());

  // Reativar botão
  btnPular.disabled = false;
  btnPular.style.backgroundColor = "transparent";

  // Iniciar loops do jogo
  iniciarPontuacao();
  criarCacto();
}


// --- Game Over ---
function gameOver() {
  jogoAtivo = false;
  mensagem.innerHTML = "💀 Game Over! Clique ou pressione espaço ou o botão para reiniciar.";
  btnPular.disabled = true;
  btnPular.style.backgroundColor = "#555";
  clearInterval(intervaloPontuacaoAtual);

  // Função que reinicia o jogo
  function ativarReinicio() {
    reiniciarJogo();
  }

  // Listener para tecla espaço
  window.addEventListener("keydown", function keyListener(e) {
    if (e.code === "Space") {
      ativarReinicio();
      window.removeEventListener("keydown", keyListener);
    }
  });

  // Listener para qualquer clique na tela
  window.addEventListener("click", function clickListener() {
    ativarReinicio();
    window.removeEventListener("click", clickListener);
  }, { once: true });

  // Listener para o botão de pular
  btnPular.addEventListener("click", function botaoListener() {
    ativarReinicio();
    btnPular.removeEventListener("click", botaoListener);
  });
}


// --- Início ---
iniciarPontuacao();
criarCacto();

