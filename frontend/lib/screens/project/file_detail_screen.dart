import 'package:flutter/material.dart';
import 'package:flutter_syntax_view/flutter_syntax_view.dart';
import 'package:prico/models/repo_file.dart';

class FileDetailScreen extends StatelessWidget {
  final RepoFile file;

  FileDetailScreen({required this.file});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(file.path),
      ),
      body: SyntaxView(
        code: file.content,
        syntax: Syntax.DART, // This should be dynamic based on file type
        syntaxTheme: SyntaxTheme.vscodeDark(),
        withZoom: true,
        withLinesCount: true,
        expanded: true,
      ),
    );
  }
}
