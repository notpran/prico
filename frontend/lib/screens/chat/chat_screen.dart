import 'package:flutter/material.dart';
import 'package:prico/screens/chat/chat_room_screen.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:prico/utils/animation_extensions.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

class ChatScreen extends StatefulWidget {
  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<ChatRoomInfo> _allRooms = [];
  List<ChatRoomInfo> _filteredRooms = [];

  @override
  void initState() {
    super.initState();
    _loadChatRooms();
  }

  void _loadChatRooms() {
    // For demonstration, we'll have a static list of rooms.
    // In a real app, this would be fetched from an API.
    _allRooms = [
      ChatRoomInfo(
        id: 'general',
        name: 'General',
        description: 'General discussion',
        lastMessage: 'Hey everyone! 👋',
        lastMessageTime: '2 min ago',
        unreadCount: 3,
        isActive: true,
        participantCount: 24,
      ),
      ChatRoomInfo(
        id: 'random',
        name: 'Random',
        description: 'Random conversations',
        lastMessage: 'Check out this cool project!',
        lastMessageTime: '15 min ago',
        unreadCount: 0,
        isActive: false,
        participantCount: 12,
      ),
      ChatRoomInfo(
        id: 'dev-talk',
        name: 'Dev Talk',
        description: 'Development discussions',
        lastMessage: 'Anyone familiar with Flutter animations?',
        lastMessageTime: '1 hour ago',
        unreadCount: 7,
        isActive: true,
        participantCount: 18,
      ),
      ChatRoomInfo(
        id: 'code-review',
        name: 'Code Review',
        description: 'Share and review code',
        lastMessage: 'Please review my pull request',
        lastMessageTime: '3 hours ago',
        unreadCount: 1,
        isActive: false,
        participantCount: 9,
      ),
    ];
    _filteredRooms = List.from(_allRooms);
  }

  void _filterRooms(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredRooms = List.from(_allRooms);
      } else {
        _filteredRooms = _allRooms
            .where((room) =>
                room.name.toLowerCase().contains(query.toLowerCase()) ||
                room.description.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor: Theme.of(context).primaryColor,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                "Chat Rooms",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Theme.of(context).primaryColor,
                      Theme.of(context).primaryColor.withOpacity(0.8),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              color: Theme.of(context).primaryColor,
              child: Container(
                margin: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: Offset(0, 5),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: _filterRooms,
                  decoration: InputDecoration(
                    hintText: "Search chat rooms...",
                    prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 15,
                    ),
                  ),
                ),
              ).animate().slideInDown(
                duration: Duration(milliseconds: 600),
                curve: Curves.easeOut,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              height: 20,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                return AnimationConfiguration.staggeredList(
                  position: index,
                  duration: const Duration(milliseconds: 375),
                  child: SlideAnimation(
                    verticalOffset: 50.0,
                    child: FadeInAnimation(
                      child: _buildChatRoomCard(_filteredRooms[index], index),
                    ),
                  ),
                );
              },
              childCount: _filteredRooms.length,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateRoomDialog,
        icon: Icon(Icons.add),
        label: Text("New Room"),
        backgroundColor: Theme.of(context).primaryColor,
      ).animate().scale(
        delay: Duration(milliseconds: 800),
        duration: Duration(milliseconds: 400),
      ),
    );
  }

  Widget _buildChatRoomCard(ChatRoomInfo room, int index) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Navigator.push(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) =>
                    ChatRoomScreen(roomId: room.id),
                transitionsBuilder: (context, animation, secondaryAnimation, child) {
                  return SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(1.0, 0.0),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    )),
                    child: child,
                  );
                },
              ),
            );
          },
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _getRoomColor(room.id),
                        _getRoomColor(room.id).withOpacity(0.7),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Center(
                    child: Text(
                      "#${room.name.substring(0, 1).toUpperCase()}",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              room.name,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[800],
                              ),
                            ),
                          ),
                          if (room.isActive)
                            Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ).animate(onPlay: (controller) => controller.repeat())
                                .scale(
                                  duration: Duration(milliseconds: 1000),
                                  curve: Curves.easeInOut,
                                ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        room.description,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              room.lastMessage,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[700],
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            room.lastMessageTime,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.people,
                            size: 16,
                            color: Colors.grey[500],
                          ),
                          SizedBox(width: 4),
                          Text(
                            "${room.participantCount} members",
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                          Spacer(),
                          if (room.unreadCount > 0)
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                room.unreadCount.toString(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ).animate().scale(
                              duration: Duration(milliseconds: 300),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getRoomColor(String roomId) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.red,
      Colors.teal,
    ];
    return colors[roomId.hashCode % colors.length];
  }

  void _showCreateRoomDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Create New Room"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: "Room Name",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: "Description",
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              // Handle room creation
              Navigator.pop(context);
            },
            child: Text("Create"),
          ),
        ],
      ).animate().scale(
        duration: Duration(milliseconds: 200),
      ),
    );
  }
}

class ChatRoomInfo {
  final String id;
  final String name;
  final String description;
  final String lastMessage;
  final String lastMessageTime;
  final int unreadCount;
  final bool isActive;
  final int participantCount;

  ChatRoomInfo({
    required this.id,
    required this.name,
    required this.description,
    required this.lastMessage,
    required this.lastMessageTime,
    required this.unreadCount,
    required this.isActive,
    required this.participantCount,
  });
}
