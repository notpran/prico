import 'package:flutter/material.dart';
import 'dart:math' as math;

// Perpetual motion background with floating elements
class PerpetualMotionBackground extends StatefulWidget {
  final Widget child;
  final Color primaryColor;
  final Color secondaryColor;
  final int elementCount;
  final bool enableInteraction;

  const PerpetualMotionBackground({
    Key? key,
    required this.child,
    this.primaryColor = const Color(0xFF6C5CE7),
    this.secondaryColor = const Color(0xFF74B9FF),
    this.elementCount = 15,
    this.enableInteraction = true,
  }) : super(key: key);

  @override
  _PerpetualMotionBackgroundState createState() => _PerpetualMotionBackgroundState();
}

class _PerpetualMotionBackgroundState extends State<PerpetualMotionBackground>
    with TickerProviderStateMixin {
  late AnimationController _primaryController;
  late AnimationController _secondaryController;
  late AnimationController _tertiaryController;
  List<FloatingElement> _elements = [];
  Offset _mousePosition = Offset.zero;

  @override
  void initState() {
    super.initState();
    
    _primaryController = AnimationController(
      duration: Duration(seconds: 30),
      vsync: this,
    )..repeat();
    
    _secondaryController = AnimationController(
      duration: Duration(seconds: 45),
      vsync: this,
    )..repeat();
    
    _tertiaryController = AnimationController(
      duration: Duration(seconds: 60),
      vsync: this,
    )..repeat();
    
    _generateElements();
  }

  @override
  void dispose() {
    _primaryController.dispose();
    _secondaryController.dispose();
    _tertiaryController.dispose();
    super.dispose();
  }

  void _generateElements() {
    final random = math.Random();
    for (int i = 0; i < widget.elementCount; i++) {
      _elements.add(FloatingElement(
        initialX: random.nextDouble(),
        initialY: random.nextDouble(),
        size: 20 + random.nextDouble() * 60,
        speed: 0.3 + random.nextDouble() * 0.7,
        rotationSpeed: 0.5 + random.nextDouble() * 1.5,
        opacity: 0.1 + random.nextDouble() * 0.3,
        shape: ElementShape.values[random.nextInt(ElementShape.values.length)],
        color: random.nextBool() ? widget.primaryColor : widget.secondaryColor,
        orbitRadius: 50 + random.nextDouble() * 100,
        phase: random.nextDouble() * math.pi * 2,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onHover: (event) {
        if (widget.enableInteraction) {
          setState(() => _mousePosition = event.localPosition);
        }
      },
      child: Stack(
        children: [
          // Perpetual motion background
          Positioned.fill(
            child: AnimatedBuilder(
              animation: Listenable.merge([
                _primaryController,
                _secondaryController,
                _tertiaryController,
              ]),
              builder: (context, child) {
                return CustomPaint(
                  painter: PerpetualMotionPainter(
                    elements: _elements,
                    primaryValue: _primaryController.value,
                    secondaryValue: _secondaryController.value,
                    tertiaryValue: _tertiaryController.value,
                    mousePosition: _mousePosition,
                    enableInteraction: widget.enableInteraction,
                  ),
                  size: Size.infinite,
                );
              },
            ),
          ),
          
          // Content
          widget.child,
        ],
      ),
    );
  }
}

class FloatingElement {
  final double initialX;
  final double initialY;
  final double size;
  final double speed;
  final double rotationSpeed;
  final double opacity;
  final ElementShape shape;
  final Color color;
  final double orbitRadius;
  final double phase;

  FloatingElement({
    required this.initialX,
    required this.initialY,
    required this.size,
    required this.speed,
    required this.rotationSpeed,
    required this.opacity,
    required this.shape,
    required this.color,
    required this.orbitRadius,
    required this.phase,
  });
}

enum ElementShape {
  circle,
  square,
  triangle,
  diamond,
  star,
  hexagon,
}

class PerpetualMotionPainter extends CustomPainter {
  final List<FloatingElement> elements;
  final double primaryValue;
  final double secondaryValue;
  final double tertiaryValue;
  final Offset mousePosition;
  final bool enableInteraction;

  PerpetualMotionPainter({
    required this.elements,
    required this.primaryValue,
    required this.secondaryValue,
    required this.tertiaryValue,
    required this.mousePosition,
    required this.enableInteraction,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (int i = 0; i < elements.length; i++) {
      final element = elements[i];
      
      // Calculate position with multiple motion layers
      final primaryMotion = primaryValue * element.speed;
      final secondaryMotion = secondaryValue * element.speed * 0.7;
      final tertiaryMotion = tertiaryValue * element.speed * 0.3;
      
      // Orbital motion
      final orbitAngle = element.phase + primaryMotion * 2 * math.pi;
      final orbitX = math.cos(orbitAngle) * element.orbitRadius;
      final orbitY = math.sin(orbitAngle) * element.orbitRadius;
      
      // Wave motion
      final waveX = math.sin(secondaryMotion * 2 * math.pi + i) * 50;
      final waveY = math.cos(tertiaryMotion * 2 * math.pi + i) * 30;
      
      // Base position
      final baseX = element.initialX * size.width;
      final baseY = element.initialY * size.height;
      
      // Mouse interaction
      double mouseInfluenceX = 0;
      double mouseInfluenceY = 0;
      if (enableInteraction && mousePosition != Offset.zero) {
        final distance = math.sqrt(
          math.pow(baseX - mousePosition.dx, 2) + 
          math.pow(baseY - mousePosition.dy, 2)
        );
        final influence = math.max(0, 1 - distance / 200);
        final angle = math.atan2(baseY - mousePosition.dy, baseX - mousePosition.dx);
        mouseInfluenceX = math.cos(angle) * influence * 50;
        mouseInfluenceY = math.sin(angle) * influence * 50;
      }
      
      final finalX = baseX + orbitX + waveX + mouseInfluenceX;
      final finalY = baseY + orbitY + waveY + mouseInfluenceY;
      
      // Wrap around screen
      final wrappedX = finalX % size.width;
      final wrappedY = finalY % size.height;
      
      // Rotation
      final rotation = element.phase + primaryValue * element.rotationSpeed * 2 * math.pi;
      
      // Draw element
      _drawElement(
        canvas,
        Offset(wrappedX, wrappedY),
        element.size,
        rotation,
        element.color.withOpacity(element.opacity),
        element.shape,
      );
    }
  }

  void _drawElement(
    Canvas canvas,
    Offset position,
    double size,
    double rotation,
    Color color,
    ElementShape shape,
  ) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    canvas.save();
    canvas.translate(position.dx, position.dy);
    canvas.rotate(rotation);
    
    switch (shape) {
      case ElementShape.circle:
        canvas.drawCircle(Offset.zero, size / 2, paint);
        break;
        
      case ElementShape.square:
        canvas.drawRect(
          Rect.fromCenter(center: Offset.zero, width: size, height: size),
          paint,
        );
        break;
        
      case ElementShape.triangle:
        final path = Path();
        path.moveTo(0, -size / 2);
        path.lineTo(-size / 2, size / 2);
        path.lineTo(size / 2, size / 2);
        path.close();
        canvas.drawPath(path, paint);
        break;
        
      case ElementShape.diamond:
        final path = Path();
        path.moveTo(0, -size / 2);
        path.lineTo(size / 2, 0);
        path.lineTo(0, size / 2);
        path.lineTo(-size / 2, 0);
        path.close();
        canvas.drawPath(path, paint);
        break;
        
      case ElementShape.star:
        _drawStar(canvas, paint, size);
        break;
        
      case ElementShape.hexagon:
        _drawHexagon(canvas, paint, size);
        break;
    }
    
    canvas.restore();
  }

  void _drawStar(Canvas canvas, Paint paint, double size) {
    final path = Path();
    final outerRadius = size / 2;
    final innerRadius = outerRadius * 0.4;
    
    for (int i = 0; i < 10; i++) {
      final angle = i * math.pi / 5;
      final radius = i.isEven ? outerRadius : innerRadius;
      final x = math.cos(angle) * radius;
      final y = math.sin(angle) * radius;
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  void _drawHexagon(Canvas canvas, Paint paint, double size) {
    final path = Path();
    final radius = size / 2;
    
    for (int i = 0; i < 6; i++) {
      final angle = i * math.pi / 3;
      final x = math.cos(angle) * radius;
      final y = math.sin(angle) * radius;
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant PerpetualMotionPainter oldDelegate) {
    return oldDelegate.primaryValue != primaryValue ||
           oldDelegate.secondaryValue != secondaryValue ||
           oldDelegate.tertiaryValue != tertiaryValue ||
           oldDelegate.mousePosition != mousePosition;
  }
}

// Infinite scrolling text animation
class InfiniteScrollingText extends StatefulWidget {
  final String text;
  final TextStyle textStyle;
  final Duration duration;
  final Axis direction;
  final double spacing;

  const InfiniteScrollingText({
    Key? key,
    required this.text,
    required this.textStyle,
    this.duration = const Duration(seconds: 10),
    this.direction = Axis.horizontal,
    this.spacing = 50.0,
  }) : super(key: key);

  @override
  _InfiniteScrollingTextState createState() => _InfiniteScrollingTextState();
}

class _InfiniteScrollingTextState extends State<InfiniteScrollingText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    )..repeat();
    
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return CustomPaint(
          painter: InfiniteTextPainter(
            text: widget.text,
            textStyle: widget.textStyle,
            progress: _animation.value,
            direction: widget.direction,
            spacing: widget.spacing,
          ),
          size: Size.infinite,
        );
      },
    );
  }
}

