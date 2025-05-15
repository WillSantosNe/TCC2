const modal = document.querySelector("#meuModal");
const abrir = document.querySelector("#abrirModal");
const fechar = document.querySelector("#fecharModal");

abrir.onclick = function (e){
    e.preventDefault(); // impede o comportamento padrão do link
    modal.showModal();
}

fechar.onclick = function(e){
    e.preventDefault();
    modal.close();
}

modal.addEventListener("click", evento => {
    if (evento.target === modal) {
        modal.close();
    }
});