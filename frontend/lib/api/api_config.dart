class ApiConfig {
  static String get baseUrl {
    // For GitHub Codespaces, detect if we're running in a Codespace environment
    final currentUrl = Uri.base.toString();
    
    // If we're running in a browser in GitHub Codespaces
    if (currentUrl.contains('github.dev') || currentUrl.contains('preview.app.github.dev')) {
      // Extract the Codespace domain and construct backend URL
      // Example: if frontend is https://xyz-abcdef-5000.preview.app.github.dev/
      // backend might be https://xyz-abcdef-8000.preview.app.github.dev/
      
      final uri = Uri.parse(currentUrl);
      final host = uri.host;
      
      // Try to replace the port number in the hostname (from 5000 to 8000)
      if (host.contains('-')) {
        final parts = host.split('-');
        if (parts.length >= 3) {
          // Replace the port part (assuming port is the second to last segment)
          parts[parts.length - 2] = '8000';
          final newHost = parts.join('-');
          return '${uri.scheme}://$newHost/api/v1';
        }
      }
      
      // Fallback: use the hostname with /api/v1 path
      return '${uri.scheme}://${host.replaceFirst('5000', '8000')}/api/v1';
    }
    
    // Default for local development
    return 'http://localhost:8000/api/v1';
  }
}