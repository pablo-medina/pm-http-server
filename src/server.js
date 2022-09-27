import express from 'express';
import path from 'path';
import chalk from 'chalk';
import cors from 'cors';
import { Command } from 'commander';

const DEFAULT_PATH = '.'
const DEFAULT_HTTP_PORT = 8080;
const program = new Command();

const main = async () => {
    const config = processCommandLine();
    setupServer(config);
}

const processCommandLine = () => {
    const config = {
        path: '.',
        port: DEFAULT_HTTP_PORT,
        cors: false
    }

    // Parse command-line
    program
        .version('1.0.0')
        .description('Minimalistic HTTP Server to deploy Angular applications')
        .argument('[path]', 'Resources path', DEFAULT_PATH)
        .option('-p, --port <number>', 'Port number (default to 8080)', DEFAULT_HTTP_PORT)
        .option('--cors', 'Enable CORS')
        .action(path => {
            config.path = path;
        })
        .parse();

    const options = program.opts();
    config.port = options.port;
    config.cors = !!options.cors;
    return config;
}

const setupServer = config => {
    console.log('Running server...');
    const app = express();
    if (config.cors) {
        app.use(cors());
    }
    app.use(express.static(config.path));
    app.get('/*', async (req, res) => {
        res.sendFile(path.resolve(config.path, 'index.html'));
    });
    const server = app.listen(config.port, () => {
        console.log(`Path: ${chalk.yellow(config.path)}`);
        console.log(`CORS: ${chalk.yellow(config.cors ? 'enabled' : 'disabled')}`);
        console.log(`Server running at port ${chalk.yellow(config.port)}...`);
    });
    return server;
}

(async () => {
    try {
        await main();        
    } catch (e) {
        console.log(chalk.red(e));
        return 1;
    }
})();
