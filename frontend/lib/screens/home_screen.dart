import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:prico/screens/chat/chat_screen.dart';
import 'package:prico/screens/project/project_screen.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:prico/utils/animation_extensions.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with TickerProviderStateMixin {
  int _selectedIndex = 0;
  late PageController _pageController;
  late AnimationController _fabController;
  late AnimationController _navigationController;
  
  final List<Widget> _screens = [
    ChatScreen(),
    ProjectScreen(),
  ];

  final List<NavigationItem> _navigationItems = [
    NavigationItem(
      icon: Icons.chat_bubble_outline,
      activeIcon: Icons.chat_bubble,
      label: 'Chat',
      color: Colors.blue,
    ),
    NavigationItem(
      icon: Icons.folder_outlined,
      activeIcon: Icons.folder,
      label: 'Projects',
      color: Colors.green,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _fabController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _navigationController = AnimationController(
      duration: Duration(milliseconds: 200),
      vsync: this,
    );
    
    // Start with fab animation
    _fabController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fabController.dispose();
    _navigationController.dispose();
    super.dispose();
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    
    HapticFeedback.lightImpact();
    
    setState(() {
      _selectedIndex = index;
    });
    
    _pageController.animateToPage(
      index,
      duration: Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
    
    // Animate navigation
    _navigationController.forward().then((_) {
      _navigationController.reverse();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            height: 80,
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _navigationItems.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isSelected = index == _selectedIndex;
                
                return GestureDetector(
                  onTap: () => _onItemTapped(index),
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    padding: EdgeInsets.symmetric(
                      horizontal: isSelected ? 20 : 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected 
                          ? item.color.withOpacity(0.1)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedSwitcher(
                          duration: Duration(milliseconds: 200),
                          child: Icon(
                            isSelected ? item.activeIcon : item.icon,
                            key: ValueKey(isSelected),
                            color: isSelected ? item.color : Colors.grey[600],
                            size: 24,
                          ),
                        ),
                        if (isSelected) ...[
                          SizedBox(width: 8),
                          Text(
                            item.label,
                            style: TextStyle(
                              color: item.color,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ).animate().fadeIn(
                            duration: Duration(milliseconds: 200),
                          ).slideInLeft(
                            duration: Duration(milliseconds: 200),
                          ),
                        ],
                      ],
                    ),
                  ),
                ).animate(target: isSelected ? 1 : 0).scale(
                  duration: Duration(milliseconds: 200),
                  begin: Offset(0.9, 0.9),
                  end: Offset(1.0, 1.0),
                );
              }).toList(),
            ),
          ),
        ),
      ).animate().slideInUp(
        delay: Duration(milliseconds: 500),
        duration: Duration(milliseconds: 600),
      ),
      floatingActionButton: ScaleTransition(
        scale: _fabController,
        child: FloatingActionButton(
          onPressed: () {
            HapticFeedback.mediumImpact();
            _showQuickActions();
          },
          backgroundColor: Theme.of(context).primaryColor,
          elevation: 8,
          child: Icon(
            Icons.add,
            color: Colors.white,
            size: 28,
          ),
        ),
      ).animate().scale(
        delay: Duration(milliseconds: 800),
        duration: Duration(milliseconds: 400),
        curve: Curves.elasticOut,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  void _showQuickActions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30),
            topRight: Radius.circular(30),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: EdgeInsets.only(top: 12),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Quick Actions",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: _buildQuickActionCard(
                          icon: Icons.chat_bubble_outline,
                          title: "New Chat",
                          color: Colors.blue,
                          onTap: () {
                            Navigator.pop(context);
                            _onItemTapped(0);
                          },
                        ),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: _buildQuickActionCard(
                          icon: Icons.create_new_folder_outlined,
                          title: "New Project",
                          color: Colors.green,
                          onTap: () {
                            Navigator.pop(context);
                            _onItemTapped(1);
                          },
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ).animate().slideInUp(
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: color.withOpacity(0.2),
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(25),
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: 24,
              ),
            ),
            SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final Color color;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.color,
  });
}
