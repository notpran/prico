import 'package:flutter/material.dart';
import 'package:flutter_syntax_view/flutter_syntax_view.dart';

// Utility class to handle syntax highlighting
class SyntaxHelper {
  static Syntax getSyntaxFromName(String language) {
    switch (language.toLowerCase()) {
      case 'dart':
        return Syntax.dart;
      case 'javascript':
      case 'typescript':
      case 'js':
      case 'ts':
        return Syntax.javascript;
      case 'python':
      case 'py':
        return Syntax.javascript; // Fallback since python isn't available
      case 'java':
        return Syntax.java;
      case 'cpp':
      case 'c':
      case 'c++':
        return Syntax.cpp;
      case 'html':
      case 'xml':
      case 'svg':
        return Syntax.javascript; // Fallback since xml isn't available
      case 'css':
        return Syntax.javascript; // Fallback since css isn't available
      case 'json':
        return Syntax.javascript; // Fallback since json isn't available
      case 'yaml':
      case 'yml':
        return Syntax.yaml;
      case 'sql':
        return Syntax.javascript; // Fallback since sql isn't available
      case 'bash':
      case 'sh':
        return Syntax.javascript; // Fallback since shell isn't available
      default:
        return Syntax.javascript;
    }
  }
  }
  
  static String getSyntaxName(String language) {
    switch (language.toLowerCase()) {
      case 'dart':
        return 'dart';
      case 'javascript':
      case 'typescript':
      case 'js':
      case 'ts':
        return 'javascript';
      case 'python':
      case 'py':
        return 'javascript'; // Fallback since python mode isn't available
      case 'java':
        return 'java';
      case 'cpp':
      case 'c':
      case 'c++':
        return 'cpp';
      case 'html':
      case 'xml':
      case 'svg':
        return 'javascript'; // Fallback
      case 'css':
        return 'javascript'; // Fallback
      case 'json':
        return 'javascript'; // Fallback
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'sql':
        return 'javascript'; // Fallback
      case 'bash':
      case 'sh':
        return 'javascript'; // Fallback
      default:
        return 'javascript';
    }
  }
}