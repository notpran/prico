import 'package:flutter/material.dart';
import 'package:prico/screens/chat/chat_room_screen.dart';

class ChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // For demonstration, we'll have a static list of rooms.
    // In a real app, this would be fetched from an API.
    final chatRooms = ['general', 'random'];

    return Scaffold(
      appBar: AppBar(title: Text("Chat")),
      body: ListView.builder(
        itemCount: chatRooms.length,
        itemBuilder: (context, index) {
          final room = chatRooms[index];
          return ListTile(
            title: Text("#$room"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChatRoomScreen(roomId: room),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
