/**
 * Controller: O Orquestrador do Robotic Vision Engine.
 * Ajustado para garantir o fluxo de dados entre Sensor -> Canvas -> Gravação.
 */
const Controller = {
    isRecording: false,
    timerInterval: null,
    secondsElapsed: 0,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 1. Sliders de Ajuste
        ['brightness', 'contrast', 'saturate', 'gray', 'opacity', 'blur'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    Model.updateFilter(id, e.target.value);
                    View.render(Model.filters);
                    this.drawHistogram(); 
                });
            }
        });

        // 2. Aquisição de Sensor Webcam
        document.getElementById('btn-webcam')?.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                View.webcam.srcObject = stream;
                
                // IMPORTANTE: Esperar os metadados para saber o tamanho real do vídeo
                View.webcam.onloadedmetadata = () => {
                    View.webcam.play();
                    View.webcam.style.display = 'block';
                    View.preview.style.display = 'none';
                    View.placeholder.style.display = 'none';
                    Model.activeSource = 'video';
                    this.startVideoLoop(); // Inicia o pipeline de renderização no Canvas
                };
            } catch (e) {
                console.error("Erro ao acessar sensor óptico:", e);
                alert("Câmera não permitida ou não encontrada.");
            }
        });

        // 3. Upload de Arquivos
        document.getElementById('upload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    View.preview.src = event.target.result;
                    View.preview.style.display = 'block';
                    View.webcam.style.display = 'none';
                    View.placeholder.style.display = 'none';
                    Model.activeSource = 'image';

                    View.preview.onload = () => {
                        View.render(Model.filters);
                        this.drawHistogram();
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        // 4. Botão de Bordas
        document.getElementById('edge-btn')?.addEventListener('click', () => {
            const edgeStyle = 'grayscale(100%) contrast(1000%) invert(100%)';
            View.preview.style.filter = edgeStyle;
            View.webcam.style.filter = edgeStyle;
            this.drawHistogram();
        });

        // 5. Reset do Sistema
        document.getElementById('reset')?.addEventListener('click', () => {
            Model.filters = { gray: 0, opacity: 100, brightness: 100, contrast: 100, blur: 0, saturate: 100, sepia: 0 };
            Model.activeSource = 'placeholder';

            if (View.webcam.srcObject) {
                View.webcam.srcObject.getTracks().forEach(track => track.stop());
                View.webcam.srcObject = null;
            }

            View.updateSliders(Model.filters);
            View.render(Model.filters);
            View.resetInterface();
        });

        // 6. Download de Foto
        document.getElementById('download-btn')?.addEventListener('click', (e) => {
            if (Model.activeSource !== 'image') {
                alert("Carregue uma imagem para salvar.");
                e.preventDefault();
                return;
            }
            this.prepararDownload();
        });

        // 7. DATA LOGGING: Gravação de Vídeo (CORRIGIDO)
        document.getElementById('record-btn')?.addEventListener('click', async () => {
            if (Model.activeSource !== 'video') {
                alert("Ative a webcam para gravar o fluxo de dados.");
                return;
            }

            const btn = document.getElementById('record-btn');
            const timerUI = document.getElementById('recording-timer');

            if (!this.isRecording) {
                try {
                    // Garantimos que o Canvas Processado está ativo e capturamos o stream dele
                    const stream = View.procCanvas.captureStream(30); 
                    
                    await VideoService.startRecording(stream);

                    this.isRecording = true;
                    this.secondsElapsed = 0;

                    timerUI.classList.remove('hidden');
                    timerUI.classList.add('flex');
                    
                    this.timerInterval = setInterval(() => {
                        this.secondsElapsed++;
                        const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
                        const secs = (this.secondsElapsed % 60).toString().padStart(2, '0');
                        document.getElementById('timer-display').innerText = `${mins}:${secs}`;
                    }, 1000);

                    btn.innerText = "🛑 Parar Gravação";
                    btn.classList.add('bg-red-600', 'animate-pulse');
                } catch (e) {
                    console.error("Falha no pipeline de gravação:", e);
                    alert("Erro ao iniciar gravação. Verifique se está em HTTPS ou localhost.");
                }
            } else {
                await VideoService.stopRecording();
                clearInterval(this.timerInterval);
                this.isRecording = false;
                timerUI.classList.replace('flex', 'hidden');
                btn.innerText = "📹 Gravar Vídeo";
                btn.classList.remove('bg-red-600', 'animate-pulse');
            }
        });
    },

    /**
     * Ciclo de Renderização: Essencial para a gravação.
     * Sem este loop, o Canvas fica estático e a gravação falha.
     */
    startVideoLoop() {
        if (Model.activeSource === 'video') {
            this.drawHistogram(); // Esta função agora desenha o vídeo no Canvas a cada frame
            requestAnimationFrame(() => this.startVideoLoop());
        }
    },

    /**
     * drawHistogram: Além de analisar os pixels, ele alimenta o Canvas de saída.
     */
    drawHistogram() {
        const source = Model.activeSource === 'video' ? View.webcam : View.preview;
        // Verifica se há sinal de vídeo ativo
        if (Model.activeSource === 'video' && (!source.srcObject || source.readyState < 2)) return;
        if (Model.activeSource === 'image' && !source.src) return;

        const pCanvas = View.procCanvas;
        const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });
        const hCanvas = View.histCanvas;
        const hCtx = hCanvas.getContext('2d');

        pCanvas.width = source.videoWidth || source.naturalWidth || 640;
        pCanvas.height = source.videoHeight || source.naturalHeight || 480;

        // APLICAÇÃO DOS FILTROS NO CANVAS (Isso faz com que o vídeo gravado tenha os efeitos)
        pCtx.filter = getComputedStyle(source).filter;
        pCtx.drawImage(source, 0, 0, pCanvas.width, pCanvas.height);

        // EXTRAÇÃO DE TELEMETRIA
        const imgData = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height).data;
        const rHist = new Array(256).fill(0), gHist = new Array(256).fill(0), bHist = new Array(256).fill(0);

        for (let i = 0; i < imgData.length; i += 4) {
            rHist[imgData[i]]++;
            gHist[imgData[i + 1]]++;
            bHist[imgData[i + 2]]++;
        }

        hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
        hCtx.globalCompositeOperation = 'screen';

        const drawChannel = (data, color) => {
            hCtx.fillStyle = color;
            const maxVal = Math.max(...data);
            for (let i = 0; i < 256; i++) {
                const h = (data[i] / maxVal) * hCanvas.height;
                hCtx.fillRect(i * (hCanvas.width / 256), hCanvas.height - h, 2, h);
            }
        };

        drawChannel(rHist, '#ff4d4d');
        drawChannel(gHist, '#2ecc71');
        drawChannel(bHist, '#3498db');
    },

    prepararDownload() {
        const canvas = View.procCanvas;
        const img = View.preview;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = getComputedStyle(img).filter;
        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a'); // Cria link temporário
        link.href = canvas.toDataURL("image/png");
        link.download = `vision-capture-${Date.now()}.png`;
        link.click();
    }
};

// Funções Globais mantidas...
window.aplicarPreset = (tipo) => {
    Model.setPreset(tipo);
    View.updateSliders(Model.filters);
    View.render(Model.filters);
    Controller.drawHistogram();
};

window.separarCanal = (canal) => {
    let filterStyle = '';
    if (canal === 'r') filterStyle = 'sepia(100%) hue-rotate(-50deg) saturate(1000%) contrast(120%)';
    else if (canal === 'g') filterStyle = 'sepia(100%) hue-rotate(60deg) saturate(1000%) contrast(120%)';
    else if (canal === 'b') filterStyle = 'sepia(100%) hue-rotate(180deg) saturate(1000%) contrast(120%)';

    View.preview.style.filter = filterStyle;
    View.webcam.style.filter = filterStyle;
    Controller.drawHistogram();
};

window.inverterCores = () => {
    const targets = [View.preview, View.webcam];
    targets.forEach(el => {
        let currentFilter = el.style.filter || "";
        el.style.filter = currentFilter.includes("invert(100%)") 
            ? currentFilter.replace("invert(100%)", "").trim() 
            : (currentFilter + " invert(100%)").trim();
    });
    Controller.drawHistogram();
};

document.addEventListener('DOMContentLoaded', () => Controller.init());