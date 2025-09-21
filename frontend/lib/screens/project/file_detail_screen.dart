import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:prico/models/repo_file.dart';
import 'package:flutter_syntax_view/flutter_syntax_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:prico/utils/animation_extensions.dart';
import 'package:prico/utils/syntax_helper.dart';

class FileDetailScreen extends StatefulWidget {
  final RepoFile file;

  FileDetailScreen({required this.file});

  @override
  _FileDetailScreenState createState() => _FileDetailScreenState();
}

class _FileDetailScreenState extends State<FileDetailScreen>
    with TickerProviderStateMixin {
  late ScrollController _scrollController;
  bool _showLineNumbers = true;
  double _fontSize = 14.0;
  
  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  String _getLanguageFromExtension(String path) {
    final extension = path.split('.').last.toLowerCase();
    switch (extension) {
      case 'dart':
        return 'dart';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
      case 'cc':
      case 'cxx':
        return 'cpp';
      case 'c':
        return 'c';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'md':
        return 'markdown';
      case 'sql':
        return 'sql';
      case 'sh':
        return 'bash';
      default:
        return 'text';
    }
  }

  Color _getLanguageColor(String extension) {
    switch (extension.toLowerCase()) {
      case 'dart':
        return Colors.blue;
      case 'js':
      case 'ts':
        return Colors.yellow[700]!;
      case 'py':
        return Colors.green;
      case 'java':
        return Colors.orange;
      case 'html':
        return Colors.red;
      case 'css':
        return Colors.blue[400]!;
      case 'json':
        return Colors.purple;
      case 'yml':
      case 'yaml':
        return Colors.teal;
      default:
        return Colors.grey[600]!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final extension = widget.file.path.split('.').last;
    final language = _getLanguageFromExtension(widget.file.path);
    final languageColor = _getLanguageColor(extension);

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor: languageColor,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                widget.file.path.split('/').last,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      languageColor,
                      languageColor.withOpacity(0.8),
                    ],
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      right: -50,
                      top: -50,
                      child: Container(
                        width: 150,
                        height: 150,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                    ),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(height: 20),
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(30),
                            ),
                            child: Icon(
                              _getFileIcon(extension),
                              size: 30,
                              color: Colors.white,
                            ),
                          ).animate().scale(
                            duration: Duration(milliseconds: 600),
                          ),
                          SizedBox(height: 8),
                          Text(
                            widget.file.path,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center,
                          ).animate().fadeIn(
                            delay: Duration(milliseconds: 300),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              PopupMenuButton<String>(
                icon: Icon(Icons.more_vert, color: Colors.white),
                onSelected: (value) {
                  switch (value) {
                    case 'copy':
                      _copyToClipboard();
                      break;
                    case 'line_numbers':
                      setState(() {
                        _showLineNumbers = !_showLineNumbers;
                      });
                      break;
                    case 'font_size':
                      _showFontSizeDialog();
                      break;
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'copy',
                    child: Row(
                      children: [
                        Icon(Icons.copy, size: 20),
                        SizedBox(width: 8),
                        Text('Copy Content'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'line_numbers',
                    child: Row(
                      children: [
                        Icon(
                          _showLineNumbers ? Icons.format_list_numbered : Icons.format_list_numbered_outlined,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text('Toggle Line Numbers'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'font_size',
                    child: Row(
                      children: [
                        Icon(Icons.text_fields, size: 20),
                        SizedBox(width: 8),
                        Text('Font Size'),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Container(
              margin: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Color(0xFF1E1E1E), // Dark theme for code
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // File info header
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[800],
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(12),
                          topRight: Radius.circular(12),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: languageColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              language.toUpperCase(),
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              widget.file.path,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '${widget.file.content.split('\n').length} lines',
                            style: TextStyle(
                              color: Colors.grey[400],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ).animate().slideInDown(
                      duration: Duration(milliseconds: 400),
                    ),
                    
                    // Code content
                    Container(
                      width: double.infinity,
                      child: SyntaxView(
                        code: widget.file.content,
                        syntax: _getSyntaxFromLanguage(language),
                        fontSize: _fontSize,
                        withZoom: true,
                        withLinesCount: _showLineNumbers,
                        expanded: false,
                      ),
                    ).animate().fadeIn(
                      delay: Duration(milliseconds: 200),
                      duration: Duration(milliseconds: 600),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getFileIcon(String extension) {
    switch (extension.toLowerCase()) {
      case 'dart':
        return Icons.code;
      case 'js':
      case 'ts':
        return Icons.javascript;
      case 'py':
        return Icons.smart_toy;
      case 'java':
        return Icons.coffee;
      case 'html':
      case 'css':
        return Icons.web;
      case 'md':
        return Icons.description;
      case 'json':
        return Icons.data_object;
      case 'yml':
      case 'yaml':
        return Icons.settings;
      default:
        return Icons.insert_drive_file;
    }
  }

  String _getSyntaxName(String language) {
    return SyntaxHelper.getSyntaxName(language);
  }
  
  Syntax _getSyntaxFromLanguage(String language) {
    return SyntaxHelper.getSyntaxFromName(language);
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: widget.file.content));
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.check, color: Colors.white),
            SizedBox(width: 8),
            Text('Content copied to clipboard'),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  void _showFontSizeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Font Size'),
        content: StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Size: ${_fontSize.toInt()}'),
              Slider(
                value: _fontSize,
                min: 10.0,
                max: 24.0,
                divisions: 14,
                onChanged: (value) {
                  setState(() {
                    _fontSize = value;
                  });
                  this.setState(() {});
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Done'),
          ),
        ],
      ).animate().scale(),
    );
  }
}
