class Project {
  final String id;
  final String name;
  final String ownerId;
  final String? description;

  Project({
    required this.id,
    required this.name,
    required this.ownerId,
    this.description,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['_id'],
      name: json['name'],
      ownerId: json['owner_id'],
      description: json['description'],
    );
  }
}
