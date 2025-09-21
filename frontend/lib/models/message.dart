class Message {
  final String id;
  final String roomId;
  final String senderId;
  final String senderName;
  final String content;
  final String timestamp;
  final MessageType type;
  final MessageStatus status;
  final String? replyToId;
  final List<String>? attachments;

  Message({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.senderName,
    required this.content,
    required this.timestamp,
    this.type = MessageType.text,
    this.status = MessageStatus.sent,
    this.replyToId,
    this.attachments,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['_id'],
      roomId: json['room_id'],
      senderId: json['sender_id'],
      senderName: json['sender_name'] ?? 'Unknown',
      content: json['content'],
      timestamp: json['timestamp'],
      type: MessageType.values.firstWhere(
        (e) => e.toString() == 'MessageType.${json['type'] ?? 'text'}',
        orElse: () => MessageType.text,
      ),
      status: MessageStatus.values.firstWhere(
        (e) => e.toString() == 'MessageStatus.${json['status'] ?? 'sent'}',
        orElse: () => MessageStatus.sent,
      ),
      replyToId: json['reply_to_id'],
      attachments: json['attachments']?.cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'room_id': roomId,
      'sender_id': senderId,
      'sender_name': senderName,
      'content': content,
      'timestamp': timestamp,
      'type': type.toString().split('.').last,
      'status': status.toString().split('.').last,
      'reply_to_id': replyToId,
      'attachments': attachments,
    };
  }
}

enum MessageType {
  text,
  image,
  file,
  code,
  system,
}

enum MessageStatus {
  sending,
  sent,
  delivered,
  read,
  failed,
}
