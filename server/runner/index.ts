import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Docker from 'dockerode';
import { Queue, Worker } from 'bullmq';
import * as fs from 'fs';

const docker = new Docker();
const codeQueue = new Queue('code-execution', {
  connection: { host: 'localhost', port: 6379 },
});

const worker = new Worker('code-execution', async (job) => {
  const { code, language, stdin = '' } = job.data;

  try {
    const result = await executeCode(code, language, stdin);
    return result;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

async function executeCode(code: string, language: string, stdin: string) {
  const tempDir = path.join('/tmp', `code-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  let filename: string;
  let command: string[];
  let image: string;

  switch (language) {
    case 'javascript':
      filename = 'code.js';
      command = ['node', filename];
      image = 'node:18-alpine';
      break;
    case 'python':
      filename = 'code.py';
      command = ['python', filename];
      image = 'python:3-alpine';
      break;
    case 'java':
      filename = 'Main.java';
      command = ['javac', filename, '&&', 'java', 'Main'];
      image = 'openjdk:17-alpine';
      break;
    case 'cpp':
      filename = 'code.cpp';
      command = ['g++', filename, '-o', 'code', '&&', './code'];
      image = 'gcc:9-alpine';
      break;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }

  fs.writeFileSync(path.join(tempDir, filename), code);

  const container = await docker.createContainer({
    Image: image,
    Cmd: command,
    WorkingDir: '/app',
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    Tty: false,
    OpenStdin: true,
    StdinOnce: true,
    HostConfig: {
      Binds: [`${tempDir}:/app`],
      Memory: 128 * 1024 * 1024, // 128MB
      CpuQuota: 50000, // 50% CPU
      ReadonlyRootfs: true,
    },
  });

  await container.start();

  if (stdin) {
    const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });
    stream.write(stdin);
    stream.end();
  }

  const logs = await container.logs({ stdout: true, stderr: true, follow: false });
  const output = logs.toString();

  await container.remove({ force: true });
  fs.rmSync(tempDir, { recursive: true, force: true });

  return { output };
}

console.log('Code runner service started');