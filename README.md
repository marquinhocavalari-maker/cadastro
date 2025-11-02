# CONTROLE+

Um dashboard moderno para gerenciar contatos e campanhas.

## Visão Geral

Esta é uma aplicação frontend de página única (SPA) construída com React e TypeScript. Ela fornece uma interface de usuário para gerenciar dados relacionados a estações de rádio, prefeituras, empresários, artistas e campanhas de marketing.

A aplicação é projetada para rodar diretamente no navegador sem um passo de compilação (build), utilizando `importmap` para carregar as dependências.

## Funcionalidades Principais

- **Dashboard:** Visão geral com estatísticas e lembretes de lançamentos.
- **Gerenciamento de Cadastros:** Seções dedicadas para Rádios, Prefeituras, Empresários, Artistas e Músicas, Promoções e Eventos.
- **Campanhas de Marketing:** Ferramenta para criar e disparar campanhas de e-mail para contatos segmentados.
- **Sincronização e Formulário Web:** Integração com Google Sheets para receber novos cadastros de rádios de um formulário público.
- **Backup Local:** Funcionalidades para exportar (backup) e importar todos os dados da aplicação localmente.

## Estrutura

O aplicativo utiliza `localStorage` para persistir todos os dados no navegador do usuário, garantindo que o trabalho não seja perdido entre as sessões.