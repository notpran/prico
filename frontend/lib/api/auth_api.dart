import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:prico/api/api_config.dart';
import 'package:prico/utils/logger.dart';

class AuthApi {
  final String _baseUrl = ApiConfig.baseUrl;

  Future<bool> login(String email, String password) async {
    final url = '$_baseUrl/auth/login/access-token';
    AppLogger.log('Attempting login at: $url');
    
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {'username': email, 'password': password},
      );

      AppLogger.log('Login response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['access_token']);
        AppLogger.log('Login successful');
        return true;
      } else {
        AppLogger.error('Login failed with status: ${response.statusCode}', response.body);
        return false;
      }
    } catch (e, stackTrace) {
      AppLogger.error('Login exception', e, stackTrace);
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<bool> register(String username, String email, String password, [String? userId]) async {
    final payload = {
      'username': username,
      'email': email,
      'password': password,
    };
    if (userId != null) payload['user_id'] = userId;

    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(payload),
    );
    return response.statusCode == 200;
  }
}
