import 'package:flutter/material.dart';
import 'package:prico/screens/auth/login_screen.dart';

void main() {
  runApp(const PricoApp());
}

class PricoApp extends StatelessWidget {
  const PricoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Prico',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: LoginScreen(),
    );
  }
}
