import 'package:flutter/material.dart';
import 'package:prico/api/project_api.dart';
import 'package:prico/models/project.dart';

class ProjectScreen extends StatefulWidget {
  @override
  _ProjectScreenState createState() => _ProjectScreenState();
}

class _ProjectScreenState extends State<ProjectScreen> {
  late Future<List<Project>> futureProjects;
  final ProjectApi projectApi = ProjectApi();

  @override
  void initState() {
    super.initState();
    futureProjects = projectApi.getProjects();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Projects")),
      body: FutureBuilder<List<Project>>(
        future: futureProjects,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text("No projects found."));
          } else {
            return ListView.builder(
              itemCount: snapshot.data!.length,