export class Animations {
    static start(animation) {
        switch (animation) {
            case 'confetti':
                Confetti.play()
                break
            case 'explosion':
                break
            default:
                break
        }
    }
}

class Confetti {
    static play() {
        let width = window.innerWidth
        let height = window.innerHeight
        const canvas = document.getElementById('animation-canvas')
        const context = canvas.getContext('2d')
        const maxParticles = 150
        this.particles = []
        
        const possibleColors = [
          "DodgerBlue",
          "OliveDrab",
          "Gold",
          "Pink",
          "SlateBlue",
          "LightBlue",
          "Gold",
          "Violet",
          "PaleGreen",
          "SteelBlue",
          "SandyBrown",
          "Chocolate",
          "Crimson",
        ]

        window.addEventListener(
          "resize",
          function() {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
          },
          false
        )
        
        // Push new confetti objects to `particles[]`
        for (var i = 0; i < maxParticles; i++) {
          particles.push(new ConfettiParticle(possibleColors, maxParticles))
        }
        
        // Initialize
        canvas.width = W
        canvas.height = H
        Draw(particles)
    }

    stop() {
        this
    }

    static #randomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    static Draw(particles) {
        const results = [];
      
        // Magical recursive functional love
        requestAnimationFrame(Draw);
      
        context.clearRect(0, 0, W, window.innerHeight);
      
        for (var i = 0; i < maxConfettis; i++) {
          results.push(particles[i].draw());
        }
      
        let particle = {};
        let remainingFlakes = 0;
        for (var i = 0; i < maxConfettis; i++) {
          particle = particles[i];
      
          particle.tiltAngle += particle.tiltAngleIncremental;
          particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
          particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;
      
          if (particle.y <= H) remainingFlakes++;
      
          // If a confetti has fluttered out of view,
          // bring it back to above the viewport and let if re-fall.
          if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
            particle.x = Math.random() * W;
            particle.y = -30;
            particle.tilt = Math.floor(Math.random() * 10) - 20;
          }
        }
      
        return results
    }
}

class ConfettiParticle {
    constructor(possibleColors, maxConfettis) {
        this.x = Math.random() * W // x
        this.y = Math.random() * H - H // y
        this.r = randomFromTo(11, 33) // radius
        this.d = Math.random() * maxConfettis + 11
        this.color =
        possibleColors[Math.floor(Math.random() * possibleColors.length)]
        this.tilt = Math.floor(Math.random() * 33) - 11
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05
        this.tiltAngle = 0
    }
  
    draw(context) {
      context.beginPath();
      context.lineWidth = this.r / 2;
      context.strokeStyle = this.color;
      context.moveTo(this.x + this.tilt + this.r / 3, this.y);
      context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
      return context.stroke();
    }
}