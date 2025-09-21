import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:prico/models/project.dart';
import 'package:prico/models/repo_file.dart';
import 'package:prico/models/pull_request.dart';
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

  Future<List<RepoFile>> getProjectFiles(String projectId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/project/$projectId/files'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => RepoFile.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load project files');
    }
  }

  Future<List<PullRequest>> getProjectPullRequests(String projectId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/project/$projectId/pulls'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => PullRequest.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load pull requests');
    }
  }

  Future<Project> createProject(String name, String description) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/project/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'name': name,
        'description': description,
      }),
    );

    if (response.statusCode == 200) {
      return Project.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create project');
    }
  }
}
