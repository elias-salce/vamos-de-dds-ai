// Funçções para limpar campo de pesquisa
const campoPesquisa = document.getElementById("campo-pesquisa");
const botaoLimpar = document.getElementById("botao-limpar");

campoPesquisa.addEventListener("input", () => {
  if (campoPesquisa.value.trim() !== "") {
    botaoLimpar.style.display = "block";
  } else {
    botaoLimpar.style.display = "none";
  }
});

botaoLimpar.addEventListener("click", () => {
  campoPesquisa.value = "";
  botaoLimpar.style.display = "none";
  campoPesquisa.focus(); // Mantém o foco no input após limpar
});

// Função para executar pesquisa com tecla Enter
campoPesquisa.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Impede o comportamento padrão do Enter (enviar formulário se houver)
    // Aqui você coloca o código para realizar a busca
    pesquisar(campoPesquisa.value);
  }
});

// Função para padronizar os textos (letras míniculas e sem acentos)
function padronizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace("-", " ");
}

// Função para calcular relevância de um item com base na pesquisa
function calcularRelevancia(dado, campoPesquisa) {
  let relevancia = 0;
  let titulo = padronizarTexto(dado.titulo);
  let tagsTema = padronizarTexto(dado.tagsTema);
  let objetivo = padronizarTexto(dado.objetivo);
  let tagsRelacao = padronizarTexto(dado.tagsRelacao);
  let texto = padronizarTexto(dado.texto);
  // Atribui pesos maiores para correspondências no título,
  // sendo superior a soma dos demais, para priorizar os títulos
  if (titulo.includes(campoPesquisa)) {
    relevancia += 15;
  }

  // Atribui pesos menores para correspondências em outras propriedades,
  // conforme relevância determinada
  if (tagsTema.includes(campoPesquisa)) {
    relevancia += 5;
  }
  if (objetivo.includes(campoPesquisa)) {
    relevancia += 3;
  }
  if (tagsRelacao.includes(campoPesquisa)) {
    relevancia += 2;
  }
  // Atribui um peso ainda menor para correspondências no texto completo
  if (texto.includes(campoPesquisa)) {
    relevancia += 1;
  }
  return relevancia;
}

// Função para abrir o pop-up com os detalhes
function popupDds(id) {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    // Dispositivo móvel detectado, usar a alternativa ao pop-up
    // Redirecionar para a página de detalhes:
    window.location.href = `dds-mobile.html?id=${id}`;
  } else {
    // Dispositivo desktop, abra o pop-up normalmente
    const largura = 850; // Largura da janela pop-up
    const altura = 950; // Altura da janela pop-up
    const esquerda = (window.innerWidth - largura) / 2;
    const topo = (window.innerHeight - altura) / 2;

    const janelaPopup = window.open(
      `dds.html?id=${id}`,
      "Vamos de DDS",
      `width=${largura},height=${altura},left=${esquerda},top=${topo}`
    );

    // Verifica se o pop-up foi bloqueado
    if (janelaPopup === null || typeof janelaPopup === "undefined") {
      alert(
        "Opa, parece que o pop-up foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site, para visualizar seu DDS."
      );
    }
  }
}

// Função de pesquisa, acionada pelo botão "Pesquisar"
function pesquisar() {
  // Obtém a seção HTML onde os resultados serão exibidos
  let section = document.getElementById("resultados-pesquisa");

  // Obtém o valor digitado no campo de pesquisa
  let campoPesquisa = document.getElementById("campo-pesquisa").value;

  // Padroniza o termo de pesquisa para facilitar a comparação
  campoPesquisa = padronizarTexto(campoPesquisa);

  // Verifica se o campo de pesquisa está vazio e exibe uma mensagem
  if (!campoPesquisa || campoPesquisa == " ") {
    section.innerHTML =
      '<div class="alerta"><strong><p>Ops, parece que faltou digitar o tema. Utilize o campo acima.</strong></p><p>Precisa de uma sugestão?<br>Sem problemas, experimente o botão "Surpreenda-me".</p></div>';
    return;
  }

  // Array para armazenar os resultados da pesquisa,
  // com suas respectivas relevâncias
  let resultadosArray = [];

  // Itera sobre cada dado da lista de dados
  for (let dado of dados) {
    // Padroniza os itens para facilitar a comparação
    let titulo = padronizarTexto(dado.titulo);
    let tagsTema = padronizarTexto(dado.tagsTema);
    let objetivo = padronizarTexto(dado.objetivo);
    let tagsRelacao = padronizarTexto(dado.tagsRelacao);
    let texto = padronizarTexto(dado.texto);

    // Verifica se o termo de pesquisa está presente nas propriedades do item
    if (
      titulo.includes(campoPesquisa) ||
      tagsTema.includes(campoPesquisa) ||
      objetivo.includes(campoPesquisa) ||
      tagsRelacao.includes(campoPesquisa) ||
      texto.includes(campoPesquisa)
    ) {
      // Calcula a relevância do item em relação à pesquisa
      let relevancia = calcularRelevancia(dado, campoPesquisa);

      // Adiciona o item e sua relevância ao array de resultados
      resultadosArray.push({ dado, relevancia });
    }
  }

  // Ordena os resultados por relevância em ordem decrescente
  resultadosArray.sort((a, b) => b.relevancia - a.relevancia);

  // Inicializa uma string vazia para armazenar os resultados
  let resultados = "";

  // Itera sobre os resultados ordenados
  for (let resultado of resultadosArray) {
    let dado = resultado.dado;

    // Constrói o HTML para cada item
    resultados += `
    <div class="item-resultado">
      <h2>${dado.titulo}</h2>
      <p><span class="sub-titulo">OBJETIVO: </span>${dado.objetivo}</p>
      <p><span class="sub-titulo">TEMPO MÉDIO: </span>${dado.tempo}</p>
      <details><p>
        <summary><span class="sub-titulo">PREPARAÇÃO PARA O DDS</span><span class="expandir"> (clique para expandir/contrair)</span>
        </summary></p>
        <div class="item-texto">${dado.preparacao}</div>
      </details>
      <details><p>
        <summary><span class="sub-titulo">CONTEÚDO DO DDS</span><span class="expandir"> (clique para expandir/contrair)</span>
        </summary></p>
        <div class="item-texto">${dado.texto}</div>
      </details><br>
      <button class="botao-pg-inteira" onclick="popupDds('${dado.id}', '_blank')">Visualizar em página inteira</button> 
    </div>    
  `;
  }

  // Exibe uma mensagem se nenhum resultado for encontrado
  if (!resultados) {
    resultados =
      '<div class="alerta"><p><strong>Poxa, parece que ainda não temos esse tema. <br>Que tal tentar digitar em outra(s) palavra(s), ou buscar por outro tema hoje?</strong></p> <p>Mas se quiser uma sugestão, você pode clicar no botão "✨ Surpreenda-me", quem sabe não é exatamente o que está procurando.</p></div>';
  }

  // // Atualiza o conteúdo da seção de resultados com os resultados formatados
  section.innerHTML = resultados;
  // Anexa o evento de clique aos botões após a atualização do HTML
  // $(section).on("click", "button", function () {
  //   gerarPDF(this);
  // });
}

