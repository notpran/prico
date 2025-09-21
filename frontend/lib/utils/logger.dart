import 'package:flutter/foundation.dart';

class AppLogger {
  static void log(String message) {
    if (kDebugMode) {
      print('[PRICO] $message');
    }
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    if (kDebugMode) {
      print('[PRICO ERROR] $message');
      if (error != null) {
        print(error);
      }
      if (stackTrace != null) {
        print(stackTrace);
      }
    }
  }
}