# Hendricks PDK

Hendricks Plugin Development Kit
used to bundle common types + utilities for the the plugin development environment

## Updating the PDK

as hendrick's dependencies change, we should also update the PDK which is using the same dependencies to expose relevant types

steps:

-   bump version in package.json
-   `pnpm publish`

then go to each plugin directory and upgrade their `hendricks-pdk` version
