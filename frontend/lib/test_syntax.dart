import 'package:flutter/material.dart';
import 'package:flutter_syntax_view/flutter_syntax_view.dart';

void main() {
  print('Syntax enum values:');
  
  // Try to print each value to see which ones are available
  try {
    print('DART: ${Syntax.DART}');
  } catch (e) {
    print('DART not available: $e');
  }
  
  try {
    print('dart: ${Syntax.dart}');
  } catch (e) {
    print('dart not available: $e');
  }
  
  try {
    print('JAVASCRIPT: ${Syntax.JAVASCRIPT}');
  } catch (e) {
    print('JAVASCRIPT not available: $e');
  }
  
  try {
    print('javascript: ${Syntax.javascript}');
  } catch (e) {
    print('javascript not available: $e');
  }
}