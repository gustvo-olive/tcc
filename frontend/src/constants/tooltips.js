/**
 * Definições centrais de ajuda para todas as ferramentas da plataforma.
 * Cada tooltip contém um conceito técnico e a indicação de quando utilizá-lo.
 */
export const TOOLTIPS = {
  // Módulo 1: Curadoria e Limpeza
  'nulos': {
    conceito: "Elimina linhas que possuem dados faltantes (NaN). Dados ausentes podem enviesar médias e quebrar algoritmos.",
    quando: "Sempre que as colunas essenciais para sua pesquisa (ex: Notas) não estiverem preenchidas."
  },
  'ausentes': {
    conceito: "Remove candidatos que não compareceram aos dias de prova (SITUAÇÃO != OK).",
    quando: "Você deseja analisar apenas o desempenho real de quem de fato realizou o exame."
  },
  'outliers': {
    conceito: "Exclui registros com valores impossíveis (ex: idade 250) ou extremamente atípicos que distorcem a realidade estatística.",
    quando: "Houver erros de digitação ou casos muito fora da curva que 'puxam' a média para cima ou para baixo."
  },
  'duplicatas': {
    conceito: "Apaga registros idênticos que aparecem mais de uma vez na mesma base de dados.",
    quando: "Houver falhas na exportação dos dados que resultaram em repetições de um mesmo aluno."
  },
  'padronizar': {
    conceito: "Uniformiza formatos de texto, datas e moedas para um padrão único processável pelo computador.",
    quando: "Os dados vêm de fontes diferentes (ex: datas com barra e com traço na mesma coluna)."
  },
  'imputar': {
    conceito: "Preenche buracos nos dados usando estimativas como a Média ou Mediana, evitando jogar a linha inteira fora.",
    quando: "A perda de dados por remoção for muito alta e você precisar manter o tamanho da amostra."
  },
  'linguas': {
    conceito: "Unifica variações de nomes de categorias (ex: transformar 'ingles', 'ING' e 'Inglês' em apenas 'INGLÊS').",
    quando: "Variáveis categóricas tiverem erros de ortografia ou abreviações inconsistentes."
  },

  // Módulo 1: Engenharia de Atributos
  'media_ponderada': {
    conceito: "Cria uma nova nota dando pesos diferentes para cada matéria, refletindo a importância de cada área.",
    quando: "Você deseja criar um indicador de desempenho focado em áreas específicas (ex: Peso 2 para Redação)."
  },
  'binning_idade': {
    conceito: "Transforma a idade numérica em categorias sociais (ex: Jovem, Adulto, Idoso).",
    quando: "Comparar o comportamento de gerações for mais importante do que olhar para cada ano individualmente."
  },
  'normalizar': {
    conceito: "Coloca diferentes notas na escala de 0 a 1, permitindo comparar provas com pontuações máximas distintas.",
    quando: "Preparar os dados para modelos de Inteligência Artificial ou comparar escalas diferentes de igual para igual."
  },

  // Módulo 1: Amostragem
  'amostra_simples': {
    conceito: "Realiza um sorteio puro e aleatório de registros. Cada aluno tem a mesma chance de ser escolhido.",
    quando: "A base original for muito pesada e você precisar de um subconjunto rápido para testes iniciais."
  },
  'amostra_estratificada': {
    conceito: "Divide a população em grupos (estratos) e sorteia proporcionalmente de cada um, mantendo a 'cara' da população original.",
    quando: "For essencial evitar o viés e garantir que minorias ou grupos específicos sejam representados na amostra."
  },

  // Módulo 2: Inferência
  'shapiro': {
    conceito: "Testa se os dados seguem a Distribuição Normal. É o teste mais preciso para amostras até 5.000 registros.",
    quando: "Antes de escolher entre testes paramétricos (T-Student) ou não-paramétricos (Mann-Whitney)."
  },
  'ks': {
    conceito: "Testa a normalidade comparando a sua base com uma curva teórica perfeita. Ideal para grandes volumes de dados.",
    quando: "Sua amostra for superior a 5.000 registros (cenário comum no ENEM completo)."
  },
  'levene': {
    conceito: "Testa se a variabilidade (espalhamento) das notas é igual entre os grupos comparados.",
    quando: "Antes de rodar uma ANOVA ou Teste T para garantir que a comparação de médias seja justa."
  },
  'ttest': {
    conceito: "Compara as médias de dois grupos independentes (ex: Homens vs Mulheres).",
    quando: "Os dados forem normais e você quiser saber se um grupo é superior ao outro."
  },
  'mannwhitney': {
    conceito: "Compara a posição (ranking) de dois grupos, sendo imune a valores extremos (outliers).",
    quando: "A normalidade falhar ou os dados forem muito assimétricos."
  },
  'anova': {
    conceito: "Analisa se existe diferença entre 3 ou mais grupos simultaneamente (ex: Escolas Públicas, Privadas e Federais).",
    quando: "Você quiser comparar múltiplas categorias e os dados forem normais e homogêneos."
  },
  'kruskal': {
    conceito: "A alternativa não-paramétrica à ANOVA. Compara múltiplos grupos através de postos.",
    quando: "Comparar 3 ou mais grupos quando a normalidade ou a homogeneidade falharem."
  }
};
