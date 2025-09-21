import 'package:flutter/material.dart';
import 'dart:math' as math;

class AnimatedBackground extends StatefulWidget {
  @override
  _AnimatedBackgroundState createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with TickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 30),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: BackgroundPainter(_controller.value),
          size: Size.infinite,
        );
      },
    );
  }
}

class BackgroundPainter extends CustomPainter {
  final double animationValue;

  BackgroundPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    // Create base gradient
    final baseGradient = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Color(0xFF1E3C72),
        Color(0xFF2A5298),
        Color(0xFF1E3C72),
      ],
    );

    final basePaint = Paint()
      ..shader = baseGradient.createShader(
        Rect.fromLTWH(0, 0, size.width, size.height),
      );

    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      basePaint,
    );

    // Draw animated geometric shapes
    _drawFloatingShapes(canvas, size);
    
    // Draw subtle grid pattern
    _drawGrid(canvas, size);
  }

  void _drawFloatingShapes(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..blendMode = BlendMode.overlay;

    // Create multiple floating shapes
    for (int i = 0; i < 8; i++) {
      final phase = (animationValue + i * 0.125) * 2 * math.pi;
      final x = size.width * 0.1 + 
          (size.width * 0.8) * ((math.sin(phase * 0.3) + 1) / 2);
      final y = size.height * 0.1 + 
          (size.height * 0.8) * ((math.cos(phase * 0.4) + 1) / 2);
      
      final opacity = (math.sin(phase) * 0.3 + 0.7) * 0.1;
      
      paint.color = Colors.white.withOpacity(opacity);
      
      // Draw different shapes
      if (i % 3 == 0) {
        // Circle
        canvas.drawCircle(
          Offset(x, y),
          20 + math.sin(phase) * 10,
          paint,
        );
      } else if (i % 3 == 1) {
        // Triangle
        final path = Path();
        final radius = 25 + math.cos(phase) * 15;
        path.moveTo(x, y - radius);
        path.lineTo(x - radius * math.cos(math.pi / 6), y + radius * math.sin(math.pi / 6));
        path.lineTo(x + radius * math.cos(math.pi / 6), y + radius * math.sin(math.pi / 6));
        path.close();
        canvas.drawPath(path, paint);
      } else {
        // Rectangle
        final size = 30 + math.sin(phase) * 15;
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset(x, y), width: size, height: size),
            Radius.circular(8),
          ),
          paint,
        );
      }
    }
  }

  void _drawGrid(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    final spacing = 50.0;
    final offset = (animationValue * spacing) % spacing;

    // Vertical lines
    for (double x = -offset; x < size.width + spacing; x += spacing) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x, size.height),
        paint,
      );
    }

    // Horizontal lines
    for (double y = -offset; y < size.height + spacing; y += spacing) {
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}