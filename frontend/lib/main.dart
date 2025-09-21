import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:prico/screens/landing_screen_simple.dart';
import 'package:prico/providers/theme_provider.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => ThemeProvider(),
      child: const PricoApp(),
    ),
  );
}

class PricoApp extends StatelessWidget {
  const PricoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Prico',
          theme: _buildLightTheme(),
          darkTheme: _buildDarkTheme(),
          themeMode: themeProvider.themeMode,
          home: LandingScreen(),
          debugShowCheckedModeBanner: false,
        );
      },
    );
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primarySwatch: Colors.blue,
      primaryColor: Color(0xFF2A5298),
      scaffoldBackgroundColor: Color(0xFFF5F7FA),
      colorScheme: ColorScheme.fromSeed(
        seedColor: Color(0xFF2A5298),
        brightness: Brightness.light,
      ),
      visualDensity: VisualDensity.adaptivePlatformDensity,
      fontFamily: 'Roboto',
    );
  }

  ThemeData _buildDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: Color(0xFF6C5CE7),
      scaffoldBackgroundColor: Color(0xFF0D1421),
      colorScheme: ColorScheme.fromSeed(
        seedColor: Color(0xFF6C5CE7),
        brightness: Brightness.dark,
        surface: Color(0xFF1A2332),
        onSurface: Color(0xFFE8E9ED),
        primary: Color(0xFF6C5CE7),
        secondary: Color(0xFF74B9FF),
        tertiary: Color(0xFFFF7675),
        background: Color(0xFF0D1421),
        onBackground: Color(0xFFE8E9ED),
      ).copyWith(
        surfaceVariant: Color(0xFF2D3748),
        onSurfaceVariant: Color(0xFFB8BCC8),
        outline: Color(0xFF4A5568),
        shadow: Colors.black.withOpacity(0.3),
      ),
      visualDensity: VisualDensity.adaptivePlatformDensity,
      fontFamily: 'Roboto',
      appBarTheme: AppBarTheme(
        backgroundColor: Color(0xFF1A2332).withOpacity(0.9),
        foregroundColor: Color(0xFFE8E9ED),
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),
      cardTheme: CardTheme(
        color: Color(0xFF1A2332),
        shadowColor: Colors.black.withOpacity(0.3),
        elevation: 8,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Color(0xFF6C5CE7),
          foregroundColor: Colors.white,
          shadowColor: Color(0xFF6C5CE7).withOpacity(0.5),
          elevation: 8,
        ),
      ),
    );
  }
}
