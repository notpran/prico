import 'package:flutter/material.dart';
import 'package:prico/api/chat_api.dart';
import 'package:prico/models/message.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChatRoomScreen extends StatefulWidget {
  final String roomId;

  ChatRoomScreen({required this.roomId});

  @override
  _ChatRoomScreenState createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final ChatApi chatApi = ChatApi();
  final TextEditingController _controller = TextEditingController();
  late IO.Socket socket;
  List<Message> messages = [];

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _initSocket();
  }

  void _fetchMessages() async {
    try {
      var fetchedMessages = await chatApi.getMessages(widget.roomId);
      setState(() {
        messages = fetchedMessages;
      });
    } catch (e) {
      // Handle error
      print(e);
    }
  }

  void _initSocket() {
    socket = IO.io('http://localhost:8000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();
    socket.on('connect', (_) {
      print('connected to socket server');
    });
    socket.on('chat', (data) {
      setState(() {
        // Assuming data is a map that can be converted to a Message
        messages.add(Message.fromJson(data));
      });
    });
  }

  void _sendMessage() {
    if (_controller.text.isNotEmpty) {
      socket.emit('chat', {
        'roomId': widget.roomId,
        'content': _controller.text,
        // 'senderId' should be handled by the backend based on the token
      });
      _controller.clear();
    }
  }

  @override
  void dispose() {
    socket.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Chat Room ${widget.roomId}")),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final message = messages[index];
                return ListTile(
                  title: Text(message.senderId),
                  subtitle: Text(message.content),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(hintText: "Enter message"),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
