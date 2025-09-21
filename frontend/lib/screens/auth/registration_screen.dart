import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:prico/api/auth_api.dart';
import 'package:prico/screens/auth/login_screen.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:prico/utils/animation_extensions.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:prico/widgets/animations.dart';
import 'package:prico/utils/username_id.dart';

class RegistrationScreen extends StatefulWidget {
  @override
  _RegistrationScreenState createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final AuthApi authApi = AuthApi();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _register() async {
    if (_formKey.currentState!.validate()) {
      HapticFeedback.lightImpact();
      setState(() {
        _isLoading = true;
      });

      try {
        final generatedId = uniqueIdForUsername(_usernameController.text);
        final success = await authApi.register(
          _usernameController.text,
          _emailController.text,
          _passwordController.text,
          generatedId,
        );
        
        if (success) {
          Navigator.pushAndRemoveUntil(
            context,
            AnimatedPageTransition(
              page: LoginScreen(),
              transitionType: PageTransitionType.slideUp,
            ),
            (Route<dynamic> route) => false,
          );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Registration successful! Please log in.'),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        } else {
          _showErrorMessage('Registration failed. Please try again.');
        }
      } catch (e) {
        _showErrorMessage('An error occurred. Please try again.');
      } finally {
        setState(() {
          _isLoading = false;
        });
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
                SizedBox(height: 40),
                
                // Header section
                Column(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(50),
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
                        Icons.person_add_outlined,
                        size: 50,
                        color: Colors.white,
                      ),
                    ).animate().scale(
                      duration: Duration(milliseconds: 800),
                      curve: Curves.elasticOut,
                    ),
                    SizedBox(height: 24),
                    Text(
                      "Create Account",
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
                      "Join the community today",
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
                
                SizedBox(height: 40),
                
                // Registration form
                GlassmorphicContainer(
                  width: double.infinity,
                  height: 450,
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
                          // Username field
                          _buildTextField(
                            controller: _usernameController,
                            hintText: 'Username',
                            icon: Icons.person_outlined,
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Please enter a username';
                              }
                              if (value!.length < 3) {
                                return 'Username must be at least 3 characters';
                              }
                              return null;
                            },
                          ).animate().slideInLeft(
                            delay: Duration(milliseconds: 600),
                            duration: Duration(milliseconds: 500),
                          ),
                          SizedBox(height: 8),
                          // Generated unique id preview
                          Align(
                            alignment: Alignment.centerLeft,
                            child: ValueListenableBuilder<TextEditingValue>(
                              valueListenable: _usernameController,
                              builder: (context, value, child) {
                                final id = value.text.isEmpty
                                    ? ''
                                    : uniqueIdForUsername(value.text);
                                return Text(
                                  id.isEmpty ? '' : 'Your ID: $id',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                    fontSize: 12,
                                  ),
                                );
                              },
                            ),
                          ),
                          
                          SizedBox(height: 16),
                          
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
                          ).animate().slideInRight(
                            delay: Duration(milliseconds: 700),
                            duration: Duration(milliseconds: 500),
                          ),
                          
                          SizedBox(height: 16),
                          
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
                              if (value!.length < 6) {
                                return 'Password must be at least 6 characters';
                              }
                              return null;
                            },
                          ).animate().slideInLeft(
                            delay: Duration(milliseconds: 800),
                            duration: Duration(milliseconds: 500),
                          ),
                          
                          SizedBox(height: 16),
                          
                          // Confirm password field
                          _buildTextField(
                            controller: _confirmPasswordController,
                            hintText: 'Confirm Password',
                            icon: Icons.lock_outlined,
                            obscureText: _obscureConfirmPassword,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirmPassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: Colors.white.withOpacity(0.7),
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscureConfirmPassword = !_obscureConfirmPassword;
                                });
                              },
                            ),
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Please confirm your password';
                              }
                              if (value != _passwordController.text) {
                                return 'Passwords do not match';
                              }
                              return null;
                            },
                          ).animate().slideInRight(
                            delay: Duration(milliseconds: 900),
                            duration: Duration(milliseconds: 500),
                          ),
                          
                          SizedBox(height: 24),
                          
                          // Register button
                          Container(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _register,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(25),
                                ),
                                elevation: 5,
                              ),
                              child: _isLoading
                                  ? LoadingAnimation(
                                      size: 20,
                                      color: Theme.of(context).primaryColor,
                                    )
                                  : Text(
                                      "Create Account",
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context).primaryColor,
                                      ),
                                    ),
                            ),
                          ).animate().slideInUp(
                            delay: Duration(milliseconds: 1000),
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
                
                // Login link
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: RichText(
                    text: TextSpan(
                      text: "Already have an account? ",
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 16,
                      ),
                      children: [
                        TextSpan(
                          text: "Sign In",
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
