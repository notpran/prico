import 'package:flutter/material.dart';
import 'package:prico/api/project_api.dart';
import 'package:prico/models/project.dart';
import 'package:prico/models/repo_file.dart';
import 'package:prico/models/pull_request.dart';

class ProjectDetailScreen extends StatefulWidget {
  final Project project;

  ProjectDetailScreen({required this.project});

  @override
  _ProjectDetailScreenState createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  final ProjectApi projectApi = ProjectApi();
  late Future<List<RepoFile>> futureFiles;
  late Future<List<PullRequest>> futurePullRequests;

  @override
  void initState() {
    super.initState();
    futureFiles = projectApi.getProjectFiles(widget.project.id);
    futurePullRequests = projectApi.getProjectPullRequests(widget.project.id);
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.project.name),
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.folder), text: "Files"),
              Tab(icon: Icon(Icons.merge_type), text: "Pull Requests"),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildFilesView(),
            _buildPullRequestsView(),
          ],
        ),
      ),
    );
  }

  Widget _buildFilesView() {
    return FutureBuilder<List<RepoFile>>(
      future: futureFiles,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text("Error: ${snapshot.error}"));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(child: Text("No files found."));
        } else {
          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              RepoFile file = snapshot.data![index];
              return ListTile(
                leading: Icon(Icons.insert_drive_file),
                title: Text(file.path),
              );
            },
          );
        }
      },
    );
  }

  Widget _buildPullRequestsView() {
    return FutureBuilder<List<PullRequest>>(
      future: futurePullRequests,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text("Error: ${snapshot.error}"));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(child: Text("No pull requests found."));
        } else {
          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              PullRequest pr = snapshot.data![index];
              return ListTile(
                title: Text(pr.title),
                subtitle: Text("by ${pr.authorId} - ${pr.status}"),
              );
            },
          );
        }
      },
    );
  }
}
