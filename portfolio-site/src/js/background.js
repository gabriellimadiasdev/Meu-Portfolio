// ===== FUNDO INTERATIVO CYBERPUNK 2077 =====
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('cyberpunk-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Ajusta o tamanho do canvas para cobrir a tela inteira
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Configuração das Partículas
    const particles = [];
    const particleCount = 50; // Quantidade de partículas

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 2; // Velocidade X
            this.vy = (Math.random() - 0.5) * 2; // Velocidade Y
            this.size = Math.random() * 2 + 1;
            // Cores Neon: Ciano e Roxo/Rosa
            this.color = Math.random() > 0.5 ? '#00f3ff' : '#ff00ff'; 
            this.life = Math.random() * 100;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;

            // Resetar se sair da tela ou "morrer"
            if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.size, this.size); // Quadrados (estilo digital)
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
        }
    }

    // Inicializa partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Loop de Animação
    function animate() {
        // Limpa o canvas com um rastro suave (efeito motion blur)
        ctx.fillStyle = 'rgba(5, 5, 16, 0.2)'; 
        ctx.fillRect(0, 0, width, height);

        // === DESENHAR GRID (GRADE) ===
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        
        // Movimento da grade
        const time = Date.now() * 0.002;
        const offsetX = (time * 10) % gridSize;
        const offsetY = (time * 10) % gridSize;

        // Linhas Verticais
        for (let x = offsetX; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        // Linhas Horizontais
        for (let y = offsetY; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // === DESENHAR PARTÍCULAS ===
        particles.forEach((p, index) => {
            p.update();
            p.draw();

            // Conexões (linhas) entre partículas próximas
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
                
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dist/100})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
    console.log('🌃 Fundo Cyberpunk iniciado!');
});