class InfiniteTextPainter extends CustomPainter {
  final String text;
  final TextStyle textStyle;
  final double progress;
  final Axis direction;
  final double spacing;

  InfiniteTextPainter({
    required this.text,
    required this.textStyle,
    required this.progress,
    required this.direction,
    required this.spacing,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textPainter = TextPainter(
      text: TextSpan(text: text, style: textStyle),
      textDirection: TextDirection.ltr,
    )..layout();
    
    if (direction == Axis.horizontal) {
      final totalWidth = textPainter.width + spacing;
      final startX = -totalWidth * progress;
      
      for (double x = startX; x < size.width + totalWidth; x += totalWidth) {
        textPainter.paint(
          canvas,
          Offset(x, (size.height - textPainter.height) / 2),
        );
      }
    } else {
      final totalHeight = textPainter.height + spacing;
      final startY = -totalHeight * progress;
      
      for (double y = startY; y < size.height + totalHeight; y += totalHeight) {
        textPainter.paint(
          canvas,
          Offset((size.width - textPainter.width) / 2, y),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant InfiniteTextPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

// Orbiting elements around a center point
class OrbitingElements extends StatefulWidget {
  final Widget centerWidget;
  final List<OrbitingElement> elements;
  final double radius;
  final Duration orbitDuration;

  const OrbitingElements({
    Key? key,
    required this.centerWidget,
    required this.elements,
    this.radius = 100.0,
    this.orbitDuration = const Duration(seconds: 20),
  }) : super(key: key);

  @override
  _OrbitingElementsState createState() => _OrbitingElementsState();
}

class _OrbitingElementsState extends State<OrbitingElements>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.orbitDuration,
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
    return SizedBox(
      width: (widget.radius + 50) * 2,
      height: (widget.radius + 50) * 2,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: [
              // Orbiting elements
              ...widget.elements.asMap().entries.map((entry) {
                final index = entry.key;
                final element = entry.value;
                
                final angle = (_controller.value + element.offset) * 2 * math.pi;
                final x = math.cos(angle) * widget.radius;
                final y = math.sin(angle) * widget.radius;
                
                return Transform.translate(
                  offset: Offset(x, y),
                  child: Transform.rotate(
                    angle: _controller.value * 2 * math.pi * element.rotationSpeed,
                    child: element.widget,
                  ),
                );
              }).toList(),
              
              // Center widget
              widget.centerWidget,
            ],
          );
        },
      ),
    );
  }
}

class OrbitingElement {
  final Widget widget;
  final double offset;
  final double rotationSpeed;

  const OrbitingElement({
    required this.widget,
    this.offset = 0.0,
    this.rotationSpeed = 1.0,
  });
}