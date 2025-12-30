/**
 * VideoService: Camada de Infraestrutura e Persistência.
 * Responsável pelo Data Logging (registro de dados) do pipeline visual.
 * Utiliza APIs modernas de stream para escrita direta em disco, evitando sobrecarga de memória RAM.
 */
const VideoService = {
    mediaRecorder: null,   // Instância do motor de codificação de vídeo
    fileHandle: null,      // Referência do objeto de arquivo no sistema operacional
    writableStream: null,  // Fluxo de escrita ativa para o disco rígido

    /**
     * Inicializa a aquisição de dados e o stream de persistência.
     * @param {MediaStream} stream - Fluxo processado originário do pipeline (canvas-proc).
     */
    async startRecording(stream) {
        try {
            /** * 1. Interface de Persistência (File System Access API)
             * Solicita ao operador o local de salvamento do log de vídeo.
             * Fundamental para garantir que grandes volumes de dados não saturem a memória do navegador.
             */
            this.fileHandle = await window.showSaveFilePicker({
                suggestedName: `robotic-log-${Date.now()}.webm`,
                types: [{
                    description: 'Video WebM (Container de código aberto)',
                    accept: { 'video/webm': ['.webm'] },
                }],
            });

            // 2. Abertura do canal de escrita para o sistema de arquivos
            this.writableStream = await this.fileHandle.createWritable();

            /**
             * 3. Configuração do Encoder (MediaRecorder)
             * Seleciona o codec mais eficiente disponível (VP9 ou VP8).
             * VP9 é preferível em Visão Computacional por manter melhor fidelidade de detalhes.
             */
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
                            ? 'video/webm;codecs=vp9' 
                            : 'video/webm';

            this.mediaRecorder = new MediaRecorder(stream, { 
                mimeType,
                videoBitsPerSecond: 2500000 // Taxa de 2.5 Mbps: Equilíbrio entre performance e detalhamento
            });

            /**
             * 4. Ciclo de Escrita (Streaming Data)
             * Evento disparado periodicamente (Time Slicing).
             * Transfere buffers de vídeo codificado diretamente para o fluxo de escrita.
             */
            this.mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && this.writableStream) {
                    // Escrita atômica: Grava a "fatia" do vídeo no arquivo real em tempo de execução
                    await this.writableStream.write(event.data);
                }
            };

            // Inicia o processamento em fatias de 1000ms (1 segundo)
            // Essencial para evitar perda de dados em caso de falha crítica do sistema
            this.mediaRecorder.start(1000); 
            
            console.log("Pipeline de gravação e Data Logging iniciado.");
        } catch (error) {
            console.error("Falha crítica no VideoService:", error);
            throw error; // Propaga a exceção para o Controller gerenciar a UI
        }
    },

    /**
     * Finaliza o pipeline de gravação e libera os recursos de hardware.
     * @returns {Promise} Resolvida quando o arquivo é fechado com sucesso.
     */
    async stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) return resolve();

            this.mediaRecorder.onstop = async () => {
                // Finaliza o fluxo de escrita e libera o lock do arquivo no SO
                if (this.writableStream) {
                    await this.writableStream.close();
                    this.writableStream = null;
                }
                console.log("Log de dados finalizado e persistido com sucesso.");
                resolve();
            };

            this.mediaRecorder.stop();
        });
    }
};