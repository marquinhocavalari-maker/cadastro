# CONTROLE+

Um dashboard moderno para gerenciar contatos e campanhas.

## Visão Geral

Esta é uma aplicação frontend de página única (SPA) construída com React e TypeScript, utilizando Vite como ferramenta de build e desenvolvimento. Ela fornece uma interface de usuário para gerenciar dados relacionados a estações de rádio, prefeituras, empresários, artistas e campanhas de marketing.

A aplicação utiliza `localStorage` para persistir todos os dados no navegador do usuário, garantindo que o trabalho não seja perdido entre as sessões.

## Funcionalidades Principais

- **Dashboard:** Visão geral com estatísticas e lembretes de lançamentos.
- **Gerenciamento de Cadastros:** Seções dedicadas para Rádios, Prefeituras, Empresários, Artistas e Músicas, Promoções e Eventos.
- **Campanhas de Marketing:** Ferramenta para criar e disparar campanhas de e-mail para contatos segmentados.
- **Sincronização e Formulário Web:** Integração com Google Sheets para receber novos cadastros de rádios de um formulário público.
- **Backup Local:** Funcionalidades para exportar (backup) e importar todos os dados da aplicação localmente.

## Como Executar

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).
