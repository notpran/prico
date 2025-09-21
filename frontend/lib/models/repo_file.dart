class RepoFile {
  final String id;
  final String projectId;
  final String path;
  final String content;

  RepoFile({
    required this.id,
    required this.projectId,
    required this.path,
    required this.content,
  });

  factory RepoFile.fromJson(Map<String, dynamic> json) {
    return RepoFile(
      id: json['_id'],
      projectId: json['project_id'],
      path: json['path'],
      content: json['content'],
    );
  }
}
