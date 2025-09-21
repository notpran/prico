import 'package:flutter/material.dart';
import 'package:prico/api/project_api.dart';
import 'package:prico/models/project.dart';
import 'package:prico/screens/project/project_detail_screen.dart';
import 'package:prico/screens/project/create_project_screen.dart';

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
              itemBuilder: (context, index) {
                Project project = snapshot.data![index];
                return ListTile(
                  title: Text(project.name),
                  subtitle: Text(project.description ?? ''),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ProjectDetailScreen(project: project),
                      ),
                    );
                  },
                );
              },
            );
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => CreateProjectScreen()),
          );
          if (result == true) {
            // Refresh the list of projects
            setState(() {
              futureProjects = projectApi.getProjects();
            });
          }
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
