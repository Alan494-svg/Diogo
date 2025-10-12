const dino = document.getElementById("dino");
const cacto = document.getElementById("cacto");
const mensagem = document.getElementById("mensagem");
const pontuacao = document.getElementById("pontuacao");

let pontos = 0;
let contadorPontos;

document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    pular();
  }
});

function pular() {
  if (!dino.classList.contains("pulo")) {
    dino.classList.add("pulo");

    setTimeout(() => {
      dino.classList.remove("pulo");
    }, 500);
  }
}

contadorPontos = setInterval(()=> {
  pontos++;
  pontuacao.innerText = `Pontos: ${pontos}`;
}, 200);

let gameOver = setInterval(() => {
  const dinoRect = dino.getBoundingClientRect();
  const cactoRect = cacto.getBoundingClientRect();

  if (
    dinoRect.right > cactoRect.left &&
    dinoRect.left < cactoRect.right &&
    dinoRect.bottom > cactoRect.top
  ) {
    cacto.style.animation = "none";
    mensagem.innerHTML = "💀 Game Over!";
    clearInterval(gameOver);
    clearInterval(contadorPontos);
    document.getElementById("reiniciar").style.display = "inline-block";
  }
}, 10);
