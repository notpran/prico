import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.dark; // Default to dark theme
  bool _isSystemTheme = false;

  ThemeMode get themeMode => _themeMode;
  bool get isSystemTheme => _isSystemTheme;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  ThemeProvider() {
    _loadThemeFromPrefs();
  }

  void toggleTheme() {
    if (_themeMode == ThemeMode.dark) {
      _themeMode = ThemeMode.light;
    } else {
      _themeMode = ThemeMode.dark;
    }
    _isSystemTheme = false;
    _saveThemeToPrefs();
    notifyListeners();
  }

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    _isSystemTheme = mode == ThemeMode.system;
    _saveThemeToPrefs();
    notifyListeners();
  }

  void setDarkMode(bool isDark) {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    _isSystemTheme = false;
    _saveThemeToPrefs();
    notifyListeners();
  }

  void setSystemTheme() {
    _themeMode = ThemeMode.system;
    _isSystemTheme = true;
    _saveThemeToPrefs();
    notifyListeners();
  }

  _loadThemeFromPrefs() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? themeString = prefs.getString('theme_mode');
    
    if (themeString != null) {
      switch (themeString) {
        case 'light':
          _themeMode = ThemeMode.light;
          _isSystemTheme = false;
          break;
        case 'dark':
          _themeMode = ThemeMode.dark;
          _isSystemTheme = false;
          break;
        case 'system':
          _themeMode = ThemeMode.system;
          _isSystemTheme = true;
          break;
      }
    } else {
      // Default to dark theme if no preference is saved
      _themeMode = ThemeMode.dark;
      _isSystemTheme = false;
    }
    notifyListeners();
  }

  _saveThemeToPrefs() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String themeString;
    
    switch (_themeMode) {
      case ThemeMode.light:
        themeString = 'light';
        break;
      case ThemeMode.dark:
        themeString = 'dark';
        break;
      case ThemeMode.system:
        themeString = 'system';
        break;
    }
    
    await prefs.setString('theme_mode', themeString);
  }

  // Get theme-aware colors
  static Color getPrimaryGradientStart(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Color(0xFF6C5CE7)
        : Color(0xFF2A5298);
  }

  static Color getPrimaryGradientEnd(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Color(0xFF74B9FF)
        : Color(0xFF5C85D6);
  }

  static Color getBackgroundGradientStart(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Color(0xFF0D1421)
        : Color(0xFFF5F7FA);
  }

  static Color getBackgroundGradientEnd(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Color(0xFF1A2332)
        : Color(0xFFE8E9ED);
  }

  static Color getGlassMorphismColor(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.white.withOpacity(0.1)
        : Colors.black.withOpacity(0.05);
  }

  static Color getTextColor(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Color(0xFFE8E9ED)
        : Color(0xFF2D3748);
  }

  static Color getAccentColor(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Color(0xFF74B9FF)
        : Color(0xFF2A5298);
  }
}