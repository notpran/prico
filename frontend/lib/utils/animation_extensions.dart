import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

// Extension methods for Flutter Animate
extension AnimateExtensions on Animate {
  Animate slideInUp({
    Duration? delay,
    Duration? duration,
    Curve? curve,
    double? from,
    double? to,
  }) {
    return this.move(
      delay: delay,
      duration: duration ?? const Duration(milliseconds: 500),
      curve: curve ?? Curves.easeOutCubic,
      begin: Offset(0, from ?? 100),
      end: Offset(0, to ?? 0),
    );
  }
  
  Animate slideInDown({
    Duration? delay,
    Duration? duration,
    Curve? curve,
    double? from,
    double? to,
  }) {
    return this.move(
      delay: delay,
      duration: duration ?? const Duration(milliseconds: 500),
      curve: curve ?? Curves.easeOutCubic,
      begin: Offset(0, from ?? -100),
      end: Offset(0, to ?? 0),
    );
  }
  
  Animate slideInLeft({
    Duration? delay,
    Duration? duration,
    Curve? curve,
    double? from,
    double? to,
  }) {
    return this.move(
      delay: delay,
      duration: duration ?? const Duration(milliseconds: 500),
      curve: curve ?? Curves.easeOutCubic,
      begin: Offset(from ?? -100, 0),
      end: Offset(to ?? 0, 0),
    );
  }
  
  Animate slideInRight({
    Duration? delay,
    Duration? duration,
    Curve? curve,
    double? from,
    double? to,
  }) {
    return this.move(
      delay: delay,
      duration: duration ?? const Duration(milliseconds: 500),
      curve: curve ?? Curves.easeOutCubic,
      begin: Offset(from ?? 100, 0),
      end: Offset(to ?? 0, 0),
    );
  }
}