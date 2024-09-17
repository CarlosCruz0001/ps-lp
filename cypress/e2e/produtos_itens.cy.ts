/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-arrow-callback */
import { Produto } from "../../src/entity/Produto";
import { Item } from "../../src/entity/Item";
const requestOptionsPOST: Partial<Cypress.RequestOptions> = {
  method: "POST",
  url: "/produtos",
  failOnStatusCode: false,
};

describe("Testes sobre o endpoint POST /produtos", () => {
  before(() => {
    cy.task("limparBancoDeDados");
    cy.task("popularBancoDeDadosProduto");
  });

  it("Produto válido", () => {
    cy.fixture("produto").then((produtoValido) => {
      requestOptionsPOST.body = produtoValido;
    });

    cy.request(requestOptionsPOST).then((res) => {
      expect(res.status).to.equal(201);
      const { descricao } = res.body;
      expect(descricao).to.not.null;
    });
  });
});

//teste /itens
const requestOptionsPOSTItem: Partial<Cypress.RequestOptions> = {
  method: "POST",
  url: "/itens",
  failOnStatusCode: false,
};
describe("Testes sobre o endpoint POST /itens", () => {
  let produtoId: number;

  before(() => {
    cy.task("limparBancoDeDados");
    cy.task("popularBancoDeDadosProduto").then((produtos: Produto[]) => {
      if (produtos && produtos.length > 0) {
        produtoId = produtos[0].id;
      } else {
        throw new Error("Nenhum produto foi populado no banco de dados.");
      }
    });
    cy.task("popularBancoDeDadosItem");
  });

  it("Deve criar um item com sucesso", () => {
    const itemValido = {
      quantidade: 10,
      dataChegadaNoEstoque: "2024-09-12T00:00:00Z",
      produtoId: produtoId,
    };

    requestOptionsPOSTItem.body = itemValido;

    cy.request(requestOptionsPOSTItem).then((res) => {
      expect(res.status).to.equal(201);
      const { item } = res.body;
      expect(item).to.have.property("id");
      expect(item.quantidade).to.equal(itemValido.quantidade);
      expect(item.produto.id).to.equal(produtoId);
    });
  });
  it("Deve retornar erro ao tentar criar um item sem o campo 'quantidade'", () => {
    const itemInvalido = {
      dataChegadaNoEstoque: "2024-09-12T00:00:00Z",
      produtoId: produtoId,
    };

    requestOptionsPOSTItem.body = itemInvalido;

    cy.request(requestOptionsPOSTItem).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property(
        "erro",
        "Um ou mais campos obrigatórios não foram enviados.",
      );
    });
  });
  it("Deve retornar erro ao tentar criar um item com data inválida", () => {
    const itemInvalido = {
      quantidade: 10,
      dataChegadaNoEstoque: "data-invalida",
      produtoId: produtoId,
    };

    requestOptionsPOSTItem.body = itemInvalido;

    cy.request(requestOptionsPOSTItem).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body.erro).to.include(
        "Um ou mais campos obrigatórios não foram enviados.",
      );
    });
  });

  it("Deve retornar erro ao tentar criar um item com um produtoId inexistente", () => {
    const itemInvalido = {
      quantidade: 10,
      dataChegadaNoEstoque: "2024-09-12T00:00:00Z",
      produtoId: 99999,
    };

    requestOptionsPOSTItem.body = itemInvalido;
    cy.request(requestOptionsPOSTItem).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body.erro).to.include("Produto não encontrado.");
    });
  });
});

//teste GET produtos
const requestOptionsGETItem: Partial<Cypress.RequestOptions> = {
  method: "GET",
  url: "/itens/produto/:produtoId",
  failOnStatusCode: false,
};

describe("Testes sobre o endpoint GET /itens/produto/:produtoId", () => {
  let produtoId: number;

  before(() => {
    cy.task("limparBancoDeDados");
    cy.task("popularBancoDeDadosProduto").then((produtos: Produto[]) => {
      if (produtos && produtos.length > 0) {
        produtoId = produtos[0].id;
      } else {
        throw new Error("Nenhum produto foi populado no banco de dados.");
      }
    });
    cy.task("popularBancoDeDadosItem");
  });

  it("Deve retornar todos os itens de um produto com sucesso", () => {
    const requestUrl = `/itens/produto/${produtoId}`;
    requestOptionsGETItem.url = requestUrl;

    cy.request(requestOptionsGETItem).then((res) => {
      expect(res.status).to.equal(200);
      const { itens } = res.body;
      expect(itens).to.be.an("array");
      expect(itens.length).to.be.greaterThan(0);

      itens.forEach((item: Item) => {
        expect(item).to.have.property("id");
        expect(item).to.have.property("quantidade");
      });
    });
  });

  it("Deve retornar 404 quando o ID do produto não for fornecido", () => {
    requestOptionsGETItem.url = "/itens/produto/";

    cy.request({ ...requestOptionsGETItem, failOnStatusCode: false }).then(
      (res) => {
        expect(res.status).to.equal(404);
      },
    );
  });

  it("Deve retornar 404 quando o ID do produto não existir", () => {
    const produtoInexistenteId = 99999;

    requestOptionsGETItem.url = `/itens/produto/${produtoInexistenteId}`;

    cy.request({ ...requestOptionsGETItem, failOnStatusCode: false }).then(
      (res) => {
        expect(res.status).to.equal(404);
        const { erro } = res.body;
        expect(erro).to.equal("Produto não encontrado.");
      },
    );
  });
});