// Função para encontrar DDS pelo ID para dds.html
function encontrarId() {
  // Obtém o Id pela url
  let urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get("id");

  // Obtém a seção HTML (dds.html) para impressão
  let section = document.getElementById("resultados-id");

  // Inicializa uma string vazia para armazenar o resultado em dds
  let dds = "";

  // Itera sobre cada dado da lista de dados
  for (let dado of dados) {
    //
    if (dado.id == urlParams.get("id")) {
      // Constrói o HTML para cada item
      dds = `
        <div class="item-resultado">
          <h2>${dado.titulo}</h2>
          <p><span class="sub-titulo">OBJETIVO: </span>${dado.objetivo}</p>
          <p><span class="sub-titulo">TEMPO MÉDIO: </span>${dado.tempo}</p>
          <div class="item-texto">${dado.preparacao}</div>
          <div class="item-texto">${dado.texto}</div> 
        </div>    
      `;
    }
  }
  // Atualiza o conteúdo da seção de resultados com os resultados formatados
  section.innerHTML = dds;

  // Anexa o evento de clique aos botões após a atualização do HTML
  // $(section).on("click", "button", function () {
  //   gerarPDF(this);
  // });
}

// Função para obter dois IDs Alaeatórios
function obterDoisIdsAleatorios() {
  // Clona o array de dados para não modificar o original
  const dadosCopia = [...dados];

  // Embaralha os dados para garantir aleatoriedade
  for (let i = dadosCopia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dadosCopia[i], dadosCopia[j]] = [dadosCopia[j], dadosCopia[i]];
  }

  // Retorna os dois primeiros IDs do array embaralhado
  return dadosCopia.slice(0, 2).map((item) => item.id);
}

// Função para obter os dados com base nos IDs
function obterDadosPorIds(ids) {
  return dados.filter((item) => ids.includes(item.id));
  console.log(dadosSelecionados);
}

// Funçaõ do botão Surpreenda-me
document.getElementById("botao-surpeender").addEventListener("click", () => {
  const idsAleatorios = obterDoisIdsAleatorios();
  const dadosSelecionados = obterDadosPorIds(idsAleatorios);

  // Obtém a seção HTML onde os resultados serão exibidos
  let section = document.getElementById("resultados-pesquisa");

  // Agora você tem os dados em 'dadosSelecionados' e pode exibi-los como desejar
  console.log(dadosSelecionados);

  let resultados = "";

  // Itera sobre os resultados ordenados
  for (let dado of dadosSelecionados) {
    // Constrói o HTML para cada item
    resultados += `
    <div class="item-resultado">
      <h2>${dado.titulo}</h2>
      <p><span class="sub-titulo">OBJETIVO: </span>${dado.objetivo}</p>
      <p><span class="sub-titulo">TEMPO MÉDIO: </span>${dado.tempo}</p>
      <details><p>
        <summary><span class="sub-titulo">PREPARAÇÃO PARA O DDS</span><span class="expandir"> (clique para expandir/contrair)</span>
        </summary></p>
        <div class="item-texto">${dado.preparacao}</div>
      </details>
      <details><p>
        <summary><span class="sub-titulo">CONTEÚDO DO DDS</span><span class="expandir"> (clique para expandir/contrair)</span>
        </summary></p>
        <div class="item-texto">${dado.texto}</div>
      </details>
      <button class="botao-pg-inteira" onclick="popupDds('${dado.id}', '_blank')">Visualizar em página inteira</button> 
    </div>    
  `;
  }
  // // Atualiza o conteúdo da seção de resultados com os resultados formatados
  section.innerHTML = resultados;
});

// Função para exibir uma frase aleatória
function exibirFraseAleatoria() {
  const indiceAleatorio = Math.floor(Math.random() * frases.length);
  const fraseAleatoria = `<div class="frase"><p><span class="sub-frase">💡 Enquanto isso, que tal essa frase para inspirar?</span><br> ${frases[indiceAleatorio]}</p></div>`;

  // Obtém a seção HTML onde os resultados serão exibidos
  let section = document.getElementById("resultados-pesquisa");

  section.innerHTML = fraseAleatoria;
}

// Executa a função exibirFraseAleatoria ao carregar a página
window.onload = exibirFraseAleatoria;
