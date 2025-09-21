class PullRequest {
  final String id;
  final String projectId;
  final String authorId;
  final String title;
  final String description;
  final String status;

  PullRequest({
    required this.id,
    required this.projectId,
    required this.authorId,
    required this.title,
    required this.description,
    required this.status,
  });

  factory PullRequest.fromJson(Map<String, dynamic> json) {
    return PullRequest(
      id: json['_id'],
      projectId: json['project_id'],
      authorId: json['author_id'],
      title: json['title'],
      description: json['description'],
      status: json['status'],
    );
  }
}
