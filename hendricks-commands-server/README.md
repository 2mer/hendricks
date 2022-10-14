## Hendricks Commands Server
This server is placed on a machine that has greater capabilities than the machine the bot runs on.

## Configuration
Expected environment variables (can be placed in `.env`):
```
SD_DIR=/path/to/stable-diffusion/
OUT_DIR=/path/to/outputs/
```

This project uses [rocket.rs](https://rocket.rs/) to create an HTTP server. The server's properties can be configured in the `Rocket.toml` file.
