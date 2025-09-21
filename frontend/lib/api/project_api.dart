import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:prico/models/project.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProjectApi {
  final String _baseUrl = 'http://localhost:8000/api/v1';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<List<Project>> getProjects() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/project/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => Project.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load projects');
    }
  }
}
