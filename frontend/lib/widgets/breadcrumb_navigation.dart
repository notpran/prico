import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math' as math;

class BreadcrumbNavigation extends StatefulWidget {
  final List<BreadcrumbItem> items;
  final Function(int)? onItemTap;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? activeColor;
  final double height;
  final EdgeInsets padding;

  const BreadcrumbNavigation({
    Key? key,
    required this.items,
    this.onItemTap,
    this.backgroundColor,
    this.textColor,
    this.activeColor,
    this.height = 50.0,
    this.padding = const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
  }) : super(key: key);

  @override
  _BreadcrumbNavigationState createState() => _BreadcrumbNavigationState();
}

class _BreadcrumbNavigationState extends State<BreadcrumbNavigation>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late AnimationController _glowController;
  int _hoveredIndex = -1;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _glowController = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _slideController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final backgroundColor = widget.backgroundColor ?? 
        (isDark ? Color(0xFF1A2332).withOpacity(0.8) : Colors.white.withOpacity(0.9));
    final textColor = widget.textColor ?? 
        (isDark ? Color(0xFFE8E9ED) : Color(0xFF2D3748));
    final activeColor = widget.activeColor ?? 
        (isDark ? Color(0xFF6C5CE7) : Color(0xFF2A5298));

    return Container(
      height: widget.height,
      padding: widget.padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(
          color: activeColor.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.1),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Home icon
          _buildHomeIcon(activeColor, textColor),
          
          // Breadcrumb items
          ...List.generate(widget.items.length, (index) {
            return Row(
              children: [
                _buildSeparator(activeColor),
                _buildBreadcrumbItem(index, textColor, activeColor),
              ],
            );
          }),
        ],
      ),
    ).animate()
      .slideInDown(duration: Duration(milliseconds: 600))
      .fadeIn(duration: Duration(milliseconds: 800));
  }

  Widget _buildHomeIcon(Color activeColor, Color textColor) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hoveredIndex = -2),
      onExit: (_) => setState(() => _hoveredIndex = -1),
      child: GestureDetector(
        onTap: () => widget.onItemTap?.call(-1),
        child: AnimatedContainer(
          duration: Duration(milliseconds: 200),
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _hoveredIndex == -2 
                ? activeColor.withOpacity(0.1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: AnimatedBuilder(
            animation: _glowController,
            builder: (context, child) {
              return Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: _hoveredIndex == -2 ? [
                    BoxShadow(
                      color: activeColor.withOpacity(0.3 * _glowController.value),
                      blurRadius: 8,
                      spreadRadius: 2,
                    ),
                  ] : null,
                ),
                child: Icon(
                  Icons.home_rounded,
                  color: _hoveredIndex == -2 ? activeColor : textColor,
                  size: 20,
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildSeparator(Color activeColor) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4),
      child: AnimatedBuilder(
        animation: _slideController,
        builder: (context, child) {
          return Transform.translate(
            offset: Offset(math.sin(_slideController.value * math.pi) * 2, 0),
            child: Icon(
              Icons.chevron_right_rounded,
              color: activeColor.withOpacity(0.6),
              size: 16,
            ),
          );
        },
      ),
    );
  }

  Widget _buildBreadcrumbItem(int index, Color textColor, Color activeColor) {
    final item = widget.items[index];
    final isLast = index == widget.items.length - 1;
    final isHovered = _hoveredIndex == index;

    return MouseRegion(
      onEnter: (_) {
        setState(() => _hoveredIndex = index);
        _slideController.forward();
      },
      onExit: (_) {
        setState(() => _hoveredIndex = -1);
        _slideController.reverse();
      },
      child: GestureDetector(
        onTap: () => widget.onItemTap?.call(index),
        child: AnimatedContainer(
          duration: Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isHovered 
                ? activeColor.withOpacity(0.1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: isLast ? Border.all(
              color: activeColor.withOpacity(0.3),
              width: 1,
            ) : null,
          ),
          child: Row(
            children: [
              if (item.icon != null) ...[
                AnimatedContainer(
                  duration: Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    boxShadow: isHovered ? [
                      BoxShadow(
                        color: activeColor.withOpacity(0.3),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ] : null,
                  ),
                  child: Icon(
                    item.icon,
                    color: isLast ? activeColor : 
                           (isHovered ? activeColor : textColor),
                    size: 16,
                  ),
                ),
                SizedBox(width: 6),
              ],
              AnimatedDefaultTextStyle(
                duration: Duration(milliseconds: 200),
                style: TextStyle(
                  color: isLast ? activeColor : 
                         (isHovered ? activeColor : textColor),
                  fontSize: 14,
                  fontWeight: isLast ? FontWeight.w600 : FontWeight.w500,
                ),
                child: Text(item.title),
              ),
            ],
          ),
        ),
      ),
    ).animate(target: isHovered ? 1 : 0)
      .scale(duration: Duration(milliseconds: 200))
      .shimmer(
        duration: Duration(milliseconds: 800), 
        color: activeColor.withOpacity(0.3)
      );
  }
}

class BreadcrumbItem {
  final String title;
  final IconData? icon;
  final String? route;
  final Map<String, dynamic>? data;

  const BreadcrumbItem({
    required this.title,
    this.icon,
    this.route,
    this.data,
  });
}

// Floating breadcrumb that appears on scroll
class FloatingBreadcrumb extends StatefulWidget {
  final List<BreadcrumbItem> items;
  final Function(int)? onItemTap;
  final ScrollController? scrollController;
  final double showOffset;

  const FloatingBreadcrumb({
    Key? key,
    required this.items,
    this.onItemTap,
    this.scrollController,
    this.showOffset = 100.0,
  }) : super(key: key);

  @override
  _FloatingBreadcrumbState createState() => _FloatingBreadcrumbState();
}

class _FloatingBreadcrumbState extends State<FloatingBreadcrumb>
    with SingleTickerProviderStateMixin {
  late AnimationController _visibilityController;
  bool _isVisible = false;

  @override
  void initState() {
    super.initState();
    _visibilityController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    
    widget.scrollController?.addListener(_onScroll);
  }

  @override
  void dispose() {
    widget.scrollController?.removeListener(_onScroll);
    _visibilityController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final shouldShow = widget.scrollController != null &&
        widget.scrollController!.offset > widget.showOffset;
    
    if (shouldShow != _isVisible) {
      setState(() => _isVisible = shouldShow);
      if (shouldShow) {
        _visibilityController.forward();
      } else {
        _visibilityController.reverse();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _visibilityController,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, -50 * (1 - _visibilityController.value)),
          child: Opacity(
            opacity: _visibilityController.value,
            child: BreadcrumbNavigation(
              items: widget.items,
              onItemTap: widget.onItemTap,
              height: 45,
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            ),
          ),
        );
      },
    );
  }
}

