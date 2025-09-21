import 'package:flutter/material.dart';
import 'dart:math' as math;

class ParticleSystem extends StatelessWidget {
  final AnimationController animationController;
  final int particleCount;

  const ParticleSystem({
    Key? key,
    required this.animationController,
    this.particleCount = 50,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animationController,
      builder: (context, child) {
        return CustomPaint(
          painter: ParticlePainter(
            animationController.value,
            particleCount,
          ),
          size: Size.infinite,
        );
      },
    );
  }
}

class ParticlePainter extends CustomPainter {
  final double animationValue;
  final int particleCount;
  late List<Particle> particles;

  ParticlePainter(this.animationValue, this.particleCount) {
    particles = List.generate(particleCount, (index) => Particle(index));
  }

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..blendMode = BlendMode.screen;

    for (final particle in particles) {
      particle.update(animationValue, size);
      
      final gradient = RadialGradient(
        colors: [
          particle.color.withOpacity(particle.opacity),
          particle.color.withOpacity(0),
        ],
      );
      
      paint.shader = gradient.createShader(
        Rect.fromCircle(
          center: particle.position,
          radius: particle.size,
        ),
      );
      
      canvas.drawCircle(
        particle.position,
        particle.size,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class Particle {
  late Offset position;
  late Offset velocity;
  late double size;
  late Color color;
  late double opacity;
  late double phase;
  late double speed;

  Particle(int index) {
    final random = math.Random(index);
    phase = random.nextDouble() * 2 * math.pi;
    speed = 0.2 + random.nextDouble() * 0.5;
    size = 1 + random.nextDouble() * 3;
    
    final colors = [
      Colors.blue,
      Colors.purple,
      Colors.pink,
      Colors.cyan,
      Colors.white,
    ];
    color = colors[random.nextInt(colors.length)];
    
    velocity = Offset(
      (random.nextDouble() - 0.5) * 2,
      (random.nextDouble() - 0.5) * 2,
    );
  }

  void update(double animationValue, Size size) {
    final time = animationValue * 2 * math.pi + phase;
    
    position = Offset(
      (size.width * 0.1) + 
      (size.width * 0.8) * ((math.sin(time * speed) + 1) / 2) +
      velocity.dx * animationValue * 100,
      (size.height * 0.1) + 
      (size.height * 0.8) * ((math.cos(time * speed * 0.7) + 1) / 2) +
      velocity.dy * animationValue * 100,
    );
    
    opacity = (math.sin(time * 2) * 0.3 + 0.7) * 0.6;
  }
}