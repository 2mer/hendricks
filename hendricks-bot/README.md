# Hendricks Bot

This is the main bot

## Configuration

Environment variables (placed in `.env`):

```
SERVER_IP=<ip of the commands server>
SERVER_PORT=<port of the commands server>

CLIENT_ID=XXXXXXXXXXXXXXXXXXX
GUILD_ID=YYYYYYYYYYYYYYYYYYY
TOKEN=ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
```

## Plugin workflow

A plugin's folder usually looks like a normal npm module

A plugin is valid if it:

-   is placed inside the `plugins/` folder
-   has the same name as the name specified in `package.json`
-   uses the package `hendricks-pdk`
-   conforms to the type `IPlugin`

to install a plugin just place it inside the plugins folder