// Animated breadcrumb trail that shows navigation path
class BreadcrumbTrail extends StatefulWidget {
  final List<BreadcrumbItem> items;
  final Function(int)? onItemTap;
  final bool showTrail;

  const BreadcrumbTrail({
    Key? key,
    required this.items,
    this.onItemTap,
    this.showTrail = true,
  }) : super(key: key);

  @override
  _BreadcrumbTrailState createState() => _BreadcrumbTrailState();
}

class _BreadcrumbTrailState extends State<BreadcrumbTrail>
    with TickerProviderStateMixin {
  late AnimationController _trailController;
  List<TrailParticle> _particles = [];

  @override
  void initState() {
    super.initState();
    _trailController = AnimationController(
      duration: Duration(milliseconds: 2000),
      vsync: this,
    )..repeat();
    
    if (widget.showTrail) {
      _generateParticles();
    }
  }

  @override
  void dispose() {
    _trailController.dispose();
    super.dispose();
  }

  void _generateParticles() {
    for (int i = 0; i < 20; i++) {
      _particles.add(TrailParticle(
        startX: math.Random().nextDouble(),
        startY: math.Random().nextDouble(),
        speed: 0.5 + math.Random().nextDouble() * 0.5,
        size: 2 + math.Random().nextDouble() * 3,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (widget.showTrail)
          AnimatedBuilder(
            animation: _trailController,
            builder: (context, child) {
              return CustomPaint(
                painter: TrailPainter(_particles, _trailController.value),
                size: Size.infinite,
              );
            },
          ),
        BreadcrumbNavigation(
          items: widget.items,
          onItemTap: widget.onItemTap,
        ),
      ],
    );
  }
}

class TrailParticle {
  final double startX;
  final double startY;
  final double speed;
  final double size;

  TrailParticle({
    required this.startX,
    required this.startY,
    required this.speed,
    required this.size,
  });
}

class TrailPainter extends CustomPainter {
  final List<TrailParticle> particles;
  final double animationValue;

  TrailPainter(this.particles, this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill;

    for (final particle in particles) {
      final progress = (animationValue * particle.speed) % 1.0;
      final x = particle.startX * size.width;
      final y = (particle.startY + progress) * size.height % size.height;
      final opacity = math.sin(progress * math.pi);
      
      paint.color = Color(0xFF6C5CE7).withOpacity(opacity * 0.3);
      canvas.drawCircle(
        Offset(x, y),
        particle.size,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant TrailPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}