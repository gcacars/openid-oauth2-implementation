/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
class ConsoleAdapter {
  constructor(type) {
    console.log(`Oi, estou aqui, procurando um ${type}`);
  }

  async find(id) {
    console.log(`com o id: ${id}`);
  }
}

export default ConsoleAdapter;
