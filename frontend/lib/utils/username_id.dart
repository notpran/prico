import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Generate a stable unique id for a username.
///
/// This uses SHA1 of the normalized username and returns the first 10 hex chars.
String uniqueIdForUsername(String username) {
  final normalized = username.trim().toLowerCase();
  final bytes = utf8.encode(normalized);
  final digest = sha1.convert(bytes);
  return digest.toString().substring(0, 10);
}
