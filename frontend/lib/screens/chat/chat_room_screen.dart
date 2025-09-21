import 'package:flutter/material.dart';
import 'package:prico/api/chat_api.dart';
import 'package:prico/models/message.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:prico/utils/animation_extensions.dart';
import 'package:intl/intl.dart';

class ChatRoomScreen extends StatefulWidget {
  final String roomId;

  ChatRoomScreen({required this.roomId});

  @override
  _ChatRoomScreenState createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen>
    with TickerProviderStateMixin {
  final ChatApi chatApi = ChatApi();
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late IO.Socket socket;
  List<Message> messages = [];
  bool _showEmojiPicker = false;
  bool _isTyping = false;
  List<String> _typingUsers = [];
  late AnimationController _typingAnimationController;

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _initSocket();
    _typingAnimationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  void _fetchMessages() async {
    try {
      var fetchedMessages = await chatApi.getMessages(widget.roomId);
      setState(() {
        messages = fetchedMessages;
      });
      _scrollToBottom();
    } catch (e) {
      print('Error fetching messages: $e');
    }
  }

  void _initSocket() {
    socket = IO.io('http://localhost:8000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();
    
    socket.on('connect', (_) {
      print('Connected to socket server');
      socket.emit('join_room', widget.roomId);
    });
    
    socket.on('chat', (data) {
      setState(() {
        messages.add(Message.fromJson(data));
      });
      _scrollToBottom();
    });
    
    socket.on('typing', (data) {
      setState(() {
        String userId = data['user_id'];
        if (data['typing'] && !_typingUsers.contains(userId)) {
          _typingUsers.add(userId);
        } else {
          _typingUsers.remove(userId);
        }
      });
    });
    
    socket.on('user_joined', (data) {
      _showSystemMessage('${data['username']} joined the chat');
    });
    
    socket.on('user_left', (data) {
      _showSystemMessage('${data['username']} left the chat');
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _showSystemMessage(String content) {
    setState(() {
      messages.add(Message(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        roomId: widget.roomId,
        senderId: 'system',
        senderName: 'System',
        content: content,
        timestamp: DateTime.now().toIso8601String(),
        type: MessageType.system,
      ));
    });
    _scrollToBottom();
  }

  void _sendMessage({MessageType type = MessageType.text}) {
    if (_controller.text.isNotEmpty) {
      final message = Message(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        roomId: widget.roomId,
        senderId: 'current_user', // This should come from auth
        senderName: 'You',
        content: _controller.text,
        timestamp: DateTime.now().toIso8601String(),
        type: type,
        status: MessageStatus.sending,
      );

      setState(() {
        messages.add(message);
      });

      socket.emit('chat', message.toJson());
      _controller.clear();
      _scrollToBottom();
      _stopTyping();
    }
  }

  void _onTyping() {
    if (!_isTyping) {
      _isTyping = true;
      socket.emit('typing', {
        'room_id': widget.roomId,
        'typing': true,
      });
      
      Future.delayed(Duration(seconds: 2), () {
        _stopTyping();
      });
    }
  }

  void _stopTyping() {
    if (_isTyping) {
      _isTyping = false;
      socket.emit('typing', {
        'room_id': widget.roomId,
        'typing': false,
      });
    }
  }

  void _pickFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null) {
      // Handle file upload logic here
      _sendMessage(type: MessageType.file);
    }
  }

  void _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      // Handle image upload logic here
      _sendMessage(type: MessageType.image);
    }
  }

  @override
  void dispose() {
    socket.dispose();
    _controller.dispose();
    _scrollController.dispose();
    _typingAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Theme.of(context).primaryColor,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "# ${widget.roomId}",
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (_typingUsers.isNotEmpty)
              Text(
                "${_typingUsers.length} ${_typingUsers.length == 1 ? 'person' : 'people'} typing...",
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ).animate().fadeIn(),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.more_vert, color: Colors.white),
            onPressed: () {
              // Show room options
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Theme.of(context).primaryColor.withOpacity(0.1),
                    Colors.white,
                  ],
                ),
              ),
              child: ListView.builder(
                controller: _scrollController,
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final message = messages[index];
                  return _buildMessageBubble(message, index);
                },
              ),
            ),
          ),
          if (_typingUsers.isNotEmpty) _buildTypingIndicator(),
          _buildMessageInput(),
          if (_showEmojiPicker) _buildEmojiPicker(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Message message, int index) {
    final isMe = message.senderId == 'current_user';
    final isSystem = message.type == MessageType.system;
    
    if (isSystem) {
      return Center(
        child: Container(
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            message.content,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
        ),
      ).animate().fadeIn(delay: Duration(milliseconds: index * 50));
    }

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isMe) _buildAvatar(message.senderName),
          Flexible(
            child: Container(
              margin: EdgeInsets.only(
                left: isMe ? 50 : 8,
                right: isMe ? 8 : 50,
              ),
              child: Column(
                crossAxisAlignment: isMe 
                    ? CrossAxisAlignment.end 
                    : CrossAxisAlignment.start,
                children: [
                  if (!isMe)
                    Padding(
                      padding: EdgeInsets.only(left: 12, bottom: 4),
                      child: Text(
                        message.senderName,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ChatBubble(
                    clipper: ChatBubbleClipper5(
                      type: isMe 
                          ? BubbleType.sendBubble 
                          : BubbleType.receiverBubble,
                    ),
                    alignment: isMe ? Alignment.topRight : Alignment.topLeft,
                    margin: EdgeInsets.only(top: 0),
                    backGroundColor: isMe 
                        ? Theme.of(context).primaryColor 
                        : Colors.grey[200],
                    child: Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.7,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildMessageContent(message, isMe),
                          SizedBox(height: 4),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _formatTime(message.timestamp),
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isMe ? Colors.white70 : Colors.grey[500],
                                ),
                              ),
                              if (isMe) ...[
                                SizedBox(width: 4),
                                _buildMessageStatusIcon(message.status),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isMe) _buildAvatar('You'),
        ],
      ),
    ).animate().slideInUp(
      delay: Duration(milliseconds: index * 50),
      duration: Duration(milliseconds: 300),
    );
  }

  Widget _buildAvatar(String name) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: Text(
          name.substring(0, 1).toUpperCase(),
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageContent(Message message, bool isMe) {
    switch (message.type) {
      case MessageType.text:
        return Text(
          message.content,
          style: TextStyle(
            color: isMe ? Colors.white : Colors.black87,
            fontSize: 16,
          ),
        );
      case MessageType.file:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.attach_file,
              color: isMe ? Colors.white : Colors.grey[600],
              size: 16,
            ),
            SizedBox(width: 4),
            Flexible(
              child: Text(
                message.content,
                style: TextStyle(
                  color: isMe ? Colors.white : Colors.black87,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        );
      case MessageType.image:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 150,
              width: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey[300],
              ),
              child: Icon(Icons.image, size: 50, color: Colors.grey[600]),
            ),
            if (message.content.isNotEmpty) ...[
              SizedBox(height: 8),
              Text(
                message.content,
                style: TextStyle(
                  color: isMe ? Colors.white : Colors.black87,
                  fontSize: 16,
                ),
              ),
            ],
          ],
        );
      default:
        return Text(
          message.content,
          style: TextStyle(
            color: isMe ? Colors.white : Colors.black87,
            fontSize: 16,
          ),
        );
    }
  }

  Widget _buildMessageStatusIcon(MessageStatus status) {
    switch (status) {
      case MessageStatus.sending:
        return SizedBox(
          width: 12,
          height: 12,
          child: CircularProgressIndicator(
            strokeWidth: 1,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
          ),
        );
      case MessageStatus.sent:
        return Icon(Icons.check, size: 12, color: Colors.white70);
      case MessageStatus.delivered:
        return Icon(Icons.done_all, size: 12, color: Colors.white70);
      case MessageStatus.read:
        return Icon(Icons.done_all, size: 12, color: Colors.blue[300]);
      case MessageStatus.failed:
        return Icon(Icons.error, size: 12, color: Colors.red[300]);
    }
  }

  Widget _buildTypingIndicator() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 20,
            child: Row(
              children: List.generate(3, (index) {
                return Container(
                  width: 6,
                  height: 6,
                  margin: EdgeInsets.symmetric(horizontal: 1),
                  decoration: BoxDecoration(
                    color: Colors.grey[400],
                    borderRadius: BorderRadius.circular(3),
                  ),
                ).animate(controller: _typingAnimationController)
                    .scale(
                      delay: Duration(milliseconds: index * 200),
                      duration: Duration(milliseconds: 600),
                    );
              }),
            ),
          ),
          SizedBox(width: 8),
          Text(
            '${_typingUsers.length} typing...',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.attach_file, color: Colors.grey[600]),
            onPressed: _pickFile,
          ),
          IconButton(
            icon: Icon(Icons.image, color: Colors.grey[600]),
            onPressed: _pickImage,
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(25),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      onChanged: (text) {
                        if (text.isNotEmpty) {
                          _onTyping();
                        }
                      },
                      decoration: InputDecoration(
                        hintText: "Type a message...",
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      _showEmojiPicker ? Icons.keyboard : Icons.emoji_emotions,
                      color: Colors.grey[600],
                    ),
                    onPressed: () {
                      setState(() {
                        _showEmojiPicker = !_showEmojiPicker;
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          SizedBox(width: 8),
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor,
              borderRadius: BorderRadius.circular(24),
            ),
            child: IconButton(
              icon: Icon(Icons.send, color: Colors.white),
              onPressed: _sendMessage,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmojiPicker() {
    return Container(
      height: 250,
      child: EmojiPicker(
        onEmojiSelected: (category, emoji) {
          _controller.text += emoji.emoji;
        },
        config: Config(
          columns: 7,
          emojiSizeMax: 32,
          verticalSpacing: 0,
          horizontalSpacing: 0,
          gridPadding: EdgeInsets.zero,
          initCategory: Category.RECENT,
          bgColor: Color(0xFFF2F2F2),
          indicatorColor: Theme.of(context).primaryColor,
          iconColor: Colors.grey,
          iconColorSelected: Theme.of(context).primaryColor,
          backspaceColor: Theme.of(context).primaryColor,
          skinToneDialogBgColor: Colors.white,
          skinToneIndicatorColor: Colors.grey,
          enableSkinTones: true,
          recentsLimit: 28,
          noRecents: Text(
            'No Recents',
            style: TextStyle(fontSize: 20, color: Colors.black26),
            textAlign: TextAlign.center,
          ),
          loadingIndicator: SizedBox.shrink(),
          tabIndicatorAnimDuration: kTabScrollDuration,
          categoryIcons: CategoryIcons(),
          buttonMode: ButtonMode.MATERIAL,
        ),
      ),
    );
  }

  String _formatTime(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      return DateFormat('HH:mm').format(date);
    } catch (e) {
      return '';
    }
  }
}
