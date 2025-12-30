# robotic-vision-engine
Um emulador de visão computacional de alto desempenho que implementa arquitetura MVC para análise espectral de imagens, detecção estrutural de bordas e gravação de fluxos processados.

<img width="868" height="640" alt="capturahideograma" src="https://github.com/user-attachments/assets/58a84a56-49ca-42da-abc8-2f8e04646160" />


JS Image Studio - Robotic Vision Engine
Este projeto é um simulador de processamento de imagem de alto desempenho desenvolvido em JavaScript puro, focado nos fundamentos de Visão Computacional e Visão Robótica. A aplicação permite o tratamento de fluxos de vídeo em tempo real para extração de características estruturais e análise cromática.

🤖 Foco em Visão Robótica
Diferente de editores artísticos, este motor foi construído para simular etapas críticas de um pipeline de robótica:

Segmentação de Imagem: Através da decomposição de canais RGB para isolar objetos por cor.

Análise Estrutural: Detecção de bordas para identificação de formas e perímetros.

Análise Térmica/Negativa: Inversão de polaridade cromática para identificação de padrões em ambientes de baixa luminosidade.

Telemetria de Dados: Histograma dinâmico para análise de exposição e normalização de sensores ópticos.

🛠️ 
Arquitetura MVC (Model-View-Controller): Separação clara de responsabilidades, garantindo manutenibilidade e escalabilidade do software.

Manipulação de Low-level Data: Processamento de arrays de pixels via Canvas API e ImageData.

Real-time Streaming: Integração com Webcam API e MediaRecorder API para captura e gravação de dados processados.

Design de Interface (UX/UI): Interface responsiva e funcional construída com Tailwind CSS.





Implementação de conceitos inspirados na biblioteca OpenCV, traduzidos para o ecossistema Web.

Comunicação Técnica: Código documentado e estruturado para facilitar a colaboração em equipe e futuras revisões.

🚀 Funcionalidades Principais
[x] Processamento em Tempo Real: Filtros aplicados diretamente no fluxo da webcam.

[x] Histograma Dinâmico: Monitoramento de níveis de Vermelho, Verde e Azul.

[x] Análise de Canais: Isolamento individual dos canais R, G e B.

[x] Detecção de Bordas: Algoritmo para realce de contrastes estruturais.

[x] Gravador de Estúdio: Exportação de vídeo processado em formato .webm.


📂 Estrutura do Projeto
Plaintext

├── model/           # Lógica de dados e estados dos filtros

├── view/            # Renderização de interface e manipulação do DOM

├── controller/      # Orquestração de eventos e regras de negócio

├── service/         # Serviços auxiliares (Gravação de vídeo/IO)

└── index.html       # Entry point da aplicação
