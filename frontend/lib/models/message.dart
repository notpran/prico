class Message {
  final String id;
  final String roomId;
  final String senderId;
  final String content;
  final String timestamp;

  Message({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.content,
    required this.timestamp,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['_id'],
      roomId: json['room_id'],
      senderId: json['sender_id'],
      content: json['content'],
      timestamp: json['timestamp'],
    );
  }
}
