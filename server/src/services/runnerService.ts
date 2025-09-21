import { Run } from '../models/Run';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// This is a placeholder for a more robust, sandboxed code execution service.
// In a real application, you would use Docker or a similar technology to
// isolate the code execution environment.

const getDockerCommand = (language: string, filePath: string): string => {
    const containerName = `runner-${Date.now()}`;
    const workDir = '/usr/src/app';
    const absoluteFilePath = path.resolve(filePath);
    const volumeMount = `${path.dirname(absoluteFilePath)}:${workDir}`;

    switch (language) {
        case 'python':
            return `docker run --rm --name ${containerName} -v ${volumeMount} python:3.9-slim python ${path.basename(filePath)}`;
        case 'javascript':
            return `docker run --rm --name ${containerName} -v ${volumeMount} node:18-alpine node ${path.basename(filePath)}`;
        default:
            throw new Error(`Unsupported language: ${language}`);
    }
}

export async function executeCode(runId: string, language: string, code: string, stdin?: string) {
    await Run.findOneAndUpdate({ runId }, { status: 'running' });

    const tempDir = 'temp_code';
    await fs.mkdir(tempDir, { recursive: true });
    const fileName = `${runId}.${language === 'python' ? 'py' : 'js'}`;
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);

    try {
        const command = getDockerCommand(language, filePath);

        const child = exec(command);

        let stdout = '';
        let stderr = '';

        if (stdin) {
            child.stdin?.write(stdin);
            child.stdin?.end();
        }

        child.stdout?.on('data', (data) => {
            stdout += data;
        });

        child.stderr?.on('data', (data) => {
            stderr += data;
        });

        child.on('close', async (exitCode) => {
            await Run.findOneAndUpdate({ runId }, {
                status: 'completed',
                stdout,
                stderr,
                exitCode,
            });
            await fs.unlink(filePath);
        });

    } catch (error: any) {
        await Run.findOneAndUpdate({ runId }, {
            status: 'error',
            stderr: error.message,
        });
        await fs.unlink(filePath).catch(() => {}); // Clean up file even on error
    }
}
