import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:vector_math/vector_math_64.dart' as vector;

class FloatingCard extends StatefulWidget {
  final AnimationController animationController;
  final double delay;
  final IconData icon;
  final Color color;
  final bool enableInteraction;

  const FloatingCard({
    Key? key,
    required this.animationController,
    required this.delay,
    required this.icon,
    required this.color,
    this.enableInteraction = true,
  }) : super(key: key);

  @override
  _FloatingCardState createState() => _FloatingCardState();
}

class _FloatingCardState extends State<FloatingCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _hoverController;
  bool _isHovered = false;
  Offset _mousePosition = Offset.zero;

  @override
  void initState() {
    super.initState();
    _hoverController = AnimationController(
      duration: Duration(milliseconds: 200),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _hoverController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) {
        setState(() => _isHovered = true);
        _hoverController.forward();
      },
      onExit: (_) {
        setState(() => _isHovered = false);
        _hoverController.reverse();
      },
      onHover: (event) {
        if (widget.enableInteraction) {
          setState(() => _mousePosition = event.localPosition);
        }
      },
      child: AnimatedBuilder(
        animation: Listenable.merge([widget.animationController, _hoverController]),
        builder: (context, child) {
          final value = (widget.animationController.value + widget.delay) % 1.0;
          final floatOffset = math.sin(value * 2 * math.pi) * 20;
          final rotationAngle = value * 2 * math.pi * 0.3;
          
          // Mouse interaction effects
          final tiltX = _isHovered ? (_mousePosition.dy - 40) / 200 : 0.0;
          final tiltY = _isHovered ? (_mousePosition.dx - 40) / 200 : 0.0;
          final hoverScale = 1.0 + (_hoverController.value * 0.1);
          
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..translate(0.0, floatOffset, 0.0)
              ..setEntry(3, 2, 0.001)
              ..rotateX(rotationAngle + tiltX)
              ..rotateY(rotationAngle * 0.7 + tiltY)
              ..scale(hoverScale),
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    widget.color.withOpacity(_isHovered ? 0.9 : 0.8),
                    widget.color.withOpacity(_isHovered ? 0.6 : 0.4),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: widget.color.withOpacity(_isHovered ? 0.5 : 0.3),
                    blurRadius: _isHovered ? 30 : 20,
                    spreadRadius: _isHovered ? 4 : 2,
                    offset: Offset(0, _isHovered ? 15 : 10),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  widget.icon,
                  color: Colors.white,
                  size: _isHovered ? 36 : 32,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// Enhanced 3D Card with parallax and depth
class Enhanced3DCard extends StatefulWidget {
  final Widget child;
  final double depth;
  final Color shadowColor;
  final bool enableParallax;
  final VoidCallback? onTap;

  const Enhanced3DCard({
    Key? key,
    required this.child,
    this.depth = 10.0,
    this.shadowColor = Colors.black,
    this.enableParallax = true,
    this.onTap,
  }) : super(key: key);

  @override
  _Enhanced3DCardState createState() => _Enhanced3DCardState();
}

class _Enhanced3DCardState extends State<Enhanced3DCard>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _hoverController;
  late AnimationController _tapController;
  
  bool _isHovered = false;
  Offset _mousePosition = Offset.zero;
  Size _cardSize = Size.zero;

  @override
  void initState() {
    super.initState();
    
    _rotationController = AnimationController(
      duration: Duration(seconds: 10),
      vsync: this,
    )..repeat();
    
    _hoverController = AnimationController(
      duration: Duration(milliseconds: 200),
      vsync: this,
    );
    
    _tapController = AnimationController(
      duration: Duration(milliseconds: 100),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _hoverController.dispose();
    _tapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) {
        setState(() => _isHovered = true);
        _hoverController.forward();
      },
      onExit: (_) {
        setState(() => _isHovered = false);
        _hoverController.reverse();
      },
      onHover: (event) {
        if (widget.enableParallax) {
          setState(() => _mousePosition = event.localPosition);
        }
      },
      child: GestureDetector(
        onTapDown: (_) => _tapController.forward(),
        onTapUp: (_) => _tapController.reverse(),
        onTapCancel: () => _tapController.reverse(),
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: Listenable.merge([
            _rotationController,
            _hoverController,
            _tapController,
          ]),
          builder: (context, child) {
            // Calculate transformations
            final rotationValue = _rotationController.value;
            final hoverValue = _hoverController.value;
            final tapValue = _tapController.value;
            
            // Parallax effect based on mouse position
            final tiltX = _isHovered && _cardSize.height > 0
                ? ((_mousePosition.dy - _cardSize.height / 2) / _cardSize.height) * 0.3
                : 0.0;
            final tiltY = _isHovered && _cardSize.width > 0
                ? ((_mousePosition.dx - _cardSize.width / 2) / _cardSize.width) * 0.3
                : 0.0;
            
            // Scale effects
            final hoverScale = 1.0 + (hoverValue * 0.05);
            final tapScale = 1.0 - (tapValue * 0.02);
            final totalScale = hoverScale * tapScale;
            
            // Floating animation
            final floatY = math.sin(rotationValue * 2 * math.pi) * 5 * hoverValue;
            
            return Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.001) // Perspective
                ..translate(0.0, floatY, widget.depth * hoverValue)
                ..rotateX(tiltX + math.sin(rotationValue * math.pi) * 0.1 * hoverValue)
                ..rotateY(tiltY + math.cos(rotationValue * math.pi) * 0.1 * hoverValue)
                ..scale(totalScale),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    // Multiple shadow layers for depth
                    BoxShadow(
                      color: widget.shadowColor.withOpacity(0.1 + hoverValue * 0.2),
                      blurRadius: 10 + hoverValue * 20,
                      spreadRadius: 2 + hoverValue * 3,
                      offset: Offset(0, 5 + hoverValue * 10),
                    ),
                    BoxShadow(
                      color: widget.shadowColor.withOpacity(0.05 + hoverValue * 0.1),
                      blurRadius: 30 + hoverValue * 40,
                      spreadRadius: 5 + hoverValue * 5,
                      offset: Offset(0, 15 + hoverValue * 20),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      _cardSize = Size(constraints.maxWidth, constraints.maxHeight);
                      return widget.child;
                    },
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// 3D Sphere with rotating particles
class Floating3DSphere extends StatefulWidget {
  final double radius;
  final Color primaryColor;
  final Color secondaryColor;
  final int particleCount;

  const Floating3DSphere({
    Key? key,
    this.radius = 100.0,
    this.primaryColor = const Color(0xFF6C5CE7),
    this.secondaryColor = const Color(0xFF74B9FF),
    this.particleCount = 20,
  }) : super(key: key);

  @override
  _Floating3DSphereState createState() => _Floating3DSphereState();
}

class _Floating3DSphereState extends State<Floating3DSphere>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  List<SphereParticle> _particles = [];

  @override
  void initState() {
    super.initState();
    
    _rotationController = AnimationController(
      duration: Duration(seconds: 20),
      vsync: this,
    )..repeat();
    
    _pulseController = AnimationController(
      duration: Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
    
    _generateParticles();
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _generateParticles() {
    final random = math.Random();
    for (int i = 0; i < widget.particleCount; i++) {
      _particles.add(SphereParticle(
        phi: random.nextDouble() * math.pi * 2,
        theta: random.nextDouble() * math.pi,
        radius: widget.radius * (0.8 + random.nextDouble() * 0.4),
        size: 3 + random.nextDouble() * 4,
        speed: 0.5 + random.nextDouble() * 1.0,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_rotationController, _pulseController]),
      builder: (context, child) {
        return CustomPaint(
          painter: SpherePainter(
            particles: _particles,
            rotationValue: _rotationController.value,
            pulseValue: _pulseController.value,
            primaryColor: widget.primaryColor,
            secondaryColor: widget.secondaryColor,
            radius: widget.radius,
          ),
          size: Size(widget.radius * 2.5, widget.radius * 2.5),
        );
      },
    );
  }
}

class SphereParticle {
  final double phi;
  final double theta;
  final double radius;
  final double size;
  final double speed;

  SphereParticle({
    required this.phi,
    required this.theta,
    required this.radius,
    required this.size,
    required this.speed,
  });
}

class SpherePainter extends CustomPainter {
  final List<SphereParticle> particles;
  final double rotationValue;
  final double pulseValue;
  final Color primaryColor;
  final Color secondaryColor;
  final double radius;

  SpherePainter({
    required this.particles,
    required this.rotationValue,
    required this.pulseValue,
    required this.primaryColor,
    required this.secondaryColor,
    required this.radius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()..style = PaintingStyle.fill;
    
    // Sort particles by Z depth for proper rendering
    final sortedParticles = particles.map((particle) {
      final rotatedPhi = particle.phi + rotationValue * particle.speed * 2 * math.pi;
      final x = particle.radius * math.sin(particle.theta) * math.cos(rotatedPhi);
      final y = particle.radius * math.sin(particle.theta) * math.sin(rotatedPhi);
      final z = particle.radius * math.cos(particle.theta);
      
      return {
        'particle': particle,
        'x': x,
        'y': y,
        'z': z,
        'rotatedPhi': rotatedPhi,
      };
    }).toList()
      ..sort((a, b) => (b['z'] as double).compareTo(a['z'] as double));
    
    // Draw particles
    for (final data in sortedParticles) {
      final particle = data['particle'] as SphereParticle;
      final x = data['x'] as double;
      final y = data['y'] as double;
      final z = data['z'] as double;
      
      // Calculate screen position with perspective
      final perspective = 1.0 + z / (radius * 2);
      final screenX = center.dx + x * perspective;
      final screenY = center.dy + y * perspective;
      
      // Calculate opacity based on Z position
      final opacity = (z + radius) / (radius * 2);
      
      // Interpolate color based on position
      final colorT = (math.sin(data['rotatedPhi'] as double) + 1) / 2;
      final color = Color.lerp(primaryColor, secondaryColor, colorT)!;
      
      // Apply pulse effect to size
      final pulsedSize = particle.size * (1.0 + pulseValue * 0.3);
      
      paint.color = color.withOpacity(opacity);
      canvas.drawCircle(
        Offset(screenX, screenY),
        pulsedSize * perspective,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant SpherePainter oldDelegate) {
    return oldDelegate.rotationValue != rotationValue ||
           oldDelegate.pulseValue != pulseValue;
  }
}