import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;

class CustomCursor extends StatefulWidget {
  final Widget child;
  final bool enableCursor;
  final Color? cursorColor;

  const CustomCursor({
    Key? key,
    required this.child,
    this.enableCursor = true,
    this.cursorColor,
  }) : super(key: key);

  @override
  _CustomCursorState createState() => _CustomCursorState();
}

class _CustomCursorState extends State<CustomCursor>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _rippleController;
  late AnimationController _trailController;
  
  late Animation<double> _scaleAnimation;
  late Animation<double> _rippleAnimation;
  late Animation<double> _rotationAnimation;
  
  Offset _cursorPosition = Offset.zero;
  bool _isHovering = false;
  bool _isClicking = false;
  List<CursorTrail> _trails = [];

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: Duration(milliseconds: 150),
      vsync: this,
    );
    
    _rippleController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );
    
    _trailController = AnimationController(
      duration: Duration(milliseconds: 2000),
      vsync: this,
    )..repeat();
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.5,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));
    
    _rippleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _rippleController,
      curve: Curves.easeOutQuart,
    ));
    
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 2 * math.pi,
    ).animate(_trailController);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _rippleController.dispose();
    _trailController.dispose();
    super.dispose();
  }

  void _onPointerMove(PointerEvent event) {
    setState(() {
      _cursorPosition = event.localPosition;
      _addTrail(_cursorPosition);
    });
  }

  void _onPointerEnter(PointerEvent event) {
    setState(() {
      _isHovering = true;
    });
    _animationController.forward();
  }

  void _onPointerExit(PointerEvent event) {
    setState(() {
      _isHovering = false;
    });
    _animationController.reverse();
  }

  void _onPointerDown(PointerEvent event) {
    setState(() {
      _isClicking = true;
    });
    _rippleController.forward().then((_) {
      _rippleController.reset();
    });
    HapticFeedback.lightImpact();
  }

  void _onPointerUp(PointerEvent event) {
    setState(() {
      _isClicking = false;
    });
  }

  void _addTrail(Offset position) {
    _trails.add(CursorTrail(
      position: position,
      createdAt: DateTime.now(),
    ));
    
    // Remove old trails
    final now = DateTime.now();
    _trails.removeWhere((trail) => 
      now.difference(trail.createdAt).inMilliseconds > 500);
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enableCursor) {
      return widget.child;
    }

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cursorColor = widget.cursorColor ?? 
        (isDark ? Color(0xFF6C5CE7) : Color(0xFF2A5298));

    return MouseRegion(
      cursor: SystemMouseCursors.none,
      onEnter: _onPointerEnter,
      onExit: _onPointerExit,
      child: Listener(
        onPointerMove: _onPointerMove,
        onPointerDown: _onPointerDown,
        onPointerUp: _onPointerUp,
        child: Stack(
          children: [
            widget.child,
            
            // Cursor trails
            ...List.generate(_trails.length, (index) {
              final trail = _trails[index];
              final age = DateTime.now().difference(trail.createdAt).inMilliseconds;
              final opacity = math.max(0.0, 1.0 - (age / 500.0));
              final size = 4.0 + (index * 0.5);
              
              return Positioned(
                left: trail.position.dx - size / 2,
                top: trail.position.dy - size / 2,
                child: IgnorePointer(
                  child: Container(
                    width: size,
                    height: size,
                    decoration: BoxDecoration(
                      color: cursorColor.withOpacity(opacity * 0.3),
                      borderRadius: BorderRadius.circular(size / 2),
                      boxShadow: [
                        BoxShadow(
                          color: cursorColor.withOpacity(opacity * 0.2),
                          blurRadius: 2,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
            
            // Main cursor
            AnimatedBuilder(
              animation: Listenable.merge([
                _animationController,
                _rippleController,
                _trailController,
              ]),
              builder: (context, child) {
                return Positioned(
                  left: _cursorPosition.dx - 12,
                  top: _cursorPosition.dy - 12,
                  child: IgnorePointer(
                    child: Transform.scale(
                      scale: _scaleAnimation.value,
                      child: Transform.rotate(
                        angle: _isHovering ? _rotationAnimation.value * 0.1 : 0,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Ripple effect
                            if (_rippleAnimation.value > 0)
                              Container(
                                width: 24 + (_rippleAnimation.value * 30),
                                height: 24 + (_rippleAnimation.value * 30),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: cursorColor.withOpacity(
                                      0.6 * (1 - _rippleAnimation.value)
                                    ),
                                    width: 2,
                                  ),
                                  borderRadius: BorderRadius.circular(50),
                                ),
                              ),
                            
                            // Outer ring
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: cursorColor.withOpacity(_isHovering ? 0.8 : 0.4),
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            
                            // Inner dot
                            Container(
                              width: _isClicking ? 6 : 8,
                              height: _isClicking ? 6 : 8,
                              decoration: BoxDecoration(
                                color: cursorColor,
                                borderRadius: BorderRadius.circular(4),
                                boxShadow: [
                                  BoxShadow(
                                    color: cursorColor.withOpacity(0.5),
                                    blurRadius: _isHovering ? 8 : 4,
                                    spreadRadius: _isHovering ? 2 : 0,
                                  ),
                                ],
                              ),
                            ),
                            
                            // Hover particles
                            if (_isHovering)
                              ...List.generate(6, (index) {
                                final angle = (index * math.pi * 2 / 6) + 
                                             (_rotationAnimation.value * 2);
                                final distance = 15.0;
                                final x = math.cos(angle) * distance;
                                final y = math.sin(angle) * distance;
                                
                                return Transform.translate(
                                  offset: Offset(x, y),
                                  child: Container(
                                    width: 3,
                                    height: 3,
                                    decoration: BoxDecoration(
                                      color: cursorColor.withOpacity(0.6),
                                      borderRadius: BorderRadius.circular(1.5),
                                    ),
                                  ),
                                );
                              }),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class CursorTrail {
  final Offset position;
  final DateTime createdAt;

  CursorTrail({
    required this.position,
    required this.createdAt,
  });
}

// Enhanced cursor for interactive elements
class InteractiveCursor extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final String? tooltipText;
  final CursorStyle style;

  const InteractiveCursor({
    Key? key,
    required this.child,
    this.onTap,
    this.tooltipText,
    this.style = CursorStyle.pointer,
  }) : super(key: key);

  @override
  _InteractiveCursorState createState() => _InteractiveCursorState();
}

class _InteractiveCursorState extends State<InteractiveCursor>
    with SingleTickerProviderStateMixin {
  late AnimationController _hoverController;
  bool _isHovered = false;

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
      cursor: SystemMouseCursors.none,
      onEnter: (_) {
        setState(() => _isHovered = true);
        _hoverController.forward();
      },
      onExit: (_) {
        setState(() => _isHovered = false);
        _hoverController.reverse();
      },
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: Duration(milliseconds: 200),
          transform: Matrix4.identity()
            ..scale(_isHovered ? 1.05 : 1.0),
          child: widget.child,
        ),
      ),
    );
  }
}

enum CursorStyle {
  pointer,
  text,
  grab,
  move,
  resize,
  loading,
}