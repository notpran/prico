import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import 'package:vector_math/vector_math_64.dart' as vector;
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:prico/screens/auth/login_screen.dart';
import 'package:prico/widgets/particle_system.dart';
import 'package:prico/widgets/floating_3d_card.dart';
import 'package:prico/widgets/animated_background.dart';
import 'package:prico/utils/username_id.dart';

class LandingScreen extends StatefulWidget {
  @override
  _LandingScreenState createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  late AnimationController _particleController;
  late Animation<double> _pulseAnimation;
  
  bool _showFeatures = false;
  final _heroUsernameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    
    _rotationController = AnimationController(
      duration: Duration(seconds: 20),
      vsync: this,
    )..repeat();
    
    _pulseController = AnimationController(
      duration: Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
    
    _particleController = AnimationController(
      duration: Duration(seconds: 10),
      vsync: this,
    )..repeat();
    
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    // Trigger feature showcase after initial animations
    Future.delayed(Duration(milliseconds: 2000), () {
      setState(() {
        _showFeatures = true;
      });
    });
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();
    _particleController.dispose();
    _heroUsernameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated background
          AnimatedBackground(),
          
          // Particle system
          ParticleSystem(
            animationController: _particleController,
          ),
          
          // Main content
          Container(
            width: double.infinity,
            height: double.infinity,
            child: Column(
              children: [
                // Hero section
                Expanded(
                  flex: 3,
                  child: _buildHeroSection(),
                ),
                
                // Features section
                if (_showFeatures)
                  Expanded(
                    flex: 2,
                    child: _buildFeaturesSection(),
                  ),
                
                // Call-to-action section
                Expanded(
                  flex: 1,
                  child: _buildCallToActionSection(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // 3D rotating logo/icon
          AnimatedBuilder(
            animation: _rotationController,
            builder: (context, child) {
              return Transform(
                alignment: Alignment.center,
                transform: Matrix4.identity()
                  ..setEntry(3, 2, 0.001)
                  ..rotateY(_rotationController.value * 2 * math.pi)
                  ..rotateX(math.sin(_rotationController.value * 2 * math.pi) * 0.3),
                child: AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _pulseAnimation.value,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          gradient: RadialGradient(
                            colors: [
                              Theme.of(context).primaryColor.withOpacity(0.8),
                              Theme.of(context).primaryColor.withOpacity(0.3),
                              Colors.transparent,
                            ],
                            stops: [0.3, 0.7, 1.0],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).primaryColor.withOpacity(0.5),
                              blurRadius: 50,
                              spreadRadius: 10,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Icon(
                            Icons.chat_bubble_outline,
                            size: 80,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          ),
          
          // Floating 3D cards around the logo
          ...List.generate(6, (index) {
            return Positioned(
              left: MediaQuery.of(context).size.width * 0.5 +
                  math.cos(index * math.pi / 3) * 150 - 40,
              top: MediaQuery.of(context).size.height * 0.35 +
                  math.sin(index * math.pi / 3) * 100 - 30,
              child: FloatingCard(
                animationController: _rotationController,
                delay: index * 0.3,
                icon: _getFeatureIcon(index),
                color: _getFeatureColor(index),
              ),
            );
          }),
          
          // Title and subtitle
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Text(
                  "PRICO",
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 8,
                    shadows: [
                      Shadow(
                        blurRadius: 10,
                        color: Colors.black.withOpacity(0.5),
                      ),
                    ],
                  ),
                ).animate().fadeIn(
                  duration: Duration(milliseconds: 1000),
                ).slideInUp(
                  delay: Duration(milliseconds: 500),
                ),
                SizedBox(height: 16),
                Text(
                  "Code. Chat. Collaborate.",
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white.withOpacity(0.9),
                    letterSpacing: 2,
                  ),
                ).animate().fadeIn(
                  duration: Duration(milliseconds: 1000),
                ).slideInUp(
                  delay: Duration(milliseconds: 800),
                ),
                SizedBox(height: 12),
                Text(
                  "Help friends become programmers — chat, learn, and build together.",
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.85),
                    letterSpacing: 1,
                  ),
                  textAlign: TextAlign.center,
                ).animate().fadeIn(
                  delay: Duration(milliseconds: 1100),
                ).slideInUp(
                  delay: Duration(milliseconds: 900),
                ),
                SizedBox(height: 12),
                // Small username preview to generate ID
                Container(
                  width: 300,
                  child: TextField(
                    controller: _heroUsernameController,
                    decoration: InputDecoration(
                      hintText: 'Try a username to see your ID',
                      hintStyle: TextStyle(color: Colors.white70),
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.06),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    style: TextStyle(color: Colors.white),
                    onChanged: (v) {
                      setState(() {});
                    },
                  ),
                ),
                SizedBox(height: 8),
                Builder(builder: (context) {
                  final text = _heroUsernameController.text;
                  final id = text.isEmpty ? '' : uniqueIdForUsername(text);
                  return Text(
                    id.isEmpty ? '' : 'Generated ID: $id',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesSection() {
    final features = [
      {
        'icon': Icons.chat_bubble_outline,
        'title': 'Real-time Chat',
        'description': 'Instant messaging with emoji support and file sharing',
      },
      {
        'icon': Icons.code,
        'title': 'Code Collaboration',
        'description': 'Share and review code with syntax highlighting',
      },
      {
        'icon': Icons.security,
        'title': 'Secure & Private',
        'description': 'End-to-end encryption for all communications',
      },
    ];

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        children: [
          Text(
            "Why Choose Prico?",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ).animate().fadeIn(
            duration: Duration(milliseconds: 800),
          ),
          SizedBox(height: 40),
          Expanded(
            child: Row(
              children: features.asMap().entries.map((entry) {
                final index = entry.key;
                final feature = entry.value;
                
                return Expanded(
                  child: Container(
                    margin: EdgeInsets.symmetric(horizontal: 8),
                    child: GlassmorphicContainer(
                      width: double.infinity,
                      height: 180,
                      borderRadius: 20,
                      blur: 20,
                      alignment: Alignment.center,
                      border: 2,
                      linearGradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.1),
                          Colors.white.withOpacity(0.05),
                        ],
                      ),
                      borderGradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.5),
                          Colors.white.withOpacity(0.2),
                        ],
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              feature['icon'] as IconData,
                              size: 40,
                              color: Colors.white,
                            ),
                            SizedBox(height: 16),
                            Text(
                              feature['title'] as String,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: 8),
                            Text(
                              feature['description'] as String,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.8),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ).animate().fadeIn(
                    delay: Duration(milliseconds: 200 * index),
                    duration: Duration(milliseconds: 600),
                  ).slideInUp(
                    delay: Duration(milliseconds: 300 * index),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallToActionSection() {
    return Container(
      padding: EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: double.infinity,
            height: 60,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.lightImpact();
                Navigator.pushReplacement(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (context, animation, secondaryAnimation) =>
                        LoginScreen(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.0, 1.0),
                            end: Offset.zero,
                          ).animate(CurvedAnimation(
                            parent: animation,
                            curve: Curves.easeInOut,
                          )),
                          child: child,
                        ),
                      );
                    },
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                elevation: 10,
                shadowColor: Theme.of(context).primaryColor.withOpacity(0.5),
              ),
              child: Text(
                "Get Started",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ).animate().fadeIn(
            delay: Duration(milliseconds: 1500),
            duration: Duration(milliseconds: 800),
          ).scale(
            delay: Duration(milliseconds: 1700),
            duration: Duration(milliseconds: 400),
          ),
          SizedBox(height: 16),
          Text(
            "Join thousands of developers already collaborating",
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.7),
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(
            delay: Duration(milliseconds: 2000),
            duration: Duration(milliseconds: 800),
          ),
        ],
      ),
    );
  }

  IconData _getFeatureIcon(int index) {
    final icons = [
      Icons.speed,
      Icons.security,
      Icons.people,
      Icons.code,
      Icons.cloud_sync,
      Icons.mobile_friendly,
    ];
    return icons[index % icons.length];
  }

  Color _getFeatureColor(int index) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.red,
      Colors.teal,
    ];
    return colors[index % colors.length];
  }
}