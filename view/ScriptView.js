/**
 * View: Camada de Interface e Renderização.
 * Responsável pela manipulação direta do DOM e atualização dos componentes visuais.
 * No contexto de Visão Robótica, gerencia o output dos sensores e os dados de telemetria.
 */
const View = {
    // Acesso aos sensores e elementos de exibição via Getters
    // Facilita a manutenção e garante acesso ao estado atual do DOM
    get preview() { return document.getElementById('preview'); },
    get webcam() { return document.getElementById('webcam'); },
    get placeholder() { return document.getElementById('placeholder-text'); },
    get histCanvas() { return document.getElementById('histogram-canvas'); },
    get procCanvas() { return document.getElementById('canvas-proc'); },
    get downloadBtn() { return document.getElementById('download-btn'); },

    /**
     * Aplica a matriz de filtros aos sensores ativos (Webcam ou Imagem).
     * @param {Object} filters - Objeto contendo os valores de processamento de sinal.
     */
    render(filters) {
        // Interpolação de String para construção do pipeline de filtros CSS
        const f = `grayscale(${filters.gray}%) sepia(${filters.sepia}%) opacity(${filters.opacity}%) brightness(${filters.brightness}%) contrast(${filters.contrast}%) blur(${filters.blur}px) saturate(${filters.saturate}%)`;
        
        // Aplica o sinal processado em ambos os canais de saída
        this.preview.style.filter = f;
        this.webcam.style.filter = f;
    },

    /**
     * Sincroniza os Sliders da Interface com o estado interno do Model.
     * Útil para operações de Reset ou aplicação de Presets Automáticos.
     * @param {Object} filters - Estado atual dos filtros no Model.
     */
    updateSliders(filters) {
        for (let key in filters) {
            const el = document.getElementById(key);
            // Atualiza o componente visual (UI) para refletir o valor lógico
            if (el) el.value = filters[key];
        }
    },

    /**
     * Reinicializa a interface de visualização.
     * Limpa os buffers de imagem e restaura os placeholders do sistema.
     */
    resetInterface() {
        // Reseta as fontes de entrada de dados
        this.preview.src = "";
        this.preview.style.display = 'none';
        this.webcam.style.display = 'none';
        
        // Restaura o estado inicial da UI
        this.placeholder.style.display = 'flex';
        this.downloadBtn.classList.add('hidden');
        
        // Limpa o Canvas de Histograma (Buffer de Telemetria)
        const hCtx = this.histCanvas.getContext('2d');
        hCtx.clearRect(0, 0, this.histCanvas.width, this.histCanvas.height);
    }
};