import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:vector_math/vector_math_64.dart' as vector;

class FloatingCard extends StatelessWidget {
  final AnimationController animationController;
  final double delay;
  final IconData icon;
  final Color color;

  const FloatingCard({
    Key? key,
    required this.animationController,
    required this.delay,
    required this.icon,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animationController,
      builder: (context, child) {
        final value = (animationController.value + delay) % 1.0;
        final floatOffset = math.sin(value * 2 * math.pi) * 20;
        final rotationAngle = value * 2 * math.pi * 0.3;
        
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..translate(0.0, floatOffset, 0.0)
            ..setEntry(3, 2, 0.001)
            ..rotateX(rotationAngle)
            ..rotateY(rotationAngle * 0.7),
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  color.withOpacity(0.8),
                  color.withOpacity(0.4),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 2,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            child: Center(
              child: Icon(
                icon,
                color: Colors.white,
                size: 32,
              ),
            ),
          ),
        );
      },
    );
  }
}