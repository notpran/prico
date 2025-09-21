import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';
import 'dart:math' as math;

// Physics-based fluid animation container
class FluidAnimationContainer extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Curve curve;
  final bool enablePhysics;
  final double damping;
  final double stiffness;

  const FluidAnimationContainer({
    Key? key,
    required this.child,
    this.duration = const Duration(milliseconds: 800),
    this.curve = Curves.elasticOut,
    this.enablePhysics = true,
    this.damping = 0.8,
    this.stiffness = 100.0,
  }) : super(key: key);

  @override
  _FluidAnimationContainerState createState() => _FluidAnimationContainerState();
}

class _FluidAnimationContainerState extends State<FluidAnimationContainer>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<Offset> _offsetAnimation;
  
  bool _isHovered = false;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    
    if (widget.enablePhysics) {
      _setupPhysicsAnimations();
    } else {
      _setupRegularAnimations();
    }
  }

  void _setupPhysicsAnimations() {
    final spring = SpringDescription(
      mass: 1.0,
      stiffness: widget.stiffness,
      damping: widget.damping,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(_controller);
    
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.02,
    ).animate(_controller);
    
    _offsetAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset(0, -5),
    ).animate(_controller);
  }

  void _setupRegularAnimations() {
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));
    
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.02,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));
    
    _offsetAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset(0, -5),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: widget.curve,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onHoverEnter() {
    setState(() => _isHovered = true);
    _controller.forward();
  }

  void _onHoverExit() {
    setState(() => _isHovered = false);
    _controller.reverse();
  }

  void _onTapDown() {
    setState(() => _isPressed = true);
    _controller.forward();
  }

  void _onTapUp() {
    setState(() => _isPressed = false);
    if (!_isHovered) {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => _onHoverEnter(),
      onExit: (_) => _onHoverExit(),
      child: GestureDetector(
        onTapDown: (_) => _onTapDown(),
        onTapUp: (_) => _onTapUp(),
        onTapCancel: () => _onTapUp(),
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.translate(
              offset: _offsetAnimation.value,
              child: Transform.rotate(
                angle: _rotationAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: widget.child,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// Liquid-like morphing container
class LiquidMorphContainer extends StatefulWidget {
  final Widget child;
  final Color color;
  final double borderRadius;
  final Duration morphDuration;
  final bool autoMorph;

  const LiquidMorphContainer({
    Key? key,
    required this.child,
    this.color = const Color(0xFF6C5CE7),
    this.borderRadius = 20.0,
    this.morphDuration = const Duration(seconds: 3),
    this.autoMorph = true,
  }) : super(key: key);

  @override
  _LiquidMorphContainerState createState() => _LiquidMorphContainerState();
}

class _LiquidMorphContainerState extends State<LiquidMorphContainer>
    with TickerProviderStateMixin {
  late AnimationController _morphController;
  late AnimationController _rippleController;
  
  @override
  void initState() {
    super.initState();
    
    _morphController = AnimationController(
      duration: widget.morphDuration,
      vsync: this,
    );
    
    _rippleController = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: this,
    );
    
    if (widget.autoMorph) {
      _morphController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _morphController.dispose();
    _rippleController.dispose();
    super.dispose();
  }

  void _triggerRipple() {
    _rippleController.forward().then((_) {
      _rippleController.reset();
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _triggerRipple,
      child: AnimatedBuilder(
        animation: Listenable.merge([_morphController, _rippleController]),
        builder: (context, child) {
          return CustomPaint(
            painter: LiquidMorphPainter(
              color: widget.color,
              morphValue: _morphController.value,
              rippleValue: _rippleController.value,
              borderRadius: widget.borderRadius,
            ),
            child: widget.child,
          );
        },
      ),
    );
  }
}

class LiquidMorphPainter extends CustomPainter {
  final Color color;
  final double morphValue;
  final double rippleValue;
  final double borderRadius;

  LiquidMorphPainter({
    required this.color,
    required this.morphValue,
    required this.rippleValue,
    required this.borderRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    // Create morphing shape
    final path = Path();
    final center = Offset(size.width / 2, size.height / 2);
    
    // Base shape with morphing
    final morphOffset = math.sin(morphValue * 2 * math.pi) * 10;
    
    // Create liquid-like border
    for (int i = 0; i <= 100; i++) {
      final angle = (i / 100) * 2 * math.pi;
      final baseRadius = math.min(size.width, size.height) / 2 - borderRadius;
      
      // Add morphing waves
      final waveOffset = math.sin(angle * 3 + morphValue * 2 * math.pi) * 8;
      final radius = baseRadius + morphOffset + waveOffset;
      
      final x = center.dx + math.cos(angle) * radius;
      final y = center.dy + math.sin(angle) * radius;
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    
    canvas.drawPath(path, paint);
    
    // Draw ripple effect
    if (rippleValue > 0) {
      final ripplePaint = Paint()
        ..color = color.withOpacity(0.3 * (1 - rippleValue))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3;
      
      final rippleRadius = rippleValue * size.width;
      canvas.drawCircle(center, rippleRadius, ripplePaint);
    }
  }

  @override
  bool shouldRepaint(covariant LiquidMorphPainter oldDelegate) {
    return oldDelegate.morphValue != morphValue ||
           oldDelegate.rippleValue != rippleValue;
  }
}

// Fluid page transition
class FluidPageTransition extends PageRouteBuilder {
  final Widget child;
  final TransitionType transitionType;
  final Duration duration;

  FluidPageTransition({
    required this.child,
    this.transitionType = TransitionType.slide,
    this.duration = const Duration(milliseconds: 800),
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => child,
          transitionDuration: duration,
          reverseTransitionDuration: duration,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return _buildTransition(
              child,
              animation,
              secondaryAnimation,
              transitionType,
            );
          },
        );

  static Widget _buildTransition(
    Widget child,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    TransitionType type,
  ) {
    switch (type) {
      case TransitionType.slide:
        return _buildSlideTransition(child, animation, secondaryAnimation);
      case TransitionType.scale:
        return _buildScaleTransition(child, animation);
      case TransitionType.fade:
        return _buildFadeTransition(child, animation);
      case TransitionType.liquid:
        return _buildLiquidTransition(child, animation);
      case TransitionType.morphing:
        return _buildMorphingTransition(child, animation, secondaryAnimation);
    }
  }

  static Widget _buildSlideTransition(
    Widget child,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
  ) {
    final slideIn = Tween<Offset>(
      begin: Offset(1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: animation,
      curve: Curves.elasticOut,
    ));

    final slideOut = Tween<Offset>(
      begin: Offset.zero,
      end: Offset(-0.3, 0.0),
    ).animate(CurvedAnimation(
      parent: secondaryAnimation,
      curve: Curves.easeInOut,
    ));

    return SlideTransition(
      position: slideIn,
      child: SlideTransition(
        position: slideOut,
        child: child,
      ),
    );
  }

  static Widget _buildScaleTransition(Widget child, Animation<double> animation) {
    return ScaleTransition(
      scale: Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: Curves.elasticOut,
      )),
      child: child,
    );
  }

  static Widget _buildFadeTransition(Widget child, Animation<double> animation) {
    return FadeTransition(
      opacity: animation,
      child: child,
    );
  }

  static Widget _buildLiquidTransition(Widget child, Animation<double> animation) {
    return ClipPath(
      clipper: LiquidClipper(animation.value),
      child: child,
    );
  }

  static Widget _buildMorphingTransition(
    Widget child,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
  ) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateY(animation.value * math.pi),
          child: animation.value <= 0.5 ? 
            Container() : // Old page
            child, // New page
        );
      },
      child: child,
    );
  }
}

class LiquidClipper extends CustomClipper<Path> {
  final double progress;

  LiquidClipper(this.progress);

  @override
  Path getClip(Size size) {
    final path = Path();
    
    if (progress <= 0) {
      return path;
    }
    
    if (progress >= 1) {
      path.addRect(Rect.fromLTWH(0, 0, size.width, size.height));
      return path;
    }
    
    // Create liquid-like reveal
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = math.sqrt(size.width * size.width + size.height * size.height) / 2;
    final radius = progress * maxRadius;
    
    // Add multiple circles with slight offsets for liquid effect
    for (int i = 0; i < 5; i++) {
      final angle = (i / 5) * 2 * math.pi;
      final offset = Offset(
        center.dx + math.cos(angle) * (radius * 0.1),
        center.dy + math.sin(angle) * (radius * 0.1),
      );
      
      path.addOval(Rect.fromCircle(
        center: offset,
        radius: radius * (0.8 + i * 0.05),
      ));
    }
    
    return path;
  }

  @override
  bool shouldReclip(covariant LiquidClipper oldClipper) {
    return oldClipper.progress != progress;
  }
}

enum TransitionType {
  slide,
  scale,
  fade,
  liquid,
  morphing,
}

// Bouncy scroll physics for fluid scrolling
class FluidScrollPhysics extends ScrollPhysics {
  final double springDescription;
  final double damping;

  const FluidScrollPhysics({
    ScrollPhysics? parent,
    this.springDescription = 100.0,
    this.damping = 0.8,
  }) : super(parent: parent);

  @override
  FluidScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return FluidScrollPhysics(
      parent: buildParent(ancestor),
      springDescription: springDescription,
      damping: damping,
    );
  }

  @override
  SpringDescription get spring => SpringDescription(
        mass: 1.0,
        stiffness: springDescription,
        damping: damping,
      );

  @override
  double get dragStartDistanceMotionThreshold => 3.5;
}

// Magnetic snap scroll behavior
class MagneticScrollBehavior extends ScrollBehavior {
  final double snapDistance;
  final Duration snapDuration;

  const MagneticScrollBehavior({
    this.snapDistance = 50.0,
    this.snapDuration = const Duration(milliseconds: 300),
  });

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const FluidScrollPhysics();
  }

  @override
  Widget buildScrollbar(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) {
    return child; // Remove default scrollbar for cleaner look
  }
}