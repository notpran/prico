import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:prico/models/message.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:prico/api/api_config.dart';

class ChatApi {
  final String _baseUrl = ApiConfig.baseUrl;

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
  Future<List<Message>> getMessages(String roomId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/chat/rooms/$roomId/messages'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => Message.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load messages');
    }
  }
}
