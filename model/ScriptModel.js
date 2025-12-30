/**
 * Model: Camada de Dados e Lógica de Estado.
 * Centraliza as configurações do pipeline de processamento e o estado dos sensores.
 * Em Visão Robótica, este módulo atua como o registrador de parâmetros do DSP (Digital Signal Processor).
 */
const Model = {
    // Matriz de Parâmetros de Filtro: Define os coeficientes de ajuste da imagem
    filters: {
        gray: 0,        // Escala de cinza (Simplificação de luminância)
        opacity: 100,   // Transparência (Blend de camadas)
        brightness: 100,// Ganho de brilho (Exposição do sensor)
        contrast: 100,  // Amplitude dinâmica (Contraste entre pixels)
        blur: 0,        // Redução de ruído Gaussiano (Filtro passa-baixa)
        saturate: 100,  // Intensidade cromática (Saturação de cor)
        sepia: 0        // Transformação de mapeamento de cor (Lookup Table simulada)
    },

    // Estado do Fluxo: Identifica a fonte de dados ativa (Stream ou Frame estático)
    activeSource: 'placeholder',

    /**
     * Atualiza um parâmetro específico no pipeline de filtros.
     * @param {string} name - Nome do parâmetro (ex: 'brightness').
     * @param {string|number} value - Novo valor quantitativo para o filtro.
     */
    updateFilter(name, value) {
        // Conversão explícita para Number para garantir integridade nos cálculos de telemetria
        this.filters[name] = Number(value);
    },

    /**
     * Define configurações predefinidas (Presets) para análise rápida.
     * Simula modos de operação de sensores específicos (ex: Visão Noturna ou Alto Contraste).
     * @param {string} tipo - Nome do preset a ser carregado.
     */
    setPreset(tipo) {
        if (tipo === 'sepia') {
            // Preset Sépia: Simula visualização de sensores térmicos antigos ou luz quente
            this.filters = { gray: 0, opacity: 100, brightness: 100, contrast: 120, blur: 0, saturate: 120, sepia: 100 };
        } else if (tipo === 'noir') {
            // Preset Noir: Focado em análise de formas e contornos (Alta escala de cinza e contraste)
            this.filters = { gray: 100, opacity: 100, brightness: 90, contrast: 150, blur: 0, saturate: 0, sepia: 0 };
        } else if (tipo === 'vibrant') {
            /** * Preset Vibrant (Efeito Colorido): 
             * Otimiza a saturação e contraste para destacar objetos coloridos (Blob Detection).
             */
            this.filters = { gray: 0, opacity: 100, brightness: 110, contrast: 130, blur: 0, saturate: 250, sepia: 0 };
        }
    }
};