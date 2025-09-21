import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:prico/api/auth_api.dart';
import 'package:prico/screens/auth/registration_screen.dart';
import 'package:prico/screens/home_screen.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:prico/utils/animation_extensions.dart';
import 'package:glassmorphism/glassmorphism.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final AuthApi authApi = AuthApi();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  late AnimationController _loadingController;
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _loadingController = AnimationController(
      duration: Duration(milliseconds: 1000),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _loadingController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _login() async {
    if (_formKey.currentState!.validate()) {
      HapticFeedback.lightImpact();
      setState(() {
        _isLoading = true;
      });
      _loadingController.forward();

      try {
        final success = await authApi.login(
          _emailController.text,
          _passwordController.text,
        );
        
        if (success) {
          Navigator.pushReplacement(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  HomeScreen(),
              transitionsBuilder: (context, animation, secondaryAnimation, child) {
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(1.0, 0.0),
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
        } else {
          _showErrorMessage('Login failed. Please check your credentials.');
        }
      } catch (e) {
        _showErrorMessage('An error occurred. Please try again.');
      } finally {
        setState(() {
          _isLoading = false;
        });
        _loadingController.reverse();
      }
    }
  }

  void _showErrorMessage(String message) {
    HapticFeedback.mediumImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1E3C72),
              Color(0xFF2A5298),
              Color(0xFF1E3C72),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: 60),
                
                // Logo and title section
                Column(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(60),
                        gradient: RadialGradient(
                          colors: [
                            Colors.white.withOpacity(0.3),
                            Colors.white.withOpacity(0.1),
                            Colors.transparent,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withOpacity(0.2),
                            blurRadius: 30,
                            spreadRadius: 5,
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.chat_bubble_outline,
                        size: 60,
                        color: Colors.white,
                      ),
                    ).animate().scale(
                      duration: Duration(milliseconds: 800),
                      curve: Curves.elasticOut,
                    ),
                    SizedBox(height: 24),
                    Text(
                      "Welcome Back",
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ).animate().fadeIn(
                      delay: Duration(milliseconds: 300),
                      duration: Duration(milliseconds: 600),
                    ).slideInUp(),
                    SizedBox(height: 8),
                    Text(
                      "Sign in to continue",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ).animate().fadeIn(
                      delay: Duration(milliseconds: 500),
                      duration: Duration(milliseconds: 600),
                    ).slideInUp(),
                  ],
                ),
                
                SizedBox(height: 60),
                
                // Login form
                GlassmorphicContainer(
                  width: double.infinity,
                  height: 320,
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
                    padding: EdgeInsets.all(24),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          // Email field
                          _buildTextField(
                            controller: _emailController,
                            hintText: 'Email',
                            icon: Icons.email_outlined,
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Please enter your email';
                              }
                              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                                  .hasMatch(value!)) {
                                return 'Please enter a valid email';
                              }
                              return null;
                            },
                          ).animate().slideInLeft(
                            delay: Duration(milliseconds: 700),
                            duration: Duration(milliseconds: 500),
                          ),
                          
                          SizedBox(height: 20),
                          
                          // Password field
                          _buildTextField(
                            controller: _passwordController,
                            hintText: 'Password',
                            icon: Icons.lock_outlined,
                            obscureText: _obscurePassword,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: Colors.white.withOpacity(0.7),
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Please enter your password';
                              }
                              return null;
                            },
                          ).animate().slideInRight(
                            delay: Duration(milliseconds: 800),
                            duration: Duration(milliseconds: 500),
                          ),
                          
                          SizedBox(height: 30),
                          
                          // Login button
                          Container(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _login,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(25),
                                ),
                                elevation: 5,
                              ),
                              child: _isLoading
                                  ? SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          Theme.of(context).primaryColor,
                                        ),
                                      ),
                                    )
                                  : Text(
                                      "Sign In",
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context).primaryColor,
                                      ),
                                    ),
                            ),
                          ).animate().slideInUp(
                            delay: Duration(milliseconds: 900),
                            duration: Duration(milliseconds: 500),
                          ),
                        ],
                      ),
                    ),
                  ),
                ).animate().fadeIn(
                  delay: Duration(milliseconds: 600),
                  duration: Duration(milliseconds: 800),
                ).scale(
                  delay: Duration(milliseconds: 650),
                  duration: Duration(milliseconds: 600),
                ),
                
                SizedBox(height: 30),
                
                // Register link
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      PageRouteBuilder(
                        pageBuilder: (context, animation, secondaryAnimation) =>
                            RegistrationScreen(),
                        transitionsBuilder: (context, animation, secondaryAnimation, child) {
                          return SlideTransition(
                            position: Tween<Offset>(
                              begin: const Offset(0.0, 1.0),
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
                  child: RichText(
                    text: TextSpan(
                      text: "Don't have an account? ",
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 16,
                      ),
                      children: [
                        TextSpan(
                          text: "Sign Up",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ],
                    ),
                  ),
                ).animate().fadeIn(
                  delay: Duration(milliseconds: 1200),
                  duration: Duration(milliseconds: 600),
                ),
                
                SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      validator: validator,
      style: TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: TextStyle(
          color: Colors.white.withOpacity(0.7),
        ),
        prefixIcon: Icon(
          icon,
          color: Colors.white.withOpacity(0.7),
        ),
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(
            color: Colors.white.withOpacity(0.3),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(
            color: Colors.white.withOpacity(0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(
            color: Colors.white,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(
            color: Colors.red,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(
            color: Colors.red,
            width: 2,
          ),
        ),
        errorStyle: TextStyle(
          color: Colors.red.shade300,
        ),
      ),
    );
  }
}
