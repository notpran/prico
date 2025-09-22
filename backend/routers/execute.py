"""
Code execution with Docker sandbox API for Prico
"""
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
import docker
import tempfile
import os
import shutil
import subprocess
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/execute",
    tags=["execute"],
    responses={404: {"description": "Not found"}},
)

# Supported languages and their configurations
SUPPORTED_LANGUAGES = {
    "python": {
        "image": "python:3.9-slim",
        "file_extension": ".py",
        "command": "python",
        "memory_limit": "100m",
        "timeout": 10  # seconds
    },
    "javascript": {
        "image": "node:14-alpine",
        "file_extension": ".js",
        "command": "node",
        "memory_limit": "100m",
        "timeout": 10
    },
    "typescript": {
        "image": "node:14-alpine",
        "file_extension": ".ts",
        "command": "ts-node",
        "memory_limit": "100m",
        "timeout": 10,
        "setup": ["npm install -g ts-node typescript"]
    },
    "java": {
        "image": "openjdk:11-jdk-slim",
        "file_extension": ".java",
        "command": "java",
        "compile_command": "javac",
        "memory_limit": "200m",
        "timeout": 15
    },
    "c": {
        "image": "gcc:latest",
        "file_extension": ".c",
        "command": "./a.out",
        "compile_command": "gcc",
        "memory_limit": "100m",
        "timeout": 10
    },
    "cpp": {
        "image": "gcc:latest",
        "file_extension": ".cpp",
        "command": "./a.out",
        "compile_command": "g++",
        "memory_limit": "100m",
        "timeout": 10
    }
}


def create_docker_client():
    """
    Create and return a Docker client
    """
    try:
        return docker.from_env()
    except Exception as e:
        print(f"Error connecting to Docker: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to Docker service")


@router.post("/code", status_code=200)
async def execute_code(
    code: str = Body(...),
    language: str = Body(...),
    input_data: Optional[str] = Body(None)
):
    """
    Execute code in a Docker sandbox
    """
    # Validate language
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}"
        )
    
    # Get language configuration
    lang_config = SUPPORTED_LANGUAGES[language]
    
    # Create a unique directory for this execution
    execution_id = str(uuid.uuid4())
    temp_dir = tempfile.mkdtemp(prefix=f"prico_execution_{execution_id}_")
    
    try:
        # Create code file
        file_extension = lang_config["file_extension"]
        file_name = f"main{file_extension}"
        file_path = os.path.join(temp_dir, file_name)
        
        with open(file_path, "w") as f:
            f.write(code)
        
        # Create input file if provided
        input_file = None
        if input_data:
            input_file = os.path.join(temp_dir, "input.txt")
            with open(input_file, "w") as f:
                f.write(input_data)
        
        # Get Docker client
        client = create_docker_client()
        
        # Pull image if needed
        try:
            client.images.get(lang_config["image"])
        except docker.errors.ImageNotFound:
            print(f"Pulling Docker image: {lang_config['image']}")
            client.images.pull(lang_config["image"])
        
        # Run container
        command = []
        
        # Add setup commands if needed
        if "setup" in lang_config:
            setup_commands = " && ".join(lang_config["setup"])
            command.append(f"/bin/sh -c '{setup_commands} && ")
        
        # Add compile command if needed
        if "compile_command" in lang_config:
            if language == "java":
                # For Java, we need to handle class name
                compile_command = f"{lang_config['compile_command']} {file_name}"
                run_command = f"{lang_config['command']} Main"
            else:
                compile_command = f"{lang_config['compile_command']} {file_name}"
                run_command = lang_config["command"]
            
            command.append(f"{compile_command} && {run_command}")
        else:
            # For interpreted languages
            command.append(f"{lang_config['command']} {file_name}")
        
        # Close setup command if needed
        if "setup" in lang_config:
            command.append("'")
        
        # Join the command
        exec_command = " ".join(command)
        
        # Set up input redirection if needed
        if input_data:
            exec_command = f"{exec_command} < input.txt"
        
        container = client.containers.run(
            image=lang_config["image"],
            command=["/bin/sh", "-c", exec_command],
            volumes={temp_dir: {"bind": "/app", "mode": "rw"}},
            working_dir="/app",
            mem_limit=lang_config["memory_limit"],
            network_disabled=True,
            detach=True
        )
        
        try:
            # Wait for container to finish with timeout
            result = container.wait(timeout=lang_config["timeout"])
            
            # Get container logs
            logs = container.logs().decode("utf-8")
            
            # Check if execution was successful
            exit_code = result["StatusCode"]
            
            return {
                "success": exit_code == 0,
                "output": logs,
                "exit_code": exit_code
            }
        except Exception as e:
            print(f"Error during execution: {e}")
            
            # Try to stop and remove the container
            try:
                container.stop(timeout=1)
            except:
                pass
            
            raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")
        finally:
            # Cleanup container
            try:
                container.remove(force=True)
            except:
                pass
    except Exception as e:
        print(f"Error setting up execution: {e}")
        raise HTTPException(status_code=500, detail=f"Execution setup error: {str(e)}")
    finally:
        # Cleanup temporary directory
        try:
            shutil.rmtree(temp_dir)
        except Exception as e:
            print(f"Error cleaning up temp directory: {e}")