module.exports = {
  apps: [
    {
      name: 'ensaio-fotos',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      source_map_support: false,
      node_args: '--max-old-space-size=1024',
      cron_restart: '0 2 * * *', // Restart diário às 2h da manhã
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.git',
        '.next',
        '*.log'
      ],
      watch_options: {
        followSymlinks: false,
        usePolling: true
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'seu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/ensaio-fotos.git',
      path: '/var/www/ensaio-fotos',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --only=production && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'post-setup': 'npm ci --only=production && npx prisma generate && npm run build',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    
    staging: {
      user: 'deploy',
      host: 'staging.seu-servidor.com',
      ref: 'origin/develop',
      repo: 'git@github.com:seu-usuario/ensaio-fotos.git',
      path: '/var/www/ensaio-fotos-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --only=production && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'post-setup': 'npm ci --only=production && npx prisma generate && npm run build',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  },

  // Configurações de monitoramento
  monitoring: {
    // Habilitar monitoramento web
    web: true,
    // Porta do dashboard
    port: 9615,
    // Interface do dashboard
    interface: '0.0.0.0',
    // Autenticação básica
    auth: {
      username: 'admin',
      password: 'sua_senha_aqui'
    }
  }
};
